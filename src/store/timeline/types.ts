export interface TimelineItem {
  id: string;
  content: string;
  start: Date | string;
  end?: Date | string;
  group?: string;
  className?: string;
  type?: 'point' | 'box' | 'range' | 'background';
  title?: string;
}

export interface TimelineGroup {
  id: string;
  content: string;
  order?: number;
}

export interface TimelineState {
  items: TimelineItem[];
  groups: TimelineGroup[];
  selectedItemId: string | null;
}

export interface TimelineActions {
  setState: (newState: Partial<TimelineState>) => void;
  addItem: (item: Omit<TimelineItem, 'id'>) => void;
  updateItem: (id: string, item: Partial<TimelineItem>) => void;
  deleteItem: (id: string) => void;
  selectItem: (id: string | null) => void;
  addGroup: (group: Omit<TimelineGroup, 'id'>) => void;
  updateGroup: (id: string, group: Partial<TimelineGroup>) => void;
  deleteGroup: (id: string) => void;
}

export type TimelineStore = TimelineState & TimelineActions;