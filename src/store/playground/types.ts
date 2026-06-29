export interface ProductRequestBody {
  type: 'Product';
  amazon_domain: string;
  url?: string;
  asin?: string;
  gtin?: string;
  include_summarization_attributes?: boolean;
  variant_prices?: boolean;
  language?: string;
  associate_id?: string;
  output?: string;
  include_html?: boolean;
}

export interface ApiResponse {
  request_id: string;
  request_status: string;
  request_metadata: {
    created_at: string;
    processed_at: string;
    total_time_taken: number;
  };
  request_parameters: ProductRequestBody;
  product?: {
    title: string;
    asin: string;
    link: string;
    brand: string;
    price?: {
      current_price: number;
      currency: string;
      is_prime: boolean;
    };
    images?: string[];
    rating?: number;
    ratings_total?: number;
    [key: string]: any;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export type AmazonDomain =
  | 'amazon.com'
  | 'amazon.co.uk'
  | 'amazon.de'
  | 'amazon.fr'
  | 'amazon.es'
  | 'amazon.it'
  | 'amazon.ca'
  | 'amazon.co.jp';

export interface PlaygroundState {
  // Form state
  selectedApi: string;
  type: string;
  amazonDomain: AmazonDomain;
  url: string;
  asin: string;
  gtin: string;
  includeSummarizationAttributes: boolean | null;
  variantPrices: boolean | null;
  language: string;
  associateId: string;
  output: string;
  includeHtml: boolean | null;

  // Category-specific fields
  categoryId: string;
  sortBy: string;
  page: string;
  maxPage: string;

  // Search-specific fields
  searchTerm: string;
  refinements: string;
  excludeSponsored: boolean | null;

  // Offers-specific fields
  primeOffers: boolean | null;
  freeShipping: boolean | null;
  conditionNew: boolean | null;
  conditionUsedLikeNew: boolean | null;
  conditionUsedVeryGood: boolean | null;
  conditionUsedGood: boolean | null;
  conditionUsedAcceptable: boolean | null;

  // Request state
  isLoading: boolean;
  apiResponse: ApiResponse | null;
  apiError: ApiError | null;

  // UI state
  activeTab: 'results' | 'code';
  selectedCodeLanguage: string;
}
