// app/auth/register/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import dynamic from 'next/dynamic';

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

function Field({
  label, name, value, type = 'text', placeholder, autoComplete, onChange, focusColor = "cyan"
}: {
  label: string; name: string; value: string; type?: string;
  placeholder: string; autoComplete?: string;
  focusColor?: "cyan" | "purple" | "pink";
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const colorMap = {
    cyan: "group-focus-within:text-cyan-400 focus:border-cyan-500/50 focus:bg-cyan-500/[0.02]",
    purple: "group-focus-within:text-purple-400 focus:border-purple-500/50 focus:bg-purple-500/[0.02]",
    pink: "group-focus-within:text-pink-400 focus:border-pink-500/50 focus:bg-pink-500/[0.02]",
  };

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-2 group">
      <label className={`text-[11px] text-white/50 font-bold uppercase tracking-wider transition-colors ${colorMap[focusColor].split(' ')[0]}`}>
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={name !== 'name'}
          autoComplete={autoComplete}
          className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/20 
            focus:outline-none transition-all duration-300 ${colorMap[focusColor].split(' ').slice(1).join(' ')}`}
          placeholder={placeholder}
        />
      </div>
    </motion.div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, user } = useStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) router.replace('/dashboard');
  }, [mounted, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      setUser(data.user);
      router.push('/auth/login');
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
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" 
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
          className="relative glass rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row-reverse"
        >
          {/* Lottie Animation Side */}
          <div className="hidden md:flex flex-col items-center justify-center w-full md:w-1/2 p-12 relative bg-white/[0.02] border-l border-white/5">
            <div className="absolute inset-0 bg-gradient-to-bl from-pink-500/10 to-transparent pointer-events-none" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative z-10 w-full flex justify-center"
            >
              <Player
                autoplay
                loop
                src="/lottie/Message.json"
                style={{ height: '300px', width: '300px' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-center mt-8 relative z-10"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Join Us</h2>
              <p className="text-white/50 text-sm">Create an account and start shaping your digital presence.</p>
            </motion.div>
          </div>

          {/* Form Side */}
          <div className="w-full md:w-1/2 p-8 md:p-12 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="relative flex flex-col gap-4 z-10 h-full justify-center">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                className="text-center md:text-left mb-6"
              >
                <Link href="/" className="inline-flex items-center gap-3 group">
                  <motion.span 
                    whileHover={{ rotate: -15, scale: 1.1 }}
                    className="text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] inline-block origin-bottom"
                  >
                    ✨
                  </motion.span>
                  <span className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/50 group-hover:from-cyan-400 group-hover:to-pink-400 transition-all duration-300 tracking-tight">
                    AvatarAI
                  </span>
                </Link>
                <p className="text-white/40 text-sm mt-3 font-medium tracking-wide hidden md:block">Create your free account</p>
              </motion.div>

              <Field 
                label="Display Name (optional)" 
                name="name" 
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Your name" 
                autoComplete="name" 
                focusColor="cyan"
              />
              <Field 
                label="Email Address" 
                name="email" 
                type="email" 
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@domain.com" 
                autoComplete="email" 
                focusColor="purple"
              />
              <Field 
                label="Password" 
                name="password" 
                type="password" 
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Min. 8 characters" 
                autoComplete="new-password" 
                focusColor="pink"
              />
              <Field 
                label="Confirm Password" 
                name="confirm" 
                type="password" 
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat password" 
                autoComplete="new-password" 
                focusColor="pink"
              />

              {/* Error message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-4 overflow-hidden shadow-inner mt-2"
                  >
                    <span className="font-semibold mr-2">Error:</span>{error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="relative mt-2 py-4 rounded-2xl font-bold text-sm bg-white text-black overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
                  {loading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="inline-block w-4 h-4 border-2 border-black/30 border-t-black group-hover:border-white/30 group-hover:border-t-white rounded-full transition-colors"
                      />
                      Creating profile…
                    </>
                  ) : 'Create Account →'}
                </span>
              </motion.button>
              
              <motion.div variants={itemVariants} className="mt-4 text-center md:text-left">
                <p className="text-xs text-white/40 font-medium">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-white hover:text-cyan-400 transition-colors duration-200 underline underline-offset-4 decoration-white/20 hover:decoration-cyan-400/50">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            </form>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[10px] text-white/20 mt-6 px-4 font-medium"
        >
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </motion.p>
      </motion.div>
    </div>
  );
}
