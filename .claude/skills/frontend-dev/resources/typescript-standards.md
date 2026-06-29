# TypeScript Standards

TypeScript best practices for React frontend code to ensure type safety and maintainability.

---

## Strict Mode

### Configuration

TypeScript strict mode is **enabled** in this project:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**This means:**
- No implicit `any` types allowed
- Must explicitly handle null/undefined
- Enforced type safety
- Unused variables will throw errors

---

## No `any` Types

### Rules

```typescript
// ❌ Never use any
function handleData(data: any) {
  return data.something;
}

// ✅ Use specific types
interface MyData {
  something: string;
}

function handleData(data: MyData) {
  return data.something;
}

// ✅ Or use unknown for truly unknown data
function handleUnknown(data: unknown) {
  if (typeof data === 'object' && data !== null && 'something' in data) {
    return (data as MyData).something;
  }
}
```

**If you really don't know the type:**
- Use `unknown` (enforces type checking)
- Use type guards to narrow types
- Document why the type is unknown

---

## Explicit Return Types

### Function Return Types

```typescript
// ✅ Correct - explicit return type
function getUser(id: number): Promise<User> {
  return apiClient.get(`/users/${id}`);
}

function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

async function fetchData(url: string): Promise<Data> {
  const response = await fetch(url);
  return response.json();
}

// ❌ Avoid - implicit return type (unclear)
function getUser(id: number) {
  return apiClient.get(`/users/${id}`);
}
```

### Component Return Types

```typescript
// React.FC already provides return type (ReactElement)
export const MyComponent: React.FC<Props> = ({ prop }) => {
  return <div>{prop}</div>;
};

// Custom Hook return type
function useMyData(id: number): {
  data: Data | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  return { data, isLoading, error };
}
```

---

## Type Imports

### Using 'type' Keyword

```typescript
// ✅ Correct - explicitly marked as type import
import type { User } from '@/types/user';
import type { Post } from '@/types/post';
import type { SxProps, Theme } from '@mui/material';

// ❌ Avoid - mixing value and type imports
import { User } from '@/types/user';  // Unclear if type or value
```

**Benefits:**
- Clear distinction between types and values
- Better tree-shaking
- Prevents circular dependencies
- TypeScript compiler optimization

### Mixed Imports

```typescript
// ✅ Correct - types imported separately
import { Box, Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

// ✅ Also fine - distinguishing on same line
import { type User, createUser, deleteUser } from '@/api/users';
```

---

## Component Props Interfaces

### Interface Pattern

```typescript
/**
 * Props for MyComponent
 */
interface MyComponentProps {
  /** User ID to display */
  userId: number;

  /** Optional callback: triggered when action completes */
  onComplete?: () => void;

  /** Component display mode */
  mode?: 'view' | 'edit';

  /** Additional CSS class name */
  className?: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  userId,
  onComplete,
  mode = 'view',  // Default value
  className,
}) => {
  return <div>...</div>;
};
```

**Key points:**
- Props use separate interfaces
- Each prop has JSDoc comments
- Optional props use `?`
- Provide default values in destructuring

### Props with Children

```typescript
interface ContainerProps {
  children: React.ReactNode;
  title: string;
}

export const Container: React.FC<ContainerProps> = ({ children, title }) => {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
```

### Extending Native HTML Attributes

```typescript
import type { ButtonHTMLAttributes } from 'react';

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  variant,
  isLoading,
  children,
  ...htmlProps
}) => {
  return (
    <button {...htmlProps} disabled={isLoading || htmlProps.disabled}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
```

---

## Utility Types

### Partial<T>

```typescript
// Make all properties optional
type UserUpdate = Partial<User>;

function updateUser(id: number, updates: Partial<User>) {
  // updates can have any subset of User properties
}
```

### Pick<T, K>

```typescript
// Select specific properties
type UserPreview = Pick<User, 'id' | 'name' | 'email'>;

const preview: UserPreview = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  // Other User properties not allowed
};
```

### Omit<T, K>

