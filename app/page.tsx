// 'use client';
// import Hero3DBackground from "@/components/three/Hero3DBackground";
// import { useRef, useState, useEffect } from 'react';
// import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
// import { useRouter } from 'next/navigation';

// export default function PremiumLandingPage() {
//   const router = useRouter();
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [activePlanet, setActivePlanet] = useState<string | null>(null);
//   // Spotlight tracking
//   const mouseX = useMotionValue(0);
//   const mouseY = useMotionValue(0);
  
//   // Smooth spring physics for the spotlight following the cursor
//   const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
//   const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });
  
//   const spotlightBackground = useTransform(
//     [springX, springY],
//     ([x, y]) => `radial-gradient(800px circle at ${x}px ${y}px, rgba(0, 255, 200, 0.08), transparent 50%)`
//   );

//   const maskImage = useTransform(
//     [springX, springY],
//     ([x, y]) => `radial-gradient(350px circle at ${x}px ${y}px, black 20%, transparent 100%)`
//   );
  
//   const [isHovering, setIsHovering] = useState(false);
//   const [isExploding, setIsExploding] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//     // Move spotlight to center initially
//     mouseX.set(typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
//     mouseY.set(typeof window !== 'undefined' ? window.innerHeight / 2 : 500);
//   }, [mouseX, mouseY]);

//   function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
//     if (!containerRef.current) return;
//     const rect = containerRef.current.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
//     mouseX.set(x);
//     mouseY.set(y);
//   }

//   function handleNavigate() {
//     setIsExploding(true);
//     setTimeout(() => {
//       router.push('/auth/login');
//     }, 800);
//   }

//   // Prevent hydration mismatch for mouse position reliant renders
//   if (!mounted) {
//     return (
//       <div className="min-h-screen bg-[#050510] flex items-center justify-center">
//         <motion.div 
//           animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
//           transition={{ repeat: Infinity, duration: 2 }}
//           className="text-4xl"
//         >
//           🎭
//         </motion.div>
//       </div>
//     );
//   }

//   return (
 
//         <div 
//   ref={containerRef}
//   onMouseMove={handleMouseMove}
//   className={`relative min-h-screen overflow-hidden transition-opacity duration-1000 ${isExploding ? 'opacity-0' : 'opacity-100'}`}
// >

//   {/* 3D scene */}
//   <div className="absolute inset-0 z-10">
//     <Hero3DBackground setActive={setActivePlanet}/>
//   </div>

//   {/* grid + blobs BELOW 3D */}
//   <div className="absolute inset-0 z-[1] pointer-events-none">   
//     {/* Repeating grid */}
//     <div 
//       className="absolute inset-0 opacity-[0.03]" 
//       style={{
//         backgroundImage:
//           'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
//         backgroundSize: '64px 64px'
//       }} 
//     />
//         {/* Blobs */}
//         <motion.div 
//           className="absolute top-[20%] left-[15%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px]"
//           animate={{ rotate: 360, scale: [1, 1.2, 1], x: [0, 50, 0] }}
//           transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
//         />
//         <motion.div 
//           className="absolute bottom-[20%] right-[15%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"
//           animate={{ rotate: -360, scale: [1, 1.3, 1], x: [0, -50, 0] }}
//           transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
//         />
//       </div>

//       {/* ── 2. Interactive Spotlight Mask ── */}
//       <motion.div
//         className="pointer-events-none absolute inset-0 z-10 opacity-70 mix-blend-screen"
//         style={{ background: spotlightBackground }}
//       />

//       {/* ── 3. Main Hero Content ── */}
//       {/* ── 3. Main Hero Content ── */}
// <div
//   className={`relative z-10 min-h-screen flex flex-col items-center justify-center p-6
//   transition-all duration-700
//   ${activePlanet ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 "}`}
// >
//         <motion.div 
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1, delay: 0.2 }}
//           className="flex flex-col items-center pointer-events-none"
//         >
//           <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-5xl mb-12 shadow-[0_0_80px_rgba(0,255,200,0.3)] border border-white/10 relative cursor-pointer">
//             <motion.div 
//               className="absolute inset-0 rounded-[2rem] border-2 border-cyan-400/50"
//               animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
//               transition={{ repeat: Infinity, duration: 2 }}
//             />
//             🎭
//           </div>
          
//           <div 
//             className="group relative cursor-crosshair pb-4"
//             onMouseEnter={() => setIsHovering(true)}
//             onMouseLeave={() => setIsHovering(false)}
//           >
//             {/* The hidden highly colored text that is revealed via spotlight mask */}
//             <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 leading-tight">
//               Mirror your soul in 3D.
//             </h1>
            
//             {/* The Mask over the text applying the flashlight effect */}
//             <motion.div 
//               className="absolute inset-0 pointer-events-none mix-blend-overlay"
//               style={{
//                 WebkitMaskImage: maskImage,
//                 WebkitMaskRepeat: 'no-repeat'
//               }}
//             >
//               <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter text-white opacity-100 leading-tight">
//                 Mirror your soul in 3D.
//               </h1>
//             </motion.div>
//           </div>

//           <p className="mt-8 text-xl md:text-2xl text-white/50 max-w-3xl text-center font-light leading-relaxed">
//             Create, customize, and animate your digital alter-ego using real-time machine learning and high-fidelity geometry.
//           </p>

//           <div className="mt-16 relative">
//             <AnimatePresence>
//               {isExploding && (
//                 <motion.div 
//                   initial={{ scale: 0, opacity: 1 }}
//                   animate={{ scale: 100, opacity: 0 }}
//                   transition={{ duration: 0.8, ease: "easeIn" }}
//                   className="fixed inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 z-50 pointer-events-none"
//                   style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40 }}
//                 />
//               )}
//             </AnimatePresence>

//             <motion.button
//              style={{ pointerEvents: "auto" }}
//               onClick={handleNavigate}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className="relative px-12 py-5 rounded-[2rem] bg-white text-black font-extrabold text-xl overflow-hidden group shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)]"
//             >
//               <span className="relative z-10 flex items-center gap-3">
//                 Start Creating Now
//                 <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
//               </span>
//               <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//             </motion.button>
//           </div>
//         </motion.div>
//       </div>
// {activePlanet === "sun" && (
//   <motion.div
//     initial={{ opacity: 0, scale: 0.92, y: 20 }}
//     animate={{ opacity: 1, scale: 1, y: 0 }}
//     exit={{ opacity: 0 }}
//     transition={{ duration: 0.45, ease: "easeOut" }}
//     className="absolute inset-0 flex items-center justify-center z-30"
//   >
//     <div className="bg-black/40 backdrop-blur-2xl border border-white/10
//       rounded-3xl p-10 max-w-xl text-white shadow-[0_0_80px_rgba(0,255,200,0.15)]">
      
//       <h2 className="text-4xl font-bold mb-4">
//         Real-Time Digital Twin
//       </h2>

//       <p className="text-white/70 leading-relaxed">
//         Create, customize and animate avatars using face tracking,
//         emotion AI and gesture detection powered by MediaPipe
//         and high-fidelity geometry.
//       </p>
//     </div>
//   </motion.div>
// )}

// {activePlanet === "earth" && (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     className="absolute inset-0 flex items-center justify-center z-30"
//   >
//     <div className="bg-black/40 backdrop-blur-xl border border-white/10
//       rounded-3xl p-8 max-w-lg text-white">
//       Built with Next.js, Three.js, MediaPipe & WebGL
//     </div>
//   </motion.div>
// )}

// {activePlanet === "moon" && (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     className="absolute inset-0 flex items-center justify-center z-30"
//   >
//     <div className="bg-black/40 backdrop-blur-xl border border-white/10
//       rounded-3xl p-8 max-w-lg text-white">
//       Return to landing experience
//     </div>
//   </motion.div>
// )}
//     </div>
//   );
// }


// 'use client';
// import Hero3DBackground from "@/components/three/Hero3DBackground";
// import { useRef, useState, useEffect, useCallback } from 'react';
// import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
// import { useRouter } from 'next/navigation';

