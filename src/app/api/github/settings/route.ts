import { NextRequest, NextResponse } from 'next/server';
import { githubSettingsService } from '@/services/github-settings.service';

export async function GET() {
  try {
    const result = await githubSettingsService.getSettings();
    return NextResponse.json(result, {
      status: result.success ? 200 : result.code || 500,
    });
  } catch (error) {
    console.error('[github-settings] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const githubToken = data?.githubToken;

    if (!githubToken || typeof githubToken !== 'string') {
      return NextResponse.json(
        { success: false, error: 'githubToken is required', code: 400 },
        { status: 400 },
      );
    }

    const result = await githubSettingsService.saveSettings(githubToken);
    return NextResponse.json(result, {
      status: result.success ? 200 : result.code || 500,
    });
  } catch (error) {
    console.error('[github-settings] PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const result = await githubSettingsService.deleteSettings();
    return NextResponse.json(result, {
      status: result.success ? 200 : result.code || 500,
    });
  } catch (error) {
    console.error('[github-settings] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
