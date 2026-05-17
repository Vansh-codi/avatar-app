// lib/landmarkProcessor.ts
// Core ML processing: converts raw MediaPipe landmarks into 3D bone transforms
// Improved: OneEuro adaptive filter, deadzone, visibility gating, walking stride capture

import * as THREE from 'three';
import type { FaceLandmarks, PoseLandmarks, BlendShapes, AvatarBoneTransforms, Quaternion, Emotion } from '@/types';

// ============================================================
// MEDIAPIPE LANDMARK INDICES
// ============================================================

export const FACE_LANDMARKS = {
  NOSE_TIP: 4,
  NOSE_BOTTOM: 1,
  LEFT_EYE_OUTER: 33,
  LEFT_EYE_INNER: 133,
  LEFT_EYE_TOP: 159,
  LEFT_EYE_BOTTOM: 145,
  RIGHT_EYE_OUTER: 263,
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_TOP: 386,
  RIGHT_EYE_BOTTOM: 374,
  MOUTH_LEFT: 61,
  MOUTH_RIGHT: 291,
  MOUTH_TOP: 13,
  MOUTH_BOTTOM: 14,
  UPPER_LIP_CENTER: 0,
  LOWER_LIP_CENTER: 17,
  FOREHEAD: 10,
  CHIN: 152,
  LEFT_CHEEK: 234,
  RIGHT_CHEEK: 454,
  LEFT_BROW_INNER: 65,
  LEFT_BROW_OUTER: 46,
  RIGHT_BROW_INNER: 295,
  RIGHT_BROW_OUTER: 276,
};

export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_FOOT: 31,
  RIGHT_FOOT: 32,
};

// ============================================================
// ONE EURO ADAPTIVE FILTER — minimal jitter, fast response
// Reference: Casiez et al. CHI 2012
// ============================================================

class LowPassFilter {
  private _value: number | null = null;

  filter(value: number, alpha: number): number {
    if (this._value === null) {
      this._value = value;
    } else {
      this._value = alpha * value + (1 - alpha) * this._value;
    }
    return this._value;
  }

  lastValue(): number | null {
    return this._value;
  }

  reset(): void {
    this._value = null;
  }
}

class OneEuroFilter {
  private freq: number;
  private mincutoff: number;
  private beta: number;
  private dcutoff: number;
  private xFilt: LowPassFilter;
  private dxFilt: LowPassFilter;

  constructor(freq = 30, mincutoff = 1.5, beta = 0.01, dcutoff = 1.0) {
    this.freq = freq;
    this.mincutoff = mincutoff;
    this.beta = beta;
    this.dcutoff = dcutoff;
    this.xFilt = new LowPassFilter();
    this.dxFilt = new LowPassFilter();
  }

  private alpha(cutoff: number): number {
    const te = 1.0 / this.freq;
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / te);
  }

  filter(x: number): number {
    const prev = this.xFilt.lastValue();
    const dx = prev === null ? 0 : (x - prev) * this.freq;
    const edx = this.dxFilt.filter(dx, this.alpha(this.dcutoff));
    const cutoff = this.mincutoff + this.beta * Math.abs(edx);
    return this.xFilt.filter(x, this.alpha(cutoff));
  }

  setParams(mincutoff: number, beta: number): void {
    this.mincutoff = mincutoff;
    this.beta = beta;
    this.xFilt.reset();
    this.dxFilt.reset();
  }
}

/**
 * Multi-channel smoother using OneEuro filters.
 * Applies a deadzone to suppress sub-threshold micro-jitter.
 */
class MotionSmoother {
  private filters = new Map<string, OneEuroFilter>();
  private lastOut = new Map<string, number>();
  private mincutoff: number;
  private beta: number;
  private deadzone: number;

  constructor(mincutoff = 1.5, beta = 0.01, deadzone = 0.001) {
    this.mincutoff = mincutoff;
    this.beta = beta;
    this.deadzone = deadzone;
  }

