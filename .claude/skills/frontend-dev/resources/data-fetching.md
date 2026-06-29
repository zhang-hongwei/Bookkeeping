# Data Fetching Patterns

Modern data fetching using TanStack Query with Suspense boundaries, cache-first strategies, and centralized API services.

---

## Primary Pattern: useSuspenseQuery

### Why use useSuspenseQuery?

**All new components** should use `useSuspenseQuery` instead of regular `useQuery`:

**Advantages:**
- No `isLoading` checks needed
- Integrated with Suspense boundaries
- Cleaner component code
- Consistent loading user experience
- Better error handling (with Error Boundaries)

### Basic Pattern

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';
import { myFeatureService } from '../api/myFeature.service';

export const MyComponent: React.FC<Props> = ({ id }) => {
  // No isLoading needed - Suspense handles it!
  const { data } = useSuspenseQuery({
    queryKey: ['myEntity', id],
    queryFn: () => myFeatureService.getEntity(id),
  });

  // data is always defined here (not undefined | Data)
  return <div>{data.name}</div>;
};

// Wrap with Suspense
import { Suspense } from 'react';
import { Loading } from '@/components/ui';

<Suspense fallback={<Loading />}>
  <MyComponent id="123" />
</Suspense>
```

### useSuspenseQuery vs useQuery

| Feature | useSuspenseQuery | useQuery |
|---------|------------------|----------|
| Loading state | Suspense handles | Manual `isLoading` check |
| Data type | Always defined | `Data \| undefined` |
| Used with | Suspense boundaries | Traditional components |
| Recommended for | **New components** | Legacy code only |
| Error handling | Error boundaries | Manual error state |

**When to use regular useQuery:**
- Maintaining legacy code
- Very simple cases (no Suspense)
- Polling with background updates

**For new components: Always prioritize useSuspenseQuery**

---

## Cache-First Strategy

### Cache-First Pattern Example

**Smart caching** reduces API calls by checking React Query cache first:

```typescript
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api/user.service';

export function useSuspenseUser(userId: string) {
  const queryClient = useQueryClient();

  return useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      // Strategy 1: Try to get from list cache first
      const cachedListData = queryClient.getQueryData<User[]>(['users']);

      if (cachedListData) {
        const cachedUser = cachedListData.find(
          (user) => user.id === userId
        );

        if (cachedUser) {
          return cachedUser;  // Return from cache!
        }
      }

      // Strategy 2: If not in cache, fetch from API
      return userService.getById(userId);
    },
    staleTime: 5 * 60 * 1000,      // 5 minutes considered fresh
    gcTime: 10 * 60 * 1000,        // Cache for 10 minutes
    refetchOnWindowFocus: false,   // Don't refetch on focus
  });
}
```

**Key points:**
- Check list/table cache before API calls
- Avoid redundant requests
- `staleTime`: How long data is considered fresh
- `gcTime`: How long unused data stays in cache
- `refetchOnWindowFocus: false`: User preference

---

## Parallel Data Fetching

### useSuspenseQueries

When fetching multiple independent resources:

```typescript
import { useSuspenseQueries } from '@tanstack/react-query';

export const MyComponent: React.FC = () => {
  const [userQuery, settingsQuery, preferencesQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['user'],
        queryFn: () => userService.getCurrentUser(),
      },
      {
        queryKey: ['settings'],
        queryFn: () => settingsService.getSettings(),
      },
      {
        queryKey: ['preferences'],
        queryFn: () => preferencesService.getPreferences(),
      },
    ],
  });

  // All data available, Suspense handles loading
  const user = userQuery.data;
  const settings = settingsQuery.data;
  const preferences = preferencesQuery.data;

  return <Display user={user} settings={settings} prefs={preferences} />;
};
```

**Advantages:**
- All queries execute in parallel
- Single Suspense boundary
- Type-safe results

---

## Query Key Organization

### Naming Conventions

```typescript
// Entity lists
['entities', 'list']
['entities', 'active']    // With view mode

// Single entities
['entity', entityId]

