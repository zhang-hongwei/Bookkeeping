import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { KnowledgeStore } from "./types";
import { knowledgeInitialState } from "./initialState";
import { createKnowledgeActions } from "./actions";

export const useKnowledgeStore = create<KnowledgeStore>()(
  devtools(
    (set, get) => ({
      ...knowledgeInitialState,
      ...createKnowledgeActions(set, get),
    }),
    {
      name: "knowledge-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
