"use client";

import { useState, useCallback } from "react";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = ".pdf,.docx,.xlsx,.txt,.md,.csv,.jpg,.jpeg,.png";

/**
 * File upload hook
 * Manages file attachment state with drag-and-drop support
 */
export function useFileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      addFiles(selected);
      // Reset input value so the same file can be selected again
      e.target.value = "";
    },
    [addFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer?.files || []);
      addFiles(dropped);
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return {
    files,
    isDragging,
    addFiles,
    removeFile,
    clearFiles,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    ALLOWED_TYPES,
  };
}

/** Format file size for display */
export function formatFileSize(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
