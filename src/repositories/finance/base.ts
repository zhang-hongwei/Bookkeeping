/**
 * Finance 数据访问基座。
 *
 * 职责：
 * - **userId 作用域**：实例绑定单个请求的 userId，所有派生 repository 的查询/写操作
 *   均按该 userId 过滤（满足 FR-013 数据隔离）。系统权益账户（`user_id='__system__'`）
 *   是全局账户，不经过任何 repository，由 ledger.service 直接维护。
 * - **事务包装**：余额与分录的原子写入统一走 `db.transaction`（与 ledger.service 一致）。
 *
 * 注：`db` 为多驱动联合类型，事务对象（tx）无法跨函数精确标注，
 * 故需要 tx 的多步写操作在各 repository 方法内联（与 ledger.service 注释一致）。
 */
import { db } from '@/database/client';

export abstract class FinanceRepository {
  constructor(protected readonly userId: string) {}

  /** drizzle db 实例（多驱动代理）。 */
  protected get db() {
    return db;
  }

  /** 防御性断言：userId 必须非空（数据隔离硬约束）。 */
  protected requireUserId(): string {
    if (!this.userId) {
      throw new Error('FinanceRepository: userId 未设置（违反数据隔离）');
    }
    return this.userId;
  }
}
