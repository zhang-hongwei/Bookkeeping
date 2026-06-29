# Common Patterns

This document collects frequently used UI patterns in the project, including standard implementations for common scenarios like forms, dialogs, data display, etc.

---

## 📝 Form Handling

### Basic Form (React Hook Form + Zod)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button } from '@mui/material';
import { Toast } from '@/components/ui';

// Zod validation schema
const formSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(18, 'Age must be greater than 18'),
});

type FormData = z.infer<typeof formSchema>;

export function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      age: 18,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.submitForm(data);
      Toast.success('Submission successful');
    } catch (error) {
      Toast.error('Submission failed: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('username')}
        label="Username"
        fullWidth
        error={!!errors.username}
        helperText={errors.username?.message}
      />

      <TextField
        {...register('email')}
        label="Email"
        fullWidth
        type="email"
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <TextField
        {...register('age', { valueAsNumber: true })}
        label="Age"
        fullWidth
        type="number"
        error={!!errors.age}
        helperText={errors.age?.message}
      />

      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
```

### Nested Object Forms

```typescript
const formSchema = z.object({
  user: z.object({
    name: z.string().min(1),
    email: z.string().email(),
  }),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string().regex(/^\d{6}$/, 'Zip code must be 6 digits'),
  }),
});

// Use nested paths
<TextField {...register('user.name')} label="Name" />
<TextField {...register('address.city')} label="City" />
```

---

## 🎯 Modal Dialog Patterns

### Standard Modal Structure

```typescript
import { Modal, Toast } from '@/components/ui';
import { Button, TextField } from '@mui/material';

export function EditUserModal({ userId, open, onClose }: Props) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getById(userId),
    enabled: open && !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserData) => userApi.update(userId, data),
    onSuccess: () => {
      Toast.success('Update successful');
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Edit User">
      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))}>
        <TextField {...register('name')} label="Name" fullWidth />
        <TextField {...register('email')} label="Email" fullWidth />

        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </Box>
      </form>
    </Modal>
  );
}
```

### Confirmation Dialog

```typescript
import { Modal, Toast } from '@/components/ui';

// Use Modal.confirm static method
const handleDelete = () => {
  Modal.confirm({
    content: 'Are you sure you want to delete this record? This action cannot be undone.',
    okText: 'Delete',
    okButtonProps: { color: 'error' },
    onOk: async () => {
      try {
        await api.deleteItem(id);
        Toast.success('Delete successful');
      } catch (error) {
        Toast.error('Delete failed');
      }
    },
  });
};
```

---

## 🎨 Select Dropdown

### Single Select

```typescript
import { Select } from '@/components/ui';

const [category, setCategory] = useState('');

<Select
  options={[
    { label: 'Technology', value: 'tech' },
    { label: 'Design', value: 'design' },
    { label: 'Product', value: 'product' },
  ]}
  value={category}
  onChange={setCategory}
  placeholder="Please select category"
  searchable  // Support search
/>
```

### Multi Select

```typescript
const [selectedIds, setSelectedIds] = useState<string[]>([]);

<Select
  options={users.map(u => ({ label: u.name, value: u.id }))}
  value={selectedIds}
  onChange={setSelectedIds}
  multiple
  searchable
  placeholder="Select users"
/>
```

### Use in Forms

```typescript
import { Controller } from 'react-hook-form';

<Controller
  name="category"
  control={control}
  render={({ field }) => (
    <Select
      {...field}
      options={categories}
      placeholder="Select category"
      error={!!errors.category}
    />
  )}
/>
```

---

## 📊 Table Data Display

### Basic Table

```typescript
import { Table } from '@/components/ui';

const columns = [
  { key: 'name', dataIndex: 'name', title: 'Name', width: 150 },
  { key: 'email', dataIndex: 'email', title: 'Email', width: 200 },
  {
    key: 'status',
    dataIndex: 'status',
    title: 'Status',
    width: 100,
    render: (status: string) => (
      <Chip label={status} color={status === 'active' ? 'success' : 'default'} />
    ),
  },
  {
    key: 'actions',
    title: 'Actions',
    width: 120,
    render: (_, record) => (
      <Box>
        <IconButton onClick={() => handleEdit(record.id)}>
          <Edit />
        </IconButton>
        <IconButton onClick={() => handleDelete(record.id)}>
          <Delete />
        </IconButton>
      </Box>
    ),
  },
];

