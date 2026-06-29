/**
 * 账单 CSV 解析器注册表（T027）。
 *
 * - 可插拔解析器：AlipayParser / WeChatParser / GenericCSVParser。
 * - 按表头自动识别格式（detectByHeader）。
 * - 产出 BillRow（结构中立），由 import.service 转为候选 ParsedTx。
 *
 * 设计权衡：真实支付宝/微信导出含前导说明行、引号包裹、千分位、尾部统计行，
 * 故解析步骤为：① 解析 CSV → ② 定位表头行 → ③ 按列名取值 → ④ 跳过非法行（尾部）。
 */
import type { BillImportSource } from '@/database/schema/finance';

export type Direction = 'income' | 'expense' | 'other';

/** 结构中立的账单行（来自源格式，尚未映射到账户/分类）。 */
export interface BillRow {
  occurredAt: string;
  amount: string; // 正金额
  direction: Direction;
  counterparty?: string;
  note?: string;
}

export interface BillParser {
  source: BillImportSource;
  /** 由表头 token 判断是否匹配该格式。 */
  detect(headerTokens: string[]): boolean;
  /** 解析整段 CSV 文本为账单行。 */
  parse(text: string): BillRow[];
}

/** 解析 CSV 文本为二维数组，支持引号包裹与转义。 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    pushField();
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      pushField();
    } else if (ch === '\n') {
      pushRow();
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) pushRow();
  return rows;
}

/** 把金额单元格归一为正数字符串（去除 ¥、千分位、空白；保留小数）。 */
function normalizeAmount(raw: string): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[¥$￥,\s]/g, '').replace(/^[+]+/, '');
  if (cleaned === '' || cleaned === '-') return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.abs(n).toFixed(2);
}

/** 在表头中查找首个命中的候选列名，返回列索引。 */
function findColumn(header: string[], candidates: string[]): number {
  for (const c of candidates) {
    const idx = header.findIndex((h) => h.includes(c));
    if (idx !== -1) return idx;
  }
  return -1;
}

/** 由「收/支」列值判定方向。 */
function parseDirection(value: string | undefined): Direction {
  if (!value) return 'other';
  if (value.includes('收')) return 'income';
  if (value.includes('支')) return 'expense';
  return 'other';
}

/** 定位表头行索引（首个命中必需 token 的行）。 */
function findHeaderRow(
  rows: string[][],
  required: string[],
): number {
  return rows.findIndex((r) => required.every((t) => r.some((cell) => cell.includes(t))));
}

/** 通用提取：给定表头与列名候选，从数据行构造 BillRow（income/expense only）。 */
function extractRows(
  rows: string[][],
  headerIdx: number,
  cols: {
    time: string[];
    amount: string[];
    direction?: string[];
    counterparty?: string[];
    note?: string[];
  },
): BillRow[] {
  const header = rows[headerIdx];
  const iTime = findColumn(header, cols.time);
  const iAmount = findColumn(header, cols.amount);
  const iDir = cols.direction ? findColumn(header, cols.direction) : -1;
  const iCounterparty = cols.counterparty ? findColumn(header, cols.counterparty) : -1;
  const iNote = cols.note ? findColumn(header, cols.note) : -1;
  if (iTime === -1 || iAmount === -1) return [];

  const out: BillRow[] = [];
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    const amount = normalizeAmount(row[iAmount] ?? '');
    if (amount === null) continue; // 跳过尾部统计/空行
    const direction = iDir !== -1 ? parseDirection(row[iDir]) : 'expense';
    out.push({
      occurredAt: (row[iTime] ?? '').trim(),
      amount,
      direction,
      counterparty: iCounterparty !== -1 ? (row[iCounterparty] ?? '').trim() : undefined,
      note: iNote !== -1 ? (row[iNote] ?? '').trim() : undefined,
    });
  }
  return out;
}

export const alipayParser: BillParser = {
  source: 'alipay',
  detect: (tokens) =>
    tokens.some((t) => t.includes('收/支')) &&
    tokens.some((t) => t.includes('金额')) &&
    tokens.some((t) => t.includes('商品说明') || t.includes('商品名称') || t.includes('商家订单号')),
  parse: (text) => {
    const rows = parseCsv(text);
    const headerIdx = findHeaderRow(rows, ['收/支']);
    if (headerIdx === -1) return [];
    return extractRows(rows, headerIdx, {
      time: ['时间'],
      amount: ['金额'],
      direction: ['收/支'],
      counterparty: ['交易对方'],
      note: ['商品说明', '商品名称', '备注'],
    });
  },
};

export const wechatParser: BillParser = {
  source: 'wechat',
  detect: (tokens) =>
    tokens.some((t) => t.includes('收/支')) &&
    tokens.some((t) => t.includes('交易类型') || t.includes('当前状态') || t.includes('微信')),
  parse: (text) => {
    const rows = parseCsv(text);
    const headerIdx = findHeaderRow(rows, ['收/支']);
    if (headerIdx === -1) return [];
    return extractRows(rows, headerIdx, {
      time: ['时间'],
      amount: ['金额'],
      direction: ['收/支'],
      counterparty: ['交易对方'],
      note: ['商品', '交易类型'],
    });
  },
};

export const genericCsvParser: BillParser = {
  source: 'generic_csv',
  detect: (tokens) => tokens.some((t) => t.includes('金额') || t.toLowerCase().includes('amount')),
  parse: (text) => {
    const rows = parseCsv(text);
    const headerIdx = rows.findIndex((r) =>
      r.some((t) => t.includes('金额') || t.toLowerCase().includes('amount')),
    );
    if (headerIdx === -1) return [];
    return extractRows(rows, headerIdx, {
      time: ['交易时间', '时间', 'time', 'date', '日期'],
      amount: ['金额', 'amount'],
      direction: ['收/支', 'type', '方向'],
      counterparty: ['交易对方', '对方', 'counterparty'],
      note: ['备注', '商品', 'note', 'memo'],
    });
  },
};

/** 解析器注册表（顺序即匹配优先级）。 */
export const PARSERS: BillParser[] = [alipayParser, wechatParser, genericCsvParser];

/** 把若干表头行交给注册表，返回首个匹配的解析器。 */
export function detectParser(text: string): BillParser | null {
  const rows = parseCsv(text).slice(0, 30); // 表头通常在前 30 行内
  for (const parser of PARSERS) {
    if (rows.some((r) => parser.detect(r))) return parser;
  }
  return null;
}
