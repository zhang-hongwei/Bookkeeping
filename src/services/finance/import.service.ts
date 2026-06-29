/**
 * 账单导入服务（US3）。
 *
 * 流程（R7）：parse → 候选 bill_import_rows → 去重标记 → preview →
 * confirm（落库走 ledger.createTransaction，原子维护余额）。
 *
 * 去重（SC-006）：对每行计算归一化哈希 hash(occurredAt + amount + counterparty + memo)，
 * 落库前与该用户已 status=imported 的 rows 比对，命中 → duplicate。
 */
import { createHash } from 'node:crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/database/client';
import {
  billImports,
  billImportRows,
  type ParsedTx,
  type BillImportRowItem,
  type BillImportItem,
  type BillImportSource,
} from '@/database/schema/finance';
import { createTransaction } from './ledger.service';
import { accountRepository } from '@/repositories/finance/account.repository';
import { categoryRepository } from '@/repositories/finance/category.repository';
import { detectParser, type BillRow } from './import/parsers';

/** 归一化时间字符串为可解析的 ISO 形式（兼容 "2024-06-01 12:34:56"）。 */
function normalizeTime(raw: string): string {
  const withT = raw.trim().replace(' ', 'T');
  const d = new Date(withT);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/** 计算行哈希（归一化：时间 ISO + 金额 + 对方/备注小写去空白）。 */
function computeRowHash(row: {
  occurredAt: string;
  amount: string;
  counterparty?: string;
  note?: string;
}): string {
  const input = [
    row.occurredAt,
    row.amount,
    (row.counterparty ?? '').toLowerCase().trim(),
    (row.note ?? '').toLowerCase().trim(),
  ].join('|');
  return createHash('sha1').update(input).digest('hex');
}

export interface StartImportInput {
  source?: BillImportSource;
  rawText: string;
  fileName?: string;
}

/** 启动一次导入：解析 → 去重 → 写入 preview 批次与候选行。 */
export async function startImport(userId: string, input: StartImportInput): Promise<{
  billImportId: string;
  total: number;
  preview: Array<{ id: string; status: BillImportRowItem['status']; parsed: ParsedTx }>;
}> {
  const parser = input.source
    ? detectParser(input.rawText) // 仍用自动检测；source 仅作记录
    : detectParser(input.rawText);
  if (!parser) {
    // 无法识别格式：创建 failed 批次以便前端展示原因
    const [batch] = await db
      .insert(billImports)
      .values({
        userId,
        source: input.source ?? 'generic_csv',
        fileName: input.fileName,
        status: 'failed',
      })
      .returning();
    return { billImportId: batch!.id, total: 0, preview: [] };
  }

  const rows = parser.parse(input.rawText).filter((r) => r.direction !== 'other');

  // 默认账户与自动归类建议
  const accounts = await accountRepository(userId).list();
  const defaultAccountId = accounts[0]?.id;
  const categoryRepo = categoryRepository(userId);

  const candidates: ParsedTx[] = [];
  const hashes: string[] = [];
  for (const r of rows) {
    const occurredAt = normalizeTime(r.occurredAt);
    const text = [r.counterparty, r.note].filter(Boolean).join(' ');
    const cat =
      r.direction === 'income'
        ? await categoryRepo.autoCategorize(text, 'income')
        : await categoryRepo.autoCategorize(text, 'expense');
    candidates.push({
      amount: r.amount,
      type: r.direction === 'income' ? 'income' : 'expense',
      counterparty: r.counterparty,
      note: [r.counterparty, r.note].filter(Boolean).join(' '),
      occurredAt,
      categoryId: cat?.id,
      accountId: defaultAccountId,
    });
    hashes.push(
      computeRowHash({
        occurredAt,
        amount: r.amount,
        counterparty: r.counterparty,
        note: r.note,
      }),
    );
  }

  // 去重：该用户已 imported 的 rowHash 集合
  const existing = hashes.length
    ? await db
        .select({ rowHash: billImportRows.rowHash })
        .from(billImportRows)
        .where(
          and(
            eq(billImportRows.userId, userId),
            eq(billImportRows.status, 'imported'),
            inArray(billImportRows.rowHash, hashes),
          ),
        )
    : [];
  const importedHashes = new Set(existing.map((e) => e.rowHash));

  const [batch] = await db
    .insert(billImports)
    .values({
      userId,
      source: parser.source,
      fileName: input.fileName,
      status: 'preview',
      total: candidates.length,
    })
    .returning();

  const rowValues = candidates.map((parsed, i) => ({
    billImportId: batch!.id,
    userId,
    rowHash: hashes[i],
    parsed,
    status: importedHashes.has(hashes[i]) ? ('duplicate' as const) : ('pending' as const),
  }));
  const inserted = rowValues.length
    ? await db.insert(billImportRows).values(rowValues).returning({
        id: billImportRows.id,
        status: billImportRows.status,
        parsed: billImportRows.parsed,
      })
    : [];

  return { billImportId: batch!.id, total: candidates.length, preview: inserted };
}

export interface ImportBatchDetail {
  batch: BillImportItem;
  rows: BillImportRowItem[];
}

/** 获取批次详情（含候选行，供预览/调整）。 */
export async function getImport(userId: string, id: string): Promise<ImportBatchDetail | null> {
  const [batch] = await db
    .select()
    .from(billImports)
    .where(and(eq(billImports.id, id), eq(billImports.userId, userId)))
    .limit(1);
  if (!batch) return null;
  const rows = await db
    .select()
    .from(billImportRows)
    .where(eq(billImportRows.billImportId, id));
  return { batch, rows };
}

/** 确认导入：将选中（或全部 pending）行落库为交易，标记 imported，更新计数。 */
export async function confirmImport(
  userId: string,
  id: string,
  options: { rowIds?: string[]; defaultAccountId?: string } = {},
): Promise<{ imported: number; skipped: number; failed: number }> {
  const detail = await getImport(userId, id);
  if (!detail) throw new Error('导入批次不存在');

  const targetRowIds = options.rowIds ?? detail.rows.map((r) => r.id);
  const toImport = detail.rows.filter(
    (r) => targetRowIds.includes(r.id) && r.status === 'pending',
  );

  let imported = 0;
  let failed = 0;
  for (const row of toImport) {
    const parsed = row.parsed;
    const accountId = parsed.accountId ?? options.defaultAccountId;
    if (!accountId || !parsed.amount) {
      await db
        .update(billImportRows)
        .set({ status: 'error' })
        .where(eq(billImportRows.id, row.id));
      failed++;
      continue;
    }
    try {
      await createTransaction({
        userId,
        type: parsed.type === 'income' ? 'income' : 'expense',
        amount: parsed.amount,
        fromAccountId: parsed.type === 'income' ? undefined : accountId,
        toAccountId: parsed.type === 'income' ? accountId : undefined,
        categoryId: parsed.categoryId,
        occurredAt: parsed.occurredAt ? new Date(parsed.occurredAt) : undefined,
        note: parsed.note,
        source: 'import',
        confidence: '0.80',
        billImportId: id,
      });
      await db
        .update(billImportRows)
        .set({ status: 'imported' })
        .where(eq(billImportRows.id, row.id));
      imported++;
    } catch {
      await db
        .update(billImportRows)
        .set({ status: 'error' })
        .where(eq(billImportRows.id, row.id));
      failed++;
    }
  }

  const skipped = detail.rows.filter(
    (r) => r.status === 'duplicate' || r.status === 'error',
  ).length;

  await db
    .update(billImports)
    .set({ status: 'confirmed', imported, skipped: skipped + failed, updatedAt: new Date() })
    .where(eq(billImports.id, id));

  return { imported, skipped: skipped + failed, failed };
}
