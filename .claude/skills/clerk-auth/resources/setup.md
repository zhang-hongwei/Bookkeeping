# Clerk Setup Guide

Complete setup guide for Clerk authentication in Next.js 15.

## Installation

```bash
pnpm add @clerk/nextjs
```

## Configuration

### 1. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 2. Wrap App with ClerkProvider

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 3. Add Middleware

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

### 4. Create Auth Pages

```typescript
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return <SignIn />;
}

// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return <SignUp />;
}
```

## OAuth Providers

Enable in Clerk Dashboard → User & Authentication → Social Connections:
- Google
- GitHub
- Microsoft
- Discord
- More...

## Customization

### Theme

```typescript
<ClerkProvider
  appearance={{
    baseTheme: dark,
    variables: {
      colorPrimary: '#3b82f6',
    },
  }}
>
  {children}
</ClerkProvider>
```

### Localization

```typescript
<ClerkProvider localization={zhCN}>
  {children}
</ClerkProvider>
```
