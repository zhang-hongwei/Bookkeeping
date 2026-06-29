# File Organization

The correct file and directory structure for maintainable, scalable frontend code.

---

## features/ vs components/ Distinction

### features/ Directory

**Purpose**: Domain-specific functionality with its own logic, API, and components

**When to use:**
- Feature has multiple related components
- Feature has its own API endpoints
- Feature has domain-specific logic
- Feature has custom hooks/utilities

**Examples:**
- `features/users/` - User management
- `features/meal-records/` - Meal record management
- `features/auth/` - Authentication flow

**Structure:**
```
features/
  my-feature/
    api/
      myFeature.service.ts    # API service layer
    components/
      MyFeatureMain.tsx       # Main component
      SubComponents/          # Related components
    hooks/
      useMyFeature.ts         # Custom hooks
      useSuspenseMyFeature.ts # Suspense hooks
    helpers/
      myFeatureHelpers.ts     # Utility functions
    types/
      index.ts                # TypeScript types
    index.ts                  # Public exports
```

### components/ Directory

**Purpose**: Truly reusable components used across multiple features

**When to use:**
- Component is used in 3+ places
- Component is generic (no feature-specific logic)
- Component is a UI primitive or pattern

**Examples:**
- `components/ui/` - UI component library (Modal, Select, Toast, Table, Loading)
- `components/theme/` - Theme configuration
- `components/ErrorBoundary/` - Error handling
- `components/LoadingOverlay/` - Loading overlay

**Structure:**
```
components/
  ui/
    Modal/
      Modal.tsx
      Modal.test.tsx
    Select/
      Select.tsx
      Select.test.tsx
  theme/
    ThemeProvider.tsx
```

---

## Feature Directory Structure (Detailed)

### Complete Feature Example

Based on real project structure:

```
features/
  users/
    api/
      user.service.ts         # API service layer (GET, POST, PUT, DELETE)

    components/
      UserTable.tsx           # Main container component
      UserProfile.tsx         # User profile
      UserForm.tsx            # User form
      modals/
        DeleteUserModal.tsx
      cards/
        UserCard.tsx

    hooks/
      useUserQueries.ts       # Regular queries
      useSuspenseUser.ts      # Suspense queries
      useUserMutations.ts     # Mutations
      useUserFilters.ts       # Feature-specific hooks

    helpers/
      userHelpers.ts          # Utility functions
      validation.ts           # Validation logic

    types/
      index.ts                # TypeScript types/interfaces

    index.ts                  # Public API exports
```

### Subdirectory Guidelines

#### api/ Directory

**Purpose**: Centralized API calls for the feature

**Files:**
- `{feature}.service.ts` - Main API service

**Pattern:**
```typescript
// features/my-feature/api/myFeature.service.ts
import { apiClient } from '@/lib/apiClient';

export const myFeatureService = {
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/api/items/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await apiClient.post('/api/items', payload);
    return data;
  },
};
```

#### components/ Directory

**Purpose**: Feature-specific components

**Organization:**
- Flat structure if <5 components
- Organize by responsibility in subdirectories if >5 components

**Examples:**
```
components/
  MyFeatureMain.tsx           # Main component
  MyFeatureHeader.tsx         # Supporting component
  MyFeatureFooter.tsx

  # Or using subdirectories:
  containers/
    MyFeatureContainer.tsx
  presentational/
    MyFeatureDisplay.tsx
  forms/
    MyFeatureForm.tsx
  modals/
    DeleteModal.tsx
```

#### hooks/ Directory

**Purpose**: Custom hooks for the feature

**Naming:**
- `use` prefix (camelCase)
- Descriptive naming

**Examples:**
```
hooks/
  useMyFeature.ts               # Main hook
  useSuspenseMyFeature.ts       # Suspense version
  useMyFeatureMutations.ts      # Mutations
  useMyFeatureFilters.ts        # Filter/search hooks
```

#### helpers/ Directory

**Purpose**: Feature-specific utility functions

**Examples:**
```
helpers/
  myFeatureHelpers.ts           # General utilities
  validation.ts                 # Validation logic
  transformers.ts               # Data transformations
  constants.ts                  # Constants
```