// Related data
['entity', entityId, 'history']
['entity', entityId, 'comments']

// User-specific
['user', userId, 'profile']
['user', userId, 'permissions']
```

**Rules:**
- Start with entity name (plural for lists, singular for single)
- Include ID for specificity
- Add view mode/relationships at the end
- Stay consistent throughout the app

### Query Key Examples

```typescript
// Real examples
queryKey: ['user', userId]
queryKey: ['users', 'active']
queryKey: ['mealRecord', recordId]
queryKey: ['mealRecords', 'summary']

// Invalidation patterns
queryClient.invalidateQueries({ queryKey: ['user', userId] });  // Specific user
queryClient.invalidateQueries({ queryKey: ['users'] });         // All users
queryClient.invalidateQueries({ queryKey: ['mealRecords'] });   // All meal records
```

---

## API Service Layer Pattern

### File Structure

Create centralized API services for each feature:

```
features/
  my-feature/
    api/
      myFeature.service.ts    # Service layer
```

Or global services:

```
services/
  user.service.ts
  mealRecord.service.ts
```

### Service Pattern

```typescript
/**
 * Centralized API service for my feature operations
 * Uses apiClient for consistent error handling
 */
import { apiClient } from '@/lib/apiClient';
import type { MyEntity, UpdatePayload } from '../types';

export const myFeatureService = {
  /**
   * Get single entity
   */
  getById: async (entityId: string): Promise<MyEntity> => {
    const { data } = await apiClient.get(`/api/entities/${entityId}`);
    return data;
  },

  /**
   * Get all entities
   */
  getAll: async (): Promise<MyEntity[]> => {
    const { data } = await apiClient.get('/api/entities');
    return data;
  },

  /**
   * Create entity
   */
  create: async (payload: CreatePayload): Promise<MyEntity> => {
    const { data } = await apiClient.post('/api/entities', payload);
    return data;
  },

  /**
   * Update entity
   */
  update: async (
    entityId: string,
    payload: UpdatePayload
  ): Promise<MyEntity> => {
    const { data } = await apiClient.put(
      `/api/entities/${entityId}`,
      payload
    );
    return data;
  },

  /**
   * Delete entity
   */
  delete: async (entityId: string): Promise<void> => {
    await apiClient.delete(`/api/entities/${entityId}`);
  },
};
```

**Key points:**
- Export single object with methods
- Use `apiClient` (axios instance from `@/lib/apiClient`)
- Type-safe parameters and return values
- JSDoc comments for each method
- Centralized error handling (handled by apiClient)

---

## Next.js API Route Format

### Correct Format

```typescript
// ✅ Correct - Next.js API routes
await apiClient.get('/api/users/123');
await apiClient.post('/api/users', data);
await apiClient.put('/api/users/456', updates);
await apiClient.get('/api/meal-records');

