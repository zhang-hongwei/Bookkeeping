# Research: 家庭财务 (Phase 4)

**Feature**: 005-family-finance · **Date**: 2026-06-29 · **Spec**: [spec.md](./spec.md)

> Phase 0 产出。本文逐一解决 Technical Context 中的 NEEDS CLARIFICATION，并对每个关键技术决策给出 **Decision / Rationale / Alternatives**。所有结论直接驱动 `data-model.md` 与 `contracts/api.md`。

---

## 现状基线（来自代码勘察）

在动手设计前，已确认以下既有事实（这些是 Phase 4 的扩展锚点）：

1. **所有权维度单一**：所有 `finance_*` 表统一用 `userId: text('user_id').notNull()`（纯文本，**无 FK**），刻意不与 NextAuth `users.id`（`uuid`）建外键——这是 Supabase userId 字符串约定。Phase 4 的家庭/成员表必须沿用同一约定（`userId`/`createdByUserId` 用 `text`），避免 uuid/text 类型错配。
2. **无任何「谁花/谁赚」归属字段**：`finance_transactions` / `finance_entries` 没有 payer/spender/member 列。成员归属是**全新维度**，无历史数据需迁移。
3. **无任何可见性/共享/隐私标记**：账户/资产/负债/交易均无 visibility/sharing/private 字段。全库唯一的隐私式列是无关表 `meal_records.is_public`。共享范围是**全新维度**。
4. **净资产真相源 = `finance_accounts.balance`**（materialized `decimal(18,2)`，由 entries 原子维护）。快照表 `finance_net_worth_snapshots` 按 `(user_id, date)` UNIQUE 物化，用于个人曲线。
5. **纯函数可复用**：`computeNetWorthFromAccounts(accounts)` 与 `computeNetWorthAtDatePure(accounts, entries, date)` 接收账号/分录**列表**，本身与 userId 无关——天然支持「按成员集合分别聚合再求和」。
6. **权限现状**：finance 全域**无 RLS、无 403 路径**；隔离靠 repository 层 `eq(table.userId, …)`。Phase 4 需新增家庭成员鉴权与 403 路径。
7. **enum 约定**：全 finance 域用 `varchar(n).$type<T>()` + 导出的 `as const` 数组，**不使用 `pgEnum`**。新增枚举沿用此约定。
8. **快照刷新范式**：`refreshSnapshots(userId, occurredAt)` 在 `db.transaction(...)` 提交后**尽力而为**（best-effort，try/catch 包裹）地刷新——Phase 4 的家庭快照沿用同一钩子。

---

## 决策 1 — 家庭/成员的数据模型

**Decision**：新增两张表，沿用 finance 域约定（`text` userId、`uuid` PK、无 FK 到 users、`varchar+$type` 枚举）。

- `finance_families`：家庭聚合单位（id, name, createdByUserId text, defaultCurrency, timestamps）。
- `finance_family_members`：成员关系（id, familyId → families.id cascade, **userId text NULL**, displayName text NOT NULL, role, shareMode, status, joinedAt, leftAt, timestamps）。

**Rationale**：
- `userId` 允许 **NULL**——直接满足 edge case「为尚未注册的家人预占成员槽位（仅记账归属，无登录账号）」。`displayName` 必填（NULL userId 时仍需展示「伴侣/妈妈」）。
- 不为 `userId` 建 FK：与全域一致，规避 uuid/text 类型冲突；成员关系的有效性由应用层 `status='active'` 控制。
- 成员 `id`（membership 的 uuid）作为**归属锚点**（见决策 4），与 userId 解耦。

**Alternatives**：
- *复用 NextAuth `memberships` 表*：拒绝。`auth.ts` 的 `memberships` 是 RBAC/会员等级（basic/premium/vip）概念，与家庭语义无关，混用会造成领域污染。
- *在 `users` 上加 familyId*：拒绝。一人多家庭虽非本阶段核心，但把家庭绑定到 user 会硬编码「一人一家」并阻塞未来扩展；家庭应是独立实体、成员是多对多关系。

---

## 决策 2 — 家庭净资产聚合方式（核心）

**Decision**：家庭净资产 = Σ（各 active 成员的**共享账号**净资产）。两条路径：

- **今日（live）**：`computeFamilyNetWorthLive(familyId)`——取家庭所有 active 成员的 userId，拉取各自 `visibility='shared'` 的账号，复用纯函数 `computeNetWorthFromAccounts`，**逐成员聚合后求和**，同时产出 per-member 拆分。
- **历史曲线**：新增 `finance_family_net_worth_snapshots (family_id, date) UNIQUE`，其值 = Σ 各成员该日共享净资产，**与个人快照同一钩子**（`refreshSnapshots` 提交后 best-effort 刷新）刷新。

