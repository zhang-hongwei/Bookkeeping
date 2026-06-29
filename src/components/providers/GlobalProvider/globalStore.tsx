'use client';

import React, { createContext, useContext, PropsWithChildren } from 'react';
import { createStore, useStore } from 'zustand';
import { devtools } from 'zustand/middleware';

interface GlobalState {
  // 这里可以定义全局状态的类型
  // 例如：theme: 'light' | 'dark';
  // loading: boolean;
}

interface GlobalActions {
  // 这里可以定义全局动作的类型
  // 例如：setTheme: (theme: 'light' | 'dark') => void;
  // setLoading: (loading: boolean) => void;
}

type GlobalStore = GlobalState & GlobalActions;

type GlobalStoreApi = ReturnType<typeof createStore<GlobalStore>>;

const GlobalStoreContext = createContext<GlobalStoreApi | undefined>(undefined);

interface GlobalStoreProviderProps extends PropsWithChildren {
  initialState?: Partial<GlobalState>;
}

export const GlobalStoreProvider: React.FC<GlobalStoreProviderProps> = ({
  children,
  initialState = {}
}) => {
  const [store] = React.useState(() =>
    createStore<GlobalStore>()(
      devtools((set, get) => ({
        // 初始状态
        ...initialState,

        // 全局动作（目前为空，可以根据需要添加）
        // 例如：
        // setTheme: (theme) => set({ theme }),
        // setLoading: (loading) => set({ loading }),
      }))
    )
  );

  return (
    <GlobalStoreContext.Provider value={store}>
      {children}
    </GlobalStoreContext.Provider>
  );
};

export function useGlobalStore<T>(
  selector: (store: GlobalStore) => T,
): T {
  const store = useContext(GlobalStoreContext);

  if (!store) {
    throw new Error('useGlobalStore must be used within a GlobalStoreProvider');
  }

  return useStore(store, selector);
}