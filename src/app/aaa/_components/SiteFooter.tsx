import { Box, Typography, Container, Stack } from "@mui/material";
import { BRAND, COLOR, GRADIENT, LAYOUT } from "../_config/site";

/** Minimal site footer with brand mark and a build-credit line. */
export default function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        borderTop: `1px solid ${COLOR.border}`,
        py: 4,
        mt: 2,
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: LAYOUT.maxWidth }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: 1,
                background: GRADIENT.brand,
              }}
            />
            <Typography variant="body2" sx={{ color: COLOR.textDim }}>
              {BRAND.name} · {BRAND.nameZh}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: COLOR.textFaint }}>
            © 2026 Design Tool · 使用 Next.js 16 + MUI v7 构建
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
