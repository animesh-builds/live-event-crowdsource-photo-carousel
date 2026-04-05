import { NextResponse } from 'next/server';
import { fetchPhotosFromDrive } from '@/lib/drive';
import { getCached, setCache } from '@/lib/cache';

export const revalidate = 300;

export async function GET() {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!apiKey || !folderId) {
    const stale = getCached();
    if (stale) {
      return NextResponse.json({ photos: stale, count: stale.length, stale: true });
    }
    return NextResponse.json(
      { error: 'Server misconfiguration — missing Drive credentials', photos: [], count: 0 },
      { status: 500 }
    );
  }

  try {
    const photos = await fetchPhotosFromDrive(folderId, apiKey);
    if (photos.length > 0) {
      setCache(photos);
    }
    return NextResponse.json({ photos, count: photos.length, stale: false });
  } catch (err) {
    console.error('Drive fetch failed:', err);
    const stale = getCached();
    if (stale && stale.length > 0) {
      console.log(`Serving ${stale.length} stale photos`);
      return NextResponse.json({ photos: stale, count: stale.length, stale: true });
    }
    return NextResponse.json(
      { error: 'Failed to fetch photos', photos: [], count: 0 },
      { status: 500 }
    );
  }
}
