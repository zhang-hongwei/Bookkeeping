'use client'

import React from 'react'

interface RangeSliderProps {
  value: number | string | null | undefined
  onChange?: (value: number) => void
  min?: number | string
  max?: number | string
  step?: number | string
  emptytrack?: boolean
  accentColor?: string
  className?: string
}

export default function RangeSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  emptytrack,
  accentColor,
  className,
}: RangeSliderProps) {
  const numValue = value != null ? Number(value) : Number(min)
  const numMin = Number(min)
  const numMax = Number(max) || 100
  const numStep = Number(step)

  const trackFill = `${(numValue / numMax) * 100}%`

  const classNames = [
    'range-slider',
    emptytrack && 'no-track-fill',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <input
      type="range"
      className={classNames}
      value={numValue}
      min={numMin}
      max={numMax}
      step={numStep}
      onChange={(e) => onChange?.(Number(e.target.value))}
      style={{
        '--track-fill': trackFill,
        '--accent-color': accentColor,
      } as React.CSSProperties}
    />
  )
}
