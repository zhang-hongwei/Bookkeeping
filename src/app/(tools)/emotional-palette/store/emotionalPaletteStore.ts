/**
 * Emotional Palette Store
 * Zustand state management for emotional atmosphere generation
 */

import { create } from 'zustand';

import type { EmotionalPalette } from '@/types/emotional-palette';

interface EmotionalPaletteStoreState {
  prompt: string;
  palette: EmotionalPalette | null;
  isGenerating: boolean;
  error: string | null;
  gradientIndex: number;
}

interface EmotionalPaletteStoreActions {
  setPrompt: (prompt: string) => void;
  setGradientIndex: (index: number) => void;
  generate: () => Promise<void>;
  reset: () => void;
}

const initialState: EmotionalPaletteStoreState = {
  prompt: '',
  palette: null,
  isGenerating: false,
  error: null,
  gradientIndex: 0,
};

export const useEmotionalPaletteStore = create<EmotionalPaletteStoreState & EmotionalPaletteStoreActions>()(
  (set, get) => ({
    ...initialState,

    setPrompt: (prompt) => set({ prompt }),

    setGradientIndex: (index) => set({ gradientIndex: index }),

    generate: async () => {
      const { prompt } = get();
      if (!prompt.trim()) return;

      set({ isGenerating: true, error: null });

      try {
        const response = await fetch('/api/ai/emotional-palette', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: prompt.trim() }),
        });

        const result = await response.json();

        if (!result.success) {
          set({ isGenerating: false, error: result.error || 'Generation failed' });
          return;
        }

        set({
          palette: result.data as EmotionalPalette,
          isGenerating: false,
          gradientIndex: 0,
        });
      } catch (error) {
        set({
          isGenerating: false,
          error: error instanceof Error ? error.message : 'Network error',
        });
      }
    },

    reset: () => set(initialState),
  })
);
