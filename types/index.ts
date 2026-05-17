// types/index.ts
// Shared TypeScript types for the entire application

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface AvatarConfig {
  // Appearance
  skinTone: string;
  hairColor: string;
  hairStyle: 'short' | 'long' | 'medium' | 'bald' | 'ponytail';
  eyeColor: string;
  faceShape: 'oval' | 'round' | 'square' | 'heart' | 'narrow';

  // Body
  bodyType: 'slim' | 'average' | 'athletic' | 'curvy';
  height: number; // 0.8 - 1.2 scale

  // Clothing
  topColor: string;
  bottomColor: string;
  outfitStyle: 'casual' | 'formal' | 'sporty' | 'fantasy';

  // Accessories
  glasses: boolean;
  glassesStyle: 'none' | 'round' | 'square' | 'aviator';
  hat: boolean;
  hatStyle: 'none' | 'cap' | 'beanie' | 'fedora';

  // Expression modifiers
  expressionIntensity: number; // 0-1
  motionSmoothing: number; // 0-1
   eyeSpacing?: number;
  faceHeight?: number;
}

export interface FaceLandmarks {
  // 468 MediaPipe FaceMesh landmarks
  landmarks: Array<{ x: number; y: number; z: number }>;
  blendShapes?: BlendShapes;
}

export interface PoseLandmarks {
  // 33 MediaPipe Pose landmarks
  landmarks: Array<{ x: number; y: number; z: number; visibility: number }>;
}

export interface BlendShapes {
  // ARKit-compatible blend shapes derived from MediaPipe
  browDownLeft: number;
  browDownRight: number;
  browInnerUp: number;
  browOuterUpLeft: number;
  browOuterUpRight: number;
  cheekPuff: number;
  eyeBlinkLeft: number;
  eyeBlinkRight: number;
  eyeLookDownLeft: number;
  eyeLookDownRight: number;
  eyeLookInLeft: number;
  eyeLookInRight: number;
  eyeLookOutLeft: number;
  eyeLookOutRight: number;
  eyeLookUpLeft: number;
  eyeLookUpRight: number;
  eyeSquintLeft: number;
  eyeSquintRight: number;
  eyeWideLeft: number;
  eyeWideRight: number;
  jawForward: number;
  jawLeft: number;
  jawOpen: number;
  jawRight: number;
  mouthClose: number;
  mouthDimpleLeft: number;
  mouthDimpleRight: number;
  mouthFrownLeft: number;
  mouthFrownRight: number;
  mouthFunnel: number;
  mouthLeft: number;
  mouthLowerDownLeft: number;
  mouthLowerDownRight: number;
  mouthPressLeft: number;
  mouthPressRight: number;
  mouthPucker: number;
  mouthRight: number;
  mouthRollLower: number;
  mouthRollUpper: number;
  mouthShrugLower: number;
  mouthShrugUpper: number;
  mouthSmileLeft: number;
  mouthSmileRight: number;
  mouthStretchLeft: number;
  mouthStretchRight: number;
  mouthUpperUpLeft: number;
  mouthUpperUpRight: number;
  noseSneerLeft: number;
  noseSneerRight: number;
  
}

export interface Emotion {
  dominant: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'disgusted' | 'fearful';
  scores: {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    disgusted: number;
    fearful: number;
  };
}

export interface AvatarBoneTransforms {
  // Head & face
  head: Quaternion;
  neck: Quaternion;
  // Arms
  leftUpperArm: Quaternion;
  leftLowerArm: Quaternion;
  leftHand: Quaternion;
  rightUpperArm: Quaternion;
  rightLowerArm: Quaternion;
  rightHand: Quaternion;
  // Torso
  spine: Quaternion;
  hips: Quaternion;
  // Legs
  leftUpperLeg: Quaternion;
  leftLowerLeg: Quaternion;
  rightUpperLeg: Quaternion;
  rightLowerLeg: Quaternion;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface SavedAvatar {
  id: string;
  userId: string;
  name: string;
  config: AvatarConfig;
  previewUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export type ExportFormat = 'png' | 'glb' | 'gif';

export interface GestureCommand {
  type: 'wave' | 'thumbsUp' | 'peace' | 'point' | 'openPalm';
  confidence: number;
  timestamp: number;
}
