// // app/dashboard/page.tsx
// // Main editor dashboard — requires authentication

// "use client";

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useStore } from '@/lib/store';
// import AvatarScene from '@/components/three/AvatarScene';
// import { WebcamTracker } from '@/components/ml/WebcamTracker';
// import { CustomizePanel } from '@/components/ui/CustomizePanel';
// import { ExportPanel } from '@/components/ui/ExportPanel';
// import { SavedAvatarsPanel } from '@/components/ui/SavedAvatarsPanel';

// type Panel = 'tracking' | 'customize' | 'export' | 'saved';

// const TABS: { id: Panel; icon: string; label: string }[] = [
//   { id: 'tracking', icon: '📷', label: 'Track' },
//   { id: 'customize', icon: '🎨', label: 'Style' },
//   { id: 'export', icon: '📦', label: 'Export' },
//   { id: 'saved', icon: '💾', label: 'Saved' },
// ];

// export default function DashboardPage() {
//   const { user, setUser, theme, toggleTheme, activePanel, setActivePanel } = useStore();
//   const router = useRouter();
//   const [isLoggingOut, setIsLoggingOut] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Redirect unauthenticated users — only after mount to avoid flicker
//   useEffect(() => {
//     // Prevent redirecting to login if we are in the middle of a logout redirect to home
//     if (mounted && !user && !isLoggingOut) router.push('/auth/login');
//   }, [user, router, mounted, isLoggingOut]);

//   const handleLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       await fetch('/api/auth/logout', { method: 'POST' });
//     } finally {
//       setUser(null);
//       router.push('/');
//     }
//   };

//   // Show nothing until mounted (prevents Zustand hydration flicker)
//   if (!mounted) {
//     return (
//       <div className="h-screen flex flex-col mesh-bg overflow-hidden items-center justify-center">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.3 }}
//           className="flex flex-col items-center gap-4"
//         >
//           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/30">
//             🎭
//           </div>
//           <div className="flex items-center gap-2 text-white/30 text-sm font-mono">
//             <motion.span
//               animate={{ rotate: 360 }}
//               transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
//               className="inline-block w-4 h-4 border-2 border-white/20 border-t-cyan-400 rounded-full"
//             />
//             Loading session…
//           </div>
//         </motion.div>
//       </div>
//     );
//   }

//   if (!user) return null;

//   return (
// <motion.div
// initial={{ opacity: 0 }}
// animate={{ opacity: 1 }}
// transition={{ duration: 0.35, ease: 'easeOut' }}
// className="h-screen flex flex-col mesh-bg overflow-hidden"

// >

// {/* ── TOP NAV ── */}

//   <nav
//     className="
//     sticky top-0 z-50
//     h-14
//     flex items-center justify-between px-6
//     backdrop-blur-2xl
//     border-b border-black/10 dark:border-white/10
//     bg-white/60 dark:bg-[#020617]/60
//   "
//   >
//     {/* Logo */}
//     <div className="flex items-center gap-2 min-w-0">
//       <span className="text-xl">🎭</span>
//       <span className="font-display text-gray-900 dark:text-white hidden sm:block">
//         AvatarAI
//       </span>
//     </div>

// ```
// {/* Tabs */}
// <div className="flex items-center gap-1 flex-1 justify-center">
//   {TABS.map(tab => (
//     <button
//       key={tab.id}
//       onClick={() => setActivePanel(tab.id)}
//       className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200
//         ${
//           activePanel === tab.id
//             ? 'text-gray-900 dark:text-white'
//             : 'text-gray-500 hover:text-gray-900 dark:text-white/40 dark:hover:text-white/70'
//         }`}
//     >
//       {activePanel === tab.id && (
//         <motion.span
//           layoutId="tab-bg"
//           className="absolute inset-0 rounded-lg bg-white/10 border border-white/15"
//           transition={{ type: 'spring', stiffness: 400, damping: 35 }}
//         />
//       )}
//       <span className="relative z-10">{tab.icon}</span>
//       <span className="relative z-10 hidden sm:block">{tab.label}</span>
//     </button>
//   ))}
// </div>

// {/* Right controls */}
// <div className="flex items-center gap-2">
//   {/* Theme toggle */}
//   <button
//     onClick={toggleTheme}
//     className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-all
//       flex items-center justify-center text-sm border border-white/8"
//     title="Toggle theme"
//   >
//     {theme === 'dark' ? '☀️' : '🌙'}
//   </button>

//   {/* User info */}
//   <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8">
//     <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
//       {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
//     </div>
//     <span className="text-xs text-gray-600 dark:text-white/60 max-w-24 truncate">
//       {user.name || user.email}
//     </span>
//   </div>

//   <button
//     onClick={handleLogout}
//     disabled={isLoggingOut}
//     className="px-3 py-1.5 rounded-lg text-xs 
//       text-gray-500 dark:text-white/40 
//       hover:text-gray-900 dark:hover:text-white/70
//       hover:bg-white/5 transition-all 
//       border border-transparent 
//       hover:border-white/10 disabled:opacity-40"
//   >
//     {isLoggingOut ? (
//       <span className="flex items-center gap-1.5">
//         <motion.span
//           animate={{ rotate: 360 }}
//           transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
//           className="inline-block w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full"
//         />
//         Signing out…
//       </span>
//     ) : 'Logout'}
//   </button>
// </div>


//   </nav>

// {/* ── MAIN LAYOUT ── */}

//   <div className="flex-1 flex overflow-hidden">
//     {/* LEFT — Side panel */}
//     <aside
//       className="
//         w-[480px]
//         flex-shrink-0
//         border-r border-white/10
//         backdrop-blur-2xl
//         relative
//         overflow-hidden
//         bg-[#030712]
//       "
//     >
//       <div className="absolute inset-0 -z-10">
//         <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-purple-500/25 blur-[130px] animate-pulse" />
//         <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-cyan-400/25 blur-[130px] animate-pulse" />
//       </div>


//   <div className="flex-1 overflow-y-auto p-4 relative">
//     <AnimatePresence mode="wait">
//       <motion.div
//         key={activePanel}
//         initial={{ opacity: 0, y: 12 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -8 }}
//         transition={{ duration: 0.2, ease: 'easeOut' }}
//         className="h-full"
//       >
//         {activePanel === 'tracking' && <WebcamTracker />}
//         {activePanel === 'customize' && <CustomizePanel />}
//         {activePanel === 'export' && <ExportPanel />}
//         {activePanel === 'saved' && <SavedAvatarsPanel />}
//       </motion.div>
//     </AnimatePresence>
//   </div>
// </aside>

// {/* RIGHT — 3D Scene */}
// <main className="flex-1 relative overflow-hidden">
//   <AvatarScene />

//   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2
//     text-xs text-white/20 font-mono pointer-events-none select-none">
//     <span>Drag to rotate</span>
//     <span>·</span>
//     <span>Scroll to zoom</span>
//   </div>
// </main>


//   </div>
// </motion.div>
// );
//  }


// app/dashboard/page.tsx
// Main editor dashboard — requires authentication
// app/dashboard/page.tsx
// Main editor dashboard — requires authentication

// "use client";