  smooth(key: string, value: number): number {
    if (!this.filters.has(key)) {
      this.filters.set(key, new OneEuroFilter(30, this.mincutoff, this.beta));
    }
    const filtered = this.filters.get(key)!.filter(value);
    const last = this.lastOut.get(key) ?? filtered;
    if (Math.abs(filtered - last) < this.deadzone) return last;
    this.lastOut.set(key, filtered);
    return filtered;
  }

  setParameters(mincutoff: number, beta: number): void {
    this.mincutoff = mincutoff;
    this.beta = beta;
    this.filters.forEach(f => f.setParams(mincutoff, beta));
    this.lastOut.clear();
  }
}

// Separate smoothers tuned per body region
const faceSmoother  = new MotionSmoother(1.0, 0.01, 0.0001);
const armSmoother   = new MotionSmoother(1.8, 0.012, 0.002);
const legSmoother   = new MotionSmoother(2.0, 0.015, 0.003);
const spineSmoother = new MotionSmoother(1.0, 0.008, 0.001);

// ============================================================
// WALKING DETECTOR
// ============================================================

class WalkingDetector {
  private leftHistory: number[] = [];
  private rightHistory: number[] = [];
  private readonly SIZE = 20;
  private _isWalking = false;
  private _amplitude = 0;

  update(leftAnkle?: { y: number; visibility?: number }, rightAnkle?: { y: number; visibility?: number }): void {
    if (!leftAnkle || !rightAnkle) return;
    if ((leftAnkle.visibility ?? 1) < 0.4 || (rightAnkle.visibility ?? 1) < 0.4) return;

    this.leftHistory.push(leftAnkle.y);
    this.rightHistory.push(rightAnkle.y);
    if (this.leftHistory.length > this.SIZE) this.leftHistory.shift();
    if (this.rightHistory.length > this.SIZE) this.rightHistory.shift();

    if (this.leftHistory.length < 8) return;

    const combined = [...this.leftHistory, ...this.rightHistory];
    const mean = combined.reduce((a, b) => a + b, 0) / combined.length;
    const variance = combined.reduce((a, b) => a + (b - mean) ** 2, 0) / combined.length;
    this._amplitude = Math.sqrt(variance);
    this._isWalking = this._amplitude > 0.008;
  }

  get isWalking(): boolean { return this._isWalking; }
  get amplitude(): number { return this._amplitude; }
}

const walkDetector = new WalkingDetector();

// ============================================================
// FACE PROCESSING
// ============================================================
export function extractHeadRotation(landmarks: FaceLandmarks['landmarks']): THREE.Quaternion {
  const noseTip    = landmarks[FACE_LANDMARKS.NOSE_TIP];
  const chin       = landmarks[FACE_LANDMARKS.CHIN];
  const leftCheek  = landmarks[FACE_LANDMARKS.LEFT_CHEEK];
  const rightCheek = landmarks[FACE_LANDMARKS.RIGHT_CHEEK];
  const forehead   = landmarks[FACE_LANDMARKS.FOREHEAD];

  if (!noseTip || !chin || !leftCheek || !rightCheek) return new THREE.Quaternion();

  const right = new THREE.Vector3(
     (rightCheek.x - leftCheek.x),
     -(rightCheek.y - leftCheek.y),
     (rightCheek.z - leftCheek.z)
  ).normalize();

  const up = new THREE.Vector3(
     -(forehead.x - chin.x),
    -(forehead.y - chin.y),
    (forehead.z - chin.z)
  ).normalize();

  const forward = new THREE.Vector3().crossVectors(right, up).normalize();
  up.crossVectors(forward, right).normalize();

  const rotMatrix = new THREE.Matrix4().makeBasis(right, up, forward);
  const quat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

  const smoothed = new THREE.Quaternion(
    faceSmoother.smooth('head.x', quat.x),
    faceSmoother.smooth('head.y', quat.y),
    faceSmoother.smooth('head.z', quat.z),
    faceSmoother.smooth('head.w', quat.w)
  ).normalize();

  const flip180Y = new THREE.Quaternion();
  flip180Y.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

  return smoothed.multiply(flip180Y);
}

