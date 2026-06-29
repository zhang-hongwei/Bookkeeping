'use client'

import { useActiveLayer, useGradientActions } from '@/store/hdr-gradient'
import NamedDirections from './NamedDirections'
import RangeSlider from './RangeSlider'
import { NAMED_POSITIONS } from '../types'
import type { NamedPosition } from '../types'

const CIRCLE_SIZES: Record<string, string[]> = {
  'Default': ['farthest-corner'],
  'Special': ['closest-side', 'closest-corner', 'farthest-side'],
  'Lengths': ['50px', '200px', '500px'],
}

const ELLIPSE_SIZES: Record<string, string[]> = {
  'Default': ['farthest-corner'],
  'Special': ['closest-side', 'closest-corner', 'farthest-side'],
  'Lengths': ['50px 300px', '200px 300px', '500px 300px'],
}

export default function RadialControls() {
  const activeLayer = useActiveLayer()
  const { setRadialShape, setRadialSize, setRadialPosition, setRadialNamedPosition } = useGradientActions()

  if (!activeLayer) return null

  const { radial } = activeLayer
  const xPos = radial.position.x ?? 50
  const yPos = radial.position.y ?? 50
  const sizeGroups = radial.shape === 'circle' ? CIRCLE_SIZES : ELLIPSE_SIZES

  return (
    <>
      {/* Shape */}
      <div className="control-set">
        <div className="label-row">
          <span className="label-text">Shape</span>
          <div style={{ display: 'flex', gap: 'var(--size-1)' }}>
            {(['circle', 'ellipse'] as const).map((shape) => (
              <button
                key={shape}
                className={`type-switch${radial.shape === shape ? ' active' : ''}`}
                style={{
                  padding: 'var(--size-1) var(--size-2)',
                  borderRadius: 'var(--radius-round)',
                  border: radial.shape === shape ? '1px solid var(--link)' : '1px solid transparent',
                  background: 'none',
                  color: radial.shape === shape ? 'var(--text-1)' : 'var(--text-2)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-0)',
                  textTransform: 'none',
                }}
                onClick={() => setRadialShape(shape)}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Size */}
      <div className="control-set">
        <div className="label-row">
          <span className="label-text">Size</span>
          <select
            value={radial.size}
            onChange={(e) => setRadialSize(e.target.value)}
            className="colorspace-select"
            style={{ fontSize: 'var(--font-size-0)' }}
          >
            {Object.entries(sizeGroups).map(([group, sizes]) => (
              <optgroup key={group} label={group}>
                {sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Position */}
      <div className="control-set">
        <div className="label-row">
          <span className="label-text">Position</span>
          <NamedDirections
            id="radial-position"
            mode="position"
            selected={radial.namedPosition}
            onChange={(v) => setRadialNamedPosition(v as NamedPosition)}
          />
          <select
            value={radial.namedPosition}
            onChange={(e) => setRadialNamedPosition(e.target.value as NamedPosition)}
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
              onChange={(v) => setRadialPosition(v, yPos)}
              min={-100}
              max={200}
              step={1}
              emptytrack
            />
            <input
              type="number"
              className="number-input"
              value={xPos}
              onChange={(e) => setRadialPosition(Number(e.target.value), yPos)}
              style={{ width: '4ch' }}
            />
          </div>
          <div className="slider-row">
            <span className="label-text" style={{ minInlineSize: '1ch' }}>Y</span>
            <RangeSlider
              value={yPos}
              onChange={(v) => setRadialPosition(xPos, v)}
              min={-100}
              max={200}
              step={1}
              emptytrack
            />
            <input
              type="number"
              className="number-input"
              value={yPos}
              onChange={(e) => setRadialPosition(xPos, Number(e.target.value))}
              style={{ width: '4ch' }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