// import { useEffect, useState, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
// import { useStore } from '@/lib/store';
// import AvatarScene from '@/components/three/AvatarScene';
// import { WebcamTracker } from '@/components/ml/WebcamTracker';
// import { CustomizePanel } from '@/components/ui/CustomizePanel';
// import { ExportPanel } from '@/components/ui/ExportPanel';
// import { SavedAvatarsPanel } from '@/components/ui/SavedAvatarsPanel';

// type Panel = 'tracking' | 'customize' | 'export' | 'saved';

// const TABS: { id: Panel; icon: string; label: string; particleColor: string; emoji: string }[] = [
//   { id: 'tracking',  icon: '📷', label: 'Track',  particleColor: '#06b6d4', emoji: '📷' },
//   { id: 'customize', icon: '🎨', label: 'Style',  particleColor: '#a855f7', emoji: '🎨' },
//   { id: 'export',    icon: '📦', label: 'Export', particleColor: '#f97316', emoji: '🔥' },
//   { id: 'saved',     icon: '💾', label: 'Saved',  particleColor: '#22c55e', emoji: '⭐' },
// ];

// // ── Particle burst on tab click ──────────────────────────────────────────────
// interface Particle {
//   id: number;
//   x: number;
//   y: number;
//   vx: number;
//   vy: number;
//   color: string;
//   emoji?: string;
//   size: number;
// }

// function ParticleBurst({ particles }: { particles: Particle[] }) {
//   return (
//     <div className="pointer-events-none fixed inset-0 z-[999]">
//       <AnimatePresence>
//         {particles.map(p => (
//           <motion.div
//             key={p.id}
//             initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
//             animate={{
//               x: p.x + p.vx * 80,
//               y: p.y + p.vy * 80,
//               opacity: 0,
//               scale: 0,
//             }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.7, ease: [0.2, 0, 0.8, 1] }}
//             style={{
//               position: 'absolute',
//               fontSize: p.emoji ? 14 : p.size,
//               color: p.color,
//               fontWeight: 700,
//               lineHeight: 1,
//               userSelect: 'none',
//             }}
//           >
//             {p.emoji || '●'}
//           </motion.div>
//         ))}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ── Main Component ────────────────────────────────────────────────────────────
// export default function DashboardPage() {
//   const { user, setUser, theme, toggleTheme, activePanel, setActivePanel } = useStore();
//   const router = useRouter();
//   const [isLoggingOut, setIsLoggingOut] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const [particles, setParticles] = useState<Particle[]>([]);
//   const [hoveredTab, setHoveredTab] = useState<Panel | null>(null);
//   const particleIdRef = useRef(0);

//   useEffect(() => { setMounted(true); }, []);

//   useEffect(() => {
//     if (mounted && !user && !isLoggingOut) router.push('/auth/login');
//   }, [user, router, mounted, isLoggingOut]);

//   const handleLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       await fetch('/api/auth/logout', { method: 'POST' });
//     } finally {
//       setUser(null);
//       router.push('/');
//     }
//   };

//   const spawnParticles = (e: React.MouseEvent, tab: typeof TABS[0]) => {
//     const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
//     const cx = rect.left + rect.width / 2;
//     const cy = rect.top + rect.height / 2;

//     const newParticles: Particle[] = [];
//     const count = 14;

//     for (let i = 0; i < count; i++) {
//       const angle = (i / count) * Math.PI * 2;
//       const speed = 0.6 + Math.random() * 1.4;
//       newParticles.push({
//         id: particleIdRef.current++,
//         x: cx,
//         y: cy,
//         vx: Math.cos(angle) * speed,
//         vy: Math.sin(angle) * speed,
//         color: tab.particleColor,
//         emoji: i % 4 === 0 ? tab.emoji : undefined,
//         size: 4 + Math.random() * 4,
//       });
//     }
//     setParticles(prev => [...prev, ...newParticles]);
//     setTimeout(() => {
//       setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
//     }, 900);
//   };

//   const handleTabClick = (e: React.MouseEvent, tab: typeof TABS[0]) => {
//     setActivePanel(tab.id);
//     spawnParticles(e, tab);
//   };

//   const isDark = theme === 'dark';

//   if (!mounted) {
//     return (
//       <div className={`h-screen flex flex-col overflow-hidden items-center justify-center ${isDark ? 'bg-[#020617]' : 'bg-[#f5f3ff]'}`}>
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.3 }}
//           className="flex flex-col items-center gap-4"
//         >
//           <motion.div
//             animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
//             transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
//             className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 flex items-center justify-center text-2xl shadow-2xl shadow-violet-500/30"
//           >
//             🎭
//           </motion.div>
//           <div className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-white/30' : 'text-violet-400/60'}`}>
//             <motion.span
//               animate={{ rotate: 360 }}
//               transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
//               className={`inline-block w-4 h-4 border-2 rounded-full ${isDark ? 'border-white/20 border-t-cyan-400' : 'border-violet-200 border-t-violet-500'}`}
//             />
//             Loading session…
//           </div>
//         </motion.div>
//       </div>
//     );
//   }

//   if (!user) return null;

//   return (
//     <>
//       <ParticleBurst particles={particles} />

//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.4, ease: 'easeOut' }}
//         style={{
//           height: '100vh',
//           display: 'flex',
//           flexDirection: 'column',
//           overflow: 'hidden',
//           fontFamily: "'Geist', 'DM Sans', sans-serif",
//           background: isDark
//             ? 'linear-gradient(145deg, #020617 0%, #080d1f 60%, #030a14 100%)'
//             : 'linear-gradient(145deg, #0f0a1e 0%, #1a0f35 35%, #120d2e 65%, #0d1525 100%)',
//           position: 'relative',
//         }}
//       >
//         {/* Light mode ambient blobs */}
//         {!isDark && (
//           <>
//             <div style={{
//               position: 'fixed', top: -140, left: -100, width: 520, height: 520,
//               borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
//               background: 'radial-gradient(circle, rgba(139,92,246,0.45) 0%, rgba(109,40,217,0.2) 40%, transparent 70%)',
//             }} />
//             <div style={{
//               position: 'fixed', top: -60, right: -120, width: 420, height: 420,
//               borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
//               background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, rgba(14,116,144,0.15) 45%, transparent 70%)',
//             }} />
//             <div style={{
//               position: 'fixed', bottom: -80, left: '25%', width: 600, height: 320,
//               borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
//               background: 'radial-gradient(circle, rgba(168,85,247,0.28) 0%, transparent 65%)',
//             }} />
//             <div style={{
//               position: 'fixed', bottom: 100, right: -60, width: 300, height: 300,
//               borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
//               background: 'radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)',
//             }} />
//           </>
//         )}

//         {/* ── TOP NAV ── */}
//         <motion.nav
//           initial={{ y: -20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//           style={{
//             position: 'sticky',
//             top: 0,
//             zIndex: 50,
//             height: 56,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             padding: '0 20px',
//             backdropFilter: 'blur(32px) saturate(200%)',
//             WebkitBackdropFilter: 'blur(32px) saturate(200%)',
//             borderBottom: isDark
//               ? '1px solid rgba(255,255,255,0.07)'
//               : '1px solid rgba(139,92,246,0.25)',
//             background: isDark
//               ? 'rgba(2,6,23,0.72)'
//               : 'rgba(15,10,30,0.75)',
//             boxShadow: isDark
//               ? 'none'
//               : '0 1px 0 rgba(139,92,246,0.15), 0 8px 40px rgba(0,0,0,0.4)',
//           }}
//         >

