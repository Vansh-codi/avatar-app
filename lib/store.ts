// lib/store.ts
// Global state management with Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AvatarConfig, FaceLandmarks, PoseLandmarks, BlendShapes, Emotion, User } from '@/types';

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinTone: '#F5CBA7',
  hairColor: '#2C1810',
  hairStyle: 'short',
  eyeColor: '#4A90D9',
  faceShape: 'oval',
  bodyType: 'average',
  height: 1.0,
  topColor: '#2C3E50',
  bottomColor: '#1A252F',
  outfitStyle: 'casual',
  glasses: false,
  glassesStyle: 'none',
  hat: false,
  hatStyle: 'none',
  expressionIntensity: 0.8,
  motionSmoothing: 0.7,
};

interface AvatarStore {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Avatar config
  avatarConfig: AvatarConfig;
  setAvatarConfig: (config: Partial<AvatarConfig>) => void;
  resetAvatarConfig: () => void;

  // ML tracking data (not persisted)
  faceLandmarks: FaceLandmarks | null;
  poseLandmarks: PoseLandmarks | null;
  blendShapes: BlendShapes | null;
  emotion: Emotion | null;
  isTracking: boolean;
  isCameraActive: boolean;
  gesture: string | null;

  setFaceLandmarks: (landmarks: FaceLandmarks | null) => void;
  setPoseLandmarks: (landmarks: PoseLandmarks | null) => void;
  setBlendShapes: (shapes: BlendShapes | null) => void;
  setEmotion: (emotion: Emotion | null) => void;
  setIsTracking: (v: boolean) => void;
  setIsCameraActive: (v: boolean) => void;
  setGesture: (gesture: string | null) => void;

  // UI state
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activePanel: 'tracking' | 'customize' | 'export' | 'saved';
  setActivePanel: (panel: 'tracking' | 'customize' | 'export' | 'saved') => void;
  showWelcome: boolean;
  setShowWelcome: (v: boolean) => void;
}

export const useStore = create<AvatarStore>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),

      // Avatar config
      avatarConfig: DEFAULT_AVATAR_CONFIG,
      setAvatarConfig: (config) =>
        set((state) => ({ avatarConfig: { ...state.avatarConfig, ...config } })),
      resetAvatarConfig: () => set({ avatarConfig: DEFAULT_AVATAR_CONFIG }),

      // ML tracking (not persisted - reset on load)
      faceLandmarks: null,
      poseLandmarks: null,
      blendShapes: null,
      emotion: null,
      isTracking: false,
      isCameraActive: false,
      gesture: null,

      setFaceLandmarks: (faceLandmarks) => set({ faceLandmarks }),
      setPoseLandmarks: (poseLandmarks) => set({ poseLandmarks }),
      setBlendShapes: (blendShapes) => set({ blendShapes }),
      setEmotion: (emotion) => set({ emotion }),
      setIsTracking: (isTracking) => set({ isTracking }),
      setIsCameraActive: (isCameraActive) => set({ isCameraActive }),
      setGesture: (gesture) => set({ gesture }),

      // UI
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      activePanel: 'tracking',
      setActivePanel: (activePanel) => set({ activePanel }),
      showWelcome: true,
      setShowWelcome: (showWelcome) => set({ showWelcome }),
    }),
    {
      name: 'avatar-store',
      partialize: (state) => ({
        user: state.user,
        avatarConfig: state.avatarConfig,
        theme: state.theme,
      }),
    }
  )
);
