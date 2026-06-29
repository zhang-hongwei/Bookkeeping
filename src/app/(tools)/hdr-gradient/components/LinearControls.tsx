'use client'

import { useActiveLayer, useGradientActions } from '@/store/hdr-gradient'
import AngleIcon from './AngleIcon'
import NamedDirections from './NamedDirections'
import RangeSlider from './RangeSlider'
import { GRADIENT_ANGLES } from '../types'
import type { NamedDirection } from '../types'

export default function LinearControls() {
  const activeLayer = useActiveLayer()
  const { setLinearAngle, setLinearNamedAngle } = useGradientActions()

  if (!activeLayer) return null

  const angle = Number(activeLayer.linear.angle) || 0

  return (
    <div className="control-set">
      {/* Angle direction selector */}
      <div className="label-row">
        <span className="label-text">Angle</span>
        <NamedDirections
          id="linear-angle"
          mode="angle"
          selected={activeLayer.linear.namedAngle}
          onChange={(v) => setLinearNamedAngle(v as NamedDirection)}
        />
        <select
          value={activeLayer.linear.namedAngle}
          onChange={(e) => setLinearNamedAngle(e.target.value as NamedDirection)}
          className="colorspace-select"
          style={{ fontSize: 'var(--font-size-0)' }}
        >
          <option disabled value="--">--</option>
          {GRADIENT_ANGLES.map((dir) => (
            <option key={dir} value={dir}>{dir}</option>
          ))}
        </select>
      </div>

      {/* Angle slider row */}
      <div className="slider-row">
        <AngleIcon angle={angle} />
        <RangeSlider
          value={angle}
          onChange={(v) => setLinearAngle(v)}
          min={0}
          max={360}
          step={1}
          accentColor="var(--brand)"
        />
        <div className="input-suffix">
          <input
            type="number"
            className="number-input"
            value={activeLayer.linear.angle ?? ''}
            onChange={(e) => setLinearAngle(e.target.value)}
            min={0}
            max={360}
            step={1}
          />
          <span className="suffix">°</span>
        </div>
      </div>
    </div>
  )
}