// // ── Planet metadata for panels ──
// const PLANET_INFO: Record<string, {
//   tag: string;
//   symbol: string;
//   title: string;
//   description: string;
//   credits: { label: string; value: string }[];
//   stats: { value: string; label: string }[];
//   color: string;
// }> = {
//   sun: {
//     tag: "Central Hub",
//     symbol: "☀",
//     title: "Real-Time Digital Twin",
//     description: "Create, customize, and animate avatars using face tracking, emotion AI, and gesture detection powered by MediaPipe and high-fidelity geometry rendering.",
//     credits: [
//       { label: "Platform", value: "WebGL + WebGPU" },
//       { label: "Framework", value: "Next.js 15" },
//       { label: "Creator", value: "Philosophical Foxes" },
//     ],
//     stats: [
//       { value: "60fps", label: "Render" },
//       { value: "4K", label: "Resolution" },
//       { value: "∞", label: "Worlds" },
//     ],
//     color: "#facc15",
//   },
//   mercury: {
//     tag: "Mercury",
//     symbol: "☿",
//     title: "Motion Capture Engine",
//     description: "Sub-millimeter precision body tracking with 468 facial landmarks. Real-time skeletal rigging driven entirely in-browser.",
//     credits: [
//       { label: "Tech", value: "MediaPipe Holistic" },
//       { label: "Latency", value: "< 8ms" },
//       { label: "Lead", value: "A. Nakamura" },
//     ],
//     stats: [
//       { value: "468", label: "Landmarks" },
//       { value: "<8ms", label: "Latency" },
//       { value: "33", label: "Joints" },
//     ],
//     color: "#a3a3a3",
//   },
//   venus: {
//     tag: "Venus",
//     symbol: "♀",
//     title: "Emotion AI Layer",
//     description: "Detect and mirror 24 distinct micro-expressions in real time. Your avatar feels what you feel — joy, surprise, contemplation, and beyond.",
//     credits: [
//       { label: "Model", value: "Transformer V4" },
//       { label: "Accuracy", value: "97.3%" },
//       { label: "Lead", value: "S. Patel" },
//     ],
//     stats: [
//       { value: "24", label: "Expressions" },
//       { value: "97.3%", label: "Accuracy" },
//       { value: "V4", label: "Model" },
//     ],
//     color: "#fdba74",
//   },
//   earth: {
//     tag: "Earth",
//     symbol: "🌍",
//     title: "Geometry Pipeline",
//     description: "High-fidelity mesh generation with adaptive tessellation. Built on Three.js and custom GLSL shaders for cinematic-quality rendering at 60fps.",
//     credits: [
//       { label: "Engine", value: "Three.js r170" },
//       { label: "Polygons", value: "2M adaptive" },
//       { label: "Lead", value: "M. Chen" },
//     ],
//     stats: [
//       { value: "2M", label: "Polygons" },
//       { value: "60fps", label: "Render" },
//       { value: "r170", label: "Engine" },
//     ],
//     color: "#22d3ee",
//   },
//   mars: {
//     tag: "Mars",
//     symbol: "♂",
//     title: "Voice Synthesis",
//     description: "Clone and modulate your voice with neural TTS. Speak through your avatar in any language with natural prosody and emotional inflection.",
//     credits: [
//       { label: "Tech", value: "Neural TTS v3" },
//       { label: "Languages", value: "42+" },
//       { label: "Lead", value: "R. Okonkwo" },
//     ],
//     stats: [
//       { value: "42+", label: "Languages" },
//       { value: "v3", label: "TTS" },
//       { value: "<50ms", label: "Latency" },
//     ],
//     color: "#fb923c",
//   },
//   jupiter: {
//     tag: "Jupiter",
//     symbol: "♃",
//     title: "World Builder",
//     description: "Procedurally generate immersive environments — studios, stages, alien worlds. Your avatar exists in spaces as expressive as your imagination.",
//     credits: [
//       { label: "Scenes", value: "∞ procedural" },
//       { label: "Engine", value: "Custom GLSL" },
//       { label: "Lead", value: "L. Virtanen" },
//     ],
//     stats: [
//       { value: "∞", label: "Scenes" },
//       { value: "GLSL", label: "Shaders" },
//       { value: "PBR", label: "Materials" },
//     ],
//     color: "#d97706",
//   },
//   saturn: {
//     tag: "Saturn",
//     symbol: "♄",
//     title: "Style Transfer",
//     description: "Apply artistic styles to your avatar in real time — watercolor, cyberpunk, anime, oil painting. Every frame is a masterpiece.",
//     credits: [
//       { label: "Styles", value: "200+ presets" },
//       { label: "Speed", value: "Real-time" },
//       { label: "Lead", value: "J. Torres" },
//     ],
//     stats: [
//       { value: "200+", label: "Styles" },
//       { value: "RT", label: "Speed" },
//       { value: "4K", label: "Output" },
//     ],
//     color: "#a855f7",
//   },
//   neptune: {
//     tag: "Neptune",
//     symbol: "♆",
//     title: "Cloud Streaming",
//     description: "Stream your avatar sessions globally with sub-50ms latency. WebRTC mesh networking for collaborative multi-user experiences.",
//     credits: [
//       { label: "Protocol", value: "WebRTC Mesh" },
//       { label: "Users", value: "100+ per room" },
//       { label: "Lead", value: "K. Andersen" },
//     ],
//     stats: [
//       { value: "100+", label: "Users" },
//       { value: "<50ms", label: "Latency" },
//       { value: "WebRTC", label: "Protocol" },
//     ],
//     color: "#38bdf8",
//   },
// };

// export default function PremiumLandingPage() {
//   const router = useRouter();
//   const containerRef = useRef<HTMLDivElement>(null);

//   // ── Spotlight tracking (from file 2) ──
//   const mouseX = useMotionValue(0);
//   const mouseY = useMotionValue(0);
//   const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
//   const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

//   const spotlightBackground = useTransform(
//     [springX, springY],
//     ([x, y]) => `radial-gradient(800px circle at ${x}px ${y}px, rgba(0, 255, 200, 0.08), transparent 50%)`
//   );
//   const maskImage = useTransform(
//     [springX, springY],
//     ([x, y]) => `radial-gradient(350px circle at ${x}px ${y}px, black 20%, transparent 100%)`
//   );

//   // ── State (file 2 originals + new from file 1) ──
//   const [activePlanet, setActivePlanet] = useState<string | null>(null);
//   const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);
//   const [heroVisible, setHeroVisible] = useState(true);
//   const [isTourActive, setIsTourActive] = useState(false);
//   const [isHovering, setIsHovering] = useState(false);
//   const [isExploding, setIsExploding] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//     mouseX.set(typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
//     mouseY.set(typeof window !== 'undefined' ? window.innerHeight / 2 : 500);
//   }, [mouseX, mouseY]);

//   // ── Handlers (from file 1) ──
//   const handleHover = useCallback((name: string | null) => {
//     if (focusedPlanet) return;
//     setActivePlanet(name);
//     setHeroVisible(!name);
//   }, [focusedPlanet]);

//   const handleFocus = useCallback((name: string) => {
//     setFocusedPlanet(name);
//     setActivePlanet(name);
//     setHeroVisible(false);
//   }, []);

//   const handleBackToOverview = useCallback(() => {
//     setFocusedPlanet(null);
//     setActivePlanet(null);
//     setHeroVisible(true);
//     setIsTourActive(false);
//   }, []);

//   const handleTourStateChange = useCallback((active: boolean) => {
//     setIsTourActive(active);
//     if (active) setHeroVisible(false);
//   }, []);

//   // ── Mouse move handler (from file 2) ──
//   function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
//     if (!containerRef.current) return;
//     const rect = containerRef.current.getBoundingClientRect();
//     mouseX.set(e.clientX - rect.left);
//     mouseY.set(e.clientY - rect.top);
//   }

//   // ── Navigate with explosion (from file 2) ──
//   function handleNavigate() {
//     setIsExploding(true);
//     setTimeout(() => {
//       router.push('/auth/login');
//     }, 800);
//   }

//   const info = activePlanet ? PLANET_INFO[activePlanet] : null;

