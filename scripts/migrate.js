#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const MAX_WAIT_RETRIES = 30;
const WAIT_INTERVAL_MS = 1000;

async function waitForDatabase(pool) {
  for (let i = 1; i <= MAX_WAIT_RETRIES; i++) {
    try {
      const client = await pool.connect();
      client.release();
      return;
    } catch {
      console.log(`[migrate] Waiting for database... (${i}/${MAX_WAIT_RETRIES})`);
      await new Promise((r) => setTimeout(r, WAIT_INTERVAL_MS));
    }
  }
  throw new Error(`Database not ready after ${MAX_WAIT_RETRIES} retries`);
}

async function ensureMigrationTable(client) {
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS drizzle;
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL UNIQUE,
      created_at bigint
    );
  `);
}

function getMigrationFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

function hashContent(content) {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = (hash * 31 + content.charCodeAt(i)) | 0;
  }
  return hash.toString(16);
}

async function runMigrations(pool) {
  const migrationsDir = path.resolve(__dirname, 'migrations');
  const client = await pool.connect();

  try {
    await ensureMigrationTable(client);
    const files = getMigrationFiles(migrationsDir);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      const hash = hashContent(sql);

      const { rows } = await client.query(
        'SELECT id FROM drizzle.__drizzle_migrations WHERE hash = $1',
        [hash]
      );

      if (rows.length > 0) {
        console.log(`[migrate] Already applied: ${file}`);
        continue;
      }

      console.log(`[migrate] Applying: ${file}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)',
          [hash, Date.now()]
        );
        await client.query('COMMIT');
        console.log(`[migrate] Applied: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Failed to apply ${file}: ${err.message}`);
      }
    }
  } finally {
    client.release();
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('[migrate] DATABASE_URL is not set, skipping migrations');
    process.exit(0);
  }

  if (process.env.DATABASE_PROVIDER === 'none') {
    console.log('[migrate] DATABASE_PROVIDER=none, skipping migrations');
    process.exit(0);
  }

  const pool = new Pool({ connectionString });

  try {
    await waitForDatabase(pool);
    console.log('[migrate] Database is ready');
    await runMigrations(pool);
    console.log('[migrate] All migrations completed successfully');
  } catch (err) {
    console.error('[migrate] Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
