import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { DIFY_BASE_URL, DIFY_TOKEN } from "./config";

// --- Types ---

export type PageType =
  | "ai"
  | "auth"
  | "example"
  | "main"
  | "tools"
  | "unknown";

export interface AIContextPage {
  url: string;
  route: string;
  title: string;
  pageType: PageType;
}

export interface AIContextUser {
  id: string;
  role: string;
  name: string;
}

export interface AIContextState {
  page: AIContextPage;
  user: AIContextUser | null;
}

export interface AIContextActions {
  updatePageContext: (route: string) => void;
  updateUserContext: (user: AIContextUser | null) => void;
  reset: () => void;
}

export type AIContextStore = AIContextState & AIContextActions;

// --- Helpers ---

export function detectPageType(route: string): PageType {
  // Route groups are not in the URL, so we detect by known paths
  if (route === "/chat") return "ai";

  if (
    route.startsWith("/login") ||
    route.startsWith("/signup") ||
    route.startsWith("/reset-password")
  )
    return "auth";

  if (route.startsWith("/theme")) return "main";

  if (
    route.startsWith("/analytics") ||
    route.startsWith("/banking") ||
    route.startsWith("/blog")
  )
    return "example";

  // Most routes in this app are tools
  if (route === "/" || route.startsWith("/")) return "tools";

  return "unknown";
}

// --- Initial State ---

const initialPage: AIContextPage = {
  url: "",
  route: "",
  title: "",
  pageType: "unknown",
};

// --- Store ---

export const useAIContextStore = create<AIContextStore>()(
  devtools(
    (set) => ({
      page: initialPage,
      user: null,

      updatePageContext: (route: string) => {
        set(
          {
            page: {
              url: window.location.href,
              route,
              title: document.title,
              pageType: detectPageType(route),
            },
          },
          false,
          "ai-context/updatePageContext",
        );
      },

      updateUserContext: (user) => {
        set({ user }, false, "ai-context/updateUserContext");
      },

      reset: () => {
        set({ page: initialPage, user: null }, false, "ai-context/reset");
      },
    }),
    { name: "ai-context-store", enabled: process.env.NODE_ENV === "development" },
  ),
);

// --- Config Builder ---

export function buildDifyChatbotConfig(state: AIContextState) {
  return {
    token: DIFY_TOKEN,
    baseUrl: DIFY_BASE_URL,
    inputs: {
      page_url: state.page.url,
      page_path: state.page.route,
      page_title: state.page.title,
      page_type: state.page.pageType,
    },
    systemVariables: {
      ...(state.user
        ? {
            user_id: state.user.id,
            user_role: state.user.role,
            user_name: state.user.name,
          }
        : {}),
    },
    userVariables: {},
  };
}
