'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DrivePhoto } from '@/lib/drive';

// Deterministic rotation from photo ID — stable across re-renders
function getRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 7) - 3; // -3 to +3 degrees
}

// Deterministic mosaic height from photo ID
// Mobile-scaled via CSS clamp: 60% size on small screens, full on desktop
const HEIGHTS = [160, 176, 192, 208, 224, 240, 256];
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
  const rotation = getRotation(photo.id);
  const height = getMosaicHeight(photo.id);

  // Scale cards down on mobile: ~65% at 375px, full at 768px+
  const mobileHeight = Math.round(height * 0.65);

  if (hidden) return null;

  return (
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
      style={{
        rotate: rotation,
      }}
    >
      <div
        className="border-2 sm:border-4 border-white rounded-sm overflow-hidden shadow-lg"
        style={{
          width: `clamp(${mobileHeight * 1.2}px, ${height * 0.15}vw + ${height * 0.5}px, ${height * 1.2}px)`,
          height: `clamp(${mobileHeight}px, ${height * 0.12}vw + ${height * 0.4}px, ${height}px)`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <img
          src={photo.thumbnailUrl}
          alt={photo.name}
          loading="lazy"
          onError={() => setHidden(true)}
          className="w-full h-full object-contain bg-black/20"
          draggable={false}
        />
      </div>
    </motion.div>
  );
}
