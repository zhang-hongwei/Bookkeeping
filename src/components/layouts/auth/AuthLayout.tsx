"use client";

import { Box, Typography, alpha, useTheme, Grid } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <Grid
      container
      sx={{
        minHeight: "100vh",
        bgcolor: '#fff',
      }}
    >
      {/* Left Side - Preview/Showcase */}
      <Grid
        size={{ xs: 0, lg: 5, xl: 4.8 }}
        sx={{
          display: { xs: "none", lg: "flex" },
          backgroundColor: '#fff',
          px: { lg: 4, xl: 8 },
          py: { lg: 12, xl: 20 },
          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            borderRadius: 5,
            width: '100%',
            height: '100%',
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }}
        >
          {/* Decorative Background Elements */}
          <Box
            sx={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha("#fff", 0.1)} 0%, transparent 70%)`,
              filter: "blur(40px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -80,
              left: -80,
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha("#fff", 0.08)} 0%, transparent 70%)`,
              filter: "blur(40px)",
            }}
          />

          {/* Content */}
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              textAlign: "center",
              mb: { lg: 3, xl: 6 },
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { lg: "1.75rem", xl: "2.5rem" },
                }}
              >
                Effortlessly manage your API
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: alpha("#fff", 0.9),
                  fontWeight: 400,
                  maxWidth: { lg: 400, xl: 500 },
                  mx: "auto",
                  fontSize: { lg: "0.95rem", xl: "1.25rem" },
                }}
              >
                Access unified e-commerce data API and manage your team with our
                powerful dashboard.
              </Typography>
            </motion.div>
          </Box>

          {/* Dashboard Preview */}
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              width: "80%",
              maxWidth: { lg: 420, xl: 600 },
              mx: "auto",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ width: "100%" }}
            >
              <Box
                sx={{
                  bgcolor: "#fff",
                  borderRadius: { lg: 2, xl: 3 },
                  p: { lg: 2, xl: 3 },
                  boxShadow: `0 40px 100px ${alpha("#000", 0.3)}`,
                  overflow: "hidden",
                  width: "100%"
                }}
              >
                {/* Mockup Browser Controls */}
                <Box
                  sx={{
                    display: "flex",
                    gap: { lg: 0.75, xl: 1 },
                    mb: { lg: 2, xl: 2.5 },
                  }}
                >
                  <Box
                    sx={{
                      width: { lg: 10, xl: 12 },
                      height: { lg: 10, xl: 12 },
                      borderRadius: "50%",
                      bgcolor: "#FF5F57",
                    }}
                  />
                  <Box
                    sx={{
                      width: { lg: 10, xl: 12 },
                      height: { lg: 10, xl: 12 },
                      borderRadius: "50%",
                      bgcolor: "#FFBD2E",
                    }}
                  />
                  <Box
                    sx={{
                      width: { lg: 10, xl: 12 },
                      height: { lg: 10, xl: 12 },
                      borderRadius: "50%",
                      bgcolor: "#28CA42",
                    }}
                  />
                </Box>

                {/* Mockup Content */}
                <Box
                  component="img"
                  src="https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/illustrations/illustration-dashboard.webp"
                  alt="Dashboard preview"
                  sx={{
                    width: "100%",
                    height: "auto",
                    borderRadius: { lg: 1.5, xl: 2 },
                    display: "block",
                  }}
                />
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Grid>

      {/* Right Side - Login Form */}
      <Grid
        size={{ xs: 12, lg: 7, xl: 7.2 }}
        sx={{
          display: "flex",
          flexDirection: "column",
          bgcolor: "#ffffff",
          position: "relative",
          px: { xs: 3, sm: 4, md: 6, lg: 4 },
          py: { xs: 4, sm: 6, lg: 8 },
        }}
      >
        {/* Form Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: { xs: '100%', sm: 480, md: 520 },
            mx: "auto",
            width: "100%",
          }}
        >
          {children}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            mt: "auto",
            pt: 4,
            textAlign: "center",
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Copyright © 2025 Commerce API. All rights reserved.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
