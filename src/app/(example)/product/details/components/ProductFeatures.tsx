import { Box, Stack, Typography } from "@mui/material";
import {
  VerifiedOutlined,
  CachedOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";
import type { ProductFeature } from "../data";

interface ProductFeaturesProps {
  features: ProductFeature[];
}

export function ProductFeatures({ features }: ProductFeaturesProps) {
  const icons = [
    <VerifiedOutlined key="verified" sx={{ fontSize: 40 }} />,
    <CachedOutlined key="cached" sx={{ fontSize: 40 }} />,
    <WorkspacePremiumOutlined key="premium" sx={{ fontSize: 40 }} />,
  ];

  return (
    <Box sx={{ py: 6 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 4, md: 8 }}
        justifyContent="center"
      >
        {features.map((feature, index) => (
          <Stack key={index} alignItems="center" spacing={2} sx={{ flex: 1 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icons[index]}
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, textAlign: "center" }}
            >
              {feature.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", maxWidth: 280 }}
            >
              {feature.description}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
