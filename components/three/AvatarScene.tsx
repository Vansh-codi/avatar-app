// 'use client';

// import { Suspense } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls } from '@react-three/drei/core/OrbitControls';
// import { Environment } from '@react-three/drei/core/Environment';
// import { ContactShadows } from '@react-three/drei/core/ContactShadows';
// import { Grid } from '@react-three/drei/core/Grid';
// import Avatar3D from './Avatar3D';
// import { useStore } from '@/lib/store';
// import { motion } from 'framer-motion';

// export default function AvatarScene() {
//   const { avatarConfig, theme, emotion } = useStore();

//   const emotionColors: Record<string, string> = {
//     happy: '#FFE066',
//     sad: '#6699CC',
//     angry: '#FF6B6B',
//     surprised: '#A29BFE',
//     neutral: '#4ECDC4',
//     disgusted: '#55EFC4',
//     fearful: '#FDCB6E',
//   };

//   const ambientColor = emotion
//     ? emotionColors[emotion.dominant] || '#4ECDC4'
//     : '#4ECDC4';

//   return (
//     <motion.div
//       className="w-full h-full relative"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.8 }}
//     >
//       {/* Background Gradient Wrapper */}
//       <div
//         className="w-full h-full"
//         style={{
//           background:
//             theme === "dark"
//               ? `
//                 radial-gradient(800px 400px at 20% 10%, rgba(139,92,246,0.18), transparent),
//                 radial-gradient(800px 400px at 80% 90%, rgba(34,211,238,0.14), transparent),
//                 #020617
//               `
//               : `
//                 radial-gradient(700px 350px at 20% 10%, rgba(99,102,241,0.12), transparent),
//                 radial-gradient(700px 350px at 80% 90%, rgba(14,165,233,0.12), transparent),
//                 linear-gradient(to bottom, #f8fafc, #eef2f7)
//               `,
//         }}
//       >
//         <Canvas
//           camera={{ position: [0, 0.5, 3.5], fov: 45, near: 0.1, far: 100 }}
//           shadows
//           gl={{ preserveDrawingBuffer: true }}
         
//           style={{ background: "transparent" }}
//         >
//           {/* Base ambient */}
//           <ambientLight intensity={0.28} color="#c7d2fe" />

//           {/* Key light */}
//           <directionalLight
//             position={[2, 4, 3]}
//             intensity={1.05}
//             castShadow
//             shadow-mapSize={[2048, 2048]}
//             color="#fff5e0"
//           />

//           {/* Fill light */}
//           <directionalLight
//             position={[-2, 2, -1]}
//             intensity={0.35}
//             color="#c0d8ff"
//           />

//           {/* Emotion glow */}
//           <pointLight
//             position={[0, 1.5, 1]}
//             intensity={theme === "dark" ? 0.7 : 0.4}
//             color={ambientColor}
//             distance={5}
//           />

//           {/* Rim light */}
//           <directionalLight
//             position={[0, 0, -3]}
//             intensity={0.25}
//             color="#8080ff"
//           />

//           {/* Framer glow lights */}
//           <pointLight position={[0, 1.6, 1]} intensity={1.1} color="#8b5cf6" distance={6} />
//           <pointLight position={[1.4, 0.5, -1]} intensity={0.75} color="#22d3ee" distance={5} />
//           <pointLight position={[-1.4, 0.8, -0.5]} intensity={0.55} color="#6366f1" distance={4} />

//           <Environment files="/hdr/dikhololo_night_4k.hdr" />

//           <Suspense fallback={<LoadingMesh />}>
//             <Avatar3D config={avatarConfig} />
//           </Suspense>

//           <ContactShadows
//             position={[0, -2.9, 0]}
//             opacity={0.3}
//             scale={4}
//             blur={2}
//             far={3}
//           />

//           <Grid
//             position={[0, -2.9, 0]}
//             args={[10, 10]}
//             cellSize={0.5}
//             cellThickness={0.3}
//             cellColor={theme === "dark" ? "#333355" : "#aaaacc"}
//             sectionSize={2}
//             sectionThickness={0.8}
//             sectionColor={theme === "dark" ? "#5555aa" : "#8888dd"}
//             fadeDistance={8}
//             fadeStrength={1}
//           />

//           <OrbitControls
//             enablePan={false}
//             minDistance={1.5}
//             maxDistance={6}
//             maxPolarAngle={Math.PI * 0.85}
//             target={[0, 0, 0]}
//             enableDamping
//             dampingFactor={0.05}
//           />
//         </Canvas>

//         {/* Emotion badge */}
//         {emotion && emotion.dominant !== "neutral" && (
//           <motion.div
//             className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
//             style={{
//               background: `${ambientColor}22`,
//               border: `1px solid ${ambientColor}66`,
//               color: ambientColor,
//             }}
//             initial={{ scale: 0.8, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             key={emotion.dominant}
//           >
//             {emotion.dominant}
//           </motion.div>
//         )}
//       </div>
//     </motion.div>
//   );
// }

// function LoadingMesh() {
//   return (
//     <mesh>
//       <sphereGeometry args={[0.5, 16, 16]} />
//       <meshStandardMaterial color="#4ECDC4" wireframe />
//     </mesh>
//   );
// }



'use client';

import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei/core/OrbitControls';
import { Environment } from '@react-three/drei/core/Environment';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';
import { Grid } from '@react-three/drei/core/Grid';
import * as THREE from 'three';
import Avatar3D from './Avatar3D';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';

// ── Scrolling grid that animates when walking is detected ──

