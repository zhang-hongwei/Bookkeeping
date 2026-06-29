/**
 * Unsplash Proxy API
 * GET /api/unsplash?query=...&page=1&per_page=20
 *
 * Proxies search requests to the Unsplash API, keeping the access key server-side.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query = searchParams.get('query') || '';
  const page = searchParams.get('page') || '1';
  const perPage = searchParams.get('per_page') || '20';

  if (!query) {
    return NextResponse.json(
      { error: 'query parameter is required' },
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

  const params = new URLSearchParams({
    query,
    page,
    per_page: perPage,
  });

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?${params}`,
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
    console.error('GET /api/unsplash error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Unsplash' },
      { status: 502 },
    );
  }
}
