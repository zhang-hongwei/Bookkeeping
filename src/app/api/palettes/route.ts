/**
 * Palettes API - List & Create
 * GET  /api/palettes          - List palettes with filters
 * POST /api/palettes          - Create a new palette
 */

import { NextRequest, NextResponse } from 'next/server';
import { paletteService } from '@/services/palette.service';
import type { ListPalettesFilters, PaletteCategory } from '@/types/palette';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filters: ListPalettesFilters = {
      category: (searchParams.get('category') as PaletteCategory) || undefined,
      favorite: searchParams.get('favorite') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as ListPalettesFilters['sortBy']) || 'updated',
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const result = await paletteService.listPalettes(filters);

    return NextResponse.json(result, {
      status: result.success ? 200 : result.code || 500,
    });
  } catch (error) {
    console.error('GET /api/palettes error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.themeData) {
      return NextResponse.json(
        { success: false, error: 'name and themeData are required' },
        { status: 400 }
      );
    }

    const result = await paletteService.createPalette(body);

    return NextResponse.json(result, {
      status: result.success ? 201 : result.code || 500,
    });
  } catch (error) {
    console.error('POST /api/palettes error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
