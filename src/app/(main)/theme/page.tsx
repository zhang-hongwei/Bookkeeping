"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  IconButton,
  Chip,
  Stack,
  Paper,
  alpha,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PaletteIcon from "@mui/icons-material/Palette";
import { useRouter } from "next/navigation";
import { useThemeCreatorStore, useThemeCreatorActions } from "@/store/mui-theme-creator/store";
import type { SavedTheme } from "@/store/mui-theme-creator/types";

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
  padding: theme.spacing(4),
}));

const HeaderSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: (theme.shape.borderRadius as number) * 2,
}));

const ThemeCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: theme.transitions.create(["transform", "box-shadow"], {
    duration: theme.transitions.duration.shorter,
  }),
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const CreateCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "280px",
  border: `2px dashed ${theme.palette.divider}`,
  background: alpha(theme.palette.primary.main, 0.02),
  cursor: "pointer",
  transition: theme.transitions.create(["transform", "border-color", "background"], {
    duration: theme.transitions.duration.shorter,
  }),
  "&:hover": {
    transform: "translateY(-4px)",
    borderColor: theme.palette.primary.main,
    background: alpha(theme.palette.primary.main, 0.08),
  },
}));

const ColorPreview = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ColorChip = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'chipColor',
})<{ chipColor: string }>(({ chipColor }) => ({
  width: 40,
  height: 40,
  borderRadius: "8px",
  backgroundColor: chipColor,
  border: "2px solid rgba(0,0,0,0.1)",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
}));

export default function ThemeManagementPage() {
  const router = useRouter();
  const savedThemes = useThemeCreatorStore((state) => state.savedThemes);
  const { loadSavedTheme, removeSavedTheme } = useThemeCreatorActions();

  const handleCreateTheme = () => {
    router.push("/create");
  };

  const handleEditTheme = (themeId: string) => {
    loadSavedTheme(themeId);
    router.push("/create");
  };

  const handleDeleteTheme = (themeId: string, themeName: string) => {
    if (window.confirm(`确定要删除主题 "${themeName}" 吗？`)) {
      removeSavedTheme(themeId);
    }
  };

  const themesArray = Object.values(savedThemes);

  const getThemeColors = (theme: SavedTheme) => {
    const colors: string[] = [];
    const palette = theme.themeOptions.palette;

    if (palette?.primary && typeof palette.primary === 'object' && 'main' in palette.primary) {
      colors.push(palette.primary.main as string);
    }
    if (palette?.secondary && typeof palette.secondary === 'object' && 'main' in palette.secondary) {
      colors.push(palette.secondary.main as string);
    }
    if (palette?.error && typeof palette.error === 'object' && 'main' in palette.error) {
      colors.push(palette.error.main as string);
    }
    return colors;
  };

  return (
    <PageContainer>
      <Container maxWidth="xl">
        {/* Header Section */}
        <HeaderSection elevation={4}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                🎨 主题管理
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                管理和创建您的 Material-UI 主题
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateTheme}
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.3)",
                },
              }}
            >
              创建新主题
            </Button>
          </Stack>
        </HeaderSection>

        {/* Themes Grid */}
        <Grid container spacing={3}>
          {/* Create New Theme Card */}
          {/* @ts-ignore - Grid2 API in MUI v7 */}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <CreateCard elevation={0} onClick={handleCreateTheme}>
              <AddIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
              <Typography variant="h6" color="primary" fontWeight="medium">
                创建新主题
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                开始设计您的自定义主题
              </Typography>
            </CreateCard>
          </Grid>

          {/* Theme Cards */}
          {themesArray.map((theme) => (
            // @ts-ignore - Grid2 API in MUI v7
            <Grid key={theme.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ThemeCard elevation={2}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <PaletteIcon color="primary" />
                    <Typography variant="h6" component="h2" fontWeight="medium">
                      {theme.name}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    最后更新: {new Date(theme.lastUpdated).toLocaleDateString("zh-CN")}
                  </Typography>

                  {/* Color Preview */}
                  <ColorPreview>
                    {getThemeColors(theme).map((color, index) => (
                      <ColorChip key={index} chipColor={color} />
                    ))}
                  </ColorPreview>

                  {/* Fonts */}
                  {theme.fonts && theme.fonts.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        字体:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                        {theme.fonts.slice(0, 2).map((font) => (
                          <Chip
                            key={font}
                            label={font}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {theme.fonts.length > 2 && (
                          <Chip
                            label={`+${theme.fonts.length - 2}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditTheme(theme.id)}
                    variant="contained"
                  >
                    编辑
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteTheme(theme.id, theme.name)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </ThemeCard>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {themesArray.length === 0 && (
          <Paper
            sx={{
              p: 8,
              textAlign: "center",
              mt: 4,
            }}
          >
            <PaletteIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              还没有保存的主题
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              点击"创建新主题"按钮开始设计您的第一个主题
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateTheme}
            >
              创建新主题
            </Button>
          </Paper>
        )}
      </Container>
    </PageContainer>
  );
}
