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
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { Toast } from '@/components/ui';

import { registerFormSchema, type RegisterFormData } from './schema';

export interface RegisterFormProps {
  /**
   * Callback function called when registration is successful
   */
  onSuccess?: (data: RegisterFormData) => void | Promise<void>;
  /**
   * Show link to login page
   * @default true
   */
  showLoginLink?: boolean;
  /**
   * Callback function for navigating to login page
   */
  onNavigateToLogin?: () => void;
}

/**
 * User registration form component
 *
 * Features:
 * - Username, email, password validation
 * - Password strength requirements
 * - Terms and conditions acceptance
 * - Password visibility toggle
 * - Form validation with Zod
 *
 * @example
 * ```tsx
 * <RegisterForm
 *   onSuccess={async (data) => {
 *     await registerUser(data);
 *     router.push('/dashboard');
 *   }}
 *   onNavigateToLogin={() => router.push('/login')}
 * />
 * ```
 */
export default function RegisterForm({
  onSuccess,
  showLoginLink = true,
  onNavigateToLogin,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      if (onSuccess) {
        await onSuccess(data);
      } else {
        // Default behavior - just show success message
        Toast.success('Registration successful!');
        reset();
      }
    } catch (error) {
      Toast.error(
        error instanceof Error ? error.message : 'Registration failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: '100%',
        maxWidth: 480,
        mx: 'auto',
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in the information below to get started
          </Typography>
        </Box>

        {/* Username Field */}
        <TextField
          label="Username"
          fullWidth
          autoComplete="username"
          error={!!errors.username}
          helperText={errors.username?.message}
          {...register('username')}
        />

        {/* Email Field */}
        <TextField
          label="Email Address"
          type="email"
          fullWidth
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
        />

        {/* Password Field */}
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          autoComplete="new-password"
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

        {/* Confirm Password Field */}
        <TextField
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          fullWidth
          autoComplete="new-password"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          {...register('confirmPassword')}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleToggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Terms and Conditions */}
        <FormControlLabel
          control={<Checkbox {...register('agreeToTerms')} />}
          label={
            <Typography variant="body2">
              I agree to the{' '}
              <Link href="/terms" target="_blank" underline="hover">
                Terms and Conditions
              </Link>
            </Typography>
          }
        />
        {errors.agreeToTerms && (
          <Typography variant="caption" color="error" sx={{ mt: -2, ml: 4 }}>
            {errors.agreeToTerms.message}
          </Typography>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isSubmitting}
          sx={{ mt: 2 }}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>

        {/* Login Link */}
        {showLoginLink && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component="button"
                type="button"
                onClick={onNavigateToLogin}
                underline="hover"
                sx={{ cursor: 'pointer' }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
