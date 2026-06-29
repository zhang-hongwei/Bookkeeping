import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link as MuiLink,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  alpha,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Login form component
 * Contains email, password fields, remember me checkbox, and submit button
 */
export function LoginForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <Box component="form" onSubmit={onSubmit} noValidate autoComplete="off">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 2.5 },
        }}
      >
        {/* Email Field */}
        <Box>
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{
              mb: { xs: 0.5, sm: 0.75 },
              fontSize: { xs: "0.813rem", sm: "0.875rem" },
            }}
          >
            Email
          </Typography>
          <TextField
            fullWidth
            placeholder="sellostore@company.com"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            autoComplete="email"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: alpha(theme.palette.background.default, 0.5),
                fontSize: { xs: "0.938rem", sm: "1rem" },
              },
              "& .MuiOutlinedInput-input": {
                py: { xs: 1.25, sm: 1.5 },
              },
            }}
          />
        </Box>

        {/* Password Field */}
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: { xs: 0.5, sm: 0.75 },
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ fontSize: { xs: "0.813rem", sm: "0.875rem" } }}
            >
              Password
            </Typography>
            <MuiLink
              component={Link}
              href="/reset-password"
              variant="body2"
              underline="none"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.813rem", md: "0.875rem" },
                color: theme.palette.primary.main,
                fontWeight: 500,
                whiteSpace: "nowrap",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Forgot Your Password?
            </MuiLink>
          </Box>
          <TextField
            fullWidth
            placeholder="Sellostore."
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoComplete="current-password"
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="toggle password visibility"
                      sx={{ p: { xs: 0.75, sm: 1 } }}
                    >
                      {showPassword ? (
                        <IoEyeOffOutline size={20} />
                      ) : (
                        <IoEyeOutline size={20} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: alpha(theme.palette.background.default, 0.5),
                fontSize: { xs: "0.938rem", sm: "1rem" },
              },
              "& .MuiOutlinedInput-input": {
                py: { xs: 1.25, sm: 1.5 },
              },
            }}
          />
        </Box>

        {/* Remember Me */}
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              size="small"
              sx={{
                "& .MuiSvgIcon-root": {
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                },
              }}
            />
          }
          label={
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.813rem", sm: "0.875rem" } }}
            >
              Remember Me
            </Typography>
          }
          sx={{ ml: -0.5 }}
        />

        {/* Login Button */}
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          sx={{
            py: { xs: 1.5, sm: 1.75, md: 2 },
            fontSize: { xs: "0.938rem", sm: "1rem" },
            fontWeight: 600,
            textTransform: "none",
            boxShadow: `0 8px 24px ${alpha(
              theme.palette.primary.main,
              0.25
            )}`,
            "&:hover": {
              boxShadow: `0 12px 32px ${alpha(
                theme.palette.primary.main,
                0.35
              )}`,
            },
          }}
        >
          Log In
        </Button>
      </Box>
    </Box>
  );
}
