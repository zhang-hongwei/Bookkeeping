import { ProductInsight } from "./types";

// Generate realistic sales trend data
const generateTrendData = (baseValue: number, variance: number = 0.3) => {
  const months = 12;
  const data = [];
  let currentValue = baseValue;

  for (let i = 0; i < months; i++) {
    const change = (Math.random() - 0.5) * variance * currentValue;
    currentValue = Math.max(0, currentValue + change);
    data.push({
      date: new Date(2024, i, 1).toISOString(),
      value: Math.round(currentValue),
    });
  }

  return data;
};

export const mockProducts: ProductInsight[] = [
  {
    id: "1",
    asin: "B01GNVF8S8",
    name: "Waterpik Cordless Advanced 2.0 Water Flosser",
    imageUrl: "/products/waterpik-1.jpg",
    brand: "Waterpik",
    shippingMethod: "AMZ",
    country: "US",
    annualSales: 55000,
    salesTrend: generateTrendData(4500, 0.2),
    launchDate: "2016/06/07",
    category: "Health & Personal Care",
  },
  {
    id: "2",
    asin: "B0B4W3DKVD",
    name: "Waterpik Cordless Advanced 2.0 Water Flosser",
    imageUrl: "/products/waterpik-2.jpg",
    brand: "Waterpik",
    shippingMethod: "AMZ",
    country: "US",
    annualSales: 0,
    salesTrend: generateTrendData(0, 0),
    launchDate: "2020/02/13",
    category: "Health & Personal Care",
  },
  {
    id: "3",
    asin: "B01GNVF7YI",
    name: "Waterpik Cordless Advanced 2.0 Water Flosser",
    imageUrl: "/products/waterpik-3.jpg",
    brand: "Waterpik",
    shippingMethod: "AMZ",
    country: "US",
    annualSales: 57000,
    salesTrend: generateTrendData(4800, 0.25),
    launchDate: "2016/06/07",
    category: "Health & Personal Care",
  },
  {
    id: "4",
    asin: "B01GNVF8BK",
    name: "Waterpik Cordless Advanced 2.0 Water Flosser",
    imageUrl: "/products/waterpik-4.jpg",
    brand: "Waterpik",
    shippingMethod: "AMZ",
    country: "US",
    annualSales: 57000,
    salesTrend: generateTrendData(4700, 0.22),
    launchDate: "2016/06/07",
    category: "Health & Personal Care",
  },
  {
    id: "5",
    asin: "B0B1GVH6CK",
    name: "Waterpik Aquarius Water Flosser Professional",
    imageUrl: "/products/waterpik-5.jpg",
    brand: "Waterpik",
    shippingMethod: "AMZ",
    country: "US",
    annualSales: 62171,
    salesTrend: generateTrendData(5200, 0.18),
    launchDate: "2022/05/15",
    category: "Health & Personal Care",
  },
  {
    id: "6",
    asin: "B07HBGX3BM",
    name: "Waterpik Aquarius Water Flosser Professional",
    imageUrl: "/products/waterpik-6.jpg",
    brand: "Waterpik",
    shippingMethod: "AMZ",
    country: "US",
    annualSales: 51600,
    salesTrend: generateTrendData(4300, 0.28),
    launchDate: "2018/10/04",
    category: "Health & Personal Care",
  },
  {
    id: "7",
    asin: "B072JFVXXY",
    name: "Waterpik Aquarius Water Flosser Professional",
    imageUrl: "/products/waterpik-7.jpg",
    brand: "Waterpik",
    shippingMethod: "AMZ",
    country: "US",
    annualSales: 59600,
    salesTrend: generateTrendData(5000, 0.21),
    launchDate: "2017/06/01",
    category: "Health & Personal Care",
  },
  {
    id: "8",
    asin: "B01LXY19XD",
    name: "Waterpik Aquarius Water Flosser Professional",
    imageUrl: "/products/waterpik-8.jpg",
    brand: "Waterpik",
    shippingMethod: "AMZ",
    country: "US",
    annualSales: 0,
    salesTrend: generateTrendData(0, 0),
    launchDate: "2016/07/14",
    category: "Health & Personal Care",
  },
  {
    id: "9",
    asin: "B00HFQ0QYU",
    name: "Waterpik Aquarius Water Flosser Professional",
    imageUrl: "/products/waterpik-9.jpg",
    brand: "Waterpik",
    shippingMethod: "FBA",
    country: "US",
    annualSales: 59600,
    salesTrend: generateTrendData(4950, 0.19),
    launchDate: "2013/12/19",
    category: "Health & Personal Care",
  },
  {
    id: "10",
    asin: "B01GNVF8K8",
    name: "Waterpik Cordless Freedom Water Flosser",
    imageUrl: "/products/waterpik-10.jpg",
    brand: "Waterpik",
    shippingMethod: "AMZ",
    country: "US",
    annualSales: 48500,
    salesTrend: generateTrendData(4100, 0.26),
    launchDate: "2016/06/07",
    category: "Health & Personal Care",
  },
  {
    id: "11",
    asin: "B07HBGX3CD",
    name: "Waterpik Sonic-Fusion Professional Flossing Toothbrush",
    imageUrl: "/products/waterpik-11.jpg",
    brand: "Waterpik",
    shippingMethod: "FBA",
    country: "US",
    annualSales: 45200,
    salesTrend: generateTrendData(3800, 0.3),
    launchDate: "2018/10/04",
    category: "Health & Personal Care",
  },
  {
    id: "12",
    asin: "B0B2JFVXXY",
    name: "Waterpik Ion Professional Water Flosser",
    imageUrl: "/products/waterpik-12.jpg",
    brand: "Waterpik",
    shippingMethod: "AMZ",
    country: "US",
    annualSales: 38900,
    salesTrend: generateTrendData(3250, 0.27),
    launchDate: "2021/03/15",
    category: "Health & Personal Care",
  },
];

// Filter options
export const countries = [
  { code: "ALL", name: "All Countries", flag: "🌎" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
] as const;

export const categories = [
  "All Categories",
  "Health & Personal Care",
  "Beauty & Personal Care",
  "Home & Kitchen",
  "Electronics",
] as const;

export const brands = ["All Brands", "Waterpik", "Philips", "Oral-B"] as const;
