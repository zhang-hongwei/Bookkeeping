# Complete Code Examples

Complete working examples that combine modern patterns: React components, lazy loading, Suspense, TanStack Query, styling, routing, and error handling.

---

## Example 1: Complete Modern Component

Combining: React.FC, useSuspenseQuery, cache-first, useCallback, styling, error handling

```typescript
/**
 * User profile display component
 * Demonstrates modern patterns: Suspense + TanStack Query
 */
import React, { useState, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, Button, Avatar } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/services/user.service';
import { Toast } from '@/components/ui';
import type { User } from '@/types/user';

// Style objects
const componentStyles: Record<string, SxProps<Theme>> = {
  container: {
    p: 3,
    maxWidth: 600,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 3,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  actions: {
    display: 'flex',
    gap: 1,
    mt: 2,
  },
};

interface UserProfileProps {
  userId: string;
  onUpdate?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onUpdate }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Suspense query - no need for isLoading!
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getById(userId),
    staleTime: 5 * 60 * 1000,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (updates: Partial<User>) =>
      userApi.update(userId, updates),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      Toast.success('Profile updated successfully');
      setIsEditing(false);
      onUpdate?.();
    },

    onError: (error) => {
      Toast.error('Update failed: ' + error.message);
    },
  });

  // Memoized computed value
  const fullName = useMemo(() => {
    return `${user.firstName} ${user.lastName}`;
  }, [user.firstName, user.lastName]);

  // Event handlers with useCallback
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(() => {
    updateMutation.mutate({
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }, [user, updateMutation]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  return (
    <Paper sx={componentStyles.container}>
      <Box sx={componentStyles.header}>
        <Avatar sx={{ width: 64, height: 64 }}>
          {user.firstName[0]}{user.lastName[0]}
        </Avatar>
        <Box>
          <Typography variant="h5">{fullName}</Typography>
          <Typography color="text.secondary">{user.email}</Typography>
        </Box>
      </Box>

      <Box sx={componentStyles.content}>
        <Typography>Username: {user.username}</Typography>
        <Typography>Roles: {user.roles.join(', ')}</Typography>
      </Box>

      <Box sx={componentStyles.actions}>
        {!isEditing ? (
          <Button variant="contained" onClick={handleEdit}>
            Edit Profile
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default UserProfile;
```

**Usage:**
```typescript
import { Suspense } from 'react';
import { Loading } from '@/components/ui';

<Suspense fallback={<Loading />}>
  <UserProfile userId="123" onUpdate={() => console.log('Updated')} />
</Suspense>
```

---

## Example 2: Complete Feature Module Structure

Based on real project `features/users/` structure:

```
features/
  users/
    api/
      user.service.ts           # API service layer
    components/
      UserProfile.tsx           # Main component (Example 1)
      UserList.tsx              # List component
      UserForm.tsx              # Form component
      modals/
        DeleteUserModal.tsx     # Modal component
    hooks/
      useSuspenseUser.ts        # Suspense query hook
      useUserMutations.ts       # Mutation hooks
      useUserPermissions.ts     # Feature-specific hook
    helpers/
      userHelpers.ts            # Utility functions
      validation.ts             # Validation logic
    types/
      index.ts                  # TypeScript interfaces
    index.ts                    # Public API exports
```

### API Service Layer (user.service.ts)

```typescript
import { apiClient } from '@/lib/apiClient';
import type { User, CreateUserPayload, UpdateUserPayload } from '../types';

export const userService = {
  getById: async (userId: string): Promise<User> => {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data;
  },

  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get('/users');
    return data;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await apiClient.post('/users', payload);
    return data;
  },

  update: async (userId: string, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await apiClient.put(`/users/${userId}`, payload);
    return data;
  },

  delete: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },
};
```

### Suspense Hook (useSuspenseUser.ts)

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';
import { userService } from '../api/user.service';
import type { User } from '../types';

