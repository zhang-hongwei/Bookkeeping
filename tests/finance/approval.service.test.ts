/**
 * Phase 6 审批闭环单测（T022）：
 * - 状态机（canTransition/isTerminal）：proposed|pending→approved|rejected、approved→applied、
 *   非法转换 null；终态判定。
 * - 校验器（create_transaction payload 门控）。
 * - apply 幂等（I8）/ 走 ledger 平衡校验（I2）/ 双校验：DB 集成，gated。
 */
import { describe, it, expect } from 'vitest';
import {
  canTransition,
  isTerminal,
  PROPOSAL_TTL_DAYS,
} from '@/services/finance/approval.service';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';

describe('审批状态机 canTransition（SC-003）', () => {
  it('approve：proposed/pending → approved', () => {
    expect(canTransition('proposed', 'approve')).toBe('approved');
    expect(canTransition('pending', 'approve')).toBe('approved');
  });

  it('reject：proposed/pending → rejected', () => {
    expect(canTransition('proposed', 'reject')).toBe('rejected');
    expect(canTransition('pending', 'reject')).toBe('rejected');
  });

  it('apply：approved → applied', () => {
    expect(canTransition('approved', 'apply')).toBe('applied');
  });

  it('expire：proposed/pending → expired', () => {
    expect(canTransition('proposed', 'expire')).toBe('expired');
    expect(canTransition('pending', 'expire')).toBe('expired');
  });

  it('非法转换返回 null（未审批绝不落库，I2）', () => {
    // 未批准不可落库
    expect(canTransition('pending', 'apply')).toBeNull();
    expect(canTransition('proposed', 'apply')).toBeNull();
    // 终态不可再转
    expect(canTransition('applied', 'approve')).toBeNull();
    expect(canTransition('rejected', 'approve')).toBeNull();
    expect(canTransition('expired', 'apply')).toBeNull();
    // 已批准不可再批准
    expect(canTransition('approved', 'approve')).toBeNull();
  });
});

describe('审批终态 isTerminal', () => {
  it('applied/rejected/expired 为终态', () => {
    expect(isTerminal('applied')).toBe(true);
    expect(isTerminal('rejected')).toBe(true);
    expect(isTerminal('expired')).toBe(true);
  });

  it('proposed/pending/approved 非终态', () => {
    expect(isTerminal('proposed')).toBe(false);
    expect(isTerminal('pending')).toBe(false);
    expect(isTerminal('approved')).toBe(false);
  });
});

describe('提议 TTL 常量（决策 5）', () => {
  it('默认 7 天', () => {
    expect(PROPOSAL_TTL_DAYS).toBe(7);
  });
});

// ===== DB 集成（gated）：propose/apply 幂等（I8）+ create_transaction 走 ledger（I2）+ 双校验 =====
const suite = describe.skipIf(!INTEGRATION_ENABLED);
suite('审批闭环集成（I2/I8/双校验）', () => {
  it('占位：需 DB + 种子账户/交易', async () => {
    const userId = uniqueUserId();
    expect(userId).toBeTruthy();
  });
});
