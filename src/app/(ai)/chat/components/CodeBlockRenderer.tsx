"use client";

import { useState, useCallback, type ReactNode, useEffect, useRef } from "react";
import { Box, Stack, IconButton, Tooltip, ButtonBase } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import hljs from "highlight.js";
import { useThemeMode } from "@/hooks/useThemeMode";

const COLLAPSE_THRESHOLD = 15;

interface CodeBlockRendererProps {
  language: string;
  code: string;
  children?: ReactNode;
  className?: string;
}

export function CodeBlockRenderer({ language, code, children, className }: CodeBlockRendererProps) {
  const { isDark } = useThemeMode();
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const codeRef = useRef<HTMLElement>(null);

  const lineCount = code.split("\n").length;
  const canCollapse = lineCount > COLLAPSE_THRESHOLD;

  useEffect(() => {
    if (codeRef.current && !codeRef.current.dataset.highlighted) {
      try {
        hljs.highlightElement(codeRef.current);
      } catch {
        // already highlighted
      }
    }
  }, [code]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed(false);
  }, []);

  const handleToggle = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  const bgColor = isDark ? "#282c34" : "#fafafa";
  const headerBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const fadeGradient = isDark
    ? "linear-gradient(transparent, rgba(40,44,52,0.95))"
    : "linear-gradient(transparent, rgba(250,250,250,0.95))";

  return (
    <Box
      sx={{
        position: "relative",
        my: 1.5,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: bgColor,
        border: 1,
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        boxShadow: isDark
          ? "0 1px 3px rgba(0,0,0,0.3)"
          : "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 1.5,
          py: 0.5,
          borderBottom: 1,
          borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          bgcolor: headerBg,
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: 11,
            color: isDark ? "grey.400" : "grey.600",
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {language}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {canCollapse && (
            <Tooltip title={collapsed ? "展开" : "收起"}>
              <IconButton size="small" onClick={handleToggle} sx={{ color: "text.secondary" }}>
                {collapsed ? <ExpandMoreIcon fontSize="inherit" /> : <ExpandLessIcon fontSize="inherit" />}
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={copied ? "已复制" : "复制"}>
            <IconButton size="small" onClick={handleCopy} sx={{ color: "text.secondary" }}>
              {copied ? <CheckIcon fontSize="inherit" /> : <ContentCopyIcon fontSize="inherit" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>

      {/* Code body */}
      <Box
        sx={{
          ...(canCollapse && collapsed
            ? {
                maxHeight: 320,
                overflow: "hidden",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 48,
                  pointerEvents: "none",
                  background: fadeGradient,
                },
              }
            : {}),
        }}
      >
        <Box
          component="pre"
          sx={{
            m: 0,
            px: 1.5,
            py: 1,
            overflowX: "auto",
            fontSize: 12.5,
            lineHeight: 1.6,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace",
            "& .hljs": {
              bgcolor: "transparent !important",
              padding: "0 !important",
              background: "transparent !important",
            },
            // Light mode: bolder colors for readability
            ...(!isDark ? {
              "& .hljs-keyword": { color: "#d73a49" },
              "& .hljs-string": { color: "#032f62" },
              "& .hljs-number": { color: "#005cc5" },
              "& .hljs-comment": { color: "#6a737d", fontStyle: "italic" },
              "& .hljs-title": { color: "#6f42c1" },
              "& .hljs-title.class_": { color: "#6f42c1" },
              "& .hljs-title.function_": { color: "#6f42c1" },
              "& .hljs-function": { color: "#6f42c1" },
              "& .hljs-built_in": { color: "#e36209" },
              "& .hljs-literal": { color: "#005cc5" },
              "& .hljs-type": { color: "#d73a49" },
              "& .hljs-attr": { color: "#005cc5" },
              "& .hljs-selector-tag": { color: "#d73a49" },
              "& .hljs-selector-class": { color: "#6f42c1" },
              "& .hljs-selector-id": { color: "#005cc5" },
              "& .hljs-variable": { color: "#e36209" },
              "& .hljs-meta": { color: "#6a737d" },
              "& .hljs-tag": { color: "#22863a" },
              "& .hljs-name": { color: "#6f42c1" },
              "& .hljs-attribute": { color: "#005cc5" },
              "& .hljs-symbol": { color: "#005cc5" },
              "& .hljs-regexp": { color: "#032f62" },
              "& .hljs-property": { color: "#005cc5" },
              "& .hljs-addition": { color: "#22863a", bgcolor: "rgba(46,160,67,0.08)" },
              "& .hljs-deletion": { color: "#b31d28", bgcolor: "rgba(248,81,73,0.08)" },
            } : {}),
            "&::-webkit-scrollbar": { height: 4 },
            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
              borderRadius: 2,
            },
          }}
        >
          <code
            ref={codeRef}
            className={className}
            style={{ background: "transparent", padding: 0 }}
          >
            {code}
          </code>
        </Box>
      </Box>

      {/* Expand button */}
      {canCollapse && collapsed && (
        <ButtonBase
          onClick={handleExpand}
          sx={{
            width: "100%",
            py: 0.5,
            fontSize: 11,
            color: isDark ? "grey.400" : "grey.600",
            borderTop: 1,
            borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            position: "relative",
            zIndex: 2,
            bgcolor: bgColor,
            "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" },
          }}
        >
          展开全部 ({lineCount} 行)
        </ButtonBase>
      )}
    </Box>
  );
}

interface InlineCodeProps {
  children?: ReactNode;
}

export function InlineCode({ children }: InlineCodeProps) {
  const { isDark } = useThemeMode();
  return (
    <Box
      component="code"
      sx={{
        bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
        color: isDark ? "#e06c75" : "#c678dd",
        px: 0.5,
        py: 0.15,
        borderRadius: 0.5,
        fontSize: "0.85em",
        fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
      }}
    >
      {children}
    </Box>
  );
}
