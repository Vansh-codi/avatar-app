// components/ml/WebcamTracker.tsx
// Webcam feed with MediaPipe overlay, tracking controls, and face capture

'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import { captureFaceProfile } from '@/lib/landmarkProcessor';

export function WebcamTracker() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'capturing' | 'done'>('idle');

  const {
    isTracking, faceLandmarks, poseLandmarks, emotion, gesture,
    setIsCameraActive, setAvatarConfig,
  } = useStore();

  useMediaPipe({ videoRef, enabled: isEnabled });

  const toggleCamera = useCallback(async () => {
    if (isEnabled) {
      setIsEnabled(false);
      setIsCameraActive(false);
      setCameraError(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 480 },
    height: { ideal: 960 }, // vertical capture
    facingMode: "user"
  },
  audio: false
});
        stream.getTracks().forEach(t => t.stop()); // release test stream; MediaPipe opens its own
        setIsEnabled(true);
        setIsCameraActive(true);
        setCameraError(null);
      } catch {
        setCameraError('Camera access denied. Please allow webcam access.');
      }
    }
  }, [isEnabled, setIsCameraActive]);

  // Capture face profile and apply to avatar config
  const captureFace = useCallback(() => {
    const video = videoRef.current;
    if (!video || !faceLandmarks?.landmarks) return;

    setCaptureStatus('capturing');
    try {
      const profile = captureFaceProfile(faceLandmarks.landmarks, video);
      setAvatarConfig({
        skinTone: profile.skinTone,
        faceShape: profile.faceShape,
        eyeSpacing: profile.eyeSpacingRatio,
        faceHeight: profile.faceHeightRatio,
      });
      setCaptureStatus('done');
      setTimeout(() => setCaptureStatus('idle'), 3000);
    } catch (e) {
      console.error('Face capture failed:', e);
      setCaptureStatus('idle');
    }
  }, [faceLandmarks, setAvatarConfig]);

  // Draw landmark overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !isEnabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (faceLandmarks?.landmarks) {
      ctx.fillStyle = 'rgba(0, 255, 180, 0.7)';
      const keyIndices = [1, 4, 10, 33, 133, 145, 159, 234, 263, 362, 374, 386, 454, 61, 291, 13, 14, 152];
      keyIndices.forEach(i => {
        const lm = faceLandmarks.landmarks[i];
        if (lm) {
          ctx.beginPath();
          ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    if (poseLandmarks?.landmarks) {
      const connections = [
        [11,12],[11,13],[13,15],[12,14],[14,16],
        [11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28],
      ];
      ctx.strokeStyle = 'rgba(255, 100, 200, 0.8)';
      ctx.lineWidth = 2;
      connections.forEach(([a, b]) => {
        const la = poseLandmarks.landmarks[a];
        const lb = poseLandmarks.landmarks[b];
        if (la && lb && la.visibility > 0.5 && lb.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(la.x * canvas.width, la.y * canvas.height);
          ctx.lineTo(lb.x * canvas.width, lb.y * canvas.height);
          ctx.stroke();
        }
      });
      ctx.fillStyle = 'rgba(255,100,200,0.9)';
      poseLandmarks.landmarks.forEach(lm => {
        if (lm.visibility > 0.5) {
          ctx.beginPath();
          ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
  }, [faceLandmarks, poseLandmarks, isEnabled]);

  return (
    <div className="flex flex-col gap-3">

      {/* ── Camera preview — landscape 16:9 for full body ── */}
      <div className="relative rounded-xl overflow-hidden bg-black border border-white/10 h-[460px]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover object-center"
          style={{ transform: 'scaleX(-1)' }}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Inactive overlay */}
        {!isEnabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-3xl">
              📷
            </div>
            <div className="text-center">
              <p className="text-white/70 text-sm font-medium">Camera not active</p>
              <p className="text-white/30 text-xs mt-0.5">Click Start to begin tracking</p>
            </div>
          </div>
        )}

        {/* LIVE indicator */}
        <AnimatePresence>
          {isTracking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <span className="text-white text-xs font-mono font-bold">LIVE</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Face / Pose status badges */}
        <AnimatePresence>
          {isEnabled && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-2 right-2 flex flex-col gap-1"
            >
              <StatusBadge active={!!faceLandmarks} label="Face" color="green" />
              <StatusBadge active={!!poseLandmarks} label="Pose" color="pink" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gesture badge */}
        <AnimatePresence>
          {gesture && (
            <motion.div key={gesture}
              initial={{ scale: 0, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 16 }}
              className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-purple-500/80 backdrop-blur-sm text-white text-xs font-bold">
              ✋ {gesture}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emotion badge */}
        <AnimatePresence>
          {emotion && emotion.dominant !== 'neutral' && (
            <motion.div key={emotion.dominant}
              initial={{ scale: 0, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 16 }}
              className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-cyan-500/80 backdrop-blur-sm text-white text-xs font-bold capitalize">
              {emotion.dominant}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner scan lines */}
        {isEnabled && (<>
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400/60 rounded-br-lg pointer-events-none" />
        </>)}
      </div>

      {/* Error */}
      <AnimatePresence>
        {cameraError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3 overflow-hidden">
            ⚠️ {cameraError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start / Stop button */}
      <motion.button
        onClick={toggleCamera}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all
          ${isEnabled
            ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
            : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20'
          }`}
      >
        {isEnabled ? '⏹ Stop Camera' : '▶ Start Camera & Tracking'}
      </motion.button>

      {/* ── Capture My Face button ── */}
      <AnimatePresence>
        {isEnabled && !!faceLandmarks && (
          <motion.button
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            onClick={captureFace}
            disabled={captureStatus !== 'idle'}
            whileHover={{ scale: captureStatus === 'idle' ? 1.02 : 1 }}
            whileTap={{ scale: captureStatus === 'idle' ? 0.98 : 1 }}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all border
              ${captureStatus === 'done'
                ? 'bg-green-500/20 border-green-500/40 text-green-400'
                : captureStatus === 'capturing'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 opacity-70 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30'
              }`}
          >
            {captureStatus === 'done'
              ? '✅ Face Captured! Avatar Updated'
              : captureStatus === 'capturing'
                ? '⏳ Analysing...'
                : '✨ Capture My Face → Apply to Avatar'}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Face capture hint */}
      <AnimatePresence>
        {isEnabled && !!faceLandmarks && captureStatus === 'idle' && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-xs text-white/25 text-center leading-relaxed"
          >
            Look straight at the camera, then tap Capture to set your skin tone & face shape on the avatar.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Stats grid */}
      {isEnabled && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-2 text-xs">
          <StatBox label="Face landmarks" value={faceLandmarks ? '468' : '—'} active={!!faceLandmarks} />
          <StatBox label="Pose keypoints" value={poseLandmarks ? '33' : '—'} active={!!poseLandmarks} />
          <StatBox label="Emotion" value={emotion?.dominant || '—'} active={!!emotion} />
          <StatBox label="Gesture" value={gesture || '—'} active={!!gesture} />
        </motion.div>
      )}
    </div>
  );
}

function StatusBadge({ active, label, color }: { active: boolean; label: string; color: string }) {
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono
      ${active ? `bg-${color}-500/20 border border-${color}-500/40 text-${color}-400`
               : 'bg-white/5 border border-white/10 text-white/30'}`}>
      <motion.span
        className={`w-1.5 h-1.5 rounded-full ${active ? `bg-${color}-400` : 'bg-white/20'}`}
        animate={active ? { opacity: [1, 0.4, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      {label}
    </div>
  );
}

function StatBox({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className={`border rounded-lg p-2 transition-colors duration-300
      ${active ? 'bg-white/8 border-white/15' : 'bg-white/5 border-white/8'}`}>
      <div className="text-white/40 text-xs">{label}</div>
      <div className={`font-mono font-semibold capitalize text-sm ${active ? 'text-cyan-300' : 'text-white/50'}`}>{value}</div>
    </div>
  );
}
