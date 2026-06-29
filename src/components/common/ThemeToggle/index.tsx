"use client";

import { IconButton, Tooltip } from "@mui/material";
import { LightModeOutlined, DarkModeOutlined } from "@mui/icons-material";
import { useColorScheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

interface ThemeToggleProps {
  size?: "small" | "medium" | "large";
  showTooltip?: boolean;
}

export function ThemeToggle({ size = "medium", showTooltip = true }: ThemeToggleProps) {
  const { mode, setMode } = useColorScheme();
  const { t } = useTranslation("common");

  const handleThemeToggle = () => {
    setMode(mode === "dark" ? "light" : "dark");
  };

  const button = (
    <IconButton
      size={size}
      onClick={handleThemeToggle}
      sx={{
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      {mode === "dark" ? (
        <LightModeOutlined />
      ) : (
        <DarkModeOutlined />
      )}
    </IconButton>
  );

  if (!showTooltip) {
    return button;
  }

  return (
    <Tooltip title={mode === "dark" ? t("lightMode") : t("darkMode")}>
      {button}
    </Tooltip>
  );
}
