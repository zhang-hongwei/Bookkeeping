# Component Design Patterns

Modern React component architecture emphasizing type safety, lazy loading, and Suspense boundaries.

---

## React.FC Pattern (Recommended)

### Why Use React.FC

Reasons for using `React.FC<Props>` pattern for all components:
- Explicit type safety for Props
- Consistent component signatures
- Clear props interface documentation
- Better IDE autocomplete

### Basic Pattern

```typescript
import React from 'react';

interface MyComponentProps {
  /** User ID to display */
  userId: string;
  /** Optional callback: triggered when action occurs */
  onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ userId, onAction }) => {
  return (
    <div>
      User: {userId}
    </div>
  );
};

export default MyComponent;
```

**Key Points:**
- Props interface defined separately with JSDoc comments
- `React.FC<Props>` provides type safety
- Destructure props in parameters
- Default export at file bottom

---

## Lazy Loading Patterns

### When to Use Lazy Loading

The following components should be lazy loaded:
- Heavy components (DataGrid, charts, rich text editors)
- Route-level components
- Modal/dialog content (not initially displayed)
- Content below the fold

### How to Lazy Load

```typescript
import React from 'react';

// Lazy load heavy components
const UserDataGrid = React.lazy(() =>
  import('./grids/UserDataGrid')
);

// For named exports
const MyComponent = React.lazy(() =>
  import('./MyComponent').then(module => ({
    default: module.MyComponent
  }))
);
```

**Practical Example:**

```typescript
/**
 * Main user table container component
 */
import React, { useState, useCallback } from 'react';
import { Box, Paper } from '@mui/material';

// Lazy load UserDataGrid to optimize bundle size
const UserDataGrid = React.lazy(() => import('./grids/UserDataGrid'));

import { Loading } from '@/components/ui';
import { Suspense } from 'react';

export const UserTable: React.FC<UserTableProps> = ({ userId }) => {
  return (
    <Box>
      <Suspense fallback={<Loading />}>
        <UserDataGrid userId={userId} />
      </Suspense>
    </Box>
  );
};

export default UserTable;
```

---

## Suspense Boundaries

### Loading Component

**Import:**
```typescript
import { Loading } from '@/components/ui';
// or
import { Suspense } from 'react';
```

**Usage:**
```typescript
<Suspense fallback={<Loading />}>
  <LazyLoadedComponent />
</Suspense>
```

**Purpose:**
- Shows loading indicator when lazy loading components
- Smooth fade-in animation
- Consistent loading experience
- Prevents layout shift

### Suspense Boundary Placement

**Route level:**
```typescript
// app/my-route/page.tsx
import { Suspense, lazy } from 'react';
import { Loading } from '@/components/ui';

const MyPage = lazy(() => import('@/features/my-feature/components/MyPage'));

export default function RoutePage() {
  return (
    <Suspense fallback={<Loading />}>
      <MyPage />
    </Suspense>
  );
}
```

**Component level:**
```typescript
function ParentComponent() {
  return (
    <Box>
      <Header />
      <Suspense fallback={<Loading />}>
        <HeavyDataGrid />
      </Suspense>
    </Box>
  );
}
```

**Multiple boundaries:**
```typescript
function Page() {
  return (
    <Box>
      <Suspense fallback={<Loading />}>
        <HeaderSection />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <MainContent />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <Sidebar />
      </Suspense>
    </Box>
  );
}
```

Each section loads independently, providing better user experience.

---

## Component Structure Template

### Recommended Order

```typescript
/**
 * Component description
 * What it does, when to use
 */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Paper, Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';

// Feature imports
import { myFeatureApi } from '../api/myFeature.service';
import type { MyData } from '@/types/myData';

// Component imports
import { Toast, Loading } from '@/components/ui';

// Hooks
import { useSession } from 'next-auth/react';

// 1. PROPS interface (with JSDoc)
interface MyComponentProps {
  /** Entity ID to display */
  entityId: string;
  /** Optional callback: triggered when operation completes */
  onComplete?: () => void;
  /** Display mode */
  mode?: 'view' | 'edit';
}

// 2. Styles (if inline and <100 lines)
const componentStyles: Record<string, SxProps<Theme>> = {
  container: {
    p: 2,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    mb: 2,
    display: 'flex',
    justifyContent: 'space-between',
  },
};

// 3. Component definition
export const MyComponent: React.FC<MyComponentProps> = ({
  entityId,
  onComplete,
  mode = 'view',
}) => {
  // 4. HOOKS (in this order)
  // - Context hooks first
  const { data: session } = useSession();

  // - Data fetching
  const { data } = useSuspenseQuery({
    queryKey: ['myEntity', entityId],
    queryFn: () => myFeatureApi.getEntity(entityId),
  });

  // - Local state
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(mode === 'edit');

  // - Memoized values
  const filteredData = useMemo(() => {
    return data.filter(item => item.active);
  }, [data]);

  // - Side effects
  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, []);

  // 5. Event handlers (use useCallback)
  const handleItemSelect = useCallback((itemId: string) => {
    setSelectedItem(itemId);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await myFeatureApi.updateEntity(entityId, { /* data */ });
      Toast.success('Entity updated successfully');
      onComplete?.();
    } catch (error) {
      Toast.error('Failed to update entity');
    }
  }, [entityId, onComplete]);

  // 6. Render
  return (
    <Box sx={componentStyles.container}>
      <Box sx={componentStyles.header}>
        <h2>My Component</h2>
        <Button onClick={handleSave}>Save</Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        {filteredData.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </Paper>
    </Box>
  );
};

// 7. Export (default export at bottom)
export default MyComponent;
```

---

## Component Splitting

### When to Split Components

