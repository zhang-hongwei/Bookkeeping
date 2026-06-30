-- Phase 5：预算与目标（006 budget-goals）
-- 纯增量迁移：3 新表（finance_budgets / finance_budget_periods / finance_goals）+ 索引 + 1 FK。
-- 不改任何既有表列（data-model.md §8）。金额 numeric(18,2)；userId 为 text 无 FK（与 finance 域约定一致）。
-- 应用顺序：budgets → budget_periods（FK 依赖 budgets）→ goals。
-- 注：本迁移由 /speckit-implement 手写（仓库既有 snapshot 漂移使 drizzle-kit generate 无法非交互运行，沿用 0003_family_finance / 0004_ai_wealth_advisor 的既定做法）。

-- ── 预算设置（按分类、按周期复发；categoryId 为逻辑外键无约束，NULL=总支出预算） ──
CREATE TABLE "finance_budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"category_id" uuid,
	"name" text,
	"amount" numeric(18,2) NOT NULL,
	"period_type" varchar(8) DEFAULT 'month' NOT NULL,
	"alert_threshold" numeric(3,2) DEFAULT '0.80' NOT NULL,
	"rollover" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "finance_budgets_user_active_idx" ON "finance_budgets" USING btree ("user_id","active");
--> statement-breakpoint
-- NULL category_id 在 PG 唯一索引中互异（多行总支出预算由应用层查重）
CREATE UNIQUE INDEX "finance_budgets_user_category_period_unique" ON "finance_budgets" USING btree ("user_id","category_id","period_type");
--> statement-breakpoint

-- ── 预算周期历史快照（写入后不可变；amountSnapshot 锁额度，spentSnapshot 缓存关闭时支出） ──
CREATE TABLE "finance_budget_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"budget_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"amount_snapshot" numeric(18,2) NOT NULL,
	"spent_snapshot" numeric(18,2) DEFAULT '0' NOT NULL,
	"status" varchar(12) NOT NULL,
	"closed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "finance_budget_periods_budget_period_unique" ON "finance_budget_periods" USING btree ("budget_id","period_start");
--> statement-breakpoint
CREATE INDEX "finance_budget_periods_user_period_idx" ON "finance_budget_periods" USING btree ("user_id","period_start","period_end");
--> statement-breakpoint
ALTER TABLE "finance_budget_periods" ADD CONSTRAINT "finance_budget_periods_budget_id_finance_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."finance_budgets"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- ── 储蓄目标（currentAmount/progressRate/eta 均派生不落库；targetDate 可空=开放式目标） ──
CREATE TABLE "finance_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"target_amount" numeric(18,2) NOT NULL,
	"target_date" date,
	"progress_basis" varchar(12) DEFAULT 'manual' NOT NULL,
	"linked_account_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"manual_amount" numeric(18,2) DEFAULT '0' NOT NULL,
	"notes" text,
	"status" varchar(12) DEFAULT 'active' NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "finance_goals_user_status_idx" ON "finance_goals" USING btree ("user_id","status");
