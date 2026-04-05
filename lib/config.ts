// =============================================================================
// Environment Configuration
// =============================================================================
// Validates required env vars at startup. Provides typed access throughout app.
// =============================================================================

import { ThemeKey } from './themes';

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

// Server-side only — never exposed to browser
export const serverConfig = {
  driveApiKey: () => requireEnv('GOOGLE_DRIVE_API_KEY'),
  driveFolderId: () => requireEnv('GOOGLE_DRIVE_FOLDER_ID'),
};

// Client-safe — all prefixed with NEXT_PUBLIC_
export const clientConfig = {
  sitePassword: process.env.NEXT_PUBLIC_SITE_PASSWORD || '',
  eventTitle: process.env.NEXT_PUBLIC_EVENT_TITLE || 'Our Event',
  eventSubtitle: process.env.NEXT_PUBLIC_EVENT_SUBTITLE || '',
  theme: (process.env.NEXT_PUBLIC_THEME || 'midnight') as ThemeKey,
  uploadFormUrl: process.env.NEXT_PUBLIC_UPLOAD_FORM_URL || '',
  refreshInterval: parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || '300000', 10),
};