export function computeBlendShapes(landmarks: FaceLandmarks['landmarks']): BlendShapes {
  const l = landmarks;

  const leftEyeHeight = dist(l[FACE_LANDMARKS.LEFT_EYE_TOP], l[FACE_LANDMARKS.LEFT_EYE_BOTTOM]);
  const leftEyeWidth  = dist(l[FACE_LANDMARKS.LEFT_EYE_OUTER], l[FACE_LANDMARKS.LEFT_EYE_INNER]);
  const rightEyeHeight = dist(l[FACE_LANDMARKS.RIGHT_EYE_TOP], l[FACE_LANDMARKS.RIGHT_EYE_BOTTOM]);
  const rightEyeWidth  = dist(l[FACE_LANDMARKS.RIGHT_EYE_OUTER], l[FACE_LANDMARKS.RIGHT_EYE_INNER]);

  const leftRatio  = leftEyeWidth  > 0 ? leftEyeHeight  / leftEyeWidth  : 0;
  const rightRatio = rightEyeWidth > 0 ? rightEyeHeight / rightEyeWidth : 0;
  const eyeBlinkLeft = faceSmoother.smooth(
  'eyeBlinkLeft',
  THREE.MathUtils.clamp((0.27 - leftRatio) * 4.0, 0, 1)
);

const eyeBlinkRight = faceSmoother.smooth(
  'eyeBlinkRight',
  THREE.MathUtils.clamp((0.27 - rightRatio) * 4.0, 0, 1)
);
  const leftEyeOpen   = THREE.MathUtils.clamp(leftRatio  / 0.30, 0, 1);
  const rightEyeOpen  = THREE.MathUtils.clamp(rightRatio / 0.30, 0, 1);

  const mouthHeight = dist(l[FACE_LANDMARKS.MOUTH_TOP], l[FACE_LANDMARKS.MOUTH_BOTTOM]);
  const mouthWidth  = dist(l[FACE_LANDMARKS.MOUTH_LEFT], l[FACE_LANDMARKS.MOUTH_RIGHT]);
  const jawOpen = faceSmoother.smooth('jawOpen', Math.min(1, mouthHeight / (mouthWidth * 0.5 || 0.01)));

  const mouthCenterY = ((l[FACE_LANDMARKS.MOUTH_TOP]?.y ?? 0) + (l[FACE_LANDMARKS.MOUTH_BOTTOM]?.y ?? 0)) / 2;
  const leftCornerY  = l[FACE_LANDMARKS.MOUTH_LEFT]?.y  ?? mouthCenterY;
  const rightCornerY = l[FACE_LANDMARKS.MOUTH_RIGHT]?.y ?? mouthCenterY;

  const leftSmile  = faceSmoother.smooth('mouthSmileLeft',  Math.max(0, Math.min(1, (mouthCenterY - leftCornerY)  / 0.02)));
  const rightSmile = faceSmoother.smooth('mouthSmileRight', Math.max(0, Math.min(1, (mouthCenterY - rightCornerY) / 0.02)));
  const leftFrown  = faceSmoother.smooth('mouthFrownLeft',  Math.max(0, Math.min(1, (leftCornerY  - mouthCenterY) / 0.02)));
  const rightFrown = faceSmoother.smooth('mouthFrownRight', Math.max(0, Math.min(1, (rightCornerY - mouthCenterY) / 0.02)));

  const faceHeight       = dist(l[FACE_LANDMARKS.FOREHEAD], l[FACE_LANDMARKS.CHIN]);
  const leftBrowHeight   = Math.abs((l[FACE_LANDMARKS.LEFT_BROW_INNER]?.y  ?? 0) - (l[FACE_LANDMARKS.LEFT_EYE_TOP]?.y  ?? 0));
  const rightBrowHeight  = Math.abs((l[FACE_LANDMARKS.RIGHT_BROW_INNER]?.y ?? 0) - (l[FACE_LANDMARKS.RIGHT_EYE_TOP]?.y ?? 0));
  const normBrow = faceHeight > 0 ? (leftBrowHeight + rightBrowHeight) / (2 * faceHeight) : 0;
  const browInnerUp = faceSmoother.smooth('browInnerUp', Math.min(1, normBrow * 8));

  return {
    browDownLeft:     faceSmoother.smooth('browDownLeft',  Math.max(0, 1 - browInnerUp)),
    browDownRight:    faceSmoother.smooth('browDownRight', Math.max(0, 1 - browInnerUp)),
    browInnerUp,
    browOuterUpLeft:  faceSmoother.smooth('browOuterUpLeft',  browInnerUp * 0.7),
    browOuterUpRight: faceSmoother.smooth('browOuterUpRight', browInnerUp * 0.7),
    cheekPuff: 0,
    eyeBlinkLeft,
    eyeBlinkRight,
    eyeLookDownLeft: 0, eyeLookDownRight: 0,
    eyeLookInLeft: 0,   eyeLookInRight: 0,
    eyeLookOutLeft: 0,  eyeLookOutRight: 0,
    eyeLookUpLeft: 0,   eyeLookUpRight: 0,
    eyeSquintLeft:  faceSmoother.smooth('eyeSquintLeft',  eyeBlinkLeft  * 0.3),
    eyeSquintRight: faceSmoother.smooth('eyeSquintRight', eyeBlinkRight * 0.3),
    eyeWideLeft:    faceSmoother.smooth('eyeWideLeft',  Math.max(0, leftEyeOpen - 0.8) * 1.2),
    eyeWideRight:   faceSmoother.smooth('eyeWideRight', Math.max(0, rightEyeOpen - 0.8) * 1.2),
    jawForward: 0, jawLeft: 0, jawOpen, jawRight: 0,
    mouthClose:       faceSmoother.smooth('mouthClose', Math.max(0, 1 - jawOpen)),
    mouthDimpleLeft:  leftSmile  * 0.3,
    mouthDimpleRight: rightSmile * 0.3,
    mouthFrownLeft:   leftFrown,
    mouthFrownRight:  rightFrown,
    mouthFunnel:      jawOpen * 0.3,
    mouthLeft: 0,
    mouthLowerDownLeft:  jawOpen * 0.5,
    mouthLowerDownRight: jawOpen * 0.5,
    mouthPressLeft: 0, mouthPressRight: 0,
    mouthPucker: 0, mouthRight: 0,
    mouthRollLower: 0, mouthRollUpper: 0,
    mouthShrugLower: 0, mouthShrugUpper: 0,
    mouthSmileLeft:  leftSmile,
    mouthSmileRight: rightSmile,
    mouthStretchLeft: 0, mouthStretchRight: 0,
    mouthUpperUpLeft:  jawOpen * 0.3,
    mouthUpperUpRight: jawOpen * 0.3,
    noseSneerLeft: 0, noseSneerRight: 0,
  };
}

