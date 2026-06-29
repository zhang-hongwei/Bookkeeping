/**
 * Google Fonts Proxy API
 * GET /api/google-fonts?sort=popularity
 *
 * Proxies requests to the Google Fonts Webfonts API, keeping the API key server-side.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sort = searchParams.get('sort') || 'popularity';

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Google Fonts API key not configured' },
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    key: apiKey,
    sort,
  });

  try {
    const res = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?${params}`,
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Google Fonts API returned ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/google-fonts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Google Fonts' },
      { status: 502 },
    );
  }
}
