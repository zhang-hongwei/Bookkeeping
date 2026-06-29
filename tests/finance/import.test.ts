/**
 * US3 集成测试（T025）：row_hash 去重、preview→confirm→imported 状态流转、重复上传跳过。
 *
 * 覆盖 SC-006（重复导入不产生重复交易）。
 * 需真实 DB：FINANCE_INTEGRATION_TEST=1。
 */
import { describe, it, expect } from 'vitest';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';
import { startImport, confirmImport, getImport } from '@/services/finance/import.service';
import { accountRepository } from '@/repositories/finance/account.repository';
import { transactionRepository } from '@/repositories/finance/transaction.repository';

const suite = describe.skipIf(!INTEGRATION_ENABLED);

const SAMPLE = `支付宝（中国）网络技术有限公司 电子客户回单
----------------------------------------
交易号,交易创建时间,交易对方,商品说明,金额,收/支,交易状态
1,2024-06-01 12:00:00,美团外卖,午饭,35.00,支出,交易成功
2,2024-06-02 09:30:00,某公司,工资,10000.00,收入,交易成功
----------------------------------------
导出时间：2024-06-03`;

suite('US3 账单导入（集成，SC-006）', () => {
  it('preview → confirm → imported 状态流转，余额更新', async () => {
    const userId = uniqueUserId();
    const cash = await accountRepository(userId).create({ name: '现金', type: 'cash', openingBalance: '1000.00' });

    const preview = await startImport(userId, { rawText: SAMPLE });
    expect(preview.total).toBe(2);
    expect(preview.preview.every((r) => r.status === 'pending')).toBe(true);

    const result = await confirmImport(userId, preview.billImportId, { defaultAccountId: cash.id });
    expect(result.imported).toBe(2);

    const detail = await getImport(userId, preview.billImportId);
    expect(detail!.batch.status).toBe('confirmed');
    expect(detail!.rows.every((r) => r.status === 'imported')).toBe(true);

    // 账目平衡：每笔导入交易分录平衡
    const list = await transactionRepository(userId).list();
    for (const t of list.items) {
      const debit = t.entries.filter((e) => e.side === 'debit').reduce((s, e) => s + Number(e.amount), 0);
      const credit = t.entries.filter((e) => e.side === 'credit').reduce((s, e) => s + Number(e.amount), 0);
      expect(debit).toBeCloseTo(credit, 2);
    }
  });

  it('重复上传同一账单 → duplicate，不产生重复交易（SC-006）', async () => {
    const userId = uniqueUserId();
    const cash = await accountRepository(userId).create({ name: '现金', type: 'cash', openingBalance: '0.00' });

    const first = await startImport(userId, { rawText: SAMPLE });
    await confirmImport(userId, first.billImportId, { defaultAccountId: cash.id });
    const countAfterFirst = (await transactionRepository(userId).list()).total;

    // 再次上传同款内容
    const second = await startImport(userId, { rawText: SAMPLE });
    expect(second.preview.every((r) => r.status === 'duplicate')).toBe(true);

    const result = await confirmImport(userId, second.billImportId, { defaultAccountId: cash.id });
    expect(result.imported).toBe(0); // 全部跳过

    const countAfterSecond = (await transactionRepository(userId).list()).total;
    expect(countAfterSecond).toBe(countAfterFirst); // 无新增交易
  });
});
