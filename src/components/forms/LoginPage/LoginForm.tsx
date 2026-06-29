'use client';

import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Box,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Link,
  InputAdornment,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { Toast } from '@/components/ui';

import { loginFormSchema, type LoginFormData } from './schema';

export interface LoginFormProps {
  /**
   * Callback function called when login is successful
   */
  onSuccess?: (data: LoginFormData) => void | Promise<void>;
  /**
   * Show link to registration page
   * @default true
   */
  showRegisterLink?: boolean;
  /**
   * Show forgot password link
   * @default true
   */
  showForgotPassword?: boolean;
  /**
   * Show remember me checkbox
   * @default true
   */
  showRememberMe?: boolean;
  /**
   * Callback function for navigating to registration page
   */
  onNavigateToRegister?: () => void;
  /**
   * Callback function for navigating to forgot password page
   */
  onNavigateToForgotPassword?: () => void;
}

/**
 * Login form component
 *
 * Features:
 * - Email and password validation
 * - Password visibility toggle
 * - Remember me option
 * - Forgot password link
 * - Registration link
 * - Form validation with Zod
 *
 * @example
 * ```tsx
 * <LoginForm
 *   onSuccess={async (data) => {
 *     await loginUser(data);
 *     router.push('/dashboard');
 *   }}
 *   onNavigateToRegister={() => router.push('/register')}
 *   onNavigateToForgotPassword={() => router.push('/forgot-password')}
 * />
 * ```
 */
export default function LoginForm({
  onSuccess,
  showRegisterLink = true,
  showForgotPassword = true,
  showRememberMe = true,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      if (onSuccess) {
        await onSuccess(data);
      } else {
        // Default behavior - just show success message
        Toast.success('Login successful!');
      }
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: '100%',
        maxWidth: 400,
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your account to continue
          </Typography>
        </Box>

        {/* Email Field */}
        <TextField
          label="Email Address"
          type="email"
          fullWidth
          autoComplete="email"
          autoFocus
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
        />

        {/* Password Field */}
        <Box>
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register('password')}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* Remember Me & Forgot Password */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {showRememberMe && (
            <FormControlLabel
              control={<Checkbox {...register('rememberMe')} size="small" />}
              label={
                <Typography variant="body2" color="text.secondary">
                  Remember me
                </Typography>
              }
            />
          )}
          {showForgotPassword && (
            <Link
              component="button"
              type="button"
              onClick={onNavigateToForgotPassword}
              variant="body2"
              underline="hover"
              sx={{ cursor: 'pointer', ml: 'auto' }}
            >
              Forgot password?
            </Link>
          )}
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isSubmitting}
          sx={{ mt: 1 }}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>

        {/* Divider */}
        {showRegisterLink && (
          <>
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Register Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={onNavigateToRegister}
                  underline="hover"
                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
}
