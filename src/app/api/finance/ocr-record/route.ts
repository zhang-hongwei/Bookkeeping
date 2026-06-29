/**
 * 截图 OCR 记账 API（US2）。
 * - POST /api/finance/ocr-record   multipart `image` → 多模态识别 → 候选（不落库）
 *
 * 返回 { candidates, confidence, requireManualConfirm, reason? }。
 * 确认落库走 POST /api/finance/transactions（source: "ocr"）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { parseImage } from '@/services/finance/ocr-record.service';

export async function POST(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const formData = await request.formData();
    const file = formData.get('image');
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: '缺少 image 文件', code: 'VALIDATION' },
        { status: 422 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || 'image/jpeg';
    const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
    const result = await parseImage(userId, base64);
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/finance/ocr-record error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
