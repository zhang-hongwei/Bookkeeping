import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { TimelineStore } from "./types";
import { TimelineInitialState } from "./initialState";
import { createTimelineActions } from "./actions";

export const useTimelineStore = create<TimelineStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...TimelineInitialState,
        ...createTimelineActions(set, get),
      }),
      {
        name: "timeline-store",
        partialize: (state) => ({
          items: state.items,
          groups: state.groups
        }),
      }
    ),
    { name: "timeline-store" }
  )
);