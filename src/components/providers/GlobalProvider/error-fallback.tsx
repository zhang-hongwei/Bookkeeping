"use client";

import { Box, Button, Typography, Container } from "@mui/material";
import { HiArrowPath } from "react-icons/hi2";

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const handleReload = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        gap: 3,
      }}
    >
      <Box
        sx={{
          fontSize: "6rem",
          lineHeight: 1,
          color: "error.main",
        }}
      >
        ⚠️
      </Box>
      
      <Typography variant="h4" component="h1" gutterBottom>
        页面出现错误
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        抱歉，页面遇到了意外错误，请尝试重新加载页面
      </Typography>
      
      {error && process.env.NODE_ENV === "development" && (
        <Box
          sx={{
            p: 2,
            backgroundColor: "grey.100",
            borderRadius: 1,
            fontFamily: "monospace",
            fontSize: "0.875rem",
            maxWidth: "100%",
            overflow: "auto",
            textAlign: "left",
          }}
        >
          <Typography variant="caption" color="error.main">
            {error.message}
          </Typography>
        </Box>
      )}
      
      <Button
        variant="contained"
        startIcon={<HiArrowPath size={18} />}
        onClick={handleReload}
        size="large"
      >
        重新加载
      </Button>
    </Container>
  );
};

export default ErrorFallback;