//   if (!mounted) {
//     return (
//       <div className="min-h-screen bg-[#050510] flex items-center justify-center">
//         <motion.div
//           animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
//           transition={{ repeat: Infinity, duration: 2 }}
//           className="text-4xl"
//         >
//           🎭
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div
//       ref={containerRef}
//       onMouseMove={handleMouseMove}
//       className={`relative min-h-screen overflow-hidden transition-opacity duration-1000 ${isExploding ? 'opacity-0' : 'opacity-100'}`}
//     >
//       {/* ── 3D scene ── */}
//       <div className="absolute inset-0 z-10">
//         <Hero3DBackground setActive={setActivePlanet} />
//       </div>

//       {/* ── Grid + blobs (from file 2) ── */}
//       <div className="absolute inset-0 z-[1] pointer-events-none">
//         <div
//           className="absolute inset-0 opacity-[0.03]"
//           style={{
//             backgroundImage:
//               'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
//             backgroundSize: '64px 64px',
//           }}
//         />
//         <motion.div
//           className="absolute top-[20%] left-[15%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px]"
//           animate={{ rotate: 360, scale: [1, 1.2, 1], x: [0, 50, 0] }}
//           transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
//         />
//         <motion.div
//           className="absolute bottom-[20%] right-[15%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"
//           animate={{ rotate: -360, scale: [1, 1.3, 1], x: [0, -50, 0] }}
//           transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
//         />
//       </div>

//       {/* ── Interactive Spotlight Mask (from file 2) ── */}
//       <motion.div
//         className="pointer-events-none absolute inset-0 z-10 opacity-70 mix-blend-screen"
//         style={{ background: spotlightBackground }}
//       />

//       {/* ── Main Hero Content (from file 2, now controlled by heroVisible) ── */}
//       <div
//         className={`relative z-10 min-h-screen flex flex-col items-center justify-center p-6
//           transition-all duration-700
//           ${!heroVisible ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"}`}
//       >
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1, delay: 0.2 }}
//           className="flex flex-col items-center pointer-events-none"
//         >
//           <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-5xl mb-12 shadow-[0_0_80px_rgba(0,255,200,0.3)] border border-white/10 relative cursor-pointer">
//             <motion.div
//               className="absolute inset-0 rounded-[2rem] border-2 border-cyan-400/50"
//               animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
//               transition={{ repeat: Infinity, duration: 2 }}
//             />
//             🎭
//           </div>

//           <div
//             className="group relative cursor-crosshair pb-4"
//             onMouseEnter={() => setIsHovering(true)}
//             onMouseLeave={() => setIsHovering(false)}
//           >
//             {/* Colored headline */}
//             <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 leading-tight">
//               Mirror your soul in 3D.
//             </h1>
//             {/* Spotlight mask overlay */}
//             <motion.div
//               className="absolute inset-0 pointer-events-none mix-blend-overlay"
//               style={{
//                 WebkitMaskImage: maskImage,
//                 WebkitMaskRepeat: 'no-repeat',
//               }}
//             >
//               <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter text-white opacity-100 leading-tight">
//                 Mirror your soul in 3D.
//               </h1>
//             </motion.div>
//           </div>

//           <p className="mt-8 text-xl md:text-2xl text-white/50 max-w-3xl text-center font-light leading-relaxed">
//             Create, customize, and animate your digital alter-ego using real-time machine learning and high-fidelity geometry.
//           </p>

//           <div className="mt-16 relative">
//             <AnimatePresence>
//               {isExploding && (
//                 <motion.div
//                   initial={{ scale: 0, opacity: 1 }}
//                   animate={{ scale: 100, opacity: 0 }}
//                   transition={{ duration: 0.8, ease: "easeIn" }}
//                   className="fixed inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 z-50 pointer-events-none"
//                   style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40 }}
//                 />
//               )}
//             </AnimatePresence>

//             <motion.button
//               style={{ pointerEvents: "auto" }}
//               onClick={handleNavigate}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className="relative px-12 py-5 rounded-[2rem] bg-white text-black font-extrabold text-xl overflow-hidden group shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)]"
//             >
//               <span className="relative z-10 flex items-center gap-3">
//                 Start Creating Now
//                 <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
//               </span>
//               <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//             </motion.button>
//           </div>
//         </motion.div>
//       </div>

//       {/* ── Hover Panel — center, only while hovering NOT focused (from file 1) ── */}
//       {info && !focusedPlanet && (
//         <div style={{
//           position: "fixed", inset: 0, zIndex: 30,
//           display: "flex", alignItems: "center", justifyContent: "center",
//           pointerEvents: "none",
//           animation: "panelIn 0.45s ease forwards",
//         }}>
//           <div style={{
//             background: "rgba(0,0,0,0.4)",
//             backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
//             border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24,
//             padding: "48px 56px", maxWidth: 560, width: "90%",
//             boxShadow: "0 0 80px rgba(0,255,200,0.12)",
//           }}>
//             <span style={{
//               display: "inline-block", padding: "4px 14px", borderRadius: 20,
//               fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase",
//               letterSpacing: "0.08em", marginBottom: 20,
//               background: `${info.color}30`, color: info.color,
//             }}>
//               {info.symbol} {info.tag}
//             </span>
//             <h2 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: 12, letterSpacing: "-0.02em", color: "#fff" }}>
//               {info.title}
//             </h2>
//             <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.75, fontSize: "1rem", fontWeight: 300 }}>
//               {info.description}
//             </p>
//             <div style={{
//               marginTop: 24, paddingTop: 20,
//               borderTop: "1px solid rgba(255,255,255,0.08)",
//               display: "flex", gap: 24, flexWrap: "wrap",
//             }}>
//               {info.credits.map((c, i) => (
//                 <div key={i} style={{ display: "flex", flexDirection: "column" }}>
//                   <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
//                     {c.label}
//                   </span>
//                   <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
//                     {c.value}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Focus Detail Panel — right-docked with stats (from file 1) ── */}
//       {info && focusedPlanet && (
//         <div style={{
//           position: "fixed", right: 40, top: "50%",
//           transform: "translateY(-50%)", zIndex: 35,
//           maxWidth: 420, width: "90%",
//           animation: "slideInRight 0.6s ease forwards",
//         }}>
//           <div style={{
//             background: "rgba(0,0,0,0.45)",
//             backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
//             border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24,
//             padding: "40px 44px",
//             boxShadow: "0 0 80px rgba(0,255,200,0.1)",
//           }}>
//             <span style={{
//               display: "inline-block", padding: "4px 14px", borderRadius: 20,
//               fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase",
//               letterSpacing: "0.08em", marginBottom: 16,
//               background: `${info.color}25`, color: info.color,
//             }}>
//               {info.symbol} {info.tag}
//             </span>
//             <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em", color: "#fff" }}>
//               {info.title}
//             </h2>
//             <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.75, fontSize: "0.95rem", fontWeight: 300 }}>
//               {info.description}
//             </p>

