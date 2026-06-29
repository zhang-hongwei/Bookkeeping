/**
 * Palette API - Get, Update, Delete
 * GET    /api/palettes/[id]   - Get a palette
 * PUT    /api/palettes/[id]   - Update a palette (auto-creates version snapshot)
 * DELETE /api/palettes/[id]   - Delete a palette
 */

import { NextRequest, NextResponse } from 'next/server';
import { paletteService } from '@/services/palette.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await paletteService.getPalette(id);

    return NextResponse.json(result, {
      status: result.success ? 200 : result.code || 500,
    });
  } catch (error) {
    console.error('GET /api/palettes/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await paletteService.updatePalette(id, body);

    return NextResponse.json(result, {
      status: result.success ? 200 : result.code || 500,
    });
  } catch (error) {
    console.error('PUT /api/palettes/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await paletteService.deletePalette(id);

    return NextResponse.json(result, {
      status: result.success ? 200 : result.code || 500,
    });
  } catch (error) {
    console.error('DELETE /api/palettes/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
