import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { getTheme } from '@/lib/themes';
import './globals.css';

// =============================================================================
// Fonts
// =============================================================================
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// =============================================================================
// Theme — injected as CSS variables
// =============================================================================
const themeKey = process.env.NEXT_PUBLIC_THEME || 'midnight';
const theme = getTheme(themeKey);

const themeStyles = `
  :root {
    --color-background: ${theme.background};
    --color-surface:    ${theme.surface};
    --color-primary:    ${theme.primary};
    --color-accent:     ${theme.accent};
    --color-soft:       ${theme.soft};
    --color-pop:        ${theme.pop};
  }
  body { background-color: ${theme.background}; }
`;

// =============================================================================
// Metadata
// =============================================================================
const eventTitle = process.env.NEXT_PUBLIC_EVENT_TITLE || 'Event Photo Carousel';

export const metadata: Metadata = {
  title: eventTitle,
  description: 'A live photo carousel for your event. Guests upload, photos appear.',
  robots: { index: false, follow: false }, // Private event — no indexing by default
};

// =============================================================================
// Layout
// =============================================================================
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
