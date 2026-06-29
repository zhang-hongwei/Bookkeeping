/**
 * Finance 领域表的幂等初始化（无路径别名、无 tsx 依赖）。
 *
 * 背景：仓库重新初始化后 drizzle-kit 的 migration journal 与现有 schema 不一致，
 * `db:generate` 触发交互式 rename 提示（无 TTY 无法回答）。本项目已有运行时
 * `CREATE TABLE IF NOT EXISTS` 范式（见 github-settings.service.ensureTable），
 * 故 finance 表沿用同一约定：幂等建表 + 种子系统权益账户，仅作用于 finance_* 表。
 *
 * 运行：node --env-file=.env scripts/init-finance.mjs
 */
import pg from 'pg';

const { Pool } = pg;

/** 解析连接串，返回 { targetUrl, postgresUrl, dbName }。 */
function parseConn() {
  const u = new URL(process.env.DATABASE_URL);
  const dbName = u.pathname.slice(1) || 'postgres';
  const postgresUrl = new URL(u.toString());
  postgresUrl.pathname = '/postgres';
  return { targetUrl: u.toString(), postgresUrl: postgresUrl.toString(), dbName };
}

/** 幂等确保目标数据库存在（连到 maintenance 库 postgres 创建）。 */
async function ensureDatabase({ postgresUrl, dbName }) {
  const client = new pg.Client({ connectionString: postgresUrl });
  await client.connect();
  try {
    const { rows } = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );
    if (rows.length === 0) {
      // CREATE DATABASE 不支持参数化且不能在事务内
      await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
      console.log(`[init-finance] created database "${dbName}"`);
    } else {
      console.log(`[init-finance] database "${dbName}" already exists`);
    }
  } finally {
    await client.end();
  }
}

