'use client';

import { DrivePhoto } from '@/lib/drive';
import CarouselRow from './CarouselRow';

interface CarouselProps {
  photos: DrivePhoto[];
}

// Alternating directions and varied speeds for visual interest
const ROW_CONFIG = [
  { duration: 40, direction: 'right' as const },
  { duration: 55, direction: 'left' as const },
  { duration: 28, direction: 'right' as const },
  { duration: 48, direction: 'left' as const },
  { duration: 35, direction: 'right' as const },
  { duration: 60, direction: 'left' as const },
];

const PHOTOS_PER_ROW = 6;

function buildRows(photos: DrivePhoto[]): DrivePhoto[][] {
  // Scale rows with photo count: 2 rows min, up to 6 rows for large sets
  let rowCount: number;
  if (photos.length < 10) rowCount = 2;
  else if (photos.length < 20) rowCount = 3;
  else if (photos.length < 40) rowCount = 4;
  else if (photos.length < 70) rowCount = 5;
  else rowCount = 6;

  const rows: DrivePhoto[][] = Array.from({ length: rowCount }, () => []);

  // Round-robin distribute all photos across rows
  photos.forEach((photo, i) => {
    rows[i % rowCount].push(photo);
  });

  // Remove empty rows (shouldn't happen, but safety)
  return rows.filter((row) => row.length > 0);
}

export default function Carousel({ photos }: CarouselProps) {
  const rows = buildRows(photos);

  return (
    <div className="flex flex-col gap-3 sm:gap-6 overflow-hidden">
      {rows.map((rowPhotos, i) => {
        const config = ROW_CONFIG[i % ROW_CONFIG.length];
        return (
          <CarouselRow
            key={i}
            photos={rowPhotos}
            direction={config.direction}
            duration={config.duration}
          />
        );
      })}
    </div>
  );
}
