import type { KnowledgeState } from "./types";

export const knowledgeInitialState: KnowledgeState = {
  knowledgeBases: [],
  selectedKbIds: [],
  currentKbId: null,
  documents: [],
  loading: false,
  uploading: false,
  uploadPercent: 0,
};
