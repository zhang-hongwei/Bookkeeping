/**
 * Component Store - manages saved components with localStorage persistence.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ComponentAsset } from './component-types';

const STORAGE_KEY = 'poster-card-components';

export interface ComponentStoreState {
  components: Record<string, ComponentAsset>;
}

export interface ComponentStoreActions {
  addComponent: (component: ComponentAsset) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<ComponentAsset>) => void;
  getComponent: (id: string) => ComponentAsset | undefined;
  getAllComponents: () => ComponentAsset[];
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

export type ComponentStoreApi = ComponentStoreState & ComponentStoreActions;

function loadFromLocalStorage(): Record<string, ComponentAsset> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToLocalStorage(components: Record<string, ComponentAsset>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(components));
  } catch {
    console.warn('[ComponentStore] Failed to save to localStorage');
  }
}

export const useComponentStore = create<ComponentStoreApi>()(
  devtools(
    immer((set, get) => ({
      components: loadFromLocalStorage(),

      addComponent: (component) => {
        set((state) => {
          state.components[component.id] = component;
        });
        get().saveToStorage();
      },

      removeComponent: (id) => {
        set((state) => {
          delete state.components[id];
        });
        get().saveToStorage();
      },

      updateComponent: (id, updates) => {
        set((state) => {
          const comp = state.components[id];
          if (comp) Object.assign(comp, updates, { updatedAt: Date.now() });
        });
        get().saveToStorage();
      },

      getComponent: (id) => get().components[id],

      getAllComponents: () => Object.values(get().components),

      loadFromStorage: () => {
        set((state) => {
          state.components = loadFromLocalStorage();
        });
      },

      saveToStorage: () => {
        saveToLocalStorage(get().components);
      },
    })),
    { name: 'poster-component-store', enabled: process.env.NODE_ENV === 'development' },
  ),
);
