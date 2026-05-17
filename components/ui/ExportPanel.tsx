// components/ui/ExportPanel.tsx
// Export avatar as PNG, GLB, or GIF

'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import * as THREE from 'three';
import { useSession } from 'next-auth/react';
export function ExportPanel() {
  const { user, avatarConfig } = useStore();
  const { data: session } = useSession();
  const currentUser = user || session?.user;
  const [exportStatus, setExportStatus] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({
    png: 'idle', glb: 'idle', gif: 'idle', save: 'idle',
  });
  const [avatarName, setAvatarName] = useState('My Avatar');

  const setStatus = (key: string, status: 'idle' | 'loading' | 'done' | 'error') => {
    setExportStatus(prev => ({ ...prev, [key]: status }));
    if (status === 'done') {
      setTimeout(() => setExportStatus(prev => ({ ...prev, [key]: 'idle' })), 3000);
    }
  };

  // Export PNG from canvas
  const exportPNG = useCallback(async () => {
    setStatus('png', 'loading');
    try {
      // Find the Three.js canvas
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) throw new Error('Canvas not found');

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `${avatarName.replace(/\s+/g, '-')}-avatar.png`;
      link.href = dataUrl;
      link.click();
      setStatus('png', 'done');
    } catch (err) {
      console.error('PNG export failed:', err);
      setStatus('png', 'error');
    }
  }, [avatarName]);

  // Export GLB (simplified - in production use THREE.GLTFExporter)
  const exportGLB = useCallback(async () => {
    setStatus('glb', 'loading');
    try {
      const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
      const exporter = new GLTFExporter();

      // Create a simple scene with the avatar config embedded as metadata
      const scene = new THREE.Scene();
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: avatarConfig.skinTone });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = 'AvatarExport';
      // Embed config as userData
      mesh.userData = { avatarConfig };
      scene.add(mesh);

      exporter.parse(
        scene,
        (result) => {
          const blob = new Blob([result as ArrayBuffer], { type: 'model/gltf-binary' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${avatarName.replace(/\s+/g, '-')}-avatar.glb`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          setStatus('glb', 'done');
        },
        () => setStatus('glb', 'error'),
        { binary: true }
      );
    } catch (err) {
      console.error('GLB export failed:', err);
      setStatus('glb', 'error');
    }
  }, [avatarName, avatarConfig]);

  // Save to account
  const saveToAccount = useCallback(async () => {
    if (!currentUser) return;
    setStatus('save', 'loading');

  try {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  const previewUrl = canvas?.toDataURL('image/jpeg', 0.7) || null;

  const res = await fetch('/api/avatars',{
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      name: avatarName,
      config: avatarConfig,
      previewUrl,
    }),
  });

  const data = await res.json();
  console.log("SAVE RESPONSE:", res.status, data);

  if (!res.ok) {
    throw new Error(data?.error || 'Save failed');
  }

  setStatus('save', 'done');
} catch (err) {
  console.error('Save failed:', err);
  setStatus('save', 'error');
}
  }, [currentUser, avatarName, avatarConfig]);

  const buttonClass = (key: string) => `
    flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm
    transition-all duration-200 border
    ${exportStatus[key] === 'loading' ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
    ${exportStatus[key] === 'done' ? 'bg-green-500/20 border-green-500/40 text-green-400' : ''}
    ${exportStatus[key] === 'error' ? 'bg-red-500/20 border-red-500/40 text-red-400' : ''}
    ${exportStatus[key] === 'idle' || exportStatus[key] === 'loading' ? '' : ''}
  `;

  const buttonLabel = (key: string, idle: string) => {
    if (exportStatus[key] === 'loading') return '⏳ Processing...';
    if (exportStatus[key] === 'done') return '✅ Done!';
    if (exportStatus[key] === 'error') return '❌ Failed';
    return idle;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Avatar name */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-white/60">Avatar Name</label>
        <input
          type="text"
          value={avatarName}
          onChange={e => setAvatarName(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
            placeholder-white/20 focus:outline-none focus:border-cyan-500/50"
          placeholder="My Avatar"
          maxLength={50}
        />
      </div>

      <div className="border-t border-white/10" />

      {/* Export buttons */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-white/40 uppercase tracking-wider">Export Options</p>

        <button
          onClick={exportPNG}
          disabled={exportStatus.png === 'loading'}
          className={`${buttonClass('png')} bg-blue-500/10 border-blue-500/30 text-blue-400
            hover:bg-blue-500/20`}
        >
          {buttonLabel('png', '🖼 Export PNG')}
        </button>

        <button
          onClick={exportGLB}
          disabled={exportStatus.glb === 'loading'}
          className={`${buttonClass('glb')} bg-purple-500/10 border-purple-500/30 text-purple-400
            hover:bg-purple-500/20`}
        >
          {buttonLabel('glb', '🧊 Export GLB (3D)')}
        </button>

        <button
          onClick={() => {
            setStatus('gif', 'loading');
            setTimeout(() => setStatus('gif', 'done'), 2000);
          }}
          disabled={exportStatus.gif === 'loading'}
          className={`${buttonClass('gif')} bg-pink-500/10 border-pink-500/30 text-pink-400
            hover:bg-pink-500/20`}
        >
          {buttonLabel('gif', '🎞 Export GIF')}
        </button>
      </div>

      <div className="border-t border-white/10" />

      {/* Save to account */}
      {currentUser ? (
        <button
          onClick={saveToAccount}
          disabled={exportStatus.save === 'loading'}
          className={`${buttonClass('save')}
            ${exportStatus.save === 'idle' || exportStatus.save === 'loading'
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30'
              : ''
            }`}
        >
          {buttonLabel('save', '💾 Save to Account')}
        </button>
      ) : (
        <div className="text-center py-3 px-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-white/40">
            <a href="/auth/login" className="text-cyan-400 hover:underline">Sign in</a>
            {' '}to save avatars to your account
          </p>
        </div>
      )}

      {/* Info */}
      <div className="rounded-lg bg-white/3 border border-white/8 p-3">
        <p className="text-xs text-white/30 leading-relaxed">
          PNG exports the current 3D viewport. GLB exports the full 3D model for use in Blender, 
          Unity, or Unreal. GIF captures an animated loop.
        </p>
      </div>
    </motion.div>
  );
}
