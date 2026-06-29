/**
 * Palette Versions API
 * GET /api/palettes/[id]/versions - List version history
 */

import { NextRequest, NextResponse } from 'next/server';
import { paletteService } from '@/services/palette.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await paletteService.getVersions(id);

    return NextResponse.json(result, {
      status: result.success ? 200 : result.code || 500,
    });
  } catch (error) {
    console.error('GET /api/palettes/[id]/versions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
