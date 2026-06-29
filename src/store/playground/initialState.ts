import { PlaygroundState } from './types';

export const initialPlaygroundState: PlaygroundState = {
  // Form state
  selectedApi: 'product-data-api',
  type: 'Product',
  amazonDomain: 'amazon.com',
  url: '',
  asin: '',
  gtin: '',
  includeSummarizationAttributes: null,
  variantPrices: null,
  language: '',
  associateId: '',
  output: '',
  includeHtml: null,

  // Category-specific fields
  categoryId: '',
  sortBy: '',
  page: '',
  maxPage: '',

  // Search-specific fields
  searchTerm: '',
  refinements: '',
  excludeSponsored: null,

  // Offers-specific fields
  primeOffers: null,
  freeShipping: null,
  conditionNew: null,
  conditionUsedLikeNew: null,
  conditionUsedVeryGood: null,
  conditionUsedGood: null,
  conditionUsedAcceptable: null,

  // Request state
  isLoading: false,
  apiResponse: null,
  apiError: null,

  // UI state
  activeTab: 'results',
  selectedCodeLanguage: 'curl',
};
