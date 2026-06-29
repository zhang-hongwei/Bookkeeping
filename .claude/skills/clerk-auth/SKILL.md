---
name: clerk-auth
version: 1.0.0
description: Clerk authentication and user management integration best practices
priority: high
dependencies: []
triggers:
  keywords: [clerk, clerk auth, authentication, sign in, sign up, user management, middleware protection]
  files: ["**/clerk/**/*.ts", "middleware.ts", "app/**/sign-in/**", "app/**/sign-up/**"]
  intents: ["setup clerk", "protect route", "manage users", "clerk middleware"]
---

# Clerk Authentication Skill

> Clerk 认证和用户管理集成最佳实践

## 🎯 Core Setup

### Installation

```bash
pnpm add @clerk/nextjs
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### Middleware Protection

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/protected(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

## 📦 Common Patterns

### Sign In/Sign Up Pages

```typescript
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn />
    </div>
  );
}

// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp />
    </div>
  );
}
```

### Server Components

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();

  return (
    <div>
      <h1>Welcome, {user?.firstName}</h1>
      <p>Email: {user?.emailAddresses[0].emailAddress}</p>
    </div>
  );
}
```

### Client Components

```typescript
'use client';

import { useUser, useAuth, UserButton } from '@clerk/nextjs';

export function UserProfile() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Not signed in</div>;

  return (
    <div>
      <UserButton afterSignOutUrl="/" />
      <p>Welcome, {user.firstName}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Protected API Routes

```typescript
// app/api/protected/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ data: 'Protected data', userId });
}
```

### Organization Management

```typescript
import { OrganizationSwitcher, OrganizationProfile } from '@clerk/nextjs';

export function OrgComponents() {
  return (
    <div>
      <OrganizationSwitcher />
      <OrganizationProfile />
    </div>
  );
}
```

### Custom Session Claims

```typescript
// Extend session with custom data
import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  const { sessionClaims } = auth();

  const userRole = sessionClaims?.metadata?.role;
  const isPro = sessionClaims?.metadata?.isPro;

  return <div>Role: {userRole}</div>;
}
```

## 🔒 Security Features

### Role-Based Access Control

```typescript
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware((auth, req) => {
  const { sessionClaims } = auth();
  const role = sessionClaims?.metadata?.role;

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return Response.redirect(new URL('/unauthorized', req.url));
    }
  }
});
```

### Custom Authorization

```typescript
import { auth } from '@clerk/nextjs/server';

export async function hasPermission(permission: string) {
  const { sessionClaims } = auth();
  const permissions = sessionClaims?.metadata?.permissions || [];
  return permissions.includes(permission);
}

// Usage
export default async function Page() {
  const canEdit = await hasPermission('posts:edit');

  if (!canEdit) {
    return <div>Access Denied</div>;
  }

  return <div>Edit content</div>;
}
```

## 📚 Resources

See the `resources/` directory for:
- `setup.md` - Complete setup guide
- `components.md` - Pre-built components
- `customization.md` - Theme and branding

## 🚫 Common Pitfalls

1. **Not configuring middleware matcher** - Required for auth to work
2. **Using auth() in client components** - Use useAuth() instead
3. **Not handling loading states** - Check isLoaded before rendering
4. **Exposing secret key** - Keep it server-side only

## 📖 Documentation

- [Clerk Docs](https://clerk.com/docs)
- [Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [API Reference](https://clerk.com/docs/references/nextjs/overview)
