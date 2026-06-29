"use client";

import { useState, useRef, useEffect } from "react";
import {
  ListItemButton,
  ListItemText,
  IconButton,
  Box,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Modal from "@/components/ui/Modal";
import type { ConversationItem as ConversationItemType } from "../store/chat-conversations";

interface ConversationItemProps {
  conversation: ConversationItemType;
  isActive: boolean;
  visitorId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  visitorId,
  onSelect,
  onDelete,
  onRename,
}: ConversationItemProps) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title ?? "");
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editing]);

  const handleDoubleClick = () => {
    setEditTitle(conversation.title ?? "");
    setEditing(true);
  };

  const handleSaveEdit = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== conversation.title) {
      onRename(conversation.id, trimmed);
    }
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditTitle(conversation.title ?? "");
  };

  const handleDeleteClick = () => {
    Modal.confirm({
      content: `确定删除「${conversation.title || "New Chat"}」吗？`,
      onOk: () => onDelete(conversation.id),
      okText: "删除",
      cancelText: "取消",
    });
  };

  if (editing) {
    return (
      <Box sx={{ px: 1, py: 0.5 }}>
        <TextField
          inputRef={editRef}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveEdit();
            if (e.key === "Escape") handleCancelEdit();
          }}
          onBlur={handleSaveEdit}
          size="small"
          fullWidth
          autoFocus
          sx={{
            "& .MuiOutlinedInput-root": { fontSize: "0.875rem" },
          }}
        />
      </Box>
    );
  }

  return (
    <ListItemButton
      selected={isActive}
      onClick={() => onSelect(conversation.id)}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: 1,
        px: 1.5,
        py: 0.75,
        mb: 0.25,
        "&.Mui-selected": {
          bgcolor: "primary.main",
          color: "primary.contrastText",
          "&:hover": { bgcolor: "primary.dark" },
          "& .MuiIconButton-root": { color: "primary.contrastText" },
        },
      }}
    >
      <ListItemText
        primary={conversation.title || "New Chat"}
        primaryTypographyProps={{
          variant: "body2",
          noWrap: true,
          sx: { fontSize: "0.875rem" },
        }}
      />
      {hovered && (
        <Box sx={{ display: "flex", ml: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setEditTitle(conversation.title ?? "");
              setEditing(true);
            }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}
    </ListItemButton>
  );
}
