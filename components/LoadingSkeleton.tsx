'use client';

const ROWS = [
  { cards: 6, heights: [160, 192, 176, 208, 192, 160] },
  { cards: 5, heights: [192, 160, 224, 176, 208] },
  { cards: 6, heights: [176, 208, 160, 192, 176, 224] },
];

export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 overflow-hidden">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-4 px-4">
          {row.heights.map((h, ci) => (
            <div
              key={ci}
              className="flex-shrink-0 rounded-sm border-4 border-white/10"
              style={{ width: h * 1.2, height: h }}
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