export function useSuspenseUser(userId: string) {
  return useSuspenseQuery<User, Error>({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useSuspenseUsers() {
  return useSuspenseQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
    staleTime: 1 * 60 * 1000,  // List cache time is shorter
  });
}
```

### Type Definitions (types/index.ts)

```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export type UpdateUserPayload = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
```

### Public Exports (index.ts)

```typescript
// Export components
export { UserProfile } from './components/UserProfile';
export { UserList } from './components/UserList';

// Export hooks
export { useSuspenseUser, useSuspenseUsers } from './hooks/useSuspenseUser';
export { useUserMutations } from './hooks/useUserMutations';

// Export API
export { userService } from './api/user.service';

// Export types
export type { User, CreateUserPayload, UpdateUserPayload } from './types';
```

---

## Example 3: Complete Next.js Page with Lazy Loading

```typescript
/**
 * User profile page
 * Path: app/users/[userId]/page.tsx
 */

import { Suspense, lazy } from 'react';
import { Loading } from '@/components/ui';

// Lazy load UserProfile component
const UserProfile = lazy(() =>
  import('@/features/users/components/UserProfile').then(
    (module) => ({ default: module.UserProfile })
  )
);

interface UserProfilePageProps {
  params: {
    userId: string;
  };
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { userId } = params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<Loading />}>
        <UserProfile
          userId={userId}
          onUpdate={() => console.log('Profile updated')}
        />
      </Suspense>
    </div>
  );
}
```

---

## Example 4: List with Search and Filtering

```typescript
import React, { useState, useMemo } from 'react';
import { Box, TextField } from '@mui/material';
import { useDebounce } from 'use-debounce';
import { useSuspenseQuery } from '@tanstack/react-query';
import { userService } from '../api/user.service';
import { Table } from '@/components/ui';

export const UserList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  const { data: users } = useSuspenseQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });

  // Memoized filtering
  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return users;

    return users.filter(user =>
      user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [users, debouncedSearch]);

  const columns = [
    { key: 'name', dataIndex: 'name', title: 'Name', width: 150 },
    { key: 'email', dataIndex: 'email', title: 'Email', width: 200 },
    { key: 'roles', dataIndex: 'roles', title: 'Roles', width: 150,
      render: (roles: string[]) => roles.join(', ') },
  ];

  return (
    <Box>
      <TextField
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..."
        fullWidth
        sx={{ mb: 2 }}
      />

      <Table
        columns={columns}
        dataSource={filteredUsers}
      />
    </Box>
  );
};
```

---

## Example 5: Form with Validation

```typescript
import React from 'react';
import { Box, TextField, Button, Paper } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api/user.service';
import { Toast } from '@/components/ui';

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name cannot be empty'),
  lastName: z.string().min(1, 'Last name cannot be empty'),
});

type UserFormData = z.infer<typeof userSchema>;

interface CreateUserFormProps {
  onSuccess?: () => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: UserFormData) => userService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      Toast.success('User created successfully');
      reset();
      onSuccess?.();
    },

    onError: (error) => {
      Toast.error('Creation failed: ' + error.message);
    },
  });

  const onSubmit = (data: UserFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            {...register('username')}
            label="Username"
            error={!!errors.username}
            helperText={errors.username?.message}
            fullWidth
          />

          <TextField
            {...register('email')}
            label="Email"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
          />

          <TextField
            {...register('firstName')}
            label="First Name"
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            fullWidth
          />

          <TextField
            {...register('lastName')}
            label="Last Name"
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default CreateUserForm;
```

---

## Example 6: Parent Container with Lazy Loading

```typescript
import React, { Suspense, lazy } from 'react';
import { Box } from '@mui/material';
import { Loading } from '@/components/ui';

// Lazy load heavy components
const UserList = lazy(() => import('./UserList'));
const UserStats = lazy(() => import('./UserStats'));
const ActivityFeed = lazy(() => import('./ActivityFeed'));

export const UserDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Suspense fallback={<Loading />}>
        <UserStats />
      </Suspense>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Box sx={{ flex: 2 }}>
          <Suspense fallback={<Loading />}>
            <UserList />
          </Suspense>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Suspense fallback={<Loading />}>
            <ActivityFeed />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;
```

**Advantages:**
- Each section loads independently
- User sees partial content faster
- Better perceived performance

---

## Example 7: Cache-First Strategy Implementation

```typescript
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api/user.service';
import type { User } from '../types';

/**
 * Smart user hook using cache-first strategy
 * Prioritizes reusing data from list cache
 */
export function useSuspenseUser(userId: string) {
  const queryClient = useQueryClient();

  return useSuspenseQuery<User, Error>({
    queryKey: ['user', userId],
    queryFn: async () => {
      // Strategy 1: Check list cache first (avoid API call)
      const listCache = queryClient.getQueryData<User[]>(['users']);

      if (listCache) {
        const cached = listCache.find(user => user.id === userId);
        if (cached) {
          return cached;  // Return from cache - no API call needed!
        }
      }

      // Strategy 2: If not in cache, fetch from API
      return userService.getById(userId);
    },
    staleTime: 5 * 60 * 1000,       // 5 minutes data is fresh
    gcTime: 10 * 60 * 1000,         // Cache for 10 minutes
    refetchOnWindowFocus: false,    // Don't refetch on focus
  });
}
```

**Why use this pattern:**
- Check list cache before API calls
- If user came from list page, data is instantly available
- Falls back to API if not cached
- Configurable cache times

---

## Example 8: Modal Dialog with Forms

```typescript
import React from 'react';
import { TextField, Button, Box } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui';

const formSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty'),
  email: z.string().email('Invalid email format'),
});

