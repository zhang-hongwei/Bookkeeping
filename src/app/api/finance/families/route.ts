/**
 * 家庭（列表 / 创建）API（Phase 4 / US1）。
 * - GET   /api/finance/families        我的家庭列表（active 成员）
 * - POST  /api/finance/families        创建家庭（创建者=self，自动生成 joint）
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '../_lib/auth';
import { createFamilySchema } from '../_lib/validation';
import { toFamilyDto, toFamilyMemberDto } from '../_lib/serialize';
import { createFamily, listMyFamilies } from '@/services/finance/family.service';
import { familyRepository } from '@/repositories/finance/family.repository';
import { ShareScopeError } from '@/services/finance/balance.service';

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
    const parsed = createFamilySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数校验失败', code: 'VALIDATION', details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const { family, members } = await createFamily({
      userId,
      name: parsed.data.name,
      defaultCurrency: parsed.data.defaultCurrency,
    });
    const memberCount = await familyRepository.countHumanActiveMembers(family.id);
    return NextResponse.json(
      {
        family: toFamilyDto(family, memberCount),
        members: members.map(toFamilyMemberDto),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ShareScopeError) {
      return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('POST /api/finance/families error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const authed = await requireUserId();
    if (authed instanceof NextResponse) return authed;
    const userId = authed;

    const families = await listMyFamilies(userId);
    const out = [];
    for (const f of families) {
      const memberCount = await familyRepository.countHumanActiveMembers(f.id);
      out.push(toFamilyDto(f, memberCount));
    }
    return NextResponse.json({ families: out });
  } catch (error) {
    console.error('GET /api/finance/families error:', error);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL' }, { status: 500 });
  }
}
