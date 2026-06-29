"use client";

import { motion } from "framer-motion";
import { Box, Grid, Typography, Container, Stack } from "@mui/material";
import Link from "next/link";
import { ArrowOutwardOutlined } from "@mui/icons-material";
import { COLOR, LAYOUT } from "../_config/site";
import { TOOL_CATEGORIES } from "../_config/tools";
import { EASE_OUT, viewportOnce } from "../_lib/motion";
import SectionHeading from "./SectionHeading";

export default function ToolsShowcase() {
  return (
    <Box
      component="section"
      id="tools"
      sx={{ position: "relative", py: LAYOUT.sectionPy }}
    >
      <Container maxWidth={false} sx={{ maxWidth: LAYOUT.maxWidth }}>
        <SectionHeading
          eyebrow="工具矩阵"
          title="40+ 设计工具，按需取用"
          subtitle="涵盖 AI 对话、配色、渐变、视觉效果、布局与 MUI 主题设计 —— 点击卡片即刻体验。"
        />
        <Stack spacing={{ xs: 5, md: 7 }}>
          {TOOL_CATEGORIES.map((cat) => (
            <Box key={cat.key}>
              {/* category header */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ mb: 2.5 }}
              >
                <Stack
                  sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    color: "#C684FF",
                    bgcolor: "rgba(198,132,255,0.12)",
                    border: "1px solid rgba(198,132,255,0.25)",
                    "& .MuiSvgIcon-root": { fontSize: 19 },
                  }}
                >
                  {cat.icon}
                </Stack>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: COLOR.text }}
                >
                  {cat.label}
                </Typography>
                <Box
                  sx={{ flex: 1, height: "1px", bgcolor: COLOR.border }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: COLOR.textFaint }}
                >
                  {cat.tools.length} 工具
                </Typography>
              </Stack>

              {/* tools grid */}
              <Grid container spacing={2}>
                {cat.tools.map((t, i) => (
                  <Grid key={t.path} size={{ xs: 12, sm: 6, md: 4 }}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={viewportOnce}
                      transition={{
                        duration: 0.5,
                        ease: EASE_OUT,
                        delay: (i % 3) * 0.07,
                      }}
                      style={{ height: "100%" }}
                    >
                      <Box
                        component={Link}
                        href={t.path}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.75,
                          height: "100%",
                          p: 2.5,
                          borderRadius: 3,
                          textDecoration: "none",
                          color: "inherit",
                          bgcolor: "rgba(255,255,255,0.03)",
                          border: `1px solid ${COLOR.border}`,
                          transition:
                            "transform .22s ease, border-color .22s ease, background-color .22s ease",
                          "&:hover": {
                            transform: "translateY(-3px)",
                            borderColor: COLOR.borderHover,
                            bgcolor: "rgba(255,255,255,0.06)",
                            "& .tool-arrow": {
                              opacity: 1,
                              transform: "translate(2px, -2px)",
                            },
                          },
                        }}
                      >
                        <Stack
                          sx={{
                            alignItems: "center",
                            justifyContent: "center",
                            width: 38,
                            height: 38,
                            borderRadius: 1.5,
                            flexShrink: 0,
                            color: "#9DB8FF",
                            bgcolor: "rgba(0,166,255,0.1)",
                            "& .MuiSvgIcon-root": { fontSize: 20 },
                          }}
                        >
                          {t.icon}
                        </Stack>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              sx={{ color: COLOR.text }}
                            >
                              {t.title}
                            </Typography>
                            <ArrowOutwardOutlined
                              className="tool-arrow"
                              sx={{
                                fontSize: 16,
                                color: COLOR.textDim,
                                opacity: 0,
                                transition:
                                  "opacity .22s ease, transform .22s ease",
                              }}
                            />
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mt: 0.5,
                              color: COLOR.textFaint,
                              lineHeight: 1.5,
                            }}
                          >
                            {t.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
