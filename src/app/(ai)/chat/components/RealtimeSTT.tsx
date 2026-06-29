/**
 * RealtimeSTT Component
 * Full-screen speech-to-text transcription view with segments, volume bars, and meeting minutes
 */

"use client";

import { useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SummarizeIcon from "@mui/icons-material/Summarize";
import MicIcon from "@mui/icons-material/Mic";
import { useSTTWebSocket } from "../hooks/useSTTWebSocket";

interface RealtimeSTTProps {
  sttUrl: string;
  sttModel: string;
  sttLanguage: string;
}

export function RealtimeSTT({ sttUrl, sttModel, sttLanguage }: RealtimeSTTProps) {
  const {
    segments,
    currentText,
    currentTime,
    micActive,
    currentVolume,
    allText,
    totalChars,
    isGenerating,
    showMinutes,
    minutesContent,
    scrollRef,
    toggleRecording,
    copyAll,
    clearAll,
    generateMinutes,
    copyMinutes,
    setShowMinutes,
    volumeBarActive,
  } = useSTTWebSocket({ sttUrl, sttModel, sttLanguage });

  const canCopy = allText.length > 0;
  const canClear = segments.length > 0 || currentText.length > 0;

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, bgcolor: "background.default" }}>
      {/* Toolbar */}
      <Box
        sx={{
          shrink: 0,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {micActive ? (
            <>
              <Box component="span" sx={{ color: "error.main" }}>
                ●
              </Box>{" "}
              录音中 — {segments.length} 段 · {totalChars} 字
            </>
          ) : !segments.length ? (
            "点击麦克风开始录音"
          ) : (
            `${segments.length} 段 · ${totalChars} 字`
          )}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
            disabled={!canCopy}
            onClick={copyAll}
          >
            复制全部
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />}
            disabled={!canClear}
            onClick={clearAll}
            color="inherit"
          >
            清空
          </Button>
        </Stack>
      </Box>

      {/* Transcription Area */}
      <Box ref={scrollRef} sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        <Box sx={{ maxWidth: 720, mx: "auto", py: 3, px: 2 }}>
          {/* Empty State */}
          {!segments.length && !currentText && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 300,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mb: 2,
                  borderRadius: 3,
                  bgcolor: "grey.100",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: 1,
                  borderColor: "grey.200",
                }}
              >
                <MicIcon sx={{ fontSize: 40, color: "grey.400" }} />
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                点击麦克风开始实时转写
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
                语音将自动识别并显示为文字，支持连续说话
              </Typography>
            </Box>
          )}

          {/* Completed Segments */}
          {segments.map((seg, idx) => (
            <Box key={idx} sx={{ mb: 1, display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{
                  fontFamily: "monospace",
                  pt: 0.5,
                  shrink: 0,
                  width: 56,
                  textAlign: "right",
                  fontSize: "0.65rem",
                }}
              >
                {seg.time}
              </Typography>
              <Box sx={{ flex: 1 }}>
                {seg.speaker && (
                  <Typography
                    variant="caption"
                    color="primary.main"
                    fontWeight={500}
                    sx={{ mr: 0.5 }}
                  >
                    {seg.speaker}
                  </Typography>
                )}
                <Typography variant="body2" color="text.primary" sx={{ display: "inline", lineHeight: 1.7 }}>
                  {seg.text}
                </Typography>
              </Box>
            </Box>
          ))}

          {/* Current Text (Live) */}
          {currentText && (
            <Box sx={{ mb: 1, display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <Typography
                variant="caption"
                color="primary.main"
                sx={{
                  fontFamily: "monospace",
                  pt: 0.5,
                  shrink: 0,
                  width: 56,
                  textAlign: "right",
                  fontSize: "0.65rem",
                }}
              >
                {currentTime}
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body1"
                  color="text.primary"
                  fontWeight={500}
                  sx={{ display: "inline", lineHeight: 1.7 }}
                >
                  {currentText}
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      width: 2,
                      height: 16,
                      bgcolor: "primary.main",
                      animation: "pulse 1s infinite",
                      verticalAlign: "text-bottom",
                      ml: 0.5,
                      "@keyframes pulse": {
                        "0%, 100%": { opacity: 1 },
                        "50%": { opacity: 0 },
                      },
                    }}
                  />
                </Typography>
              </Box>
            </Box>
          )}

          {/* Waiting for first sentence */}
          {micActive && !currentText && !segments.length && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                {[0, 150, 300].map((delay) => (
                  <Box
                    key={delay}
                    sx={{
                      width: 6,
                      height: 6,
                      bgcolor: "grey.400",
                      borderRadius: "50%",
                      animation: `bounce 1.4s ${delay}ms infinite both`,
                      "@keyframes bounce": {
                        "0%, 80%, 100%": { transform: "scale(0)" },
                        "40%": { transform: "scale(1)" },
                      },
                    }}
                  />
                ))}
                <Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>
                  正在聆听...
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>

      {/* Bottom Recording Controls */}
      <Box
        sx={{
          shrink: 0,
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          px: 2,
          py: 2,
        }}
      >
        <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
          {/* Meeting Minutes Button */}
          <Button
            variant="outlined"
            color="success"
            size="small"
            startIcon={
              isGenerating ? undefined : <SummarizeIcon sx={{ fontSize: 16 }} />
            }
            disabled={!canCopy || isGenerating}
            onClick={generateMinutes}
          >
            {isGenerating ? "生成中..." : "整理会议纪要"}
          </Button>

          {/* Mic Button */}
          <IconButton
            onClick={toggleRecording}
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: micActive ? "error.main" : "primary.main",
              color: "white",
              boxShadow: micActive
                ? "0 4px 20px rgba(239,68,68,0.4)"
                : "0 4px 20px rgba(0,0,0,0.15)",
              "&:hover": {
                bgcolor: micActive ? "error.dark" : "primary.dark",
              },
              position: "relative",
            }}
          >
            {micActive ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 3,
                      borderRadius: 1,
                      bgcolor: "white",
                      height: volumeBarActive(i) ? 20 : 6,
                      transition: "height 0.1s",
                    }}
                  />
                ))}
              </Box>
            ) : (
              <MicIcon sx={{ fontSize: 28 }} />
            )}
            {micActive && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: 2,
                  borderColor: "error.light",
                  animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                  "@keyframes ping": {
                    "75%, 100%": { transform: "scale(1.3)", opacity: 0 },
                  },
                }}
              />
            )}
          </IconButton>

          <Typography
            variant="body2"
            sx={{ minWidth: 80, color: micActive ? "error.main" : "text.disabled" }}
          >
            {micActive ? "录音中" : "开始录音"}
          </Typography>
        </Stack>
      </Box>

      {/* Meeting Minutes Dialog */}
      <Dialog
        open={showMinutes}
        onClose={() => setShowMinutes(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          会议纪要
          <Button size="small" startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />} onClick={copyMinutes}>
            复制
          </Button>
        </DialogTitle>
        <DialogContent>
          {isGenerating && !minutesContent ? (
            <Typography color="text.disabled" textAlign="center" py={4}>
              正在整理会议纪要...
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8, color: "text.primary" }}
            >
              {minutesContent}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