**Split into multiple components when:**
- Component exceeds 300 lines
- Has multiple different responsibilities
- Has reusable parts
- Complex nested JSX

**Example:**

```typescript
// ❌ Avoid - Massive component
function MassiveComponent() {
  // 500+ lines
  // Search logic
  // Filter logic
  // Table logic
  // Action panel logic
}

// ✅ Recommended - Modular
function ParentContainer() {
  return (
    <Box>
      <SearchAndFilter onFilter={handleFilter} />
      <DataGrid data={filteredData} />
      <ActionPanel onAction={handleAction} />
    </Box>
  );
}
```

### When to Keep Together

**Keep in the same file when:**
- Component < 200 lines
- Logic is tightly coupled
- Won't be reused elsewhere
- Simple presentational component

---

## Export Patterns

### Named Constant + Default Export (Recommended)

```typescript
export const MyComponent: React.FC<Props> = ({ ... }) => {
  // Component logic
};

export default MyComponent;
```

**Why:**
- Named export convenient for testing/refactoring
- Default export convenient for lazy loading
- Both options available

### Lazy Loading Named Exports

```typescript
const MyComponent = React.lazy(() =>
  import('./MyComponent').then(module => ({
    default: module.MyComponent
  }))
);
```

---

## Component Communication

### Props Down, Events Up

```typescript
// Parent component
function Parent() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <Child
      data={data}                    // Props down
      onSelect={setSelectedId}       // Events up
    />
  );
}

// Child component
interface ChildProps {
  data: Data[];
  onSelect: (id: string) => void;
}

export const Child: React.FC<ChildProps> = ({ data, onSelect }) => {
  return (
    <div onClick={() => onSelect(data[0].id)}>
      {/* Content */}
    </div>
  );
};
```

### Avoid Prop Drilling

**Use Context for deeply nested:**
```typescript
// ❌ Avoid - Props drilling 5+ layers
<A prop={x}>
  <B prop={x}>
    <C prop={x}>
      <D prop={x}>
        <E prop={x} />  // Finally used here
      </D>
    </C>
  </B>
</A>

// ✅ Recommended - Context or TanStack Query
const MyContext = createContext<MyData | null>(null);

function Provider({ children }) {
  const { data } = useSuspenseQuery({ ... });
  return <MyContext.Provider value={data}>{children}</MyContext.Provider>;
}

function DeepChild() {
  const data = useContext(MyContext);
  // Use data directly
}
```

**Or use TanStack Query:**
```typescript
// Parent component
function Parent() {
  const { data } = useSuspenseQuery({
    queryKey: ['sharedData'],
    queryFn: () => api.getData(),
  });
  return <DeepChild />;
}

// Deep child component - direct access to same query
function DeepChild() {
  const { data } = useSuspenseQuery({
    queryKey: ['sharedData'],  // Same key
    queryFn: () => api.getData(),
  });
  // Retrieved from cache, no new request
}
```

---

## Advanced Patterns

### Compound Components

```typescript
// Card.tsx
export const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
} = ({ children }) => {
  return <Paper>{children}</Paper>;
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### Render Props (Rare, but useful)

```typescript
interface DataProviderProps {
  children: (data: Data) => React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { data } = useSuspenseQuery({ ... });
  return <>{children(data)}</>;
};

// Usage
<DataProvider>
  {(data) => <Display data={data} />}
</DataProvider>
```

### Custom Hooks Extract Logic

```typescript
// hooks/useUserData.ts
export function useUserData(userId: string) {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId),
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(async (updates: Partial<User>) => {
    await userService.update(userId, updates);
    Toast.success('Save successful');
    setIsEditing(false);
  }, [userId]);

  return {
    user,
    isEditing,
    handleEdit,
    handleSave,
  };
}

// Used in component
export const UserProfile: React.FC<Props> = ({ userId }) => {
  const { user, isEditing, handleEdit, handleSave } = useUserData(userId);

  return (
    <Box>
      {/* Concise UI code */}
    </Box>
  );
};
```

---

## Performance Optimization Patterns

### React.memo

```typescript
// Only re-renders when props change
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  // Expensive rendering logic
  return <div>{/* Complex UI */}</div>;
});

// Custom comparison function
export const SmartComponent = React.memo<Props>(
  ({ data }) => {
    return <div>{data.name}</div>;
  },
  (prevProps, nextProps) => {
    // Return true when props are equal (no re-render)
    return prevProps.data.id === nextProps.data.id;
  }
);
```

### useMemo and useCallback

```typescript
export const MyComponent: React.FC<Props> = ({ items }) => {
  // Memoize expensive calculations
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // Memoize callback functions
  const handleClick = useCallback((id: string) => {
    console.log('Clicked', id);
  }, []);

  return (
    <div>
      {sortedItems.map(item => (
        <ChildComponent
          key={item.id}
          item={item}
          onClick={handleClick}  // Stable reference
        />
      ))}
    </div>
  );
};
```

---

## Error Boundaries

```typescript
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorFallback />}>
  <MyComponent />
</ErrorBoundary>
```

---

## Summary

**Modern Component Recipe:**
1. `React.FC<Props>` with TypeScript
2. Lazy load heavy components: `React.lazy(() => import())`
3. Wrap with `<Suspense fallback={<Loading />}>`
4. Use `useSuspenseQuery` for data fetching
5. Use import aliases (@/, ~/)
6. Use `useCallback` for event handlers
7. Default export at file bottom
8. No need to return early for loading states

**References:**
- [data-fetching.md](data-fetching.md) - useSuspenseQuery details
- [loading-and-error-states.md](loading-and-error-states.md) - Suspense best practices
- [complete-examples.md](complete-examples.md) - Complete working examples
- [performance.md](performance.md) - Performance optimization details