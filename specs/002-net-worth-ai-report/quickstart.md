# Quickstart — 净资产闭环 + 首份 AI 报告 (Phase 1)

> Phase 1 输出：开发与运行指引。面向实现者。**前置**：Phase 0（复式记账核心）已实现并达到其退出标准（账目平衡、转账不改净资产、导入去重）。

## 前置环境（沿用 Phase 0）

- Node.js ≥ 20、pnpm、PostgreSQL（本地或 Neon）。
- Phase 0 已实现：`src/database/schemas/finance/*`（accounts/categories/transactions+entries/bill_imports）、`balance.service`、系统权益账户 `__income`/`__expense` 已 seed。

## 1. 安装依赖

```bash
pnpm install
```

Phase 1 复用既有依赖（`ai`/`@ai-sdk/openai`、Drizzle、Zod、MUI v7、TanStack Query、Zustand），无需新增主依赖。截图 OCR 复用项目多模态 AI 能力（009 分支）——**实现前确认**其已可用（见 research R7）。

## 2. 环境变量

在 `.env.local` 基础上（Phase 0 已有 `DATABASE_URL`/Clerk/`OPENAI_API_KEY`），确保多模态与文档/Block 产物所需配置：

```bash
# Phase 0 既有
DATABASE_URL=postgres://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
OPENAI_API_KEY=...              # 月报 LLM 表达层 + 截图 OCR 多模态识别

# Phase 1 可能需要（实现前确认项目文档/Block 体系所需）
# AI_PIPELINE / product-agent 相关配置沿用项目既有
```

## 3. 数据库迁移（Phase 1 schema 增量）

新增 `net_worth_snapshots` / `rule_findings` / `ai_reports` 三表，以及 `transactions.source` enum 追加 `ocr`：

```bash
pnpm db:generate     # 生成迁移（含新表 + source enum 扩展）
pnpm db:migrate      # 应用迁移
pnpm db:studio       # 检查表结构
```

**注意**：若 Phase 0 迁移尚未生成，则 `ocr` 一并在首个 finance 迁移中包含；若已生成，Phase 1 迁移单独 ALTER 枚举。

## 4. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000`，进入净资产仪表盘验证。

## 5. 验证核心不变式（最重要）

针对 Phase 1 的 SC，重点测试：

```bash
pnpm test --run --silent='passed-only' 'finance'
```

关键测试用例（必须通过）：
- **净资产自洽（SC-001）**：连续交易后，任意日期 `net_worth_snapshots.net_worth` == 由账户余额推导的净值。
- **转账不改净资产（SC-002）**：任意转账后净资产不变、曲线无虚假波动。
- **零幻觉（SC-003）**：月报中所有数字结论（储蓄率/负债率/应急金/收支总额）来自 `rule_findings`，可逐项追溯。
- **LLM 降级（SC-004）**：模拟 LLM 异常 → 报告 `status=degraded`，数字结论仍由模板呈现。
- **OCR 准确率（SC-005）**：标准支付截图识别金额/时间准确，低置信度强制人工确认。
- **健康分可复现（SC-006）**：相同账目输入 → 相同健康分（确定性）。

## 6. 类型检查与质量门

```bash
pnpm type-check      # tsc --noEmit
pnpm check           # type-check + lint
```

## 7. 实现顺序建议（与后续 /speckit-tasks 对齐）

1. schema 增量：`net_worth_snapshots` → `rule_findings` → `ai_reports` + `transactions.source += ocr` 迁移。
2. `net-worth.service`（净值推导 + 快照写/重算/回填 + `verifySnapshots` 校验自愈），挂在 Phase 0 `ledger.service` 事务之后。
3. `rules-engine.service`（纯函数 findings + 健康分加权/降权），配单元测试（确定性、可复现）。
4. `report.service`（findings → LLM 表达 → 文档/Block + `ai_reports` + sourceDataHash + 模板降级）。
5. `ocr-record.service`（多模态 structured output + confidence + 候选确认闭环），复用 Phase 0 落库。
6. API routes（net-worth / snapshots / findings / health-score / reports / ocr-record）。
7. UI（`features/finance` 扩展）：净资产仪表盘 + 曲线、截图记账入口、月报视图、健康分雷达图。

## 8. 关键风险确认项（实现前）

- Phase 0 是否已实现并达标（**硬前置**，research R9）。
- 项目多模态 AI 能力（009 分支）是否可用于 OCR（research R7）；若未就绪，OCR 可降级为可独立裁剪的子能力。
- 文档/Block 产物承载方式（product-agent + AI Pipeline 的当前接入点），用于报告正文落库。
