# RegisterForm Component

A comprehensive user registration form component built with React Hook Form, Zod validation, and Material-UI v7.

## Features

- ✅ Username validation (3-20 characters, alphanumeric)
- ✅ Email validation with proper format checking
- ✅ Strong password requirements (min 8 chars, uppercase, lowercase, number)
- ✅ Password confirmation with match validation
- ✅ Terms and conditions acceptance
- ✅ Password visibility toggle
- ✅ Comprehensive error messages
- ✅ Loading state during submission
- ✅ Built-in Toast notifications

## Usage

### Basic Usage

```tsx
import { RegisterForm } from '@/components/forms/RegisterForm';

function RegisterPage() {
  return (
    <RegisterForm
      onSuccess={async (data) => {
        // Handle registration
        await registerUser(data);
        router.push('/dashboard');
      }}
      onNavigateToLogin={() => router.push('/login')}
    />
  );
}
```

### With Custom Success Handler

```tsx
import { RegisterForm } from '@/components/forms/RegisterForm';
import type { RegisterFormData } from '@/components/forms/RegisterForm';

function RegisterPage() {
  const handleRegister = async (data: RegisterFormData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) throw new Error('Registration failed');

      const result = await response.json();
      console.log('User registered:', result);

      // Redirect to login or dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      throw error; // Will be caught by the form and shown via Toast
    }
  };

  return (
    <RegisterForm
      onSuccess={handleRegister}
      onNavigateToLogin={() => router.push('/login')}
    />
  );
}
```

### Without Login Link

```tsx
import { RegisterForm } from '@/components/forms/RegisterForm';

function RegisterPage() {
  return (
    <RegisterForm
      showLoginLink={false}
      onSuccess={async (data) => {
        await registerUser(data);
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSuccess` | `(data: RegisterFormData) => void \| Promise<void>` | `undefined` | Callback function called when registration is successful |
| `showLoginLink` | `boolean` | `true` | Show link to login page |
| `onNavigateToLogin` | `() => void` | `undefined` | Callback function for navigating to login page |

## Form Data Type

```typescript
type RegisterFormData = {
  username: string;      // 3-20 chars, alphanumeric with _ and -
  email: string;         // Valid email format
  password: string;      // Min 8 chars, requires uppercase, lowercase, and number
  confirmPassword: string;
  agreeToTerms: boolean; // Must be true
};
```

## Validation Rules

### Username
- Minimum 3 characters
- Maximum 20 characters
- Only letters, numbers, underscores, and hyphens allowed

### Email
- Must be a valid email format

### Password
- Minimum 8 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number

### Confirm Password
- Must match the password field

### Terms and Conditions
- Must be checked to submit the form

## Customization

The component uses MUI's theme system, so you can customize its appearance through your theme:

```tsx
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          // Custom TextField styles
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          // Custom Button styles
        },
      },
    },
  },
});
```

## Accessibility

- All form fields have proper labels
- Error messages are associated with their fields
- Password visibility toggle has aria-label
- Form can be submitted with Enter key
- Keyboard navigation fully supported

## Examples

### Integration with Next.js App Router

```tsx
// app/register/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/forms/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <RegisterForm
        onSuccess={async (data) => {
          await fetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
          });
          router.push('/dashboard');
        }}
        onNavigateToLogin={() => router.push('/login')}
      />
    </div>
  );
}
```

### Integration with Authentication Context

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { RegisterForm } from '@/components/forms/RegisterForm';

function RegisterPage() {
  const { register } = useAuth();

  return (
    <RegisterForm
      onSuccess={async (data) => {
        await register(data.email, data.password, data.username);
      }}
    />
  );
}
```

## Error Handling

The component handles errors gracefully:
- Validation errors are shown inline below each field
- Submission errors trigger Toast notifications
- Loading state prevents multiple submissions
- Form is reset on successful submission (unless custom onSuccess is provided)
