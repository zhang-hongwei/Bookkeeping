/**
 * Gradient Border Store
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { GradientBorderStore } from './types';
import { gradientBorderInitialState } from './initialState';
import { createGradientBorderActions } from './actions';

export const useGradientBorderStore = create<GradientBorderStore>()(
  devtools(
    (set, get, api) => ({
      ...gradientBorderInitialState,
      ...createGradientBorderActions(set, get, api),
    }),
    {
      name: 'gradient-border-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

// Static actions selector to avoid re-renders
const actionsSelector = (state: GradientBorderStore) => ({
  updateConfig: state.updateConfig,
  updateBorderImageOption: state.updateBorderImageOption,
  updateColorStop: state.updateColorStop,
  addColorStop: state.addColorStop,
  removeColorStop: state.removeColorStop,
  moveColorStop: state.moveColorStop,
  duplicateColorStop: state.duplicateColorStop,
  selectColorStop: state.selectColorStop,
  updateColorStopPartial: state.updateColorStopPartial,
  addInnerBgStop: state.addInnerBgStop,
  removeInnerBgStop: state.removeInnerBgStop,
  moveInnerBgStop: state.moveInnerBgStop,
  duplicateInnerBgStop: state.duplicateInnerBgStop,
  selectInnerBgStop: state.selectInnerBgStop,
  updateInnerBgStopPartial: state.updateInnerBgStopPartial,
  applyPreset: state.applyPreset,
  copyCSS: state.copyCSS,
  setGradientType: state.setGradientType,
  setImplementation: state.setImplementation,
  handleFileUpload: state.handleFileUpload,
  setImageUrl: state.setImageUrl,
  setExportDialogOpen: state.setExportDialogOpen,
  toggleBorderImageOptions: state.toggleBorderImageOptions,
  reset: state.reset,
});

/**
 * Actions hook — returns stable action references
 */
export const useGradientBorderActions = () => {
  return useGradientBorderStore(useShallow(actionsSelector));
};

export default useGradientBorderStore;
