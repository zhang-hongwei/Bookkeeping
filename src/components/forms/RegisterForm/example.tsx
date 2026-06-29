/**
 * RegisterForm Usage Example
 *
 * This file demonstrates how to use the RegisterForm component
 */

'use client';

import { useRouter } from 'next/navigation';
import { Box, Container, Paper } from '@mui/material';
import { RegisterForm } from './RegisterForm';
import type { RegisterFormData } from './schema';

/**
 * Example 1: Basic usage with API integration
 */
export function RegisterPageExample() {
  const router = useRouter();

  const handleRegister = async (data: RegisterFormData) => {
    // Call your registration API
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const result = await response.json();
    console.log('User registered successfully:', result);

    // Redirect to dashboard or login
    router.push('/dashboard');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
          }}
        >
          <RegisterForm
            onSuccess={handleRegister}
            onNavigateToLogin={() => router.push('/login')}
          />
        </Paper>
      </Box>
    </Container>
  );
}

/**
 * Example 2: Simple usage without custom styling
 */
export function SimpleRegisterExample() {
  const router = useRouter();

  return (
    <RegisterForm
      onSuccess={async (data) => {
        console.log('Registration data:', data);
        // Add your registration logic here
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push('/dashboard');
      }}
      onNavigateToLogin={() => router.push('/login')}
    />
  );
}

/**
 * Example 3: Usage without login link
 */
export function RegisterWithoutLoginLinkExample() {
  return (
    <RegisterForm
      showLoginLink={false}
      onSuccess={async (data) => {
        console.log('User registered:', data);
        // Handle registration
      }}
    />
  );
}

/**
 * Example 4: Integration with authentication context
 */
export function RegisterWithAuthContextExample() {
  const router = useRouter();
  // Assuming you have an auth context
  // const { register } = useAuth();

  return (
    <RegisterForm
      onSuccess={async (data) => {
        // Use your auth context's register method
        // await register(data.email, data.password, data.username);

        // Example: Direct API call
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Registration failed');

        router.push('/dashboard');
      }}
      onNavigateToLogin={() => router.push('/login')}
    />
  );
}
