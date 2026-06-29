/**
 * CSS Grid Generator Store
 * Replicates the original cssgridgenerator Vuex store functionality
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { groupRepeatedUnits, createRepetition, validateCSSUnit } from '../utils';

const INIT_COLUMNS = 5;
const INIT_ROWS = 5;
interface UnitArray {
  unit: string;
}

interface GridGeneratorState {
  // Grid configuration
  columns: number;
  rows: number;
  columnGap: number;
  rowGap: number;
  gapLinked: boolean;
  colArr: UnitArray[];
  rowArr: UnitArray[];
  childArea: string[];

  // Validation errors
  errors: {
    col: number[];
    row: number[];
  };
}

interface GridGeneratorActions {
  // Grid configuration actions
  updateColumns: (value: number) => void;
  updateRows: (value: number) => void;
  updateColumnGap: (value: number) => void;
  updateRowGap: (value: number) => void;
  toggleGapLink: () => void;

  // Unit management
  updateUnit: (direction: 'col' | 'row', index: number, value: string) => void;
  validateUnit: (direction: 'col' | 'row', index: number, value: string) => void;

  // Grid area management
  addChildren: (childString: string) => void;
  removeChildren: (index: number) => void;

  // State management
  resetGrid: () => void;
  initializeFromURL: (search: string) => void;

  // Getters (computed values)
  getColTemplate: () => string;
  getRowTemplate: () => string;
  getDivNum: () => number;
}

type GridGeneratorStore = GridGeneratorState & GridGeneratorActions;

// Helper functions
const createInitialArray = (count: number): UnitArray[] => {
  return Array(Math.max(count, 0)).fill({ unit: '1fr' });
};



export const useGridGeneratorStore = create<GridGeneratorStore>()(immer((set, get) => ({
  // Initial state
  columns: INIT_COLUMNS,
  rows: INIT_ROWS,
  columnGap: 8,
  rowGap: 8,
  gapLinked: true,
  colArr: createInitialArray(INIT_COLUMNS),
  rowArr: createInitialArray(INIT_ROWS),
  childArea: [],
  errors: {
    col: [],
    row: [],
  },

  // Actions
  updateColumns: (value) => {
    set((state) => {
      const oldVal = state.columns;
      state.columns = Math.max(Number(value) || 0, 0);

      // Adjust colArr
      const difference = state.columns - oldVal;
      if (difference > 0) {
        // Add new columns
        for (let i = 1; i <= difference; i++) {
          state.colArr.push({ unit: '1fr' });
        }
      } else if (difference < 0) {
        // Remove columns
        for (let i = 1; i <= Math.abs(difference); i++) {
          state.colArr.pop();
        }
      }

      // Clear validation errors for removed columns
      state.errors.col = state.errors.col.filter(i => i < state.columns);
    });
  },

  updateRows: (value) => {
    set((state) => {
      const oldVal = state.rows;
      state.rows = Math.max(Number(value) || 0, 0);

      // Adjust rowArr
      const difference = state.rows - oldVal;
      if (difference > 0) {
        // Add new rows
        for (let i = 1; i <= difference; i++) {
          state.rowArr.push({ unit: '1fr' });
        }
      } else if (difference < 0) {
        // Remove rows
        for (let i = 1; i <= Math.abs(difference); i++) {
          state.rowArr.pop();
        }
      }

      // Clear validation errors for removed rows
      state.errors.row = state.errors.row.filter(i => i < state.rows);
    });
  },

  updateColumnGap: (value) => {
    const gap = Math.max(Number(value) || 0, 0);
    set((state) => {
      state.columnGap = gap;
      if (state.gapLinked) {
        state.rowGap = gap;
      }
    });
  },

  updateRowGap: (value) => {
    const gap = Math.max(Number(value) || 0, 0);
    set((state) => {
      state.rowGap = gap;
      if (state.gapLinked) {
        state.columnGap = gap;
      }
    });
  },

  toggleGapLink: () => {
    set((state) => {
      state.gapLinked = !state.gapLinked;
      // When linking, sync rowGap to columnGap
      if (state.gapLinked) {
        state.rowGap = state.columnGap;
      }
    });
  },

  updateUnit: (direction, index, value) => {
    set((state) => {
      const arr = direction === 'col' ? state.colArr : state.rowArr;
      if (index >= 0 && index < arr.length) {
        arr[index].unit = value;
      }
    });
  },

  validateUnit: (direction, index, value) => {
    set((state) => {
      const isValid = validateCSSUnit(value);
      const errorArr = direction === 'col' ? state.errors.col : state.errors.row;

      const errorIndex = errorArr.indexOf(index);

      if (!isValid && errorIndex === -1) {
        // Add error
        errorArr.push(index);
      } else if (isValid && errorIndex !== -1) {
        // Remove error
        errorArr.splice(errorIndex, 1);
      }
    });
  },

  addChildren: (childString) => {
    set((state) => {
      state.childArea.push(childString);
    });
  },

  removeChildren: (index) => {
    set((state) => {
      state.childArea.splice(index, 1);
    });
  },

  resetGrid: () => {
    set((state) => {
      state.childArea = [];
    });
  },

  initializeFromURL: (search) => {
    set((state) => {
      if (search && search !== '') {
        try {
          const queryParams = new URLSearchParams(search);
          const stateKey = 'state' as keyof GridGeneratorState;

          for (const key of Object.keys(state)) {
            if (queryParams.has(key)) {
              const paramValue = queryParams.get(key);
              if (paramValue) {
                const currentValue = state[key as keyof GridGeneratorState];

                if (typeof currentValue === 'number') {
                  (state as any)[key] = Number(paramValue);
                } else if (Array.isArray(currentValue)) {
                  (state as any)[key] = JSON.parse(paramValue);
                }
              }
            }
          }
        } catch (error) {
          console.error('Failed to parse URL parameters:', error);
        }
      } else {
        // Initialize arrays if no URL params
        state.colArr = createInitialArray(state.columns);
        state.rowArr = createInitialArray(state.rows);
      }
    });
  },

  // Getters
  getColTemplate: () => {
    const state = get();
    const unitGroups = groupRepeatedUnits(state.colArr);
    return createRepetition(unitGroups);
  },

  getRowTemplate: () => {
    const state = get();
    const unitGroups = groupRepeatedUnits(state.rowArr);
    return createRepetition(unitGroups);
  },

  getDivNum: () => {
    const state = get();
    return Math.max(state.columns, 0) * Math.max(state.rows, 0);
  },
})));
