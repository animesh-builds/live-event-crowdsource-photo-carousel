'use client';

import { motion } from 'framer-motion';
import { clientConfig } from '@/lib/config';
import { usePhotos } from '@/hooks/usePhotos';
import PasswordGate from '@/components/PasswordGate';
import BokehBackground from '@/components/BokehBackground';
import GrainOverlay from '@/components/GrainOverlay';
import Carousel from '@/components/Carousel';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import FallbackScreen from '@/components/FallbackScreen';

// =============================================================================
// Empty State
// =============================================================================
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-32 gap-4">
      <motion.p
        className="font-display text-[var(--color-soft)] text-xl md:text-2xl opacity-50 text-center px-8"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        Photos will appear here as guests share them
      </motion.p>
      {clientConfig.uploadFormUrl && (
        <a
          href={clientConfig.uploadFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-[var(--color-primary)] text-xs tracking-[0.3em]
                     uppercase hover:text-[var(--color-accent)] transition-colors"
        >
          Upload the first one &rarr;
        </a>
      )}
    </div>
  );
}

// =============================================================================
// Main Page
// =============================================================================
export default function Home() {
  const { photos, count, status, refresh } = usePhotos(clientConfig.refreshInterval);

  const content = (
    <main className="min-h-screen bg-[var(--color-background)] relative">
      <BokehBackground />
      <GrainOverlay />

      {/* Header */}
      <motion.header
        className="text-center pt-8 sm:pt-14 pb-4 sm:pb-8 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <h1
          className="font-display text-[var(--color-soft)] leading-snug sm:leading-tight px-4 sm:px-4 whitespace-nowrap sm:whitespace-normal text-[clamp(0.9rem,5vw,1.25rem)] sm:text-4xl md:text-6xl lg:text-7xl"
        >
          {clientConfig.eventTitle}
        </h1>

        {clientConfig.eventSubtitle && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-2 sm:mt-3 px-4">
            <div className="w-6 sm:w-8 h-px bg-[var(--color-accent)] opacity-50 flex-shrink-0" />
            <p className="font-body text-[var(--color-primary)] text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.35em] uppercase">
              {clientConfig.eventSubtitle}
            </p>
            <div className="w-6 sm:w-8 h-px bg-[var(--color-accent)] opacity-50 flex-shrink-0" />
          </div>
        )}

        {count > 0 && (
          <p className="font-display text-[var(--color-accent)] text-sm sm:text-lg mt-3 sm:mt-4 tracking-wide">
            {count} {count === 1 ? 'photo' : 'photos'} shared
          </p>
        )}

        {status === 'stale' && (
          <p className="font-body text-[var(--color-primary)] text-xs opacity-40 mt-1 tracking-widest">
            showing cached photos
          </p>
        )}
      </motion.header>

      {/* Main content */}
      <div className="relative z-10 pb-8 sm:pb-16">
        {status === 'loading' && <LoadingSkeleton />}
        {status === 'error' && <FallbackScreen onRetry={refresh} />}
        {status === 'success' && photos.length === 0 && <EmptyState />}
        {(status === 'success' || status === 'stale') && photos.length > 0 && (
          <Carousel photos={photos} />
        )}
      </div>

      {/* Upload footer */}
      {clientConfig.uploadFormUrl && (
        <footer className="text-center pb-6 sm:pb-10 relative z-10">
          <a
            href={clientConfig.uploadFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[var(--color-primary)] text-xs tracking-[0.35em]
                       uppercase hover:text-[var(--color-accent)] transition-colors duration-300"
          >
            + share a photo
          </a>
        </footer>
      )}
    </main>
  );

  // If no password configured, skip gate entirely
  if (!clientConfig.sitePassword) return content;

  return <PasswordGate>{content}</PasswordGate>;
}