```typescript
// Exclude specific properties
type UserWithoutPassword = Omit<User, 'password' | 'passwordHash'>;

const publicUser: UserWithoutPassword = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  // password and passwordHash not allowed
};
```

### Required<T>

```typescript
// Make all properties required
interface Config {
  apiKey?: string;
  timeout?: number;
}

type RequiredConfig = Required<Config>;  // All optional props become required

const config: RequiredConfig = {
  apiKey: 'xxx',  // Required
  timeout: 5000,  // Required
};
```

### Record<K, V>

```typescript
// Type-safe objects/maps
const userMap: Record<string, User> = {
  'user1': { id: 1, name: 'John' },
  'user2': { id: 2, name: 'Jane' },
};

// For styles
import type { SxProps, Theme } from '@mui/material';

const styles: Record<string, SxProps<Theme>> = {
  container: { p: 2 },
  header: { mb: 1 },
};
```

### Readonly<T>

```typescript
// Make all properties read-only
interface MutableUser {
  id: number;
  name: string;
}

type ReadonlyUser = Readonly<MutableUser>;

const user: ReadonlyUser = { id: 1, name: 'John' };
user.name = 'Jane';  // ❌ Error: Cannot assign to read-only property
```

---

## Type Guards

### Basic Type Guards

```typescript
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    typeof (data as any).id === 'number' &&
    typeof (data as any).name === 'string'
  );
}

// Usage
if (isUser(response)) {
  console.log(response.name);  // TypeScript knows this is User
}
```

### Discriminated Unions

```typescript
type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Data }
  | { status: 'error'; error: Error };

function Component({ state }: { state: LoadingState }) {
  // TypeScript narrows type based on status
  if (state.status === 'success') {
    return <Display data={state.data} />;  // data is available here
  }

  if (state.status === 'error') {
    return <Error error={state.error} />;  // error is available here
  }

  return <Loading />;
}
```

### Array Type Guards

```typescript
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

// Usage
if (isStringArray(data)) {
  data.forEach(str => console.log(str.toUpperCase()));
}
```

---

## Generic Types

### Generic Functions

```typescript
function getById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// Type inference when used
const users: User[] = [...];
const user = getById(users, 123);  // Type: User | undefined

const posts: Post[] = [...];
const post = getById(posts, 456);  // Type: Post | undefined
```

