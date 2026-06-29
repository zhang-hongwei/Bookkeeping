import { Reducer } from "react";
import { InternalTableState, TableAction } from "../types";

export const initialTableState: InternalTableState = {
  selected: {},
  currentPage: 1,
  pageSize: 10,
  expandedKeys: [],
  pingedLeft: false,
  pingedRight: false,
  tableWidth: 0,
  colsWidths: new Map<React.Key, number>(),
};

export const tableReducer: Reducer<InternalTableState, TableAction> = (
  state,
  action
) => {
  switch (action.type) {
    case "SET_SELECTED":
      return {
        ...state,
        selected: {
          ...state.selected,
          [action.payload.page]: action.payload.keys,
        },
      };

    case "SET_PAGE":
      return {
        ...state,
        currentPage: action.payload,
      };

    case "TOGGLE_EXPAND": {
      const expandedKeys = new Set(state.expandedKeys);
      if (expandedKeys.has(action.payload)) {
        expandedKeys.delete(action.payload);
      } else {
        expandedKeys.add(action.payload);
      }
      return {
        ...state,
        expandedKeys: Array.from(expandedKeys),
      };
    }

    case "SET_EXPANDED_KEYS":
      return {
        ...state,
        expandedKeys: action.payload,
      };

    case "SET_PING_STATE":
      return {
        ...state,
        pingedLeft: action.payload.left,
        pingedRight: action.payload.right,
      };

    case "SET_TABLE_WIDTH":
      return {
        ...state,
        tableWidth: action.payload,
      };

    case "UPDATE_COL_WIDTH": {
      const newColsWidths = new Map(state.colsWidths);
      newColsWidths.set(action.payload.key, action.payload.width);
      return {
        ...state,
        colsWidths: newColsWidths,
      };
    }

    case "RESET_SELECTION":
      return {
        ...state,
        selected: {},
      };

    default:
      return state;
  }
};

// Selector functions for derived state
export const getSelectedKeysForPage = (
  state: InternalTableState,
  page: number
): React.Key[] => {
  return state.selected[page] || [];
};

export const getIsExpanded = (
  state: InternalTableState,
  key: React.Key
): boolean => {
  return state.expandedKeys.includes(key);
};

export const getTotalSelectedCount = (state: InternalTableState): number => {
  return Object.values(state.selected).reduce(
    (total, pageKeys) => total + pageKeys.length,
    0
  );
};