//             {/* Orbit Stats */}
//             <div style={{ marginTop: 20, display: "flex", gap: 16 }}>
//               {info.stats.map((s, i) => (
//                 <div key={i} style={{
//                   flex: 1, background: "rgba(255,255,255,0.04)",
//                   border: "1px solid rgba(255,255,255,0.06)",
//                   borderRadius: 14, padding: "14px 16px", textAlign: "center",
//                 }}>
//                   <div style={{
//                     fontSize: "1.3rem", fontWeight: 800,
//                     background: "linear-gradient(90deg, #22d3ee, #a855f7)",
//                     WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
//                     backgroundClip: "text",
//                   }}>
//                     {s.value}
//                   </div>
//                   <div style={{
//                     fontSize: "0.6rem", textTransform: "uppercase",
//                     letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginTop: 4,
//                   }}>
//                     {s.label}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Credits */}
//             <div style={{
//               marginTop: 20, paddingTop: 18,
//               borderTop: "1px solid rgba(255,255,255,0.08)",
//               display: "flex", gap: 20, flexWrap: "wrap",
//             }}>
//               {info.credits.map((c, i) => (
//                 <div key={i} style={{ display: "flex", flexDirection: "column" }}>
//                   <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>
//                     {c.label}
//                   </span>
//                   <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
//                     {c.value}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Planet Tour Button (from file 1) ── */}
//       <button
//         onClick={() => {
//           if (isTourActive) {
//             handleBackToOverview();
//           } else {
//             setIsTourActive(true);
//             setHeroVisible(false);
//           }
//         }}
//         style={{
//           position: "fixed", bottom: 32, right: 32,
//           zIndex: 40, padding: "14px 32px", borderRadius: "2rem",
//           background: isTourActive ? "rgba(239,68,68,0.3)" : "rgba(0,0,0,0.5)",
//           backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
//           border: `1px solid ${isTourActive ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.12)"}`,
//           color: "#fff",
//           fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 600,
//           letterSpacing: "0.04em", cursor: "pointer",
//           display: focusedPlanet && !isTourActive ? "none" : "flex",
//           alignItems: "center", gap: 10,
//           opacity: focusedPlanet && !isTourActive ? 0 : 1,
//           transition: "opacity 0.5s ease, transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease",
//           boxShadow: isTourActive ? "0 0 40px rgba(239,68,68,0.15)" : "0 0 40px rgba(0,255,200,0.08)",
//         }}
//         onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
//         onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
//       >
//         <span style={{ fontSize: "1.1rem" }}>{isTourActive ? "■" : "▶"}</span>
//         {isTourActive ? "Stop Tour" : "Planet Tour"}
//       </button>

//       {/* ── Tour Progress Bar (from file 1) ── */}
//       {isTourActive && (
//         <div style={{
//           position: "fixed", bottom: 80, right: 32,
//           zIndex: 40, padding: "10px 20px", borderRadius: "1rem",
//           background: "rgba(0,0,0,0.45)",
//           backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
//           border: "1px solid rgba(255,255,255,0.08)",
//           color: "rgba(255,255,255,0.5)", fontSize: "0.72rem",
//           fontWeight: 500, letterSpacing: "0.06em",
//           textTransform: "uppercase",
//           display: "flex", alignItems: "center", gap: 8,
//           animation: "panelIn 0.45s ease forwards",
//         }}>
//           <span style={{
//             width: 6, height: 6, borderRadius: "50%",
//             background: "#22d3ee",
//             animation: "hintFade 1.5s ease-in-out infinite",
//             display: "inline-block",
//           }} />
//           {activePlanet
//             ? `Exploring ${activePlanet.charAt(0).toUpperCase() + activePlanet.slice(1)}`
//             : "Starting tour…"}
//         </div>
//       )}

//       {/* ── Back to Overview Button (from file 1) ── */}
//       <button
//         onClick={handleBackToOverview}
//         style={{
//           position: "fixed", top: 32, left: "50%",
//           transform: `translateX(-50%) translateY(${focusedPlanet || isTourActive ? "0" : "-20px"})`,
//           zIndex: 40, padding: "14px 40px", borderRadius: "2rem",
//           background: "rgba(0,0,0,0.5)",
//           backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
//           border: "1px solid rgba(255,255,255,0.12)", color: "#fff",
//           fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 600,
//           letterSpacing: "0.04em", cursor: "pointer",
//           display: "flex", alignItems: "center", gap: 10,
//           opacity: focusedPlanet || isTourActive ? 1 : 0,
//           pointerEvents: focusedPlanet || isTourActive ? "auto" : "none",
//           transition: "opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, background 0.3s ease",
//           boxShadow: "0 0 40px rgba(0,255,200,0.08)",
//         }}
//         onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
//         onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.5)"; }}
//       >
//         <span style={{ fontSize: "1.1rem" }}>←</span> Back to Overview
//       </button>

//       {/* ── Planet Label Tooltip (from file 1) ── */}
//       <div id="planet-label" style={{
//         position: "fixed", zIndex: 25, pointerEvents: "none",
//         background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
//         border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
//         padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600,
//         letterSpacing: "0.04em", opacity: 0,
//         transition: "opacity 0.25s", whiteSpace: "nowrap",
//         transform: "translate(-50%, -100%)",
//       }} />

//       {/* ── Bottom Hint (from file 1) ── */}
//       <div style={{
//         position: "fixed", bottom: 32, left: "50%",
//         transform: "translateX(-50%)", zIndex: 20,
//         color: "rgba(255,255,255,0.3)", fontSize: "0.8rem",
//         letterSpacing: "0.1em", textTransform: "uppercase",
//         pointerEvents: "none",
//         animation: "hintFade 3s ease-in-out infinite",
//       }}>
//         Hover over planets to explore · Click a planet to fly in · Hover the Sun to return
//       </div>

//       {/* ── Keyframe animations ── */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
//         @keyframes panelIn {
//           from { opacity: 0; transform: translateY(20px) scale(0.92); }
//           to   { opacity: 1; transform: translateY(0) scale(1); }
//         }
//         @keyframes slideInRight {
//           from { opacity: 0; transform: translateY(-50%) translateX(30px); }
//           to   { opacity: 1; transform: translateY(-50%) translateX(0); }
//         }
//         @keyframes hintFade {
//           0%, 100% { opacity: 0.3; }
//           50%       { opacity: 0.7; }
//         }
//       `}</style>
//     </div>
//   );
// }


// 'use client';
// import Hero3DBackground from "@/components/three/Hero3DBackground";
// import { useRef, useState, useEffect, useCallback } from 'react';
// import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
// import { useRouter } from 'next/navigation';

// // ── Planet metadata for panels ──
// const PLANET_INFO: Record<string, {
//   tag: string;
//   symbol: string;
//   title: string;
//   description: string;
//   credits: { label: string; value: string }[];
//   stats: { value: string; label: string }[];
//   color: string;
// }> = {
//   sun: {
//     tag: "Central Hub", symbol: "☀", title: "Real-Time Digital Twin",
//     description: "Create, customize, and animate avatars using face tracking, emotion AI, and gesture detection powered by MediaPipe and high-fidelity geometry rendering.",
//     credits: [{ label: "Platform", value: "WebGL + WebGPU" }, { label: "Framework", value: "Next.js 15" }, { label: "Creator", value: "Philosophical Foxes" }],
//     stats: [{ value: "60fps", label: "Render" }, { value: "4K", label: "Resolution" }, { value: "∞", label: "Worlds" }],
//     color: "#facc15",
//   },
//   mercury: {
//     tag: "Mercury", symbol: "☿", title: "Motion Capture Engine",
//     description: "Sub-millimeter precision body tracking with 468 facial landmarks. Real-time skeletal rigging driven entirely in-browser.",
//     credits: [{ label: "Tech", value: "MediaPipe Holistic" }, { label: "Latency", value: "< 8ms" }, { label: "Lead", value: "A. Nakamura" }],
//     stats: [{ value: "468", label: "Landmarks" }, { value: "<8ms", label: "Latency" }, { value: "33", label: "Joints" }],
//     color: "#a3a3a3",
//   },
//   venus: {
//     tag: "Venus", symbol: "♀", title: "Emotion AI Layer",
//     description: "Detect and mirror 24 distinct micro-expressions in real time. Your avatar feels what you feel — joy, surprise, contemplation, and beyond.",
//     credits: [{ label: "Model", value: "Transformer V4" }, { label: "Accuracy", value: "97.3%" }, { label: "Lead", value: "S. Patel" }],
//     stats: [{ value: "24", label: "Expressions" }, { value: "97.3%", label: "Accuracy" }, { value: "V4", label: "Model" }],
//     color: "#fdba74",
//   },
//   earth: {
//     tag: "Earth", symbol: "🌍", title: "Geometry Pipeline",
//     description: "High-fidelity mesh generation with adaptive tessellation. Built on Three.js and custom GLSL shaders for cinematic-quality rendering at 60fps.",
//     credits: [{ label: "Engine", value: "Three.js r170" }, { label: "Polygons", value: "2M adaptive" }, { label: "Lead", value: "M. Chen" }],
//     stats: [{ value: "2M", label: "Polygons" }, { value: "60fps", label: "Render" }, { value: "r170", label: "Engine" }],
//     color: "#22d3ee",
//   },
//   mars: {
//     tag: "Mars", symbol: "♂", title: "Voice Synthesis",
//     description: "Clone and modulate your voice with neural TTS. Speak through your avatar in any language with natural prosody and emotional inflection.",
//     credits: [{ label: "Tech", value: "Neural TTS v3" }, { label: "Languages", value: "42+" }, { label: "Lead", value: "R. Okonkwo" }],
//     stats: [{ value: "42+", label: "Languages" }, { value: "v3", label: "TTS" }, { value: "<50ms", label: "Latency" }],
//     color: "#fb923c",
//   },
//   jupiter: {
//     tag: "Jupiter", symbol: "♃", title: "World Builder",
//     description: "Procedurally generate immersive environments — studios, stages, alien worlds. Your avatar exists in spaces as expressive as your imagination.",
//     credits: [{ label: "Scenes", value: "∞ procedural" }, { label: "Engine", value: "Custom GLSL" }, { label: "Lead", value: "L. Virtanen" }],
//     stats: [{ value: "∞", label: "Scenes" }, { value: "GLSL", label: "Shaders" }, { value: "PBR", label: "Materials" }],
//     color: "#d97706",
//   },
//   saturn: {
//     tag: "Saturn", symbol: "♄", title: "Style Transfer",
//     description: "Apply artistic styles to your avatar in real time — watercolor, cyberpunk, anime, oil painting. Every frame is a masterpiece.",
//     credits: [{ label: "Styles", value: "200+ presets" }, { label: "Speed", value: "Real-time" }, { label: "Lead", value: "J. Torres" }],
//     stats: [{ value: "200+", label: "Styles" }, { value: "RT", label: "Speed" }, { value: "4K", label: "Output" }],
//     color: "#a855f7",
//   },
//   neptune: {
//     tag: "Neptune", symbol: "♆", title: "Cloud Streaming",
//     description: "Stream your avatar sessions globally with sub-50ms latency. WebRTC mesh networking for collaborative multi-user experiences.",
//     credits: [{ label: "Protocol", value: "WebRTC Mesh" }, { label: "Users", value: "100+ per room" }, { label: "Lead", value: "K. Andersen" }],
//     stats: [{ value: "100+", label: "Users" }, { value: "<50ms", label: "Latency" }, { value: "WebRTC", label: "Protocol" }],
//     color: "#38bdf8",
//   },
// };