function ScrollingGrid({ theme }: { theme: string }) {
  const offsetRef    = useRef(0);
  const speedRef     = useRef(0);
  const gridGroupRef = useRef<THREE.Group>(null);
  const { poseLandmarks } = useStore();

  useFrame(() => {
    if (!gridGroupRef.current) return;

    const p = poseLandmarks?.landmarks;
    let targetSpeed = 0;

    if (p) {
      const leftAnkle  = p[27];
      const rightAnkle = p[28];
      const leftKnee   = p[25];
      const rightKnee  = p[26];

      const leftVis  = leftAnkle?.visibility  ?? 0;
      const rightVis = rightAnkle?.visibility ?? 0;

      if (
        leftAnkle && rightAnkle &&
        leftKnee  && rightKnee  &&
        leftVis  > 0.5 &&
        rightVis > 0.5
      ) {
        // Ankle height difference = stride detection
        const ankleDiff = Math.abs(leftAnkle.y - rightAnkle.y);

        // Knee height difference = confirms actual stepping
        const kneeDiff  = Math.abs(leftKnee.y - rightKnee.y);

        // Both must be significant — eliminates standing sway
        const isWalking = ankleDiff > 0.04 && kneeDiff > 0.02;

        if (isWalking) {
          // Scale speed to stride amplitude, keep it subtle
          const strideIntensity = (ankleDiff - 0.04) + (kneeDiff - 0.02);
          targetSpeed = THREE.MathUtils.clamp(strideIntensity * 0.8, 0, 0.025);
        }
      }
    }

    // Smooth ease in / ease out — 0.06 = slow ramp, feels natural
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, 0.06);

    // Only update position if actually moving (avoids micro-jitter at rest)
    if (speedRef.current > 0.0001) {
      offsetRef.current += speedRef.current;
      gridGroupRef.current.position.z = offsetRef.current % 0.5;
    }
  });

  return (
    <group ref={gridGroupRef}>
      <Grid
        position={[0, -2.9, 0]}
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.3}
        cellColor={theme === 'dark' ? '#333355' : '#aaaacc'}
        sectionSize={2}
        sectionThickness={0.8}
        sectionColor={theme === 'dark' ? '#5555aa' : '#8888dd'}
        fadeDistance={8}
        fadeStrength={1}
      />
    </group>
  );
}
export default function AvatarScene() {
  const { avatarConfig, theme, emotion } = useStore();

  const emotionColors: Record<string, string> = {
    happy:     '#FFE066',
    sad:       '#6699CC',
    angry:     '#FF6B6B',
    surprised: '#A29BFE',
    neutral:   '#4ECDC4',
    disgusted: '#55EFC4',
    fearful:   '#FDCB6E',
  };

  const ambientColor = emotion
    ? emotionColors[emotion.dominant] || '#4ECDC4'
    : '#4ECDC4';

  return (
    <motion.div
      className="w-full h-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Gradient Wrapper */}
      <div
        className="w-full h-full"
        style={{
          background:
            theme === 'dark'
              ? `
                radial-gradient(800px 400px at 20% 10%, rgba(139,92,246,0.18), transparent),
                radial-gradient(800px 400px at 80% 90%, rgba(34,211,238,0.14), transparent),
                #020617
              `
              : `
                radial-gradient(700px 350px at 20% 10%, rgba(99,102,241,0.12), transparent),
                radial-gradient(700px 350px at 80% 90%, rgba(14,165,233,0.12), transparent),
                linear-gradient(to bottom, #f8fafc, #eef2f7)
              `,
        }}
      >
        <Canvas
          camera={{ position: [0, 0.5, 3.5], fov: 45, near: 0.1, far: 100 }}
          shadows
          gl={{ preserveDrawingBuffer: true }}
          style={{ background: 'transparent' }}
        >
          {/* Base ambient */}
          <ambientLight intensity={0.28} color="#c7d2fe" />

          {/* Key light */}
          <directionalLight
            position={[2, 4, 3]}
            intensity={1.05}
            castShadow
            shadow-mapSize={[2048, 2048]}
            color="#fff5e0"
          />

          {/* Fill light */}
          <directionalLight
            position={[-2, 2, -1]}
            intensity={0.35}
            color="#c0d8ff"
          />

          {/* Emotion glow */}
          <pointLight
            position={[0, 1.5, 1]}
            intensity={theme === 'dark' ? 0.7 : 0.4}
            color={ambientColor}
            distance={5}
          />

          {/* Rim light */}
          <directionalLight
            position={[0, 0, -3]}
            intensity={0.25}
            color="#8080ff"
          />

          {/* Framer glow lights */}
          <pointLight position={[0,    1.6,  1]}   intensity={1.1}  color="#8b5cf6" distance={6} />
          <pointLight position={[1.4,  0.5, -1]}   intensity={0.75} color="#22d3ee" distance={5} />
          <pointLight position={[-1.4, 0.8, -0.5]} intensity={0.55} color="#6366f1" distance={4} />

          <Environment files="/hdr/dikhololo_night_4k.hdr" />

          <Suspense fallback={<LoadingMesh />}>
            <Avatar3D config={avatarConfig} />
          </Suspense>

          <ContactShadows
            position={[0, -2.9, 0]}
            opacity={0.3}
            scale={4}
            blur={2}
            far={3}
          />

          {/* Scrolling grid — replaces static Grid */}
          <ScrollingGrid theme={theme} />

          <OrbitControls
            enablePan={false}
            minDistance={1.5}
            maxDistance={6}
            maxPolarAngle={Math.PI * 0.85}
            target={[0, 0, 0]}
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>

        {/* Emotion badge */}
        {emotion && emotion.dominant !== 'neutral' && (
          <motion.div
            className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{
              background: `${ambientColor}22`,
              border:     `1px solid ${ambientColor}66`,
              color:       ambientColor,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            key={emotion.dominant}
          >
            {emotion.dominant}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function LoadingMesh() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#4ECDC4" wireframe />
    </mesh>
  );
}