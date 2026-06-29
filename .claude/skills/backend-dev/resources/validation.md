# Validation - Zod Validation Patterns

Next.js 16 API Routes best practices for data validation using Zod.

## Table of Contents

- [Validation Principles](#validation-principles)
- [Basic Validation Patterns](#basic-validation-patterns)
- [Schema Design](#schema-design)
- [Custom Validation Rules](#custom-validation-rules)
- [Error Handling](#error-handling)
- [API Route Integration](#api-route-integration)
- [Advanced Validation Patterns](#advanced-validation-patterns)
- [Performance Optimization](#performance-optimization)

---

## Validation Principles

### Core Principles

1. **Early Validation**: Validate data before it enters the system
2. **Type Safety**: Use Zod's type inference
3. **Clear Error Messages**: Provide clear validation error information
4. **Reusability**: Create reusable schemas
5. **Security**: Prevent injection attacks and invalid data

### Validation Hierarchy

```
API Route (request body validation)
    ↓
Schema (field validation)
    ↓
Service (business rule validation)
```

---

## Basic Validation Patterns

### Basic Schema Definition

```typescript
// schemas/user.schema.ts
import { z } from 'zod';

// Basic user information
export const userSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
  email: z.string().email('Invalid email format'),
  age: z.number().int('Age must be an integer').min(18, 'Must be at least 18 years old').max(120, 'Invalid age'),
  created_at: z.date(),
  updated_at: z.date(),
});

// Create user Schema (excluding id and timestamps)
export const createUserSchema = userSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Update user Schema (all fields optional)
export const updateUserSchema = createUserSchema.partial();

// Export types
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

### Common Field Validation

```typescript
// schemas/common.schema.ts
import { z } from 'zod';

// String validation
export const nameSchema = z
  .string()
  .min(1, 'Name cannot be empty')
  .max(100, 'Name must be at most 100 characters')
  .trim();

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .or(z.literal(''));

export const phoneSchema = z
  .string()
  .regex(/^1[3-9]\d{9}$/, 'Invalid phone number format');

// Number validation
export const positiveIntSchema = z
  .number()
  .int('Must be an integer')
  .positive('Must be a positive number');

export const priceSchema = z
  .number()
  .min(0, 'Price cannot be negative')
  .max(999999.99, 'Price exceeds maximum allowed');

// Date validation
export const dateSchema = z
  .date()
  .or(z.string().datetime());

export const futureDateSchema = z
  .date()
  .refine(date => date > new Date(), {
    message: 'Date must be in the future',
  });

// Enum validation
export const statusSchema = z.enum(['active', 'inactive', 'pending'], {
  errorMap: () => ({ message: 'Invalid status value' }),
});

export const roleSchema = z.enum(['user', 'admin', 'super_admin']);

// Array validation
export const tagsSchema = z
  .array(z.string())
  .min(1, 'At least one tag is required')
  .max(5, 'Maximum 5 tags allowed');

export const emailsSchema = z
  .array(z.string().email())
  .max(3, 'Maximum 3 email addresses allowed');
```

---

## Schema Design

### Nested Schemas

```typescript
// schemas/address.schema.ts
export const addressSchema = z.object({
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City name must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zip: z.string().regex(/^\d{6}$/, 'Invalid zip code format'),
  country: z.string().min(2, 'Country name must be at least 2 characters'),
});

// schemas/profile.schema.ts
export const profileSchema = z.object({
  userId: z.string().uuid(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  address: addressSchema.nullable(),
  phone: phoneSchema.optional(),
  social: z.object({
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
  }).optional(),
});

export type Profile = z.infer<typeof profileSchema>;
```

### Conditional Validation

```typescript
// schemas/product.schema.ts
export const productSchema = z.object({
  name: z.string().min(1, 'Product name cannot be empty'),
  type: z.enum(['physical', 'digital']),
  price: z.number().min(0, 'Price cannot be negative'),

  // Physical products need weight and dimensions
  weight: z.number().optional(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
  }).optional(),

  // Digital products need download link
  downloadUrl: z.string().url().optional(),
})
.refine(
  (data) => {
    // Physical products must have weight
    if (data.type === 'physical') {
      return data.weight !== undefined && data.dimensions !== undefined;
    }
    return true;
  },
  {
    message: 'Physical products must provide weight and dimensions information',
    path: ['weight'],
  }
)
.refine(
  (data) => {
    // Digital products must have download link
    if (data.type === 'digital') {
      return data.downloadUrl !== undefined;
    }
    return true;
  },
  {
    message: 'Digital products must provide download link',
    path: ['downloadUrl'],
  }
);
```

### Union Validation

```typescript
// schemas/playground.schema.ts
export const playgroundFormSchema = z
  .object({
    type: z.string().min(1, 'Type is required'),
    amazonDomain: z.string().min(1, 'Amazon domain is required'),

    // Three identification methods: URL, ASIN, or GTIN
    url: z.string().url('Invalid URL format').optional().or(z.literal('')),
    asin: z
      .string()
      .regex(/^[A-Z0-9]{10}$/, 'ASIN must be 10 alphanumeric characters')
      .optional()
      .or(z.literal('')),
    gtin: z.string().optional().or(z.literal('')),

    // Optional configuration
    includeSummarizationAttributes: z.boolean().nullable().optional(),
    variantPrices: z.boolean().nullable().optional(),
    language: z.string().optional().or(z.literal('')),
    associateId: z.string().optional().or(z.literal('')),
    output: z.string().optional().or(z.literal('')),
    includeHtml: z.boolean().nullable().optional(),
  })
  .refine(
    (data) => {
      // At least one identification method must be provided
      return data.url || data.asin || data.gtin;
    },
    {
      message: 'Please provide at least one identification method: URL, ASIN, or GTIN',
      path: ['url'],
    }
  );

export type PlaygroundFormData = z.infer<typeof playgroundFormSchema>;
```

---

## Custom Validation Rules

### Custom Validation Functions

```typescript
// schemas/validators.ts
import { z } from 'zod';

// Password strength validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be at most 100 characters')
  .refine(
    (password) => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (password) => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    (password) => /[!@#$%^&*]/.test(password),
    'Password must contain at least one special character (!@#$%^&*)'
  );

// Username validation (letters, numbers, underscores, hyphens)
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and hyphens'
  )
  .refine(
    (username) => !username.startsWith('_'),
    'Username cannot start with an underscore'
  );

// File size validation (bytes)
export const fileSizeSchema = z
  .number()
  .max(5 * 1024 * 1024, 'File size cannot exceed 5MB');

// File type validation
export const fileTypeSchema = z
  .string()
  .refine(
    (type) => ['image/jpeg', 'image/png', 'image/webp'].includes(type),
    'Only JPEG, PNG, and WebP formats are supported'
  );

// Time range validation
export const timeRangeSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine(
    (data) => data.endDate > data.startDate,
    'End date must be later than start date'
  )
  .refine(
    (data) => {
      const daysDiff = (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 365;
    },
    'Time range cannot exceed 365 days'
  );

// Uniqueness validation (async)
export function createUniqueEmailSchema(checkEmail: (email: string) => Promise<boolean>) {
  return z
    .string()
    .email('Invalid email format')
    .refine(
      async (email) => {
        return await checkEmail(email);
      },
      'Email is already registered'
    );
}
```

### Reusable Validation Logic

```typescript
// schemas/base.schema.ts
import { z } from 'zod';

// Reusable base schemas
export const timestampsSchema = z.object({
  created_at: z.date(),
  updated_at: z.date(),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(10),
});

export const searchSchema = z.object({
  query: z.string().max(100, 'Search query must be at most 100 characters').optional(),
  orderBy: z.enum(['created_at', 'updated_at', 'name']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// Combined usage
export const userListQuerySchema = paginationSchema.merge(searchSchema);

export type UserListQuery = z.infer<typeof userListQuerySchema>;
```

---

## Error Handling

### Custom Error Messages

```typescript
// schemas/user.schema.ts
import { z } from 'zod';

// Method 1: Specify error messages when defining fields
export const userSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  age: z.number({
    required_error: 'Age is required',
    invalid_type_error: 'Age must be a number',
  }).min(18, 'Must be at least 18 years old'),
});

// Method 2: Use errorMap to customize all error messages
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === 'string') {
      return { message: 'Must be text' };
    }
    if (issue.expected === 'number') {
      return { message: 'Must be a number' };
    }
  }

  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === 'string') {
      return { message: `At least ${issue.minimum} characters` };
    }
  }

  return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);
```

### Format Validation Errors

```typescript
// utils/validation.ts
import { z } from 'zod';
import { ValidationError } from '@/utils/errors';

/**
 * Validate request data and format errors
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format error information
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));

      throw new ValidationError(
        'Request validation failed',
        formattedErrors
      );
    }
    throw error;
  }
}

/**
 * Safe validation (don't throw errors)
 */
export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Array<{ field: string; message: string }> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}
```

---

## API Route Integration

### Basic Integration

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createUserSchema } from '@/schemas/user.schema';
import { validateRequest } from '@/utils/validation';
import { APIResponse } from '@/utils/response';
import { userService } from '@/services/user.service';

export async function POST(request: NextRequest) {
  try {
    // 1. Get request body
    const body = await request.json();

    // 2. Validate data
    const data = validateRequest(createUserSchema, body);

    // 3. Call service layer
    const user = await userService.create(data);

    // 4. Return response
    return APIResponse.success(user, 'User created successfully', 201);
  } catch (error) {
    return APIResponse.error(error);
  }
}
```

### Query Parameter Validation

```typescript
// app/api/users/route.ts
import { NextRequest } from 'next/server';
import { userListQuerySchema } from '@/schemas/user.schema';

export async function GET(request: NextRequest) {
  try {
    // 1. Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 10,
      query: searchParams.get('query') || undefined,
      orderBy: searchParams.get('orderBy') || 'created_at',
      order: searchParams.get('order') || 'desc',
    };

    // 2. Validate parameters
    const validatedParams = validateRequest(userListQuerySchema, queryParams);

    // 3. Get data
    const result = await userService.list(validatedParams);

    return APIResponse.paginated(
      result.users,
      result.total,
      validatedParams.page,
      validatedParams.limit
    );
  } catch (error) {
    return APIResponse.error(error);
  }
}
```

### Dynamic Route Parameter Validation

```typescript
// app/api/users/[id]/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

interface RouteParams {
  params: { id: string };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Validate route parameters
    const { id } = validateRequest(paramsSchema, params);

    const user = await userService.getById(id);

    return APIResponse.success(user);
  } catch (error) {
    return APIResponse.error(error);
  }
}
```

### Multipart Form Validation

```typescript
// app/api/upload/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';

const uploadSchema = z.object({
  file: z.instanceof(File),
  title: z.string().min(1, 'Title cannot be empty'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const data = {
      file: formData.get('file'),
      title: formData.get('title'),
      description: formData.get('description'),
    };

    const validated = validateRequest(uploadSchema, data);

    // Validate file size and type
    if (validated.file.size > 5 * 1024 * 1024) {
      throw new ValidationError('File size cannot exceed 5MB');
    }

    // Process upload...

    return APIResponse.success({ message: 'Upload successful' });
  } catch (error) {
    return APIResponse.error(error);
  }
}
```

---

## Advanced Validation Patterns

### Async Validation

```typescript
// schemas/user.schema.ts
import { userRepository } from '@/repositories/user.repository';

export const createUserWithUniqueEmailSchema = z.object({
  name: z.string().min(2),
  email: z
    .string()
    .email('Invalid email format')
    .refine(
      async (email) => {
        const exists = await userRepository.emailExists(email);
        return !exists;
      },
      'Email is already registered'
    ),
  password: passwordSchema,
});

// Use async validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // parseAsync for async validation
    const data = await createUserWithUniqueEmailSchema.parseAsync(body);

    const user = await userService.create(data);
    return APIResponse.success(user, 'User created successfully', 201);
  } catch (error) {
    return APIResponse.error(error);
  }
}
```

### Transform and Data Cleaning

```typescript
// schemas/post.schema.ts
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be at most 200 characters')
    .transform(str => str.trim()),

  slug: z
    .string()
    .min(1, 'Slug cannot be empty')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .transform(str => str.toLowerCase()),

  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .transform(str => str.trim()),

  tags: z
    .array(z.string())
    .transform(tags => tags.map(tag => tag.toLowerCase().trim()))
    .transform(tags => [...new Set(tags)]), // Remove duplicates

  publishDate: z
    .string()
    .datetime()
    .or(z.date())
    .transform(val => new Date(val)),
});
```

### Discriminated Unions

```typescript
// schemas/notification.schema.ts
export const notificationSchema = z.discriminatedUnion('type', [
  // Email notification
  z.object({
    type: z.literal('email'),
    email: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),

  // SMS notification
  z.object({
    type: z.literal('sms'),
    phone: z.string(),
    message: z.string().max(160, 'SMS content must be at most 160 characters'),
  }),

  // Push notification
  z.object({
    type: z.literal('push'),
    deviceToken: z.string(),
    title: z.string(),
    body: z.string(),
    data: z.record(z.any()).optional(),
  }),
]);

export type Notification = z.infer<typeof notificationSchema>;

// Usage provides type hints
function sendNotification(notification: Notification) {
  if (notification.type === 'email') {
    // TypeScript knows there are email, subject, body fields here
    console.log(notification.email, notification.subject);
  } else if (notification.type === 'sms') {
    // TypeScript knows there are phone, message fields here
    console.log(notification.phone, notification.message);
  }
}
```

---

## Performance Optimization

### Schema Precompilation

```typescript
// schemas/user.schema.ts
// ✅ Define schema at module level (compile only once)
export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

// ❌ Avoid defining schemas inside functions (compile every time)
export async function POST(request: NextRequest) {
  // Don't do this
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
  });
}
```

### Lazy Loading Validation

```typescript
// For complex nested schemas, use lazy to avoid circular references
import { z } from 'zod';

interface Category {
  id: string;
  name: string;
  parent?: Category;
  children: Category[];
}

const categorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    parent: categorySchema.optional(),
    children: z.array(categorySchema),
  })
);
```

### Partial Validation

```typescript
// Validate only necessary fields
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  age: z.number().min(18).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be updated'
);

// Or use partial
export const partialUserSchema = createUserSchema.partial();
```

---

## Best Practices

### ✅ Recommended Practices

1. **Centralized Schema Management**: Store all schemas in `schemas/` directory
2. **Type Export**: Use `z.infer` to export TypeScript types
3. **Clear Error Messages**: Provide user-friendly error information
4. **Reusable Schemas**: Use `merge`, `extend`, `pick`, `omit`
5. **Progressive Validation**: Basic validation first, then business validation
6. **Performance Optimization**: Precompile schemas, avoid repeated definitions

### ❌ Avoid These Practices

1. **Define Schemas in API Routes**: Compile every request
2. **Over Validation**: Don't do business logic in validation layer
3. **Vague Error Messages**: "Invalid input"
4. **Ignore Type Inference**: Manually define types instead of using `z.infer`
5. **Overly Complex Validation**: Complex logic should be handled in Service layer

---

## Related Resources

- [Error Handling](./error-handling.md) - Validation error handling
- [Routing and Controllers](./routing-and-controllers.md) - API Route development
- [Service Patterns](./service-patterns.md) - Business validation
- [Testing](./testing.md) - Validation testing