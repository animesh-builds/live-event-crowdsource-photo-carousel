'use client';

import { DrivePhoto } from '@/lib/drive';
import CarouselRow from './CarouselRow';

interface CarouselProps {
  photos: DrivePhoto[];
}

const ROW_CONFIG = [
  { duration: 40, direction: 'right' as const },
  { duration: 65, direction: 'left' as const },
  { duration: 28, direction: 'right' as const },
];

const PHOTOS_PER_ROW = 10;

function buildRows(photos: DrivePhoto[]): DrivePhoto[][] {
  const rowCount = photos.length < 15 ? 2 : 3;
  const rows: DrivePhoto[][] = [];

  for (let i = 0; i < rowCount; i++) {
    const start = i * PHOTOS_PER_ROW;
    const end = start + PHOTOS_PER_ROW;
    const row = photos.slice(start, end);
    if (row.length > 0) rows.push(row);
  }

  // If last row is too sparse (< 5), merge into previous
  if (rows.length > 1 && rows[rows.length - 1].length < 5) {
    const last = rows.pop()!;
    rows[rows.length - 1] = [...rows[rows.length - 1], ...last];
  }

  // Distribute remaining photos across rows
  const remaining = photos.slice(rowCount * PHOTOS_PER_ROW);
  remaining.forEach((photo, i) => {
    rows[i % rows.length].push(photo);
  });

  return rows;
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