//           {/* ── Logo ── */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
//             <motion.div
//               whileHover={{ scale: 1.1, rotate: -5 }}
//               whileTap={{ scale: 0.92, rotate: 5 }}
//               transition={{ type: 'spring', stiffness: 400, damping: 20 }}
//               style={{
//                 width: 32, height: 32, borderRadius: 10,
//                 background: 'linear-gradient(135deg, #7c3aed, #a855f7, #06b6d4)',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 fontSize: 16,
//                 boxShadow: isDark
//                   ? '0 4px 16px rgba(124,58,237,0.4)'
//                   : '0 4px 16px rgba(124,58,237,0.28), 0 1px 4px rgba(124,58,237,0.2)',
//                 cursor: 'default',
//               }}
//             >
//               🎭
//             </motion.div>
//             <motion.span
//               initial={{ opacity: 0, x: -8 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.15 }}
//               style={{
//                 fontFamily: "'Geist', sans-serif",
//                 fontWeight: 700,
//                 fontSize: 15,
//                 letterSpacing: '-0.5px',
//                 background: 'linear-gradient(135deg, #7c3aed, #a855f7, #06b6d4)',
//                 WebkitBackgroundClip: 'text',
//                 WebkitTextFillColor: 'transparent',
//                 backgroundClip: 'text',
//               }}
//             >
//               AvatarAI
//             </motion.span>
//           </div>

//           {/* ── Tabs ── */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1, justifyContent: 'center', padding: '0 12px' }}>
//             {TABS.map((tab, i) => {
//               const isActive = activePanel === tab.id;
//               const isHovered = hoveredTab === tab.id;
//               return (
//                 <motion.button
//                   key={tab.id}
//                   onClick={e => handleTabClick(e, tab)}
//                   onMouseEnter={() => setHoveredTab(tab.id)}
//                   onMouseLeave={() => setHoveredTab(null)}
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 300 }}
//                   whileTap={{ scale: 0.93 }}
//                   style={{
//                     position: 'relative',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: 6,
//                     padding: '6px 14px',
//                     borderRadius: 10,
//                     fontSize: 12.5,
//                     fontWeight: 600,
//                     border: 'none',
//                     cursor: 'pointer',
//                     background: 'transparent',
//                     outline: 'none',
//                     letterSpacing: '0.1px',
//                     whiteSpace: 'nowrap',
//                     color: isActive
//                       ? isDark ? '#fff' : '#e2d9ff'
//                       : isDark ? 'rgba(255,255,255,0.35)' : 'rgba(180,160,255,0.45)',
//                     transition: 'color 0.2s ease',
//                     fontFamily: 'inherit',
//                   }}
//                 >
//                   {/* Active pill */}
//                   {isActive && (
//                     <motion.span
//                       layoutId="tab-pill"
//                       transition={{ type: 'spring', stiffness: 420, damping: 34 }}
//                       style={{
//                         position: 'absolute',
//                         inset: 0,
//                         borderRadius: 10,
//                         background: isDark
//                           ? 'rgba(255,255,255,0.08)'
//                           : 'linear-gradient(135deg, rgba(139,92,246,0.28), rgba(168,85,247,0.18))',
//                         border: isDark
//                           ? '1px solid rgba(255,255,255,0.12)'
//                           : '1px solid rgba(139,92,246,0.4)',
//                         boxShadow: isDark
//                           ? 'none'
//                           : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 12px rgba(139,92,246,0.25)',
//                         zIndex: 0,
//                       }}
//                     />
//                   )}