// export default function PremiumLandingPage() {
//   const router = useRouter();
//   const containerRef = useRef<HTMLDivElement>(null);

//   // ── Framer-motion spotlight (drives CSS radial spotlight + title mask) ──
//   const mouseX = useMotionValue(0);
//   const mouseY = useMotionValue(0);
//   const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
//   const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

//   const spotlightBackground = useTransform(
//     [springX, springY],
//     ([x, y]) => `radial-gradient(800px circle at ${x}px ${y}px, rgba(0, 255, 200, 0.08), transparent 50%)`
//   );
//   const maskImage = useTransform(
//     [springX, springY],
//     ([x, y]) => `radial-gradient(350px circle at ${x}px ${y}px, black 20%, transparent 100%)`
//   );

//   // ── State ──
//   const [activePlanet, setActivePlanet]   = useState<string | null>(null);
//   const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);
//   const [heroVisible, setHeroVisible]     = useState(true);
//   const [isTourActive, setIsTourActive]   = useState(false);
//   const [isHovering, setIsHovering]       = useState(false);
//   const [isExploding, setIsExploding]     = useState(false);
//   const [mounted, setMounted]             = useState(false);

//   useEffect(() => {
//     setMounted(true);
//     mouseX.set(typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
//     mouseY.set(typeof window !== 'undefined' ? window.innerHeight / 2 : 500);
//   }, [mouseX, mouseY]);

//   // ── Solar system handlers — forwarded into Hero3DBackground → SolarSystem ──
//   const handleHover = useCallback((name: string | null) => {
//     if (focusedPlanet) return;
//     setActivePlanet(name);
//     setHeroVisible(!name);
//   }, [focusedPlanet]);

//   const handleFocus = useCallback((name: string) => {
//     setFocusedPlanet(name);
//     setActivePlanet(name);
//     setHeroVisible(false);
//   }, []);

//   const handleBackToOverview = useCallback(() => {
//     setFocusedPlanet(null);
//     setActivePlanet(null);
//     setHeroVisible(true);
//     setIsTourActive(false);
//   }, []);

//   const handleTourStateChange = useCallback((active: boolean) => {
//     setIsTourActive(active);
//     if (active) setHeroVisible(false);
//   }, []);

//   // ── Spotlight mouse tracking (framer-motion only — Three.js has its own listener) ──
//   function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
//     if (!containerRef.current) return;
//     const rect = containerRef.current.getBoundingClientRect();
//     mouseX.set(e.clientX - rect.left);
//     mouseY.set(e.clientY - rect.top);
//   }

//   // ── Exploding CTA → router ──
//   function handleNavigate() {
//     setIsExploding(true);
//     setTimeout(() => router.push('/auth/login'), 800);
//   }

//   const info = activePlanet ? PLANET_INFO[activePlanet] : null;

//   if (!mounted) {
//     return (
//       <div className="min-h-screen bg-[#050510] flex items-center justify-center">
//         <motion.div
//           animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
//           transition={{ repeat: Infinity, duration: 2 }}
//           className="text-4xl"
//         >
//           🎭
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div
//       ref={containerRef}
//       onMouseMove={handleMouseMove}
//       className={`relative min-h-screen overflow-hidden transition-opacity duration-1000 ${isExploding ? 'opacity-0' : 'opacity-100'}`}
//     >
//       {/* ── 3D scene — passes all solar system control props down ── */}
//       <div className="absolute inset-0 z-10">
//         <Hero3DBackground
//           setActive={setActivePlanet}
//           onHover={handleHover}
//           onFocus={handleFocus}
//           onBack={handleBackToOverview}
//           focusedPlanet={focusedPlanet}
//           isTourActive={isTourActive}
//           onTourStateChange={handleTourStateChange}
//         />
//       </div>

//       {/* ── Grid + blobs ── */}
//       <div className="absolute inset-0 z-[1] pointer-events-none">
//         <div
//           className="absolute inset-0 opacity-[0.03]"
//           style={{
//             backgroundImage:
//               'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
//             backgroundSize: '64px 64px',
//           }}
//         />
//         <motion.div
//           className="absolute top-[20%] left-[15%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px]"
//           animate={{ rotate: 360, scale: [1, 1.2, 1], x: [0, 50, 0] }}
//           transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
//         />
//         <motion.div
//           className="absolute bottom-[20%] right-[15%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"
//           animate={{ rotate: -360, scale: [1, 1.3, 1], x: [0, -50, 0] }}
//           transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
//         />
//       </div>

//       {/* ── Interactive Spotlight Mask ── */}
//       <motion.div
//         className="pointer-events-none absolute inset-0 z-10 opacity-70 mix-blend-screen"
//         style={{ background: spotlightBackground }}
//       />

//       {/* ── Main Hero Content ── */}
//       <div
//         className={`relative z-10 min-h-screen flex flex-col items-center justify-center p-6
//           transition-all duration-700
//           ${!heroVisible ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"}`}
//       >
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1, delay: 0.2 }}
//           className="flex flex-col items-center pointer-events-none"
//         >
//           <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-5xl mb-12 shadow-[0_0_80px_rgba(0,255,200,0.3)] border border-white/10 relative cursor-pointer">
//             <motion.div
//               className="absolute inset-0 rounded-[2rem] border-2 border-cyan-400/50"
//               animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
//               transition={{ repeat: Infinity, duration: 2 }}
//             />
//             🎭
//           </div>

//           <div
//             className="group relative cursor-crosshair pb-4"
//             onMouseEnter={() => setIsHovering(true)}
//             onMouseLeave={() => setIsHovering(false)}
//           >
//             <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 leading-tight">
//               Mirror your soul in 3D.
//             </h1>
//             <motion.div
//               className="absolute inset-0 pointer-events-none mix-blend-overlay"
//               style={{ WebkitMaskImage: maskImage, WebkitMaskRepeat: 'no-repeat' }}
//             >
//               <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter text-white opacity-100 leading-tight">
//                 Mirror your soul in 3D.
//               </h1>
//             </motion.div>
//           </div>

