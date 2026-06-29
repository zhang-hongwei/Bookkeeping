# Implementation Plan: 家庭财务 (Phase 4)

**Branch**: `001-double-entry-ledger`（spec 目录为 `005-family-finance`；沿用既有「各 Phase 同分支、独立 spec 目录」约定，与 002/003/004 一致） | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-family-finance/spec.md`

> 本计划由 `/speckit-plan` 生成。Phase 0 研究 → [research.md](./research.md)；Phase 1 设计 → [data-model.md](./data-model.md)、[contracts/api.md](./contracts/api.md)、[quickstart.md](./quickstart.md)。tasks.md 由后续 `/speckit-tasks` 生成。

## Summary

Phase 4 在 Phase 0–3 完整个人财务模型之上，引入**家庭维度**：多成员合并视图、按成员的收支归属、可控的隐私共享边界。产品从「个人记账」走向「家庭 CFO」。

交付四件事（对应《AI 财富管家》Phase 4 + §3.9）：
1. **家庭与成员管理**：建家庭、邀请/加入（含为未注册家人预占槽位）、成员角色与共享偏好、成员软退出（历史保留）。
2. **家庭合并视图**：家庭净资产 = Σ 各成员**共享账号**净资产，可按成员拆分；家庭净资产曲线由家庭快照表 O(1) 驱动。
3. **成员归属与画像**：交易带 `memberId`（谁花/谁赚，含「共同/joint」），按成员汇总收支/结余/分类画像。
4. **共享范围（隐私边界）**：账号 `visibility=private`（私房钱）在家庭视图 100% 不可见、不并入家庭净资产；越权访问 100% 拒绝（新增 403 路径）。

**技术路线**：在现有 Drizzle/PostgreSQL `finance` 领域上**增量** 3 张表（`finance_families` / `finance_family_members` / `finance_family_net_worth_snapshots`）+ 2 处改列（`transactions.member_id`、`accounts.visibility`）+ 5 个索引；复用 Phase 0/1 的 `balance.service`、`ledger.service`、纯函数 `computeNetWorthFromAccounts`/`computeNetWorthAtDatePure` 与规则引擎；家庭净资产「逐成员聚合再求和」由构造保证可加性、隐私排除与零双计；家庭快照挂在既有 `refreshSnapshots` 钩子上 best-effort 刷新。

**关键设计取舍**（详见 research.md）：① 净资产按**账号 owner** 聚合，收支画像按**交易 memberId** 聚合——两套正交口径，是去重与隐私的根基；②「共同」归属用专用 joint 成员行表达（不引入额外布尔/枚举）；③ 账号 visibility 默认 `shared`，「保守共享」在「加入即同意」层兑现；④ 成员退出软删除、历史快照不可变。

**硬前置**：Phase 0–3 必须已达标（账目平衡、净资产快照、资产/负债、投资持仓）。Phase 4 的合并正确性完全建立在 Phase 0 账目正确与 Phase 1 净资产口径之上。

## Technical Context

**Language/Version**: TypeScript 5.x · React 19.2 · Next.js 16.0.1 (App Router)
**Primary Dependencies**: Drizzle ORM 0.44.5 + drizzle-kit 0.31.4 · MUI v7 · Tailwind v4 · Zustand 5 · TanStack Query 5 · Zod 4 · Vercel AI SDK 6（家庭报告表达层，复用 Phase 1）· **Supabase Auth**（`@supabase/ssr`，finance 全域认证；userId = Supabase user id 字符串）
**Storage**: PostgreSQL（Drizzle ORM；`@neondatabase/serverless`）
**Testing**: Vitest（`pnpm test --run --silent='passed-only' '[pattern]'`）
**Target Platform**: Web（Next.js App Router），桌面/移动浏览器
**Project Type**: web-application（Next.js 全栈，App Router + API Routes）
**Performance Goals**: 家庭净资产今日值 O(Σ 成员共享账号) 实时聚合；家庭曲线读快照表 O(1)；视图切换瞬时
**Constraints**: 单币种 CNY；金额 `numeric(18,2)` 禁浮点；家庭净资产只对 `visibility='shared'` 聚合（隐私硬过滤）；越权 403；成员退出不删数据、历史快照保留；一人一家庭 active（本阶段）
**Scale/Scope**: 单一家庭结构（一人多家庭非核心）；成员数典型 ≤ 6；不含预算目标（Phase 5）、AI 顾问深化（Phase 6）

> 无 NEEDS CLARIFICATION 残留——全部 Technical Context 项已确定。11 项设计决策见 [research.md](./research.md)。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**状态：N/A — 未发现可对照的原则。** `.specify/memory/constitution.md` 仍是未填写的模板（`[PRINCIPLE_1_NAME]` 等占位符），项目尚未通过 `/speckit-constitution` 建立正式宪章。因此无 gate 可违反，本检查不构成阻断（与 Phase 1/002 计划一致）。

**建议**：可运行 `/speckit-constitution` 建立宪章。本特性自然映射的候选原则——「复式平衡不可违反」「金额禁止浮点」「数据按用户/家庭隔离」「家庭聚合只读共享数据（隐私优先）」「AI 数字结论必须来自规则引擎」——均已在设计中兑现。本计划以 Spec 的 Success Criteria（SC-001..SC-005）作为事实 gate。

**设计后复检（Phase 1 完成后）**：data-model.md 的不变量 I1（家庭=Σ成员）、I2（隐私排除）、I5（零双计）、I7（复式平衡不破坏）、I8（金额 decimal）与 contracts/api.md 的 C2（响应物理不含他人私有数据）、C5（403 边界）均与上述候选原则一致，无回归。

## Project Structure

### Documentation (this feature)

```text
specs/005-family-finance/
├── spec.md              # 功能规格
├── plan.md              # 本文件
├── research.md          # Phase 0：11 项技术决策
├── data-model.md        # Phase 1：领域模型增量（3 表 + 2 改列 + 不变量）
├── quickstart.md        # Phase 1：环境与端到端运行指引
├── contracts/
│   └── api.md           # Phase 1：家庭 API 契约
└── tasks.md             # Phase 2 输出（/speckit-tasks，本命令不生成）
```

### Source Code (repository root)

```text
src/
├── database/
│   ├── schema/finance/
│   │   ├── families.ts                  # 新增：finance_families + finance_family_members
│   │   ├── family-snapshots.ts          # 新增：finance_family_net_worth_snapshots
│   │   ├── transactions.ts              # 变更：+ member_id (FK, SET NULL)
│   │   ├── accounts.ts                  # 变更：+ visibility (shared|private)
│   │   ├── relations.ts                 # 变更：增 family/member 关系
│   │   └── index.ts                     # barrel 更新
│   └── migrations/                      # drizzle-kit generate 产物（增量）
├── repositories/finance/
│   ├── family.repository.ts             # 家庭/成员 CRUD + 成员鉴权查询
│   └── family-net-worth.repository.ts   # 家庭快照读写/区间查询
├── services/finance/
│   ├── family.service.ts                # 建家/邀请/加入/退出/成员管理
│   ├── family-net-worth.service.ts      # 家庭 live 净值 + 快照维护（复用 Phase 1 纯函数）
│   ├── family-attribution.service.ts    # 按 memberId 的成员收支画像
│   ├── ledger.service.ts                # 变更：CreateTransactionInput +memberId；刷新钩子扩家庭快照
│   ├── net-worth.service.ts             # 变更：refreshSnapshots 钩子扩展（顺刷家庭快照）
│   └── rules-engine.service.ts          # 变更：支持家庭口径输入（报告复用）
├── app/api/finance/
│   ├── _lib/
│   │   ├── family-auth.ts               # 新增：requireFamilyMembership + ShareScopeError
│   │   ├── auth.ts                      # 既有：requireUserId
│   │   ├── validation.ts                # 变更：+ family/member/visibility schemas
│   │   └── serialize.ts                 # 变更：+ family/member/NetWorth DTOs
│   ├── families/
│   │   ├── route.ts                     # POST 建 / GET 我的
│   │   └── [id]/
│   │       ├── route.ts                 # GET 详情 / PATCH / DELETE
│   │       ├── members/
│   │       │   ├── route.ts             # POST 加成员 / GET 列表
│   │       │   └── [memberId]/
│   │       │       ├── route.ts         # PATCH / DELETE（退出）
│   │       │       └── profile/route.ts # GET 成员支出画像
│   │       └── net-worth/
│   │           ├── route.ts             # GET 家庭合并净资产（今日 + memberBreakdown）
│   │           └── curve/route.ts       # GET 家庭净资产曲线
│   ├── accounts/[id]/route.ts           # 变更：PATCH 接受 visibility
│   └── transactions/route.ts            # 变更：请求/响应 +memberId
└── features/family/                     # UI 新增
    ├── components/                      # 建家/成员管理、视图切换、家庭仪表盘/曲线、成员画像
    ├── hooks/                           # TanStack Query hooks
    └── store/                           # 视图切换 Zustand（personal|family）

