import type { KnowledgeBase, KnowledgeDocument } from "../../types";

export interface KnowledgeState {
  knowledgeBases: KnowledgeBase[];
  selectedKbIds: string[];
  currentKbId: string | null;
  documents: KnowledgeDocument[];
  loading: boolean;
  uploading: boolean;
  uploadPercent: number;
}

export interface KnowledgeActions {
  fetchKnowledgeBases: (ragUrl: string) => Promise<void>;
  createKnowledgeBase: (ragUrl: string, name: string, description: string) => Promise<boolean>;
  deleteKnowledgeBase: (ragUrl: string, kbId: string) => Promise<boolean>;
  fetchDocuments: (ragUrl: string, kbId: string) => Promise<void>;
  uploadDocument: (
    ragUrl: string,
    kbId: string,
    file: File,
    onProgress?: (pct: number) => void
  ) => Promise<boolean>;
  deleteDocument: (ragUrl: string, kbId: string, docId: string) => Promise<boolean>;
  setSelectedKbIds: (ids: string[]) => void;
  setCurrentKbId: (id: string | null) => void;
  reset: () => void;
}

export type KnowledgeStore = KnowledgeState & KnowledgeActions;
