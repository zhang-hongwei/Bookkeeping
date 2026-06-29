'use client'

import { useActiveLayer, useGradientActions } from '@/store/hdr-gradient'
import AngleIcon from './AngleIcon'
import NamedDirections from './NamedDirections'
import RangeSlider from './RangeSlider'
import { NAMED_POSITIONS } from '../types'
import type { NamedPosition } from '../types'

export default function ConicControls() {
  const activeLayer = useActiveLayer()
  const { setConicAngle, setConicPosition, setConicNamedPosition } = useGradientActions()

  if (!activeLayer) return null

  const { conic } = activeLayer
  const angle = Number(conic.angle) || 0
  const xPos = conic.position.x ?? 50
  const yPos = conic.position.y ?? 50

  return (
    <>
      {/* Angle */}
      <div className="control-set">
        <div className="label-row">
          <span className="label-text">Angle</span>
        </div>
        <div className="slider-row">
          <AngleIcon angle={angle} />
          <RangeSlider
            value={angle}
            onChange={(v) => setConicAngle(v)}
            min={0}
            max={360}
            step={1}
          />
          <div className="input-suffix">
            <input
              type="number"
              className="number-input"
              value={conic.angle}
              onChange={(e) => setConicAngle(e.target.value)}
              min={0}
              max={360}
              step={1}
            />
            <span className="suffix">°</span>
          </div>
        </div>
      </div>

      {/* Position */}
      <div className="control-set">
        <div className="label-row">
          <span className="label-text">Position</span>
          <NamedDirections
            id="conic-position"
            mode="position"
            selected={conic.namedPosition}
            onChange={(v) => setConicNamedPosition(v as NamedPosition)}
          />
          <select
            value={conic.namedPosition}
            onChange={(e) => setConicNamedPosition(e.target.value as NamedPosition)}
            className="colorspace-select"
            style={{ fontSize: 'var(--font-size-0)' }}
          >
            <option disabled value="--">--</option>
            {NAMED_POSITIONS.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>

        {/* X/Y position sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-1)' }}>
          <div className="slider-row">
            <span className="label-text" style={{ minInlineSize: '1ch' }}>X</span>
            <RangeSlider
              value={xPos}
              onChange={(v) => setConicPosition(v, yPos)}
              min={-100}
              max={200}
              step={1}
              emptytrack
            />
            <input
              type="number"
              className="number-input"
              value={xPos}
              onChange={(e) => setConicPosition(Number(e.target.value), yPos)}
              style={{ width: '4ch' }}
            />
          </div>
          <div className="slider-row">
            <span className="label-text" style={{ minInlineSize: '1ch' }}>Y</span>
            <RangeSlider
              value={yPos}
              onChange={(v) => setConicPosition(xPos, v)}
              min={-100}
              max={200}
              step={1}
              emptytrack
            />
            <input
              type="number"
              className="number-input"
              value={yPos}
              onChange={(e) => setConicPosition(xPos, Number(e.target.value))}
              style={{ width: '4ch' }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
