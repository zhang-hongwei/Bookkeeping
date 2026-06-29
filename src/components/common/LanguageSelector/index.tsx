"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import { useLocale } from "@/hooks/useLocale";
import { localeOptions, type Locale } from "@/const/locale";
import { useTranslation } from "react-i18next";

interface LanguageSelectorProps {
  size?: "small" | "medium" | "large";
  showTooltip?: boolean;
  showLabel?: boolean;
}

export function LanguageSelector({
  size = "medium",
  showTooltip = true,
  showLabel = false,
}: LanguageSelectorProps) {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation("common");
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangMenuAnchor(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangMenuAnchor(null);
  };

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    handleLangMenuClose();
  };

  const currentLocaleOption = localeOptions.find((opt) => opt.value === locale);

  const button = (
    <IconButton
      size={size}
      onClick={handleLangMenuOpen}
      sx={{
        "&:hover": { bgcolor: "action.hover" },
        fontSize: showLabel ? "inherit" : "20px",
      }}
    >
      {currentLocaleOption?.emoji || "🌐"}
      {showLabel && (
        <Typography variant="body2" sx={{ ml: 1 }}>
          {currentLocaleOption?.label}
        </Typography>
      )}
    </IconButton>
  );

  return (
    <>
      {showTooltip ? (
        <Tooltip title={currentLocaleOption?.label || t("language")}>
          {button}
        </Tooltip>
      ) : (
        button
      )}

      {/* Language Menu */}
      <Menu
        anchorEl={langMenuAnchor}
        open={Boolean(langMenuAnchor)}
        onClose={handleLangMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{ mt: 1 }}
        slotProps={{
          paper: {
            sx: { minWidth: 200 },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {t("selectLanguage")}
          </Typography>
        </Box>
        {localeOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleLanguageChange(option.value)}
            selected={option.value === locale}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              py: 1.5,
            }}
          >
            <Box component="span" sx={{ fontSize: "20px" }}>
              {option.emoji}
            </Box>
            <Typography variant="body2">{option.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
