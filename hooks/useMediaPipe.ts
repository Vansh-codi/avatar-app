// hooks/useMediaPipe.ts
// React hook that manages MediaPipe FaceMesh + Pose detection
// Runs detection in a requestAnimationFrame loop

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import {
  computeBlendShapes,
  detectEmotion,
  detectGesture,
  setGlobalSmoothing,
} from '@/lib/landmarkProcessor';
import type { FaceLandmarks, PoseLandmarks } from '@/types';

interface UseMediaPipeOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled?: boolean;
}

export function useMediaPipe({ videoRef, enabled = true }: UseMediaPipeOptions) {
  const {
    setFaceLandmarks,
    setPoseLandmarks,
    setBlendShapes,
    setEmotion,
    setIsTracking,
    setGesture,
    avatarConfig,
  } = useStore();

  const faceMeshRef = useRef<any>(null);
  const poseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const latestFaceRef = useRef<any>(null);
  const latestPoseRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const animFrameRef = useRef<number>();

  // Sync smoothing factor from avatar config
  useEffect(() => {
    setGlobalSmoothing(avatarConfig.motionSmoothing);
  }, [avatarConfig.motionSmoothing]);

  // Store stable refs to Zustand setters to avoid stale closure warnings
  const setFaceLandmarksRef = useRef(setFaceLandmarks);
  const setPoseLandmarksRef = useRef(setPoseLandmarks);
  const setBlendShapesRef = useRef(setBlendShapes);
  const setEmotionRef = useRef(setEmotion);
  const setGestureRef = useRef(setGesture);
  const setIsTrackingRef = useRef(setIsTracking);

  useEffect(() => {
    setFaceLandmarksRef.current = setFaceLandmarks;
    setPoseLandmarksRef.current = setPoseLandmarks;
    setBlendShapesRef.current = setBlendShapes;
    setEmotionRef.current = setEmotion;
    setGestureRef.current = setGesture;
    setIsTrackingRef.current = setIsTracking;
  });

  const startProcessingLoop = useCallback(() => {
    const process = () => {
      // ── FACE ──
      const faceResults = latestFaceRef.current;
      if (faceResults?.multiFaceLandmarks?.[0]) {
        const rawLandmarks = faceResults.multiFaceLandmarks[0];
        const faceLandmarks: FaceLandmarks = {
          landmarks: rawLandmarks.map((lm: any) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z ?? 0,
          })),
        };

        const blendShapes = computeBlendShapes(faceLandmarks.landmarks);
        faceLandmarks.blendShapes = blendShapes;

        setFaceLandmarksRef.current(faceLandmarks);
        setBlendShapesRef.current(blendShapes);
        setEmotionRef.current(detectEmotion(blendShapes));
      } else {
        setFaceLandmarksRef.current(null);
      }

      // ── POSE ──
      const poseResults = latestPoseRef.current;
      if (poseResults?.poseLandmarks) {
        const poseLandmarks: PoseLandmarks = {
          landmarks: poseResults.poseLandmarks.map((lm: any) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z ?? 0,
            visibility: lm.visibility ?? 0,
          })),
        };

        setPoseLandmarksRef.current(poseLandmarks);
        setGestureRef.current(detectGesture(poseLandmarks.landmarks));
      } else {
        setPoseLandmarksRef.current(null);
      }

      animFrameRef.current = requestAnimationFrame(process);
    };

    animFrameRef.current = requestAnimationFrame(process);
  }, []);

  const initMediaPipe = useCallback(async () => {
    if (isInitializedRef.current || !videoRef.current || typeof window === 'undefined') return;

    try {
      const { FaceMesh } = await import('@mediapipe/face_mesh');
      const { Pose } = await import('@mediapipe/pose');
      const { Camera } = await import('@mediapipe/camera_utils');

      // ── FaceMesh ──
      const faceMesh = new FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      faceMesh.onResults((results: any) => {
        latestFaceRef.current = results;
      });
      await faceMesh.initialize();
      faceMeshRef.current = faceMesh;

      // ── Pose ──
      const pose = new Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 2,          // full accuracy for hand/leg capture
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      pose.onResults((results: any) => {
        latestPoseRef.current = results;
      });
      await pose.initialize();
      poseRef.current = pose;

      // ── Camera — landscape 1280×720 captures the full body ──
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          const video = videoRef.current;
          if (!video || video.readyState < 2) return;
          if (faceMeshRef.current) {
            await faceMeshRef.current.send({ image: video });
          }
          if (poseRef.current) {
            await poseRef.current.send({ image: video });
          }
        },
        width: 1920,   // Full HD landscape captures the full body even from a distance
        height: 1080,
      });

      await camera.start();
      cameraRef.current = camera;
      isInitializedRef.current = true;
      setIsTrackingRef.current(true);

      // Start the RAF loop that reads latestFace/PoseRef and pushes to Zustand
      startProcessingLoop();
    } catch (error) {
      console.error('MediaPipe initialization failed:', error);
      setIsTrackingRef.current(false);
    }
  }, [videoRef, startProcessingLoop]);

  const cleanup = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = undefined;
    }
    try { cameraRef.current?.stop?.(); } catch {}
    try { faceMeshRef.current?.close?.(); } catch {}
    try { poseRef.current?.close?.(); } catch {}
    cameraRef.current = null;
    faceMeshRef.current = null;
    poseRef.current = null;
    isInitializedRef.current = false;

    setIsTrackingRef.current(false);
    setFaceLandmarksRef.current(null);
    setPoseLandmarksRef.current(null);
    setBlendShapesRef.current(null);
  }, []);

  useEffect(() => {
    if (enabled) {
      initMediaPipe();
    } else {
      cleanup();
    }
    return () => { cleanup(); };
  }, [enabled, initMediaPipe, cleanup]);

  return { cleanup };
}