import { create } from "zustand";
import debug from "debug";

const log = debug("design-tool-chat:conversations");

export type PendingAction =
  | { type: "select"; id: string }
  | { type: "new" }
  | { type: "delete"; id: string };

export interface ConversationItem {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationStore {
  conversations: ConversationItem[];
  activeConversationId: string | null;
  isLoading: boolean;
  sidebarOpen: boolean;
  pendingAction: PendingAction | null;
  settingsDialogOpen: boolean;

  fetchConversations: (visitorId: string) => Promise<void>;
  createConversation: (visitorId: string) => Promise<string>;
  selectConversation: (id: string | null) => void;
  deleteConversation: (id: string, visitorId: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  updateConversationTitleLocal: (id: string, title: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPendingAction: (action: PendingAction | null) => void;
  setSettingsDialogOpen: (open: boolean) => void;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isLoading: false,
  sidebarOpen: true,
  pendingAction: null,
  settingsDialogOpen: false,

  fetchConversations: async (visitorId: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/chat/conversations?visitorId=${visitorId}`);
      const data = await res.json();
      set({ conversations: data.conversations ?? [], isLoading: false });
      log("fetched %d conversations", data.conversations?.length ?? 0);
    } catch (err) {
      log("fetch error: %O", err);
      set({ isLoading: false });
    }
  },

  createConversation: async (visitorId: string) => {
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
      });
      const conv = await res.json();
      set((state) => ({
        conversations: [conv, ...state.conversations],
        activeConversationId: conv.id,
      }));
      log("created conversation %s", conv.id);
      return conv.id;
    } catch (err) {
      log("create error: %O", err);
      throw err;
    }
  },

  selectConversation: (id: string | null) => {
    set({ activeConversationId: id });
    if (id) {
      localStorage.setItem("chat_active_conversation_id", id);
    } else {
      localStorage.removeItem("chat_active_conversation_id");
    }
  },

  deleteConversation: async (id: string, visitorId: string) => {
    try {
      await fetch(`/api/chat/conversations/${id}?visitorId=${visitorId}`, {
        method: "DELETE",
      });
      const { conversations, activeConversationId } = get();
      const remaining = conversations.filter((c) => c.id !== id);
      const newActive =
        activeConversationId === id
          ? remaining[0]?.id ?? null
          : activeConversationId;
      set({ conversations: remaining, activeConversationId: newActive });
      if (newActive) {
        localStorage.setItem("chat_active_conversation_id", newActive);
      } else {
        localStorage.removeItem("chat_active_conversation_id");
      }
      log("deleted conversation %s", id);
    } catch (err) {
      log("delete error: %O", err);
      throw err;
    }
  },

  renameConversation: async (id: string, title: string) => {
    const visitorId = localStorage.getItem("chat_visitor_id");
    if (!visitorId) return;
    try {
      await fetch(`/api/chat/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, title }),
      });
      get().updateConversationTitleLocal(id, title);
      log("renamed conversation %s to '%s'", id, title);
    } catch (err) {
      log("rename error: %O", err);
      throw err;
    }
  },

  updateConversationTitleLocal: (id: string, title: string) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, title } : c
      ),
    }));
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  setPendingAction: (action) => set({ pendingAction: action }),
  setSettingsDialogOpen: (open) => set({ settingsDialogOpen: open }),
}));