//                   {/* Hover glow (non-active) */}
//                   {!isActive && isHovered && (
//                     <motion.span
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                       style={{
//                         position: 'absolute',
//                         inset: 0,
//                         borderRadius: 10,
//                         background: isDark
//                           ? 'rgba(255,255,255,0.04)'
//                           : 'rgba(139,92,246,0.12)',
//                         zIndex: 0,
//                       }}
//                     />
//                   )}

//                   {/* Icon */}
//                   <motion.span
//                     animate={isActive ? { scale: [1, 1.3, 1], rotate: [0, -10, 0] } : { scale: 1 }}
//                     transition={{ duration: 0.4, ease: 'easeOut' }}
//                     style={{ position: 'relative', zIndex: 1, fontSize: 13, lineHeight: 1 }}
//                   >
//                     {tab.icon}
//                   </motion.span>

//                   {/* Label */}
//                   <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>

//                   {/* Active underline dot */}
//                   {isActive && (
//                     <motion.span
//                       layoutId="tab-dot"
//                       transition={{ type: 'spring', stiffness: 420, damping: 34 }}
//                       style={{
//                         position: 'absolute',
//                         bottom: -9,
//                         left: '50%',
//                         transform: 'translateX(-50%)',
//                         width: 4, height: 4,
//                         borderRadius: '50%',
//                         background: tab.particleColor,
//                         boxShadow: `0 0 8px ${tab.particleColor}`,
//                         zIndex: 1,
//                       }}
//                     />
//                   )}
//                 </motion.button>
//               );
//             })}
//           </div>

//           {/* ── Right Controls ── */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

//             {/* Theme toggle */}
//             <motion.button
//               onClick={toggleTheme}
//               whileHover={{ scale: 1.07 }}
//               whileTap={{ scale: 0.9, rotate: 15 }}
//               title="Toggle theme"
//               style={{
//                 width: 34, height: 34,
//                 borderRadius: 10,
//                 border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(139,92,246,0.3)',
//                 background: isDark
//                   ? 'rgba(255,255,255,0.05)'
//                   : 'rgba(139,92,246,0.15)',
//                 boxShadow: isDark
//                   ? 'none'
//                   : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 10px rgba(0,0,0,0.3)',
//                 cursor: 'pointer',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 fontSize: 15,
//                 outline: 'none',
//                 transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
//               }}
//             >
//               <AnimatePresence mode="wait">
//                 <motion.span
//                   key={theme}
//                   initial={{ opacity: 0, rotate: -40, scale: 0.5 }}
//                   animate={{ opacity: 1, rotate: 0, scale: 1 }}
//                   exit={{ opacity: 0, rotate: 40, scale: 0.5 }}
//                   transition={{ duration: 0.22 }}
//                 >
//                   {isDark ? '☀️' : '🌙'}
//                 </motion.span>
//               </AnimatePresence>
//             </motion.button>

//             {/* Divider */}
//             <div style={{
//               width: 1, height: 22, flexShrink: 0,
//               background: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(139,92,246,0.25)',
//             }} />

//             {/* User chip */}
//             <motion.div
//               initial={{ opacity: 0, x: 12 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
//               whileHover={{ scale: 1.02 }}
//               style={{
//                 display: 'flex', alignItems: 'center', gap: 7,
//                 padding: '5px 12px 5px 6px',
//                 borderRadius: 10,
//                 border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(139,92,246,0.3)',
//                 background: isDark
//                   ? 'rgba(255,255,255,0.05)'
//                   : 'rgba(139,92,246,0.14)',
//                 boxShadow: isDark
//                   ? 'none'
//                   : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 12px rgba(0,0,0,0.3)',
//                 cursor: 'default',
//                 transition: 'background 0.2s',
//               }}
//             >
//               {/* Avatar */}
//               <div style={{
//                 width: 22, height: 22, borderRadius: 7,
//                 background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 fontSize: 10, fontWeight: 700, color: '#fff',
//                 letterSpacing: '0.5px',
//                 boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
//                 flexShrink: 0,
//               }}>
//                 {(user.name?.[0] || user.email[0]).toUpperCase()}
//               </div>

//               {/* Online dot */}
//               <motion.div
//                 animate={{ boxShadow: ['0 0 0 2px rgba(34,197,94,0.3)', '0 0 0 5px rgba(34,197,94,0.08)', '0 0 0 2px rgba(34,197,94,0.3)'] }}
//                 transition={{ repeat: Infinity, duration: 2 }}
//                 style={{
//                   width: 6, height: 6, borderRadius: '50%',
//                   background: '#22c55e', flexShrink: 0,
//                 }}
//               />

//               <span style={{
//                 fontSize: 12, fontWeight: 500,
//                 color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(220,210,255,0.9)',
//                 maxWidth: 80, overflow: 'hidden',
//                 textOverflow: 'ellipsis', whiteSpace: 'nowrap',
//               }}>
//                 {user.name || user.email}
//               </span>
//             </motion.div>

//             {/* Logout */}
//             <motion.button
//               onClick={handleLogout}
//               disabled={isLoggingOut}
//               whileHover={!isLoggingOut ? { scale: 1.03, y: -1 } : {}}
//               whileTap={!isLoggingOut ? { scale: 0.96 } : {}}
//               style={{
//                 display: 'flex', alignItems: 'center', gap: 6,
//                 padding: '6px 13px',
//                 borderRadius: 10,
//                 border: isDark ? '1px solid transparent' : '1px solid rgba(139,92,246,0.22)',
//                 background: isDark ? 'transparent' : 'rgba(139,92,246,0.1)',
//                 boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.25)',
//                 cursor: isLoggingOut ? 'not-allowed' : 'pointer',
//                 fontSize: 12, fontWeight: 600,
//                 fontFamily: 'inherit',
//                 color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(200,185,255,0.75)',
//                 outline: 'none',
//                 letterSpacing: '0.2px',
//                 opacity: isLoggingOut ? 0.5 : 1,
//                 transition: 'all 0.2s ease',
//                 position: 'relative', overflow: 'hidden',
//               }}
//               // red glow on hover via CSS workaround
//               onMouseEnter={e => {
//                 if (!isLoggingOut) {
//                   (e.currentTarget as HTMLElement).style.color = isDark ? '#fff' : '#fca5a5';
//                   (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.4)';
//                   (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.15)';
//                 }
//               }}
//               onMouseLeave={e => {
//                 (e.currentTarget as HTMLElement).style.color = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(200,185,255,0.75)';
//                 (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'transparent' : 'rgba(139,92,246,0.22)';
//                 (e.currentTarget as HTMLElement).style.background = isDark ? 'transparent' : 'rgba(139,92,246,0.1)';
//               }}
//             >
//               <AnimatePresence mode="wait">
//                 {isLoggingOut ? (
//                   <motion.span
//                     key="logging"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     style={{ display: 'flex', alignItems: 'center', gap: 6 }}
//                   >
//                     <motion.span
//                       animate={{ rotate: 360 }}
//                       transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
//                       style={{
//                         display: 'inline-block', width: 12, height: 12,
//                         border: `2px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(139,92,246,0.25)'}`,
//                         borderTopColor: isDark ? 'rgba(255,255,255,0.6)' : '#a78bfa',
//                         borderRadius: '50%',
//                       }}
//                     />
//                     Signing out…
//                   </motion.span>
//                 ) : (
//                   <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//                     Logout
//                   </motion.span>
//                 )}
//               </AnimatePresence>
//             </motion.button>
//           </div>
//         </motion.nav>

//         {/* ── MAIN LAYOUT ── */}
//         <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

//           {/* LEFT — Side panel */}
//           <motion.aside
//             initial={{ x: -20, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//             style={{
//               width: 480,
//               flexShrink: 0,
//               borderRight: isDark
//                 ? '1px solid rgba(255,255,255,0.07)'
//                 : '1px solid rgba(139,92,246,0.2)',
//               backdropFilter: 'blur(32px)',
//               WebkitBackdropFilter: 'blur(32px)',
//               position: 'relative',
//               overflow: 'hidden',
//               background: isDark
//                 ? '#030712'
//                 : 'rgba(12,7,28,0.7)',
//             }}
//           >
//             {/* Ambient glows inside panel */}
//             <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
//               <motion.div
//                 animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.35, 0.25] }}
//                 transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
//                 style={{
//                   position: 'absolute', top: '-20%', left: '-20%',
//                   width: 500, height: 500, borderRadius: '50%',
//                   background: isDark
//                     ? 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)'
//                     : 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
//                   filter: 'blur(40px)',
//                 }}
//               />
//               <motion.div
//                 animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.3, 0.2] }}
//                 transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 1 }}
//                 style={{
//                   position: 'absolute', bottom: '-20%', right: '-20%',
//                   width: 500, height: 500, borderRadius: '50%',
//                   background: isDark
//                     ? 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)'
//                     : 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)',
//                   filter: 'blur(40px)',
//                 }}
//               />
//             </div>

//             <div style={{ flex: 1, overflowY: 'auto', padding: 16, position: 'relative', zIndex: 1, height: '100%' }}>
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={activePanel}
//                   initial={{ opacity: 0, y: 14, scale: 0.98 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   exit={{ opacity: 0, y: -10, scale: 0.98 }}
//                   transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
//                   style={{ height: '100%' }}
//                 >
//                   {activePanel === 'tracking'  && <WebcamTracker />}
//                   {activePanel === 'customize' && <CustomizePanel />}
//                   {activePanel === 'export'    && <ExportPanel />}
//                   {activePanel === 'saved'     && <SavedAvatarsPanel />}
//                 </motion.div>
//               </AnimatePresence>
//             </div>
//           </motion.aside>

//           {/* RIGHT — 3D Scene */}
//           <motion.main
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.25, duration: 0.5 }}
//             style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
//           >
//             <AvatarScene />

//             <motion.div
//               initial={{ opacity: 0, y: 6 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.6 }}
//               style={{
//                 position: 'absolute', bottom: 16,
//                 left: '50%', transform: 'translateX(-50%)',
//                 display: 'flex', alignItems: 'center', gap: 8,
//                 fontSize: 11, fontWeight: 500,
//                 color: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(180,160,255,0.35)',
//                 fontFamily: 'monospace',
//                 pointerEvents: 'none', userSelect: 'none',
//                 letterSpacing: '0.3px',
//               }}
//             >
//               <span>Drag to rotate</span>
//               <span style={{ opacity: 0.5 }}>·</span>
//               <span>Scroll to zoom</span>
//             </motion.div>
//           </motion.main>
//         </div>
//       </motion.div>
//     </>
//   );
// }

"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import AvatarScene from '@/components/three/AvatarScene';
import { WebcamTracker } from '@/components/ml/WebcamTracker';
import { CustomizePanel } from '@/components/ui/CustomizePanel';
import { ExportPanel } from '@/components/ui/ExportPanel';
import { SavedAvatarsPanel } from '@/components/ui/SavedAvatarsPanel';
import { useSession, signOut } from 'next-auth/react';

