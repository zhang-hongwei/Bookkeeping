import {
  Box,
  Stack,
  IconButton,

  Tooltip,

} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";

import { ImagePreviews } from "./ImagePreviews";
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  selectedImages: string[];
  onRemoveImage: (index: number) => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isRecording?: boolean;
  isTranscribing?: boolean;
  isLoading: boolean;
  onToggleRecording?: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /** When true, renders a more compact layout suitable for embed widgets */
  compact?: boolean;
}

export function ChatInput({
  input,
  setInput,
  selectedImages,
  onRemoveImage,
  onImageSelect,
  fileInputRef,
  isRecording,
  isTranscribing,
  isLoading,
  onToggleRecording,
  onSubmit,
  compact,
}: ChatInputProps) {
  const isSendDisabled = isLoading || (!input.trim() && selectedImages.length === 0);

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        px: compact ? '8px' : '8px',
        py: compact ? '8px' : '8px',
        flexShrink: 0,
        border: '1px solid rgba(156, 156, 156, 0.12)',
        borderRadius: 2,
        minHeight: 100,
        boxShadow: 10,
        overflow: 'visible',
        position: 'relative',
        display: 'grid',
        gridTemplateRow: '1fr 1fr 30px',
      }}
    >
      {selectedImages.length > 0 && (
        <ImagePreviews images={selectedImages} onRemove={onRemoveImage} />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={onImageSelect}
      />


      <TextareaAutosize
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !(e.nativeEvent as KeyboardEvent).isComposing) {
            e.preventDefault();
            const textarea = e.target as HTMLTextAreaElement;
            textarea.form?.requestSubmit();
            requestAnimationFrame(() => textarea.focus());
          }
        }}
        placeholder={compact ? "Type a message..." : "Type a message... (Shift+Enter for new line)"}
        disabled={isLoading}
        minRows={1}
        maxRows={compact ? 3 : 6}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          borderRadius: 3,
          padding: '8px',
          fontSize: '0.875rem',
          lineHeight: 1.43,
          width: '100%',
          resize: 'none',
          boxShadow: 'none',
        }}
      />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"

      >
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <Paperclip size={18} />
        </IconButton>

        <IconButton
          type="submit"
          disabled={isSendDisabled}
          size="small"
          sx={{
            cursor: isSendDisabled ? "not-allowed" : "pointer",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderRadius: '8px',
            transition: "background-color 0.3s",
            "&:hover": { bgcolor: "primary.dark" },
            "&.Mui-disabled": {
              bgcolor: "action.disabledBackground",
              color: "action.disabled",
            },
          }}
        >
          <Send size={16} />
        </IconButton>
      </Stack>
    </Box>
  );
}

interface VoiceToggleButtonProps {
  isRecording: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

function VoiceToggleButton({ isRecording, isDisabled, onToggle }: VoiceToggleButtonProps) {
  return (
    <Tooltip title={isRecording ? "Stop recording" : "Voice input"}>
      <IconButton
        onClick={onToggle}
        disabled={isDisabled}
        sx={{
          color: isRecording ? "error.main" : "grey.500",
          animation: isRecording ? "pulse 1.5s infinite" : "none",
          "@keyframes pulse": {
            "0%": { boxShadow: "0 0 0 0 rgba(239,68,68,0.5)" },
            "70%": { boxShadow: "0 0 0 10px rgba(239,68,68,0)" },
            "100%": { boxShadow: "0 0 0 0 rgba(239,68,68,0)" },
          },
        }}
      >
        {isRecording ? <MicOffIcon /> : <MicIcon />}
      </IconButton>
    </Tooltip>
  );
}