// ============================================================
// POSE PROCESSING
// ============================================================

type LM = { x: number; y: number; z: number; visibility?: number };

/**
 * Tracks the previous quaternion per bone key to detect sign flips.
 * setFromUnitVectors can return q or -q (both represent the same rotation),
 * but switching between them each frame causes a 360° visual spin (the stretch bug).
 */
const _prevBoneQuats = new Map<string, THREE.Quaternion>();

/**
 * Get a quaternion for a bone segment with:
 * - Visibility confidence gating (no phantom motion)
 * - Sign-coherence check (no 180° flip jitter = no arm stretching)
 * Returns null when quality is insufficient.
 */
function getBoneRotation(
  from: LM, to: LM,
  referenceAxis: THREE.Vector3,
  smoother: MotionSmoother,
  key: string,
  minVis = 0.45,
  flipX = true
): Quaternion | null {
  if ((from.visibility ?? 1) < minVis || (to.visibility ?? 1) < minVis) return null;

  // MediaPipe → Three.js coordinate conversion:
  //   X: NEGATE — MediaPipe X increases left→right in camera frame.
  //      The webcam is mirrored for the user preview, but landmarks are NOT mirrored.
  //      So camera-left = small X = avatar's RIGHT side. Negating X corrects this.
  //   Y: NEGATE — MediaPipe Y goes top→down; Three.js Y goes bottom→up.
  //   Z: keep as-is (depth, roughly equivalent).
  const dir = new THREE.Vector3(
     flipX ? -(to.x - from.x) : (to.x - from.x),
    // -(to.x - from.x),   // un-mirror X
    -(to.y - from.y),   // flip Y
     (to.z - from.z)
  );
  if (dir.length() < 0.015) return null;
  dir.normalize();

  const quat = new THREE.Quaternion().setFromUnitVectors(referenceAxis, dir);

  // ── Sign coherence: prevent quaternion hemisphere flip ──
  const prev = _prevBoneQuats.get(key);
  if (prev && prev.dot(quat) < 0) {
    quat.set(-quat.x, -quat.y, -quat.z, -quat.w);
  }
  _prevBoneQuats.set(key, quat.clone());

  return {
    x: smoother.smooth(`${key}.x`, quat.x),
    y: smoother.smooth(`${key}.y`, quat.y),
    z: smoother.smooth(`${key}.z`, quat.z),
    w: smoother.smooth(`${key}.w`, quat.w),
  };
}

