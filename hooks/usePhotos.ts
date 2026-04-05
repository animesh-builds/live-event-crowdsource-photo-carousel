'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DrivePhoto } from '@/lib/drive';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
