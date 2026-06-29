# Routing Guide

Next.js App Router implementation with folder-based routing and lazy loading patterns.

---

## Next.js App Router Overview

**Next.js App Router** core features:
- Folder structure defines routes
- Special filenames define functionality (page.tsx, layout.tsx)
- Server components prioritized
- Automatic code splitting and lazy loading
- Nested layouts and route groups

---

## Folder-Based Routing

### Directory Structure

```
app/
  page.tsx                      # Homepage (/)
  layout.tsx                    # Root layout
  loading.tsx                   # Loading state
  error.tsx                     # Error handling
  not-found.tsx                 # 404 page

  posts/
    page.tsx                    # /posts
    layout.tsx                  # /posts layout
    create/
      page.tsx                  # /posts/create
    [postId]/
      page.tsx                  # /posts/:postId (dynamic)

  api/
    posts/
      route.ts                  # API endpoint /api/posts
```

**Patterns:**
- `page.tsx` = Page for that path
- `[param]` = Dynamic parameter
- `(folder)` = Route group (doesn't affect URL)
- `layout.tsx` = Shared layout
- `loading.tsx` = Automatic Suspense boundary
- `error.tsx` = Error boundary

---

## Special Files

### page.tsx - Page Component

```typescript
/**
 * User list page
 * Path: /users
 */

import React, { Suspense } from 'react';
import { Box, Paper } from '@mui/material';
import { Loading } from '@/components/ui';

// Lazy load heavy components
const UserDataGrid = React.lazy(() =>
  import('@/features/users/components/UserDataGrid')
);

export default function UsersPage() {
  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3 }}>
        <h1>User List</h1>
        <Suspense fallback={<Loading />}>
          <UserDataGrid />
        </Suspense>
      </Paper>
    </Box>
  );
}
```

**Key points:**
- Default export function component
- Function name usually `PageName + Page`
- Wrap lazy loaded components with `Suspense`
- Can be server or client component

### layout.tsx - Layout Component

```typescript
/**
 * Root layout
 * Applied to all pages
 */

import React from 'react';
import { Box } from '@mui/material';
import { Providers } from '@/components/Providers';
import { CustomAppBar } from '@/components/CustomAppBar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <CustomAppBar />
            <Box component="main" sx={{ flex: 1, p: 2 }}>
              {children}
            </Box>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
```

**Nested Layouts:**

```typescript
// app/dashboard/layout.tsx

import React from 'react';
import { Box } from '@mui/material';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex' }}>
      <DashboardSidebar />
      <Box sx={{ flex: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
```

### loading.tsx - Loading State

```typescript
/**
 * Automatic Suspense boundary
 * Shows for all page.tsx files in this folder during loading
 */

import { Loading } from '@/components/ui';

export default function LoadingPage() {
  return <Loading />;
}
```

**Purpose:**
- Next.js automatically wraps `page.tsx` in Suspense
- Shows this component when data is loading
- Prevents layout shift

### error.tsx - Error Handling

```typescript
/**
 * Error boundary
 * Catches errors for this folder and subfolders
 */

'use client';  // Must be client component

import React from 'react';
import { Box, Button, Typography } from '@mui/material';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" color="error" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {error.message}
      </Typography>
      <Button variant="contained" onClick={reset}>
        Try again
      </Button>
    </Box>
  );
}
```

### not-found.tsx - 404 Page

```typescript
/**
 * Custom 404 page
 */

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        404 - Page not found
      </Typography>
      <Button component={Link} href="/" variant="contained">
        Back to home
      </Button>
    </Box>
  );
}
```

---

## Dynamic Routes

### Single Parameter

```typescript
// app/users/[userId]/page.tsx

import React, { Suspense } from 'react';
import { Loading } from '@/components/ui';

const UserProfile = React.lazy(() =>
  import('@/features/users/components/UserProfile').then(m => ({
    default: m.UserProfile
  }))
);

interface UserPageProps {
  params: {
    userId: string;
  };
}

export default function UserPage({ params }: UserPageProps) {
  const { userId } = params;

  return (
    <Suspense fallback={<Loading />}>
      <UserProfile userId={userId} />
    </Suspense>
  );
}
```

### Multiple Parameters

```typescript
// app/posts/[postId]/comments/[commentId]/page.tsx

interface CommentPageProps {
  params: {
    postId: string;
    commentId: string;
  };
}

export default function CommentPage({ params }: CommentPageProps) {
  const { postId, commentId } = params;

  return <CommentEditor postId={postId} commentId={commentId} />;
}
```

### Catch-all Routes

```typescript
// app/docs/[...slug]/page.tsx

interface DocsPageProps {
  params: {
    slug: string[];  // Matches /docs/a/b/c => ['a', 'b', 'c']
  };
}

export default function DocsPage({ params }: DocsPageProps) {
  const { slug } = params;
  const path = slug.join('/');

  return <DocsViewer path={path} />;
}
```

### Optional Catch-all Routes

```typescript
// app/shop/[[...categories]]/page.tsx

interface ShopPageProps {
  params: {
    categories?: string[];  // Optional, also matches /shop
  };
}

export default function ShopPage({ params }: ShopPageProps) {
  const categories = params.categories || [];

  return <ProductList categories={categories} />;
}
```

---

## Route Groups

### Organize Routes Without Affecting URL

```
app/
  (marketing)/
    about/
      page.tsx              # /about (not /marketing/about)
    contact/
      page.tsx              # /contact
  (shop)/
    products/
      page.tsx              # /products
    cart/
      page.tsx              # /cart
```

**Use cases:**
- Organize related routes
- Apply different layouts to different route groups
- Don't affect URL structure

### Different Layouts Example

```typescript
// app/(marketing)/layout.tsx
export default function MarketingLayout({ children }) {
  return (
    <div>
      <MarketingNav />
      {children}
    </div>
  );
}

// app/(shop)/layout.tsx
export default function ShopLayout({ children }) {
  return (
    <div>
      <ShopNav />
      <CartWidget />
      {children}
    </div>
  );
}
```

---

## Navigation

### Link Component (Recommended)

```typescript
import Link from 'next/link';
import { Button } from '@mui/material';

export const Navigation: React.FC = () => {
  return (
    <div>
      {/* Basic link */}
      <Link href="/posts">View Posts</Link>

      {/* Dynamic route */}
      <Link href={`/users/${userId}`}>User Profile</Link>

      {/* With query parameters */}
      <Link href={{ pathname: '/search', query: { q: 'test' } }}>
        Search
      </Link>

      {/* MUI button */}
      <Button component={Link} href="/posts" variant="contained">
        View Posts
      </Button>
    </div>
  );
};
```

### useRouter Hook

```typescript
'use client';  // Client component

import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';

export const MyComponent: React.FC = () => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/posts');
  };

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    router.refresh();  // Re-fetch server data
  };

  return (
    <div>
      <Button onClick={handleNavigate}>Go to Posts</Button>
      <Button onClick={handleBack}>Back</Button>
      <Button onClick={handleRefresh}>Refresh</Button>
    </div>
  );
};
```

### redirect() Function (Server)

```typescript
// app/profile/page.tsx

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';

export default async function ProfilePage() {
  const session = await getServerSession();

  // Redirect if not logged in
  if (!session) {
    redirect('/login');
  }

  return <ProfileContent />;
}
```

---

## Query Parameters and Search Parameters

### searchParams (Server Components)

```typescript
// app/search/page.tsx

interface SearchPageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const page = Number(searchParams.page) || 1;

  return <SearchResults query={query} page={page} />;
}
```

### useSearchParams (Client Components)

```typescript
'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export const SearchFilter: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('q') || '';

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('q', newQuery);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <input
      value={query}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
};
```

---

## API Routes

### Basic API Route

```typescript
// app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/database/schema';

// GET /api/users
export async function GET(request: NextRequest) {
  try {
    const allUsers = await db.select().from(users);

    return NextResponse.json({ data: allUsers });
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

    const [newUser] = await db.insert(users).values(body).returning();

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
```

### Dynamic API Route

```typescript
// app/api/users/[userId]/route.ts

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
  const { userId } = params;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: user });
}

// PATCH /api/users/:userId
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const { userId } = params;
  const updates = await request.json();

  const [updatedUser] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning();

  return NextResponse.json({ data: updatedUser });
}

// DELETE /api/users/:userId
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { userId } = params;

  await db.delete(users).where(eq(users.id, userId));

  return NextResponse.json({ success: true });
}
```

---

## Complete Route Examples

### User Profile Page

```typescript
// app/users/[userId]/page.tsx

/**
 * User profile page
 * Path: /users/:userId
 */

import React, { Suspense } from 'react';
import { Box, Paper } from '@mui/material';
import { Loading } from '@/components/ui';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';

// Lazy load heavy components
const UserProfile = React.lazy(() =>
  import('@/features/users/components/UserProfile').then(m => ({
    default: m.UserProfile
  }))
);

interface UserPageProps {
  params: {
    userId: string;
  };
}

// Server-side data prefetch (optional)
async function getUser(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    notFound();  // Triggers not-found.tsx
  }

  return user;
}

export default async function UserPage({ params }: UserPageProps) {
  const { userId } = params;

  // Optional: server-side prefetch data
  // const user = await getUser(userId);

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Suspense fallback={<Loading />}>
          <UserProfile userId={userId} />
        </Suspense>
      </Paper>
    </Box>
  );
}

// Generate static params (optional, for static generation)
export async function generateStaticParams() {
  const allUsers = await db.select({ id: users.id }).from(users);

  return allUsers.map((user) => ({
    userId: user.id,
  }));
}

// Metadata (optional)
export async function generateMetadata({ params }: UserPageProps) {
  const user = await getUser(params.userId);

  return {
    title: `${user.name} - User Profile`,
    description: `${user.name}'s personal profile page`,
  };
}
```

### List Page with Search

```typescript
// app/posts/page.tsx

