# Error Handling - Error Response Strategies

Next.js 16 API Routes error handling best practices and patterns.

## Table of Contents

- [Error Handling Principles](#error-handling-principles)
- [Custom Error Classes](#custom-error-classes)
- [API Route Error Handling](#api-route-error-handling)
- [Service Layer Error Handling](#service-layer-error-handling)
- [Database Error Handling](#database-error-handling)
- [Validation Error Handling](#validation-error-handling)
- [Global Error Handling](#global-error-handling)
- [Error Logging](#error-logging)

---

## Error Handling Principles

### Core Principles

1. **Clarity**: Error messages should clearly explain the problem
2. **Consistency**: Use unified error formats
3. **Security**: Don't expose sensitive information
4. **Traceability**: Log error details for debugging
5. **User-Friendly**: Return meaningful error messages to users

### Error Hierarchy

```
API Route (catch all errors, return HTTP response)
    ↓
Service (throw business errors)
    ↓
Repository/Database (throw data layer errors)
```

---

## Custom Error Classes

### APIError Base Class

```typescript
// utils/errors/api-error.ts

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Specific Error Types

```typescript
// utils/errors/index.ts

export class BadRequestError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'BAD_REQUEST', details);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends APIError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 422, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class InternalServerError extends APIError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
    this.name = 'InternalServerError';
  }
}
```

---

## API Route Error Handling

### Basic Error Handling Pattern

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services/user.service';
import { APIError, NotFoundError } from '@/utils/errors';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const users = await userService.getAll();
    return NextResponse.json(users);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Validate data (may throw ValidationError)
    const data = createUserSchema.parse(body);

    // 3. Call service layer (may throw business errors)
    const user = await userService.create(data);

    // 4. Return success response
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// Unified error handling function
function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Custom API error
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Zod validation error
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Request validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Unknown error
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    },
    { status: 500 }
  );
}
```

### Unified Response Format

```typescript
// utils/response.ts
import { NextResponse } from 'next/server';
import { APIError } from './errors';
import { z } from 'zod';

export class APIResponse {
  /**
   * Success response
   */
  static success<T>(data: T, message?: string, status: number = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }

  /**
   * Error response
   */
  static error(error: unknown): NextResponse {
    console.error('API Error:', error);

    // Custom API error
    if (error instanceof APIError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          timestamp: new Date().toISOString(),
        },
        { status: error.statusCode }
      );
    }

    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        },
        { status: 422 }
      );
    }

    // Drizzle database error
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data already exists',
          code: 'DUPLICATE_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Unknown error
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'development'
          ? (error as Error).message
          : 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  /**
   * Paginated response
   */
  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number
  ) {
    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page < Math.ceil(total / pageSize),
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Usage Example

```typescript
// app/api/posts/route.ts
import { APIResponse } from '@/utils/response';
import { NotFoundError } from '@/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const posts = await postService.getAll();
    return APIResponse.success(posts);
  } catch (error) {
    return APIResponse.error(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createPostSchema.parse(body);

    const post = await postService.create(data);

    return APIResponse.success(
      post,
      'Post created successfully',
      201
    );
  } catch (error) {
    return APIResponse.error(error);
  }
}
```

---

## Service Layer Error Handling

### Service Throws Business Errors

```typescript
// services/user.service.ts
import { NotFoundError, ConflictError, BadRequestError } from '@/utils/errors';

export class UserService {
  async getById(id: string) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user[0]) {
      throw new NotFoundError('User');
    }

    return user[0];
  }

  async create(data: InsertUser) {
    // Check if email already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictError('Email is already registered');
    }

    // Validate age
    if (data.age && data.age < 18) {
      throw new BadRequestError('User must be at least 18 years old');
    }

    try {
      const [user] = await db
        .insert(users)
        .values(data)
        .returning();

      return user;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw new InternalServerError('Failed to create user');
    }
  }

  async update(id: string, data: Partial<InsertUser>) {
    // Get user first (will throw NotFoundError)
    await this.getById(id);

    try {
      const [updated] = await db
        .update(users)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      return updated;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw new InternalServerError('Failed to update user');
    }
  }
}
```

---

## Database Error Handling

### Drizzle Error Handling

```typescript
// repositories/user.repository.ts
import { InternalServerError } from '@/utils/errors';

export class UserRepository {
  async deleteWithRelations(userId: string) {
    try {
      return await db.transaction(async (tx) => {
        // Delete comments
        await tx
          .delete(comments)
          .where(eq(comments.userId, userId));

        // Delete posts
        await tx
          .delete(posts)
          .where(eq(posts.userId, userId));

        // Delete user
        const [deleted] = await tx
          .delete(users)
          .where(eq(users.id, userId))
          .returning();

        return deleted;
      });
    } catch (error) {
      console.error('Failed to delete user:', error);

      // Foreign key constraint error
      if (error instanceof Error && error.message.includes('foreign key')) {
        throw new ConflictError('Cannot delete user, related data exists');
      }

      // Other database errors
      throw new InternalServerError('Failed to delete user');
    }
  }
}
```

### Transaction Error Handling

```typescript
// services/order.service.ts
export class OrderService {
  async createOrder(userId: string, items: OrderItem[]) {
    try {
      return await db.transaction(async (tx) => {
        // 1. Validate inventory
        for (const item of items) {
          const [product] = await tx
            .select()
            .from(products)
            .where(eq(products.id, item.productId))
            .limit(1);

          if (!product) {
            throw new NotFoundError(`Product ${item.productId}`);
          }

          if (product.stock < item.quantity) {
            throw new BadRequestError(
              `Insufficient stock: ${product.name} (${product.stock} available)`
            );
          }
        }

        // 2. Create order
        const [order] = await tx
          .insert(orders)
          .values({
            userId,
            total: this.calculateTotal(items),
            status: 'pending',
          })
          .returning();

        // 3. Create order items and update inventory
        for (const item of items) {
          await tx.insert(orderItems).values({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          });

          await tx
            .update(products)
            .set({
              stock: sql`${products.stock} - ${item.quantity}`,
            })
            .where(eq(products.id, item.productId));
        }

        return order;
      });
    } catch (error) {
      // Re-throw business errors
      if (error instanceof APIError) {
        throw error;
      }

      // Unknown error
      console.error('Failed to create order:', error);
      throw new InternalServerError('Failed to create order');
    }
  }

  private calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
```

---

## Validation Error Handling

### Zod Validation Errors

```typescript
// utils/validation.ts
import { z } from 'zod';
import { ValidationError } from './errors';

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));

      throw new ValidationError('Request validation failed', details);
    }
    throw error;
  }
}

