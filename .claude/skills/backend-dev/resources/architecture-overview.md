# Architecture Overview - Backend Services

Complete guide to layered architecture patterns for Next.js API routes.

## Table of Contents

- [Layered Architecture Pattern](#layered-architecture-pattern)
- [Request Lifecycle](#request-lifecycle)
- [Directory Structure Explanation](#directory-structure-explanation)
- [Module Organization](#module-organization)
- [Separation of Concerns](#separation-of-concerns)

---

## Layered Architecture Pattern

### Three-Layer Architecture

```
┌─────────────────────────────────────┐
│         HTTP Request                │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 1: API ROUTES                │
│  - Next.js route handlers           │
│  - Request/response handling        │
│  - Input validation                 │
│  - Call services                    │
│  - Error handling                   │
│  file: app/api/users/route.ts      │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 2: SERVICES                  │
│  - Business logic                   │
│  - Orchestration                    │
│  - Call repositories                │
│  - No HTTP knowledge                │
│  file: features/users/api/user.service.ts │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 3: REPOSITORIES              │
│  - Data access abstraction          │
│  - Drizzle ORM operations           │
│  - Query optimization               │
│  - Caching                          │
│  file: database/repositories/user.repository.ts │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│         Database (PostgreSQL)       │
└─────────────────────────────────────┘
```

### Why Choose This Architecture?

**Testability:**
- Each layer can be tested independently
- Easy to mock dependencies
- Clear test boundaries

**Maintainability:**
- Changes are isolated to specific layers
- Business logic separated from HTTP concerns
- Easy to locate bugs

**Reusability:**
- Services can be used by routes, cron jobs, scripts
- Repositories hide database implementation
- Business logic is not bound to HTTP

**Scalability:**
- Easy to add new endpoints
- Clear patterns to follow
- Consistent structure

---

## Request Lifecycle

### Complete Flow Example

```typescript
1. HTTP POST /api/users
   ↓
2. Next.js routes to app/api/users/route.ts
   ↓
3. POST function in route.ts handles:
   export async function POST(request: NextRequest) { ... }
   ↓
4. Validate input and call service:
   - Validate input with Zod
   - Call userService.create(data)
   - Handle success/error
   ↓
5. Service executes business logic:
   - Check business rules
   - Call userRepository.create(data)
   - Return result
   ↓
6. Repository executes database operations:
   - db.insert(users).values(data).returning()
   - Handle database errors
   - Return created user
   ↓
7. Response flows back:
   Repository → Service → API Route → Client
```

### Next.js API Routes Characteristics

**Key Differences (vs Express):**
- No middleware chain (Next.js middleware is different)
- Each route file is independent
- Export functions by HTTP method (GET, POST, PUT, DELETE, etc.)
- Native serverless support

**Example Structure:**
```typescript
// app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/features/users/api/user.service';
import { createUserSchema } from '@/features/users/types/user.schema';

export async function GET(request: NextRequest) {
  // GET /api/users
}

export async function POST(request: NextRequest) {
  // POST /api/users
}
```

---

## Directory Structure Explanation

### API Routes Directory

**Location:** `app/api/`

**Responsibility:** HTTP request/response handling

**File Structure:**
```
app/api/
├── users/
│   ├── route.ts              # GET, POST /api/users
│   └── [userId]/
│       └── route.ts          # GET, PATCH, DELETE /api/users/:userId
├── posts/
│   ├── route.ts              # GET, POST /api/posts
│   └── [postId]/
│       ├── route.ts          # GET, PATCH, DELETE /api/posts/:postId
│       └── comments/
│           └── route.ts      # GET, POST /api/posts/:postId/comments
└── auth/
    ├── login/
    │   └── route.ts          # POST /api/auth/login
    └── logout/
        └── route.ts          # POST /api/auth/logout
```

**Responsibilities:**
- Parse request parameters
- Validate input (Zod)
- Call appropriate service methods
- Format responses
- Error handling
- Set HTTP status codes

**Should NOT do:**
- ❌ Business logic
- ❌ Direct database operations
- ❌ Complex data processing

### Services Directory

**Location:** `features/{feature}/api/{feature}.service.ts`

**Responsibility:** Business logic and orchestration

**File Structure:**
```
features/
├── users/
│   ├── api/
│   │   ├── user.service.ts       # User business logic
│   │   └── user.service.test.ts  # Service tests
│   ├── types/
│   │   ├── user.ts               # User types
│   │   └── user.schema.ts        # Zod schemas
│   └── components/               # Frontend components
├── posts/
│   ├── api/
│   │   ├── post.service.ts
│   │   └── post.service.test.ts
│   └── types/
└── auth/
    └── api/
        └── auth.service.ts
```

**Responsibilities:**
- Implement business rules
- Orchestrate multiple repositories
- Transaction management
- Business validation
- No HTTP knowledge (no Request/Response types)

**Example:**
```typescript
// features/users/api/user.service.ts

import { userRepository } from '@/database/repositories/user.repository';
import type { CreateUserInput, User } from '../types/user';

export const userService = {
  async create(data: CreateUserInput): Promise<User> {
    // Business rule: check if email already exists
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('Email already exists');
    }

    // Create user
    return await userRepository.create(data);
  },

  async getById(id: string): Promise<User | null> {
    return await userRepository.findById(id);
  },
};
```

### Repositories Directory

**Location:** `database/repositories/`

**Responsibility:** Data access abstraction

**File Structure:**
```
database/
├── schema/
│   ├── users.ts                  # Drizzle schema
│   ├── posts.ts
│   └── index.ts
├── repositories/
│   ├── user.repository.ts        # User data access
│   ├── post.repository.ts        # Post data access
│   └── base.repository.ts        # Base repository (optional)
└── index.ts                      # Drizzle client
```

**Responsibilities:**
- Drizzle query operations
- Query optimization
- Database error handling
- Caching layer
- Hide Drizzle implementation details

**Example:**
```typescript
// database/repositories/user.repository.ts

import { db } from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import type { CreateUserInput, User } from '@/features/users/types/user';

export const userRepository = {
  async create(data: CreateUserInput): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  async findById(id: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return user || null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return user || null;
  },
};
```

### Types Directory

**Location:** `features/{feature}/types/`

**Responsibility:** TypeScript type definitions

**File Structure:**
```
features/users/types/
├── user.ts           # User type definitions
└── user.schema.ts    # Zod schemas
```

**Example:**
```typescript
// features/users/types/user.ts

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export type CreateUserInput = Omit<User, 'id' | 'createdAt'>;
export type UpdateUserInput = Partial<CreateUserInput>;

// features/users/types/user.schema.ts

import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
});

export const updateUserSchema = createUserSchema.partial();
```

---

## Module Organization

### Feature-Based Organization

For large features, use subdirectories:

```
features/workflow/
├── api/
│   ├── workflow.service.ts       # Core service
│   ├── action.service.ts         # Action service
│   └── validator.service.ts      # Validation service
├── types/
│   ├── workflow.ts
│   ├── action.ts
│   └── workflow.schema.ts
├── components/                   # Frontend components
└── hooks/                        # React hooks
```

**When to use:**
- Feature has 5+ files
- Clear subdomains exist
- Logical grouping improves clarity

### Flat Organization

For simple features:

```
features/users/
├── api/
│   └── user.service.ts
├── types/
│   ├── user.ts
│   └── user.schema.ts
└── components/
```

**When to use:**
- Simple features (< 5 files)
- No clear subdomains
- Flat structure is clearer

---

## Separation of Concerns

### Responsibilities of Each Layer

**API Routes Layer:**
- ✅ HTTP method handling (GET, POST, PATCH, DELETE)
- ✅ Request parsing (params, body, query, headers)
- ✅ Input validation (Zod)
- ✅ Service calls
- ✅ Response formatting
- ✅ Error handling
- ❌ Business logic
- ❌ Database operations

**Services Layer:**
- ✅ Business logic
- ✅ Business rule enforcement
- ✅ Orchestration (multiple repos)
- ✅ Transaction management
- ❌ HTTP concerns (Request/Response)
- ❌ Direct Drizzle calls (use repositories)

**Repositories Layer:**
- ✅ Drizzle operations
- ✅ Query building
- ✅ Database error handling
- ✅ Caching
- ❌ Business logic
- ❌ HTTP concerns

### Example: User Creation

**API Route:**
```typescript
// app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/features/users/api/user.service';
import { createUserSchema } from '@/features/users/types/user.schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createUserSchema.parse(body);

    const user = await userService.create(validated);

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
```

**Service:**
```typescript
// features/users/api/user.service.ts

import { userRepository } from '@/database/repositories/user.repository';
import type { CreateUserInput, User } from '../types/user';

export const userService = {
  async create(data: CreateUserInput): Promise<User> {
    // Business rule: check if email already exists
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('Email already exists');
    }

    // Create user
    return await userRepository.create(data);
  },
};
```

**Repository:**
```typescript
// database/repositories/user.repository.ts

import { db } from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import type { CreateUserInput, User } from '@/features/users/types/user';

export const userRepository = {
  async create(data: CreateUserInput): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  async findByEmail(email: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return user || null;
  },
};
```

**Note:** Each layer has clear, distinct responsibilities!

---

## Complete CRUD Example

### Complete User Management Example

**1. Schema Definition:**
```typescript
// database/schema/users.ts

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

**2. Types and Schemas:**
```typescript
// features/users/types/user.ts

import type { users } from '@/database/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type User = InferSelectModel<typeof users>;
export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<CreateUserInput>;

// features/users/types/user.schema.ts

import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
});

export const updateUserSchema = createUserSchema.partial();
```

**3. Repository:**
```typescript
// database/repositories/user.repository.ts

import { db } from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import type { CreateUserInput, UpdateUserInput, User } from '@/features/users/types/user';

export const userRepository = {
  async findAll(): Promise<User[]> {
    return await db.select().from(users);
  },

  async findById(id: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return user || null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return user || null;
  },

  async create(data: CreateUserInput): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  },

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  },
};
```

**4. Service:**
```typescript
// features/users/api/user.service.ts

import { userRepository } from '@/database/repositories/user.repository';
import type { CreateUserInput, UpdateUserInput, User } from '../types/user';

export const userService = {
  async getAll(): Promise<User[]> {
    return await userRepository.findAll();
  },

  async getById(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  async create(data: CreateUserInput): Promise<User> {
    // Business rule: check email uniqueness
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('Email already exists');
    }

    return await userRepository.create(data);
  },

  async update(id: string, data: UpdateUserInput): Promise<User> {
    // Ensure user exists
    await this.getById(id);

    // If updating email, check uniqueness
    if (data.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new Error('Email is already in use');
      }
    }

    return await userRepository.update(id, data);
  },

  async delete(id: string): Promise<void> {
    // Ensure user exists
    await this.getById(id);

    await userRepository.delete(id);
  },
};
```

**5. API Routes:**
```typescript
// app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userService } from '@/features/users/api/user.service';
import { createUserSchema } from '@/features/users/types/user.schema';