// ❌ Wrong - don't omit /api/ prefix (Next.js projects)
await apiClient.get('/users/123');  // Wrong!
await apiClient.post('/users', data); // Wrong!
```

**Next.js API routes:**
- User service: `/api/users/*`
- Meal records: `/api/meal-records/*`
- Auth: `/api/auth/*`

**Why:** In Next.js projects, all API routes are under `/api/`.

---

## Mutations

### Basic Mutation Pattern

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { myFeatureService } from '../api/myFeature.service';
import { Toast } from '@/components/ui';

export const MyComponent: React.FC = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (payload: UpdatePayload) =>
      myFeatureService.update(entityId, payload),

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ['entity', entityId]
      });
      Toast.success('Entity updated successfully');
    },

    onError: (error) => {
      Toast.error('Failed to update entity');
      console.error('Update error:', error);
    },
  });

  const handleUpdate = () => {
    updateMutation.mutate({ name: 'New Name' });
  };

  return (
    <Button
      onClick={handleUpdate}
      disabled={updateMutation.isPending}
    >
      {updateMutation.isPending ? 'Updating...' : 'Update'}
    </Button>
  );
};
```

### Optimistic Updates

```typescript
const updateMutation = useMutation({
  mutationFn: (payload) => myFeatureService.update(id, payload),

  // Optimistic update
  onMutate: async (newData) => {
    // Cancel in-flight refetches
    await queryClient.cancelQueries({ queryKey: ['entity', id] });

    // Snapshot current value
    const previousData = queryClient.getQueryData(['entity', id]);

    // Optimistic update
    queryClient.setQueryData(['entity', id], (old) => ({
      ...old,
      ...newData,
    }));

    // Return rollback function
    return { previousData };
  },

  // Rollback on error
  onError: (err, newData, context) => {
    queryClient.setQueryData(['entity', id], context.previousData);
    Toast.error('Update failed');
  },

  // Refetch on completion (success or error)
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['entity', id] });
  },
});
```

---

## Advanced Query Patterns

### Prefetching

```typescript
export function usePrefetchEntity() {
  const queryClient = useQueryClient();

  return (entityId: string) => {
    return queryClient.prefetchQuery({
      queryKey: ['entity', entityId],
      queryFn: () => myFeatureService.getById(entityId),
      staleTime: 5 * 60 * 1000,
    });
  };
}

// Usage: prefetch on hover
<div onMouseEnter={() => prefetch(id)}>
  <Link href={`/entities/${id}`}>View</Link>
</div>
```

### Accessing Cache Without Fetching

```typescript
export function useEntityFromCache(entityId: string) {
  const queryClient = useQueryClient();

  // Get from cache, don't fetch if missing
  const directCache = queryClient.getQueryData<MyEntity>(['entity', entityId]);

  if (directCache) return directCache;

  // Try list cache
  const listCache = queryClient.getQueryData<MyEntity[]>(['entities']);

  return listCache?.find(entity => entity.id === entityId);
}
```

### Dependent Queries

```typescript
// Fetch user first, then user settings
const { data: user } = useSuspenseQuery({
  queryKey: ['user', userId],
  queryFn: () => userService.getById(userId),
});

const { data: settings } = useSuspenseQuery({
  queryKey: ['user', userId, 'settings'],
  queryFn: () => settingsService.getUserSettings(user.id),
  // Suspense automatically waits for user to load
});
```

---

## API Client Configuration

### Using apiClient

```typescript
import { apiClient } from '@/lib/apiClient';

// apiClient is a configured axios instance
// Automatically includes:
// - Base URL configuration
// - Cookie-based authentication
// - Error interceptors
// - Response transformers
```

**Don't create new axios instances** - use apiClient for consistency.

---

## Error Handling in Queries

### onError Callback

```typescript
import { Toast } from '@/components/ui';

const { data } = useSuspenseQuery({
  queryKey: ['entity', id],
  queryFn: () => myFeatureService.getById(id),

  // Handle errors
  meta: {
    onError: (error) => {
      Toast.error('Failed to load entity');
      console.error('Loading error:', error);
    },
  },
});
```

### Error Boundaries

Combine with Error Boundaries for comprehensive error handling:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary
  fallback={<ErrorDisplay />}
  onError={(error) => console.error(error)}
>
  <Suspense fallback={<Loading />}>
    <ComponentWithSuspenseQuery />
  </Suspense>
</ErrorBoundary>
```

---

## Complete Examples

### Example 1: Simple Entity Fetch

```typescript
import React from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Box, Typography } from '@mui/material';
import { userService } from '@/services/user.service';

interface UserProfileProps {
  userId: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Box>
      <Typography variant="h5">{user.name}</Typography>
      <Typography>{user.email}</Typography>
    </Box>
  );
};

// Use with Suspense
import { Suspense } from 'react';
import { Loading } from '@/components/ui';

<Suspense fallback={<Loading />}>
  <UserProfile userId="123" />
</Suspense>
```

### Example 2: Cache-First Strategy

```typescript
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import type { User } from '@/types/user';

/**
 * Smart user hook with cache-first strategy
 * Prioritizes reusing data from list cache
 */
