'use client';

import { getTheme } from '@/lib/themes';
import { clientConfig } from '@/lib/config';

const circles = [
  { size: 280, x: 15, y: 20, duration: 90, colorIdx: 0, delay: 0 },
  { size: 140, x: 70, y: 10, duration: 120, colorIdx: 1, delay: 3 },
  { size: 200, x: 85, y: 65, duration: 75, colorIdx: 2, delay: 7 },
  { size: 100, x: 30, y: 75, duration: 105, colorIdx: 0, delay: 2 },
  { size: 180, x: 55, y: 45, duration: 95, colorIdx: 1, delay: 5 },
  { size: 120, x: 5, y: 50, duration: 80, colorIdx: 2, delay: 1 },
  { size: 240, x: 45, y: 85, duration: 115, colorIdx: 0, delay: 8 },
];

export default function BokehBackground() {
  const theme = getTheme(clientConfig.theme);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {circles.map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: c.size,
            height: c.size,
            left: `${c.x}%`,
            top: `${c.y}%`,
            background: theme.bokeh[c.colorIdx] || theme.bokeh[0],
            filter: `blur(${60 + (c.size / 4)}px)`,
            opacity: 0.15 + (i % 3) * 0.05,
            '--float-duration': `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
