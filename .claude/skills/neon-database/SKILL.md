---
name: neon-database
version: 1.0.0
description: Neon serverless PostgreSQL database integration with Drizzle ORM
priority: medium
dependencies: [database-dev]
triggers:
  keywords: [neon, neon database, serverless postgres, neon integration]
  files: ["drizzle.config.ts", "**/database/**/*.ts"]
  intents: ["neon setup", "connect neon", "neon database"]
---

# Neon Database Skill

> Neon Serverless PostgreSQL 集成

## 🎯 Setup

```bash
pnpm add @neondatabase/serverless
pnpm add drizzle-orm
```

## 📦 Configuration

```env
# .env.local
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Drizzle Config

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schema',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### Database Client

```typescript
// src/database/client.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

## 🔧 Connection Pooling

```typescript
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle(pool, { schema });
```

## 📊 Usage with Drizzle

```typescript
import { db } from '@/database/client';
import { users } from '@/database/schema';

// Select
const allUsers = await db.select().from(users);

// Insert
await db.insert(users).values({
  email: 'user@example.com',
  name: 'John Doe',
});

// Update
await db
  .update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.id, userId));
```

## 🚀 Edge Runtime Support

```typescript
// app/api/users/route.ts
import { db } from '@/database/client';

export const runtime = 'edge';

export async function GET() {
  const users = await db.select().from(users);
  return Response.json(users);
}
```

## 📚 Documentation

- [Neon Docs](https://neon.tech/docs/introduction)
- [Neon + Drizzle](https://neon.tech/docs/guides/drizzle)
