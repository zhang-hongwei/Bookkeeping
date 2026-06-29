import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { HdrGradientStore } from './types';
import { initialHdrGradientState } from './initialState';
import { createActions } from './actions';

export const useHdrGradientStore = create<HdrGradientStore>()(
  devtools(
    (set, get) => ({
      ...initialHdrGradientState,
      ...createActions(set, get, {} as any),
    }),
    { name: 'hdr-gradient' },
  ),
);
