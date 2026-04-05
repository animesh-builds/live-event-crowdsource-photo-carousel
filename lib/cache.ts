// =============================================================================
// In-Memory Stale Cache
// =============================================================================
// Serves last-known-good photos when fresh fetch fails.
// Guests always see something — never a blank screen.
// =============================================================================

import { DrivePhoto } from './drive';

interface CacheEntry {
  photos: DrivePhoto[];
  timestamp: number;
}

let cache: CacheEntry | null = null;

export function getCached(): DrivePhoto[] | null {
  return cache?.photos ?? null;
}

export function setCache(photos: DrivePhoto[]): void {
  cache = { photos, timestamp: Date.now() };
}

export function isCacheFresh(maxAgeMs = 5 * 60 * 1000): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < maxAgeMs;
}

export function clearCache(): void {
  cache = null;
}
