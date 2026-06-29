/**
 * Chart Editor Store Initial State
 */

import type { ChartEditorState } from './types';
import { createDefaultConfig } from '@/app/(tools)/chartEditor/utils';

export const chartEditorInitialState: ChartEditorState = {
  config: createDefaultConfig(),
  selectedSeriesId: null,
  exportDialogOpen: false,
  copied: false,
};
