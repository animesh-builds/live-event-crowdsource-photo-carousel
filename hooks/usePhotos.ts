'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DrivePhoto } from '@/lib/drive';

// Extract a grouping key from filename — strips trailing sequence numbers
// e.g., "20260321_154942.heic" → "20260321_1549" (groups burst shots together)
function getPhotoGroup(photo: DrivePhoto): string {
  const name = photo.name.replace(/\.[^.]+$/, ''); // strip extension
  // Keep first ~80% of the name as group key — clusters burst shots
  return name.slice(0, Math.max(name.length - 3, 4));
}

// Fisher-Yates shuffle
function basicShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shuffle then spread similar photos apart to avoid clusters
function shuffle(photos: DrivePhoto[]): DrivePhoto[] {
  if (photos.length < 3) return basicShuffle(photos);

  const shuffled = basicShuffle(photos);

  // Group photos by filename prefix
  const groups = new Map<string, DrivePhoto[]>();
  for (const photo of shuffled) {
    const key = getPhotoGroup(photo);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(photo);
  }

  // Interleave: pick one from each group in round-robin
  const groupArrays = basicShuffle([...groups.values()]);
  const result: DrivePhoto[] = [];
  let remaining = true;

  while (remaining) {
    remaining = false;
    for (const group of groupArrays) {
      if (group.length > 0) {
        result.push(group.shift()!);
        remaining = remaining || group.length > 0;
      }
    }
  }

  return result;
}

const RETRY_DELAYS_MS = [30_000, 60_000, 300_000];

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error' | 'stale';

export function usePhotos(refreshIntervalMs = 300_000) {
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const isFetching = useRef(false);
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAndUpdate = useCallback(async (isRetry = false) => {
    if (isFetching.current) return;
    isFetching.current = true;

    if (!isRetry) setStatus((prev) => (prev === 'idle' ? 'loading' : prev));

    try {
      const res = await fetch('/api/photos');
      const data = await res.json();
      const incoming: DrivePhoto[] = data.photos || [];

      if (incoming.length > 0) {
        // Soft refresh: only reshuffle if photo count changed
        setPhotos((prev) =>
          prev.length !== incoming.length ? shuffle(incoming) : prev
        );
        setCount(data.count || incoming.length);
        setStatus(data.stale ? 'stale' : 'success');
        retryCount.current = 0;
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        setStatus('success');
        setCount(0);
      }
    } catch (err) {
      console.error('Photo fetch failed:', err);
      const delay =
        RETRY_DELAYS_MS[Math.min(retryCount.current, RETRY_DELAYS_MS.length - 1)];
      retryCount.current++;
      if (retryTimer.current) clearTimeout(retryTimer.current);
      retryTimer.current = setTimeout(() => fetchAndUpdate(true), delay);
      setStatus((prev) =>
        prev === 'success' || prev === 'stale' ? prev : 'error'
      );
    } finally {
      isFetching.current = false;
    }
  }, []);

  const refresh = useCallback(() => {
    retryCount.current = 0;
    fetchAndUpdate();
  }, [fetchAndUpdate]);

  useEffect(() => {
    fetchAndUpdate();
    const interval = setInterval(() => fetchAndUpdate(), refreshIntervalMs);
    return () => {
      clearInterval(interval);
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [fetchAndUpdate, refreshIntervalMs]);

  return { photos, count, status, refresh };
}
