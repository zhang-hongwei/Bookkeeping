"use client";

import { Grid, Paper, Typography, Box, Button, TextField, MenuItem, Stack, Chip, Divider } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageOutlined, TranslateOutlined } from "@mui/icons-material";

export default function I18nDemoPage() {
  const { t, i18n } = useTranslation("i18n-demo");
  const [name, setName] = useState("John");
  const [count, setCount] = useState(3);
  const [gender, setGender] = useState<"male" | "female">("male");

  const currentLanguage = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLanguage === "zh-CN" ? "en-US" : "zh-CN";
    i18n.changeLanguage(newLang);
  };

  return (
    <Box>
      {/* Header Section */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <TranslateOutlined sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {t("header.title")}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {t("header.description")}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            onClick={toggleLanguage}
            startIcon={<LanguageOutlined />}
            sx={{
              bgcolor: "white",
              color: "#667eea",
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
            }}
          >
            {t("demo.changeLanguage")}
          </Button>
          <Chip
            label={t("demo.currentLanguage", { language: currentLanguage })}
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
          />
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Basic Translation */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              {t("sections.basic.title")}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  t("sections.basic.simpleText")
                </Typography>
                <Typography variant="body1">
                  {t("sections.basic.simpleText")}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  t("sections.basic.welcome")
                </Typography>
                <Typography variant="body1">
                  {t("sections.basic.welcome")}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Interpolation */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              {t("sections.interpolation.title")}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  t("sections.interpolation.greeting", &#123; name &#125;)
                </Typography>
                <Typography variant="body1">
                  {t("sections.interpolation.greeting", { name })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  t("sections.interpolation.itemCount", &#123; count &#125;)
                </Typography>
                <Typography variant="body1">
                  {t("sections.interpolation.itemCount", { count })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  t("sections.interpolation.template", &#123; username, role &#125;)
                </Typography>
                <Typography variant="body1">
                  {t("sections.interpolation.template", { username: "Alice", role: "Admin" })}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Pluralization */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              {t("sections.plural.title")}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  t("sections.plural.message", &#123; count &#125;)
                </Typography>
                <Typography variant="body1">
                  count = 1: {t("sections.plural.message", { count: 1 })}
                </Typography>
                <Typography variant="body1">
                  count = 5: {t("sections.plural.message", { count: 5 })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  t("sections.plural.item", &#123; count &#125;)
                </Typography>
                <Typography variant="body1">
                  count = 0: {t("sections.plural.item", { count: 0 })}
                </Typography>
                <Typography variant="body1">
                  count = 1: {t("sections.plural.item", { count: 1 })}
                </Typography>
                <Typography variant="body1">
                  count = 10: {t("sections.plural.item", { count: 10 })}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Nested Translation */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              {t("sections.nested.title")}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  sections.nested.user.*
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={t("sections.nested.user.profile")} size="small" />
                  <Chip label={t("sections.nested.user.settings")} size="small" />
                  <Chip label={t("sections.nested.user.privacy")} size="small" />
                </Stack>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  sections.nested.menu.*
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={t("sections.nested.menu.file")} size="small" color="primary" />
                  <Chip label={t("sections.nested.menu.edit")} size="small" color="primary" />
                  <Chip label={t("sections.nested.menu.view")} size="small" color="primary" />
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Context Translation */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              {t("sections.context.title")}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  t("sections.context.friend_male")
                </Typography>
                <Typography variant="body1">
                  {t("sections.context.friend_male")}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  t("sections.context.friend_female")
                </Typography>
                <Typography variant="body1">
                  {t("sections.context.friend_female")}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Component Examples */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              {t("sections.components.title")}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Button translations
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="contained" size="small">
                    {t("sections.components.button.submit")}
                  </Button>
                  <Button variant="outlined" size="small">
                    {t("sections.components.button.cancel")}
                  </Button>
                  <Button variant="outlined" size="small" color="success">
                    {t("sections.components.button.save")}
                  </Button>
                  <Button variant="outlined" size="small" color="error">
                    {t("sections.components.button.delete")}
                  </Button>
                </Stack>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Form labels
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="caption">
                    {t("sections.components.form.username")}
                  </Typography>
                  <Typography variant="caption">
                    {t("sections.components.form.email")}
                  </Typography>
                  <Typography variant="caption">
                    {t("sections.components.form.password")}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Interactive Demo */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, bgcolor: "#f8f9fa" }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              {t("demo.tryIt")}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label={t("demo.inputName")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  size="small"
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {t("sections.interpolation.greeting", { name })}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  select
                  label={t("demo.selectCount")}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  size="small"
                >
                  {[0, 1, 2, 3, 5, 10].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  ))}
                </TextField>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {t("sections.plural.item", { count })}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  select
                  label={t("demo.selectGender")}
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "male" | "female")}
                  size="small"
                >
                  <MenuItem value="male">{t("demo.male")}</MenuItem>
                  <MenuItem value="female">{t("demo.female")}</MenuItem>
                </TextField>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {t(`sections.context.friend_${gender}`)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
