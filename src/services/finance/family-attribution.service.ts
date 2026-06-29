/**
 * 家庭成员收支画像服务（Phase 4 / US2）。
 *
 * 归属口径（research.md 决策4）：按 transactions.member_id 聚合（谁花/谁赚），
 * 与账号 owner 正交。joint 成员的画像 = 共同消费/收入合计（不计入任何个人，I6）。
 *
 * 金额一律经「分」整数运算（toCents/fromCents），禁止浮点（I8）。
 */
import { and, eq, gte, lt } from 'drizzle-orm';
import { db } from '@/database/client';
import { transactions, categories } from '@/database/schema/finance';
import { familyRepository } from '@/repositories/finance/family.repository';
import { toCents, fromCents } from './money';
import { ShareScopeError } from './balance.service';

export interface MemberProfile {
  memberId: string;
  displayName: string;
  role: string;
  income: string;
  expense: string;
  surplus: string;
  topCategories: { categoryId: string | null; name: string; amount: string }[];
}

function monthRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

/**
 * 成员支出画像（按 memberId 聚合 income/expense/surplus + 支出分类 Top5）。
 * joint 成员返回「共同」合计语义。调用者须为家庭成员。
 */
export async function getMemberProfile(input: {
  familyId: string;
  userId: string;
  memberId: string;
  from?: string;
  to?: string;
}): Promise<MemberProfile> {
  const caller = await familyRepository.findActiveMember(input.familyId, input.userId);
  if (!caller) throw new ShareScopeError('无权访问该家庭数据');

  const target = await familyRepository.findMemberById(input.memberId);
  if (!target || target.familyId !== input.familyId)
    throw new ShareScopeError('成员不存在');

  const range = {
    from: input.from ?? monthRange().from,
    to: input.to ?? monthRange().to,
  };
  const fromTs = new Date(range.from + 'T00:00:00Z');
  const toTsExclusive = new Date(range.to + 'T00:00:00Z');

  const rows = await db
    .select({
      type: transactions.type,
      amount: transactions.amount,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.memberId, input.memberId),
        gte(transactions.occurredAt, fromTs),
        lt(transactions.occurredAt, toTsExclusive),
      ),
    );

  let incomeCents = 0;
  let expenseCents = 0;
  const catCents = new Map<string, { name: string; cents: number }>();
  for (const r of rows) {
    const c = toCents(r.amount);
    if (r.type === 'income') {
      incomeCents += c;
    } else if (r.type === 'expense') {
      expenseCents += c;
      const key = r.categoryId ?? '__none__';
      const prev = catCents.get(key) ?? { name: r.categoryName ?? '未分类', cents: 0 };
      prev.cents += c;
      catCents.set(key, prev);
    }
  }

  const topCategories = [...catCents.entries()]
    .map(([id, v]) => ({
      categoryId: id === '__none__' ? null : id,
      name: v.name,
      amount: fromCents(v.cents),
    }))
    .sort((a, b) => toCents(b.amount) - toCents(a.amount))
    .slice(0, 5);

  return {
    memberId: target.id,
    displayName: target.displayName,
    role: target.role,
    income: fromCents(incomeCents),
    expense: fromCents(expenseCents),
    surplus: fromCents(incomeCents - expenseCents),
    topCategories,
  };
}
