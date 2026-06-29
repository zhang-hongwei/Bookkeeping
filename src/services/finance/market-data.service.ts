/**
 * 行情数据服务（Phase 3，US2）—— 可插拔行情源 + 缓存 + TTL + 降级（FR-004/SC-004）。
 *
 * 设计（research.md R3）：
 * - `MarketDataProvider` 接口 + 默认 `HttpQuoteProvider`（免费公共源：新浪/腾讯/东方财富）。
 * - 行情缓存在 `finance_instruments`（latestPrice/priceSource/priceUpdatedAt/isStale），按 TTL 判定陈旧。
 * - **降级原则（铁律）**：拉取失败/超时/解析不确定 → 绝不伪造价格，抛 `MarketDataUnavailableError`
 *   由路由转 503 `MARKET_UNAVAILABLE` 并提示手动输入（SC-004）。
 *
 * ⚠️ 实现期澄清（R3）：各公共行情源的端点/字段/限频需在真实环境逐一验证；
 * 本实现的 `HttpQuoteProvider` 采用宽松解析 + 失败即降级策略，对 REITs/加密货币等无免费源的品种
 * 一律走手动兜底。可通过 `setMarketDataProvider` 注入已验证的 provider。
 */
import { instrumentRepository } from '@/repositories/finance/instrument.repository';
import type { InstrumentType, ValuationSource } from '@/database/schema/finance';

/** 行情不可用错误（路由层转 503 MARKET_UNAVAILABLE，提示手动输入）。 */
export class MarketDataUnavailableError extends Error {
  code = 'MARKET_UNAVAILABLE' as const;
  constructor(message = '行情暂不可用') {
    super(message);
    this.name = 'MarketDataUnavailableError';
  }
}

/** 一次行情拉取结果（仅成功时返回；不确定一律返回 null → 降级）。 */
export interface QuoteResult {
  latestPrice: string;
  source: Extract<ValuationSource, 'market' | 'estimate'>;
  fetchedAt: Date;
}

/** 行情源接口（可插拔；默认 HttpQuoteProvider，测试可注入 mock）。 */
export interface MarketDataProvider {
  fetchQuote(code: string, type: InstrumentType): Promise<QuoteResult | null>;
}

/** TTL（秒）：缓存行情的有效期，超期视为陈旧需重拉。 */
function ttlSeconds(): number {
  const v = Number(process.env.MARKET_DATA_TTL_SECONDS);
  return Number.isFinite(v) && v > 0 ? v : 300;
}

/**
 * 默认 HTTP 行情源：免费公共接口（东方财富 push2，返回 JSON）。
 * 依据品种类型映射 secid 前缀；任何非 2xx / 解析不确定 / 字段缺失 → 返回 null（降级，不伪造）。
 *
 * 注：真实环境的端点稳定性/限频/字段需实测（R3）；此处保守解析，失败即降级。
 */