export function useSuspenseUser(userId: string) {
  const queryClient = useQueryClient();

  return useSuspenseQuery<User, Error>({
    queryKey: ['user', userId],
    queryFn: async () => {
      // 1. First check list cache
      const listCache = queryClient.getQueryData<User[]>(['users']);

      if (listCache) {
        const cached = listCache.find(user => user.id === userId);
        if (cached) {
          return cached;  // Reuse list data
        }
      }

      // 2. If not in cache, fetch from API
      return userService.getById(userId);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
```

**Advantages:**
- Avoid duplicate API calls
- Data instantly available if user came from list page
- Falls back to API if not cached

### Example 3: Parallel Fetching

```typescript
import { useSuspenseQueries } from '@tanstack/react-query';

export const Dashboard: React.FC = () => {
  const [statsQuery, usersQuery, notificationsQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['stats'],
        queryFn: () => statsService.getStats(),
      },
      {
        queryKey: ['users', 'active'],
        queryFn: () => userService.getActiveUsers(),
      },
      {
        queryKey: ['notifications', 'unread'],
        queryFn: () => notificationService.getUnread(),
      },
    ],
  });

  return (
    <Box>
      <StatsCard data={statsQuery.data} />
      <UsersList users={usersQuery.data} />
      <Notifications items={notificationsQuery.data} />
    </Box>
  );
};
```

---

## Mutations with Cache Invalidation

### Update Mutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Toast } from '@/components/ui';

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: UpdateParams) =>
      userService.update(userId, data),

    onSuccess: (data, variables) => {
      // Invalidate specific user
      queryClient.invalidateQueries({
        queryKey: ['user', variables.userId]
      });

      // Invalidate list to refresh table
      queryClient.invalidateQueries({
        queryKey: ['users']
      });

      Toast.success('User updated successfully');
    },

    onError: (error) => {
      Toast.error('Failed to update user');
      console.error('Update error:', error);
    },
  });
};

// Usage
const updateUser = useUpdateUser();

const handleSave = () => {
  updateUser.mutate({
    userId: '123',
    data: { name: 'New Name' }
  });
};
```

### Delete Mutation

```typescript
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.delete(userId),

    onSuccess: (data, userId) => {
      // Manually remove from cache (optimistic)
      queryClient.setQueryData<User[]>(
        ['users'],
        (old) => old?.filter(user => user.id !== userId) || []
      );

      Toast.success('User deleted');
    },

    onError: (error, userId) => {
      // Rollback - refetch for accurate state
      queryClient.invalidateQueries({
        queryKey: ['users']
      });
      Toast.error('Failed to delete user');
    },
  });
};
```

---

## Query Configuration Best Practices

### Default Configuration

```typescript
// In QueryClientProvider setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes
      gcTime: 1000 * 60 * 10,          // 10 minutes
      refetchOnWindowFocus: false,     // Don't refetch on focus
      refetchOnMount: false,           // Don't refetch on mount if fresh
      retry: 1,                        // Retry failed query once
    },
  },
});
```

### Per-Query Overrides

```typescript
// Frequently changing data - shorter staleTime
useSuspenseQuery({
  queryKey: ['notifications', 'unread'],
  queryFn: () => notificationService.getUnread(),
  staleTime: 30 * 1000,  // 30 seconds
});

// Rarely changing data - longer staleTime
useSuspenseQuery({
  queryKey: ['config', 'app'],
  queryFn: () => configService.getAppConfig(),
  staleTime: 30 * 60 * 1000,  // 30 minutes
});
```

---

## Summary

**Modern Data Fetching Recipe:**

1. **Create API service**: `services/X.service.ts` using apiClient
2. **Use useSuspenseQuery**: In components wrapped in Suspense
3. **Cache-first**: Check list cache before API calls
4. **Query Keys**: Consistent naming `['entity', id]`
5. **Route format**: `/api/route` (Next.js)
6. **Mutations**: invalidateQueries on success
7. **Error handling**: onError + Toast
8. **Type safety**: All parameters and return values typed

**References:**
- [component-patterns.md](component-patterns.md) - Suspense integration
- [loading-and-error-states.md](loading-and-error-states.md) - Loading component usage
- [complete-examples.md](complete-examples.md) - Complete working examples