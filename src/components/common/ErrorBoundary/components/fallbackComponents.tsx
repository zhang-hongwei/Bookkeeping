import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import type { FallbackProps } from "../types";

export function DefaultErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <Card
      role="alert"
      sx={{
        minHeight: 200,
        maxWidth: 600,
        mx: "auto",
        mt: 3,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            py: 2,
          }}
        >
          <WarningIcon
            sx={{
              fontSize: 48,
              color: "warning.main",
              mb: 2,
            }}
          />

          <Typography variant="h5" color="error" gutterBottom>
            出错了
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 400 }}
          >
            抱歉，应用程序遇到了意外错误。请尝试刷新页面或稍后再试。
          </Typography>

          <Accordion sx={{ width: "100%", mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ color: "primary.main" }}
            >
              <Typography>查看详细错误信息</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                component="pre"
                sx={{
                  backgroundColor: "grey.900",
                  color: "grey.100",
                  p: 2,
                  borderRadius: 1,
                  overflow: "auto",
                  fontSize: "0.75rem",
                  maxHeight: 200,
                  fontFamily: "monospace",
                }}
              >
                {error.stack}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={resetErrorBoundary}
          >
            重试
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <Alert
      severity="error"
      role="alert"
      action={
        <Button color="inherit" onClick={resetErrorBoundary}>
          重试
        </Button>
      }
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      加载失败
    </Alert>
  );
}

export function ProductionErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <Card
      role="alert"
      sx={{
        minHeight: 300,
        maxWidth: 600,
        mx: "auto",
        mt: 3,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            py: 4,
          }}
        >
          <SentimentVeryDissatisfiedIcon
            sx={{
              fontSize: 72,
              color: "grey.500",
              mb: 3,
            }}
          />

          <Typography
            variant="h4"
            color="text.primary"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            系统暂时无法使用
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: 500,
              lineHeight: 1.6,
            }}
          >
            我们检测到系统出现了异常，技术团队已经收到通知并正在处理中。请稍后再试，或联系管理员获取帮助。
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={resetErrorBoundary}
            >
              重新尝试
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => window.location.reload()}
            >
              刷新页面
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function createCustomErrorFallback(
  title: string = "出错了",
  description: string = "应用程序遇到了意外错误"
) {
  return function CustomErrorFallback({ resetErrorBoundary }: FallbackProps) {
    return (
      <Card
        role="alert"
        sx={{
          minHeight: 200,
          maxWidth: 500,
          mx: "auto",
          mt: 2,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              py: 2,
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 40,
                color: "error.main",
                mb: 2,
              }}
            />

            <Typography variant="h6" color="error" gutterBottom>
              {title}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {description}
            </Typography>

            <Button
              variant="contained"
              color="error"
              startIcon={<RefreshIcon />}
              onClick={resetErrorBoundary}
            >
              重试
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };
}
