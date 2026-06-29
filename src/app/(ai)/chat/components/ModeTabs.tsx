/**
 * ModeTabs Component
 * 4-mode tab switcher for AI chat (LLM, RAG, Device, STT)
 */

"use client";

import { ToggleButtonGroup, ToggleButton, Tooltip, Box } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RouterIcon from "@mui/icons-material/Router";
import MicIcon from "@mui/icons-material/Mic";
import type { ChatMode, ModeConfig } from "../types";

interface ModeTabsProps {
  activeMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const MODES: (ModeConfig & { icon: React.ReactElement })[] = [
  {
    key: "llm",
    label: "LLM",
    desc: "Direct LLM chat via backend proxy with file analysis",
    icon: <SmartToyIcon sx={{ fontSize: 18 }} />,
  },
  {
    key: "rag",
    label: "RAG",
    desc: "Knowledge-base retrieval-augmented Q&A with citations",
    icon: <MenuBookIcon sx={{ fontSize: 18 }} />,
  },
  {
    key: "device",
    label: "Device",
    desc: "IoT device control via Java backend",
    icon: <RouterIcon sx={{ fontSize: 18 }} />,
  },
  {
    key: "stt",
    label: "STT",
    desc: "Real-time speech-to-text with auto-segmentation",
    icon: <MicIcon sx={{ fontSize: 18 }} />,
  },
];

export function ModeTabs({ activeMode, onModeChange }: ModeTabsProps) {
  return (
    <Box sx={{ px: 1.5, pb: 1 }}>
      <ToggleButtonGroup
        value={activeMode}
        exclusive
        onChange={(_, value) => {
          if (value) onModeChange(value as ChatMode);
        }}
        size="small"
        fullWidth
        sx={{
          "& .MuiToggleButton-root": {
            flexDirection: "column",
            gap: 0.25,
            py: 0.75,
            px: 0.5,
            fontSize: "0.625rem",
            fontWeight: 500,
            border: "none",
            borderRadius: "8px !important",
            color: "text.disabled",
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
            },
            "&:hover": {
              bgcolor: "action.hover",
            },
          },
          bgcolor: "action.hover",
          borderRadius: 2,
          p: 0.5,
          gap: 0.25,
        }}
      >
        {MODES.map((mode) => (
          <Tooltip key={mode.key} title={mode.desc} arrow placement="bottom">
            <ToggleButton value={mode.key}>
              {mode.icon}
              {mode.label}
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
