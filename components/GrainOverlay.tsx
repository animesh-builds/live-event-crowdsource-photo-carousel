'use client';

import { getTheme } from '@/lib/themes';
import { clientConfig } from '@/lib/config';

export default function GrainOverlay() {
  const theme = getTheme(clientConfig.theme);

  if (!theme.grain) return null;

  return (
    <svg
      className="fixed inset-0 w-full h-full z-[1] pointer-events-none opacity-[0.035]"
      aria-hidden="true"
    >
      <filter id="grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves={3}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}
