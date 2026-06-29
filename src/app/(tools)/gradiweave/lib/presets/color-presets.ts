import type { OklchColour } from '../../types/gradient';

export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  colors: OklchColour[];
  category: 'warm' | 'cool' | 'nature' | 'vibrant' | 'monochrome' | 'sunset' | 'ocean';
}

export const COLOR_PRESETS: ColorPreset[] = [
  // Warm tones
  {
    id: 'warm-blaze',
    name: 'Warm Blaze',
    description: ' Fiery sunset colors',
    category: 'warm',
    colors: [
      { l: 0.65, c: 0.25, h: 35, a: 1 },  // Coral
      { l: 0.70, c: 0.20, h: 50, a: 1 },  // Golden
      { l: 0.60, c: 0.22, h: 25, a: 1 },  // Orange-red
      { l: 0.75, c: 0.15, h: 65, a: 1 },  // Warm yellow
    ],
  },
  {
    id: 'autumn-spice',
    name: 'Autumn Spice',
    description: 'Warm earthy tones',
    category: 'warm',
    colors: [
      { l: 0.60, c: 0.18, h: 45, a: 1 },  // Rust
      { l: 0.65, c: 0.12, h: 55, a: 1 },  // Ochre
      { l: 0.55, c: 0.15, h: 30, a: 1 },  // Terracotta
      { l: 0.70, c: 0.08, h: 70, a: 1 },  // Sand
    ],
  },

  // Cool tones
  {
    id: 'arctic-frost',
    name: 'Arctic Frost',
    description: 'Cold icy blues',
    category: 'cool',
    colors: [
      { l: 0.85, c: 0.05, h: 240, a: 1 }, // Pale blue
      { l: 0.70, c: 0.10, h: 250, a: 1 }, // Periwinkle
      { l: 0.90, c: 0.03, h: 220, a: 1 }, // Ice white
      { l: 0.60, c: 0.12, h: 260, a: 1 }, // Deep blue
    ],
  },
  {
    id: 'midnight-void',
    name: 'Midnight Void',
    description: 'Dark mysterious blues',
    category: 'cool',
    colors: [
      { l: 0.20, c: 0.08, h: 250, a: 1 }, // Deep navy
      { l: 0.30, c: 0.10, h: 260, a: 1 }, // Purple-blue
      { l: 0.15, c: 0.05, h: 240, a: 1 }, // Almost black
      { l: 0.40, c: 0.12, h: 270, a: 1 }, // Indigo
    ],
  },

  // Nature
  {
    id: 'forest-dew',
    name: 'Forest Dew',
    description: 'Fresh greens',
    category: 'nature',
    colors: [
      { l: 0.65, c: 0.12, h: 140, a: 1 }, // Fresh green
      { l: 0.70, c: 0.08, h: 160, a: 1 }, // Mint
      { l: 0.50, c: 0.15, h: 130, a: 1 }, // Deep green
      { l: 0.80, c: 0.05, h: 120, a: 1 }, // Pale lime
    ],
  },
  {
    id: 'bamboo-grove',
    name: 'Bamboo Grove',
    description: 'Serene nature tones',
    category: 'nature',
    colors: [
      { l: 0.70, c: 0.10, h: 145, a: 1 }, // Bamboo
      { l: 0.65, c: 0.06, h: 85, a: 1 },  // Olive
      { l: 0.75, c: 0.12, h: 130, a: 1 }, // Leaf green
      { l: 0.80, c: 0.05, h: 100, a: 1 }, // Sage
    ],
  },

  // Vibrant
  {
    id: 'neon-lights',
    name: 'Neon Lights',
    description: 'Electric vibrant colors',
    category: 'vibrant',
    colors: [
      { l: 0.70, c: 0.25, h: 320, a: 1 }, // Hot pink
      { l: 0.75, c: 0.28, h: 180, a: 1 }, // Cyan
      { l: 0.70, c: 0.26, h: 60, a: 1 },  // Bright yellow
      { l: 0.65, c: 0.24, h: 280, a: 1 }, // Purple
    ],
  },
  {
    id: 'carnival',
    name: 'Carnival',
    description: 'Playful bright colors',
    category: 'vibrant',
    colors: [
      { l: 0.70, c: 0.22, h: 25, a: 1 },  // Orange
      { l: 0.75, c: 0.24, h: 160, a: 1 }, // Turquoise
      { l: 0.70, c: 0.26, h: 340, a: 1 }, // Magenta
      { l: 0.80, c: 0.20, h: 120, a: 1 }, // Lime green
    ],
  },

  // Monochrome
  {
    id: 'charcoal-study',
    name: 'Charcoal Study',
    description: 'Elegant grays',
    category: 'monochrome',
    colors: [
      { l: 0.25, c: 0.01, h: 0, a: 1 },   // Dark gray
      { l: 0.45, c: 0.01, h: 0, a: 1 },   // Medium gray
      { l: 0.65, c: 0.01, h: 0, a: 1 },   // Light gray
      { l: 0.85, c: 0.005, h: 0, a: 1 },  // Pale gray
    ],
  },
  {
    id: 'pearl-whites',
    name: 'Pearl Whites',
    description: 'Clean minimal',
    category: 'monochrome',
    colors: [
      { l: 0.95, c: 0.005, h: 0, a: 1 },  // White
      { l: 0.88, c: 0.01, h: 0, a: 1 },   // Off-white
      { l: 0.80, c: 0.015, h: 0, a: 1 },  // Light gray
      { l: 0.92, c: 0.008, h: 0, a: 1 },  // Cream
    ],
  },

  // Sunset
  {
    id: 'california-sunset',
    name: 'California Sunset',
    description: 'Golden hour vibes',
    category: 'sunset',
    colors: [
      { l: 0.70, c: 0.18, h: 45, a: 1 },  // Gold
      { l: 0.60, c: 0.22, h: 25, a: 1 },  // Coral
      { l: 0.65, c: 0.20, h: 350, a: 1 }, // Rose
      { l: 0.75, c: 0.12, h: 60, a: 1 },  // Peach
    ],
  },
  {
    id: 'desert-dusk',
    name: 'Desert Dusk',
    description: 'Southwestern sunset',
    category: 'sunset',
    colors: [
      { l: 0.55, c: 0.20, h: 20, a: 1 },  // Deep orange
      { l: 0.60, c: 0.15, h: 355, a: 1 }, // Red-purple
      { l: 0.65, c: 0.18, h: 50, a: 1 },  // Amber
      { l: 0.70, c: 0.10, h: 75, a: 1 },  // Warm sand
    ],
  },

  // Ocean
  {
    id: 'tropical-waters',
    name: 'Tropical Waters',
    description: 'Caribbean blues',
    category: 'ocean',
    colors: [
      { l: 0.80, c: 0.12, h: 200, a: 1 }, // Aqua
      { l: 0.70, c: 0.15, h: 190, a: 1 }, // Turquoise
      { l: 0.60, c: 0.18, h: 220, a: 1 }, // Deep teal
      { l: 0.85, c: 0.08, h: 180, a: 1 }, // Pale cyan
    ],
  },
  {
    id: 'deep-sea',
    name: 'Deep Sea',
    description: 'Ocean depths',
    category: 'ocean',
    colors: [
      { l: 0.30, c: 0.10, h: 230, a: 1 }, // Navy
      { l: 0.40, c: 0.12, h: 210, a: 1 }, // Blue-teal
      { l: 0.20, c: 0.08, h: 250, a: 1 }, // Deep blue
      { l: 0.50, c: 0.14, h: 200, a: 1 }, // Aquamarine
    ],
  },
];

export const CATEGORY_LABELS: Record<ColorPreset['category'], string> = {
  warm: 'Warm',
  cool: 'Cool',
  nature: 'Nature',
  vibrant: 'Vibrant',
  monochrome: 'Monochrome',
  sunset: 'Sunset',
  ocean: 'Ocean',
};

export function getPresetById(id: string): ColorPreset | undefined {
  return COLOR_PRESETS.find(p => p.id === id);
}

export function getPresetsByCategory(category: ColorPreset['category']): ColorPreset[] {
  return COLOR_PRESETS.filter(p => p.category === category);
}