type Panel = 'tracking' | 'customize' | 'export' | 'saved';

const TABS: {
  id: Panel; label: string; short: string; emoji: string;
  accent: string; accentGlow: string; accentDim: string; particleColor: string;
}[] = [
  { id:'tracking',  label:'TRACK',  short:'01', emoji:'📷',
    accent:'#00d4ff', accentGlow:'rgba(0,212,255,0.5)',  accentDim:'rgba(0,212,255,0.08)',  particleColor:'#00d4ff' },
  { id:'customize', label:'STYLE',  short:'02', emoji:'🎨',
    accent:'#9b5de5', accentGlow:'rgba(155,93,229,0.5)', accentDim:'rgba(155,93,229,0.08)', particleColor:'#9b5de5' },
  { id:'export',    label:'EXPORT', short:'03', emoji:'🔥',
    accent:'#e6b432', accentGlow:'rgba(230,180,50,0.5)', accentDim:'rgba(230,180,50,0.08)', particleColor:'#e6b432' },
  { id:'saved',     label:'SAVED',  short:'04', emoji:'⭐',
    accent:'#39ff14', accentGlow:'rgba(57,255,20,0.5)',  accentDim:'rgba(57,255,20,0.08)',  particleColor:'#39ff14' },
];

/* ── Particle burst ─────────────────────────────────────── */
interface Particle { id:number;x:number;y:number;vx:number;vy:number;color:string;size:number;shape:string; }
function ParticleBurst({ particles }: { particles: Particle[] }) {
  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex:9999 }}>
      <AnimatePresence>
        {particles.map(p => (
          <motion.div key={p.id}
            initial={{ x:p.x, y:p.y, opacity:1, scale:1, rotate:0 }}
            animate={{ x:p.x+p.vx*100, y:p.y+p.vy*100, opacity:0, scale:0, rotate:200 }}
            exit={{ opacity:0 }}
            transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
            style={{
              position:'absolute', fontSize:p.size, color:p.color,
              lineHeight:1, userSelect:'none',
              filter:`drop-shadow(0 0 8px ${p.color})`,
            }}>{p.shape}</motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── Running Dog mascot ─────────────────────────────────── */
function RunningDog({ isDark }: { isDark: boolean }) {
  const [dir, setDir] = useState<'right' | 'left'>('right');
  const [cycle, setCycle] = useState(0);
  const dogColor  = isDark ? '#e6b432' : '#ffd24d';
  const bodyColor = isDark ? '#c49a1a' : '#e6b432';

  // Flip direction each loop
  useEffect(() => {
    const duration = 16000; // 16s per crossing
    const timer = setInterval(() => {
      setDir(d => d === 'right' ? 'left' : 'right');
      setCycle(c => c + 1);
    }, duration);
    return () => clearInterval(timer);
  }, []);

  const legAnim = {
    animate: { rotate: ['-18deg', '18deg', '-18deg'] },
    transition: { repeat: Infinity, duration: 0.38, ease: 'easeInOut' as const },
  };
  const armAnim = {
    animate: { rotate: ['22deg', '-22deg', '22deg'] },
    transition: { repeat: Infinity, duration: 0.38, ease: 'easeInOut' as const },
  };

  return (
    <motion.div
      key={`run-${cycle}-${dir}`}
      initial={{ x: dir === 'right' ? -110 : 'calc(100vw + 110px)' }}
      animate={{ x: dir === 'right' ? 'calc(100vw + 110px)' : -110 }}
      transition={{ duration: 16, ease: 'linear' }}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        zIndex: 20,
        transformOrigin: 'center bottom',
        scaleX: dir === 'left' ? -1 : 1,
      }}
    >
      {/* Body bobble */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 0.38, ease: 'easeInOut' }}
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {/* SVG Dog — pixel-art style tiny mascot */}
        <svg width="52" height="44" viewBox="0 0 52 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow */}
          <ellipse cx="26" cy="43" rx="14" ry="2.5" fill="rgba(0,0,0,0.18)" />

          {/* Body */}
          <rect x="12" y="18" width="24" height="14" rx="7" fill={bodyColor} />

          {/* Tail — animated */}
          <motion.rect
            x="34" y="14" width="10" height="4" rx="2"
            fill={dogColor}
            animate={{ rotate: ['-20deg', '20deg', '-20deg'], y: ['2px', '-2px', '2px'] }}
            transition={{ repeat: Infinity, duration: 0.45, ease: 'easeInOut' }}
            style={{ transformOrigin: '34px 16px' }}
          />

          {/* Head */}
          <ellipse cx="18" cy="17" rx="8" ry="7" fill={dogColor} />

          {/* Ears */}
          <ellipse cx="14" cy="12" rx="3" ry="4.5" fill={bodyColor} transform="rotate(-15 14 12)" />
          <ellipse cx="22" cy="11" rx="2.5" ry="4" fill={bodyColor} transform="rotate(10 22 11)" />

          {/* Eye */}
          <circle cx="16" cy="16" r="1.5" fill="#1a1a1a" />
          <circle cx="16.5" cy="15.5" r="0.5" fill="white" />

          {/* Snout */}
          <ellipse cx="11" cy="19" rx="3.5" ry="2.5" fill={dogColor} opacity="0.9" />
          <circle cx="11" cy="19" r="1.5" fill="#2a1a1a" opacity="0.7" />

          {/* Front legs — animated */}
          <motion.rect
            x="14" y="30" width="5" height="10" rx="2.5"
            fill={bodyColor}
            animate={{ rotate: ['-18deg', '18deg', '-18deg'] }}
            transition={{ repeat: Infinity, duration: 0.38, ease: 'easeInOut' }}
            style={{ transformOrigin: '16.5px 30px' }}
          />
          <motion.rect
            x="21" y="30" width="5" height="10" rx="2.5"
            fill={bodyColor}
            animate={{ rotate: ['18deg', '-18deg', '18deg'] }}
            transition={{ repeat: Infinity, duration: 0.38, ease: 'easeInOut' }}
            style={{ transformOrigin: '23.5px 30px' }}
          />

          {/* Back legs */}
          <motion.rect
            x="27" y="30" width="5" height="10" rx="2.5"
            fill={bodyColor}
            animate={{ rotate: ['-18deg', '18deg', '-18deg'] }}
            transition={{ repeat: Infinity, duration: 0.38, ease: 'easeInOut', delay: 0.19 }}
            style={{ transformOrigin: '29.5px 30px' }}
          />
          <motion.rect
            x="33" y="30" width="5" height="10" rx="2.5"
            fill={bodyColor}
            animate={{ rotate: ['18deg', '-18deg', '18deg'] }}
            transition={{ repeat: Infinity, duration: 0.38, ease: 'easeInOut', delay: 0.19 }}
            style={{ transformOrigin: '35.5px 30px' }}
          />

          {/* Collar */}
          <rect x="13" y="22" width="12" height="3" rx="1.5" fill="#ff5757" />
          <circle cx="19" cy="25" r="1.2" fill={dogColor} />

          {/* Speed lines behind dog */}
          {dir === 'right' && (
            <g opacity="0.35">
              <line x1="0" y1="22" x2="8" y2="22" stroke={dogColor} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="26" x2="9" y2="26" stroke={dogColor} strokeWidth="1" strokeLinecap="round" />
              <line x1="0" y1="30" x2="7" y2="30" stroke={dogColor} strokeWidth="0.8" strokeLinecap="round" />
            </g>
          )}
        </svg>
      </motion.div>
    </motion.div>
  );
}