<Table
  columns={columns}
  dataSource={users}
  loading={isLoading}
/>
```

### Table with Pagination and Selection

```typescript
<Table
  columns={columns}
  dataSource={users}
  rowSelection={{
    type: 'checkbox',
    selectedRowKeys: selected,
    onChange: (keys) => setSelected(keys),
  }}
  pagination={{
    total: totalCount,
    currentPage: page,
    pageSize: pageSize,
    onChange: (newPage, newPageSize) => {
      setPage(newPage);
      setPageSize(newPageSize);
    },
  }}
/>
```

---

## 💾 Data Fetching Patterns

### TanStack Query (Primary Method)

For **all server data**:
- Data fetching
- Cache management
- Automatic retry
- Optimistic updates

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query data
const { data: users, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => userApi.getAll(),
});

// Mutate data
const queryClient = useQueryClient();

const createMutation = useMutation({
  mutationFn: (data: CreateUserData) => userApi.create(data),
  onSuccess: () => {
    // Refresh list
    queryClient.invalidateQueries({ queryKey: ['users'] });
    Toast.success('Create successful');
  },
});

const handleCreate = () => {
  createMutation.mutate({ name: 'New User', email: 'user@example.com' });
};
```

### Optimistic Updates

```typescript
const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: UserData }) =>
    userApi.update(id, data),

  // Optimistic update
  onMutate: async ({ id, data }) => {
    // Cancel related queries
    await queryClient.cancelQueries({ queryKey: ['users'] });

    // Save previous data
    const previousUsers = queryClient.getQueryData(['users']);

    // Optimistically update cache
    queryClient.setQueryData(['users'], (old: User[]) =>
      old.map((user) => (user.id === id ? { ...user, ...data } : user))
    );

    return { previousUsers };
  },

  // Rollback on error
  onError: (err, variables, context) => {
    if (context?.previousUsers) {
      queryClient.setQueryData(['users'], context.previousUsers);
    }
    Toast.error('Update failed');
  },

  // Ensure data consistency after mutation completes
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

---

## 🎭 State Management Strategies

### TanStack Query - Server State (Primary)

For **all server data**:

```typescript
// ✅ Correct - Use TanStack Query
const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: () => userApi.getAll(),
});
```

### useState - UI State

For **local UI state**:
- Modal on/off
- Form inputs (uncontrolled)
- Selected tabs
- Temporary UI flags

```typescript
// ✅ Correct - useState for UI state
const [modalOpen, setModalOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState(0);
```

### Zustand - Global Client State (Minimize)

Only for **global client state**:
- Theme preferences
- Sidebar collapse state
- User preferences (non-server data)

```typescript
import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

**Avoid prop drilling** - Use Context or Zustand.

---

## ⚡ Toast Messages

### Basic Usage

```typescript
import { Toast } from '@/components/ui';

// Various types
Toast.success('Operation successful');
Toast.error('Operation failed: ' + error.message);
Toast.warning('Please check input');
Toast.info('Information message');
```

### Loading State

```typescript
const toastId = Toast.loading('Uploading...');

try {
  await uploadFile(file);
  Toast.update(toastId, {
    render: 'Upload successful',
    type: 'success',
  });
} catch (error) {
  Toast.update(toastId, {
    render: 'Upload failed',
    type: 'error',
  });
}
```

---

## 🔐 Authentication Patterns

### Get Current User

```typescript
import { useSession } from 'next-auth/react';

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'unauthenticated') {
    return <div>Please login</div>;
  }

  // User is logged in
  const user = session.user;

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### Protect Routes

```typescript
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <Loading />;
  }

  return <div>Protected content</div>;
}
```

---

## 📋 Summary

**Must-Follow Patterns:**
- ✅ React Hook Form + Zod for forms
- ✅ Use custom components (Modal, Select, Toast, Table)
- ✅ TanStack Query for server state management
- ✅ useState for UI state
- ✅ Zustand for global client state (minimize)
- ✅ Optimistic updates for better user experience
- ✅ NextAuth for authentication

**References:**
- [complete-examples.md](complete-examples.md) - Complete component examples
- [data-fetching.md](data-fetching.md) - Data fetching details
- [form-patterns.md](form-patterns.md) - Form handling patterns