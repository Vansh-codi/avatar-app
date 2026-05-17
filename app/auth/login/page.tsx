// // app/auth/login/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useStore } from '@/lib/store';
// import dynamic from 'next/dynamic';

// const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player), { ssr: false });

// const containerVariants = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: { staggerChildren: 0.1, delayChildren: 0.2 },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 15 },
//   show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
// };

// export default function LoginPage() {
//   const router = useRouter();
//   const { setUser, user } = useStore();
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // If already logged in, redirect instantly
//   useEffect(() => {
//     if (mounted && user) router.replace('/dashboard');
//   }, [mounted, user, router]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const res = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || 'Login failed');
//         return;
//       }

//       setUser(data.user);
//       router.push('/dashboard');
//     } catch {
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!mounted) return null;

//   return (
//     <div className="min-h-screen bg-black grid-bg relative overflow-hidden flex items-center justify-center p-4">
      
//       {/* Premium Background Blobs */}
//       <motion.div 
//         animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
//         transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//         className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" 
//       />
//       <motion.div 
//         animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
//         transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
//         className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" 
//       />

//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//         className="w-full max-w-4xl relative z-10"
//       >
//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate="show"
//           className="relative glass rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row"
//         >
//           {/* Lottie Animation Side */}
//           <div className="hidden md:flex flex-col items-center justify-center w-full md:w-1/2 p-12 relative bg-white/[0.02] border-r border-white/5">
//             <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
            
//             <motion.div
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.3, duration: 0.8 }}
//               className="relative z-10 w-full flex justify-center"
//             >
//               <Player
//                 autoplay
//                 loop
//                 src="/lottie/animation.json"
//                 style={{ height: '300px', width: '300px' }}
//               />
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.6, duration: 0.5 }}
//               className="text-center mt-8 relative z-10"
//             >
//               <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
//               <p className="text-white/50 text-sm">Enter your credentials to access your digital avatar studio.</p>
//             </motion.div>
//           </div>

//           {/* Form Side */}
//           <div className="w-full md:w-1/2 p-8 md:p-12 relative">
//             {/* Inner ambient glow */}
//             <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            
//             <form onSubmit={handleSubmit} className="relative flex flex-col gap-6 z-10 h-full justify-center">
//               {/* Header inside form side */}
//               <motion.div
//                 initial={{ opacity: 0, y: -20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
//                 className="text-center md:text-left mb-6"
//               >
//                 <Link href="/" className="inline-flex items-center gap-3 group">
//                   <motion.span 
//                     whileHover={{ rotate: 15, scale: 1.1 }}
//                     className="text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] inline-block origin-bottom"
//                   >
//                     🎭
//                   </motion.span>
//                   <span className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/50 group-hover:from-cyan-400 group-hover:to-purple-400 transition-all duration-300 tracking-tight">
//                     AvatarAI
//                   </span>
//                 </Link>
//                 <p className="text-white/40 text-sm mt-3 font-medium tracking-wide uppercase hidden md:block">Sign In</p>
//               </motion.div>

//               {/* Email Field */}
//               <motion.div variants={itemVariants} className="flex flex-col gap-2 group">
//                 <label className="text-[11px] text-white/50 font-bold uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="email"
//                     value={form.email}
//                     onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
//                     required
//                     autoComplete="email"
//                     className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/20 
//                       focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/[0.02] transition-all duration-300"
//                     placeholder="you@domain.com"
//                   />
//                 </div>
//               </motion.div>

//               {/* Password Field */}
//               <motion.div variants={itemVariants} className="flex flex-col gap-2 group">
//                 <label className="text-[11px] text-white/50 font-bold uppercase tracking-wider group-focus-within:text-purple-400 transition-colors">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="password"
//                     value={form.password}
//                     onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
//                     required
//                     autoComplete="current-password"
//                     className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/20 
//                       focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/[0.02] transition-all duration-300"
//                     placeholder="••••••••"
//                   />
//                 </div>
//               </motion.div>

//               {/* Error message */}
//               <AnimatePresence mode="wait">
//                 {error && (
//                   <motion.div
//                     key="error"
//                     initial={{ opacity: 0, height: 0, y: -10 }}
//                     animate={{ opacity: 1, height: 'auto', y: 0 }}
//                     exit={{ opacity: 0, height: 0 }}
//                     className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-4 overflow-hidden shadow-inner"
//                   >
//                     <span className="font-semibold mr-2">Error:</span>{error}
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               <motion.button
//                 variants={itemVariants}
//                 type="submit"
//                 disabled={loading}
//                 whileHover={{ scale: loading ? 1 : 1.02 }}
//                 whileTap={{ scale: loading ? 1 : 0.98 }}
//                 className="relative mt-2 py-4 rounded-2xl font-bold text-sm bg-white text-black overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
//                 <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
//                   {loading ? (
//                     <>
//                       <motion.span
//                         animate={{ rotate: 360 }}
//                         transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
//                         className="inline-block w-4 h-4 border-2 border-black/30 border-t-black group-hover:border-white/30 group-hover:border-t-white rounded-full transition-colors"
//                       />
//                       Authenticating…
//                     </>
//                   ) : 'Sign In'}
//                 </span>
//               </motion.button>
            