// Usage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = validateRequest(createUserSchema, body);

    const user = await userService.create(data);
    return APIResponse.success(user, 'User created successfully', 201);
  } catch (error) {
    return APIResponse.error(error);
  }
}
```

---

## Global Error Handling

### Error Boundary (for React)

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Global Error Page

```typescript
// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Global error</h2>
        <p>{error.message}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

---

## Error Logging

### Basic Logging

```typescript
// utils/logger.ts
export class Logger {
  static error(message: string, error: unknown, context?: any) {
    console.error({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      context,
    });
  }

  static warn(message: string, context?: any) {
    console.warn({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      context,
    });
  }

  static info(message: string, context?: any) {
    console.log({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      context,
    });
  }
}

// Usage
try {
  await userService.create(data);
} catch (error) {
  Logger.error('Failed to create user', error, { userId, data });
  throw error;
}
```

### Sentry Integration (Production)

```typescript
// instrumentation.ts (project root directory)
import * as Sentry from '@sentry/nextjs';

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    });
  }
}
```

```typescript
// utils/response.ts (integrate Sentry)
import * as Sentry from '@sentry/nextjs';

export class APIResponse {
  static error(error: unknown): NextResponse {
    // Log to Sentry
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error);
    }

    // Log locally
    Logger.error('API Error', error);

    // ...return response
  }
}
```

---

## Best Practices

### ✅ Recommended Practices

1. **Use Custom Error Classes**: Clear error types and status codes
2. **Unified Response Format**: All APIs use same response structure
3. **Log Error Details**: Facilitate debugging and monitoring
4. **Protect Sensitive Information**: Don't expose stack traces in production
5. **Layered Error Handling**: API Route → Service → Repository
6. **User-Friendly Messages**: Return meaningful error information to users

### ❌ Avoid These Practices

1. **Swallow Errors**: Catch but don't handle or log
2. **Expose Sensitive Information**: Return database error details
3. **Over-Catching**: Unnecessary try-catch
4. **Inconsistent Responses**: Different APIs use different formats
5. **Ignore Logging**: Don't log errors for debugging
6. **Vague Error Messages**: "Something went wrong"

---

## Related Resources

- [Routing and Controllers](./routing-and-controllers.md) - API Route Development
- [Service Patterns](./service-patterns.md) - Service Layer Patterns
- [Validation](./validation.md) - Data Validation
- [Testing](./testing.md) - Error Handling Testing