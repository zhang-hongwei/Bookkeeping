import { TimelineActions, TimelineState, TimelineItem, TimelineGroup } from "./types";

export const createTimelineActions = (set: any, get: any): TimelineActions => ({
  setState: (newState: Partial<TimelineState>) => {
    set((state: TimelineState) => ({ ...state, ...newState }));
  },

  addItem: (item: Omit<TimelineItem, 'id'>) => {
    const newItem: TimelineItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    set((state: TimelineState) => ({
      ...state,
      items: [...state.items, newItem]
    }));
  },

  updateItem: (id: string, updatedItem: Partial<TimelineItem>) => {
    set((state: TimelineState) => ({
      ...state,
      items: state.items.map(item => 
        item.id === id ? { ...item, ...updatedItem } : item
      )
    }));
  },

  deleteItem: (id: string) => {
    set((state: TimelineState) => ({
      ...state,
      items: state.items.filter(item => item.id !== id),
      selectedItemId: state.selectedItemId === id ? null : state.selectedItemId
    }));
  },

  selectItem: (id: string | null) => {
    set((state: TimelineState) => ({
      ...state,
      selectedItemId: id
    }));
  },

  addGroup: (group: Omit<TimelineGroup, 'id'>) => {
    const newGroup: TimelineGroup = {
      ...group,
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    set((state: TimelineState) => ({
      ...state,
      groups: [...state.groups, newGroup]
    }));
  },

  updateGroup: (id: string, updatedGroup: Partial<TimelineGroup>) => {
    set((state: TimelineState) => ({
      ...state,
      groups: state.groups.map(group => 
        group.id === id ? { ...group, ...updatedGroup } : group
      )
    }));
  },

  deleteGroup: (id: string) => {
    set((state: TimelineState) => ({
      ...state,
      groups: state.groups.filter(group => group.id !== id),
      items: state.items.filter(item => item.group !== id)
    }));
  }
});