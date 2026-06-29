"use client";

import { useEffect, useCallback } from "react";
import { useKnowledgeStore } from "../store/knowledge";

/**
 * Convenience hook for knowledge base operations
 * Auto-fetches KBs on mount when ragUrl is available
 */
export function useKnowledgeBases(ragUrl: string) {
  const store = useKnowledgeStore();

  useEffect(() => {
    if (ragUrl) {
      store.fetchKnowledgeBases(ragUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ragUrl]);

  const refresh = useCallback(() => {
    if (ragUrl) {
      store.fetchKnowledgeBases(ragUrl);
    }
  }, [ragUrl, store]);

  return {
    knowledgeBases: store.knowledgeBases,
    selectedKbIds: store.selectedKbIds,
    loading: store.loading,
    refresh,
    setSelectedKbIds: store.setSelectedKbIds,
    createKnowledgeBase: (name: string, description: string) =>
      store.createKnowledgeBase(ragUrl, name, description),
    deleteKnowledgeBase: (kbId: string) =>
      store.deleteKnowledgeBase(ragUrl, kbId),
    fetchDocuments: (kbId: string) =>
      store.fetchDocuments(ragUrl, kbId),
    uploadDocument: (kbId: string, file: File, onProgress?: (pct: number) => void) =>
      store.uploadDocument(ragUrl, kbId, file, onProgress),
    deleteDocument: (kbId: string, docId: string) =>
      store.deleteDocument(ragUrl, kbId, docId),
  };
}
