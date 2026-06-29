/**
 * Glass Effect Store
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GlassStore } from './types';
import { glassInitialState } from './initialState';
import { createGlassActions } from './actions';

export const useGlassStore = create<GlassStore>()(
  devtools(
    (set, get, api) => ({
      ...glassInitialState,
      ...createGlassActions(set, get, api),
    }),
    {
      name: 'glass-effect-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

export default useGlassStore;
