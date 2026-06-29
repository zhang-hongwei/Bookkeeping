import React, { useState, useEffect } from 'react';
import { Box, OutlinedInput } from '@mui/material';
import { useGridGeneratorStore } from '../../store/gridGeneratorStore';

interface UnitInputListProps {
  direction: 'col' | 'row';
  template: string;
  gap: number;
}

/**
 * Renders a list of unit inputs for either columns or rows.
 * Positioned absolutely relative to the grid container.
 * Uses local state during editing, syncs to store on blur.
 */
export default function UnitInputList({ direction, template, gap }: UnitInputListProps) {
  const arr = useGridGeneratorStore((state) =>
    direction === 'col' ? state.colArr : state.rowArr,
  );
  const columns = useGridGeneratorStore((state) => state.columns);
  const errors = useGridGeneratorStore((state) => state.errors);
  const updateUnit = useGridGeneratorStore((state) => state.updateUnit);
  const validateUnit = useGridGeneratorStore((state) => state.validateUnit);

  // Local state for editing - only sync to store on blur
  const [localValues, setLocalValues] = useState<string[]>(arr.map(item => item.unit));

  // Sync local state when store changes externally
  useEffect(() => {
    setLocalValues(arr.map(item => item.unit));
  }, [arr]);

  const isCol = direction === 'col';

  const containerSx = isCol
    ? {
      position: 'absolute' as const,
      top: -40,
      left: 0,
      display: 'grid',
      gridTemplateColumns: template,
      gridColumnGap: `${gap}px`,
      width: '100%',
      zIndex: 2000,
    }
    : {
      position: 'absolute' as const,
      left: -60,
      top: 0,
      display: 'grid',
      gridTemplateRows: template,
      gridRowGap: `${gap}px`,
      height: '100%',
      zIndex: 2000,
    };

  const errorList = isCol ? errors.col : errors.row;

  const handleBlur = (index: number, value: string) => {
    updateUnit(direction, index, value);
    validateUnit(direction, index, value);
  };

  return (
    <Box sx={containerSx}>
      {arr.map((item, i) => (
        <Box
          key={i}
          sx={
            isCol
              ? { textAlign: 'center', position: 'relative' }
              : { display: 'flex', alignItems: 'center', position: 'relative' }
          }
        >
          <OutlinedInput
            value={localValues[i] ?? item.unit}
            onChange={(e) => {
              const newValues = [...localValues];
              newValues[i] = e.target.value;
              setLocalValues(newValues);
            }}
            onBlur={(e) => {
              handleBlur(i, e.target.value);
            }}
            sx={{
              width: isCol ? (columns > 8 ? '100%' : '50px') : '50px',
              padding: '0px',
              textAlign: 'center',
              height: '32px'
            }}
            aria-label={isCol ? `Grid Template Column ${i + 1}` : `Grid Template Row ${i + 1}`}
          />
          {errorList.includes(i) && (
            <Box
              sx={{
                position: 'absolute',
                bottom: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#6d1a39',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              Invalid CSS unit
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}
