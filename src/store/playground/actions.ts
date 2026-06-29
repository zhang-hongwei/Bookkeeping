import { StateCreator } from "zustand";
import type {
  PlaygroundState,
  ProductRequestBody,
  ApiResponse,
  ApiError,
  AmazonDomain,
} from "./types";
import { playgroundClient } from "@/lib/api/playground-client";

export interface PlaygroundActions {
  // Form actions
  setSelectedApi: (api: string) => void;
  setType: (type: string) => void;
  setAmazonDomain: (domain: AmazonDomain) => void;
  setUrl: (url: string) => void;
  setAsin: (asin: string) => void;
  setGtin: (gtin: string) => void;
  setIncludeSummarizationAttributes: (include: boolean | null) => void;
  setVariantPrices: (include: boolean | null) => void;
  setLanguage: (language: string) => void;
  setAssociateId: (id: string) => void;
  setOutput: (output: string) => void;
  setIncludeHtml: (include: boolean | null) => void;

  // Category-specific actions
  setCategoryId: (id: string) => void;
  setSortBy: (sortBy: string) => void;
  setPage: (page: string) => void;
  setMaxPage: (maxPage: string) => void;

  // Search-specific actions
  setSearchTerm: (term: string) => void;
  setRefinements: (refinements: string) => void;
  setExcludeSponsored: (exclude: boolean | null) => void;

  // Offers-specific actions
  setPrimeOffers: (prime: boolean | null) => void;
  setFreeShipping: (free: boolean | null) => void;
  setConditionNew: (condition: boolean | null) => void;
  setConditionUsedLikeNew: (condition: boolean | null) => void;
  setConditionUsedVeryGood: (condition: boolean | null) => void;
  setConditionUsedGood: (condition: boolean | null) => void;
  setConditionUsedAcceptable: (condition: boolean | null) => void;

  // Request actions
  sendApiRequest: () => Promise<void>;
  clearResults: () => void;

  // UI actions
  setActiveTab: (tab: "results" | "code") => void;
  setSelectedCodeLanguage: (language: string) => void;

  // Reset action
  resetForm: () => void;
}

export type PlaygroundStore = PlaygroundState & PlaygroundActions;

export const createPlaygroundActions: StateCreator<
  PlaygroundStore,
  any,
  any,
  PlaygroundActions
> = (set, get) => ({
  // Form actions
  setSelectedApi: (api) => set({ selectedApi: api }),
  setType: (type) => set({ type }),
  setAmazonDomain: (domain) => set({ amazonDomain: domain }),
  setUrl: (url) => set({ url }),
  setAsin: (asin) => set({ asin }),
  setGtin: (gtin) => set({ gtin }),
  setIncludeSummarizationAttributes: (include) =>
    set({ includeSummarizationAttributes: include }),
  setVariantPrices: (include) => set({ variantPrices: include }),
  setLanguage: (language) => set({ language }),
  setAssociateId: (id) => set({ associateId: id }),
  setOutput: (output) => set({ output }),
  setIncludeHtml: (include) => set({ includeHtml: include }),

  // Category-specific actions
  setCategoryId: (id) => set({ categoryId: id }),
  setSortBy: (sortBy) => set({ sortBy }),
  setPage: (page) => set({ page }),
  setMaxPage: (maxPage) => set({ maxPage }),

  // Search-specific actions
  setSearchTerm: (term) => set({ searchTerm: term }),
  setRefinements: (refinements) => set({ refinements }),
  setExcludeSponsored: (exclude) => set({ excludeSponsored: exclude }),

  // Offers-specific actions
  setPrimeOffers: (prime) => set({ primeOffers: prime }),
  setFreeShipping: (free) => set({ freeShipping: free }),
  setConditionNew: (condition) => set({ conditionNew: condition }),
  setConditionUsedLikeNew: (condition) => set({ conditionUsedLikeNew: condition }),
  setConditionUsedVeryGood: (condition) => set({ conditionUsedVeryGood: condition }),
  setConditionUsedGood: (condition) => set({ conditionUsedGood: condition }),
  setConditionUsedAcceptable: (condition) => set({ conditionUsedAcceptable: condition }),

  // Request actions
  sendApiRequest: async () => {
    const state = get();

    // Build request body
    const requestBody: ProductRequestBody = {
      type: state.type as "Product",
      amazon_domain: state.amazonDomain,
    };

    // Add optional fields if they have values
    if (state.url) requestBody.url = state.url;
    if (state.asin) requestBody.asin = state.asin;
    if (state.gtin) requestBody.gtin = state.gtin;
    if (state.includeSummarizationAttributes !== null)
      requestBody.include_summarization_attributes =
        state.includeSummarizationAttributes;
    if (state.variantPrices !== null)
      requestBody.variant_prices = state.variantPrices;
    if (state.language) requestBody.language = state.language;
    if (state.associateId) requestBody.associate_id = state.associateId;
    if (state.output) requestBody.output = state.output;
    if (state.includeHtml !== null)
      requestBody.include_html = state.includeHtml;

    set({ isLoading: true, apiError: null });

    try {
      // Validate request
      const validationErrors =
        playgroundClient.validateRequestBody(requestBody);
      if (validationErrors.length > 0) {
        set({
          apiError: {
            error: {
              code: "VALIDATION_ERROR",
              message: validationErrors.join("; "),
            },
          },
          isLoading: false,
        });
        return;
      }

      // Send API request
      const data: ApiResponse = await playgroundClient.sendProductRequest(
        requestBody
      );
      set({ apiResponse: data, isLoading: false, activeTab: "results" });
    } catch (error) {
      set({
        apiError: {
          error: {
            code: "REQUEST_ERROR",
            message:
              error instanceof Error ? error.message : "请求失败，请重试",
          },
        },
        isLoading: false,
      });
    }
  },

  clearResults: () => set({ apiResponse: null, apiError: null }),

  // UI actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCodeLanguage: (language) =>
    set({ selectedCodeLanguage: language }),

  // Reset action
  resetForm: () =>
    set({
      url: "",
      asin: "",
      gtin: "",
      includeSummarizationAttributes: null,
      variantPrices: null,
      language: "",
      associateId: "",
      output: "",
      includeHtml: null,
      categoryId: "",
      sortBy: "",
      page: "",
      maxPage: "",
      searchTerm: "",
      refinements: "",
      excludeSponsored: null,
      primeOffers: null,
      freeShipping: null,
      conditionNew: null,
      conditionUsedLikeNew: null,
      conditionUsedVeryGood: null,
      conditionUsedGood: null,
      conditionUsedAcceptable: null,
      apiResponse: null,
      apiError: null,
    }),
});
