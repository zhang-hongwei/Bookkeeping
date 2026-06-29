/**
 * Card Generator Store
 * Zustand state management for AI card generation
 */

import { create } from 'zustand';

import type { CardData, CardGenerationResult, CardStyle, PlatformSize } from '../types';
import { PLATFORM_SIZES } from '../presets';

interface CardStoreState {
  inputText: string;
  platformSize: PlatformSize;
  generationResult: CardGenerationResult | null;
  cards: CardData[];
  isGenerating: boolean;
  error: string | null;
  activeCardIndex: number;
}

interface CardStoreActions {
  setInputText: (text: string) => void;
  setPlatformSize: (size: PlatformSize) => void;
  setActiveCard: (index: number) => void;
  generateCards: () => Promise<void>;
  updateCardText: (styleId: CardStyle, text: string) => void;
  reset: () => void;
}

const initialState: CardStoreState = {
  inputText: '',
  platformSize: 'xiaohongshu',
  generationResult: null,
  cards: [],
  isGenerating: false,
  error: null,
  activeCardIndex: 0,
};

export const useCardStore = create<CardStoreState & CardStoreActions>()((set, get) => ({
  ...initialState,

  setInputText: (text) => set({ inputText: text }),

  setPlatformSize: (size) => set({ platformSize: size }),

  setActiveCard: (index) => set({ activeCardIndex: index }),

  generateCards: async () => {
    const { inputText } = get();
    if (!inputText.trim()) return;

    set({ isGenerating: true, error: null });

    try {
      const response = await fetch('/api/ai/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim(), count: 3 }),
      });

      const result = await response.json();

      if (!result.success) {
        set({ isGenerating: false, error: result.error || '生成失败' });
        return;
      }

      const data = result.data as CardGenerationResult;
      const cards: CardData[] = data.enhancedTexts.map((et) => ({
        styleId: et.styleId,
        text: et.text,
        keywords: et.keywords,
        tags: et.tags,
        emotion: et.emotion,
      }));

      set({
        generationResult: data,
        cards,
        isGenerating: false,
        activeCardIndex: 0,
      });
    } catch (error) {
      set({
        isGenerating: false,
        error: error instanceof Error ? error.message : '网络错误',
      });
    }
  },

  updateCardText: (styleId, text) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.styleId === styleId ? { ...card, text } : card
      ),
    })),

  reset: () => set(initialState),
}));

// Selector helpers
export const selectPlatformConfig = (state: CardStoreState) =>
  PLATFORM_SIZES[state.platformSize];
