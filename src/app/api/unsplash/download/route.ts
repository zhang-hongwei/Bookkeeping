/**
 * Unsplash Download Tracking Proxy
 * GET /api/unsplash/download?photo_id=...
 *
 * Triggers Unsplash download tracking while keeping the access key server-side.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const photoId = searchParams.get('photo_id');

  if (!photoId) {
    return NextResponse.json(
      { error: 'photo_id parameter is required' },
      { status: 400 },
    );
  }

  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: 'Unsplash API key not configured' },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/${photoId}/download`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Unsplash API returned ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/unsplash/download error:', error);
    return NextResponse.json(
      { error: 'Failed to track download' },
      { status: 502 },
    );
  }
}
