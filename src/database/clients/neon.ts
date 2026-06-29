import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { getConnectionString } from "../client";

const globalForDb = globalThis as unknown as {
  db?: ReturnType<typeof drizzle>;
};

export function getDb() {
  if (!globalForDb.db) {
    const sql = neon(getConnectionString());
    globalForDb.db = drizzle(sql);
  }
  return globalForDb.db;
}