**Rationale**：
- 「家庭 = Σ 成员」由构造保证 SC-001（家庭净资产 = 逐成员汇总一致）、SC-009（重复计入 = 0）：每个账号有且仅有一个 owner，按 owner 汇总，每账号只计一次。
- 隐私由构造保证 SC-002：家庭聚合**只对 `visibility='shared'` 账号求和**，「仅个人」账号天然被排除，无需事后过滤。
- 家庭快照表给出 O(1) 曲线读取，避免「N 成员 × D 天 × entries」的实时回放（随明细增长不可接受）。

**Alternatives**：
- *实时回放各成员 entries 算家庭曲线*：拒绝。复杂度 O(N×D×entries)，数据增长后曲线查询不可用；且个人视图已有快照优化，家庭视图不应回退。
- *家庭曲线 = Σ 各成员个人快照*：拒绝。个人快照**包含**该用户全部账号（含「仅个人」），直接求和会**违反 SC-002**（把成员的私房钱并入家庭）。必须按共享口径重算，故需独立的家庭快照表。
- *读时聚合各成员快照再减去私有账号*：拒绝。私有状态可能随时间变化，历史回拆不可靠且实现复杂。

> ⚠️ **已知简化（写入 Complexity Tracking）**：成员 `visibility` 是「当前态」标记，家庭历史快照按「当前共享口径」计算。若用户事后把某账号从共享改为私有，**未来**的家庭快照排除它，但**历史**家庭快照保留原值（快照即历史，不可变，符合 SC-004「保留快照」）。时变可见性（「我何时把它标私有」）超出 Phase 4 范围。

---

## 决策 3 — 共享范围 / 隐私边界（share-scope）

**Decision**：两级共享，核心是**账号级 visibility**。

- **账号级**（核心，满足 FR-005/US3）：`finance_accounts.visibility varchar(12) default 'shared'`，取值 `shared`（并入家庭视图）/ `private`（仅个人，不并入家庭净资产、家庭视图不可见）。
- **成员级**（设计文档的 shareScope，作为成员默认倾向）：`finance_family_members.shareMode varchar(16) default 'shared'`（成员加入后默认共享；可改为 `private_by_default`，使该成员新建账号默认私有）。Phase 4 先落地账号级 visibility，成员级 shareMode 作为默认值来源、UI 暴露为偏好。

**默认值选择**：账号 `visibility` 默认 `shared`。

**Rationale（回应「保守共享」假设）**：
- 若默认 `private`，则用户加入家庭后合并视图为空，产品核心价值（家庭 CFO）落空。
- 「保守共享/信任优先」（设计第 9 章 D4）在**加入动作**上兑现：用户必须**显式创建/加入家庭**才触发任何共享；在此之前零暴露。加入首体验提供「批量选择共享哪些账号」的同意时刻（默认全选、可一键私房）。
- 数据层默认 `shared` 保证「加入即合并可用」；隐私通过 ① 加入同意 ② 账号级私有开关 ③ 家庭聚合硬过滤 三道防线兑现。SC-002/SC-003 由聚合层硬过滤保证。

**Alternatives**：
- *账号默认 `private`*：拒绝，理由如上（合并视图空转）。
- *交易级 visibility*：Phase 4 **不引入**。交易的隐私随其**账号**（账号私有则其交易在家庭视图不可见）。额外加交易级标记会带来「账号共享但单笔私有」的组合复杂度，YAGNI；留作未来增强。

---

## 决策 4 — 成员归属 vs 所有权（关键区分）

**Decision**：明确区分两个维度，**不可混淆**：

| 维度 | 锚点 | 用途 | 家庭聚合方式 |
|------|------|------|--------------|
| **所有权** | 账号 `userId`（owner） | 净资产归属 | 家庭净资产 = Σ 成员**共享账号余额** |
| **归属** | 交易 `memberId`（→ family_members.id） | 收支画像/现金流 | 成员支出画像 = 该 memberId 的交易聚合 |

**新增列**：`finance_transactions.memberId uuid NULL`（FK → `finance_family_members.id`，`ON DELETE SET NULL`）。
- NULL = 无家庭归属（向后兼容 Phase 0–3 数据与纯个人用户）。
- 归属只作用于**收支分析**（谁花/谁赚），**不改变净资产所有权**——因为净资产由账号余额推导，而账号余额由 owner 拥有。

**Rationale**：这是去重与一致性的根基（SC-009）。一笔「伴侣花的、记在我账号下」的支出：扣我的账号余额（我的净资产降），但 `memberId=伴侣`（伴侣支出画像 +1）。家庭总净资产只看账号余额求和，与 memberId 无关；成员画像只按 memberId 聚合，与账号 owner 无关。两套口径互不污染。