/** Extended transforms that include lower legs and walking metadata */
export interface ExtendedBoneTransforms extends Partial<AvatarBoneTransforms> {
  leftLowerLeg?: Quaternion;
  rightLowerLeg?: Quaternion;
  /** Lateral hip tilt for walking bob — range ≈ −0.05..0.05 */
  hipBob?: number;
  isWalking?: boolean;
}
function flipX180(r: Quaternion): Quaternion {
  const q = new THREE.Quaternion(r.x, r.y, r.z, r.w);
  const flip = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
  q.multiply(flip);
  return { x: q.x, y: q.y, z: q.z, w: q.w };
}

export function extractBoneTransforms(poseLandmarks: PoseLandmarks['landmarks']): ExtendedBoneTransforms {
  const p = poseLandmarks;
  if (p.length < 29) return {};

  const transforms: ExtendedBoneTransforms = {};
  const DOWN = new THREE.Vector3(0, -1, 0);
  const UP   = new THREE.Vector3(0,  1, 0);

  // MediaPipe landmark IDs (mirrored camera view):
  //   11 = user's LEFT shoulder  (appears on RIGHT side of camera frame)
  //   12 = user's RIGHT shoulder (appears on LEFT  side of camera frame)
  // After negating X in getBoneRotation, p[11] drives the avatar's RIGHT arm
  // (because the avatar is facing the camera, like a mirror reflection).
  // So to make the avatar MIRROR the user:
  //   avatar rightUpperArm ← p[11→13]  (user's left shoulder→elbow)
  //   avatar leftUpperArm  ← p[12→14]  (user's right shoulder→elbow)

  // ── ARMS (mirrored assignment so avatar matches a mirror image) ──
  // Right arm of avatar = user's left arm landmarks (11,13,15)
 // ── ARMS — flipX = false ──
if (p[11] && p[13]) {
  const r = getBoneRotation(p[11], p[13], DOWN, armSmoother, 'rightUpperArm', 0.45, false);
  if (r) transforms.rightUpperArm = r;
}
if (p[13] && p[15]) {
  const r = getBoneRotation(p[13], p[15], DOWN, armSmoother, 'rightLowerArm', 0.45, false);
  if (r) transforms.rightLowerArm = r;
}
if (p[12] && p[14]) {
  const r = getBoneRotation(p[12], p[14], DOWN, armSmoother, 'leftUpperArm', 0.45, false);
  if (r) transforms.leftUpperArm = r;
}
if (p[14] && p[16]) {
  const r = getBoneRotation(p[14], p[16], DOWN, armSmoother, 'leftLowerArm', 0.45, false);
  if (r) transforms.leftLowerArm = r;
}

// ── SPINE — flipX = true (default, unchanged) ──
const hipMid      = midpoint(p[23], p[24]);
const shoulderMid = midpoint(p[11], p[12]);
if (hipMid && shoulderMid) {
  const r = getBoneRotation(hipMid as LM, shoulderMid as LM, UP, spineSmoother, 'spine', 0.3);
  if (r) transforms.spine = r;
}

  // ── LEGS (same mirror logic: user's left leg = avatar's right leg) ──
  // Right leg of avatar = user's left leg (23,25,27)
  // Note: lowered minVis to 0.1. MediaPipe leg confidence is often terrible on webcams.
  if (p[23] && p[25]) {
    const r = getBoneRotation(p[23], p[25], DOWN, legSmoother, 'rightUpperLeg', 0.1);
    if (r) transforms.rightUpperLeg = r;
  }
  if (p[25] && p[27]) {
    const r = getBoneRotation(p[25], p[27], DOWN, legSmoother, 'rightLowerLeg', 0.1);
    if (r) transforms.rightLowerLeg = r;
  }
  // Left leg of avatar = user's right leg (24,26,28)
  if (p[24] && p[26]) {
    const r = getBoneRotation(p[24], p[26], DOWN, legSmoother, 'leftUpperLeg', 0.1);
    if (r) transforms.leftUpperLeg = r;
  }
  if (p[26] && p[28]) {
    const r = getBoneRotation(p[26], p[28], DOWN, legSmoother, 'leftLowerLeg', 0.1);
    if (r) transforms.leftLowerLeg = r;
  }
  // ── LEGS ──


  // ── WALKING DETECTION ──
  walkDetector.update(p[27], p[28]);
  transforms.isWalking = walkDetector.isWalking;

  // Hip bob
  const lyA = p[27]?.y ?? 0;
  const ryA = p[28]?.y ?? 0;
  transforms.hipBob = legSmoother.smooth('hipBob', (lyA - ryA) * 1.5);
  // ── HIPS ROTATION (for sitting / bending) ──
  if (p[23] && p[24] && 
    (p[23].visibility ?? 0) > 0.4 && 
    (p[24].visibility ?? 0) > 0.4) {
  
  const hipLeft = p[23];
  const hipRight = p[24];
  
  // Only extract lateral tilt (Z rotation) — ignore forward/twist
  const lateralTilt = -(hipRight.y - hipLeft.y) * 1.5;
  const clampedTilt = THREE.MathUtils.clamp(lateralTilt,  -0.08, 0.08);
  
  // Build a pure Z-axis rotation quaternion only
  const tiltQuat = new THREE.Quaternion();
  tiltQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), clampedTilt);
  
  transforms.hips = {
    x: spineSmoother.smooth('hips.x', tiltQuat.x),
    y: spineSmoother.smooth('hips.y', tiltQuat.y),
    z: spineSmoother.smooth('hips.z', tiltQuat.z),
    w: spineSmoother.smooth('hips.w', tiltQuat.w),
  };
}
// if (p[23] && p[24]) {
//   const hipLeft = p[23];
//   const hipRight = p[24];

