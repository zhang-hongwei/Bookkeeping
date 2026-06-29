import React from 'react';
import { ChildArea, DeleteButton, AreaLabel } from './styled';

interface ChildAreaItemProps {
  area: string;
  index: number;
  onRemove: (index: number) => void;
}

/** Generate a unique color for each area using HSL color space */
function generateColor(index: number): string {
  const hue = ((index * 30 + 1) * 1.5) % 360;
  return `hsla(${hue}, 80%, 40%, 0.7)`;
}

/**
 * A single child area displayed on the grid with a delete button and label.
 */
export default function ChildAreaItem({ area, index, onRemove }: ChildAreaItemProps) {
  return (
    <ChildArea $area={area} $color={generateColor(index)}>
      <DeleteButton onClick={() => onRemove(index)}>×</DeleteButton>
      <AreaLabel>.div{index + 1}</AreaLabel>
    </ChildArea>
  );
}
