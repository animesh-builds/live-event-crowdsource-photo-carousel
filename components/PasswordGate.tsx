'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isAuthenticated, authenticate } from '@/lib/auth';
import { clientConfig } from '@/lib/config';
import BokehBackground from './BokehBackground';

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [shaking, setShaking] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Skip gate entirely if no password configured
    if (!clientConfig.sitePassword) {
      setUnlocked(true);
      setReady(true);
      return;
    }
    setUnlocked(isAuthenticated());
    setReady(true);
  }, []);

  const handleSubmit = () => {
    if (authenticate(input, clientConfig.sitePassword)) {
      setUnlocked(true);
    } else {
      setShaking(true);
      setInput('');
      setTimeout(() => setShaking(false), 600);
    }
  };

  if (!ready) return null;

  return (
    <AnimatePresence mode="wait">
      {unlocked ? (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="gate"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-background)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <BokehBackground />
          <div className="relative z-10 flex flex-col items-center gap-6 px-8 max-w-sm w-full">
            {/* Event title */}
            <h1 className="font-display text-[var(--color-soft)] text-[clamp(0.9rem,5vw,1.25rem)] sm:text-4xl text-center leading-snug sm:leading-tight whitespace-nowrap sm:whitespace-normal">
              {clientConfig.eventTitle}
            </h1>

            {/* Thin accent divider */}
            <div className="w-16 h-px bg-[var(--color-accent)] opacity-60" />

            {/* Subtitle */}
            {clientConfig.eventSubtitle && (
              <p className="font-body text-[var(--color-primary)] text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.35em] uppercase">
                {clientConfig.eventSubtitle}
              </p>
            )}

            {/* Password input */}
            <motion.input
              animate={shaking ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.5 }}
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="enter passcode"
              className="w-full bg-transparent border border-[var(--color-accent)] border-opacity-50
                         text-[var(--color-soft)] text-center font-body text-sm tracking-widest
                         px-4 py-3 min-h-[44px] rounded-none outline-none
                         placeholder:text-[var(--color-primary)] placeholder:opacity-40
                         focus:border-opacity-100 transition-all duration-300"
            />

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="font-body text-[var(--color-accent)] text-xs tracking-[0.3em] uppercase
                         hover:text-[var(--color-soft)] transition-colors duration-300
                         min-h-[44px] px-4"
            >
              &rarr;&nbsp;&nbsp;Enter
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
