-- Phase 4：家庭财务（families / family_members / family_net_worth_snapshots）
-- 纯增量迁移：3 新表 + finance_transactions.member_id + finance_accounts.visibility + 索引/外键。
-- 注：本迁移由 /speckit-implement 手写（仓库既有 snapshot 漂移使 drizzle-kit generate 无法非交互运行）。
CREATE TABLE "finance_families" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"default_currency" varchar(8) DEFAULT 'CNY' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance_family_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"user_id" text,
	"display_name" text NOT NULL,
	"role" varchar(20) NOT NULL,
	"share_mode" varchar(16) DEFAULT 'shared' NOT NULL,
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"default_view" varchar(12) DEFAULT 'personal' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance_family_net_worth_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"date" date NOT NULL,
	"total_assets" numeric(18,2) DEFAULT '0' NOT NULL,
	"total_liabilities" numeric(18,2) DEFAULT '0' NOT NULL,
	"net_worth" numeric(18,2) DEFAULT '0' NOT NULL,
	"member_breakdown" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "finance_families_created_by_idx" ON "finance_families" USING btree ("created_by_user_id");
--> statement-breakpoint
CREATE INDEX "finance_family_members_family_status_idx" ON "finance_family_members" USING btree ("family_id","status");
--> statement-breakpoint
CREATE INDEX "finance_family_members_user_idx" ON "finance_family_members" USING btree ("user_id");
--> statement-breakpoint
-- 部分唯一索引：每家庭恰一个 self、一个 joint（其它角色可多条）
CREATE UNIQUE INDEX "finance_family_members_family_role_unique" ON "finance_family_members" USING btree ("family_id","role") WHERE "role" IN ('self', 'joint');
--> statement-breakpoint
CREATE UNIQUE INDEX "finance_family_nw_family_date_unique" ON "finance_family_net_worth_snapshots" USING btree ("family_id","date");
--> statement-breakpoint
ALTER TABLE "finance_family_members" ADD CONSTRAINT "finance_family_members_family_id_finance_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."finance_families"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "finance_family_net_worth_snapshots" ADD CONSTRAINT "finance_family_net_worth_snapshots_family_id_finance_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."finance_families"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- 家庭归属维度（谁花/谁赚，可空；ON DELETE SET NULL，但软删除不触发）
ALTER TABLE "finance_transactions" ADD COLUMN "member_id" uuid;
--> statement-breakpoint
ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_member_id_finance_family_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."finance_family_members"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
-- 家庭共享范围（默认 shared：合并视图开箱可用；隐私由加入同意 + 私有开关兑现）
ALTER TABLE "finance_accounts" ADD COLUMN "visibility" varchar(12) DEFAULT 'shared' NOT NULL;