//   const hipDir = new THREE.Vector3(
//     -(hipRight.x - hipLeft.x),
//     -(hipRight.y - hipLeft.y),
//      (hipRight.z - hipLeft.z)
//   ).normalize();

//   const quat = new THREE.Quaternion().setFromUnitVectors(
//     new THREE.Vector3(1, 0, 0),
//     hipDir
//   );

//   transforms.hips = {
//     x: quat.x,
//     y: quat.y,
//     z: quat.z,
//     w: quat.w,
//   };
// }

  return transforms;
}

// ============================================================
// EMOTION DETECTION
// ============================================================

export function detectEmotion(blendShapes: BlendShapes): Emotion {
  const happy     = (blendShapes.mouthSmileLeft + blendShapes.mouthSmileRight) / 2;
  const sad       = (blendShapes.mouthFrownLeft + blendShapes.mouthFrownRight) / 2;
  const surprised = blendShapes.jawOpen * 0.7 + blendShapes.eyeWideLeft * 0.15 + blendShapes.eyeWideRight * 0.15;
  const angry     = blendShapes.browDownLeft * 0.5 + blendShapes.browDownRight * 0.5;
  const fearful   = blendShapes.eyeWideLeft * 0.4 + blendShapes.eyeWideRight * 0.4 + blendShapes.browInnerUp * 0.2;
  const disgusted = blendShapes.noseSneerLeft * 0.5 + blendShapes.noseSneerRight * 0.5;

  const scores = { neutral: 0, happy, sad, angry, surprised, disgusted, fearful };
  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  if (total > 0.3) {
    let dominant: Emotion['dominant'] = 'neutral';
    let maxScore = 0.2;
    for (const [emotion, score] of Object.entries(scores)) {
      if (emotion !== 'neutral' && score > maxScore) {
        maxScore = score;
        dominant = emotion as Emotion['dominant'];
      }
    }
    scores.neutral = Math.max(0, 1 - total);
    return { dominant, scores };
  }

  return { dominant: 'neutral', scores: { neutral: 1, happy: 0, sad: 0, angry: 0, surprised: 0, disgusted: 0, fearful: 0 } };
}

