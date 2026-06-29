/**
 * Unsplash API service for poster-card editor
 * Handles photo search, orientation filtering, and attribution
 */

const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ?? '';

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
    links: { html: string };
  };
  width: number;
  height: number;
  color: string;
  description?: string;
  alt_description?: string;
}

export interface UnsplashSearchResult {
  photos: UnsplashPhoto[];
  total: number;
  totalPages: number;
}

export type Orientation = 'landscape' | 'portrait' | 'squarish';

const PER_PAGE = 30;

export async function searchPhotos(
  query: string,
  page = 1,
  orientation?: Orientation,
): Promise<UnsplashSearchResult> {
  if (!ACCESS_KEY) {
    return { photos: [], total: 0, totalPages: 0 };
  }

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('per_page', PER_PAGE.toString());
  if (orientation) {
    url.searchParams.set('orientation', orientation);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
  });

  if (!res.ok) {
    throw new Error(`Unsplash API error: ${res.status}`);
  }

  const data = await res.json();
  return {
    photos: data.results,
    total: data.total,
    totalPages: data.total_pages,
  };
}

/** Build an image URL with custom dimensions for use on the canvas */
export function getPhotoUrl(photo: UnsplashPhoto, width: number, height: number): string {
  return `${photo.urls.raw}&w=${width}&h=${height}&fit=crop&q=80`;
}

/** Attribution text required by Unsplash API guidelines */
export function getAttribution(photo: UnsplashPhoto): string {
  return `Photo by ${photo.user.name} on Unsplash`;
}
