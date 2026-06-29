/**
 * 账单导入 API（US3）。
 * - POST /api/finance/import   上传账单文本/文件 → 解析去重 → 进入 preview
 *
 * 支持 JSON `{ source?, rawText, fileName? }` 或 multipart（字段 `file`）。
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/app/api/finance/_lib/auth';
import { startImport } from '@/services/finance/import.service';
import type { BillImportSource } from '@/database/schema/finance';

export async function POST(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    let source: BillImportSource | undefined;
    let rawText: string | undefined;
    let fileName: string | undefined;

    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
      const fd = await request.formData();
      const file = fd.get('file');
      if (file instanceof File) {
        rawText = await file.text();
        fileName = file.name;
      } else {
        rawText = String(fd.get('rawText') ?? '');
      }
      const s = fd.get('source');
      if (typeof s === 'string') source = s as BillImportSource;
    } else {
      const body = await request.json();
      rawText = body?.rawText;
      source = body?.source;
      fileName = body?.fileName;
    }

    if (!rawText || rawText.trim() === '') {
      return NextResponse.json(
        { error: '缺少账单内容', code: 'VALIDATION' },
        { status: 422 },
      );
    }

    const result = await startImport(userId, { source, rawText, fileName });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /api/finance/import error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