// ============================================================
// GESTURE RECOGNITION
// ============================================================

export function detectGesture(poseLandmarks: PoseLandmarks['landmarks']): string | null {
  const p = poseLandmarks;
  if (p.length < 17) return null;

  const lWrist = p[POSE_LANDMARKS.LEFT_WRIST];
  const rWrist = p[POSE_LANDMARKS.RIGHT_WRIST];
  const lShoulder = p[POSE_LANDMARKS.LEFT_SHOULDER];
  const rShoulder = p[POSE_LANDMARKS.RIGHT_SHOULDER];
  const lElbow  = p[POSE_LANDMARKS.LEFT_ELBOW];
  const rElbow  = p[POSE_LANDMARKS.RIGHT_ELBOW];
  const lHip    = p[POSE_LANDMARKS.LEFT_HIP];
  const rHip    = p[POSE_LANDMARKS.RIGHT_HIP];

  if (!lWrist || !rWrist || !lShoulder || !rShoulder) return null;

  const visOk = (lm: typeof lWrist) => (lm?.visibility ?? 0) > 0.6;

  // Body midpoint references
  const bodyMidX = (lShoulder.x + rShoulder.x) / 2;
  const shoulderY = (lShoulder.y + rShoulder.y) / 2;
  const hipY = lHip && rHip ? (lHip.y + rHip.y) / 2 : shoulderY + 0.3;

  // ── Both hands above head ── "victory" / Y pose
  if (visOk(lWrist) && visOk(rWrist) &&
      lWrist.y < lShoulder.y - 0.05 && rWrist.y < rShoulder.y - 0.05) {
    return 'victory';
  }

  // ── Right wrist above right shoulder ── "wave" (single hand raised)
  if (visOk(rWrist) && rWrist.y < rShoulder.y - 0.03 &&
      !(lWrist.y < lShoulder.y - 0.03)) {
    return 'wave';
  }

  // ── Left wrist raised only ── "left wave"
  if (visOk(lWrist) && lWrist.y < lShoulder.y - 0.03 &&
      !(rWrist.y < rShoulder.y - 0.03)) {
    return 'wave';
  }

  // ── Arms stretched wide (T-pose) ──
  // Both wrists far from body center, near shoulder height
  const armSpan = Math.abs(rWrist.x - lWrist.x);
  const shoulderSpan = Math.abs(rShoulder.x - lShoulder.x);
  if (visOk(lWrist) && visOk(rWrist) &&
      armSpan > shoulderSpan * 2.0 &&
      Math.abs(lWrist.y - shoulderY) < 0.12 &&
      Math.abs(rWrist.y - shoulderY) < 0.12) {
    return 'arms-out';
  }

  // ── Hands crossed over chest ──
  if (visOk(lWrist) && visOk(rWrist) &&
      lWrist.x > bodyMidX && rWrist.x < bodyMidX &&
      lWrist.y > shoulderY && rWrist.y > shoulderY &&
      lWrist.y < hipY && rWrist.y < hipY) {
    return 'crossed';
  }

  return null;
}

