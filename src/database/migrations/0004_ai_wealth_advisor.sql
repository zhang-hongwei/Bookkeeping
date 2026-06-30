-- Phase 6：AI 财富顾问（007）
-- 纯增量迁移：6 新表 + finance_transactions.anomaly_flag + 索引/外键。
-- 表：cash_flow_forecasts / smart_alerts / alert_preferences / approvals / advisor_sessions / advisor_messages。
-- 注：本迁移由 /speckit-implement 手写（仓库既有 snapshot 漂移使 drizzle-kit generate 无法非交互运行，沿用 0003_family_finance 的既定做法）。

-- ── US1：现金流预测缓存（FR-001，纯函数产出的最近一次结果） ──
CREATE TABLE "finance_cash_flow_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"target_month" varchar(7) NOT NULL,
	"series" jsonb NOT NULL,
	"insufficient_history" boolean DEFAULT false NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "finance_cash_flow_forecasts_user_target_unique" ON "finance_cash_flow_forecasts" USING btree ("user_id","target_month");
--> statement-breakpoint

-- ── US1：智能预警（FR-002，规则触发，依据可追溯 ruleFindingRefs） ──
CREATE TABLE "finance_smart_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"kind" varchar(40) NOT NULL,
	"severity" varchar(10) NOT NULL,
	"rule_finding_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"period" varchar(7) NOT NULL,
	"status" varchar(14) DEFAULT 'active' NOT NULL,
	"message" text NOT NULL,
	"dismissed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "finance_smart_alerts_user_kind_period_unique" ON "finance_smart_alerts" USING btree ("user_id","kind","period");
--> statement-breakpoint
CREATE INDEX "finance_smart_alerts_user_status_idx" ON "finance_smart_alerts" USING btree ("user_id","status");
--> statement-breakpoint

-- ── US1：预警偏好/静默（FR-008，每 userId × kind 一行） ──
CREATE TABLE "finance_alert_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"kind" varchar(40) NOT NULL,
	"muted" boolean DEFAULT false NOT NULL,
	"muted_until" timestamp,
	"channel" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "finance_alert_preferences_user_kind_unique" ON "finance_alert_preferences" USING btree ("user_id","kind");
--> statement-breakpoint

-- ── US2：审批闭环（FR-004 / SC-003，先于 advisor_messages 创建以满足 FK） ──
CREATE TABLE "finance_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"kind" varchar(40) NOT NULL,
	"payload" jsonb NOT NULL,
	"rule_validation" jsonb NOT NULL,
	"status" varchar(12) DEFAULT 'proposed' NOT NULL,
	"proposed_by" text,
	"approved_at" timestamp,
	"applied_at" timestamp,
	"applied_result" jsonb,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "finance_approvals_user_status_idx" ON "finance_approvals" USING btree ("user_id","status");
--> statement-breakpoint

-- ── US2：顾问会话（FR-003，先于 messages 创建以满足 FK） ──
CREATE TABLE "finance_advisor_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(120),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "finance_advisor_sessions_user_created_idx" ON "finance_advisor_sessions" USING btree ("user_id","created_at");
--> statement-breakpoint

-- ── US2：顾问消息（FR-003 / FR-007，citedFindings 可追溯，proposalId 串联审批） ──
CREATE TABLE "finance_advisor_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar(16) NOT NULL,
	"content" text NOT NULL,
	"cited_findings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"degraded" boolean DEFAULT false NOT NULL,
	"proposal_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "finance_advisor_messages_session_created_idx" ON "finance_advisor_messages" USING btree ("session_id","created_at");
--> statement-breakpoint
ALTER TABLE "finance_advisor_messages" ADD CONSTRAINT "finance_advisor_messages_session_id_finance_advisor_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."finance_advisor_sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "finance_advisor_messages" ADD CONSTRAINT "finance_advisor_messages_proposal_id_finance_approvals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."finance_approvals"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- ── US2：异常标记落点（flag_transaction_anomaly 审批 apply；NULL=未标记，向后兼容） ──
ALTER TABLE "finance_transactions" ADD COLUMN "anomaly_flag" varchar(16);
