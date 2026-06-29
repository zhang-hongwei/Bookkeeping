/**
 * Chart Editor Store
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ChartEditorStore } from './types';
import { chartEditorInitialState } from './initialState';
import { createChartEditorActions } from './actions';

export const useChartEditorStore = create<ChartEditorStore>()(
  devtools(
    (set, get, api) => ({
      ...chartEditorInitialState,
      ...createChartEditorActions(set, get, api),
    }),
    {
      name: 'chart-editor-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

export default useChartEditorStore;
