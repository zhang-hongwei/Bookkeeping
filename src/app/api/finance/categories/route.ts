/**
 * 分类 API。
 * - GET  /api/finance/categories   列表（可按 kind 过滤）
 * - POST /api/finance/categories   创建自定义分类（含自动归类关键字）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../_lib/auth';
import { createCategorySchema } from '../_lib/validation';
import { categoryRepository } from '@/repositories/finance/category.repository';
import type { CategoryKind } from '@/database/schema/finance';

export async function GET(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const { searchParams } = request.nextUrl;
    const kind = searchParams.get('kind') as CategoryKind | null;
    const categories = await categoryRepository(userId).list(kind ?? undefined);
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('GET /api/finance/categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '请求体不是合法 JSON', code: 'BAD_BODY' },
        { status: 400 },
      );
    }

    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: '参数校验失败',
          code: 'VALIDATION',
          details: parsed.error.flatten(),
        },
        { status: 422 },
      );
    }
    const v = parsed.data;

    const category = await categoryRepository(userId).create({
      name: v.name,
      kind: v.kind,
      parentId: v.parentId,
      keywords: v.keywords,
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('POST /api/finance/categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL' },
      { status: 500 },
    );
  }
}
