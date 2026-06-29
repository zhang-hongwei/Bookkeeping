# LoginPage Component

A beautiful login page component with a split-screen layout featuring brand marketing content on the left and a login form on the right.

## Features

- ✅ Split-screen layout (brand/form)
- ✅ Fully responsive (stacks on mobile)
- ✅ Email and password validation
- ✅ Password visibility toggle
- ✅ Remember me option
- ✅ Forgot password link
- ✅ Registration link
- ✅ Customizable branding
- ✅ Gradient or image background
- ✅ Beautiful UI with glassmorphism effects
- ✅ Built-in Toast notifications
- ✅ TypeScript support

## Components

### LoginPage (Full Layout)

The main component with left-right split layout.

### LoginForm (Form Only)

Just the login form without the left panel, useful for modals or embedded forms.

## Usage

### Basic Usage

```tsx
import { LoginPage } from '@/components/forms/LoginPage';

function LoginRoute() {
  const router = useRouter();

  return (
    <LoginPage
      onSuccess={async (data) => {
        await fetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        router.push('/dashboard');
      }}
      onNavigateToRegister={() => router.push('/register')}
      onNavigateToForgotPassword={() => router.push('/forgot-password')}
    />
  );
}
```

### Custom Branding

```tsx
import { LoginPage } from '@/components/forms/LoginPage';
import Image from 'next/image';

function CustomLoginPage() {
  return (
    <LoginPage
      brandName="My Awesome App"
      tagline="Transform your business today"
      description="Join thousands of users who trust our platform for their daily operations."
      logo={<Image src="/logo.png" alt="Logo" width={80} height={80} />}
      gradientColors={['#FF6B6B', '#4ECDC4']}
      onSuccess={handleLogin}
    />
  );
}
```

### With Background Image

```tsx
import { LoginPage } from '@/components/forms/LoginPage';

function LoginWithImage() {
  return (
    <LoginPage
      backgroundImage="https://images.unsplash.com/photo-1557683316-973673baf926"
      brandName="Your Brand"
      tagline="Welcome Back"
      onSuccess={handleLogin}
    />
  );
}
```

### Using LoginForm Separately

```tsx
import { LoginForm } from '@/components/forms/LoginPage';
import { Modal } from '@/components/ui';

function LoginModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Sign In">
      <LoginForm
        onSuccess={async (data) => {
          await loginUser(data);
          onClose();
        }}
        showRegisterLink={false}
      />
    </Modal>
  );
}
```

## Props

### LoginPage Props

| Prop                         | Type                                             | Default                        | Description                                |
| ---------------------------- | ------------------------------------------------ | ------------------------------ | ------------------------------------------ |
| `brandName`                  | `string`                                         | `"Dev Tools"`                  | Website/Brand name displayed on left panel |
| `tagline`                    | `string`                                         | `"Build faster, ship smarter"` | Tagline shown below brand name             |
| `description`                | `string`                                         | -                              | Additional description text                |
| `logo`                       | `React.ReactNode`                                | `<RocketLaunch />`             | Brand logo image or element                |
| `backgroundImage`            | `string`                                         | -                              | Background image URL for left panel        |
| `gradientColors`             | `[string, string]`                               | `['#667eea', '#764ba2']`       | Gradient colors for left panel             |
| `onSuccess`                  | `(data: LoginFormData) => void \| Promise<void>` | -                              | Callback when login succeeds               |
| `showRegisterLink`           | `boolean`                                        | `true`                         | Show registration link                     |
| `showForgotPassword`         | `boolean`                                        | `true`                         | Show forgot password link                  |
| `showRememberMe`             | `boolean`                                        | `true`                         | Show remember me checkbox                  |
| `onNavigateToRegister`       | `() => void`                                     | -                              | Callback for register link click           |
| `onNavigateToForgotPassword` | `() => void`                                     | -                              | Callback for forgot password click         |

### LoginForm Props