#### types/ Directory

**Purpose**: TypeScript types and interfaces

**Files:**
```
types/
  index.ts                      # Main types, exports
  internal.ts                   # Internal types (not exported)
```

---

## Import Aliases

### Available Aliases

| Alias | Resolves to | Purpose |
|-------|-------------|---------|
| `@/` | `src/` | Absolute imports from src root |
| `~/` | Project root | Project configuration files |

### Usage Examples

```typescript
// ✅ Recommended - use aliases for absolute imports
import { apiClient } from '@/lib/apiClient';
import { Toast } from '@/components/ui';
import { userService } from '@/services/user.service';
import type { User } from '@/types/user';

// ❌ Avoid - deeply nested relative paths
import { apiClient } from '../../../lib/apiClient';
import { Toast } from '../../../components/ui';
```

### When to Use Which Alias

**@/ (General purpose):**
- Lib utilities: `@/lib/apiClient`
- Hooks: `@/hooks/useAuth`
- Config: `@/config/theme`
- Shared services: `@/services/userService`
- Components: `@/components/ui`
- Features: `@/features/users`
- Types: `@/types/user`

**~/ (Project root):**
```typescript
import packageJson from '~/package.json';
import { config } from '~/next.config';
```

---

## File Naming Conventions

### Components

**Pattern**: PascalCase with `.tsx` extension

```
MyComponent.tsx
UserDataGrid.tsx
CustomAppBar.tsx
```

**Avoid:**
- camelCase: `myComponent.tsx` ❌
- kebab-case: `my-component.tsx` ❌
- UPPERCASE: `MYCOMPONENT.tsx` ❌

### Hooks

**Pattern**: camelCase with `use` prefix, `.ts` extension

```
useMyFeature.ts
useSuspenseUser.ts
useAuth.ts
useUserFilters.ts
```

### API Services

**Pattern**: camelCase with `.service.ts` suffix

```
user.service.ts
mealRecord.service.ts
auth.service.ts
```

Or global services:

```
services/
  user.service.ts
  mealRecord.service.ts
```

### Helpers/Utilities

**Pattern**: camelCase with descriptive names, `.ts` extension

```
myFeatureHelpers.ts
validation.ts
transformers.ts
constants.ts
```

### Types

**Pattern**: camelCase, `index.ts` or descriptive names

```
types/index.ts
types/user.ts
types/mealRecord.ts
```

---

## When to Create a New Feature

### Create New Feature When:

- Multiple related components (>3)
- Has its own API endpoints
- Domain-specific logic
- Will grow over time
- Reused across multiple routes

**Example:** `features/users/`
- 10+ components
- Its own API service
- Complex state management
- Used in multiple routes

### Add to Existing Feature When:

- Related to existing functionality
- Shares the same API
- Logical grouping
- Extends existing feature

**Example:** Adding export dialog to user feature

### Create Reusable Component When:

- Used across 3+ features
- Generic, no domain logic
- Purely presentational
- Shared patterns

**Example:** `components/ui/Loading/`

---

## Import Organization

### Import Order (Recommended)

```typescript
// 1. React and React-related
import React, { useState, useCallback, useMemo } from 'react';
import { Suspense, lazy } from 'react';

// 2. Third-party libraries (alphabetical)
import { Box, Paper, Button, Grid } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

// 3. Alias imports (@/)
import { apiClient } from '@/lib/apiClient';
import { Toast, Loading } from '@/components/ui';
import { userService } from '@/services/user.service';

// 4. Type imports (grouped)
import type { User } from '@/types/user';
import type { MealRecord } from '@/types/mealRecord';

// 5. Relative imports (same feature)
import { MySubComponent } from './MySubComponent';
import { useMyFeature } from '../hooks/useMyFeature';
import { myFeatureHelpers } from '../helpers/myFeatureHelpers';
```

**All imports use single quotes** (project standard)

---

## Public API Pattern

### feature/index.ts

Export public API from feature for clean imports:

