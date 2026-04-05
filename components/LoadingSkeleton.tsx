'use client';

const ROWS = [
  { cards: 6, heights: [160, 192, 176, 208, 192, 160] },
  { cards: 5, heights: [192, 160, 224, 176, 208] },
  { cards: 6, heights: [176, 208, 160, 192, 176, 224] },
];

export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:gap-6 overflow-hidden">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-2 sm:gap-4 px-2 sm:px-4">
          {row.heights.map((h, ci) => (
            <div
              key={ci}
              className="flex-shrink-0 rounded-sm border-2 sm:border-4 border-white/10"
              style={{ width: `clamp(${Math.round(h * 0.65 * 1.2)}px, 15vw, ${h * 1.2}px)`, height: `clamp(${Math.round(h * 0.65)}px, 12vw, ${h}px)` }}
            >
              <div
                className="w-full h-full animate-shimmer rounded-sm"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, var(--color-surface) 25%, var(--color-background) 50%, var(--color-surface) 75%)',
                  backgroundSize: '200% 100%',
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