import React, { Suspense } from 'react';
import { Box, Paper } from '@mui/material';
import { Loading } from '@/components/ui';

const PostsList = React.lazy(() =>
  import('@/features/posts/components/PostsList').then(m => ({
    default: m.PostsList
  }))
);

interface PostsPageProps {
  searchParams: {
    q?: string;
    category?: string;
    page?: string;
  };
}

export default function PostsPage({ searchParams }: PostsPageProps) {
  const query = searchParams.q || '';
  const category = searchParams.category || '';
  const page = Number(searchParams.page) || 1;

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3 }}>
        <h1>Posts List</h1>
        <Suspense fallback={<Loading />}>
          <PostsList
            query={query}
            category={category}
            page={page}
          />
        </Suspense>
      </Paper>
    </Box>
  );
}
```

---

## Middleware

### Route Protection

```typescript
// middleware.ts (root directory)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Configure matching paths
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

---

## Routing Best Practices

### 1. Lazy Load Heavy Components

```typescript
// ✅ Recommended
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}

// ❌ Avoid - all components load immediately
import { HeavyComponent } from './HeavyComponent';
```

### 2. Use loading.tsx for Automatic Loading States

```
app/
  posts/
    loading.tsx          # ✅ Automatic Suspense boundary
    page.tsx
```

