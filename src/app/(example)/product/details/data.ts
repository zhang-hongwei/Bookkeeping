export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export interface ProductFeature {
  icon: string;
  title: string;
  description: string;
}

export interface Specification {
  label: string;
  value: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  avatar: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  badges: string[];
  description: string;
  images: ProductImage[];
  colors: ColorOption[];
  sizes: string[];
  availableStock: number;
  specifications: Specification[];
  details: string[];
  benefits: string[];
  deliveryInfo: {
    freeDeliveryThreshold: number;
    standardDelivery: string;
    expressDelivery: string;
    note: string;
  };
}

// Mock product data
export const productData: Product = {
  id: "1",
  name: "Classic Leather Loafers",
  price: 97.14,
  currency: "€",
  rating: 4,
  reviewCount: 3120,
  badges: ["NEW", "IN STOCK"],
  description:
    "Featuring the original ripple design inspired by Japanese bullet trains, the Nike Air Max 97 lets you push your style full-speed ahead.",
  images: [
    {
      id: "1",
      url: "/assets/images/product/product-1.webp",
      alt: "Classic Leather Loafers - Main View",
    },
    {
      id: "2",
      url: "/assets/images/product/product-2.webp",
      alt: "Classic Leather Loafers - Side View",
    },
    {
      id: "3",
      url: "/assets/images/product/product-3.webp",
      alt: "Classic Leather Loafers - Front View",
    },
    {
      id: "4",
      url: "/assets/images/product/product-4.webp",
      alt: "Classic Leather Loafers - Back View",
    },
    {
      id: "5",
      url: "/assets/images/product/product-5.webp",
      alt: "Classic Leather Loafers - Detail View",
    },
    {
      id: "6",
      url: "/assets/images/product/product-6.webp",
      alt: "Classic Leather Loafers - Top View",
    },
    {
      id: "7",
      url: "/assets/images/product/product-7.webp",
      alt: "Classic Leather Loafers - Bottom View",
    },
    {
      id: "8",
      url: "/assets/images/product/product-8.webp",
      alt: "Classic Leather Loafers - Lifestyle Shot",
    },
  ],
  colors: [
    { id: "blue", name: "Blue", hex: "#2196F3" },
    { id: "white", name: "White", hex: "#FFFFFF" },
  ],
  sizes: ["6", "7", "8", "9", "10", "11", "12"],
  availableStock: 72,
  specifications: [
    { label: "Category", value: "Mobile" },
    { label: "Manufacturer", value: "Apple" },
    { label: "Warranty", value: "12 Months" },
    { label: "Serial number", value: "358607726380311" },
    { label: "Ships from", value: "United States" },
  ],
  details: [
    "The foam sockliner feels soft and comfortable",
    "Pull tab",
    "Not intended for use as Personal Protective Equipment",
    "Colour Shown: White/Black/Oxygen Purple/Action Grape",
    "Style: 921826-109",
    "Country/Region of Origin: China",
  ],
  benefits: [
    "Mesh and synthetic materials on the upper keep the fluid look of the OG while adding comfortand durability.",
    "Originally designed for performance running, the full-length Max Air unit adds soft, comfortable cushioning underfoot.",
    "The foam midsole feels springy and soft.",
    "The rubber outsole adds traction and durability.",
  ],
  deliveryInfo: {
    freeDeliveryThreshold: 200,
    standardDelivery: "4-5 Business Days",
    expressDelivery: "2-4 Business Days",
    note: "Orders are processed and delivered Monday-Friday (excluding public holidays)",
  },
};

export const productFeatures: ProductFeature[] = [
  {
    icon: "✓",
    title: "100% original",
    description:
      "Chocolate bar candy canes ice cream toffee cookie halvah.",
  },
  {
    icon: "↻",
    title: "10 days replacement",
    description: "Marshmallow biscuit donut dragée fruitcake wafer.",
  },
  {
    icon: "♦",
    title: "Year warranty",
    description: "Cotton candy gingerbread cake I love sugar sweet.",
  },
];

export const mockReviews: Review[] = [
  {
    id: "1",
    author: "Sarah Johnson",
    rating: 5,
    date: "2024-01-15",
    comment:
      "Amazing product! The quality exceeded my expectations. Highly recommend to anyone looking for premium footwear.",
    avatar: "👩",
  },
  {
    id: "2",
    author: "Michael Chen",
    rating: 4,
    date: "2024-01-10",
    comment:
      "Great shoes, very comfortable. The only downside is they took a bit longer to arrive than expected.",
    avatar: "👨",
  },
  {
    id: "3",
    author: "Emma Wilson",
    rating: 5,
    date: "2024-01-05",
    comment:
      "Love the design and the fit is perfect. Worth every penny!",
    avatar: "👩",
  },
];
