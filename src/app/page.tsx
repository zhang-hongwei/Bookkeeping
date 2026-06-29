"use client";

import { Box, Card, CardActionArea, CardContent, Grid, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { useToolsNavData } from "./(tools)/_config/nav-config";

export default function Home() {
  const theme = useTheme();
  const navData = useToolsNavData();

  return (
    <Box
      sx={{
        height: "100vh",
        overflowY: "auto",
        px: 4,
        py: 6,
        maxWidth: 1200,
        mx: "auto",
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
      }}
    >
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Dev Tools
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        一组前端开发工具集合
      </Typography>

      <Grid container spacing={2}>
        {navData.map((tool) => (
          <Grid key={tool.path} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: "divider",
                height: 140,
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: theme.shadows[4],
                  transform: "translateY(-2px)",
                },
                // border: '1px solid red',

              }}
            >
              <CardActionArea component={Link} href={tool.path}

                sx={{
                  height: '100%'
                }}>
                <CardContent sx={{ p: 2.5, height: '100%' }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        "& .MuiSvgIcon-root": { fontSize: 20 },
                      }}
                    >
                      {tool.icon}
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {tool.title}
                    </Typography>
                  </Box>
                  {tool.description && (
                    <Typography variant="body2" color="text.secondary">
                      {tool.description}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
