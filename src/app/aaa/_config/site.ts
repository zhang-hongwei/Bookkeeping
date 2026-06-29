// Shared brand and visual constants for the /aaa landing page.
// UI copy is Chinese (per product direction); code comments are English.

/** Brand identity shown across the landing page. */
export const BRAND = {
  name: "Design Tool",
  nameZh: "设计工具箱",
  tagline: "你的 AI 设计工具箱",
  description:
    "一站式搞定配色、渐变、布局与组件。40+ 设计工具集合，所见即所得，一键导出可用代码。",
  primaryCta: { label: "立即体验", href: "/chat" },
  secondaryCta: { label: "浏览工具", href: "#tools" },
} as const;

/**
 * Brand gradients, derived from the project theme tokens:
 * primary purple (#643DFF) -> info blue (#00A6FF).
 */
export const GRADIENT = {
  // Signature diagonal purple -> blue used for headings, borders and glows.
  brand: "linear-gradient(135deg, #C684FF 0%, #643DFF 45%, #00A6FF 100%)",
  // Softer, lower-opacity variant for backgrounds and chips.
  brandSoft:
    "linear-gradient(135deg, rgba(198,132,255,0.16), rgba(100,61,255,0.12) 45%, rgba(0,166,255,0.16))",
  // Subtle vertical fade used behind the hero.
  heroVeil:
    "linear-gradient(180deg, rgba(10,10,18,0) 0%, rgba(10,10,18,0.65) 70%, #0A0A12 100%)",
} as const;

/** Dark, tech-forward surface palette for the page. */
export const COLOR = {
  bg: "#0A0A12",
  bgAlt: "#0E0E1A",
  surface: "rgba(255,255,255,0.045)",
  surfaceHover: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.09)",
  borderHover: "rgba(198,132,255,0.55)",
  text: "#ECECF6",
  textDim: "rgba(236,236,246,0.64)",
  textFaint: "rgba(236,236,246,0.40)",
} as const;

/** Max content width and section vertical rhythm. */
export const LAYOUT = {
  maxWidth: 1180,
  sectionPy: { xs: 7, md: 12 },
  headerHeight: 68,
} as const;

/**
 * The scrollable root element id for this page. Because the global stylesheet
 * sets `html, body { overflow: hidden }`, the page scrolls inside this element
 * (not the window). Header scroll-effects listen on this node instead of window.
 */
export const SCROLL_ROOT_ID = "aaa-scroll-root";

/** Headline stats rendered under the hero. */
export const HERO_STATS = [
  { value: "40+", label: "设计工具" },
  { value: "AI", label: "智能生成" },
  { value: "0", label: "配置成本" },
  { value: "∞", label: "一键导出代码" },
] as const;

/** Core selling points rendered in the Features grid. */
export const FEATURES = [
  {
    title: "AI 驱动生成",
    desc: "用一句话描述你想要的效果，配色、渐变、卡片即刻生成，告别从零调参。",
    icon: "auto",
    accent: "linear-gradient(135deg, #C684FF, #643DFF)",
  },
  {
    title: "可视化编辑",
    desc: "所见即所得的实时预览，拖拽即调，每一处细节都直观可控。",
    icon: "tune",
    accent: "linear-gradient(135deg, #643DFF, #4D7CFF)",
  },
  {
    title: "一键导出代码",
    desc: "CSS / Tailwind / JSX 多格式输出，复制即用，无缝接入你的项目。",
    icon: "code",
    accent: "linear-gradient(135deg, #4D7CFF, #00A6FF)",
  },
  {
    title: "MUI 主题设计器",
    desc: "Button、Slider、Tabs 等组件主题可视化定制，主题 token 直接落地。",
    icon: "widgets",
    accent: "linear-gradient(135deg, #00A6FF, #29CCB0)",
  },
  {
    title: "暗色 / 玻璃拟态",
    desc: "Glassmorphism、边框光束、HDR 渐变，当下最流行的视觉质感开箱即用。",
    icon: "glass",
    accent: "linear-gradient(135deg, #29CCB0, #C684FF)",
  },
  {
    title: "纯前端 · 零依赖",
    desc: "所有工具基于浏览器实时计算，无需登录、无需安装，打开即用。",
    icon: "bolt",
    accent: "linear-gradient(135deg, #FC9532, #643DFF)",
  },
] as const;
