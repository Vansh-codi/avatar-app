// components/three/Avatar3D.tsx
// Procedurally generated 3D avatar that mirrors face/body movements
// Built with React Three Fiber + Three.js

'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/lib/store';
import {
  extractHeadRotation,
  extractBoneTransforms,
  FACE_LANDMARKS,
} from '@/lib/landmarkProcessor';
import type { AvatarConfig } from '@/types';

interface AvatarProps {
  config: AvatarConfig;
}

// Helper: lerp quaternion for smooth animation

export default function Avatar3D({ config }: AvatarProps) {
  // Bone refs for real-time animation
  const headRef = useRef<THREE.Group>(null);
  const neckRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const hipsRef = useRef<THREE.Group>(null);
  const leftUpperArmRef = useRef<THREE.Group>(null);
  const leftLowerArmRef = useRef<THREE.Group>(null);
  const rightUpperArmRef = useRef<THREE.Group>(null);
  const rightLowerArmRef = useRef<THREE.Group>(null);
  const leftUpperLegRef = useRef<THREE.Group>(null);
  const rightUpperLegRef = useRef<THREE.Group>(null);

  // Morph target refs for facial expressions
  const faceRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftEyeWhiteRef = useRef<THREE.Mesh>(null)
  const rightEyeWhiteRef = useRef<THREE.Mesh>(null)
  const mouthRef = useRef<THREE.Group>(null);

  const { faceLandmarks, poseLandmarks, blendShapes, emotion } = useStore();

  // Target rotations for smooth interpolation
  const targetHeadQuat = useRef(new THREE.Quaternion());
  const targetSpineQuat = useRef(new THREE.Quaternion());
  const targetLeftUpperArmQuat = useRef(new THREE.Quaternion());
  const targetRightUpperArmQuat = useRef(new THREE.Quaternion());

  // Colors from config
  const skinMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: config.skinTone,
    roughness: 0.8,
    metalness: 0.0,
  }), [config.skinTone]);

  const hairMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: config.hairColor,
    roughness: 0.9,
  }), [config.hairColor]);

  const eyeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: config.eyeColor,
    roughness: 0.2,
    metalness: 0.1,
  }), [config.eyeColor]);

  const clothTopMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: config.topColor,
    roughness: 0.7,
  }), [config.topColor]);

  const clothBottomMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: config.bottomColor,
    roughness: 0.7,
  }), [config.bottomColor]);

  // Animation loop: apply landmark data to bones each frame
  useFrame((state, delta) => {
    const lerpSpeed = 8 * delta; // Smooth lerp speed

    // ── HEAD ROTATION from face landmarks ──
    if (faceLandmarks?.landmarks && faceLandmarks.landmarks.length > 400) {
      const headQuat = extractHeadRotation(faceLandmarks.landmarks);
      targetHeadQuat.current.copy(headQuat);
    }

    if (headRef.current) {
      headRef.current.quaternion.slerp(targetHeadQuat.current, lerpSpeed);
    }

    // ── POSE / BODY from pose landmarks 
    if (poseLandmarks?.landmarks) {
      const boneTransforms = extractBoneTransforms(poseLandmarks.landmarks);
      if (boneTransforms.hips && hipsRef.current) {
  const q = boneTransforms.hips;
  hipsRef.current.quaternion.slerp(
    new THREE.Quaternion(q.x, q.y, q.z, q.w),
    lerpSpeed
  );
      }

      if (boneTransforms.spine && spineRef.current) {
        const q = boneTransforms.spine;
        targetSpineQuat.current.set(q.x * 0.3, q.y * 0.3, q.z * 0.3, q.w);
        spineRef.current.quaternion.slerp(targetSpineQuat.current, lerpSpeed);
      }
// // ── POSE / BODY from pose landmarks ──go
// if (poseLandmarks?.landmarks) {
//   const boneTransforms = extractBoneTransforms(poseLandmarks.landmarks);

//   HIPS (primary sitting rotation)empty
//   if (boneTransforms.hips && hipsRef.current) {
//     const q = boneTransforms.hips;
//     hipsRef.current.quaternion.slerp(
//       new THREE.Quaternion(q.x, q.y, q.z, q.w),
//       lerpSpeed
//     );
//   }

//   // SPINE (reduced influence)go
  if (boneTransforms.spine && spineRef.current) {
    const q = boneTransforms.spine;

    targetSpineQuat.current.set(
      q.x * 0.05,   // forward bend only
      q.y * 0.08,   // slight twist
      q.z * 0.01,   // almost no side tilt
      q.w
    );

    spineRef.current.quaternion.slerp(
      targetSpineQuat.current,
      lerpSpeed
    );
  }


      if (boneTransforms.leftUpperArm && leftUpperArmRef.current) {
        const q = boneTransforms.leftUpperArm;
        targetLeftUpperArmQuat.current.set(q.x, q.y, q.z, q.w);
        leftUpperArmRef.current.quaternion.slerp(targetLeftUpperArmQuat.current, lerpSpeed * 1.1);
      }

      if (boneTransforms.rightUpperArm && rightUpperArmRef.current) {
        const q = boneTransforms.rightUpperArm;
        targetRightUpperArmQuat.current.set(q.x, q.y, q.z, q.w);
        rightUpperArmRef.current.quaternion.slerp(targetRightUpperArmQuat.current, lerpSpeed * 1.1);
      }

      if (boneTransforms.leftLowerArm && leftLowerArmRef.current) {
        const q = boneTransforms.leftLowerArm;
        leftLowerArmRef.current.quaternion.slerp(
          new THREE.Quaternion(q.x * 0.8, q.y * 0.8, q.z * 0.8, q.w),
          lerpSpeed
        );
      }

      if (boneTransforms.rightLowerArm && rightLowerArmRef.current) {
        const q = boneTransforms.rightLowerArm;
        rightLowerArmRef.current.quaternion.slerp(
          new THREE.Quaternion(q.x * 0.8, q.y * 0.8, q.z * 0.8, q.w),
          lerpSpeed
        );
      }
      // ── LEGS ──
if (boneTransforms.leftUpperLeg && leftUpperLegRef.current) {
  const q = boneTransforms.leftUpperLeg;
  leftUpperLegRef.current.quaternion.slerp(
    new THREE.Quaternion(q.x, q.y, q.z, q.w),
    lerpSpeed
  );
}

if (boneTransforms.rightUpperLeg && rightUpperLegRef.current) {
  const q = boneTransforms.rightUpperLeg;
  rightUpperLegRef.current.quaternion.slerp(
    new THREE.Quaternion(q.x, q.y, q.z, q.w),
    lerpSpeed
  );
}
      
    }
    

    // ── FACIAL EXPRESSIONS from blend shapes ──
    if (blendShapes && faceRef.current) {
      const intensity = config.expressionIntensity;

const blinkL = Math.min(1, blendShapes.eyeBlinkLeft * intensity * 1.6);
const blinkR = Math.min(1, blendShapes.eyeBlinkRight * intensity * 1.6);

const closeL = blinkL > 0.55 ? 1 : blinkL;
const closeR = blinkR > 0.55 ? 1 : blinkR;

if (leftEyeRef.current) {
  leftEyeRef.current.scale.y = THREE.MathUtils.lerp(
    leftEyeRef.current.scale.y,
    Math.max(0.08, 1 - closeL),
    lerpSpeed * 3
  );
}

if (rightEyeRef.current) {
  rightEyeRef.current.scale.y = THREE.MathUtils.lerp(
    rightEyeRef.current.scale.y,
    Math.max(0.08, 1 - closeR),
    lerpSpeed * 3
  );
}     // Mouth opening via jaw
      if (mouthRef.current) {
        const jawScale = 1 + blendShapes.jawOpen * intensity * 0.5;
        mouthRef.current.scale.y = THREE.MathUtils.lerp(
          mouthRef.current.scale.y,
          jawScale,
          lerpSpeed * 2
        );

        // Smile: scale mouth width
        const smileScale = 1 + (blendShapes.mouthSmileLeft + blendShapes.mouthSmileRight) / 2 * intensity * 0.3;
        mouthRef.current.scale.x = THREE.MathUtils.lerp(
          mouthRef.current.scale.x,
          smileScale,
          lerpSpeed
        );
      }
    }

    // Idle breathing animation when not tracking
    if (!poseLandmarks && spineRef.current) {
      const breathe = Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
      spineRef.current.rotation.x = breathe;
    }

    // Idle head bob
    if (!faceLandmarks && headRef.current) {
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  const bodyScale = config.height;
  const bodyWidth = config.bodyType === 'athletic' ? 1.1 : config.bodyType === 'slim' ? 0.85 : 1.0;

  
const spacing = THREE.MathUtils.clamp(config.eyeSpacing ?? 0.5, 0.35, 0.65)
const height  = THREE.MathUtils.clamp(config.faceHeight ?? 1.3, 1.1, 1.6)

const headScale = {
  x: THREE.MathUtils.lerp(0.95, 1.05, spacing),
  y: THREE.MathUtils.lerp(0.95, 1.15, (height - 1.1)),
  z: 1
}
  return (
    <group scale={[bodyWidth, bodyScale, bodyWidth]} position={[0, -1.5, 0]}>
      {/* ── HIPS (root) ── */}
      <group ref={hipsRef} position={[0, 0, 0]}>
        {/* Pelvis */}
        <mesh material={clothBottomMaterial} position={[0, 0.1, 0]}>
          <boxGeometry args={[0.55, 0.25, 0.3]} />
        </mesh>

        {/* ── SPINE ── */}
        <group ref={spineRef} position={[0, 0.2, 0]}>
          {/* Torso */}
          <mesh material={clothTopMaterial} position={[0, 0.4, 0]}>
            <boxGeometry args={[0.52, 0.7, 0.28]} />
          </mesh>

          {/* Shoulders */}
          <mesh material={clothTopMaterial} position={[0, 0.75, 0]}>
            <boxGeometry args={[0.65, 0.15, 0.28]} />
          </mesh>

          {/* ── LEFT ARM ── */}
          <group ref={leftUpperArmRef} position={[-0.38, 0.65, 0]}>
            <mesh material={clothTopMaterial} position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
            </mesh>
            <group ref={leftLowerArmRef} position={[0, -0.42, 0]}>
              <mesh material={skinMaterial} position={[0, -0.18, 0]}>
                <capsuleGeometry args={[0.07, 0.28, 4, 8]} />
              </mesh>
              {/* Hand */}
              <mesh material={skinMaterial} position={[0, -0.38, 0]}>
                <boxGeometry args={[0.14, 0.12, 0.06]} />
              </mesh>
            </group>
          </group>

          {/* ── RIGHT ARM ── */}
          <group ref={rightUpperArmRef} position={[0.38, 0.65, 0]}>
            <mesh material={clothTopMaterial} position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
            </mesh>
            <group ref={rightLowerArmRef} position={[0, -0.42, 0]}>
              <mesh material={skinMaterial} position={[0, -0.18, 0]}>
                <capsuleGeometry args={[0.07, 0.28, 4, 8]} />
              </mesh>
              <mesh material={skinMaterial} position={[0, -0.38, 0]}>
                <boxGeometry args={[0.14, 0.12, 0.06]} />
              </mesh>
            </group>
          </group>

          {/* ── NECK ── */}
          <group ref={neckRef} position={[0, 0.85, 0]}>
            <mesh material={skinMaterial} position={[0, 0.07, 0]}>
              <capsuleGeometry args={[0.08, 0.1, 4, 8]} />
            </mesh>

            {/* ── HEAD ── */}
            <group ref={headRef} position={[0, 0.2, 0]}
              scale={[headScale.x, headScale.y, headScale.z]}>
              {/* Face base */}
              <mesh ref={faceRef} material={skinMaterial}>
                <sphereGeometry args={[0.22, 32, 32]} />
              </mesh>

              {/* ── EYES ── */}
              {/* <group ref={leftEyeRef} position={[-0.075, 0.05, 0.2]}> */}
              <group
              ref={leftEyeRef}
              position={[
                0.075 * THREE.MathUtils.lerp(0.8, 1.2, config.eyeSpacing ?? 0.5),
                0.05,
                0.2
                ]}
                >
                
                {/* Sclera */}
                
                <mesh ref={leftEyeWhiteRef}>
                  <sphereGeometry args={[0.038, 16, 16]} />
                  <meshStandardMaterial color="white" />
                </mesh>
                {/* Iris */}
                <mesh position={[0, 0, 0.02]}>
                  <sphereGeometry args={[0.022, 16, 16]} />
                  <meshStandardMaterial color={config.eyeColor} />
                </mesh>
                {/* Pupil */}
                <mesh ref={leftPupilRef} position={[0, 0, 0.035]}>
                  <sphereGeometry args={[0.012, 8, 8]} />
                  <meshStandardMaterial color="#0a0a0a" />
                </mesh>
              </group>

              <group ref={rightEyeRef} position={[-0.075, 0.05, 0.2]}>
                <mesh ref={rightEyeWhiteRef}>
                  <sphereGeometry args={[0.038, 16, 16]} />
                  <meshStandardMaterial color="white" />
                </mesh>
                <mesh position={[0, 0, 0.02]}>
                  <sphereGeometry args={[0.022, 16, 16]} />
                  <meshStandardMaterial color={config.eyeColor} />
                </mesh>
                <mesh ref={rightPupilRef} position={[0, 0, 0.035]}>
                  <sphereGeometry args={[0.012, 8, 8]} />
                  <meshStandardMaterial color="#0a0a0a" />
                </mesh>
              </group>

              {/* Nose */}
              <mesh material={skinMaterial} position={[0, -0.03, 0.2]}>
                <sphereGeometry args={[0.025, 8, 8]} />
              </mesh>

              {/* Mouth */}
              <group ref={mouthRef} position={[0, -0.1, 0.18]}>
                {/* Upper lip */}
                <mesh position={[0, 0.012, 0]}>
                  <boxGeometry args={[0.1, 0.02, 0.01]} />
                  <meshStandardMaterial color="#c47060" />
                </mesh>
                {/* Lower lip */}
                <mesh position={[0, -0.012, 0]}>
                  <boxGeometry args={[0.1, 0.024, 0.01]} />
                  <meshStandardMaterial color="#c47060" />
                </mesh>
              </group>

              {/* HAIR */}
              {config.hairStyle !== 'bald' && (
                <mesh material={hairMaterial} position={[0, 0.12, 0]}>
                  <sphereGeometry args={[0.235, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                </mesh>
              )}

              {/* Long hair */}
              {(config.hairStyle === 'long' || config.hairStyle === 'ponytail') && (
                <mesh material={hairMaterial} position={[0, -0.1, -0.1]}>
                  <boxGeometry args={[0.3, 0.45, 0.08]} />
                </mesh>
              )}

              {/* GLASSES */}
              {config.glasses && config.glassesStyle !== 'none' && (
                <group position={[0, 0.04, 0.22]}>
                  {/* Left lens frame */}
                  <mesh position={[-0.075, 0, 0]}>
                    <torusGeometry args={[0.038, 0.008, 8, 16]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
                  </mesh>
                  {/* Right lens frame */}
                  <mesh position={[0.075, 0, 0]}>
                    <torusGeometry args={[0.038, 0.008, 8, 16]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
                  </mesh>
                  {/* Bridge */}
                  <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <capsuleGeometry args={[0.005, 0.08, 4, 8]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
                  </mesh>
                </group>
              )}

              {/* HAT */}
              {config.hat && config.hatStyle !== 'none' && (
                <group position={[0, 0.2, 0]}>
                  <mesh position={[0, 0.05, 0]}>
                    <cylinderGeometry args={[0.18, 0.22, 0.12, 16]} />
                    <meshStandardMaterial color="#2c2c2c" />
                  </mesh>
                  <mesh position={[0, -0.01, 0]}>
                    <cylinderGeometry args={[0.28, 0.28, 0.03, 16]} />
                    <meshStandardMaterial color="#2c2c2c" />
                  </mesh>
                </group>
              )}
            </group>
          </group>
        </group>

        {/* ── LEGS ── */}
        {/* Left leg */}
     {/* ── LEGS ── */}
      {/* Left leg */}
      <group ref={leftUpperLegRef} position={[-0.16, -0.12, 0]}>
        <mesh material={clothBottomMaterial} position={[0, -0.22, 0]}>
          <capsuleGeometry args={[0.1, 0.32, 4, 8]} />
        </mesh>
        <mesh material={clothBottomMaterial} position={[0, -0.55, 0]}>
          <capsuleGeometry args={[0.085, 0.3, 4, 8]} />
        </mesh>
        <mesh position={[0, -0.75, -0.04]} rotation={[0, Math.PI, 0]}>
          <boxGeometry args={[0.14, 0.08, 0.22]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      </group>

      {/* Right leg */}
      <group ref={rightUpperLegRef} position={[0.16, -0.12, 0]}>
        <mesh material={clothBottomMaterial} position={[0, -0.22, 0]}>
          <capsuleGeometry args={[0.1, 0.32, 4, 8]} />
        </mesh>
        <mesh material={clothBottomMaterial} position={[0, -0.55, 0]}>
          <capsuleGeometry args={[0.085, 0.3, 4, 8]} />
        </mesh>
        <mesh position={[0, -0.75, -0.04]} rotation={[0, Math.PI, 0]}>
          <boxGeometry args={[0.14, 0.08, 0.22]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      </group>

    </group> {/* closes hipsRef group */}
  </group>  
  );
}