### Generic Components

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor?: (item: T) => string | number;
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>): React.ReactElement {
  return (
    <div>
      {items.map((item, index) => (
        <div key={keyExtractor ? keyExtractor(item) : index}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

// Usage
<List<User>
  items={users}
  renderItem={(user) => <UserCard user={user} />}
  keyExtractor={(user) => user.id}
/>
```

### Generic Hooks

```typescript
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}

// Usage
const [user, setUser] = useLocalStorage<User>('user', { id: 0, name: '' });
```

---

## Type Assertions (Use Sparingly)

### When to Use

```typescript
// ✅ OK - when you know more than TypeScript
const element = document.getElementById('my-element') as HTMLInputElement;
const value = element.value;

// ✅ OK - verified API response
const response = await api.getData();
const user = response.data as User;  // You know the structure
```

### When Not to Use

```typescript
// ❌ Avoid - bypasses type safety
const data = getData() as any;  // Wrong - breaks TypeScript

// ❌ Avoid - unsafe assertions
const value = unknownValue as string;  // Might not actually be string
```

### Better Alternatives

```typescript
// ✅ Use type guards
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

if (isString(unknownValue)) {
  // Now safe to use
  console.log(unknownValue.toUpperCase());
}
```

---

## Null/Undefined Handling

### Optional Chaining

```typescript
// ✅ Correct
const name = user?.profile?.name;

// Equivalent to:
const name = user && user.profile && user.profile.name;

// Function calls
const result = obj?.method?.();

// Array elements
const firstItem = array?.[0];
```

### Nullish Coalescing

```typescript
// ✅ Correct
const displayName = user?.name ?? 'Anonymous';

// Only uses default value for null or undefined
// (Different from || which triggers on '', 0, false)

const count = 0;
const displayCount = count ?? 10;  // Result: 0
const displayCount2 = count || 10; // Result: 10 (Wrong!)
```

### Non-null Assertion (Use Carefully)

```typescript
// ✅ OK - when you're sure value exists
const data = queryClient.getQueryData<Data>(['data'])!;

// ⚠️ Careful - only use when you know it's not null
// Better approach is explicit check:
const data = queryClient.getQueryData<Data>(['data']);
if (data) {
  // Use data
}
```

---

## API Response Types

### Defining Response Types

```typescript
// API response wrapper
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Paginated response
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Usage
async function getUsers(): Promise<ApiResponse<User[]>> {
  const response = await fetch('/api/users');
  return response.json();
}

async function getUsersPaginated(
  page: number
): Promise<PaginatedResponse<User>> {
  const response = await fetch(`/api/users?page=${page}`);
  return response.json();
}
```

---

## Form Types

### React Hook Form + Zod

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema
const formSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(18, 'Age must be over 18'),
});

// Infer TypeScript type
type FormData = z.infer<typeof formSchema>;

export const MyForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    // data is type-safe
    console.log(data.username, data.email, data.age);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} />
      {errors.username && <span>{errors.username.message}</span>}
    </form>
  );
};
```

---

## Complete Example

### Type-Safe Feature Module

```typescript
// types/user.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export type UserCreateInput = Omit<User, 'id' | 'createdAt'>;
export type UserUpdateInput = Partial<UserCreateInput>;

// api/user.service.ts
import type { User, UserCreateInput, UserUpdateInput } from '@/types/user';

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await fetch('/api/users');
    return response.json();
  },

  async getById(id: number): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },

  async create(input: UserCreateInput): Promise<User> {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.json();
  },

  async update(id: number, input: UserUpdateInput): Promise<User> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return response.json();
  },
};

// components/UserProfile.tsx
import React from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { User } from '@/types/user';
import { userService } from '@/api/user.service';

interface UserProfileProps {
  userId: number;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onUpdate }) => {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId),
  });

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
};
```

---

## Type Definition File Organization

### Decision Guide: Where to Define Types

Choosing the right location for type definitions is crucial for maintainability and scalability.

| Component Complexity | Type Definition Location | Reasoning |
|---------------------|------------------------|-----------|
| **Simple** (< 5 props) | In component file | Avoid over-engineering, faster development |
| **Medium** (5-15 props) | Separate `types.ts` | Balance readability & organization |
| **Complex** (> 15 props) | Separate `types.ts` + docs | Essential for maintainability |
| **Shared across files** | Separate `types.ts` or `@/types/` | Enable reuse, single source of truth |

### Component Directory Structures

#### Option 1: Types in Component File (Simple Components)

**Use for:** Components with < 5 props, no type reuse, quick prototyping

```typescript
// MySimpleButton.tsx
import React from 'react';

/**
 * Props for MySimpleButton component
 */
interface MySimpleButtonProps {
  /** Button label text */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary';
}

export const MySimpleButton: React.FC<MySimpleButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
}) => {
  return (
    <button onClick={onClick} className={variant}>
      {label}
    </button>
  );
};
```

**Pros:**
- ✅ Quick to write
- ✅ Everything in one place
- ✅ Good for small components

**Cons:**
- ❌ File gets long with complex types
- ❌ Harder to reuse types
- ❌ Mixes concerns (types + implementation)

#### Option 2: Separate types.ts (Recommended for Medium+ Components)

**Use for:** Components with 5+ props, types used by multiple files, complex interfaces

**Directory Structure:**
```
MyComponent/
├── types.ts              # Type definitions (public API)
├── MyComponent.tsx       # Component implementation
├── MyComponent.test.tsx  # Tests
├── index.ts              # Exports
└── README.md             # Documentation (optional)
```

**types.ts:**
```typescript
import type { ReactNode } from 'react';

/**
 * Props for MyComponent
 */
export interface MyComponentProps {
  /** User ID to display */
  userId: number;

  /** Callback when update completes */
  onUpdate?: (data: UserData) => void | Promise<void>;

  /** Component display mode */
  mode?: 'view' | 'edit';

  /** Additional CSS class */
  className?: string;

  /** Custom header content */
  header?: ReactNode;

  /** Show footer section */
  showFooter?: boolean;
}

/**
 * Internal state structure
 */
export interface MyComponentState {
  isLoading: boolean;
  error: Error | null;
  data: UserData | null;
}

/**
 * User data structure
 */
export interface UserData {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Internal types (not exported)
interface InternalHelperType {
  processedData: string;
  timestamp: number;
}
```

**MyComponent.tsx:**
```typescript
import React from 'react';
import type { MyComponentProps } from './types';

export const MyComponent: React.FC<MyComponentProps> = ({
  userId,
  onUpdate,
  mode = 'view',
  className,
  header,
  showFooter = true,
}) => {
  // Implementation
  return <div className={className}>...</div>;
};
```

**index.ts:**
```typescript
export { MyComponent } from './MyComponent';
export type { MyComponentProps, MyComponentState, UserData } from './types';
```

**Pros:**
- ✅ Clear separation of concerns
- ✅ Easy to find and reuse types
- ✅ Component file focuses on logic
- ✅ Better for large teams
- ✅ Easier to document

**Cons:**
- ❌ Requires jumping between files
- ❌ Slight overhead for simple components

### Form Components with Zod

For form components, separate validation schemas from component props:

**Directory Structure:**
```
LoginPage/
├── schema.ts             # Zod schemas + inferred types
├── types.ts              # Component prop types
├── LoginForm.tsx         # Form component
├── LoginPage.tsx         # Page component with layout
├── index.ts              # Exports
└── README.md             # Documentation
```

**schema.ts:**
```typescript
import { z } from 'zod';

/**
 * Login form validation schema
 */
export const loginFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

/**
 * Inferred type from Zod schema
 */
export type LoginFormData = z.infer<typeof loginFormSchema>;
```

**types.ts:**
```typescript
import type { LoginFormData } from './schema';

/**
 * Props for LoginForm component
 */
export interface LoginFormProps {
  /** Callback when login succeeds */
  onSuccess?: (data: LoginFormData) => void | Promise<void>;

  /** Show forgot password link */
  showForgotPassword?: boolean;

  /** Show remember me checkbox */
  showRememberMe?: boolean;

  /** Navigate to registration */
  onNavigateToRegister?: () => void;
}

/**
 * Props for LoginPage component (extends LoginForm)
 */
export interface LoginPageProps extends LoginFormProps {
  /** Brand name to display */
  brandName?: string;

  /** Brand logo element */
  logo?: React.ReactNode;

  /** Background gradient colors */
  gradientColors?: [string, string];

  /** Background image URL */
  backgroundImage?: string;
}
```

**Usage:**
```typescript
// LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LoginFormProps } from './types';
import { loginFormSchema, type LoginFormData } from './schema';

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await onSuccess?.(data);
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
};
```

### Type Organization Best Practices

#### 1. Export Discipline

```typescript
// types.ts

// ✅ Export public types
export interface MyComponentProps {
  // ...
}

export type PublicData = {
  // ...
};

// ✅ Internal types (not exported)
interface InternalHelperType {
  // Only used within this component
}

type InternalState = {
  // Implementation detail
};
```

#### 2. Naming Conventions

```typescript
// Component Props
export interface UserCardProps { }
export interface LoginFormProps { }

// Component State
export interface UserCardState { }
export interface DashboardState { }

// Form Data (from Zod)
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;

// API Responses
export interface UserResponse { }
export interface UsersListResponse { }

// API Requests
export interface CreateUserRequest { }
export interface UpdateUserRequest { }
```

#### 3. Documentation

```typescript
/**
 * Props for the UserProfile component
 *
 * @example
 * ```tsx
 * <UserProfile
 *   userId={123}
 *   onUpdate={(user) => console.log('Updated:', user)}
 *   mode="edit"
 * />
 * ```
 */
export interface UserProfileProps {
  /**
   * User ID to display
   * @example 123
   */
  userId: number;

  /**
   * Callback triggered when user data is updated
   * @param user - The updated user object
   */
  onUpdate?: (user: User) => void | Promise<void>;

  /**
   * Display mode for the component
   * @default 'view'
   */
  mode?: 'view' | 'edit';
}
```

#### 4. Type Reusability

```typescript
// For shared types across multiple features
// src/types/user.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

// For feature-specific types
// src/features/users/types/index.ts
import type { User } from '@/types/user';

export interface UserWithPermissions extends User {
  permissions: string[];
}

// For component-specific types
// src/components/forms/LoginPage/types.ts
export interface LoginPageProps {
  // Component-specific
}
```

### Migration Strategy

When refactoring existing components to use separate `types.ts`:

**Step 1: Create types.ts**
```typescript
// Extract all exported interfaces
export interface MyComponentProps { }
export interface MyComponentState { }
```

**Step 2: Update component file**
```typescript
// Change from local interface to import
import type { MyComponentProps } from './types';
```

**Step 3: Update index.ts**
```typescript
export { MyComponent } from './MyComponent';
export type { MyComponentProps } from './types';
```

**Step 4: Update consumers**
```typescript
// They can now import types separately
import type { MyComponentProps } from '@/components/MyComponent';
```

### Real-World Example

**Before (types in component):**
```typescript
// UserProfile.tsx (200+ lines)
import React from 'react';

interface UserProfileProps {
  userId: number;
  onUpdate?: (user: User) => void;
  mode?: 'view' | 'edit';
  showAvatar?: boolean;
  avatarSize?: 'small' | 'medium' | 'large';
  showBadges?: boolean;
  showActivity?: boolean;
  activityLimit?: number;
  // ... 10+ more props
}

interface UserProfileState {
  // ... multiple state interfaces
}

interface User {
  // ... user interface
}

export const UserProfile: React.FC<UserProfileProps> = (props) => {
  // 150+ lines of implementation
};
```

**After (separate types.ts):**
```typescript
// types.ts (clean, focused)
export interface UserProfileProps {
  userId: number;
  onUpdate?: (user: User) => void;
  mode?: 'view' | 'edit';
  showAvatar?: boolean;
  avatarSize?: 'small' | 'medium' | 'large';
  showBadges?: boolean;
  showActivity?: boolean;
  activityLimit?: number;
}

export interface UserProfileState {
  isLoading: boolean;
  error: Error | null;
  user: User | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

// UserProfile.tsx (focused on implementation)
import React from 'react';
import type { UserProfileProps } from './types';

export const UserProfile: React.FC<UserProfileProps> = (props) => {
  // Clean, focused implementation
};
```

---

## Summary

**TypeScript Checklist:**
- ✅ Strict mode enabled
- ✅ No `any` types (use `unknown` when needed)
- ✅ Functions have explicit return types
- ✅ Type imports use `import type`
- ✅ Props interfaces have JSDoc comments
- ✅ Use utility types (Partial, Pick, Omit, Required, Record)
- ✅ Type guards for narrowing types
- ✅ Optional chaining and nullish coalescing operators
- ✅ Generics for reusable code
- ✅ **Separate `types.ts` for components with 5+ props**
- ✅ **Use `schema.ts` for Zod validation schemas**
- ✅ **Follow naming conventions: `{Component}Props`, `{Form}FormData`**
- ✅ **Export only public types, keep internal types private**
- ❌ Avoid type assertions (unless necessary)

**Type Organization Quick Reference:**

| Component Size | Type Location | File Structure |
|---------------|---------------|----------------|
| < 5 props | In component file | `MyComponent.tsx` |
| 5-15 props | Separate `types.ts` | `types.ts`, `MyComponent.tsx`, `index.ts` |
| > 15 props | Separate `types.ts` + docs | Add `README.md` |
| Form components | `schema.ts` + `types.ts` | Zod schemas separate from props |

**References:**
- [component-patterns.md](component-patterns.md) - Component types
- [data-fetching.md](data-fetching.md) - API types
- [common-patterns.md](common-patterns.md) - Form types (Zod)
- [file-organization.md](file-organization.md) - Directory structure