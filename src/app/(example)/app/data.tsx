// Stats data
export const stats = [
  {
    title: "Total active users",
    value: "18 765",
    trend: "up" as const,
    trendValue: "+2.6 % last 7 days",
    chartColor: "#00AB55",
    chartData: [15, 25, 35, 25, 35],
  },
  {
    title: "Total installed",
    value: "4 876",
    trend: "up" as const,
    trendValue: "+0.2 % last 7 days",
    chartColor: "#00B8D9",
    chartData: [20, 30, 25, 35, 30],
  },
  {
    title: "Total downloads",
    value: "678",
    trend: "down" as const,
    trendValue: "-0.1 % last 7 days",
    chartColor: "#FF5630",
    chartData: [35, 30, 25, 20, 15],
  },
];

// Invoice data
export const invoices = [
  {
    id: "INV-1990",
    category: "Android",
    price: "83,74 €",
    status: "Paid" as const,
    statusColor: "#00AB55",
  },
  {
    id: "INV-1991",
    category: "Mac",
    price: "97,14 €",
    status: "Out of date" as const,
    statusColor: "#FF5630",
  },
  {
    id: "INV-1992",
    category: "Windows",
    price: "68,71 €",
    status: "Progress" as const,
    statusColor: "#FFAB00",
  },
  {
    id: "INV-1993",
    category: "Android",
    price: "85,21 €",
    status: "Paid" as const,
    statusColor: "#00AB55",
  },
  {
    id: "INV-1994",
    category: "Mac",
    price: "52,17 €",
    status: "Paid" as const,
    statusColor: "#00AB55",
  },
];

// Related apps
export const relatedApps = [
  {
    name: "Microsoft office 365",
    price: "Free",
    downloads: "9.91 k",
    size: "9.68 Mb",
    rating: "9.91 k",
    icon: "/assets/icons/workspaces/logo-1.webp",
  },
  {
    name: "Opera",
    price: "Free",
    downloads: "1.95 k",
    size: "1.9 Mb",
    rating: "1.95 k",
    icon: "/assets/icons/workspaces/logo-2.webp",
  },
  {
    name: "Adobe acrobat reader DC",
    price: "68,71 €",
    downloads: "9.12 k",
    size: "8.91 Mb",
    rating: "9.12 k",
    icon: "/assets/icons/workspaces/logo-3.webp",
  },
  {
    name: "Joplin",
    price: "Free",
    downloads: "6.98 k",
    size: "6.82 Mb",
    rating: "6.98 k",
    icon: "/assets/icons/workspaces/logo-1.webp",
  },
  {
    name: "Topaz photo AI",
    price: "52,17 €",
    downloads: "8.49 k",
    size: "8.29 Mb",
    rating: "8.49 k",
    icon: "/assets/icons/workspaces/logo-2.webp",
  },
];

// Countries data
export const countries = [
  {
    name: "Germany",
    flag: "/assets/icons/flags/ic-flag-de.svg",
    stats: ["9,91 k", "1,95 k", "9,12 k"],
  },
  {
    name: "England",
    flag: "/assets/icons/flags/ic-flag-en.svg",
    stats: ["1,95 k", "9,12 k", "6,98 k"],
  },
  {
    name: "France",
    flag: "/assets/icons/flags/ic-flag-fr.svg",
    stats: ["9,12 k", "6,98 k", "8,49 k"],
  },
  {
    name: "Korean",
    flag: "/assets/icons/flags/ic-flag-de.svg",
    stats: ["6,98 k", "8,49 k", "2,03 k"],
  },
  {
    name: "USA",
    flag: "/assets/icons/flags/ic-flag-en.svg",
    stats: ["8,49 k", "2,03 k", "3,36 k"],
  },
];

// Authors data
export const authors = [
  {
    name: "Jayvion Simon",
    followers: "9.91 k",
    avatar: "/assets/images/avatar/avatar-2.webp",
    rank: 1,
  },
  {
    name: "Deja Brady",
    followers: "9.12 k",
    avatar: "/assets/images/avatar/avatar-3.webp",
    rank: 2,
  },
  {
    name: "Lucian Obrien",
    followers: "1.95 k",
    avatar: "/assets/images/avatar/avatar-4.webp",
    rank: 3,
  },
];