// GET /api/users
export async function GET() {
  try {
    const users = await userService.getAll();
    return NextResponse.json({ data: users });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createUserSchema.parse(body);
    const user = await userService.create(validated);

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Email already exists') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// app/api/users/[userId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userService } from '@/features/users/api/user.service';
import { updateUserSchema } from '@/features/users/types/user.schema';

interface RouteParams {
  params: {
    userId: string;
  };
}

// GET /api/users/:userId
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await userService.getById(params.userId);
    return NextResponse.json({ data: user });
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/:userId
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json();
    const validated = updateUserSchema.parse(body);
    const user = await userService.update(params.userId, validated);

    return NextResponse.json({ data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      if (error.message === 'Email is already in use') {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/:userId
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await userService.delete(params.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
```

---

## Summary

**Architecture Checklist:**
- ✅ Three-layer architecture: API Routes → Services → Repositories
- ✅ API Routes handle HTTP concerns
- ✅ Services contain business logic
- ✅ Repositories abstract data access
- ✅ Clear responsibilities for each layer
- ✅ Type safety (TypeScript + Zod)
- ✅ Consistent error handling
- ✅ Feature-based file organization

**Related Files:**
- [routing-and-controllers.md](routing-and-controllers.md) - API Routes detailed guide
- [service-patterns.md](service-patterns.md) - Service and Repository patterns
- [validation.md](validation.md) - Zod validation patterns
- [error-handling.md](error-handling.md) - Async and error handling