```typescript
// features/my-feature/index.ts

// Export main components
export { MyFeatureMain } from './components/MyFeatureMain';
export { MyFeatureHeader } from './components/MyFeatureHeader';

// Export hooks
export { useMyFeature } from './hooks/useMyFeature';
export { useSuspenseMyFeature } from './hooks/useSuspenseMyFeature';

// Export API
export { myFeatureService } from './api/myFeature.service';

// Export types
export type { MyFeatureData, MyFeatureConfig } from './types';
```

**Usage:**
```typescript
// ✅ Clean import from feature index
import { MyFeatureMain, useMyFeature } from '@/features/my-feature';

// ❌ Avoid deep imports (but acceptable if needed)
import { MyFeatureMain } from '@/features/my-feature/components/MyFeatureMain';
```

---

## Next.js Project Structure

### App Router Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Homepage
│   ├── api/                   # API routes
│   │   ├── auth/
│   │   ├── users/
│   │   └── meal-records/
│   ├── users/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── meal-records/
│       ├── page.tsx
│       └── create/
│           └── page.tsx
│
├── features/                   # Domain-specific functionality
│   ├── users/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── helpers/
│   │   ├── types/
│   │   └── index.ts
│   ├── meal-records/
│   └── auth/
│
├── components/                 # Reusable components
│   ├── ui/                    # UI component library
│   │   ├── Modal/
│   │   ├── Select/
│   │   ├── Toast/
│   │   ├── Table/
│   │   └── Loading/
│   ├── theme/                 # Theme related
│   └── providers/             # Context providers
│
├── hooks/                      # Shared hooks
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   └── useMediaQuery.ts
│
├── lib/                        # Shared utilities
│   ├── apiClient.ts
│   └── utils.ts
│
├── services/                   # Global services
│   ├── user.service.ts
│   └── mealRecord.service.ts
│
├── types/                      # Shared TypeScript types
│   ├── user.ts
│   ├── mealRecord.ts
│   └── common.ts
│
├── config/                     # Configuration
│   └── theme.ts
│
└── middleware.ts               # Next.js middleware
```

---

## Page Component Patterns

### Next.js Page Structure

```typescript
// app/users/[id]/page.tsx
import { Suspense } from 'react';
import { Loading } from '@/components/ui';
import { UserProfile } from '@/features/users';

interface PageProps {
  params: {
    id: string;
  };
}

export default function UserProfilePage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<Loading />}>
        <UserProfile userId={params.id} />
      </Suspense>
    </div>
  );
}
```

### Layout Components

```typescript
// app/layout.tsx
import { Providers } from '@/components/providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
```

---

## API Route Organization

### Next.js API Route Structure

```
src/app/api/
├── auth/
│   ├── [...nextauth]/
│   │   └── route.ts           # NextAuth configuration
│   ├── login/
│   │   └── route.ts
│   └── logout/
│       └── route.ts
├── users/
│   ├── route.ts               # GET /api/users, POST /api/users
│   └── [id]/
│       └── route.ts           # GET/PUT/DELETE /api/users/[id]
└── meal-records/
    ├── route.ts
    └── [id]/
        └── route.ts
```

### API Route Example

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { userService } from '@/services/user.service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await userService.getAll();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const user = await userService.create(body);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
```

---

## Directory Structure Visualization

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/                   # API routes
│   ├── users/
│   └── meal-records/
│
├── features/                   # Domain-specific functionality
│   ├── users/
│   ├── meal-records/
│   └── auth/
│
├── components/                 # Reusable components
│   ├── ui/
│   ├── theme/
│   └── providers/
│
├── hooks/                      # Shared hooks
├── lib/                        # Shared utilities
├── services/                   # Global services
├── types/                      # Shared types
├── config/                     # Configuration
└── middleware.ts
```

---

## Summary

**Key Principles:**
1. **features/** for domain-specific code
2. **components/** for truly reusable UI
3. Use subdirectories: api/, components/, hooks/, helpers/, types/
4. Use import aliases for clean imports (@/)
5. Consistent naming: PascalCase components, camelCase utilities
6. Export public API from feature index.ts
7. Next.js App Router for routing
8. API routes in app/api/

**References:**
- [component-patterns.md](component-patterns.md) - Component structure
- [data-fetching.md](data-fetching.md) - API service patterns
- [complete-examples.md](complete-examples.md) - Complete feature examples