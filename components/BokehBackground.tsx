'use client';

import { getTheme } from '@/lib/themes';
import { clientConfig } from '@/lib/config';

// Deterministic circles — no Math.random(). More circles, more visible.
const circles = [
  { size: 350, x: 10, y: 15, duration: 55, colorIdx: 0, delay: 0, drift: 40 },
  { size: 200, x: 75, y: 8,  duration: 70, colorIdx: 1, delay: 3, drift: 30 },
  { size: 280, x: 85, y: 60, duration: 48, colorIdx: 2, delay: 7, drift: 50 },
  { size: 160, x: 25, y: 70, duration: 62, colorIdx: 0, delay: 2, drift: 35 },
  { size: 240, x: 50, y: 40, duration: 58, colorIdx: 1, delay: 5, drift: 45 },
  { size: 180, x: 3,  y: 45, duration: 52, colorIdx: 2, delay: 1, drift: 30 },
  { size: 300, x: 40, y: 85, duration: 65, colorIdx: 0, delay: 8, drift: 40 },
  { size: 130, x: 60, y: 20, duration: 45, colorIdx: 1, delay: 4, drift: 25 },
  { size: 220, x: 90, y: 35, duration: 72, colorIdx: 2, delay: 6, drift: 35 },
  { size: 170, x: 15, y: 90, duration: 50, colorIdx: 0, delay: 9, drift: 30 },
];

export default function BokehBackground() {
  const theme = getTheme(clientConfig.theme);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {circles.map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: c.size,
            height: c.size,
            left: `${c.x}%`,
            top: `${c.y}%`,
            background: theme.bokeh[c.colorIdx] || theme.bokeh[0],
            filter: `blur(${50 + (c.size / 5)}px)`,
            opacity: 0.2 + (i % 3) * 0.06,
            animation: `bokeh-drift-${i % 3} ${c.duration}s ease-in-out infinite, bokeh-pulse ${c.duration * 0.7}s ease-in-out infinite`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* CSS animations for varied drift paths + opacity pulse */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bokeh-drift-0 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(30px, -20px); }
          50% { transform: translate(-15px, -40px); }
          75% { transform: translate(-25px, 15px); }
        }
        @keyframes bokeh-drift-1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-20px, 25px); }
          50% { transform: translate(35px, -15px); }
          75% { transform: translate(10px, -35px); }
        }
        @keyframes bokeh-drift-2 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(25px, 30px); }
          50% { transform: translate(-30px, 10px); }
          75% { transform: translate(15px, -25px); }
        }
        @keyframes bokeh-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}} />
    </div>
  );
}
