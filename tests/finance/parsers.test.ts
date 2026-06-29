/**
 * CSV 解析器单元测试（纯函数，无需 DB）。
 *
 * 覆盖 parseCsv（引号/转义）与 AlipayParser（表头定位 + 列映射 + 方向）。
 */
import { describe, it, expect } from 'vitest';
import { parseCsv, alipayParser, detectParser } from '@/services/finance/import/parsers';

describe('parseCsv', () => {
  it('解析普通逗号分隔', () => {
    expect(parseCsv('a,b,c\n1,2,3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('处理引号包裹的字段（含逗号）', () => {
    expect(parseCsv('"a,b",c\n"x,y",z')).toEqual([
      ['a,b', 'c'],
      ['x,y', 'z'],
    ]);
  });

  it('处理转义双引号', () => {
    expect(parseCsv('"he said ""hi""",1')).toEqual([['he said "hi"', '1']]);
  });

  it('忽略空行与回车', () => {
    expect(parseCsv('a,b\r\n\r\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});

const ALIPAY_SAMPLE = `支付宝（中国）网络技术有限公司 电子客户回单
----------------------------------------
交易号,商家订单号,交易创建时间,交易对方,商品说明,金额,收/支,交易状态,备注
20240601,20240601,2024-06-01 12:00:00,美团外卖,午饭,35.00,支出,交易成功,
20240602,20240602,2024-06-02 09:30:00,某公司,工资,10000.00,收入,交易成功,
----------------------------------------
导出时间：2024-06-03`;

describe('alipayParser', () => {
  it('检测为 alipay 格式', () => {
    expect(detectParser(ALIPAY_SAMPLE)?.source).toBe('alipay');
  });

  it('定位表头并解析出收入/支出行', () => {
    const rows = alipayParser.parse(ALIPAY_SAMPLE);
    expect(rows).toHaveLength(2);
    const expense = rows.find((r) => r.direction === 'expense')!;
    expect(expense.amount).toBe('35.00');
    expect(expense.counterparty).toBe('美团外卖');
    expect(expense.note).toBe('午饭');
    const income = rows.find((r) => r.direction === 'income')!;
    expect(income.amount).toBe('10000.00');
  });

  it('跳过尾部统计行（金额非数字）', () => {
    const rows = alipayParser.parse(ALIPAY_SAMPLE);
    // 仅 2 条有效数据行，尾部「导出时间」行被跳过
    expect(rows.every((r) => Number.isFinite(Number(r.amount)))).toBe(true);
  });
});