//               <motion.div variants={itemVariants} className="mt-4 text-center md:text-left">
//                 <p className="text-xs text-white/40 font-medium">
//                   Don't have an account?{' '}
//                   <Link href="/auth/register" className="text-white hover:text-cyan-400 transition-colors duration-200 underline underline-offset-4 decoration-white/20 hover:decoration-cyan-400/50">
//                     Create one for free
//                   </Link>
//                 </p>
//               </motion.div>
//             </form>
//           </div>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }



// app/auth/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import dynamic from 'next/dynamic';
// import { signIn } from 'next-auth/react';
import { signIn, useSession } from 'next-auth/react';
const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player), { ssr: false });

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser, user } = useStore();
  const { data: session,status } = useSession();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

 useEffect(() => {
  setMounted(true);
}, []);

useEffect(() => {
  if (mounted && status !== 'loading' && (user || session)) {
    router.replace('/dashboard');
  }
}, [mounted, user, session, status, router]);
  //   if (mounted && user) router.replace('/dashboard');
  // }, [mounted, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      setUser(data.user);
      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black grid-bg relative overflow-hidden flex items-center justify-center p-4">
      
      {/* Premium Background Blobs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-4xl relative z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative glass rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row"
        >
          {/* Lottie Animation Side */}
          <div className="hidden md:flex flex-col items-center justify-center w-full md:w-1/2 p-12 relative bg-white/[0.02] border-r border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative z-10 w-full flex justify-center"
            >
              <Player
                autoplay
                loop
                src="/lottie/animation.json"
                style={{ height: '300px', width: '300px' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-center mt-8 relative z-10"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-white/50 text-sm">Enter your credentials to access your digital avatar studio.</p>
            </motion.div>
          </div>

          {/* Form Side */}
          <div className="w-full md:w-1/2 p-8 md:p-12 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="relative flex flex-col gap-6 z-10 h-full justify-center">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                className="text-center md:text-left mb-6"
              >
                <Link href="/" className="inline-flex items-center gap-3 group">
                  <motion.span 
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] inline-block origin-bottom"
                  >
                    🎭
                  </motion.span>
                  <span className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/50 group-hover:from-cyan-400 group-hover:to-purple-400 transition-all duration-300 tracking-tight">
                    AvatarAI
                  </span>
                </Link>
                <p className="text-white/40 text-sm mt-3 font-medium tracking-wide uppercase hidden md:block">Sign In</p>
              </motion.div>

              {/* Email Field */}
              <motion.div variants={itemVariants} className="flex flex-col gap-2 group">
                <label className="text-[11px] text-white/50 font-bold uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                    autoComplete="email"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/20 
                      focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/[0.02] transition-all duration-300"
                    placeholder="you@domain.com"
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants} className="flex flex-col gap-2 group">
                <label className="text-[11px] text-white/50 font-bold uppercase tracking-wider group-focus-within:text-purple-400 transition-colors">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                    autoComplete="current-password"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/20 
                      focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/[0.02] transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>
              </motion.div>

              {/* Error message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-4 overflow-hidden shadow-inner"
                  >
                    <span className="font-semibold mr-2">Error:</span>{error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sign In Button */}
              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="relative mt-2 py-4 rounded-2xl font-bold text-sm bg-white text-black overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
                  {loading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="inline-block w-4 h-4 border-2 border-black/30 border-t-black group-hover:border-white/30 group-hover:border-t-white rounded-full transition-colors"
                      />
                      Authenticating…
                    </>
                  ) : 'Sign In'}
                </span>
              </motion.button>

              {/* Divider */}
              <motion.div variants={itemVariants} className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/30 text-xs uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </motion.div>

              {/* Google Button */}
              <motion.button
                variants={itemVariants}
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl font-bold text-sm bg-white/[0.03] border border-white/10 text-white flex items-center justify-center gap-3 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </motion.button>

              {/* Footer */}
              <motion.div variants={itemVariants} className="mt-4 text-center md:text-left">
                <p className="text-xs text-white/40 font-medium">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="text-white hover:text-cyan-400 transition-colors duration-200 underline underline-offset-4 decoration-white/20 hover:decoration-cyan-400/50">
                    Create one for free
                  </Link>
                </p>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}