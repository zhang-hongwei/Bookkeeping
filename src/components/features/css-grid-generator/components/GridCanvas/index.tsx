/**
 * GridCanvas Component - Replicates original AppGrid.vue
 * Dual layer architecture for grid interaction and area display
 */

import React, { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useGridGeneratorStore } from '../../store/gridGeneratorStore';
import { Container, GridContainer, GridLayer, GridBox } from './styled';
import UnitInputList from './UnitInputList';
import ChildAreaItem from './ChildAreaItem';
import { useDragSelection } from './useDragSelection';

/**
 * GridCanvas Component
 * Dual layer architecture for grid interaction and area display
 * - Bottom layer: Grid boxes for drag selection
 * - Top layer: Named child areas
 */

export default function GridCanvas() {
  const theme = useTheme();

  // Get state using Zustand selectors
  const columns = useGridGeneratorStore((state) => state.columns);
  const rows = useGridGeneratorStore((state) => state.rows);
  const columnGap = useGridGeneratorStore((state) => state.columnGap);
  const rowGap = useGridGeneratorStore((state) => state.rowGap);
  const colArr = useGridGeneratorStore((state) => state.colArr);
  const rowArr = useGridGeneratorStore((state) => state.rowArr);
  const childArea = useGridGeneratorStore((state) => state.childArea);
  const removeChildren = useGridGeneratorStore((state) => state.removeChildren);
  const initializeFromURL = useGridGeneratorStore((state) => state.initializeFromURL);
  const getColTemplate = useGridGeneratorStore((state) => state.getColTemplate);
  const getRowTemplate = useGridGeneratorStore((state) => state.getRowTemplate);
  const getDivNum = useGridGeneratorStore((state) => state.getDivNum);

  // Get computed values (recomputed on each render triggered by the selectors above)
  const colTemplate = getColTemplate();
  const rowTemplate = getRowTemplate();
  const divNum = getDivNum();

  // Drag selection
  const {
    handleMouseDown,
    handleMouseUp,
    handleMouseEnter,
    handleTouchStart,
    handleTouchEnd,
    isInRange,
  } = useDragSelection(columns);

  // Initialize from URL on mount
  useEffect(() => {
    const search = window.location.search;
    if (search) {
      initializeFromURL(search);
    }
  }, [initializeFromURL]);

  return (
    <Container>
      {/* Column unit inputs */}
      <UnitInputList direction="col" template={colTemplate} gap={columnGap} />

      {/* Row unit inputs */}
      <UnitInputList direction="row" template={rowTemplate} gap={rowGap} />

      {/* Main Grid Container */}
      <GridContainer>
        {/* Bottom Layer - Grid boxes for dragging */}
        <GridLayer
          $colTemplate={colTemplate}
          $rowTemplate={rowTemplate}
          $columnGap={columnGap}
          $rowGap={rowGap}
        >
          {Array.from({ length: divNum }, (_, i) => {
            const inRange = isInRange(i);
            return (
              <GridBox
                key={i}
                data-id={i + 1}
                onMouseDown={(e) => handleMouseDown(e, i)}
                onMouseUp={(e) => handleMouseUp(e, i)}
                onMouseEnter={() => handleMouseEnter(i)}
                onTouchStart={(e) => handleTouchStart(e, i)}
                onTouchEnd={(e) => handleTouchEnd(e, i)}
                sx={inRange ? {
                  backgroundColor: `${theme.palette.primary.main}33`,
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: `inset 0 0 8px ${theme.palette.primary.main}44`,
                } : undefined}
              />
            );
          })}
        </GridLayer>

        {/* Top Layer - Child areas */}
        <GridLayer
          $colTemplate={colTemplate}
          $rowTemplate={rowTemplate}
          $columnGap={columnGap}
          $rowGap={rowGap}
          sx={{ pointerEvents: 'none' }}
        >
          {childArea.map((area, i) => (
            <ChildAreaItem key={i} area={area} index={i} onRemove={removeChildren} />
          ))}
        </GridLayer>
      </GridContainer>
    </Container>
  );
}
