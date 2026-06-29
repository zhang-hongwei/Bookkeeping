import { create } from 'zustand';

interface BrandFilters {
  font?: string;
  darkPrimary?: boolean;
}

interface DesignTokensState {
  selectedBrandSlug: string | null;
  compareBrandSlugs: string[];
  searchQuery: string;
  filters: BrandFilters;
  selectBrand: (slug: string | null) => void;
  toggleCompareBrand: (slug: string) => void;
  clearCompare: () => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: BrandFilters) => void;
  resetFilters: () => void;
}

export const useDesignTokensStore = create<DesignTokensState>((set) => ({
  selectedBrandSlug: null,
  compareBrandSlugs: [],
  searchQuery: '',
  filters: {},
  selectBrand: (slug) => set({ selectedBrandSlug: slug }),
  toggleCompareBrand: (slug) =>
    set((state) => {
      const exists = state.compareBrandSlugs.includes(slug);
      if (exists) {
        return { compareBrandSlugs: state.compareBrandSlugs.filter((s) => s !== slug) };
      }
      if (state.compareBrandSlugs.length >= 3) return state;
      return { compareBrandSlugs: [...state.compareBrandSlugs, slug] };
    }),
  clearCompare: () => set({ compareBrandSlugs: [] }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: {}, searchQuery: '' }),
}));
