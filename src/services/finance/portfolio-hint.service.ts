/**
 * 组合优化方向服务（Phase 7，US4，FR-004/SC-004/SC-005）。
 *
 * 两层架构（NC5）：取数（持仓总市值 + instrumentType）→ 确定性引擎 portfolio-hint.engine
 * → 落表（新 batchId 整组覆盖）→ 返回落表行（供 toPortfolioHintsDto 序列化）。
 * - 降级（NC6）：无持仓 / 总市值 0 → 空 hints（不编造），仍写空批次（保留 batchId）。
 * - 溯源（NC7）：engineVersion + targetBandsVersion + disclaimers「非投资建议」。
 * - I11：hint 仅方向，不含品种/买卖数量。
 */
import { listPositions } from './investment.service';
import {
  aggregateByAssetClass,
  computeHints,
  PORTFOLIO_HINT_ENGINE_NAME,
  PORTFOLIO_HINT_ENGINE_VERSION,
} from './portfolio-hint.engine';
import { targetBands } from './config/target-bands';
import { fromCents } from './money';
import { portfolioHintRepository } from '@/repositories/finance/portfolio-hint.repository';
import {
  engineVersion,
  disclaimersFor,
} from '@/app/api/finance/_lib/analysis-common';
import type { PortfolioHintItem } from '@/database/schema/finance';

export interface ComputePortfolioHintsInput {
  userId: string;
}

export interface PortfolioHintsResult {
  batchId: string;
  targetBandsVersion: string;
  totalMarketValue: string;
  hints: PortfolioHintItem[];
  engineVersion: string;
  disclaimers: string[];
}

/** 最近一批方向建议（interpret 用）。 */
export interface StoredPortfolioHints {
  batchId: string;
  hints: PortfolioHintItem[];
  targetBandsVersion: string;
  engineVersion: string;
}

/**
 * 计算并保存组合优化方向（随持仓重算覆盖）。
 * - 取 positions → 引擎聚合 + 方向 → 落新批次 → 返回落表行（含 totalMarketValue）。
 * - 无持仓/总市值 0 → hints 空（NC6 不编造），仍写空批次。
 */
export async function computeHintsForUser(
  input: ComputePortfolioHintsInput,
): Promise<PortfolioHintsResult> {
  const repo = portfolioHintRepository(input.userId);
  const engVersion = engineVersion(
    PORTFOLIO_HINT_ENGINE_NAME,
    PORTFOLIO_HINT_ENGINE_VERSION,
  );
  const disclaimers = disclaimersFor('portfolio'); // 强制含「非投资建议」

  const positions = await listPositions(input.userId, { includeClosed: false });
  const { items: ratios, totalCents } = aggregateByAssetClass(
    positions.map((p) => ({
      instrumentType: p.position.instrumentType,
      marketValue: p.marketValue,
    })),
  );
  const hints = computeHints(ratios, targetBands.bands);

  const rows = await repo.replaceBatch(
    hints.map((h) => ({
      assetClass: h.assetClass,
      currentRatio: h.currentRatio.toFixed(6),
      targetBand: h.targetBand,
      direction: h.direction,
      reason: h.reason,
      targetBandsVersion: targetBands.targetBandsVersion,
      engineVersion: engVersion,
      disclaimers,
    })),
  );
  const batchId = rows[0]?.batchId ?? crypto.randomUUID();

  return {
    batchId,
    targetBandsVersion: targetBands.targetBandsVersion,
    totalMarketValue: fromCents(totalCents),
    hints: rows,
    engineVersion: engVersion,
    disclaimers,
  };
}

/** 取最近一批落表的方向建议（无或空 → null）。供 /interpret 消费结构化结果。 */
export async function getLatestStoredHints(
  userId: string,
): Promise<StoredPortfolioHints | null> {
  const latest = await portfolioHintRepository(userId).findLatestByUser();
  if (!latest || latest.items.length === 0) return null;
  const head = latest.items[0];
  return {
    batchId: latest.batchId,
    targetBandsVersion: head.targetBandsVersion,
    engineVersion: head.engineVersion,
    hints: latest.items,
  };
}