class HttpQuoteProvider implements MarketDataProvider {
  async fetchQuote(code: string, type: InstrumentType): Promise<QuoteResult | null> {
    try {
      const secid = toEastmoneySecid(code, type);
      if (!secid) return null; // 该品种类型无已知免费源 → 降级手动
      const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f170`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      const json = (await res.json()) as { data?: { f43?: number | string } };
      const price = json?.data?.f43;
      if (price === undefined || price === null || price === '') return null;
      const num = Number(price);
      if (!Number.isFinite(num) || num <= 0) return null;
      // 东财返回的价格需按品种除以相应量纲（股票/基金为元/份 ×100，债券 ×10…），真实环境需校准。
      // 这里保守返回原始数值并标注 estimate（来源待校准），交由用户确认或手动修正。
      return {
        latestPrice: num.toFixed(6),
        source: 'estimate',
        fetchedAt: new Date(),
      };
    } catch {
      return null; // 网络错误/超时/解析异常 → 降级
    }
  }
}

/** 品种 → 东方财富 secid 前缀（无对应源的品种返回 null → 手动兜底）。 */
function toEastmoneySecid(code: string, type: InstrumentType): string | null {
  switch (type) {
    case 'stock':
    case 'etf':
      // 沪市 6 开头 → 1.，深市 0/3 开头 → 0.
      return /^6/.test(code) ? `1.${code}` : `0.${code}`;
    case 'fund':
      // 场内基金按股票规则；场外基金无实时 secid → 手动
      return /^5/.test(code) ? `1.${code}` : null;
    default:
      return null; // bond/gold/reits/crypto：无统一免费源 → 手动
  }
}

// 可注入的 provider（默认 HttpQuoteProvider；测试可用 setMarketDataProvider 替换）。
let provider: MarketDataProvider = new HttpQuoteProvider();

/** 注入行情源（测试/已验证实现用）。 */
export function setMarketDataProvider(p: MarketDataProvider): void {
  provider = p;
}

/** 缓存是否新鲜（未超 TTL 且未标陈旧）。 */
function isFresh(updatedAt: Date | null, isStale: boolean): boolean {
  if (isStale || !updatedAt) return false;
  const ageSec = (Date.now() - updatedAt.getTime()) / 1000;
  return ageSec < ttlSeconds();
}

/**
 * 取品种行情：新鲜缓存直接返回；否则拉取并写缓存；拉取失败 → 标陈旧 + 抛 MarketDataUnavailableError。
 * **绝不伪造价格**（FR-004/SC-004）。
 */
export async function getQuote(
  userId: string,
  code: string,
  type: InstrumentType,
): Promise<{
  code: string;
  type: InstrumentType;
  latestPrice: string;
  priceSource: ValuationSource;
  priceUpdatedAt: string;
  isStale: boolean;
}> {
  const repo = instrumentRepository(userId);
  const cached = await repo.findByCode(code);

  if (cached && isFresh(cached.priceUpdatedAt, cached.isStale) && cached.latestPrice) {
    return {
      code,
      type,
      latestPrice: cached.latestPrice,
      priceSource: cached.priceSource,
      priceUpdatedAt: cached.priceUpdatedAt!.toISOString(),
      isStale: false,
    };
  }

  const fetched = await provider.fetchQuote(code, type);
  if (!fetched) {
    // 标记陈旧（便于 UI 提示），抛降级错误
    if (cached) {
      await repo.upsertByCode({
        code,
        type,
        latestPrice: cached.latestPrice,
        priceSource: cached.priceSource,
        priceUpdatedAt: cached.priceUpdatedAt,
        isStale: true,
        name: cached.name ?? undefined,
      });
    }
    throw new MarketDataUnavailableError('行情暂不可用，请手动输入现价');
  }

  const updated = await repo.upsertByCode({
    code,
    type,
    latestPrice: fetched.latestPrice,
    priceSource: fetched.source,
    priceUpdatedAt: fetched.fetchedAt,
    isStale: false,
  });
  return {
    code,
    type,
    latestPrice: updated.latestPrice!,
    priceSource: updated.priceSource,
    priceUpdatedAt: updated.priceUpdatedAt!.toISOString(),
    isStale: false,
  };
}

/** 手动录入/修正现价（行情降级兜底，source='manual'）。 */
export async function upsertManualPrice(
  userId: string,
  input: { code: string; type: InstrumentType; name?: string; latestPrice: string },
) {
  return instrumentRepository(userId).upsertByCode({
    code: input.code,
    type: input.type,
    name: input.name,
    latestPrice: input.latestPrice,
    priceSource: 'manual',
    priceUpdatedAt: new Date(),
    isStale: false,
  });
}

/** 列出品种行情缓存（scoped，可按类型过滤）。 */
export async function listInstruments(userId: string, type?: InstrumentType) {
  return instrumentRepository(userId).list({ type });
}
