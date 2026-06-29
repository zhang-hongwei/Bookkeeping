import * as React from 'react';
import classNames from 'classnames';
// import type { RenderExpandIconProps, Key, GetRowKey } from '../interface';

export function renderExpandIcon<RecordType>({
  prefixCls,
  record,
  onExpand,
  expanded,
  expandable,
}: any) {
  const expandClassName = `${prefixCls}-row-expand-icon`;

  if (!expandable) {
    return <span className={classNames(expandClassName, `${prefixCls}-row-spaced`)} />;
  }

  const onClick: React.MouseEventHandler<HTMLElement> = event => {
    onExpand(record, event);
    event.stopPropagation();
  };

  return (
    <span
      className={classNames(expandClassName, {
        [`${prefixCls}-row-expanded`]: expanded,
        [`${prefixCls}-row-collapsed`]: !expanded,
      })}
      onClick={onClick}
    />
  );
}

export function findAllChildrenKeys<RecordType>(
  data: readonly RecordType[],
  getRowKey: any,
  childrenColumnName: string,
): any[] {
  const keys: any[] = [];

  function dig(list: readonly RecordType[]) {
    (list || []).forEach((item, index) => {
      keys.push(getRowKey(item, index));

      dig((item as any)[childrenColumnName]);
    });
  }

  dig(data);

  return keys;
}