//           <p className="mt-8 text-xl md:text-2xl text-white/50 max-w-3xl text-center font-light leading-relaxed">
//             Create, customize, and animate your digital alter-ego using real-time machine learning and high-fidelity geometry.
//           </p>

//           <div className="mt-16 relative">
//             <AnimatePresence>
//               {isExploding && (
//                 <motion.div
//                   initial={{ scale: 0, opacity: 1 }}
//                   animate={{ scale: 100, opacity: 0 }}
//                   transition={{ duration: 0.8, ease: "easeIn" }}
//                   className="fixed inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 z-50 pointer-events-none"
//                   style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40 }}
//                 />
//               )}
//             </AnimatePresence>

//             <motion.button
//               style={{ pointerEvents: "auto" }}
//               onClick={handleNavigate}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className="relative px-12 py-5 rounded-[2rem] bg-white text-black font-extrabold text-xl overflow-hidden group shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)]"
//             >
//               <span className="relative z-10 flex items-center gap-3">
//                 Start Creating Now
//                 <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
//               </span>
//               <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//             </motion.button>
//           </div>
//         </motion.div>
//       </div>

//       {/* ── Hover Panel — center, only while hovering NOT focused ── */}
//       {info && !focusedPlanet && (
//         <div style={{
//           position: "fixed", inset: 0, zIndex: 30,
//           display: "flex", alignItems: "center", justifyContent: "center",
//           pointerEvents: "none", animation: "panelIn 0.45s ease forwards",
//         }}>
//           <div style={{
//             background: "rgba(0,0,0,0.4)", backdropFilter: "blur(40px)",
//             WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.1)",
//             borderRadius: 24, padding: "48px 56px", maxWidth: 560, width: "90%",
//             boxShadow: "0 0 80px rgba(0,255,200,0.12)",
//           }}>
//             <span style={{
//               display: "inline-block", padding: "4px 14px", borderRadius: 20,
//               fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase",
//               letterSpacing: "0.08em", marginBottom: 20,
//               background: `${info.color}30`, color: info.color,
//             }}>
//               {info.symbol} {info.tag}
//             </span>
//             <h2 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: 12, letterSpacing: "-0.02em", color: "#fff" }}>
//               {info.title}
//             </h2>
//             <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.75, fontSize: "1rem", fontWeight: 300 }}>
//               {info.description}
//             </p>
//             <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 24, flexWrap: "wrap" }}>
//               {info.credits.map((c, i) => (
//                 <div key={i} style={{ display: "flex", flexDirection: "column" }}>
//                   <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{c.label}</span>
//                   <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{c.value}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Focus Detail Panel — right-docked with stats ── */}
//       {info && focusedPlanet && (
//         <div style={{
//           position: "fixed", right: 40, top: "50%", transform: "translateY(-50%)",
//           zIndex: 35, maxWidth: 420, width: "90%",
//           animation: "slideInRight 0.6s ease forwards",
//         }}>
//           <div style={{
//             background: "rgba(0,0,0,0.45)", backdropFilter: "blur(40px)",
//             WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.1)",
//             borderRadius: 24, padding: "40px 44px", boxShadow: "0 0 80px rgba(0,255,200,0.1)",
//           }}>
//             <span style={{
//               display: "inline-block", padding: "4px 14px", borderRadius: 20,
//               fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase",
//               letterSpacing: "0.08em", marginBottom: 16,
//               background: `${info.color}25`, color: info.color,
//             }}>
//               {info.symbol} {info.tag}
//             </span>
//             <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em", color: "#fff" }}>
//               {info.title}
//             </h2>
//             <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.75, fontSize: "0.95rem", fontWeight: 300 }}>
//               {info.description}
//             </p>
//             <div style={{ marginTop: 20, display: "flex", gap: 16 }}>
//               {info.stats.map((s, i) => (
//                 <div key={i} style={{
//                   flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
//                   borderRadius: 14, padding: "14px 16px", textAlign: "center",
//                 }}>
//                   <div style={{
//                     fontSize: "1.3rem", fontWeight: 800,
//                     background: "linear-gradient(90deg, #22d3ee, #a855f7)",
//                     WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
//                   }}>{s.value}</div>
//                   <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
//                     {s.label}
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 20, flexWrap: "wrap" }}>
//               {info.credits.map((c, i) => (
//                 <div key={i} style={{ display: "flex", flexDirection: "column" }}>
//                   <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>{c.label}</span>
//                   <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{c.value}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Planet Tour Button ── */}
//       <button
//         onClick={() => { isTourActive ? handleBackToOverview() : (setIsTourActive(true), setHeroVisible(false)); }}
//         style={{
//           position: "fixed", bottom: 32, right: 32, zIndex: 40,
//           padding: "14px 32px", borderRadius: "2rem",
//           background: isTourActive ? "rgba(239,68,68,0.3)" : "rgba(0,0,0,0.5)",
//           backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
//           border: `1px solid ${isTourActive ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.12)"}`,
//           color: "#fff", fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 600,
//           letterSpacing: "0.04em", cursor: "pointer",
//           display: focusedPlanet && !isTourActive ? "none" : "flex",
//           alignItems: "center", gap: 10,
//           opacity: focusedPlanet && !isTourActive ? 0 : 1,
//           transition: "opacity 0.5s ease, transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease",
//           boxShadow: isTourActive ? "0 0 40px rgba(239,68,68,0.15)" : "0 0 40px rgba(0,255,200,0.08)",
//         }}
//         onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
//         onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
//       >
//         <span style={{ fontSize: "1.1rem" }}>{isTourActive ? "■" : "▶"}</span>
//         {isTourActive ? "Stop Tour" : "Planet Tour"}
//       </button>

//       {/* ── Tour Progress Bar ── */}
//       {isTourActive && (
//         <div style={{
//           position: "fixed", bottom: 80, right: 32, zIndex: 40,
//           padding: "10px 20px", borderRadius: "1rem",
//           background: "rgba(0,0,0,0.45)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
//           border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)",
//           fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase",
//           display: "flex", alignItems: "center", gap: 8,
//           animation: "panelIn 0.45s ease forwards",
//         }}>
//           <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee", display: "inline-block", animation: "hintFade 1.5s ease-in-out infinite" }} />
//           {activePlanet ? `Exploring ${activePlanet.charAt(0).toUpperCase() + activePlanet.slice(1)}` : "Starting tour…"}
//         </div>
//       )}

//       {/* ── Back to Overview Button ── */}
//       <button
//         onClick={handleBackToOverview}
//         style={{
//           position: "fixed", top: 32, left: "50%",
//           transform: `translateX(-50%) translateY(${focusedPlanet || isTourActive ? "0" : "-20px"})`,
//           zIndex: 40, padding: "14px 40px", borderRadius: "2rem",
//           background: "rgba(0,0,0,0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
//           border: "1px solid rgba(255,255,255,0.12)", color: "#fff",
//           fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 600,
//           letterSpacing: "0.04em", cursor: "pointer",
//           display: "flex", alignItems: "center", gap: 10,
//           opacity: focusedPlanet || isTourActive ? 1 : 0,
//           pointerEvents: focusedPlanet || isTourActive ? "auto" : "none",
//           transition: "opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, background 0.3s ease",
//           boxShadow: "0 0 40px rgba(0,255,200,0.08)",
//         }}
//         onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
//         onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.5)"; }}
//       >
//         <span style={{ fontSize: "1.1rem" }}>←</span> Back to Overview
//       </button>

//       {/* ── Planet Label Tooltip ── */}
//       <div id="planet-label" style={{
//         position: "fixed", zIndex: 25, pointerEvents: "none",
//         background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
//         border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
//         padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600,
//         letterSpacing: "0.04em", opacity: 0, transition: "opacity 0.25s",
//         whiteSpace: "nowrap", transform: "translate(-50%, -100%)",
//       }} />