| Prop                         | Type                                             | Default | Description                        |
| ---------------------------- | ------------------------------------------------ | ------- | ---------------------------------- |
| `onSuccess`                  | `(data: LoginFormData) => void \| Promise<void>` | -       | Callback when login succeeds       |
| `showRegisterLink`           | `boolean`                                        | `true`  | Show registration link             |
| `showForgotPassword`         | `boolean`                                        | `true`  | Show forgot password link          |
| `showRememberMe`             | `boolean`                                        | `true`  | Show remember me checkbox          |
| `onNavigateToRegister`       | `() => void`                                     | -       | Callback for register link click   |
| `onNavigateToForgotPassword` | `() => void`                                     | -       | Callback for forgot password click |

## Form Data Type

```typescript
type LoginFormData = {
  email: string;           // Valid email format
  password: string;        // Password (minimum 1 character)
  rememberMe?: boolean;    // Optional remember me flag
};
```

## Validation Rules

### Email
- Must be a valid email format

### Password
- Required field (no minimum length for login)

## Responsive Behavior

- **Desktop (≥ md)**: Split-screen layout with left brand panel and right form panel
- **Mobile (< md)**:
  - Left panel is hidden
  - Brand logo and name shown at the top of the form
  - Full-width form
  - No elevation on paper component

## Customization Examples

### Minimal Login Form

```tsx
<LoginForm
  showRegisterLink={false}
  showForgotPassword={false}
  showRememberMe={false}
  onSuccess={handleLogin}
/>
```

### Custom Gradient Colors

```tsx
<LoginPage
  gradientColors={['#11998e', '#38ef7d']} // Teal to green
  brandName="EcoTech"
  tagline="Sustainable Solutions"
  onSuccess={handleLogin}
/>
```

### Dark Theme

The component automatically adapts to your MUI theme mode (light/dark).

## Integration Examples

### With Next.js App Router

```tsx
// app/login/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@/components/forms/LoginPage';

export default function LoginRoute() {
  const router = useRouter();

  const handleLogin = async (data: LoginFormData) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Login failed');

    router.push('/dashboard');
  };

  return (
    <LoginPage
      onSuccess={handleLogin}
      onNavigateToRegister={() => router.push('/register')}
      onNavigateToForgotPassword={() => router.push('/forgot-password')}
    />
  );
}
```

### With NextAuth

```tsx
'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoginPage } from '@/components/forms/LoginPage';

export default function LoginRoute() {
  const router = useRouter();

  const handleLogin = async (data: LoginFormData) => {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    router.push('/dashboard');
  };

  return <LoginPage onSuccess={handleLogin} />;
}
```

### With Clerk

```tsx
'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { LoginPage } from '@/components/forms/LoginPage';

export default function LoginRoute() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const handleLogin = async (data: LoginFormData) => {
    if (!signIn) return;

    const result = await signIn.create({
      identifier: data.email,
      password: data.password,
    });

    if (result.status === 'complete') {
      router.push('/dashboard');
    }
  };

  return <LoginPage onSuccess={handleLogin} />;
}
```

## Accessibility

- All form fields have proper labels
- Error messages are associated with fields
- Password visibility toggle has aria-label
- Keyboard navigation fully supported
- Focus management implemented
- ARIA attributes for screen readers

## Design Features

### Left Panel
- Gradient or image background
- Glassmorphism effects
- Decorative floating elements
- Responsive typography
- Feature badges

### Right Panel
- Clean, focused form layout
- Proper spacing and alignment
- Error states with helper text
- Loading states
- Interactive elements

## Tips

1. **Custom Logo**: Pass your logo as a React element for full control
2. **Background Images**: Use high-quality images from Unsplash or your assets
3. **Brand Colors**: Match gradient colors to your brand palette
4. **Mobile First**: Test on mobile devices for optimal UX
5. **Error Handling**: Provide clear error messages in your onSuccess callback
