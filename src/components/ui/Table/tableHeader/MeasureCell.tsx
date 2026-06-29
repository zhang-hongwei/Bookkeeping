import * as React from 'react';
import ResizeObserver from 'rc-resize-observer';

export interface MeasureCellProps {
  columnKey: React.Key;
  onColumnResize: (key: React.Key, width: number) => void;
}

export default function MeasureCell({ columnKey, onColumnResize }: MeasureCellProps) {
  const cellRef = React.useRef<any>();

  React.useEffect(() => {
    // 使用多次检查确保获取到正确的宽度
    const measureWidth = () => {
      if (cellRef.current) {
        const width = cellRef.current.offsetWidth;
        if (width > 0) {
          onColumnResize(columnKey, width);
        } else {
          // 如果宽度为0，延迟再次检查
          setTimeout(measureWidth, 10);
        }
      }
    };

    // 立即测量
    measureWidth();
    
    // 也在下一帧测量，确保DOM完全渲染
    const timer = setTimeout(measureWidth, 0);

    return () => clearTimeout(timer);
  }, [columnKey, onColumnResize]);

  return (
    <ResizeObserver data={columnKey}>
      <td ref={cellRef} style={{ padding: 0, border: 0, height: 0 }}>
        <div style={{ height: 0, overflow: 'hidden' }}>&nbsp;</div>
      </td>
    </ResizeObserver>
  );
}
