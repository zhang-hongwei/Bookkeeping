'use client'
import { useRef, useState, useEffect } from "react";

export const flatColumns = (columns: any, parentKey = "key") => {
  return columns
    .filter((column: any) => column && typeof column === "object")
    .reduce((list: any, column: any, index: any) => {
      const { fixed } = column;
      const parsedFixed = fixed === true ? "left" : fixed;
      const mergedKey = `${parentKey}-${index}`;

      const subColumns = column.children;
      if (subColumns && subColumns.length > 0) {
        return [
          ...list,
          ...flatColumns(subColumns, mergedKey).map((subColum: any) => ({
            fixed: parsedFixed,
            ...subColum,
          })),
        ];
      }
      return [
        ...list,
        {
          key: mergedKey,
          ...column,
          fixed: parsedFixed,
        },
      ];
    }, []);
};

const INTERNAL_KEY_PREFIX = "RC_TABLE_KEY";

function toArray<T>(arr: T | readonly T[]): T[] {
  if (arr === undefined || arr === null) {
    return [];
  }
  return (Array.isArray(arr) ? arr : [arr]) as T[];
}

export interface GetColumnKeyColumn<T = any> {
  key?: any;
  dataIndex?: any;
}

export function getColumnsKey(columns: any) {
  const columnKeys: React.Key[] = [];
  const keys: Record<PropertyKey, boolean> = {};

  columns.forEach((column: any) => {
    const { key, dataIndex } = column || {};

    let mergedKey = key || toArray(dataIndex).join("-") || INTERNAL_KEY_PREFIX;
    while (keys[mergedKey as string]) {
      mergedKey = `${mergedKey}_next`;
    }
    keys[mergedKey as string] = true;

    columnKeys.push(mergedKey);
  });

  return columnKeys;
}

export function validateValue<T>(val: T) {
  return val !== null && val !== undefined;
}

export function useLayoutState<State>(
  defaultState: State
): [State, (updater: any) => void] {
  const stateRef = useRef(defaultState);
  const [, forceUpdate] = useState({});

  const lastPromiseRef = useRef<any>(null);
  const updateBatchRef = useRef<any>([]);

  function setFrameState(updater: any) {
    updateBatchRef.current.push(updater);

    const promise = Promise.resolve();
    lastPromiseRef.current = promise;

    promise.then(() => {
      if (lastPromiseRef.current === promise) {
        const prevBatch = updateBatchRef.current;
        const prevState = stateRef.current;
        updateBatchRef.current = [];

        prevBatch.forEach((batchUpdater: any) => {
          stateRef.current = batchUpdater(stateRef.current);
        });

        lastPromiseRef.current = null;

        if (prevState !== stateRef.current) {
          forceUpdate({});
        }
      }
    });
  }

  useEffect(
    () => () => {
      lastPromiseRef.current = null;
    },
    []
  );

  return [stateRef.current, setFrameState];
}