// ============================================================
// GLOBAL SMOOTHING API
// Maps user slider (0=smooth, 1=responsive) to OneEuro params
// ============================================================

export function setGlobalSmoothing(value: number) {
  // mincutoff: low = more smooth, high = more responsive
  const mc   = 0.5 + value * 2.5;
  const beta = 0.003 + value * 0.017;
  faceSmoother.setParameters(mc * 0.7, beta * 0.5);
  armSmoother.setParameters(mc, beta);
  legSmoother.setParameters(mc * 1.1, beta * 1.2);
  spineSmoother.setParameters(mc * 0.8, beta * 0.8);
}

// ============================================================
// UTILITY HELPERS
// ============================================================

function dist(a?: { x: number; y: number; z: number }, b?: { x: number; y: number; z: number }): number {
  if (!a || !b) return 0;
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

function midpoint(a?: LM, b?: LM): LM | null {
  if (!a || !b) return null;
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
    visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1),
  };
}

// ============================================================
// FACE PROFILE CAPTURE
// ============================================================

export interface FaceProfile {
  skinTone: string;
  faceShape: 'oval' | 'round' | 'square' | 'narrow';
  eyeSpacingRatio: number;
  faceHeightRatio: number;
}

function sampleSkinColour(video: HTMLVideoElement, landmark: { x: number; y: number }): string {
  try {
    const tmp = document.createElement('canvas');
    tmp.width  = video.videoWidth  || 640;
    tmp.height = video.videoHeight || 480;
    const ctx = tmp.getContext('2d');
    if (!ctx) return '#F5CBA7';

    ctx.save();
    ctx.translate(tmp.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.restore();

    const px = Math.round(landmark.x * tmp.width);
    const py = Math.round(landmark.y * tmp.height);
    let r = 0, g = 0, b = 0, count = 0;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const d = ctx.getImageData(px + dx, py + dy, 1, 1).data;
        r += d[0]; g += d[1]; b += d[2]; count++;
      }
    }
    r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } catch {
    return '#F5CBA7';
  }
}

export function captureFaceProfile(landmarks: FaceLandmarks['landmarks'], video: HTMLVideoElement): FaceProfile {
  const noseTip     = landmarks[FACE_LANDMARKS.NOSE_TIP];
  const chin        = landmarks[FACE_LANDMARKS.CHIN];
  const forehead    = landmarks[FACE_LANDMARKS.FOREHEAD];
  const leftCheek   = landmarks[FACE_LANDMARKS.LEFT_CHEEK];
  const rightCheek  = landmarks[FACE_LANDMARKS.RIGHT_CHEEK];
  const leftEyeOut  = landmarks[FACE_LANDMARKS.LEFT_EYE_OUTER];
  const rightEyeOut = landmarks[FACE_LANDMARKS.RIGHT_EYE_OUTER];

  const faceWidth  = leftCheek  && rightCheek  ? Math.abs(rightCheek.x  - leftCheek.x)  : 0.3;
  const faceHeight = forehead   && chin        ? Math.abs(chin.y        - forehead.y)    : 0.4;
  const faceHeightRatio = faceWidth > 0 ? faceHeight / faceWidth : 1.3;

  let faceShape: FaceProfile['faceShape'];
  if      (faceHeightRatio > 1.5)  faceShape = 'narrow';
  else if (faceHeightRatio > 1.25) faceShape = 'oval';
  else if (faceHeightRatio > 1.05) faceShape = 'square';
  else                              faceShape = 'round';

  const eyeSpacingRatio = leftEyeOut && rightEyeOut && faceWidth > 0
    ? Math.abs(rightEyeOut.x - leftEyeOut.x) / faceWidth
    : 0.5;

  const samplePoint = noseTip ?? (leftCheek && rightCheek
    ? { x: (leftCheek.x + rightCheek.x) / 2, y: (leftCheek.y + rightCheek.y) / 2 }
    : { x: 0.5, y: 0.5 });

  const skinTone = sampleSkinColour(video, samplePoint);
  return { skinTone, faceShape, eyeSpacingRatio, faceHeightRatio };
}
