'use client';

import { Box, Grid, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { RocketLaunch } from '@mui/icons-material';

import LoginForm, { type LoginFormProps } from './LoginForm';

export interface LoginPageProps extends LoginFormProps {
  /**
   * Website/Brand name
   * @default "Dev Tools"
   */
  brandName?: string;
  /**
   * Tagline or description shown on the left side
   * @default "Build faster, ship smarter"
   */
  tagline?: string;
  /**
   * Additional description text
   */
  description?: string;
  /**
   * Brand logo image URL or React element
   */
  logo?: React.ReactNode;
  /**
   * Background image URL for the left panel
   */
  backgroundImage?: string;
  /**
   * Background gradient colors for the left panel
   * @default ['#667eea', '#764ba2']
   */
  gradientColors?: [string, string];
}

/**
 * Login page component with left-right split layout
 *
 * Left side: Brand/Marketing content with logo, name, and tagline
 * Right side: Login form
 *
 * Features:
 * - Responsive design (stacks on mobile)
 * - Customizable branding
 * - Gradient or image background
 * - Full-height layout
 *
 * @example
 * ```tsx
 * <LoginPage
 *   brandName="My App"
 *   tagline="Welcome to the future"
 *   onSuccess={async (data) => {
 *     await loginUser(data);
 *     router.push('/dashboard');
 *   }}
 *   onNavigateToRegister={() => router.push('/register')}
 * />
 * ```
 */
export default function LoginPage({
  brandName = 'Dev Tools',
  tagline = 'Build faster, ship smarter',
  description = 'A comprehensive Next.js template with authentication, database, and UI components built-in.',
  logo,
  backgroundImage,
  gradientColors = ['#667eea', '#764ba2'],
  onSuccess,
  showRegisterLink,
  showForgotPassword,
  showRememberMe,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}: LoginPageProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const leftPanelBackground = backgroundImage
    ? {
      backgroundImage: `linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8)), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
    : {
      background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
    };

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Left Panel - Brand/Marketing */}
      {!isMobile && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              p: 6,
              position: 'relative',
              overflow: 'hidden',
              ...leftPanelBackground,
            }}
          >
            {/* Decorative elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            />

            {/* Content */}
            <Box
              sx={{
                maxWidth: 500,
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Logo */}
              {logo || (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 4,
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <RocketLaunch sx={{ fontSize: 48, color: 'white' }} />
                  </Box>
                </Box>
              )}

              {/* Brand Name */}
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '2rem', md: '3rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {brandName}
              </Typography>

              {/* Tagline */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 400,
                  mb: 2,
                  opacity: 0.95,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                }}
              >
                {tagline}
              </Typography>

              {/* Description */}
              {description && (
                <Typography
                  variant="body1"
                  sx={{
                    opacity: 0.9,
                    lineHeight: 1.8,
                    mt: 3,
                  }}
                >
                  {description}
                </Typography>
              )}

              {/* Features List */}
              <Box sx={{ mt: 6 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    flexWrap: 'wrap',
                  }}
                >
                  {['Fast', 'Secure', 'Reliable'].map((feature) => (
                    <Box
                      key={feature}
                      sx={{
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      )}

      {/* Right Panel - Login Form */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, sm: 4, md: 6 },
            bgcolor: 'background.default',
          }}
        >
          <Paper
            elevation={isMobile ? 0 : 1}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              width: '100%',
              maxWidth: 480,
              borderRadius: 2,
            }}
          >
            {/* Mobile: Show brand name */}
            {isMobile && (
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <RocketLaunch sx={{ fontSize: 36, color: 'white' }} />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {brandName}
                </Typography>
              </Box>
            )}

            <LoginForm
              onSuccess={onSuccess}
              showRegisterLink={showRegisterLink}
              showForgotPassword={showForgotPassword}
              showRememberMe={showRememberMe}
              onNavigateToRegister={onNavigateToRegister}
              onNavigateToForgotPassword={onNavigateToForgotPassword}
            />
          </Paper>
        </Box>
      </Grid>
    </Grid>
  );
}
