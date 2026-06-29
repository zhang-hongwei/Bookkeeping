---
name: supabase-integration
version: 1.0.0
description: Supabase database, authentication, and storage integration best practices
priority: high
dependencies: []
triggers:
  keywords: [supabase, supabase auth, supabase database, supabase storage, realtime, RLS, row level security]
  files: ["**/supabase/**/*.ts", "src/lib/supabase.ts", "src/utils/supabase/**"]
  intents: ["setup supabase", "supabase auth", "supabase query", "supabase storage"]
---

# Supabase Integration Skill

> Supabase 数据库、认证、存储集成最佳实践

## 🎯 Core Principles

### 1. Client Initialization Patterns

**Browser Client (Client Components)**
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Server Client (Server Components)**
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

**Middleware Client (Route Protection)**
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}
```

## 📦 Common Patterns

### Authentication

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    emailRedirectTo: `${location.origin}/auth/callback`,
  },
});

// Sign in with password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
});

// Sign in with OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${location.origin}/auth/callback`,
  },
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
const { error } = await supabase.auth.signOut();
```

### Database Queries

```typescript
// Select
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(10);

// Insert
const { data, error } = await supabase
  .from('users')
  .insert({
    email: 'john@example.com',
    name: 'John Doe'
  })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('users')
  .update({ name: 'Jane Doe' })
  .eq('id', userId)
  .select()
  .single();

// Delete
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId);

// Joins
const { data, error } = await supabase
  .from('posts')
  .select(`
    *,
    author:users(id, name, avatar)
  `)
  .eq('status', 'published');
```

### Storage

```typescript
// Upload file
const file = event.target.files[0];
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true,
  });

// Download file
const { data, error } = await supabase.storage
  .from('avatars')
  .download('avatar.png');

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('avatar.png');

// Delete file
const { error } = await supabase.storage
  .from('avatars')
  .remove(['avatar.png']);

// List files
const { data, error } = await supabase.storage
  .from('avatars')
  .list(userId, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });
```

### Realtime

```typescript
// Subscribe to table changes
const channel = supabase
  .channel('db-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'messages' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Subscribe to presence
const channel = supabase.channel('room-1')
  .on('presence', { event: 'sync' }, () => {
    const newState = channel.presenceState();
    console.log('sync', newState);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user: 'user-1' });
    }
  });

// Unsubscribe
await supabase.removeChannel(channel);
```

## 🔒 Security Best Practices

### 1. Row Level Security (RLS)

**Always enable RLS on your tables:**

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);
```

### 2. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only (DO NOT expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Type Safety

```typescript
// Generate types from your database
// npx supabase gen types typescript --project-id your-project-id > src/types/database.ts

import type { Database } from '@/types/database';

const supabase = createClient<Database>();

// Now all queries are type-safe
const { data } = await supabase
  .from('users')
  .select('*');
// data is typed as Database['public']['Tables']['users']['Row'][]
```

## 📚 Resources

See the `resources/` directory for detailed guides on:
- `authentication.md` - Complete authentication patterns
- `database.md` - Advanced database queries and RLS
- `storage.md` - File storage best practices
- `realtime.md` - Realtime subscription patterns

## 🚫 Common Pitfalls

1. **Don't create client in global scope** - Always create client per request
2. **Don't bypass RLS with service role key on client** - Security risk
3. **Don't forget to handle auth state changes** - Use `onAuthStateChange`
4. **Don't expose service role key** - Keep it server-side only
5. **Don't forget cookie configuration** - Required for SSR auth

## 📖 Official Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