//       {/* ── Bottom Hint ── */}
//       <div style={{
//         position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
//         zIndex: 20, color: "rgba(255,255,255,0.3)", fontSize: "0.8rem",
//         letterSpacing: "0.1em", textTransform: "uppercase", pointerEvents: "none",
//         animation: "hintFade 3s ease-in-out infinite",
//       }}>
//         Hover over planets to explore · Click a planet to fly in · Hover the Sun to return
//       </div>

//       {/* ── Keyframe animations ── */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
//         @keyframes panelIn {
//           from { opacity: 0; transform: translateY(20px) scale(0.92); }
//           to   { opacity: 1; transform: translateY(0) scale(1); }
//         }
//         @keyframes slideInRight {
//           from { opacity: 0; transform: translateY(-50%) translateX(30px); }
//           to   { opacity: 1; transform: translateY(-50%) translateX(0); }
//         }
//         @keyframes hintFade {
//           0%, 100% { opacity: 0.3; }
//           50%       { opacity: 0.7; }
//         }
//       `}</style>
//     </div>
//   );
// }




'use client';
import Hero3DBackground from "@/components/three/Hero3DBackground";
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const PLANET_INFO: Record<string, {
  tag: string; symbol: string; title: string; description: string;
  credits: { label: string; value: string }[];
  stats: { value: string; label: string }[];
  color: string;
}> = {
  sun: {
    tag: "Central Hub", symbol: "☀", title: "Real-Time Digital Twin",
    description: "Create, customize, and animate avatars using face tracking, emotion AI, and gesture detection powered by MediaPipe and high-fidelity geometry rendering.",
    credits: [{ label: "Platform", value: "WebGL + WebGPU" }, { label: "Framework", value: "Next.js 15" }, { label: "Creator", value: "Philosophical Foxes" }],
    stats: [{ value: "60fps", label: "Render" }, { value: "4K", label: "Resolution" }, { value: "∞", label: "Worlds" }],
    color: "#facc15",
  },
  mercury: {
    tag: "Mercury", symbol: "☿", title: "Motion Capture Engine",
    description: "Sub-millimeter precision body tracking with 468 facial landmarks. Real-time skeletal rigging driven entirely in-browser.",
    credits: [{ label: "Tech", value: "MediaPipe Holistic" }, { label: "Latency", value: "< 8ms" }, { label: "Lead", value: "A. Nakamura" }],
    stats: [{ value: "468", label: "Landmarks" }, { value: "<8ms", label: "Latency" }, { value: "33", label: "Joints" }],
    color: "#a3a3a3",
  },
  venus: {
    tag: "Venus", symbol: "♀", title: "Emotion AI Layer",
    description: "Detect and mirror 24 distinct micro-expressions in real time. Your avatar feels what you feel — joy, surprise, contemplation, and beyond.",
    credits: [{ label: "Model", value: "Transformer V4" }, { label: "Accuracy", value: "97.3%" }, { label: "Lead", value: "S. Patel" }],
    stats: [{ value: "24", label: "Expressions" }, { value: "97.3%", label: "Accuracy" }, { value: "V4", label: "Model" }],
    color: "#fdba74",
  },
  earth: {
    tag: "Earth", symbol: "🌍", title: "Geometry Pipeline",
    description: "High-fidelity mesh generation with adaptive tessellation. Built on Three.js and custom GLSL shaders for cinematic-quality rendering at 60fps.",
    credits: [{ label: "Engine", value: "Three.js r170" }, { label: "Polygons", value: "2M adaptive" }, { label: "Lead", value: "M. Chen" }],
    stats: [{ value: "2M", label: "Polygons" }, { value: "60fps", label: "Render" }, { value: "r170", label: "Engine" }],
    color: "#22d3ee",
  },
  mars: {
    tag: "Mars", symbol: "♂", title: "Voice Synthesis",
    description: "Clone and modulate your voice with neural TTS. Speak through your avatar in any language with natural prosody and emotional inflection.",
    credits: [{ label: "Tech", value: "Neural TTS v3" }, { label: "Languages", value: "42+" }, { label: "Lead", value: "R. Okonkwo" }],
    stats: [{ value: "42+", label: "Languages" }, { value: "v3", label: "TTS" }, { value: "<50ms", label: "Latency" }],
    color: "#fb923c",
  },
  jupiter: {
    tag: "Jupiter", symbol: "♃", title: "World Builder",
    description: "Procedurally generate immersive environments — studios, stages, alien worlds. Your avatar exists in spaces as expressive as your imagination.",
    credits: [{ label: "Scenes", value: "∞ procedural" }, { label: "Engine", value: "Custom GLSL" }, { label: "Lead", value: "L. Virtanen" }],
    stats: [{ value: "∞", label: "Scenes" }, { value: "GLSL", label: "Shaders" }, { value: "PBR", label: "Materials" }],
    color: "#d97706",
  },
  saturn: {
    tag: "Saturn", symbol: "♄", title: "Style Transfer",
    description: "Apply artistic styles to your avatar in real time — watercolor, cyberpunk, anime, oil painting. Every frame is a masterpiece.",
    credits: [{ label: "Styles", value: "200+ presets" }, { label: "Speed", value: "Real-time" }, { label: "Lead", value: "J. Torres" }],
    stats: [{ value: "200+", label: "Styles" }, { value: "RT", label: "Speed" }, { value: "4K", label: "Output" }],
    color: "#a855f7",
  },
  neptune: {
    tag: "Neptune", symbol: "♆", title: "Cloud Streaming",
    description: "Stream your avatar sessions globally with sub-50ms latency. WebRTC mesh networking for collaborative multi-user experiences.",
    credits: [{ label: "Protocol", value: "WebRTC Mesh" }, { label: "Users", value: "100+ per room" }, { label: "Lead", value: "K. Andersen" }],
    stats: [{ value: "100+", label: "Users" }, { value: "<50ms", label: "Latency" }, { value: "WebRTC", label: "Protocol" }],
    color: "#38bdf8",
  },
};