### 3. Use error.tsx for Error Handling

```typescript
// app/posts/error.tsx

'use client';

export default function PostsError({ error, reset }) {
  return (
    <div>
      <h2>Error loading posts</h2>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
```

### 4. Use Route Groups to Organize Code

```
app/
  (auth)/
    login/
    register/
  (main)/
    posts/
    users/
```

### 5. Server Components First

```typescript
// ✅ Default is server component (no need to mark)
export default async function Page() {
  const data = await fetchData();  // Server-side data fetching
  return <div>{data}</div>;
}

// ✅ Client component only when interactivity needed
'use client';
export default function InteractivePage() {
  const [state, setState] = useState();
  return <button onClick={() => setState()}>...</button>;
}
```

---

## Summary

**Next.js App Router Checklist:**
- ✅ Use `page.tsx` to define pages
- ✅ Use `layout.tsx` for shared layouts
- ✅ Use `loading.tsx` for automatic loading states
- ✅ Use `error.tsx` for error boundaries
- ✅ Lazy load heavy components: `React.lazy(() => import())`
- ✅ Wrap lazy loaded components with `Suspense`
- ✅ Dynamic routes with `[param]` folders
- ✅ Route groups with `(group)` folders
- ✅ API routes in `app/api/`
- ✅ `Link` component for navigation
- ✅ `useRouter()` for programmatic navigation
- ✅ Server components first, client components when interactivity needed

**References:**
- [component-patterns.md](component-patterns.md) - Lazy loading patterns
- [loading-and-error-states.md](loading-and-error-states.md) - Loading component usage
- [complete-examples.md](complete-examples.md) - Complete routing examples
- [data-fetching.md](data-fetching.md) - API service layer patterns