tests/finance/
├── family.service.test.ts               # 新增
├── family-net-worth.service.test.ts     # 新增（I1/I2/I5/I6）
├── family-attribution.service.test.ts   # 新增
├── ledger.service.test.ts               # 变更：补 memberId/visibility
└── net-worth.service.test.ts            # 变更：补家庭快照刷新
```

**Structure Decision**: 复用 Phase 0–3 既定分层（`database/schema/finance` → `repositories/finance` → `services/finance` → `app/api/finance` → `features/`）。Phase 4 仅在 `finance/` 子域内**增量**新增文件 + 极少量既有文件加列/透传，不引入新的顶层结构。家庭快照维护通过既有 `refreshSnapshots` 钩子扩展（best-effort，与 Phase 1 个人快照同一机制），避免跨领域耦合；成员归属与账号可见性作为既有 transaction/account 的**可选维度**叠加，保证向后兼容（NULL/默认值）。

## Complexity Tracking

> Constitution Check 无违规。记录四处「有理由的复杂度」（详见 research.md 对应决策）：

| 复杂点 | 为何需要 | 为何不采用更简单方案 |
|--------|----------|----------------------|
| 家庭净资产日快照表（`finance_family_net_worth_snapshots`）+ 与个人快照同钩子刷新 | 家庭曲线需 O(1) 读取；「家庭=Σ成员共享」需稳定物化；成员加入/退出/可见性切换需可回算 | 实时回放 N 成员 × D 天 entries——O(N×D×entries) 随明细增长不可用；Σ 个人快照——含成员私有账号，违反 SC-002 |
| 两套正交聚合口径（净资产按 owner / 画像按 memberId） | 兑现「家庭=Σ成员」可加性（SC-001）+ 隐私排除（SC-002）+ 零双计（SC-009）三项硬约束，且不破坏复式平衡（I7） | 让 memberId 同时决定净资产归属——要求跨成员搬余额，破坏复式平衡与单一 owner，引入双计 |
| 专用 joint 成员行表达「共同」归属 | `memberId` 保持单一外键语义，joint 计入家庭合计、不计入任何个人画像（I6），无需额外布尔/枚举分支 | transactions 加 `isJoint` 布尔——与 memberId 并存产生矛盾态；魔法 UUID——跨家庭串扰 |
| 新增 403 路径 + `requireFamilyMembership` + `ShareScopeError` | finance 全域此前无 403；隐私边界（SC-003）需显式越权拒绝，语义须与 422(不变量) 区分 | 复用 `LedgerInvariantError`→422——语义不符，误导客户端；Postgres RLS——全域零 RLS，单点引入割裂且难调试动态「家庭=成员集合+共享过滤」谓词 |
