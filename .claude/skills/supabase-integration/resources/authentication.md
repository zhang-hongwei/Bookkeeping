# Supabase Authentication Patterns

Complete guide for implementing authentication with Supabase in Next.js 15.

## Auth Callback Route

**Required for OAuth and email verification:**

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return user to error page with error description
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
```

## Client Component Auth

```typescript
// components/auth/LoginForm.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.refresh();
      router.push('/dashboard');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : 'Sign In'}
      </button>
    </form>
  );
}
```

## Server Component Auth

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
    </div>
  );
}
```

## OAuth Providers

```typescript
// components/auth/OAuthButtons.tsx
'use client';

import { createClient } from '@/lib/supabase/client';

export function OAuthButtons() {
  const supabase = createClient();

  const handleOAuth = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div>
      <button onClick={() => handleOAuth('google')}>
        Sign in with Google
      </button>
      <button onClick={() => handleOAuth('github')}>
        Sign in with GitHub
      </button>
    </div>
  );
}
```

## Auth State Management

```typescript
// hooks/useAuth.ts
'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        router.refresh();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return { user, loading };
}
```

## Email Verification

```typescript
// Sign up with email verification
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    emailRedirectTo: `${location.origin}/auth/callback`,
    data: {
      name: 'John Doe',
    },
  },
});
```

## Password Reset

```typescript
// Request password reset
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  {
    redirectTo: `${location.origin}/auth/reset-password`,
  }
);

// Update password (after reset link)
const { error } = await supabase.auth.updateUser({
  password: 'new-secure-password',
});
```

## Session Management

```typescript
// Get session
const { data: { session } } = await supabase.auth.getSession();

// Refresh session
const { data: { session }, error } = await supabase.auth.refreshSession();

// Sign out
const { error } = await supabase.auth.signOut();
```

## Protected API Routes

```typescript
// app/api/protected/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ data: 'Protected data', user });
}
```
