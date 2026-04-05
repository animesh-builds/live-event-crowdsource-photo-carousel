'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrivePhoto } from '@/lib/drive';

// Deterministic rotation from photo ID — stable across re-renders
function getRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 7) - 3; // -3 to +3 degrees
}

// Deterministic mosaic height — controls card height, width adapts to photo
const HEIGHTS = [140, 152, 164, 176, 188, 200, 212];
function getMosaicHeight(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 17 + id.charCodeAt(i)) | 0;
  }
  return HEIGHTS[Math.abs(hash) % HEIGHTS.length];
}

interface PhotoCardProps {
  photo: DrivePhoto;
  index: number;
}

export default function PhotoCard({ photo, index }: PhotoCardProps) {
  const [hidden, setHidden] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const lastTouchDist = useRef(0);
  const rotation = getRotation(photo.id);
  const height = getMosaicHeight(photo.id);

  // Mobile scale: ~70% on small screens
  const mobileHeight = Math.round(height * 0.7);

  if (hidden) return null;

  return (
    <>
      <motion.div
        className="flex-shrink-0 cursor-pointer"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.5) }}
        whileHover={{
          rotate: 0,
          scale: 1.06,
          zIndex: 10,
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setExpanded(true)}
        style={{
          rotate: rotation,
        }}
      >
        <div
          className="border-2 sm:border-[3px] border-white rounded-sm overflow-hidden"
          style={{
            height: `clamp(${mobileHeight}px, ${height * 0.12}vw + ${height * 0.4}px, ${height}px)`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
          }}
        >
          <img
            src={photo.thumbnailUrl}
            alt={photo.name}
            loading="lazy"
            onError={() => setHidden(true)}
            className="h-full w-auto block"
            draggable={false}
          />
        </div>
      </motion.div>

      {/* Lightbox overlay with zoom */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => { setExpanded(false); setZoom(1); setPan({ x: 0, y: 0 }); }}
            onWheel={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.min(Math.max(z + (e.deltaY > 0 ? -0.15 : 0.15), 1), 4));
              if (zoom <= 1) setPan({ x: 0, y: 0 });
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (lastTouchDist.current > 0) {
                  const delta = (dist - lastTouchDist.current) * 0.008;
                  setZoom((z) => Math.min(Math.max(z + delta, 1), 4));
                }
                lastTouchDist.current = dist;
              } else if (e.touches.length === 1 && zoom > 1) {
                setPan((p) => ({
                  x: p.x + (e.touches[0].clientX - (lastTouchDist.current || e.touches[0].clientX)),
                  y: p.y + (e.touches[0].clientY - (lastTouchDist.current || e.touches[0].clientY)),
                }));
              }
            }}
            onTouchEnd={() => { lastTouchDist.current = 0; }}
          >
            <motion.div
              className="relative p-2 sm:p-3 bg-white/10 rounded-sm"
              style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photo.thumbnailUrl}
                alt={photo.name}
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-sm"
                draggable={false}
              />
            </motion.div>
            <button
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/60 hover:text-white
                         text-2xl sm:text-3xl font-body transition-colors min-h-[44px] min-w-[44px]
                         flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); setExpanded(false); setZoom(1); setPan({ x: 0, y: 0 }); }}
            >
              &times;
            </button>
            {zoom > 1 && (
              <button
                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs
                           font-body tracking-widest uppercase hover:text-white/70 transition-colors"
                onClick={(e) => { e.stopPropagation(); setZoom(1); setPan({ x: 0, y: 0 }); }}
              >
                reset zoom
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
