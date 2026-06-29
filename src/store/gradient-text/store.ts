/**
 * Gradient Text Store
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { GradientTextStore } from './types';
import { gradientTextInitialState } from './initialState';
import { createGradientTextActions } from './actions';

export const useGradientTextStore = create<GradientTextStore>()(
  devtools(
    (set, get, api) => ({
      ...gradientTextInitialState,
      ...createGradientTextActions(set, get, api),
    }),
    {
      name: 'gradient-text-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

// Static actions selector to avoid re-renders
const actionsSelector = (state: GradientTextStore) => ({
  updateConfig: state.updateConfig,
  updateColorStop: state.updateColorStop,
  addColorStop: state.addColorStop,
  removeColorStop: state.removeColorStop,
  moveColorStop: state.moveColorStop,
  duplicateColorStop: state.duplicateColorStop,
  selectColorStop: state.selectColorStop,
  updateColorStopPartial: state.updateColorStopPartial,
  applyPreset: state.applyPreset,
  copyCSS: state.copyCSS,
  setGradientType: state.setGradientType,
  setExportDialogOpen: state.setExportDialogOpen,
  reset: state.reset,
});

/**
 * Actions hook - returns stable action references
 */
export const useGradientTextActions = () => {
  return useGradientTextStore(useShallow(actionsSelector));
};

export default useGradientTextStore;
