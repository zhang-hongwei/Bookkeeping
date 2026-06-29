// Product insights data types

export type ShippingMethod = "AMZ" | "FBA" | "FBM";
export type CountryCode = "US" | "CN" | "UK" | "DE" | "JP" | "FR";

export interface TrendData {
  date: string;
  value: number;
}

export interface ProductInsight {
  id: string;
  asin: string;
  name: string;
  imageUrl: string;
  brand: string;
  shippingMethod: ShippingMethod;
  country: CountryCode;
  annualSales: number;
  salesTrend: TrendData[];
  launchDate: string;
  category: string;
}

export interface FilterOptions {
  country: CountryCode | "ALL";
  category: string;
  brand: string;
  searchQuery: string;
}
