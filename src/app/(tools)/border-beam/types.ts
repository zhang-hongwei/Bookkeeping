import type {
  BorderBeamSize,
  BorderBeamColorVariant,
  BorderBeamTheme,
} from "border-beam";

/* ------------------------------------------------------------------ */
/*  Shared types                                                      */
/* ------------------------------------------------------------------ */

export interface PresetConfig {
  label: string;
  size: BorderBeamSize;
  colorVariant: BorderBeamColorVariant;
  theme: BorderBeamTheme;
}

export interface BeamConfig {
  size: BorderBeamSize;
  colorVariant: BorderBeamColorVariant;
  beamTheme: BorderBeamTheme;
  strength: number;
  duration: number;
  brightness: number;
  active: boolean;
  staticColors: boolean;
}

/* ------------------------------------------------------------------ */
/*  Presets data                                                      */
/* ------------------------------------------------------------------ */

export const PRESETS: PresetConfig[] = [
  { label: "彩色 小", size: "sm", colorVariant: "colorful", theme: "dark" },
  { label: "彩色 中", size: "md", colorVariant: "colorful", theme: "dark" },
  { label: "彩色 线条", size: "line", colorVariant: "colorful", theme: "dark" },
  { label: "单色 小", size: "sm", colorVariant: "mono", theme: "dark" },
  { label: "单色 中", size: "md", colorVariant: "mono", theme: "dark" },
  { label: "单色 线条", size: "line", colorVariant: "mono", theme: "dark" },
  { label: "海洋 小", size: "sm", colorVariant: "ocean", theme: "dark" },
  { label: "海洋 中", size: "md", colorVariant: "ocean", theme: "dark" },
  { label: "海洋 线条", size: "line", colorVariant: "ocean", theme: "dark" },
  { label: "日落 小", size: "sm", colorVariant: "sunset", theme: "dark" },
  { label: "日落 中", size: "md", colorVariant: "sunset", theme: "dark" },
  { label: "日落 线条", size: "line", colorVariant: "sunset", theme: "dark" },
  { label: "浅色 彩色", size: "md", colorVariant: "colorful", theme: "light" },
  { label: "浅色 单色", size: "md", colorVariant: "mono", theme: "light" },
  { label: "浅色 海洋", size: "md", colorVariant: "ocean", theme: "light" },
  { label: "浅色 日落", size: "md", colorVariant: "sunset", theme: "light" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

export function buildSnippet(opts: {
  size: BorderBeamSize;
  colorVariant: BorderBeamColorVariant;
  theme: BorderBeamTheme;
  strength: number;
  duration: number;
  brightness: number;
  active: boolean;
  staticColors: boolean;
}) {
  const lines = [
    `<BorderBeam`,
    `  size="${opts.size}"`,
    `  colorVariant="${opts.colorVariant}"`,
    `  theme="${opts.theme}"`,
    `  strength={${opts.strength}}`,
    `  duration={${opts.duration}}`,
    `  brightness={${opts.brightness}}`,
    `  active={${opts.active}}`,
    `  staticColors={${opts.staticColors}}`,
    `>`,
    `  <YourCard />`,
    `</BorderBeam>`,
  ];
  return lines.join("\n");
}