const DDL = [
  `CREATE TABLE IF NOT EXISTS "finance_accounts" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     "user_id" text NOT NULL,
     "name" text NOT NULL,
     "type" varchar(20) NOT NULL,
     "currency" varchar(8) NOT NULL DEFAULT 'CNY',
     "opening_balance" numeric(18,2) NOT NULL DEFAULT 0,
     "balance" numeric(18,2) NOT NULL DEFAULT 0,
     "credit_limit" numeric(18,2),
     "include_in_net_worth" boolean NOT NULL DEFAULT true,
     "is_archived" boolean NOT NULL DEFAULT false,
     "system_key" varchar(32),
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS "finance_categories" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     "user_id" text NOT NULL,
     "name" text NOT NULL,
     "kind" varchar(16) NOT NULL,
     "parent_id" uuid REFERENCES "finance_categories"("id") ON DELETE SET NULL,
     "keywords" jsonb NOT NULL DEFAULT '[]'::jsonb,
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS "finance_transactions" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     "user_id" text NOT NULL,
     "type" varchar(16) NOT NULL,
     "category_id" uuid,
     "amount" numeric(18,2) NOT NULL,
     "occurred_at" timestamp NOT NULL DEFAULT now(),
     "note" text,
     "source" varchar(16) NOT NULL DEFAULT 'manual',
     "confidence" numeric(3,2) NOT NULL DEFAULT 1.00,
     "bill_import_id" uuid,
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS "finance_entries" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     "transaction_id" uuid NOT NULL REFERENCES "finance_transactions"("id") ON DELETE CASCADE,
     "account_id" uuid NOT NULL REFERENCES "finance_accounts"("id") ON DELETE RESTRICT,
     "side" varchar(8) NOT NULL,
     "amount" numeric(18,2) NOT NULL,
     "created_at" timestamp NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS "finance_bill_imports" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     "user_id" text NOT NULL,
     "source" varchar(16) NOT NULL,
     "file_name" text,
     "status" varchar(16) NOT NULL DEFAULT 'parsing',
     "total" integer NOT NULL DEFAULT 0,
     "imported" integer NOT NULL DEFAULT 0,
     "skipped" integer NOT NULL DEFAULT 0,
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS "finance_bill_import_rows" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     "bill_import_id" uuid NOT NULL REFERENCES "finance_bill_imports"("id") ON DELETE CASCADE,
     "user_id" text NOT NULL,
     "row_hash" text NOT NULL,
     "parsed" jsonb NOT NULL,
     "status" varchar(16) NOT NULL DEFAULT 'pending',
     "created_at" timestamp NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS "finance_bill_import_rows_user_hash_idx"
     ON "finance_bill_import_rows" ("user_id", "row_hash")`,

  // ===== Phase 1：净资产闭环 + AI 报告 =====
  `CREATE TABLE IF NOT EXISTS "finance_net_worth_snapshots" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     "user_id" text NOT NULL,
     "date" date NOT NULL,
     "total_assets" numeric(18,2) NOT NULL DEFAULT 0,
     "total_liabilities" numeric(18,2) NOT NULL DEFAULT 0,
     "net_worth" numeric(18,2) NOT NULL DEFAULT 0,
     "breakdown" jsonb NOT NULL DEFAULT '{}'::jsonb,
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "finance_net_worth_user_date_unique"
     ON "finance_net_worth_snapshots" ("user_id", "date")`,
  // ai_reports 须先于 rule_findings（FK 引用）
  `CREATE TABLE IF NOT EXISTS "finance_ai_reports" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     "user_id" text NOT NULL,
     "type" varchar(16) NOT NULL DEFAULT 'monthly',
     "period_start" date NOT NULL,
     "period_end" date NOT NULL,
     "score" numeric(5,2),
     "dimensions" jsonb,
     "status" varchar(16) NOT NULL DEFAULT 'draft',
     "source_data_hash" text NOT NULL,
     "content" text,
     "content_ref" text,
     "approved_by" text,
     "generated_at" timestamp NOT NULL DEFAULT now(),
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS "finance_rule_findings" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     "user_id" text NOT NULL,
     "period_kind" varchar(16) NOT NULL DEFAULT 'month',
     "period_start" date NOT NULL,
     "period_end" date NOT NULL,
     "metric" varchar(32) NOT NULL,
     "value" numeric(18,4),
     "verdict" text,
     "risk_level" varchar(8) NOT NULL DEFAULT 'none',
     "report_id" uuid REFERENCES "finance_ai_reports"("id") ON DELETE SET NULL,
     "created_at" timestamp NOT NULL DEFAULT now()
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "finance_findings_period_metric_unique"
     ON "finance_rule_findings" ("user_id", "period_start", "period_end", "metric")`,
];

async function main() {
  const conn = parseConn();
  await ensureDatabase(conn);
  const pool = new Pool({ connectionString: conn.targetUrl });
  const client = await pool.connect();
  try {
    for (const stmt of DDL) {
      await client.query(stmt);
    }
    // 种子系统权益账户（幂等）：__income / __expense
    await client.query(`
      INSERT INTO "finance_accounts" ("user_id", "name", "type", "system_key")
      SELECT '__system__', '__income', 'equity', 'income'
      WHERE NOT EXISTS (SELECT 1 FROM "finance_accounts" WHERE "system_key" = 'income')
    `);
    await client.query(`
      INSERT INTO "finance_accounts" ("user_id", "name", "type", "system_key")
      SELECT '__system__', '__expense', 'equity', 'expense'
      WHERE NOT EXISTS (SELECT 1 FROM "finance_accounts" WHERE "system_key" = 'expense')
    `);
    const r = await client.query(
      `SELECT "system_key", "name" FROM "finance_accounts" WHERE "system_key" IS NOT NULL ORDER BY "system_key"`,
    );
    console.log('[init-finance] OK — tables ensured. system accounts:', JSON.stringify(r.rows));
  } finally {
    client.release();
  }
  await pool.end();
}

main().catch((err) => {
  console.error('[init-finance] FAILED:', err);
  process.exit(1);
});
