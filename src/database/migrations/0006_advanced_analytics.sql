-- Phase 7：高级分析（008 advanced-analytics）
-- 纯增量迁移：5 新表 + 索引 + 1 FK，不改任何既有表列（data-model.md §7）。
-- 应用顺序：scenarios → scenario_projections（FK 依赖 scenarios）→ tax_estimates → retirement_simulations → portfolio_hints。
-- 注：本迁移由 /speckit-implement 手写（仓库既有 snapshot 漂移使 drizzle-kit generate 无法非交互运行，沿用 0003/0004/0005 既定做法）。

-- ── US1：What-if 情景定义 + 基线快照 ──
CREATE TABLE "finance_scenarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"kind" varchar(24) NOT NULL,
	"assumptions" jsonb NOT NULL,
	"baseline_snapshot" jsonb NOT NULL,
	"horizon_months" integer NOT NULL,
	"engine_version" varchar(32) NOT NULL,
	"status" varchar(16) DEFAULT 'ok' NOT NULL,
	"missing" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"disclaimers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "finance_scenarios_user_idx" ON "finance_scenarios" USING btree ("user_id");
--> statement-breakpoint

-- ── US1：确定性投影点（逐月 baseline/scenario/diff，scenarioId+monthOffset 唯一） ──
CREATE TABLE "finance_scenario_projections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"month_offset" integer NOT NULL,
	"baseline_net_worth" numeric(18,2),
	"scenario_net_worth" numeric(18,2),
	"net_worth_delta" numeric(18,2),
	"baseline_emergency_months" numeric(18,4),
	"scenario_emergency_months" numeric(18,4),
	"goal_impact" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "finance_scenario_projections_scenario_month_unique" ON "finance_scenario_projections" USING btree ("scenario_id","month_offset");
--> statement-breakpoint
CREATE INDEX "finance_scenario_projections_user_idx" ON "finance_scenario_projections" USING btree ("user_id");
--> statement-breakpoint
ALTER TABLE "finance_scenario_projections" ADD CONSTRAINT "finance_scenario_projections_scenario_id_finance_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."finance_scenarios"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- ── US2：个税估算（separate/merged 对比 + ruleVintage） ──
CREATE TABLE "finance_tax_estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"tax_year" integer NOT NULL,
	"rule_vintage" varchar(32) NOT NULL,
	"inputs" jsonb NOT NULL,
	"method_comparison" jsonb NOT NULL,
	"total_tax_amount" numeric(18,2) NOT NULL,
	"effective_rate" numeric(18,6),
	"hints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"engine_version" varchar(32) NOT NULL,
	"status" varchar(16) DEFAULT 'ok' NOT NULL,
	"missing" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"disclaimers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "finance_tax_estimates_user_year_idx" ON "finance_tax_estimates" USING btree ("user_id","tax_year");
--> statement-breakpoint

-- ── US3：退休模拟（假设束 + 三点区间结果） ──
CREATE TABLE "finance_retirement_simulations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"assumptions" jsonb NOT NULL,
	"horizon_months" integer NOT NULL,
	"result_pessimistic" jsonb NOT NULL,
	"result_baseline" jsonb NOT NULL,
	"result_optimistic" jsonb NOT NULL,
	"sustainable_verdict" varchar(16) NOT NULL,
	"engine_version" varchar(32) NOT NULL,
	"status" varchar(16) DEFAULT 'ok' NOT NULL,
	"missing" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"disclaimers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "finance_retirement_simulations_user_idx" ON "finance_retirement_simulations" USING btree ("user_id");
--> statement-breakpoint

-- ── US4：组合优化方向（按 assetClass 一条，batchId 整组覆盖） ──
CREATE TABLE "finance_portfolio_hints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"batch_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"asset_class" varchar(32) NOT NULL,
	"current_ratio" numeric(18,6) NOT NULL,
	"target_band" jsonb NOT NULL,
	"direction" varchar(8) NOT NULL,
	"reason" text NOT NULL,
	"target_bands_version" varchar(32) NOT NULL,
	"engine_version" varchar(32) NOT NULL,
	"disclaimers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "finance_portfolio_hints_user_batch_class_unique" ON "finance_portfolio_hints" USING btree ("user_id","batch_id","asset_class");
--> statement-breakpoint
CREATE INDEX "finance_portfolio_hints_user_idx" ON "finance_portfolio_hints" USING btree ("user_id");
