# Performance Optimization

Patterns for optimizing React component performance, preventing unnecessary re-renders, and avoiding memory leaks.

---

## Memoization Patterns

### useMemo for Expensive Computations

```typescript
import { useMemo } from 'react';

export const DataDisplay: React.FC<{ items: Item[], searchTerm: string }> = ({
  items,
  searchTerm,
}) => {
  // ❌ Avoid - runs on every render
  const filteredItems = items
    .filter(item => item.name.includes(searchTerm))
    .sort((a, b) => a.name.localeCompare(b.name));

  // ✅ Correct - memoized, only recalculates when dependencies change
  const filteredItems = useMemo(() => {
    return items
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, searchTerm]);

  return <List items={filteredItems} />;
};
```

**When to use useMemo:**
- Filtering/sorting large arrays
- Complex calculations
- Data structure transformations
- Expensive computations (loops, recursion)

**When not to use useMemo:**
- Simple string concatenation
- Basic arithmetic operations
- Premature optimization (measure first!)

---

## useCallback for Event Handlers

### The Problem

```typescript
// ❌ Avoid - creating new function every render
export const Parent: React.FC = () => {
  const handleClick = (id: string) => {
    console.log('Clicked:', id);
  };

  // Parent re-render causes child re-render
  // because handleClick is always a new function reference
  return <Child onClick={handleClick} />;
};
```

### The Solution

```typescript
import { useCallback } from 'react';

export const Parent: React.FC = () => {
  // ✅ Correct - stable function reference
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []); // Empty dependency = function never changes

  // Child only re-renders when props actually change
  return <Child onClick={handleClick} />;
};
```

**When to use useCallback:**
- Functions passed as props to child components
- Functions used in useEffect dependencies
- Functions passed to memoized components
- Event handlers in lists

**When not to use useCallback:**
- Event handlers not passed to child components
- Simple inline handlers: `onClick={() => doSomething()}`

---

## React.memo for Component Memoization

### Basic Usage

```typescript
import React from 'react';

interface ExpensiveComponentProps {
  data: ComplexData;
  onAction: () => void;
}

// ✅ Wrap expensive component in React.memo
export const ExpensiveComponent = React.memo<ExpensiveComponentProps>(
  function ExpensiveComponent({ data, onAction }) {
    // Complex rendering logic
    return <ComplexVisualization data={data} />;
  }
);
```

**When to use React.memo:**
- Component renders frequently
- Component has expensive rendering
- Props don't change often
- Component is a list item
- DataGrid cells/renderers

**When not to use React.memo:**
- Props change frequently
- Rendering is already fast
- Premature optimization

---

## Debounced Search

### Using use-debounce Hook

```typescript
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useSuspenseQuery } from '@tanstack/react-query';

export const SearchComponent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce 300ms
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  // Query uses debounced value
  const { data } = useSuspenseQuery({
    queryKey: ['search', debouncedSearchTerm],
    queryFn: () => api.search(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 0,
  });

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
};
```

**Best Debounce Times:**
- **300-500ms**: Search/filtering
- **1000ms**: Auto-save
- **100-200ms**: Real-time validation

---

## Memory Leak Prevention

### Clean Up Timers/Intervals

```typescript
import { useEffect, useState } from 'react';

export const MyComponent: React.FC = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // ✅ Correct - clean up interval
    const intervalId = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);  // Clean up!
    };
  }, []);

  useEffect(() => {
    // ✅ Correct - clean up timeout
    const timeoutId = setTimeout(() => {
      console.log('Delayed operation');
    }, 5000);

    return () => {
      clearTimeout(timeoutId);  // Clean up!
    };
  }, []);

  return <div>{count}</div>;
};
```

### Clean Up Event Listeners

```typescript
useEffect(() => {
  const handleResize = () => {
    console.log('Resized');
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);  // Clean up!
  };
}, []);
```

### Fetch Abort Controller

```typescript
useEffect(() => {
  const abortController = new AbortController();

  fetch('/api/data', { signal: abortController.signal })
    .then(response => response.json())
    .then(data => setState(data))
    .catch(error => {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      }
    });

  return () => {
    abortController.abort();  // Clean up!
  };
}, []);
```

**Note**: When using TanStack Query, this is handled automatically.

---

## Form Performance

### Watch Specific Fields (Not All)

```typescript
import { useForm } from 'react-hook-form';

export const MyForm: React.FC = () => {
  const { register, watch, handleSubmit } = useForm();

  // ❌ Avoid - watching all fields, re-renders on any change
  const formValues = watch();

  // ✅ Correct - only watch what you need
  const username = watch('username');
  const email = watch('email');

  // Or multiple specific fields
  const [username, email] = watch(['username', 'email']);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} />
      <input {...register('email')} />
      <input {...register('password')} />

      {/* Only re-renders when username/email change */}
      <p>Username: {username}, Email: {email}</p>
    </form>
  );
};
```

---

## List Rendering Optimization

