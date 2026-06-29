"use client";

import { Box, Container, Typography, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import { UserForm, type UserFormData } from "@/components/forms/UserForm";
import { Toast } from "@/components/ui";

/**
 * Example page demonstrating UserForm usage
 * Creates a new user with full form validation
 */
export default function CreateUserPage() {
  const router = useRouter();

  const handleSubmit = async (data: UserFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("User data:", data);

    // In a real application, you would call your API here:
    // const response = await fetch("/api/users", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(data),
    // });

    Toast.success("User created successfully!");

    // Navigate to users list or user detail page
    // router.push("/users");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              Create New User
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill in the information below to create a new user account
            </Typography>
          </Box>

          {/* User Form */}
          <UserForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitText="Create User"
          />
        </Paper>
      </Container>
    </Box>
  );
}
