"use client";

import { IconButton, Tooltip } from "@mui/material";
import { SettingsOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface SettingsButtonProps {
  size?: "small" | "medium" | "large";
  showTooltip?: boolean;
  onClick: () => void;
}

export function SettingsButton({
  size = "medium",
  showTooltip = true,
  onClick,
}: SettingsButtonProps) {
  const { t } = useTranslation("common");

  const button = (
    <IconButton
      size={size}
      onClick={onClick}
      sx={{
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <SettingsOutlined />
    </IconButton>
  );

  if (!showTooltip) {
    return button;
  }

  return <Tooltip title={t("settings")}>{button}</Tooltip>;
}