### Key Prop Usage

```typescript
// ✅ Correct - stable unique keys
{items.map(item => (
  <ListItem key={item.id}>
    {item.name}
  </ListItem>
))}

// ❌ Avoid - index as key (unstable if list reorders)
{items.map((item, index) => (
  <ListItem key={index}>  // Wrong if list reorders
    {item.name}
  </ListItem>
))}
```

### Memoized List Items

```typescript
const ListItem = React.memo<ListItemProps>(({ item, onAction }) => {
  return (
    <Box onClick={() => onAction(item.id)}>
      {item.name}
    </Box>
  );
});

export const List: React.FC<{ items: Item[] }> = ({ items }) => {
  const handleAction = useCallback((id: string) => {
    console.log('Action:', id);
  }, []);

  return (
    <Box>
      {items.map(item => (
        <ListItem
          key={item.id}
          item={item}
          onAction={handleAction}
        />
      ))}
    </Box>
  );
};
```

---

## Preventing Component Re-initialization

### The Problem

```typescript
// ❌ Avoid - recreating component every render
export const Parent: React.FC = () => {
  // New component definition every render!
  const ChildComponent = () => <div>Child Component</div>;

  return <ChildComponent />;  // Unmounts and remounts every render
};
```

### The Solution

```typescript
// ✅ Correct - define outside or use useMemo
const ChildComponent: React.FC = () => <div>Child Component</div>;

export const Parent: React.FC = () => {
  return <ChildComponent />;  // Stable component
};

// ✅ Or if dynamic, use useMemo
export const Parent: React.FC<{ config: Config }> = ({ config }) => {
  const DynamicComponent = useMemo(() => {
    return () => <div>{config.title}</div>;
  }, [config.title]);

  return <DynamicComponent />;
};
```

---

## Lazy Loading Heavy Dependencies

### Code Splitting

```typescript
// ❌ Avoid - importing heavy libraries at top level
import jsPDF from 'jspdf';  // Large library loads immediately
import * as XLSX from 'xlsx';  // Large library loads immediately

// ✅ Correct - dynamic import when needed
const handleExportPDF = async () => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  // Use it
};

const handleExportExcel = async () => {
  const XLSX = await import('xlsx');
  // Use it
};
```

### Lazy Loading Components

```typescript
import { lazy, Suspense } from 'react';
import { Loading } from '@/components/ui';

// ✅ Lazy load heavy components
const HeavyChart = lazy(() => import('./charts/HeavyChart'));
const DataGrid = lazy(() => import('./DataGrid'));

export const Dashboard: React.FC = () => {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <HeavyChart data={chartData} />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <DataGrid data={tableData} />
      </Suspense>
    </div>
  );
};
```

---

## Virtualizing Long Lists

### Using react-window

```typescript
import { FixedSizeList } from 'react-window';

export const VirtualizedList: React.FC<{ items: Item[] }> = ({ items }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

**When to use virtualization:**
- Lists with 100+ items
- List items with complex rendering
- Infinite scroll lists
- Tables with many rows

---

## Image Optimization

### Next.js Image Component

```typescript
import Image from 'next/image';

export const UserAvatar: React.FC<{ src: string, alt: string }> = ({ src, alt }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={64}
      height={64}
      loading="lazy"
      placeholder="blur"
      blurDataURL="/placeholder.png"
    />
  );
};
```

**Benefits:**
- Automatic image size optimization
- Lazy loading
- Prevents cumulative layout shift
- Modern formats (WebP, AVIF)

---

## Performance Monitoring

### React DevTools Profiler

```typescript
import { Profiler } from 'react';

function onRenderCallback(
  id, // "id" of the Profiler tree that committed
  phase, // "mount" or "update"
  actualDuration, // Time spent rendering the committed update
  baseDuration, // Estimated time to render entire subtree without memoization
  startTime, // When React began rendering this update
  commitTime, // When React committed this update
  interactions // Set of interactions belonging to this update
) {
  console.log(`${id} took ${actualDuration}ms to render`);
}

export const App = () => {
  return (
    <Profiler id="Navigation" onRender={onRenderCallback}>
      <Navigation />
    </Profiler>
  );
};
```

---

## Summary

**Performance Checklist:**
- ✅ Use `useMemo` for expensive computations (filter, sort, map)
- ✅ Use `useCallback` for functions passed to child components
- ✅ Use `React.memo` for expensive components
- ✅ Debounce search/filter (300-500ms)
- ✅ Clean up timers/intervals in useEffect
- ✅ Watch specific form fields (not all)
- ✅ Use stable keys in lists
- ✅ Lazy load heavy libraries
- ✅ Use React.lazy for code splitting
- ✅ Virtualize long lists
- ✅ Optimize images (Next.js Image)

**References:**
- [component-patterns.md](component-patterns.md) - Lazy loading
- [data-fetching.md](data-fetching.md) - TanStack Query optimization
- [complete-examples.md](complete-examples.md) - Performance patterns in context