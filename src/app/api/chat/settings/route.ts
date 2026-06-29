import { NextRequest, NextResponse } from 'next/server';
import { chatSettingsService } from '@/services/chat-settings.service';

export async function GET() {
  try {
    const result = await chatSettingsService.getSettings();
    return NextResponse.json(result, { status: result.success ? 200 : result.code || 500 });
  } catch (error) {
    console.error('[chat-settings] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await chatSettingsService.upsertSettings(data);
    return NextResponse.json(result, { status: result.success ? 200 : result.code || 500 });
  } catch (error) {
    console.error('[chat-settings] PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
