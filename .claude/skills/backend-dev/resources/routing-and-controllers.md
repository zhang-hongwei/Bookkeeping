# API Routes and Handling Patterns

Complete guide to Next.js API Routes best practices.

## Table of Contents

- [Golden Rules of API Routes](#golden-rules-of-api-routes)
- [Clear Routing Patterns](#clear-routing-patterns)
- [Error Handling](#error-handling)
- [HTTP Status Codes](#http-status-codes)
- [Anti-Patterns](#anti-patterns)
- [Refactoring Guide](#refactoring-guide)

---

## Golden Rules of API Routes

### Responsibilities

**API Routes should only:**
- ✅ Handle HTTP requests/responses
- ✅ Parse request parameters
- ✅ Validate input (Zod)
- ✅ Call service layer
- ✅ Format responses
- ✅ Error handling

**API Routes should NOT:**
- ❌ Include business logic
- ❌ Directly access database
- ❌ Complex data processing
- ❌ Permission check logic (should be in service layer)

---

## Clear Routing Patterns

### Basic CRUD Pattern

**File:** `app/api/users/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userService } from '@/features/users/api/user.service';
import { createUserSchema } from '@/features/users/types/user.schema';

// GET /api/users
export async function GET(request: NextRequest) {
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
    // Parse request body
    const body = await request.json();

    // Validate input
    const validated = createUserSchema.parse(body);

    // Call service
    const user = await userService.create(validated);

    // Return response
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Business logic error
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Unknown error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Key Points:**
- Clear responsibility separation
- Unified error handling
- Standard response format
- Appropriate HTTP status codes

### Dynamic Route Pattern

**File:** `app/api/users/[userId]/route.ts`

```typescript
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
    if (error instanceof Error) {
      // Specific error handling
      if (error.message === 'User not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
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
        {
          error: 'Validation failed',
          details: error.errors,
        },
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
      if (error.message === 'Email already exists') {
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

## Error Handling

### Unified Error Handling Function

Create reusable error handling helpers:

**File:** `lib/api/error-handler.ts`

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Custom error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Invalid request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Unified error handling function
 */
export function handleApiError(error: unknown): NextResponse {
  // Zod validation error
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Custom API error
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Standard error
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }

  // Unknown error
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json({ data }, { status });
}
```

### Using Unified Error Handling

```typescript
// app/api/users/route.ts

import { handleApiError, successResponse } from '@/lib/api/error-handler';
import { userService } from '@/features/users/api/user.service';
import { createUserSchema } from '@/features/users/types/user.schema';

export async function GET(request: NextRequest) {
  try {
    const users = await userService.getAll();
    return successResponse(users);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createUserSchema.parse(body);
    const user = await userService.create(validated);

    return successResponse(user, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Service Layer Throws Custom Errors

```typescript
// features/users/api/user.service.ts

import {
  NotFoundError,
  ConflictError,
} from '@/lib/api/error-handler';
import { userRepository } from '@/database/repositories/user.repository';

export const userService = {
  async getById(id: string) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  },

  async create(data: CreateUserInput) {
    // Check email uniqueness
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already exists');
    }

    return await userRepository.create(data);
  },
};
```

---

## HTTP Status Codes

### Standard Status Codes

| Status | Use | Example |
|--------|-----|---------|
| 200 | Success (GET, PATCH) | Get user, update success |
| 201 | Created (POST) | User created |
| 204 | No Content (DELETE) | User deleted (no content returned) |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable | Business rule validation failed |
| 500 | Server Error | Unexpected error |

### Status Code Usage Examples

```typescript
// 200 - Success (default)
return NextResponse.json({ data: user });

// 201 - Created
return NextResponse.json({ data: user }, { status: 201 });

// 204 - No Content
return new NextResponse(null, { status: 204 });

// 400 - Bad Request
return NextResponse.json(
  { error: 'Validation failed' },
  { status: 400 }
);

// 404 - Not Found
return NextResponse.json(
  { error: 'User not found' },
  { status: 404 }
);

// 409 - Conflict
return NextResponse.json(
  { error: 'Email already exists' },
  { status: 409 }
);
```

---

## Anti-Patterns

### Anti-Pattern 1: Business Logic in Routes ❌

```typescript
// ❌ WRONG: All logic in route

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ❌ Permission check in route
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ❌ Business rules in route
    const existing = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    // ❌ Direct database operation in route
    const [user] = await db.insert(users).values({
      name: body.name,
      email: body.email,
      createdAt: new Date(),
    }).returning();

    // ❌ Additional business logic in route
    await db.insert(userProfiles).values({
      userId: user.id,
      bio: '',
    });

    // ❌ Send email in route
    await sendWelcomeEmail(user.email);

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
```

**Why this is bad:**
- Hard to test (requires HTTP mocking)
- Hard to reuse (bound to route)
- Mixed responsibilities
- Hard to debug
- Hard to maintain

### Refactoring: Correct Pattern ✅

**Step 1: Service Layer**

```typescript
// features/users/api/user.service.ts

import {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} from '@/lib/api/error-handler';
import { userRepository } from '@/database/repositories/user.repository';
import { sendWelcomeEmail } from '@/lib/email';

export const userService = {
  async create(data: CreateUserInput, sessionUserId?: string) {
    // Permission check
    if (!sessionUserId) {
      throw new UnauthorizedError('Must be logged in to create user');
    }

    // Business rule: check email uniqueness
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already exists');
    }

    // Create user
    const user = await userRepository.create(data);

    // Create user profile
    await userRepository.createProfile(user.id);

    // Send welcome email (async)
    sendWelcomeEmail(user.email).catch(console.error);

    return user;
  },
};
```

**Step 2: API Route**

```typescript
// app/api/users/route.ts

import { handleApiError, successResponse } from '@/lib/api/error-handler';
import { userService } from '@/features/users/api/user.service';
import { createUserSchema } from '@/features/users/types/user.schema';
import { getServerSession } from 'next-auth/next';

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession();

    // Parse and validate
    const body = await request.json();
    const validated = createUserSchema.parse(body);

    // Call service
    const user = await userService.create(validated, session?.user?.id);

    // Return response
    return successResponse(user, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Result:**
- Route: 15 lines (clear responsibilities)
- Service: 30 lines (business logic)
- Testable, reusable, maintainable!

---

## Query Parameter Handling

### Pagination and Filtering

```typescript
// app/api/users/route.ts

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { handleApiError, successResponse } from '@/lib/api/error-handler';
import { userService } from '@/features/users/api/user.service';

// Query parameter schema
const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  pageSize: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  search: z.string().optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '10',
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') || undefined,
    };

    // Validate query parameters
    const validated = querySchema.parse(query);

    // Call service
    const result = await userService.list(validated);

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## Request Header Handling

### Authentication and Authorization

```typescript
// app/api/protected/route.ts

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { UnauthorizedError, handleApiError } from '@/lib/api/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      throw new UnauthorizedError('Not logged in');
    }

    // Check custom header
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      throw new UnauthorizedError('Missing API Key');
    }

    // Business logic
    const data = await someService.getData();

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## File Upload

### Handling multipart/form-data

```typescript
// app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { handleApiError } from '@/lib/api/error-handler';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only images are allowed' },
        { status: 400 }
      );
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const path = join('/tmp', file.name);
    await writeFile(path, buffer);

    return NextResponse.json({
      data: { filename: file.name, path },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## Middleware Pattern

### Reusable Route Helpers

```typescript
// lib/api/with-auth.ts

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { UnauthorizedError } from './error-handler';

export type AuthenticatedHandler = (
  request: NextRequest,
  context: { session: Session; params?: any }
) => Promise<Response>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest, context?: { params: any }) => {
    const session = await getServerSession();

    if (!session) {
      throw new UnauthorizedError('Not logged in');
    }

    return handler(request, { session, params: context?.params });
  };
}

// Usage
// app/api/protected/route.ts

import { withAuth } from '@/lib/api/with-auth';
import { handleApiError, successResponse } from '@/lib/api/error-handler';

export const GET = withAuth(async (request, { session }) => {
  try {
    // session already validated
    const data = await someService.getData(session.user.id);
    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
});
```

---

## Refactoring Guide

### Identify Routes That Need Refactoring

**Red Flags:**
- Route file > 100 lines
- Multiple try-catch blocks
- Direct database access (Drizzle calls)
- Complex business logic (if statements, loops)
- Permission checks in routes

**Check routes:**
```bash
# Find large route files
find app/api -name "route.ts" -exec wc -l {} \; | sort -n

# Find routes with database calls
grep -r "db.insert\|db.select\|db.update" app/api/
```

### Refactoring Steps

**1. Extract to Service:**
```typescript
// Before: logic in route
export async function POST(request: NextRequest) {
  // 50 lines of logic
}

// After: clean route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    const result = await service.create(validated);
    return successResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
```

**2. Create Service:**
```typescript
// features/feature/api/feature.service.ts
export const featureService = {
  async create(data: CreateInput): Promise<Result> {
    // All business logic here
    return await repository.create(data);
  },
};
```

**3. Add Repository (if needed):**
```typescript
// database/repositories/feature.repository.ts
export const featureRepository = {
  async create(data: CreateInput): Promise<Entity> {
    const [entity] = await db.insert(table).values(data).returning();
    return entity;
  },
};
```

---

## Summary

**API Routes Checklist:**
- ✅ Clear responsibilities (only handle HTTP)
- ✅ Unified error handling
- ✅ Use Zod validation
- ✅ Call service layer
- ✅ Appropriate HTTP status codes
- ✅ Standard response format
- ❌ No business logic
- ❌ No direct database access

**Related Files:**
- [architecture-overview.md](architecture-overview.md) - Architecture overview
- [service-patterns.md](service-patterns.md) - Service layer patterns
- [validation.md](validation.md) - Zod validation patterns
- [error-handling.md](error-handling.md) - Error handling details