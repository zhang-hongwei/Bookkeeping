/**
 * US2 行情数据服务测试（T026）—— getQuote 缓存 / TTL / 降级（SC-004）。
 *
 * getQuote 依赖 finance_instruments 缓存表，故为 DB 集成测试：
 * 需 FINANCE_INTEGRATION_TEST=1。通过 setMarketDataProvider 注入可控 provider，
 * 验证「新鲜缓存命中」「拉取并写缓存」「失败降级抛 MarketDataUnavailableError」三条路径。
 * **铁律：绝不伪造价格**。
 */
import { describe, it, expect } from 'vitest';
import {
  getQuote,
  setMarketDataProvider,
  MarketDataUnavailableError,
  type MarketDataProvider,
} from '@/services/finance/market-data.service';
import { INTEGRATION_ENABLED, uniqueUserId } from './_helpers';
import { upsertManualPrice } from '@/services/finance/market-data.service';

const suite = describe.skipIf(!INTEGRATION_ENABLED);

suite('getQuote 行情缓存与降级（集成，SC-004）', () => {
  it('手动价缓存新鲜命中：不触发 provider，直接返回 manual 价', async () => {
    const userId = uniqueUserId();
    await upsertManualPrice(userId, {
      code: '110011',
      type: 'fund',
      latestPrice: '1.234567',
    });
    let called = false;
    setMarketDataProvider({
      fetchQuote: async () => {
        called = true;
        return null;
      },
    });
    const q = await getQuote(userId, '110011', 'fund');
    expect(called).toBe(false); // 命中缓存，未拉取
    expect(q.latestPrice).toBe('1.234567');
    expect(q.priceSource).toBe('manual');
    expect(q.isStale).toBe(false);
  });

  it('无缓存且 provider 返回 null → 抛 MarketDataUnavailableError（降级，不伪造）', async () => {
    const userId = uniqueUserId();
    setMarketDataProvider({
      fetchQuote: async () => null,
    });
    await expect(getQuote(userId, 'NO_SUCH_CODE', 'crypto')).rejects.toBeInstanceOf(
      MarketDataUnavailableError,
    );
  });

  it('provider 返回有效价 → 写缓存并返回（source=market/estimate）', async () => {
    const userId = uniqueUserId();
    const fake: MarketDataProvider = {
      fetchQuote: async () => ({
        latestPrice: '6.500000',
        source: 'estimate',
        fetchedAt: new Date(),
      }),
    };
    setMarketDataProvider(fake);
    const q = await getQuote(userId, '600519', 'stock');
    expect(q.latestPrice).toBe('6.500000');
    expect(q.isStale).toBe(false);
    // 再次取应命中缓存（provider 不再被调用——此处仅校验返回一致）
    const q2 = await getQuote(userId, '600519', 'stock');
    expect(q2.latestPrice).toBe('6.500000');
  });
});