type FormData = z.infer<typeof formSchema>;

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add User">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            {...register('name')}
            label="Name"
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
            autoFocus
          />

          <TextField
            {...register('email')}
            label="Email"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add User
            </Button>
          </Box>
        </Box>
      </form>
    </Modal>
  );
};
```

---

## Example 9: Parallel Data Fetching

```typescript
import React from 'react';
import { Box, Grid, Paper } from '@mui/material';
import { useSuspenseQueries } from '@tanstack/react-query';
import { userService } from '../api/user.service';
import { statsService } from '../api/stats.service';
import { activityService } from '../api/activity.service';

export const Dashboard: React.FC = () => {
  // Use Suspense to fetch all data in parallel
  const [statsQuery, usersQuery, activityQuery] = useSuspenseQueries({
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
        queryKey: ['activity', 'recent'],
        queryFn: () => activityService.getRecent(),
      },
    ],
  });

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <h3>Statistics</h3>
            <p>Total: {statsQuery.data.total}</p>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <h3>Active Users</h3>
            <p>Count: {usersQuery.data.length}</p>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <h3>Recent Activity</h3>
            <p>Events: {activityQuery.data.length}</p>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Use with Suspense
import { Suspense } from 'react';
import { Loading } from '@/components/ui';

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

---

## Example 10: Optimistic Updates

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Toast } from '@/components/ui';
import type { User } from '../types';

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.toggleStatus(userId),

    // Optimistic update
    onMutate: async (userId) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // Save previous values
      const previousUsers = queryClient.getQueryData<User[]>(['users']);

      // Optimistic UI update
      queryClient.setQueryData<User[]>(['users'], (old) => {
        return old?.map(user =>
          user.id === userId
            ? { ...user, active: !user.active }
            : user
        ) || [];
      });

      return { previousUsers };
    },

    // Rollback on error
    onError: (err, userId, context) => {
      queryClient.setQueryData(['users'], context?.previousUsers);
      Toast.error('Operation failed');
    },

    // Refetch on mutation completion
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

---

## Example 11: Data Table with Actions

```typescript
import React from 'react';
import { Box, IconButton, Chip } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Modal, Toast } from '@/components/ui';
import { userService } from '../api/user.service';
import type { User } from '../types';

export const UserTable: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useSuspenseQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      Toast.success('Delete successful');
    },
    onError: () => {
      Toast.error('Delete failed');
    },
  });

  const handleEdit = (id: string) => {
    // Navigate to edit page or open edit modal
    console.log('Edit user', id);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      content: 'Are you sure you want to delete this user? This action cannot be undone.',
      okText: 'Delete',
      okButtonProps: { color: 'error' },
      onOk: async () => {
        deleteMutation.mutate(id);
      },
    });
  };

  const columns = [
    { key: 'name', dataIndex: 'name', title: 'Name', width: 150 },
    { key: 'email', dataIndex: 'email', title: 'Email', width: 200 },
    {
      key: 'status',
      dataIndex: 'active',
      title: 'Status',
      width: 100,
      render: (active: boolean) => (
        <Chip
          label={active ? 'Active' : 'Inactive'}
          color={active ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (_: any, record: User) => (
        <Box>
          <IconButton onClick={() => handleEdit(record.id)} size="small">
            <Edit />
          </IconButton>
          <IconButton onClick={() => handleDelete(record.id)} size="small">
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      loading={isLoading}
    />
  );
};
```

---

## Summary

**Key Points:**

1. **Component patterns**: React.FC + lazy + Suspense + useSuspenseQuery
2. **Feature structure**: Organized subdirectories (api/, components/, hooks/, etc.)
3. **Routing**: Next.js App Router + lazy loading
4. **Data fetching**: useSuspenseQuery with cache-first strategy
5. **Forms**: React Hook Form + Zod validation
6. **Error handling**: Toast + onError callbacks
7. **Performance**: useMemo, useCallback, React.memo, debouncing
8. **Styling**: <100 lines inline, sx prop, MUI v7 syntax
9. **Component library**: Use project custom components (Modal, Select, Toast, Table, Loading)

**Refer to other resources for detailed explanations of each pattern.**