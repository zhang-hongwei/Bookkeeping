/**
 * Glass Effect Store Actions
 */

import type { StateCreator } from 'zustand';
import type { GlassStore, GlassActions } from './types';
import type { GlassConfig, GlassEffectType, PreviewTemplate } from '@/app/(tools)/glassmorphism/types';
import { generateCSS } from '@/app/(tools)/glassmorphism/utils';
import { getPresetByName } from '@/app/(tools)/glassmorphism/presets';
import { glassInitialState } from './initialState';

export const createGlassActions: StateCreator<GlassStore, [], [], GlassActions> = (set, get) => ({
  updateConfig: (partial) => {
    set((state) => ({ config: { ...state.config, ...partial } }));
  },

  setEffectType: (type: GlassEffectType) => {
    const { config } = get();
    const updates: Partial<GlassConfig> = { effectType: type };

    // Apply sensible defaults per effect type
    if (type === 'glassmorphism') {
      Object.assign(updates, {
        blur: 16, opacity: 0.25, saturation: 180, backgroundColor: '#ffffff',
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.18)',
        shadowX: 0, shadowY: 8, shadowBlur: 32, shadowSpread: 0,
        shadowColor: '#000000', shadowOpacity: 10, innerShadowOpacity: 0,
      });
    } else if (type === 'liquidGlass') {
      Object.assign(updates, {
        blur: 40, opacity: 0.3, saturation: 180, backgroundColor: '#ffffff',
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.35)',
        shadowX: 0, shadowY: 8, shadowBlur: 32, shadowSpread: 0,
        shadowColor: '#000000', shadowOpacity: 12, innerShadowOpacity: 40,
      });
    } else if (type === 'neumorphism') {
      Object.assign(updates, {
        borderWidth: 0, borderColor: 'transparent',
        surfaceColor: '#e0e0e0', neumorphDistance: 8, neumorphBlur: 16,
        lightShadowColor: '#ffffff', darkShadowColor: '#bebebe', neumorphInset: false,
      });
    }

    set({ config: { ...config, ...updates } });
  },

  setPreviewTemplate: (template: PreviewTemplate) => {
    set((state) => ({ config: { ...state.config, previewTemplate: template } }));
  },

  applyPreset: (name: string) => {
    const preset = getPresetByName(name);
    if (preset) {
      set((state) => ({ config: { ...state.config, ...preset.config, effectType: preset.effectType } }));
    }
  },

  setBackgroundPreset: (value: string) => {
    set((state) => ({
      config: { ...state.config, backgroundPreset: value, backgroundImage: '' },
    }));
  },

  setBackgroundImage: (url: string) => {
    set((state) => ({ config: { ...state.config, backgroundImage: url } }));
  },

  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { objectUrl } = get();
    if (objectUrl.startsWith('blob:')) URL.revokeObjectURL(objectUrl);
    const url = URL.createObjectURL(file);
    set({
      objectUrl: url,
      config: { ...get().config, backgroundImage: url },
    });
    e.target.value = '';
  },

  clearBackgroundImage: () => {
    const { objectUrl } = get();
    if (objectUrl.startsWith('blob:')) URL.revokeObjectURL(objectUrl);
    set({ objectUrl: '', config: { ...get().config, backgroundImage: '' } });
  },

  setExportDialogOpen: (open: boolean) => {
    set({ exportDialogOpen: open });
  },

  copyCSS: async () => {
    await navigator.clipboard.writeText(generateCSS(get().config));
    set({ copied: true });
    setTimeout(() => set({ copied: false }), 2000);
  },

  reset: () => {
    const { objectUrl } = get();
    if (objectUrl.startsWith('blob:')) URL.revokeObjectURL(objectUrl);
    set(glassInitialState);
  },
});
