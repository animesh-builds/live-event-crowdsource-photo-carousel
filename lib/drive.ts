// =============================================================================
// Google Drive Photo Fetcher
// =============================================================================
// Recursively fetches image files from a public Drive folder.
// Handles guest-created subfolders, timeouts, and partial failures.
// =============================================================================

export interface DrivePhoto {
  id: string;
  name: string;
  mimeType: string;
  thumbnailUrl: string;
  fullUrl: string;
}

const API_BASE = 'https://www.googleapis.com/drive/v3/files';
const MAX_DEPTH = 3;
const FETCH_TIMEOUT = 8000;

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, next: { revalidate: 300 } } as RequestInit);
  } finally {
    clearTimeout(id);
  }
}

async function fetchFilesInFolder(
  folderId: string,
  apiKey: string,
  depth = 0
): Promise<DrivePhoto[]> {
  if (depth > MAX_DEPTH) return [];

  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id,name,mimeType)',
    pageSize: '200',
    key: apiKey,
  });

  let res: Response;
  try {
    res = await fetchWithTimeout(`${API_BASE}?${params}`, FETCH_TIMEOUT);
  } catch (err) {
    console.warn(`Skipping folder ${folderId} (depth ${depth}):`, err);
    return [];
  }

  if (!res.ok) {
    console.warn(`Drive API error ${res.status} for folder ${folderId}`);
    return [];
  }

  const data = await res.json();
  const files: Array<{ id: string; name: string; mimeType: string }> = data.files || [];

  const photos: DrivePhoto[] = [];
  const subfolderFetches: Promise<DrivePhoto[]>[] = [];

  for (const file of files) {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      subfolderFetches.push(fetchFilesInFolder(file.id, apiKey, depth + 1));
    } else if (file.mimeType.startsWith('image/')) {
      photos.push({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`,
        fullUrl: `https://drive.google.com/uc?export=view&id=${file.id}`,
      });
    }
  }

  const settled = await Promise.allSettled(subfolderFetches);
  const subPhotos = settled
    .filter((r): r is PromiseFulfilledResult<DrivePhoto[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  return [...photos, ...subPhotos];
}

export async function fetchPhotosFromDrive(
  folderId: string,
  apiKey: string
): Promise<DrivePhoto[]> {
  return fetchFilesInFolder(folderId, apiKey, 0);
}
