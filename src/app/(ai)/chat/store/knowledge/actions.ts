import type { KnowledgeStore } from "./types";
import debug from "debug";

const log = debug("design-tool-chat:knowledge");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createKnowledgeActions = (set: any, get: any): Omit<KnowledgeStore, keyof typeof import("./initialState").knowledgeInitialState> => ({
  fetchKnowledgeBases: async (ragUrl: string) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/knowledge?ragUrl=${encodeURIComponent(ragUrl)}`);
      if (res.ok) {
        const data = await res.json();
        const knowledgeBases = data.knowledge_bases || data || [];
        set({ knowledgeBases });
        // Auto-select all KBs with documents if none selected yet
        const readyKbs = knowledgeBases.filter(
          (kb: { chunk_count?: number; document_count?: number }) =>
            (kb.chunk_count ?? 0) > 0 || (kb.document_count ?? 0) > 0
        );
        if (readyKbs.length > 0 && get().selectedKbIds.length === 0) {
          set({ selectedKbIds: readyKbs.map((kb: { id: string }) => kb.id) });
        }
      }
    } catch (e) {
      log("fetch knowledge bases error: %O", e);
    } finally {
      set({ loading: false });
    }
  },

  createKnowledgeBase: async (ragUrl: string, name: string, description: string) => {
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ragUrl, name, description }),
      });
      if (res.ok) {
        await get().fetchKnowledgeBases(ragUrl);
        return true;
      }
      return false;
    } catch (e) {
      log("create KB error: %O", e);
      return false;
    }
  },

  deleteKnowledgeBase: async (ragUrl: string, kbId: string) => {
    try {
      const res = await fetch(
        `/api/knowledge/${kbId}?ragUrl=${encodeURIComponent(ragUrl)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        await get().fetchKnowledgeBases(ragUrl);
        set((s: KnowledgeStore) => ({ selectedKbIds: s.selectedKbIds.filter((id) => id !== kbId) }));
        return true;
      }
      return false;
    } catch (e) {
      log("delete KB error: %O", e);
      return false;
    }
  },

  fetchDocuments: async (ragUrl: string, kbId: string) => {
    set({ currentKbId: kbId });
    try {
      const res = await fetch(
        `/api/knowledge/${kbId}/documents?ragUrl=${encodeURIComponent(ragUrl)}`
      );
      if (res.ok) {
        const data = await res.json();
        set({ documents: data.documents || data || [] });
      }
    } catch (e) {
      log("fetch documents error: %O", e);
      set({ documents: [] });
    }
  },

  uploadDocument: async (
    ragUrl: string,
    kbId: string,
    file: File,
    onProgress?: (pct: number) => void
  ) => {
    const formData = new FormData();
    formData.append("ragUrl", ragUrl);
    formData.append("files", file);

    return new Promise<boolean>((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          get().fetchDocuments(ragUrl, kbId);
          // Auto-select this KB after upload
          if (!get().selectedKbIds.includes(kbId)) {
            set((s: KnowledgeStore) => ({ selectedKbIds: [...s.selectedKbIds, kbId] }));
          }
          resolve(true);
        } else {
          log("upload failed: %d", xhr.status);
          resolve(false);
        }
      });

      xhr.addEventListener("error", () => {
        log("upload network error");
        resolve(false);
      });

      xhr.open("POST", `/api/knowledge/${kbId}/documents`);
      xhr.send(formData);
    });
  },

  deleteDocument: async (ragUrl: string, kbId: string, docId: string) => {
    try {
      const res = await fetch(
        `/api/knowledge/${kbId}/documents/${docId}?ragUrl=${encodeURIComponent(ragUrl)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        await get().fetchDocuments(ragUrl, kbId);
        return true;
      }
      return false;
    } catch (e) {
      log("delete document error: %O", e);
      return false;
    }
  },

  setSelectedKbIds: (ids: string[]) => set({ selectedKbIds: ids }),
  setCurrentKbId: (id: string | null) => set({ currentKbId: id }),
  reset: () => set({ knowledgeBases: [], selectedKbIds: [], currentKbId: null, documents: [] }),
});
