/**
 * 定投计划服务（Phase 3，US3）—— 仅配置/标记 CRUD。
 *
 * 注：IRR 的真相源是 `finance_investment_trades`（实际买入时点/金额），而非本计划。
 * 本服务仅用于「记录定投历史/计划」与 UI 展示；`active=false` 表示中断/暂停。
 */
import { dcaPlanRepository, type CreateDcaPlanInput } from '@/repositories/finance/dca-plan.repository';
import type { DcaPlanItem } from '@/database/schema/finance';

/** 创建定投计划。 */
export async function createDcaPlan(
  userId: string,
  input: CreateDcaPlanInput,
): Promise<DcaPlanItem> {
  return dcaPlanRepository(userId).create(input);
}

/** 列出定投计划。 */
export async function listDcaPlans(userId: string): Promise<DcaPlanItem[]> {
  return dcaPlanRepository(userId).list();
}