**Alternatives**：
- *让 memberId 同时决定净资产归属*：拒绝。会要求「跨成员移动余额」，破坏复式平衡与单一 owner 不变量，引入双计风险。
- *在 entries 上也加 memberId*：拒绝。entries 继承其 transaction 的 memberId 即可，冗余列徒增维护成本与不一致风险（与既有「entries 不带业务语义、只做平衡锚」的设计一致）。

---

## 决策 5 — 「共同/家庭」归属（joint attribution）

**Decision**：用**专用成员行**表达「共同」，而非新枚举/布尔。

- 每个家庭在创建时**自动生成一条** `finance_family_members`：`role='joint'`、`userId=NULL`、`displayName='家庭/共同'`、`status='active'`、不可删除。
- 共同消费/共同收入的交易 `memberId` 指向该 joint 成员行。
- 聚合时：joint 交易计入**家庭合计**，但**不计入任何个人画像**（个人画像只统计指向自己的 memberId）。

**Rationale**：
- `memberId` 保持单一归属外键语义，无需额外 `isJoint` 布尔或枚举分支。
- 天然满足 edge case「共同账户/共同消费……不单算到某一人」与 US2 验收 3。
- joint 不可删除保证历史归属引用稳定。

**Alternatives**：
- *transactions 上加 `isJoint boolean`*：拒绝。与 memberId 并存会出现「memberId 指向某人 + isJoint=true」的矛盾态；用专用成员行天然互斥。
- *joint 用固定魔法 UUID*：拒绝。每家庭独立一行更清晰，避免跨家庭串扰。

---

## 决策 6 — 成员退出家庭（FR-007 / SC-004）

**Decision**：**软删除**，永不硬删成员行。

- 退出 = `status: 'active' → 'left'`，`leftAt = now`。
- 成员的**个人数据原封不动**（账号/交易所有权从未改变，一直挂在其 userId 下）。
- 家庭聚合查询一律 `status='active'` 过滤，退出后自动不再并入家庭视图/净资产。
- 历史家庭快照（`finance_family_net_worth_snapshots`）**作为不可变历史保留**（SC-004「保留快照」）。
- 历史交易的 `memberId` 引用**不变**（我们只标记 left，不删行，故 ON DELETE SET NULL 不触发），成员支出画像历史完整。

**Rationale**：与全域「不硬删、保快照」的哲学一致；退出可逆（重新激活），历史可审计。

**Alternatives**：
- *退出即删成员行*：拒绝。会触发 `memberId ON DELETE SET NULL`，抹掉历史归属，违反 SC-004。
- *退出时把其数据搬出家庭*：拒绝。所有权从未属于家庭，无东西可搬；搬移破坏复式平衡。

---

## 决策 7 — 重复/交叉账户的去重（edge case / SC-009）

**Decision**：靠**单一所有权 + 共享可见**从构造上避免双计，辅以录入指引。

- 每个账号有且仅有一个 `userId`（owner）。夫妻共有账户由**一方**登记拥有，标 `visibility='shared'` 流入家庭视图；另一方**不得**再登记同一账户。
- 家庭净资产按 **accountId 去重求和**（每账号恰属一个 owner，按 owner 分组，每账号计一次）。复式记账 + 单一 owner ⇒ 双计发生率 = 0。
- UI 指引：加入家庭时提示「请勿重复登记伴侣已共享的账户」。

**Alternatives / 未来增强**：
- *账号加 `institutionRef`/`externalRef` 做重复检测*：Phase 4 **不做**（YAGNI），列为未来增强。当前靠流程约束 + 聚合去重已满足 SC-009。

---

## 决策 8 — 默认视图与切换（FR-008 / SC-005）

**Decision**：默认视图偏好挂在**成员行**上；切换为客户端瞬时状态。

- `finance_family_members.defaultView varchar(12) default 'personal'`（`personal`/`family`）。用户在家庭里的默认着陆视图；不在家庭的用户恒为个人视图。
- 切换 = 前端 Zustand 状态 + 调用不同端点（个人 `/api/finance/net-worth` vs 家庭 `/api/finance/families/[id]/net-worth`）。「瞬时无串扰」（SC-005）由设计保证：两条读路径无共享可变状态，切回即恢复。

**Rationale**：偏好属于「某人在某家庭的成员关系」，挂在 members 行比污染通用 `user_preferences` 表更内聚。

**Alternatives**：
- *放 `user_preferences`*：拒绝。该表是通用偏好（主题/语言/字号），混入家庭视图偏好破坏单一职责。
- *切换走服务端会话状态*：拒绝。徒增往返与串扰面；纯客户端切换即可满足瞬时性。

---

## 决策 9 — 鉴权与权限（新增 403 路径）

**Decision**：新增家庭成员鉴权 helper 与专用错误类。