/* ── Status dot ─────────────────────────────────────────── */
function StatusDot({ color }: { color: string }) {
  return (
    <span style={{ position:'relative', display:'inline-flex', width:7, height:7, flexShrink:0 }}>
      <motion.span
        animate={{ scale:[1,2.4,1], opacity:[0.7,0,0.7] }}
        transition={{ repeat:Infinity, duration:2.2, ease:'easeOut' }}
        style={{ position:'absolute', inset:0, borderRadius:'50%', background:color }}
      />
      <span style={{ width:7, height:7, borderRadius:'50%', background:color, position:'relative', zIndex:1 }} />
    </span>
  );
}

/* ── Background ─────────────────────────────────────────── */
function Background({ isDark, accent }: { isDark:boolean; accent:string }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, overflow:'hidden', pointerEvents:'none' }}>
      <motion.div
        animate={{ scale:[1,1.18,1], opacity:[0.7,1,0.7] }}
        transition={{ repeat:Infinity, duration:9, ease:'easeInOut' }}
        style={{
          position:'absolute', top:'-30%', left:'-15%',
          width:'65vw', height:'65vw', borderRadius:'50%',
          background:`radial-gradient(circle, ${accent}16 0%, transparent 65%)`,
          filter:'blur(70px)', transition:'background 0.8s ease',
        }}
      />
      <motion.div
        animate={{ scale:[1,1.1,1], opacity:[0.5,0.9,0.5] }}
        transition={{ repeat:Infinity, duration:11, ease:'easeInOut', delay:2.5 }}
        style={{
          position:'absolute', bottom:'-20%', right:'-10%',
          width:'50vw', height:'50vw', borderRadius:'50%',
          background:`radial-gradient(circle, ${isDark ? 'rgba(155,93,229,0.14)' : 'rgba(192,132,252,0.2)'} 0%, transparent 65%)`,
          filter:'blur(80px)',
        }}
      />
      {/* Diagonal corner lines */}
      <svg style={{ position:'absolute', top:0, left:0, width:360, height:360, opacity: isDark ? 0.1 : 0.12 }}
        viewBox="0 0 360 360" fill="none">
        <line x1="0" y1="360" x2="360" y2="0" stroke={accent} strokeWidth="0.6" />
        <line x1="0" y1="300" x2="300" y2="0" stroke={accent} strokeWidth="0.6" />
        <line x1="0" y1="240" x2="240" y2="0" stroke={accent} strokeWidth="0.4" />
      </svg>
      {/* Dot grid */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:`radial-gradient(circle, ${isDark ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.12)'} 1px, transparent 1px)`,
        backgroundSize:'26px 26px',
      }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user, setUser, theme, toggleTheme, activePanel, setActivePanel } = useStore();
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [particles, setParticles]       = useState<Particle[]>([]);
  const [hoveredTab, setHoveredTab]     = useState<Panel | null>(null);
  const particleIdRef = useRef(0);

  useEffect(() => { setMounted(true); }, []);
 useEffect(() => {
  if (mounted && !user && !session && !isLoggingOut) router.push('/auth/login');
}, [user, session, router, mounted, isLoggingOut]);

 const handleLogout = async () => {
  setIsLoggingOut(true);
  try { await fetch('/api/auth/logout', { method: 'POST' }); }
  finally { 
    setUser(null); 
    await signOut({ callbackUrl: '/' });
  }
};

  const spawnParticles = (e: React.MouseEvent, tab: typeof TABS[0]) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const shapes = ['◆','▲','●','■','✦','✚','★'];
    const newP: Particle[] = Array.from({ length:16 }, (_,i) => {
      const angle = (i/16)*Math.PI*2, speed = 0.7+Math.random()*1.5;
      return { id:particleIdRef.current++, x:cx, y:cy,
        vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed,
        color:tab.accent, size:7+Math.random()*8, shape:shapes[i%shapes.length] };
    });
    setParticles(p => [...p, ...newP]);
    setTimeout(() => setParticles(p => p.filter(x => !newP.find(n => n.id===x.id))), 950);
  };

  const handleTabClick = (e: React.MouseEvent, tab: typeof TABS[0]) => {
    setActivePanel(tab.id); spawnParticles(e, tab);
  };

  const isDark = theme === 'dark';
  const activeTab = TABS.find(t => t.id === activePanel)!;

  /* Loading */
  if (!mounted) return (
    <div style={{
      height:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background: isDark ? '#07070c' : '#12103a',
      fontFamily:"'Bebas Neue', sans-serif",
    }}>
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
        <motion.div
          animate={{ rotate:[0,8,-8,0], scale:[1,1.06,1] }}
          transition={{ repeat:Infinity, duration:2.5 }}
          style={{
            width:60, height:60, borderRadius:16,
            background:'linear-gradient(135deg, #1a1030, #2d1560)',
            border:'1px solid rgba(230,180,50,0.4)',
            boxShadow:'0 0 40px rgba(230,180,50,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:28,
          }}
        >🎭</motion.div>
        <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, letterSpacing:'0.22em',
          color:'rgba(230,180,50,0.5)', textTransform:'uppercase',
          display:'flex', alignItems:'center', gap:10 }}>
          <motion.span animate={{ opacity:[1,0,1] }} transition={{ repeat:Infinity, duration:1 }}>▌</motion.span>
          LOADING STUDIO
        </div>
      </motion.div>
    </div>
  );

  // if (!user) return null;
  if (!user && !session) return null;

  return (
    <>
      <ParticleBurst particles={particles} />
      <Background isDark={isDark} accent={activeTab.accent} />

      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }}
        transition={{ duration:0.5 }}
        style={{ height:'100vh', display:'flex', flexDirection:'column',
          overflow:'hidden', position:'relative', zIndex:1,
          fontFamily:"'DM Sans', sans-serif" }}
      >
        {/* ══ NAV ══════════════════════════════════════════ */}
        <motion.nav
          initial={{ y:-32, opacity:0 }} animate={{ y:0, opacity:1 }}
          transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
          style={{
            height:56, display:'flex', alignItems:'stretch',
            position:'sticky', top:0, zIndex:100,
            backdropFilter:'blur(40px) saturate(200%)',
            WebkitBackdropFilter:'blur(40px) saturate(200%)',
            background: isDark ? 'rgba(7,7,12,0.88)' : 'rgba(18,16,58,0.92)',
            borderBottom:`1px solid ${isDark ? 'rgba(230,180,50,0.13)' : 'rgba(255,210,77,0.18)'}`,
            boxShadow: isDark
              ? '0 1px 0 rgba(230,180,50,0.07), 0 8px 48px rgba(0,0,0,0.75)'
              : '0 1px 0 rgba(255,210,77,0.14), 0 8px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 20px', flexShrink:0,
            borderRight:`1px solid ${isDark ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.08)'}` }}>
            <motion.div
              whileHover={{ rotate:-8, scale:1.1 }} whileTap={{ scale:0.9 }}
              transition={{ type:'spring', stiffness:500, damping:22 }}
              style={{
                width:34, height:34, borderRadius:10,
                background:'linear-gradient(135deg, #1a1030, #3d1f8a)',
                border:`1px solid ${activeTab.accent}55`,
                boxShadow:`0 0 18px ${activeTab.accentGlow}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:17, cursor:'default',
                transition:'border-color 0.4s, box-shadow 0.4s',
              }}
            >🎭</motion.div>
            <div style={{ lineHeight:1 }}>
              <div style={{
                fontFamily:"'Bebas Neue', sans-serif",
                fontSize:20, letterSpacing:'0.08em',
                color: activeTab.accent,
                textShadow:`0 0 24px ${activeTab.accentGlow}`,
                transition:'color 0.4s, text-shadow 0.4s',
              }}>AvatarAI</div>
              <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:8,
                letterSpacing:'0.18em', color:`${activeTab.accent}55`,
                textTransform:'uppercase', marginTop:1,
                transition:'color 0.4s',
              }}>STUDIO V2</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', alignItems:'stretch', flex:1, justifyContent:'center' }}>
            {TABS.map((tab, i) => {
              const isActive  = activePanel === tab.id;
              const isHovered = hoveredTab === tab.id;
              return (
                <motion.button key={tab.id}
                  onClick={e => handleTabClick(e, tab)}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  initial={{ opacity:0, y:-14 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.08+i*0.06, type:'spring', stiffness:360 }}
                  whileTap={{ scale:0.94 }}
                  style={{
                    position:'relative', display:'flex', alignItems:'center', gap:7,
                    padding:'0 20px', height:'100%',
                    fontSize:11, fontWeight:600,
                    fontFamily:"'IBM Plex Mono', monospace",
                    letterSpacing:'0.13em', textTransform:'uppercase',
                    border:'none', cursor:'pointer', background:'transparent', outline:'none',
                    color: isActive ? tab.accent : 'rgba(242,240,255,0.28)',
                    transition:'color 0.2s',
                    borderRight:`1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {/* Active bottom bar */}
                  {isActive && (
                    <motion.span layoutId="tab-bar"
                      transition={{ type:'spring', stiffness:500, damping:38 }}
                      style={{
                        position:'absolute', bottom:0, left:0, right:0, height:2,
                        background:tab.accent,
                        boxShadow:`0 0 14px ${tab.accentGlow}, 0 0 5px ${tab.accent}`,
                        zIndex:2,
                      }}
                    />
                  )}
                  {/* Active wash */}
                  {isActive && (
                    <motion.span layoutId="tab-bg"
                      transition={{ type:'spring', stiffness:400, damping:36 }}
                      style={{
                        position:'absolute', inset:0,
                        background:`linear-gradient(to bottom, transparent 0%, ${tab.accentDim} 100%)`,
                        zIndex:0,
                      }}
                    />
                  )}
                  {/* Hover tint */}
                  {!isActive && isHovered && (
                    <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                      style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.03)', zIndex:0 }}
                    />
                  )}
                  <span style={{
                    position:'relative', zIndex:1, fontSize:8,
                    fontFamily:"'IBM Plex Mono', monospace",
                    color: isActive ? `${tab.accent}70` : 'rgba(255,255,255,0.15)',
                    letterSpacing:'0.08em', transition:'color 0.2s',
                  }}>{tab.short}</span>
                  <motion.span
                    animate={isActive ? { scale:[1,1.4,1], rotate:[0,-12,0] } : { scale:1 }}
                    transition={{ duration:0.35 }}
                    style={{ position:'relative', zIndex:1, fontSize:14, lineHeight:1 }}
                  >{tab.emoji}</motion.span>
                  <span style={{ position:'relative', zIndex:1 }}>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Right */}
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 16px',
            borderLeft:`1px solid ${isDark ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.08)'}`,
            flexShrink:0 }}>

            {/* Theme toggle */}
            <motion.button onClick={toggleTheme}
              whileHover={{ scale:1.1 }} whileTap={{ scale:0.88, rotate:20 }}
              style={{
                width:34, height:34, borderRadius:8,
                border:`1px solid ${isDark ? 'rgba(230,180,50,0.22)' : 'rgba(255,210,77,0.28)'}`,
                background: isDark ? 'rgba(230,180,50,0.07)' : 'rgba(255,210,77,0.1)',
                cursor:'pointer', display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:15, outline:'none',
                boxShadow: isDark ? '0 0 14px rgba(230,180,50,0.12)' : '0 0 14px rgba(255,210,77,0.15)',
                transition:'all 0.2s',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span key={theme}
                  initial={{ opacity:0, rotate:-45, scale:0.4 }}
                  animate={{ opacity:1, rotate:0, scale:1 }}
                  exit={{ opacity:0, rotate:45, scale:0.4 }}
                  transition={{ duration:0.2 }}
                >{isDark ? '☀️' : '🌙'}</motion.span>
              </AnimatePresence>
            </motion.button>

            <div style={{ width:1, height:22, background:'rgba(255,255,255,0.08)' }} />

            {/* User chip */}
            <motion.div
              initial={{ opacity:0, x:14 }} animate={{ opacity:1, x:0 }}
              transition={{ delay:0.25, type:'spring', stiffness:320 }}
              style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'4px 12px 4px 5px', borderRadius:8,
                border:`1px solid ${isDark ? 'rgba(230,180,50,0.18)' : 'rgba(255,210,77,0.22)'}`,
                background: isDark ? 'rgba(230,180,50,0.05)' : 'rgba(255,210,77,0.08)',
                cursor:'default',
              }}
            >
              <div style={{
                width:24, height:24, borderRadius:6,
                background:'linear-gradient(135deg, #1a1030, #3d1f8a)',
                border:`1px solid ${isDark ? 'rgba(230,180,50,0.38)' : 'rgba(255,210,77,0.4)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, fontWeight:700, color: isDark ? '#e6b432' : '#ffd24d',
                fontFamily:"'Bebas Neue', sans-serif",
                boxShadow:`0 0 12px ${isDark ? 'rgba(230,180,50,0.3)' : 'rgba(255,210,77,0.3)'}`,
                flexShrink:0,
              }}>{(user?.name?.[0] || user?.email?.[0] || session?.user?.name?.[0] || session?.user?.email?.[0] || '?').toUpperCase()}</div>
              <StatusDot color={isDark ? '#39ff14' : '#4ade80'} />
              <span style={{
                fontFamily:"'IBM Plex Mono', monospace", fontSize:11,
                color: isDark ? 'rgba(230,180,50,0.65)' : 'rgba(255,210,77,0.8)',
                maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>{user?.name || user?.email || session?.user?.name || session?.user?.email}</span>
            </motion.div>

            {/* Logout */}
            <motion.button onClick={handleLogout} disabled={isLoggingOut}
              whileHover={!isLoggingOut ? { scale:1.04 } : {}}
              whileTap={!isLoggingOut ? { scale:0.94 } : {}}
              style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'6px 14px', borderRadius:8,
                border:'1px solid rgba(255,255,255,0.07)',
                background:'rgba(255,255,255,0.04)',
                cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                fontSize:10, fontWeight:600,
                fontFamily:"'IBM Plex Mono', monospace",
                letterSpacing:'0.12em', textTransform:'uppercase',
                color:'rgba(242,240,255,0.3)',
                outline:'none', opacity: isLoggingOut ? 0.5 : 1,
                transition:'all 0.2s',
              }}
              onMouseEnter={e => { if (!isLoggingOut) Object.assign((e.currentTarget as HTMLElement).style, {
                color:'#ff5757', borderColor:'rgba(255,87,87,0.38)',
                background:'rgba(255,87,87,0.08)', boxShadow:'0 0 20px rgba(255,87,87,0.15)',
              }); }}
              onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, {
                color:'rgba(242,240,255,0.3)', borderColor:'rgba(255,255,255,0.07)',
                background:'rgba(255,255,255,0.04)', boxShadow:'none',
              })}
            >
              <AnimatePresence mode="wait">
                {isLoggingOut ? (
                  <motion.span key="out" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <motion.span animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.9, ease:'linear' }}
                      style={{ display:'inline-block', width:11, height:11, borderRadius:'50%',
                        border:'2px solid rgba(255,87,87,0.25)', borderTopColor:'#ff5757' }}
                    />EXIT…
                  </motion.span>
                ) : (
                  <motion.span key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>LOGOUT</motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>

        {/* ══ BODY ════════════════════════════════════════ */}
        <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative', zIndex:1 }}>

          {/* ── LEFT PANEL ── */}
          <motion.aside
            initial={{ x:-28, opacity:0 }} animate={{ x:0, opacity:1 }}
            transition={{ delay:0.18, duration:0.6, ease:[0.22,1,0.36,1] }}
            style={{
              width:480, flexShrink:0,
              position:'relative', overflow:'hidden',
              background: isDark ? 'rgba(7,7,12,0.78)' : 'rgba(18,16,58,0.88)',
              backdropFilter:'blur(32px)',
              WebkitBackdropFilter:'blur(32px)',
              borderRight:`1px solid ${isDark ? 'rgba(230,180,50,0.1)' : 'rgba(255,210,77,0.15)'}`,
              display:'flex', flexDirection:'column',
            }}
          >
            {/* Top color strip */}
            <motion.div style={{
              position:'absolute', top:0, left:0, right:0, height:2, zIndex:10,
              background:`linear-gradient(90deg, transparent, ${activeTab.accent}, transparent)`,
              boxShadow:`0 0 20px ${activeTab.accentGlow}`,
              transition:'background 0.5s, box-shadow 0.5s',
            }} />

            {/* Ghost label */}
            <div style={{
              position:'absolute', bottom:-14, right:-10,
              fontFamily:"'Bebas Neue', sans-serif",
              fontSize:96, letterSpacing:'0.04em', lineHeight:1,
              color:`${activeTab.accent}09`,
              userSelect:'none', pointerEvents:'none', zIndex:0,
              transition:'color 0.5s',
            }}>{activeTab.label}</div>

            {/* Ambient orb */}
            <motion.div
              animate={{ scale:[1,1.15,1], opacity:[0.55,1,0.55] }}
              transition={{ repeat:Infinity, duration:7, ease:'easeInOut' }}
              style={{
                position:'absolute', top:'-30%', left:'-30%',
                width:'110%', height:'110%', borderRadius:'50%',
                background:`radial-gradient(circle, ${activeTab.accent}12 0%, transparent 65%)`,
                filter:'blur(50px)', zIndex:0, pointerEvents:'none',
                transition:'background 0.6s',
              }}
            />

            {/* Content */}
            <div style={{
              flex:1, overflowY:'auto', padding:'20px 18px',
              position:'relative', zIndex:2, height:'100%',
            }}>
              <AnimatePresence mode="wait">
                <motion.div key={activePanel}
                  initial={{ opacity:0, y:18, scale:0.97 }}
                  animate={{ opacity:1, y:0, scale:1 }}
                  exit={{ opacity:0, y:-12, scale:0.97 }}
                  transition={{ duration:0.25, ease:[0.22,1,0.36,1] }}
                  style={{ height:'100%' }}
                >
                  {activePanel === 'tracking'  && <WebcamTracker />}
                  {activePanel === 'customize' && <CustomizePanel />}
                  {activePanel === 'export'    && <ExportPanel />}
                  {activePanel === 'saved'     && <SavedAvatarsPanel />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.aside>

          {/* ── RIGHT — 3D scene ── */}
          <motion.main
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            transition={{ delay:0.3, duration:0.6 }}
            style={{ flex:1, position:'relative', overflow:'hidden' }}
          >
            <AvatarScene />

            {/* Corner brackets */}
            {[
              { top:12, left:12,  borderTop:'2px solid', borderLeft:'2px solid',   width:26, height:26, borderRadius:'4px 0 0 0' },
              { top:12, right:12, borderTop:'2px solid', borderRight:'2px solid',  width:26, height:26, borderRadius:'0 4px 0 0' },
              { bottom:52, left:12,  borderBottom:'2px solid', borderLeft:'2px solid',  width:26, height:26, borderRadius:'0 0 0 4px' },
              { bottom:52, right:12, borderBottom:'2px solid', borderRight:'2px solid', width:26, height:26, borderRadius:'0 0 4px 0' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }}
                transition={{ delay:0.5+i*0.07, type:'spring' }}
                style={{
                  position:'absolute', pointerEvents:'none',
                  borderColor:`${activeTab.accent}55`,
                  transition:'border-color 0.5s', ...s,
                }}
              />
            ))}

            {/* ── RUNNING DOG — above the hint bar ── */}
            <div style={{
              position:'absolute', bottom:36, left:0, right:0,
              height:52, overflow:'hidden', pointerEvents:'none', zIndex:10,
            }}>
              <RunningDog isDark={isDark} />
            </div>

            {/* ── Drag/zoom hint — PRESERVED ── */}
            <motion.div
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.7 }}
              style={{
                position:'absolute', bottom:10,
                left:'50%', transform:'translateX(-50%)',
                display:'flex', alignItems:'center', gap:12,
                padding:'5px 18px', borderRadius:4,
                background: isDark ? 'rgba(7,7,12,0.82)' : 'rgba(18,16,58,0.88)',
                border:`1px solid ${isDark ? 'rgba(230,180,50,0.16)' : 'rgba(255,210,77,0.22)'}`,
                backdropFilter:'blur(16px)',
                pointerEvents:'none', userSelect:'none', zIndex:20,
              }}
            >
              {[
                { icon:'↔', text:'DRAG TO ROTATE' },
                { icon:'⊕', text:'SCROLL TO ZOOM' },
              ].map((h, i) => (
                <span key={i} style={{
                  display:'flex', alignItems:'center', gap:6,
                  fontFamily:"'IBM Plex Mono', monospace",
                  fontSize:9, letterSpacing:'0.14em',
                  color: isDark ? 'rgba(230,180,50,0.38)' : 'rgba(255,210,77,0.55)',
                }}>
                  <span style={{ fontSize:12, opacity:0.7 }}>{h.icon}</span>
                  {h.text}
                  {i===0 && <span style={{ marginLeft:4, opacity:0.25 }}>·</span>}
                </span>
              ))}
            </motion.div>
          </motion.main>
        </div>
      </motion.div>
    </>
  );
}