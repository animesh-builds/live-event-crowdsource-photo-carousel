'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrivePhoto } from '@/lib/drive';

interface PhotoViewerProps {
  photos: DrivePhoto[];
  initialIndex: number;
  onClose: () => void;
}

export default function PhotoViewer({ photos, initialIndex, onClose }: PhotoViewerProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [direction, setDirection] = useState(0);

  // Touch tracking
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const lastTap = useRef(0);
  const pinchStart = useRef(0);

  const photo = photos[current];

  const goTo = useCallback((idx: number, dir: number) => {
    setZoom(1);
    setDirection(dir);
    setCurrent(idx);
  }, []);

  const prev = useCallback(() => {
    if (current > 0) goTo(current - 1, -1);
  }, [current, goTo]);

  const next = useCallback(() => {
    if (current < photos.length - 1) goTo(current + 1, 1);
  }, [current, photos.length, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Trap mobile back gesture — close viewer instead of leaving site
  useEffect(() => {
    const closedByBack = { current: false };
    history.pushState({ viewer: true }, '');
    const handlePop = () => {
      closedByBack.current = true;
      onClose();
    };
    window.addEventListener('popstate', handlePop);
    return () => {
      window.removeEventListener('popstate', handlePop);
      if (!closedByBack.current && history.state?.viewer) {
        history.back();
      }
    };
  }, [onClose]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };

      // Double-tap detection
      const now = Date.now();
      if (now - lastTap.current < 300) {
        setZoom((z) => z > 1 ? 1 : 2.5);
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStart.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (zoom > 1) return; // Don't swipe when zoomed

    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dt = Date.now() - touchStart.current.time;

    // Swipe detection: >60px horizontal, <400ms
    if (Math.abs(dx) > 60 && dt < 400) {
      if (dx > 0) prev();
      else next();
    }

    pinchStart.current = 0;
  }, [zoom, prev, next]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStart.current > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist / pinchStart.current;
      setZoom((z) => Math.min(Math.max(z * (scale > 1 ? 1.02 : 0.98), 1), 4));
    }
  }, []);

  // Desktop scroll zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    setZoom((z) => Math.min(Math.max(z + (e.deltaY > 0 ? -0.2 : 0.2), 1), 4));
  }, []);

  // Desktop double-click zoom
  const handleDoubleClick = useCallback(() => {
    setZoom((z) => z > 1 ? 1 : 2.5);
  }, []);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '40%' : '-40%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-40%' : '40%', opacity: 0 }),
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 relative z-10">
        <span className="text-white/40 text-xs font-body tracking-wider">
          {current + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white text-2xl transition-colors
                     min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          &times;
        </button>
      </div>

      {/* Photo area */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.img
            key={photo.id}
            src={photo.thumbnailUrl}
            alt={photo.name}
            className="max-w-[96vw] max-h-[82vh] object-contain select-none"
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out' }}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            draggable={false}
          />
        </AnimatePresence>

        {/* Desktop nav arrows */}
        {current > 0 && (
          <button
            onClick={prev}
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2
                       text-white/30 hover:text-white/80 text-4xl transition-colors
                       min-h-[44px] min-w-[44px] items-center justify-center"
          >
            &#8249;
          </button>
        )}
        {current < photos.length - 1 && (
          <button
            onClick={next}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2
                       text-white/30 hover:text-white/80 text-4xl transition-colors
                       min-h-[44px] min-w-[44px] items-center justify-center"
          >
            &#8250;
          </button>
        )}
      </div>

      {/* Bottom hint */}
      <div className="text-center py-2 sm:py-3">
        <p className="text-white/20 text-[10px] font-body tracking-widest uppercase">
          {zoom > 1 ? 'double-tap to reset' : 'swipe or use arrows \u00b7 double-tap to zoom'}
        </p>
      </div>
    </motion.div>
  );
}
