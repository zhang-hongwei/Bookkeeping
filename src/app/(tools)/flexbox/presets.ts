/**
 * Flexbox Presets
 * Common layout patterns
 */

import type { FlexPreset } from './types';

export const FLEX_PRESETS: FlexPreset[] = [
  {
    name: 'Row Center',
    description: 'Horizontal center alignment',
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
  },
  {
    name: 'Row Between',
    description: 'Horizontal space between items',
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
  {
    name: 'Row Start',
    description: 'Horizontal start alignment',
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
  },
  },
  {
    name: 'Column Center',
    description: 'Vertical center alignment',
    container: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
  },
  },
  {
    name: 'Column Between',
    description: 'Vertical space between items',
    container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  },
  {
    name: 'Stretch Items',
    description: 'Items stretch to fill container',
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
  },
  },
  {
    name: 'Responsive Grid',
    description: 'Flexible grid layout',
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: 16,
    },
  },
  {
    name: 'Sidebar Layout',
    description: 'Sidebar with main content',
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
    },
  },
  {
    name: 'Card Grid',
    description: 'Card-based grid',
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 24,
    },
  },
  {
    name: 'Bottom Navigation',
    description: 'Fixed bottom bar layout',
    container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    },
  },
];

export const getPresetByName = (name: string): FlexPreset | undefined => {
  return FLEX_PRESETS.find((preset) => preset.name === name);
};
