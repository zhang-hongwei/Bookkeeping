import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { GitHubStore } from "./types";
import { githubInitialState } from "./initialState";
import { createGitHubActions } from "./actions";

export const useGitHubStore = create<GitHubStore>()(
  devtools(
    persist(
      (set, get, api) => ({
        ...githubInitialState,
        ...createGitHubActions()(set, get, api),
      }),
      {
        name: "github-store",
        // 持久化选中的仓库和报告配置
        partialize: (state) => ({
          selectedRepos: state.selectedRepos,
          reports: state.reports,
          config: state.config,
        }),
      }
    ),
    {
      name: "github-store",
    }
  )
);

export default useGitHubStore;