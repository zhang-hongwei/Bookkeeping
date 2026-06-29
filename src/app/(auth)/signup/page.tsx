"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Link as MuiLink,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Link from "next/link";
import Toast from "@/components/ui/Toast";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Register user
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Auto login after registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        Toast.error(
          "Registration successful but login failed, please login manually"
        );
        setTimeout(() => router.push("/login"), 2000);
      } else {
        Toast.success("Registration successful!");
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Registration failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {/* Header */}
      <Box>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Get started absolutely free
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{" "}
          <MuiLink
            component={Link}
            href="/login"
            variant="subtitle2"
            underline="hover"
            sx={{ fontWeight: 600 }}
          >
            Sign in
          </MuiLink>
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Sign up form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            fullWidth
            label="Name (optional)"
            type="text"
            value={formData.name}
            onChange={handleChange("name")}
            autoComplete="name"
          />

          <TextField
            fullWidth
            label="Email address"
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            autoComplete="email"
            required
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange("password")}
            placeholder="6+ characters"
            autoComplete="new-password"
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            label="Confirm password"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label="toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <IoEyeOffOutline />
                      ) : (
                        <IoEyeOutline />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="inherit"
            size="large"
            fullWidth
            disabled={loading}
            disableElevation
            sx={{
              bgcolor: "text.primary",
              color: "background.paper",
              "&:hover": {
                bgcolor: "text.secondary",
              },
            }}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
