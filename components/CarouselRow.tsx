'use client';

import { DrivePhoto } from '@/lib/drive';
import PhotoCard from './PhotoCard';

interface CarouselRowProps {
  photos: DrivePhoto[];
  direction: 'left' | 'right';
  duration: number;
}

export default function CarouselRow({ photos, direction, duration }: CarouselRowProps) {
  if (photos.length === 0) return null;

  // Duplicate for seamless infinite loop
  const doubled = [...photos, ...photos];

  return (
    <div className="overflow-hidden group">
      <div
        className={`flex gap-4 items-center ${
          direction === 'right' ? 'animate-scroll-right' : 'animate-scroll-left'
        } group-hover:[animation-play-state:paused]`}
        style={
          {
            '--scroll-duration': `${duration}s`,
          } as React.CSSProperties
        }
      >
        {doubled.map((photo, i) => (
          <PhotoCard key={`${photo.id}-${i}`} photo={photo} index={i % photos.length} />
        ))}
      </div>
    </div>
  );
}
