import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getConnectionString } from "../client";
import * as schema from "../schema";

const globalForPg = globalThis as unknown as {
  pgPool?: Pool;
  db?: ReturnType<typeof drizzle>;
};

export function getPgPool() {
  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new Pool({ connectionString: getConnectionString() });
  }
  return globalForPg.pgPool;
}

export function getDb() {
  if (!globalForPg.db) {
    globalForPg.db = drizzle(getPgPool(), { schema });
  }
  return globalForPg.db;
}
