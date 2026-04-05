'use client';

const ROWS = [
  { widths: [180, 130, 160, 200, 150, 170] },
  { widths: [150, 190, 140, 170, 160] },
  { widths: [170, 140, 200, 150, 180, 130] },
  { widths: [160, 180, 150, 190, 140] },
];

const ROW_HEIGHT = 152;

export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:gap-6 overflow-hidden">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-2 sm:gap-4">
          {row.widths.map((w, ci) => (
            <div
              key={ci}
              className="flex-shrink-0 rounded-sm border-2 sm:border-[3px] border-white/10"
              style={{
                width: `clamp(${Math.round(w * 0.7)}px, ${w * 0.13}vw + ${w * 0.4}px, ${w}px)`,
                height: `clamp(${Math.round(ROW_HEIGHT * 0.7)}px, ${ROW_HEIGHT * 0.12}vw + ${ROW_HEIGHT * 0.4}px, ${ROW_HEIGHT}px)`,
              }}
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