- `src/app/api/finance/_lib/family-auth.ts`：`requireFamilyMembership(familyId)` —— 解析当前 userId → 查 `finance_family_members`（familyId + userId + status='active'）→ 返回成员关系，否则抛 `ShareScopeError`。
- 新增 `ShareScopeError extends Error`（与 `LedgerInvariantError` 同形，置于 `src/services/finance/balance.service.ts` 或新建 `errors.ts`）。
- API 错误映射：403 `{ error: '无权访问该家庭数据', code: 'FORBIDDEN' }`。
- 隐私硬保证：家庭端点返回的数据**永远是 Σ 共享账号**——即便越权者拿到端点，也看不到他人私有数据（SC-003 由「聚合层只读 shared + 成员鉴权」双重保证）。

**Rationale**：finance 全域尚无 403 路径，本特性首次引入，需明确契约（见 `contracts/api.md`）。

**Alternatives**：
- *Postgres RLS*：拒绝。全域零 RLS，单点引入会割裂一致性，且 RLS 对「家庭=成员集合 + 共享过滤」这种动态谓词表达复杂、难调试。
- *复用 `LedgerInvariantError`→422*：拒绝。语义不符（422=业务不变量违反，403=越权），混用会误导客户端错误处理。

---

## 决策 10 — 家庭报表 / AI 顾问的复用

**Decision**：家庭结论仍走**规则引擎**（Phase 1 既有的 `rules-engine.service.ts`），输入换成「家庭口径事实」。

- 家庭月报/健康分：把规则引擎的输入从「个人 findings」换成「家庭合并 findings」（家庭口径收支/结余/储蓄率/负债率）。
- 成员支出画像：按 memberId 聚合收支/结余/主要分类，作为报告的维度切片。
- 沿用「事实层（规则）→ LLM 表达层」两段式与「零幻觉」红线；LLM 失败降级模板。本阶段优先保证**家庭合并数字结论**正确，AI 表达层为薄复用。

**Rationale**：spec Assumption「家庭报表结论仍走规则引擎」。不新造报告管线，最大化复用 Phase 1。

**Alternatives**：
- *为家庭单独写一套规则引擎*：拒绝。规则是口径无关的纯函数，换输入即可，重复实现徒增维护面。

---

## 决策 11 — 迁移与索引

**Decision**：
- 新增表 + 改列通过 `pnpm db:generate` 生成增量迁移（输出 `src/database/migrations/`），与 Phase 1–3 一致。
- 全 finance 域当前**热点表（accounts/transactions/entries）无 userId 索引**。Phase 4 在家庭查询热路径上补关键索引：
  - `finance_family_members (family_id, status)` — 成员列表/鉴权。
  - `finance_family_members (user_id)` — 「我的家庭」查询。
  - `finance_family_net_worth_snapshots (family_id, date) UNIQUE`。
  - `finance_transactions (member_id)` — 成员画像聚合（memberId 非空时）。
  - `finance_accounts (user_id)` — 既有热点，顺手补（family 聚合按 owner 拉账号）。

**Rationale**：家庭聚合按 owner/memberId 批量拉取，缺索引会随数据增长退化；补索引是低成本高收益。

**Alternatives**：
- *不补索引，依赖顺序扫描*：拒绝。家庭视图是高频读路径，不可接受全表扫描。

---

## NEEDS CLARIFICATION 清单（全部已解决）

| # | 待澄清项 | 解决决策 |
|---|---------|---------|
| 1 | 家庭/成员表结构与 userId 类型对齐 | 决策 1：text userId、uuid PK、userId 可空 |
| 2 | 家庭净资产聚合算法 | 决策 2：Σ 共享账号 live + 家庭快照表 |
| 3 | 共享范围默认值与「保守共享」如何兼容 | 决策 3：账号默认 shared，加入即同意 |
| 4 | 成员归属与净资产所有权的关系 | 决策 4：两维度解耦 |
| 5 | 「共同」归属如何表达 | 决策 5：专用 joint 成员行 |
| 6 | 成员退出的数据处置 | 决策 6：软删除 + 历史快照保留 |
| 7 | 共有账户双计如何避免 | 决策 7：单一 owner + 聚合去重 |
| 8 | 默认视图与瞬时切换 | 决策 8：成员行 defaultView + 客户端切换 |
| 9 | 越权访问如何拒绝（finance 无 403） | 决策 9：requireFamilyMembership + ShareScopeError + 403 |
| 10 | 家庭 AI 报告如何复用 | 决策 10：复用规则引擎、换家庭口径输入 |
| 11 | 迁移与索引 | 决策 11：db:generate + 5 个关键索引 |

**状态：全部 NEEDS CLARIFICATION 已解决，可进入 Phase 1 设计。**
