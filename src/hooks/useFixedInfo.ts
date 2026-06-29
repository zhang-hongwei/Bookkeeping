import useMemo from 'rc-util/lib/hooks/useMemo'
import isEqual from 'rc-util/lib/isEqual'
// import type { ColumnType, Direction, StickyOffsets } from '../interface';
import { getCellFixedInfo } from './fixUtil'

export default function useFixedInfo<RecordType>(
  flattenColumns: any,
  stickyOffsets: any,
  direction: any,
) {
  const fixedInfoList = flattenColumns.map((_: any, colIndex: any) =>
    getCellFixedInfo(
      colIndex,
      colIndex,
      flattenColumns,
      stickyOffsets,
      direction,
    ),
  )

  return useMemo(
    () => fixedInfoList,
    [fixedInfoList],
    (prev, next) => !isEqual(prev, next),
  )
}
