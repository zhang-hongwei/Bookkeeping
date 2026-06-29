/**
 * LoginPage Usage Examples
 *
 * This file demonstrates how to use the LoginPage component
 */

'use client';

import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import Image from 'next/image';
import LoginPage from './LoginPage';
import LoginForm from './LoginForm';
import type { LoginFormData } from './schema';

/**
 * Example 1: Basic login page with default branding
 */
export function BasicLoginExample() {
  const router = useRouter();

  const handleLogin = async (data: LoginFormData) => {
    // Call your login API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const result = await response.json();
    console.log('Login successful:', result);

    // Redirect to dashboard
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

/**
 * Example 2: Custom branding with gradient colors
 */
export function CustomBrandingExample() {
  const router = useRouter();

  return (
    <LoginPage
      brandName="My Awesome App"
      tagline="Transform your business today"
      description="Join thousands of users who trust our platform for their daily operations."
      gradientColors={['#FF6B6B', '#4ECDC4']}
      onSuccess={async (data: LoginFormData) => {
        console.log('Login data:', data);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push('/dashboard');
      }}
      onNavigateToRegister={() => router.push('/register')}
    />
  );
}

/**
 * Example 3: With background image
 */
export function BackgroundImageExample() {
  const router = useRouter();

  return (
    <LoginPage
      brandName="Photo Gallery"
      tagline="Your memories, beautifully organized"
      description="Store, share, and relive your precious moments with our secure platform."
      backgroundImage="https://images.unsplash.com/photo-1557683316-973673baf926"
      onSuccess={async (data: LoginFormData) => {
        await fetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        router.push('/gallery');
      }}
    />
  );
}

/**
 * Example 4: With custom logo
 */
export function CustomLogoExample() {
  const router = useRouter();

  return (
    <LoginPage
      brandName="Tech Corp"
      tagline="Innovation at its best"
      logo={
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Image src="/logo.png" alt="Tech Corp Logo" width={80} height={80} />
        </Box>
      }
      onSuccess={async (data: LoginFormData) => {
        console.log('Login:', data);
        router.push('/dashboard');
      }}
    />
  );
}

/**
 * Example 5: Minimal login form (no left panel)
 */
export function MinimalLoginFormExample() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <LoginForm
        onSuccess={async (data: LoginFormData) => {
          console.log('Login:', data);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          router.push('/dashboard');
        }}
        onNavigateToRegister={() => router.push('/register')}
        onNavigateToForgotPassword={() => router.push('/forgot-password')}
      />
    </Box>
  );
}

/**
 * Example 6: Login form without extra links
 */
export function SimpleLoginFormExample() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LoginForm
        showRegisterLink={false}
        showForgotPassword={false}
        showRememberMe={false}
        onSuccess={async (data: LoginFormData) => {
          await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
          });
          router.push('/dashboard');
        }}
      />
    </Box>
  );
}

/**
 * Example 7: Integration with NextAuth
 */
export function NextAuthLoginExample() {
  const router = useRouter();

  const handleLogin = async (data: LoginFormData) => {
    // Example using NextAuth (you'll need to import signIn)
    // const result = await signIn('credentials', {
    //   email: data.email,
    //   password: data.password,
    //   redirect: false,
    // });

    // if (result?.error) {
    //   throw new Error(result.error);
    // }

    // For this example, we'll simulate it
    console.log('NextAuth login:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    router.push('/dashboard');
  };

  return (
    <LoginPage
      brandName="NextAuth App"
      tagline="Secure authentication made easy"
      onSuccess={handleLogin}
      onNavigateToRegister={() => router.push('/register')}
    />
  );
}

/**
 * Example 8: Dark theme with custom colors
 */
export function DarkThemeLoginExample() {
  const router = useRouter();

  return (
    <LoginPage
      brandName="Dark Mode App"
      tagline="Experience the dark side"
      description="A sleek, modern interface designed for night owls and developers."
      gradientColors={['#232526', '#414345']}
      onSuccess={async (data: LoginFormData) => {
        console.log('Login:', data);
        router.push('/dashboard');
      }}
    />
  );
}

/**
 * Example 9: E-commerce style
 */
export function EcommerceLoginExample() {
  const router = useRouter();

  return (
    <LoginPage
      brandName="ShopSmart"
      tagline="Your one-stop shop"
      description="Discover amazing deals, track your orders, and enjoy a seamless shopping experience."
      gradientColors={['#f093fb', '#f5576c']}
      onSuccess={async (data: LoginFormData) => {
        await fetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        router.push('/shop');
      }}
      onNavigateToRegister={() => router.push('/register')}
    />
  );
}
