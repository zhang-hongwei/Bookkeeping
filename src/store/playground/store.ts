import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { initialPlaygroundState } from './initialState';
import { createPlaygroundActions, PlaygroundStore } from './actions';

export const usePlaygroundStore = create<PlaygroundStore>()(
  devtools(
    (set, get) => ({
      ...initialPlaygroundState,
      ...createPlaygroundActions(set, get, {} as any),
    }),
    { name: 'PlaygroundStore' }
  )
);
