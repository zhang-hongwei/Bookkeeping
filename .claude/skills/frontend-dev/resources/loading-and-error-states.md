# Loading and Error States

**Critical**: Proper loading and error state handling prevents layout shift and provides better user experience.

---

## ⚠️ Critical Rule: Never Use Early Returns

### The Problem

```typescript
// ❌ NEVER do this - use early return with loader
const Component = () => {
  const { data, isLoading } = useQuery();

  // Wrong: This causes layout shift and poor user experience
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <Content data={data} />;
};
```

**Why this is bad:**
1. **Layout shift**: Content position jumps when loading completes
2. **CLS (Cumulative Layout Shift)**: Poor Core Web Vital score
3. **Jarring user experience**: Page structure suddenly changes
4. **Losing scroll position**: User loses their place on the page

### The Solutions

**Solution 1: Suspense + Loading (Recommended for new components)**

```typescript
import { Suspense, lazy } from 'react';
import { Loading } from '@/components/ui';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export const MyComponent: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
};
```

**Solution 2: LoadingOverlay (For legacy useQuery patterns)**

```typescript
import { LoadingOverlay } from '@/components/LoadingOverlay';

export const MyComponent: React.FC = () => {
  const { data, isLoading } = useQuery({ ... });

  return (
    <LoadingOverlay loading={isLoading}>
      <Content data={data} />
    </LoadingOverlay>
  );
};
```

---

## Suspense + Loading Components

### Purpose

- Shows loading indicator when lazy loaded components are loading
- Smooth fade-in animation
- Prevents layout shift
- Consistent loading experience across the app

### Import

```typescript
import { Suspense } from 'react';
import { Loading } from '@/components/ui';
```

### Basic Usage

```typescript
<Suspense fallback={<Loading />}>
  <LazyLoadedComponent />
</Suspense>
```

### With useSuspenseQuery

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Loading } from '@/components/ui';

const Inner: React.FC = () => {
  // No need for isLoading!
  const { data } = useSuspenseQuery({
    queryKey: ['data'],
    queryFn: () => api.getData(),
  });

  return <Display data={data} />;
};

// Outer component wraps with Suspense
export const Outer: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Inner />
    </Suspense>
  );
};
```

### Multiple Suspense Boundaries

**Pattern**: Load independent sections separately

```typescript
export const Dashboard: React.FC = () => {
  return (
    <Box>
      <Suspense fallback={<Loading />}>
        <Header />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <MainContent />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <Sidebar />
      </Suspense>
    </Box>
  );
};
```

**Advantages:**
- Each section loads independently
- User sees partial content faster
- Better perceived performance

### Nested Suspense

```typescript
export const ParentComponent: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      {/* Parent suspends while loading */}
      <ParentContent>
        <Suspense fallback={<Loading />}>
          {/* Nested suspense for children */}
          <ChildComponent />
        </Suspense>
      </ParentContent>
    </Suspense>
  );
};
```

---

## LoadingOverlay Component

### When to Use

- Legacy components using `useQuery` (not yet refactored to Suspense)
- Need overlay loading states
- Cannot use Suspense boundaries

### Usage

```typescript
import { LoadingOverlay } from '@/components/LoadingOverlay';

export const MyComponent: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['data'],
    queryFn: () => api.getData(),
  });

  return (
    <LoadingOverlay loading={isLoading}>
      <Box sx={{ p: 2 }}>
        {data && <Content data={data} />}
      </Box>
    </LoadingOverlay>
  );
};
```

**Purpose:**
- Shows semi-transparent overlay with spinner
- Preserves content area (no layout shift)
- Prevents interaction during loading

---

## Error Handling

### Toast Component (Required)

```typescript
import { Toast } from '@/components/ui';

export const MyComponent: React.FC = () => {
  const handleAction = async () => {
    try {
      await api.doSomething();
      Toast.success('Operation completed successfully');
    } catch (error) {
      Toast.error('Operation failed');
    }
  };

  return <Button onClick={handleAction}>Execute Action</Button>;
};
```

**Available methods:**
- `Toast.success(message)` - Green success message
- `Toast.error(message)` - Red error message
- `Toast.warning(message)` - Orange warning message
- `Toast.info(message)` - Blue info message
- `Toast.loading(message)` - Loading message

### TanStack Query Error Callbacks

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';
import { Toast } from '@/components/ui';

export const MyComponent: React.FC = () => {
  const { data } = useSuspenseQuery({
    queryKey: ['data'],
    queryFn: () => api.getData(),

    // Handle errors (via meta)
    meta: {
      onError: (error) => {
        Toast.error('Failed to load data');
        console.error('Query error:', error);
      },
    },
  });

  return <Content data={data} />;
};
```

### Mutation Error Handling

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Toast } from '@/components/ui';

export const MyComponent: React.FC = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (updates) => api.update(id, updates),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', id] });
      Toast.success('Update successful');
    },

    onError: (error) => {
      Toast.error('Update failed: ' + error.message);
      console.error('Update error:', error);
    },
  });

  return (
    <Button
      onClick={() => updateMutation.mutate({ name: 'New Name' })}
      disabled={updateMutation.isPending}
    >
      {updateMutation.isPending ? 'Updating...' : 'Update'}
    </Button>
  );
};
```

### Error Boundaries

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" color="error">
        Something went wrong
      </Typography>
      <Typography>{error.message}</Typography>
      <Button onClick={resetErrorBoundary}>Retry</Button>
    </Box>
  );
}

export const MyPage: React.FC = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error('Boundary caught:', error)}
    >
      <Suspense fallback={<Loading />}>
        <ComponentThatMightError />
      </Suspense>
    </ErrorBoundary>
  );
};
```

---

