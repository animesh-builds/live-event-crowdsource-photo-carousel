// =============================================================================
// Content Moderation — Google Cloud Vision SafeSearch
// =============================================================================
// Checks photos against Vision SafeSearch API. Blocks explicit, violent, or
// racy content. Caches results by photo ID. Fail-open: if Vision API is down,
// all photos pass through (same resilience pattern as stale cache).
// =============================================================================

import { DrivePhoto } from './drive';

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';
const BATCH_SIZE = 16;
const BLOCK_LEVELS = new Set(['LIKELY', 'VERY_LIKELY']);

type Likelihood = 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';

interface SafeSearchAnnotation {
  adult: Likelihood;
  violence: Likelihood;
  racy: Likelihood;
  spoof: Likelihood;
  medical: Likelihood;
}

interface VisionResponse {
  responses: Array<{
    safeSearchAnnotation?: SafeSearchAnnotation;
    error?: { code: number; message: string };
  }>;
}

// In-memory moderation cache: photo ID → safe (true = allowed)
const moderationCache = new Map<string, boolean>();

function isSafe(annotation: SafeSearchAnnotation): boolean {
  return (
    !BLOCK_LEVELS.has(annotation.adult) &&
    !BLOCK_LEVELS.has(annotation.violence) &&
    !BLOCK_LEVELS.has(annotation.racy)
  );
}

async function checkBatch(
  photos: DrivePhoto[],
  apiKey: string
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();

  const requests = photos.map((photo) => ({
    image: { source: { imageUri: photo.thumbnailUrl } },
    features: [{ type: 'SAFE_SEARCH_DETECTION' }],
  }));

  try {
    const res = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    });

    if (!res.ok) {
      console.warn(`Vision API error ${res.status} — passing all photos through`);
      photos.forEach((p) => results.set(p.id, true));
      return results;
    }

    const data: VisionResponse = await res.json();

    data.responses.forEach((response, i) => {
      const photo = photos[i];
      if (response.error || !response.safeSearchAnnotation) {
        results.set(photo.id, true); // fail-open
      } else {
        results.set(photo.id, isSafe(response.safeSearchAnnotation));
      }
    });
  } catch (err) {
    console.warn('Vision API request failed — passing all photos through:', err);
    photos.forEach((p) => results.set(p.id, true));
  }

  return results;
}

export async function moderatePhotos(
  photos: DrivePhoto[],
  apiKey: string
): Promise<DrivePhoto[]> {
  const unchecked = photos.filter((p) => !moderationCache.has(p.id));

  // Batch-check unchecked photos
  for (let i = 0; i < unchecked.length; i += BATCH_SIZE) {
    const batch = unchecked.slice(i, i + BATCH_SIZE);
    const results = await checkBatch(batch, apiKey);
    results.forEach((safe, id) => moderationCache.set(id, safe));
  }

  return photos.filter((p) => moderationCache.get(p.id) !== false);
}
