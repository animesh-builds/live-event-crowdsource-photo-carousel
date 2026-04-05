'use client';

import { motion } from 'framer-motion';
import { clientConfig } from '@/lib/config';
import BokehBackground from './BokehBackground';
import GrainOverlay from './GrainOverlay';

interface FallbackScreenProps {
  onRetry: () => void;
}

export default function FallbackScreen({ onRetry }: FallbackScreenProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center relative">
      <BokehBackground />
      <GrainOverlay />
      <div className="relative z-10 text-center px-8">
        <h1 className="font-display text-[var(--color-soft)] text-2xl sm:text-4xl md:text-5xl mb-4">
          {clientConfig.eventTitle}
        </h1>
        <div className="w-12 h-px bg-[var(--color-accent)] mx-auto mb-4 opacity-60" />
        {clientConfig.eventSubtitle && (
          <p className="font-body text-[var(--color-primary)] text-xs tracking-[0.3em] uppercase mb-12">
            {clientConfig.eventSubtitle}
          </p>
        )}
        <motion.p
          className="font-display text-[var(--color-soft)] text-xl opacity-60"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          Photos are finding their way here...
        </motion.p>
        {clientConfig.uploadFormUrl && (
          <a
            href={clientConfig.uploadFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-8 font-body text-[var(--color-primary)] text-xs
                       tracking-[0.3em] uppercase hover:text-[var(--color-accent)] transition-colors"
          >
            Be the first to share a photo &rarr;
          </a>
        )}
        <button
          onClick={onRetry}
          className="mt-6 font-body text-[var(--color-soft)] text-xs opacity-30
                     hover:opacity-60 transition-opacity tracking-widest uppercase"
        >
          retry
        </button>
      </div>
    </div>
  );
}
