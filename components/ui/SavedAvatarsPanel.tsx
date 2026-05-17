// components/ui/SavedAvatarsPanel.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { SavedAvatar } from '@/types';
import { useSession } from 'next-auth/react';
export function SavedAvatarsPanel() {
  const { user, setAvatarConfig } = useStore();
  const { data: session } = useSession();
const currentUser = user || session?.user;
  const [avatars, setAvatars] = useState<SavedAvatar[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAvatars = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetch('/api/avatars', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAvatars(data.avatars || []);
      }
    } catch (err) {
      console.error('Fetch avatars error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatars();
  }, [currentUser]);

  const loadAvatar = (avatar: SavedAvatar) => {
    setAvatarConfig(avatar.config as any);
  };

  const deleteAvatar = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/avatar/save?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAvatars(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error('Delete avatar error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full text-center px-4">
        <div>
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-white/40 text-sm">Sign in to save and manage your avatars.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Saved Avatars</h3>
        <button
          onClick={fetchAvatars}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-5 h-5 border-2 border-white/20 border-t-cyan-400 rounded-full"
          />
        </div>
      )}

      {!loading && avatars.length === 0 && (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🎭</div>
          <p className="text-white/30 text-sm">No saved avatars yet.</p>
          <p className="text-white/20 text-xs mt-1">Use the Export tab to save your avatar.</p>
        </div>
      )}

      <AnimatePresence>
        {avatars.map((avatar, i) => (
          <motion.div
            key={avatar.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ delay: i * 0.05 }}
            className="group flex gap-3 p-3 rounded-xl bg-white/5 border border-white/8
              hover:border-white/15 transition-all"
          >
            {/* Preview */}
            <div className="w-14 h-14 rounded-lg bg-black/30 flex-shrink-0 overflow-hidden border border-white/10">
              {avatar.previewUrl ? (
                <img src={avatar.previewUrl} alt={avatar.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🎭</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{avatar.name}</p>
              <p className="text-xs text-white/30 font-mono">
                {new Date(avatar.updatedAt).toLocaleDateString()}
              </p>

              {/* Actions */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => loadAvatar(avatar)}
                  className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/30
                    text-cyan-400 hover:bg-cyan-500/30 transition-all"
                >
                  Load
                </button>
                <button
                  onClick={() => deleteAvatar(avatar.id)}
                  disabled={deletingId === avatar.id}
                  className="text-xs px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20
                    text-red-400/60 hover:bg-red-500/20 hover:text-red-400 transition-all"
                >
                  {deletingId === avatar.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {avatars.length > 0 && (
        <p className="text-xs text-white/20 text-center font-mono">
          {avatars.length}/20 avatars
        </p>
      )}
    </motion.div>
  );
}
