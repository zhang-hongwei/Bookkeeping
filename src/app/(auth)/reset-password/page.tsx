"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link as MuiLink,
  Alert,
} from "@mui/material";
import Link from "next/link";
import Toast from "@/components/ui/Toast";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Toast.success("Password reset link sent to your email");
      setSent(true);
    } catch (err) {
      Toast.error("Failed to send reset link");
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
          Forgot your password?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please enter the email address associated with your account and we
          will email you a link to reset your password.
        </Typography>
      </Box>

      {sent && (
        <Alert severity="success">
          Password reset link has been sent to your email
        </Alert>
      )}

      {/* Reset password form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            fullWidth
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
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
            {loading ? "Sending..." : "Send reset link"}
          </Button>

          <MuiLink
            component={Link}
            href="/login"
            variant="body2"
            underline="hover"
            sx={{
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            Back to sign in
          </MuiLink>
        </Box>
      </Box>
    </Box>
  );
}
