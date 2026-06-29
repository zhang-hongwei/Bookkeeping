/**
 * Roast Generator Store
 * Zustand state management for AI roast generation
 */

import { create } from 'zustand';

import { CARD_SIZE, PERSONA_STYLE_MAP } from '../types';
import type { RoastCardData, RoastGenerationResult, RoastPersona } from '../types';

const REFERRAL = '你也来试试 → design-tool.com/roast-generator';

interface RoastStoreState {
  inputText: string;
  cards: RoastCardData[];
  isGenerating: boolean;
  error: string | null;
  activeCardIndex: number;
}

interface RoastStoreActions {
  setInputText: (text: string) => void;
  setActiveCard: (index: number) => void;
  generateRoasts: () => Promise<void>;
  reset: () => void;
}

const initialState: RoastStoreState = {
  inputText: '',
  cards: [],
  isGenerating: false,
  error: null,
  activeCardIndex: 0,
};

export const useRoastStore = create<RoastStoreState & RoastStoreActions>()((set, get) => ({
  ...initialState,

  setInputText: (text) => set({ inputText: text }),

  setActiveCard: (index) => set({ activeCardIndex: index }),

  generateRoasts: async () => {
    const { inputText } = get();
    if (!inputText.trim()) return;

    set({ isGenerating: true, error: null });

    try {
      const response = await fetch('/api/ai/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim() }),
      });

      const result = await response.json();

      if (!result.success) {
        set({ isGenerating: false, error: result.error || '生成失败' });
        return;
      }

      const data = result.data as RoastGenerationResult;
      const now = new Date().toISOString();

      const cards: RoastCardData[] = data.variants.map((v) => ({
        persona: v.persona as RoastPersona,
        cardStyle: PERSONA_STYLE_MAP[v.persona as RoastPersona] || 'apple-minimal',
        text: v.text,
        tags: v.tags,
        date: now,
        referralText: REFERRAL,
      }));

      set({ cards, isGenerating: false, activeCardIndex: 0 });
    } catch (error) {
      set({
        isGenerating: false,
        error: error instanceof Error ? error.message : '网络错误',
      });
    }
  },

  reset: () => set(initialState),
}));
