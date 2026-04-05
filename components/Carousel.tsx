'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DrivePhoto } from '@/lib/drive';
import CarouselRow from './CarouselRow';
import PhotoViewer from './PhotoViewer';

interface CarouselProps {
  photos: DrivePhoto[];
}

// Alternating directions and varied speeds — moderately paced
const ROW_CONFIG = [
  { duration: 28, direction: 'right' as const },
  { duration: 38, direction: 'left' as const },
  { duration: 22, direction: 'right' as const },
  { duration: 34, direction: 'left' as const },
  { duration: 26, direction: 'right' as const },
  { duration: 40, direction: 'left' as const },
  { duration: 30, direction: 'right' as const },
  { duration: 36, direction: 'left' as const },
];

function buildRows(photos: DrivePhoto[]): DrivePhoto[][] {
  let rowCount: number;
  if (photos.length < 6) rowCount = 2;
  else if (photos.length < 12) rowCount = 3;
  else if (photos.length < 20) rowCount = 4;
  else if (photos.length < 30) rowCount = 5;
  else if (photos.length < 50) rowCount = 6;
  else if (photos.length < 80) rowCount = 7;
  else rowCount = 8;

  const rows: DrivePhoto[][] = Array.from({ length: rowCount }, () => []);
  photos.forEach((photo, i) => {
    rows[i % rowCount].push(photo);
  });
  return rows.filter((row) => row.length > 0);
}

export default function Carousel({ photos }: CarouselProps) {
  const rows = buildRows(photos);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const handlePhotoOpen = useCallback((photoId: string) => {
    const idx = photos.findIndex((p) => p.id === photoId);
    if (idx >= 0) setViewerIndex(idx);
  }, [photos]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:gap-6 overflow-hidden">
        {rows.map((rowPhotos, i) => {
          const config = ROW_CONFIG[i % ROW_CONFIG.length];
          return (
            <CarouselRow
              key={i}
              photos={rowPhotos}
              direction={config.direction}
              duration={config.duration}
              onPhotoOpen={handlePhotoOpen}
            />
          );
        })}
      </div>

      <AnimatePresence>
        {viewerIndex !== null && (
          <PhotoViewer
            photos={photos}
            initialIndex={viewerIndex}
            onClose={() => setViewerIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