## Complete Examples

### Example 1: Modern Component with Suspense

```typescript
import React, { Suspense } from 'react';
import { Box, Paper } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Loading } from '@/components/ui';
import { myFeatureService } from '../api/myFeature.service';

// Inner component uses useSuspenseQuery
const InnerComponent: React.FC<{ id: string }> = ({ id }) => {
  const { data } = useSuspenseQuery({
    queryKey: ['entity', id],
    queryFn: () => myFeatureService.getById(id),
  });

  // data is always defined - no need for isLoading!
  return (
    <Paper sx={{ p: 2 }}>
      <h2>{data.title}</h2>
      <p>{data.description}</p>
    </Paper>
  );
};

// Outer component provides Suspense boundary
export const OuterComponent: React.FC<{ id: string }> = ({ id }) => {
  return (
    <Box>
      <Suspense fallback={<Loading />}>
        <InnerComponent id={id} />
      </Suspense>
    </Box>
  );
};
```

### Example 2: Legacy Pattern with LoadingOverlay

```typescript
import React from 'react';
import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { myFeatureService } from '../api/myFeature.service';

export const LegacyComponent: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['entity', id],
    queryFn: () => myFeatureService.getById(id),
  });

  return (
    <LoadingOverlay loading={isLoading}>
      <Box sx={{ p: 2 }}>
        {error && <ErrorDisplay error={error} />}
        {data && <Content data={data} />}
      </Box>
    </LoadingOverlay>
  );
};
```

### Example 3: Error Handling with Toast

```typescript
import React from 'react';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@mui/material';
import { Toast } from '@/components/ui';
import { myFeatureService } from '../api/myFeature.service';

export const EntityEditor: React.FC<{ id: string }> = ({ id }) => {
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery({
    queryKey: ['entity', id],
    queryFn: () => myFeatureService.getById(id),
    meta: {
      onError: () => {
        Toast.error('Failed to load entity');
      },
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updates) => myFeatureService.update(id, updates),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', id] });
      Toast.success('Entity updated successfully');
    },

    onError: () => {
      Toast.error('Failed to update entity');
    },
  });

  return (
    <Button onClick={() => updateMutation.mutate({ name: 'New Name' })}>
      Update
    </Button>
  );
};
```

---

## Loading State Anti-patterns

### ❌ Don't Do These

```typescript
// ❌ NEVER - early return
if (isLoading) {
  return <CircularProgress />;
}

// ❌ NEVER - conditional rendering
{isLoading ? <Spinner /> : <Content />}

// ❌ NEVER - layout change
if (isLoading) {
  return (
    <Box sx={{ height: 100 }}>
      <Spinner />
    </Box>
  );
}
return (
  <Box sx={{ height: 500 }}>  // Different height!
    <Content />
  </Box>
);
```

### ✅ Do These

```typescript
// ✅ Best - useSuspenseQuery + Suspense + Loading
<Suspense fallback={<Loading />}>
  <ComponentWithSuspenseQuery />
</Suspense>

// ✅ Acceptable - LoadingOverlay
<LoadingOverlay loading={isLoading}>
  <Content />
</LoadingOverlay>

// ✅ OK - inline skeleton with same layout
<Box sx={{ height: 500 }}>
  {isLoading ? <Skeleton variant="rectangular" height="100%" /> : <Content />}
</Box>
```

---

## Skeleton Loading (Alternative)

### MUI Skeleton Components

```typescript
import { Skeleton, Box, Typography } from '@mui/material';

export const MyComponent: React.FC = () => {
  const { data, isLoading } = useQuery({ ... });

  return (
    <Box sx={{ p: 2 }}>
      {isLoading ? (
        <>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rectangular" width="100%" height={200} />
          <Skeleton variant="text" width="100%" />
        </>
      ) : (
        <>
          <Typography variant="h5">{data.title}</Typography>
          <img src={data.image} alt={data.title} />
          <Typography>{data.description}</Typography>
        </>
      )}
    </Box>
  );
};
```

**Critical**: Skeleton must have **same layout** as actual content (no shift)

---

## Loading State Best Practices

### Button Loading States

```typescript
import { Button } from '@mui/material';
import { useMutation } from '@tanstack/react-query';

export const ActionButton: React.FC = () => {
  const mutation = useMutation({
    mutationFn: () => api.doAction(),
  });

  return (
    <Button
      variant="contained"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Processing...' : 'Execute Action'}
    </Button>
  );
};
```

### Form Submission Loading

```typescript
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Toast } from '@/components/ui';

export const MyForm: React.FC = () => {
  const { handleSubmit, register } = useForm();

  const submitMutation = useMutation({
    mutationFn: (data) => api.submitForm(data),
    onSuccess: () => {
      Toast.success('Form submitted successfully');
    },
    onError: () => {
      Toast.error('Submission failed');
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => submitMutation.mutate(data))}>
      <input {...register('name')} />
      <Button type="submit" disabled={submitMutation.isPending}>
        {submitMutation.isPending ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
};
```

---

## Summary

**Loading States:**
- ✅ **Recommended**: Suspense + Loading + useSuspenseQuery (modern pattern)
- ✅ **Acceptable**: LoadingOverlay (legacy pattern)
- ✅ **OK**: Layout-matching skeleton
- ❌ **NEVER**: Early returns or conditional layouts

**Error Handling:**
- ✅ **Always**: Toast for user feedback
- ✅ onError callbacks in queries/mutations
- ✅ Error boundaries for component-level errors

**References:**
- [component-patterns.md](component-patterns.md) - Suspense integration
- [data-fetching.md](data-fetching.md) - useSuspenseQuery details
- [complete-examples.md](complete-examples.md) - Complete working examples