export default function PremiumLandingPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const spotlightBackground = useTransform(
    [springX, springY],
    ([x, y]) => `radial-gradient(800px circle at ${x}px ${y}px, rgba(0, 255, 200, 0.08), transparent 50%)`
  );
  const maskImage = useTransform(
    [springX, springY],
    ([x, y]) => `radial-gradient(350px circle at ${x}px ${y}px, black 20%, transparent 100%)`
  );

  const [activePlanet, setActivePlanet]   = useState<string | null>(null);
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);
  const [heroVisible, setHeroVisible]     = useState(true);
  const [isTourActive, setIsTourActive]   = useState(false);
  const [isExploding, setIsExploding]     = useState(false);
  const [mounted, setMounted]             = useState(false);

  useEffect(() => {
    setMounted(true);
    mouseX.set(typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
    mouseY.set(typeof window !== 'undefined' ? window.innerHeight / 2 : 500);
    // Lock page scroll — wheel goes to 3D scene
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [mouseX, mouseY]);

  const handleHover = useCallback((name: string | null) => {
    if (focusedPlanet) return;
    setActivePlanet(name);
    setHeroVisible(!name);
  }, [focusedPlanet]);

  const handleFocus = useCallback((name: string) => {
    setFocusedPlanet(name);
    setActivePlanet(name);
    setHeroVisible(false);
  }, []);

  const handleBackToOverview = useCallback(() => {
    setFocusedPlanet(null);
    setActivePlanet(null);
    setHeroVisible(true);
    setIsTourActive(false);
  }, []);

  const handleTourStateChange = useCallback((active: boolean) => {
    setIsTourActive(active);
    if (active) setHeroVisible(false);
  }, []);

  // Only track mouse for spotlight — don't preventDefault so 3D canvas gets events too
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  function handleNavigate() {
    setIsExploding(true);
    setTimeout(() => router.push('/auth/login'), 800);
  }

  const info = activePlanet ? PLANET_INFO[activePlanet] : null;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl"
        >🎭</motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative min-h-screen overflow-hidden transition-opacity duration-1000 ${isExploding ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* ── 3D scene — z-0, NO pointer-events restriction so mouse/wheel reach canvas ── */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <Hero3DBackground
          setActive={setActivePlanet}
          onHover={handleHover}
          onFocus={handleFocus}
          onBack={handleBackToOverview}
          focusedPlanet={focusedPlanet}
          isTourActive={isTourActive}
          onTourStateChange={handleTourStateChange}
        />
      </div>

      {/* ── Grid + blobs — pointer-events-none ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <motion.div
          className="absolute top-[20%] left-[15%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px]"
          animate={{ rotate: 360, scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[15%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"
          animate={{ rotate: -360, scale: [1, 1.3, 1], x: [0, -50, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        />
      </div>

      {/* ── Spotlight — pointer-events-none ── */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen"
        style={{ background: spotlightBackground, zIndex: 2 }}
      />

      {/* ── Hero Content — pointer-events-none on wrapper, re-enable on button ── */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-none transition-all duration-700 ${!heroVisible ? "opacity-0 scale-95" : "opacity-100"}`}
        style={{ zIndex: 3 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-5xl mb-12 shadow-[0_0_80px_rgba(0,255,200,0.3)] border border-white/10 relative">
            <motion.div
              className="absolute inset-0 rounded-[2rem] border-2 border-cyan-400/50"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            🎭
          </div>

          <div className="group relative pb-4">
            <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 leading-tight">
              Mirror your soul in 3D.
            </h1>
            <motion.div
              className="absolute inset-0 pointer-events-none mix-blend-overlay"
              style={{ WebkitMaskImage: maskImage, WebkitMaskRepeat: 'no-repeat' }}
            >
              <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter text-white opacity-100 leading-tight">
                Mirror your soul in 3D.
              </h1>
            </motion.div>
          </div>

          <p className="mt-8 text-xl md:text-2xl text-white/50 max-w-3xl text-center font-light leading-relaxed">
            Create, customize, and animate your digital alter-ego using real-time machine learning and high-fidelity geometry.
          </p>

          <div className="mt-16 relative">
            <AnimatePresence>
              {isExploding && (
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 100, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeIn" }}
                  className="fixed inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 z-50 pointer-events-none"
                  style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40 }}
                />
              )}
            </AnimatePresence>

            {/* Re-enable pointer events just for the button */}
            <motion.button
              style={{ pointerEvents: "auto" }}
              onClick={handleNavigate}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-12 py-5 rounded-[2rem] bg-white text-black font-extrabold text-xl overflow-hidden group shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)]"
            >
              <span className="relative z-10 flex items-center gap-3">
                Start Creating Now
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ── Hover Panel (center) — shown when hovering a planet, not focused ── */}
      {info && !focusedPlanet && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 30,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none", animation: "panelIn 0.45s ease forwards",
        }}>
          <div style={{
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24, padding: "48px 56px", maxWidth: 560, width: "90%",
            boxShadow: "0 0 80px rgba(0,255,200,0.12)",
          }}>
            <span style={{
              display: "inline-block", padding: "4px 14px", borderRadius: 20,
              fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.08em", marginBottom: 20,
              background: `${info.color}30`, color: info.color,
            }}>
              {info.symbol} {info.tag}
            </span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: 12, letterSpacing: "-0.02em", color: "#fff" }}>
              {info.title}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.75, fontSize: "1rem", fontWeight: 300 }}>
              {info.description}
            </p>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 24, flexWrap: "wrap" }}>
              {info.credits.map((c, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{c.label}</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Focus Detail Panel (right-docked) ── */}
      {info && focusedPlanet && (
        <div style={{
          position: "fixed", right: 40, top: "50%", transform: "translateY(-50%)",
          zIndex: 35, maxWidth: 420, width: "90%",
          animation: "slideInRight 0.6s ease forwards", pointerEvents: "none",
        }}>
          <div style={{
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24, padding: "40px 44px", boxShadow: "0 0 80px rgba(0,255,200,0.1)",
          }}>
            <span style={{
              display: "inline-block", padding: "4px 14px", borderRadius: 20,
              fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.08em", marginBottom: 16,
              background: `${info.color}25`, color: info.color,
            }}>
              {info.symbol} {info.tag}
            </span>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em", color: "#fff" }}>
              {info.title}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.75, fontSize: "0.95rem", fontWeight: 300 }}>
              {info.description}
            </p>
            <div style={{ marginTop: 20, display: "flex", gap: 16 }}>
              {info.stats.map((s, i) => (
                <div key={i} style={{
                  flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14, padding: "14px 16px", textAlign: "center",
                }}>
                  <div style={{
                    fontSize: "1.3rem", fontWeight: 800,
                    background: "linear-gradient(90deg, #22d3ee, #a855f7)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>{s.value}</div>
                  <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 20, flexWrap: "wrap" }}>
              {info.credits.map((c, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>{c.label}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Planet Tour Button ── */}
      <button
        onClick={() => { isTourActive ? handleBackToOverview() : (setIsTourActive(true), setHeroVisible(false)); }}
        style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 40,
          padding: "14px 32px", borderRadius: "2rem",
          background: isTourActive ? "rgba(239,68,68,0.3)" : "rgba(0,0,0,0.5)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: `1px solid ${isTourActive ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.12)"}`,
          color: "#fff", fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 600,
          letterSpacing: "0.04em", cursor: "pointer",
          display: focusedPlanet && !isTourActive ? "none" : "flex",
          alignItems: "center", gap: 10,
          opacity: focusedPlanet && !isTourActive ? 0 : 1,
          transition: "all 0.3s ease",
          boxShadow: isTourActive ? "0 0 40px rgba(239,68,68,0.15)" : "0 0 40px rgba(0,255,200,0.08)",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
      >
        <span style={{ fontSize: "1.1rem" }}>{isTourActive ? "■" : "▶"}</span>
        {isTourActive ? "Stop Tour" : "Planet Tour"}
      </button>

      {/* ── Tour status indicator ── */}
      {isTourActive && (
        <div style={{
          position: "fixed", bottom: 80, right: 32, zIndex: 40,
          padding: "10px 20px", borderRadius: "1rem",
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)",
          fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 8,
          animation: "panelIn 0.45s ease forwards", pointerEvents: "none",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee", display: "inline-block", animation: "hintFade 1.5s ease-in-out infinite" }} />
          {activePlanet ? `Exploring ${activePlanet.charAt(0).toUpperCase() + activePlanet.slice(1)}` : "Starting tour…"}
        </div>
      )}

      {/* ── Back to Overview Button ── */}
      <button
        onClick={handleBackToOverview}
        style={{
          position: "fixed", top: 32, left: "50%",
          transform: `translateX(-50%) translateY(${focusedPlanet || isTourActive ? "0" : "-20px"})`,
          zIndex: 40, padding: "14px 40px", borderRadius: "2rem",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.12)", color: "#fff",
          fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 600,
          letterSpacing: "0.04em", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10,
          opacity: focusedPlanet || isTourActive ? 1 : 0,
          pointerEvents: focusedPlanet || isTourActive ? "auto" : "none",
          transition: "opacity 0.5s ease, transform 0.5s ease",
          boxShadow: "0 0 40px rgba(0,255,200,0.08)",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.5)"; }}
      >
        <span style={{ fontSize: "1.1rem" }}>←</span> Back to Overview
      </button>

      {/* ── Planet Label Tooltip ── */}
      <div id="planet-label" style={{
        position: "fixed", zIndex: 25, pointerEvents: "none",
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
        padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600,
        letterSpacing: "0.04em", opacity: 0, transition: "opacity 0.25s",
        whiteSpace: "nowrap", transform: "translate(-50%, -100%)",
      }} />

      {/* ── Bottom Hint ── */}
      <div style={{
        position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
        zIndex: 20, color: "rgba(255,255,255,0.3)", fontSize: "0.8rem",
        letterSpacing: "0.1em", textTransform: "uppercase", pointerEvents: "none",
        animation: "hintFade 3s ease-in-out infinite",
      }}>
        Scroll to zoom · Drag to rotate · Hover planets to explore · Click to fly in
      </div>

      <style>{`
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(20px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateY(-50%) translateX(30px); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
        @keyframes hintFade {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}