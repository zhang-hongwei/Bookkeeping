/**
 * KnowledgeManager Component
 * Modal for managing documents in a knowledge base (upload, view, delete, chunk viewer)
 */

"use client";

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { KnowledgeDocument, DocumentChunk } from "../types";
import { formatFileSize } from "../hooks/useFileUpload";

const ALLOWED_TYPES = ".pdf,.docx,.xlsx,.txt,.md,.csv,.jpg,.jpeg,.png";

interface KnowledgeManagerProps {
  open: boolean;
  kbName: string;
  kbId: string;
  documents: KnowledgeDocument[];
  uploading: boolean;
  uploadPercent: number;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  onDeleteDoc: (docId: string) => void;
  fetchChunks: (kbId: string, docId: string) => Promise<DocumentChunk[]>;
}

export function KnowledgeManager({
  open,
  kbName,
  kbId,
  documents,
  uploading,
  uploadPercent,
  onClose,
  onUpload,
  onDeleteDoc,
  fetchChunks,
}: KnowledgeManagerProps) {
  const [dragHover, setDragHover] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{
    name: string;
    chunks: DocumentChunk[];
  } | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length) onUpload(files);
      e.target.value = "";
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      setDragHover(false);
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length) onUpload(files);
    },
    [onUpload]
  );

  const handleViewDoc = useCallback(
    async (doc: KnowledgeDocument) => {
      if (doc.status !== "ready") return;
      try {
        const chunks = await fetchChunks(kbId, doc.id);
        setViewingDoc({
          name: doc.file_name || doc.filename || doc.name || "Document",
          chunks: chunks || [],
        });
      } catch (e) {
        console.warn("Failed to load document chunks:", e);
      }
    },
    [kbId, fetchChunks]
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "success";
      case "processing":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "ready":
        return "就绪";
      case "processing":
        return "处理中";
      case "failed":
        return "失败";
      case "pending":
        return "等待中";
      default:
        return status || "未知";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        {kbName} - 文档管理
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ minHeight: 400 }}>
        {/* Upload Area */}
        <Box
          onClick={() => uploadInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragHover(true);
          }}
          onDragLeave={() => setDragHover(false)}
          onDrop={handleDrop}
          sx={{
            border: 2,
            borderStyle: "dashed",
            borderColor: dragHover ? "primary.main" : "grey.300",
            borderRadius: 2,
            p: 3,
            mb: 2,
            textAlign: "center",
            cursor: "pointer",
            bgcolor: dragHover ? "primary.50" : "transparent",
            transition: "all 0.2s",
          }}
        >
          <UploadFileIcon sx={{ fontSize: 36, color: "grey.400", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            点击或拖拽文件到此处上传
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
            支持 PDF, DOCX, XLSX, TXT, MD, CSV, PNG, JPG
          </Typography>
        </Box>

        <input
          ref={uploadInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES}
          onChange={handleFileSelect}
          hidden
        />

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                上传中...
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {uploadPercent}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={uploadPercent} />
          </Box>
        )}

        {/* Chunk Viewer */}
        {viewingDoc ? (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <IconButton size="small" onClick={() => setViewingDoc(null)}>
                <ArrowBackIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <DescriptionIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                {viewingDoc.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {viewingDoc.chunks.length} 段
              </Typography>
            </Box>
            <Box sx={{ maxHeight: 300, overflow: "auto" }}>
              {viewingDoc.chunks.length === 0 ? (
                <Typography variant="body2" color="text.disabled" textAlign="center" py={4}>
                  暂无内容
                </Typography>
              ) : (
                viewingDoc.chunks.map((chunk, ci) => (
                  <Box key={chunk.chunk_id} sx={{ bgcolor: "grey.50", borderRadius: 1, p: 1.5, mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Chip label={`#${ci + 1}`} size="small" sx={{ fontSize: "0.65rem" }} />
                      {chunk.section && (
                        <Typography variant="caption" color="primary.main" noWrap>
                          {chunk.section}
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: "0.8rem" }}
                    >
                      {chunk.text}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        ) : (
          /* Document List */
          <List disablePadding>
            {documents.length === 0 && !uploading && (
              <Typography variant="body2" color="text.disabled" textAlign="center" py={4}>
                暂无文档
              </Typography>
            )}
            {documents.map((doc) => (
              <ListItem
                key={doc.id}
                onClick={() => handleViewDoc(doc)}
                sx={{
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  mb: 0.5,
                  cursor: doc.status === "ready" ? "pointer" : "default",
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <DescriptionIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                </ListItemIcon>
                <ListItemText
                  primary={doc.file_name || doc.filename || doc.name}
                  secondary={
                    <>
                      {formatFileSize(doc.file_size || doc.size || 0)}
                      {doc.chunk_count != null && ` / ${doc.chunk_count} 段`}
                    </>
                  }
                  primaryTypographyProps={{ variant: "body2", noWrap: true }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
                <Chip
                  label={statusLabel(doc.status)}
                  size="small"
                  color={statusColor(doc.status) as "success" | "warning" | "error" | "default"}
                  sx={{ mr: 1, fontSize: "0.65rem" }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDoc(doc.id);
                    }}
                    sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
