---
name: frontend-dev
version: 1.0.0
description: React/MUI v7/Tailwind frontend development standards
priority: high
dependencies: []
triggers:
  keywords: [component, react, mui, tailwind, frontend, ui, page, component, interface, grid, modal, select, toast]
  files: ["*.tsx", "*.jsx", "components/**", "app/**/page.tsx"]
  intents: ["create component", "add ui", "update interface"]
---

# Frontend Development Skill

> React 19 + Next.js 16 + MUI v7 + Tailwind CSS frontend development best practices

> ⚠️ **Important Notice**: This standard is the project standard, replacing rules under `.claude/rules/ui-frontend/`. In case of conflicts, this file takes precedence.

## 🎯 Core Principles

### Component Priority (Must Follow)

1. **Custom Components** `src/components/ui/*` - Highest priority
2. **MUI Components** `@mui/material` - Standard components
3. **MUI X Components** `@mui/x-*` - Advanced features

### Required Custom Components

| Scenario | ❌ Don't Use | ✅ Use | Import Path |
|----------|-------------|--------|-------------|
| Dialog | Dialog | Modal | `@/components/ui/Modal` |
| Dropdown Select | Select/Autocomplete | Select | `@/components/ui/Select` |
| Notification | Snackbar | Toast | `@/components/ui/Toast` |
| Popup | Popover | Popover | `@/components/ui/Popover` |
| Loading State | CircularProgress | Loading | `@/components/ui/Loading` |
| Table | Table | Table | `@/components/ui/Table` |

## 📦 Component Usage Examples

### Modal (Dialog)

```tsx
import { Modal } from '@/components/ui';

// Basic usage
<Modal open={open} onClose={onClose} title="Edit User">
  <form>
    {/* Form content */}
  </form>
</Modal>

// Confirmation dialog
Modal.confirm({
  content: "Are you sure you want to delete?",
  okText: "Delete",
  okButtonProps: { color: 'error' },
  onOk: async () => {
    await deleteItem(id);
    Toast.success('Deleted successfully');
  }
});
```

### Select (Dropdown)

```tsx
import { Select } from '@/components/ui';

// Single select
<Select
  options={[
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' }
  ]}
  value={value}
  onChange={setValue}
  placeholder="Please select"
  searchable  // Supports search
/>

// Multi select
<Select
  options={options}
  value={selectedIds}
  onChange={setSelectedIds}
  multiple
  searchable
/>
```

### Toast (Notifications)

```tsx
import { Toast } from '@/components/ui';

// Various types
Toast.success('Saved successfully');
Toast.error('Operation failed: ' + error.message);
Toast.warning('Please check input');
Toast.info('Information message');
Toast.loading('Processing...');

// Advanced usage
const toastId = Toast.loading('Uploading...');
// Update
Toast.update(toastId, {
  render: 'Upload successful',
  type: 'success'
});
```

## 🎨 MUI v7 Grid Layout (Important Changes)

### ⚠️ Grid v7 New API

```tsx
// ❌ Wrong: v6 old syntax (will cause errors)
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    Content
  </Grid>
</Grid>

// ✅ Correct: v7 new syntax
<Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    Content
  </Grid>
</Grid>

// Single size (all breakpoints)
<Grid container spacing={2}>
  <Grid size={6}>Half width</Grid>
  <Grid size={6}>Half width</Grid>
</Grid>

// Auto size
<Grid container spacing={2}>
  <Grid size="grow">Auto fill</Grid>
  <Grid size="auto">Content width</Grid>
</Grid>
```

### Key Changes
- ❌ Removed `item` prop
- ❌ Removed direct `xs`, `sm`, `md`, `lg`, `xl` props
- ✅ Use `size` object: `size={{ xs: 12, sm: 6 }}`
- ✅ Or single value: `size={6}`

## 🎨 Styling Priority

1. **sx prop** - One-time styles
2. **styled()** - Reusable components
3. **Tailwind** - Utility classes

```tsx
// 1. sx prop (most common)
<Box sx={{
  p: 2,
  bgcolor: 'background.paper',
  borderRadius: 1,
  '&:hover': { bgcolor: 'action.hover' }
}}>
  Content
</Box>

// 2. styled() (reusable components)
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}));

// 3. Tailwind (layout utilities)
<div className="flex items-center gap-4">
  {items.map(item => (
    <div key={item.id} className="flex-1">
      {item.name}
    </div>
  ))}
</div>
```

## 📝 Form Handling

### TextField (Text Input)

```tsx
import { TextField } from '@mui/material';

// Basic input
<TextField
  label="Name"
  fullWidth
  required
/>

// Multi-line text
<TextField
  label="Description"
  multiline
  rows={4}
  fullWidth
/>

// With validation
<TextField
  label="Email"
  type="email"
  error={!!errors.email}
  helperText={errors.email?.message}
  {...register('email')}
/>
```

### React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Please enter name'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(18, 'Age must be over 18')
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.save(data);
      Toast.success('Saved successfully');
    } catch (error) {
      Toast.error('Save failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="Name"
        error={!!errors.name}
        helperText={errors.name?.message}
        {...register('name')}
      />
      {/* Other fields */}
      <Button type="submit" variant="contained">
        Submit
      </Button>
    </form>
  );
}
```

## 📁 File Organization

```
src/
├── components/
│   ├── ui/           # Common UI components
│   ├── layouts/      # Layout components
│   └── features/     # Feature components
├── features/         # Business modules
│   └── user/
│       ├── components/   # Module components
│       ├── hooks/       # Module hooks
│       └── types/       # Module types
└── app/             # Page routes
```

## 🔄 Import Order

```tsx
// 1. React/Next
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// 3. MUI components
import { Box, Grid, Typography, TextField, Button } from '@mui/material';

// 4. Custom components
import { Modal, Select, Toast } from '@/components/ui';

// 5. Hooks and utilities
import { useUserData } from '@/hooks/useUserData';

// 6. Types
import type { User } from '@/types/user';
```

## ⚡ Performance Optimization

### 1. Component Memoization
```tsx
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* Complex rendering */}</div>;
});
```

### 2. State Optimization
```tsx
// Avoid creating new objects in render
const styles = useMemo(() => ({
  p: 2,
  bgcolor: 'background.paper'
}), []);

// Avoid unnecessary re-renders
const handleClick = useCallback(() => {
  // Handler logic
}, [dependency]);
```

### 3. Lazy Loading
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  {
    loading: () => <Loading />,
    ssr: false
  }
);
```

## 📚 More Resources

Need more detailed guides? Check `resources/` directory:
- `patterns.md` - Common design patterns
- `examples.md` - Complete code examples
- `troubleshoot.md` - Problem solving
- `mui-v7-migration.md` - MUI v7 migration guide
- `i18n.md` - react-i18next internationalization guide