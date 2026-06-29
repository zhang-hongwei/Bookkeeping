// Stats Card Types
export interface StatsCardData {
  title: string;
  value: string;
  trend: "up" | "down";
  trendValue: string;
  bgColor: string;
  icon: any;
  chartData: number[];
}

export interface VisitData {
  name: string;
  value: number;
  color?: string; // 可选，优先使用主题颜色
}

export interface WebsiteVisitData {
  month: string;
  teamA: number;
  teamB: number;
}

export interface ConversionRateData {
  country: string;
  value: number;
  total: number;
}

// Icons
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";

// Top Stats Data
export const topStatsData: StatsCardData[] = [
  {
    title: "Weekly sales",
    value: "714 k",
    trend: "up",
    trendValue: "+2.6 %",
    bgColor: "linear-gradient(135deg, #C8FACD 0%, #A5F3C4 100%)",
    icon: ShoppingBagOutlinedIcon,
    chartData: [30, 25, 20, 28, 22, 30, 25],
  },
  {
    title: "New users",
    value: "1,35 m",
    trend: "down",
    trendValue: "-0.1 %",
    bgColor: "linear-gradient(135deg, #D0BFFF 0%, #C5B0FC 100%)",
    icon: PersonOutlineIcon,
    chartData: [20, 30, 22, 28, 25, 20, 25],
  },
  {
    title: "Purchase orders",
    value: "1,72 m",
    trend: "up",
    trendValue: "+2.8 %",
    bgColor: "linear-gradient(135deg, #FFF5CC 0%, #FFE89C 100%)",
    icon: ShoppingCartOutlinedIcon,
    chartData: [25, 20, 30, 25, 28, 35, 30],
  },
  {
    title: "Messages",
    value: "234",
    trend: "up",
    trendValue: "+3.6 %",
    bgColor: "linear-gradient(135deg, #FFD6C9 0%, #FFC2B3 100%)",
    icon: MessageOutlinedIcon,
    chartData: [22, 28, 25, 30, 28, 32, 35],
  },
];

// Current Visits Data - 使用主题调色盘
export const visitsData: VisitData[] = [
  { name: "America", value: 43.8 },  // 自动使用 ECHARTS_COLOR_PALETTE[0]
  { name: "Asia", value: 31.3 },      // 自动使用 ECHARTS_COLOR_PALETTE[1]
  { name: "Europe", value: 18.8 },    // 自动使用 ECHARTS_COLOR_PALETTE[2]
  { name: "Africa", value: 6.3 },     // 自动使用 ECHARTS_COLOR_PALETTE[3]
];

// Website Visits Data
export const websiteVisitsData: WebsiteVisitData[] = [
  { month: "Jan", teamA: 43, teamB: 53 },
  { month: "Feb", teamA: 30, teamB: 68 },
  { month: "Mar", teamA: 20, teamB: 48 },
  { month: "Apr", teamA: 35, teamB: 88 },
  { month: "May", teamA: 62, teamB: 40 },
  { month: "Jun", teamA: 65, teamB: 35 },
  { month: "Jul", teamA: 38, teamB: 25 },
  { month: "Aug", teamA: 75, teamB: 25 },
  { month: "Sep", teamA: 56, teamB: 25 },
];

// Conversion Rates Data
export const conversionRatesData: ConversionRateData[] = [
  { country: "Italy", value: 60, total: 53 },
  { country: "Japan", value: 55, total: 32 },
  { country: "China", value: 43, total: 33 },
  { country: "Canada", value: 82, total: 52 },
  { country: "France", value: 22, total: 13 },
];
