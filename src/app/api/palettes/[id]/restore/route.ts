/**
 * Palette Restore API
 * POST /api/palettes/[id]/restore?version=N - Restore a specific version
 */

import { NextRequest, NextResponse } from 'next/server';
import { paletteService } from '@/services/palette.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const versionParam = request.nextUrl.searchParams.get('version');

    if (!versionParam) {
      return NextResponse.json(
        { success: false, error: 'version query parameter is required' },
        { status: 400 }
      );
    }

    const versionNumber = parseInt(versionParam);
    if (isNaN(versionNumber) || versionNumber < 1) {
      return NextResponse.json(
        { success: false, error: 'version must be a positive integer' },
        { status: 400 }
      );
    }

    const result = await paletteService.restoreVersion(id, versionNumber);

    return NextResponse.json(result, {
      status: result.success ? 200 : result.code || 500,
    });
  } catch (error) {
    console.error('POST /api/palettes/[id]/restore error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
