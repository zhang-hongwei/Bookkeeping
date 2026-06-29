import { Card, CardContent, Typography, Button, Box } from "@mui/material";

export function WelcomeCard() {
  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        color: "white",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back 👋
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Jaydon Frankie
        </Typography>
        <Typography
          variant="body2"
          sx={{ opacity: 0.9, mb: 3, maxWidth: "60%" }}
        >
          If you are going to use a passage of Lorem Ipsum, you need to be sure
          there isn't anything.
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#00AB55",
            color: "white",
            textTransform: "none",
            px: 3,
            py: 1,
            "&:hover": { bgcolor: "#007B55" },
          }}
        >
          Go now
        </Button>
      </CardContent>
      <Box
        component="img"
        src="/assets/illustrations/illustration-dashboard.webp"
        sx={{
          position: "absolute",
          right: 40,
          bottom: 0,
          height: "80%",
          opacity: 0.9,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 50%, rgba(0, 171, 85, 0.1) 0%, transparent 50%)",
        }}
      />
    </Card>
  );
}
