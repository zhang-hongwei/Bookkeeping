/**
 * ColorStopBar Component
 * Interactive gradient bar with draggable stop markers
 */

'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Box, Tooltip } from '@mui/material';
import type { ColorStop } from './types';

interface ColorStopBarProps {
  stops: ColorStop[];
  selectedStopId: string | null;
  onSelectStop: (id: string) => void;
  onAddStop: (position: number) => void;
  onMoveStop: (id: string, position: number) => void;
  gradientCSS: string;
}

const ColorStopBar: React.FC<ColorStopBarProps> = ({
  stops,
  selectedStopId,
  onSelectStop,
  onAddStop,
  onMoveStop,
  gradientCSS,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const getPositionFromEvent = useCallback(
    (e: React.MouseEvent | MouseEvent): number => {
      if (!barRef.current) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      return Math.max(0, Math.min(100, (x / rect.width) * 100));
    },
    [],
  );

  const handleBarClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.stop-marker')) return;
      onAddStop(getPositionFromEvent(e));
    },
    [getPositionFromEvent, onAddStop],
  );

  const handleMarkerMouseDown = useCallback(
    (e: React.MouseEvent, stopId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggingId(stopId);
      onSelectStop(stopId);
    },
    [onSelectStop],
  );

  // Mouse drag
  useEffect(() => {
    if (!draggingId) return;
    const onMove = (e: MouseEvent) => onMoveStop(draggingId, getPositionFromEvent(e));
    const onUp = () => setDraggingId(null);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [draggingId, getPositionFromEvent, onMoveStop]);

  // Touch drag
  const handleTouchStart = useCallback(
    (e: React.TouchEvent, stopId: string) => {
      e.preventDefault();
      setDraggingId(stopId);
      onSelectStop(stopId);
    },
    [onSelectStop],
  );

  useEffect(() => {
    if (!draggingId) return;
    const onTouchMove = (e: TouchEvent) => {
      if (!barRef.current || !e.touches[0]) return;
      const rect = barRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      onMoveStop(draggingId, Math.max(0, Math.min(100, (x / rect.width) * 100)));
    };
    const onTouchEnd = () => setDraggingId(null);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [draggingId, onMoveStop]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        ref={barRef}
        onClick={handleBarClick}
        sx={{
          width: '100%',
          height: 32,
          borderRadius: 2,
          background: gradientCSS,
          cursor: 'crosshair',
          position: 'relative',
          boxShadow: (theme) =>
            `inset 0 0 0 1px ${theme.vars?.palette?.divider ?? theme.palette.divider}`,
          // border: '1px solid red'
        }}
      >
        {stops.map((stop) => (
          <Tooltip key={stop.id} title={`${stop.position.toFixed(0)}%`} arrow>
            <Box
              className="stop-marker"
              onMouseDown={(e) => handleMarkerMouseDown(e, stop.id)}
              onTouchStart={(e) => handleTouchStart(e, stop.id)}
              sx={{
                position: 'absolute',
                top: -6,
                left: `${stop.position}%`,
                transform: 'translateX(-50%)',
                cursor: draggingId === stop.id ? 'grabbing' : 'grab',
                zIndex: draggingId === stop.id ? 10 : 1,
                transition: draggingId ? 'none' : 'left 0.1s ease',
              }}
            >
              <Box
                sx={{
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: (theme) =>
                    `12px solid ${selectedStopId === stop.id
                      ? theme.vars?.palette?.primary?.main ?? theme.palette.primary.main
                      : theme.vars?.palette?.common?.white ?? theme.palette.common.white
                    }`,
                  filter: (theme) =>
                    selectedStopId === stop.id
                      ? `drop-shadow(0 0 4px ${theme.vars?.palette?.primary?.main ?? theme.palette.primary.main})`
                      : 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -12,
                    left: -6,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: stop.color,
                    border: (theme) =>
                      `2px solid ${selectedStopId === stop.id
                        ? theme.vars?.palette?.primary?.main ?? theme.palette.primary.main
                        : theme.vars?.palette?.common?.white ?? theme.palette.common.white
                      }`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  },
                }}
              />
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

export default React.memo(ColorStopBar);
