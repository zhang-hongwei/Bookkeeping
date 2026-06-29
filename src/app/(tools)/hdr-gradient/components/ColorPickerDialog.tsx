'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Color from 'colorjs.io'
import { useHdrGradientStore, useGradientActions } from '@/store/hdr-gradient'
import { useShallow } from 'zustand/shallow'
import type { GradientColorStop } from '../types'
import { copyToClipboard } from '@/lib/gradient/clipboard'
import { whatsTheGamutDamnit, getColorJSspaceID, reverseColorJSspaceID } from '@/lib/gradient/colorspace'
import { parse_coords, contrast_color } from '@/lib/gradient/color'

const RGB_COLOR_SPACES = ['srgb-linear', 'display-p3', 'rec2020', 'a98-rgb', 'prophoto-rgb', 'xyz', 'xyz-d50', 'xyz-d65']

function alphaToString(alpha: number | string) {
  return alpha === '100' || alpha === 100 ? '' : ` / ${alpha}%`
}

export default function ColorPickerDialog() {
  const { colorPickerOpen, colorPickerStopIndex } = useHdrGradientStore(
    useShallow((s) => ({ colorPickerOpen: s.colorPickerOpen, colorPickerStopIndex: s.colorPickerStopIndex })),
  )
  const { setColorPickerOpen, updateStop } = useGradientActions()
  const activeLayer = useHdrGradientStore(useShallow((s) => s.layers[s.activeLayerIndex]))
  const dialogRef = useRef<HTMLDialogElement>(null)

  const [colorStr, setColorStr] = useState('')
  const [space, setSpace] = useState('oklch')
  const [coords, setCoords] = useState({ c1: '75', c2: '0.3', c3: '180', alpha: '100' })

  const currentStop = useMemo(() => {
    if (!activeLayer || colorPickerStopIndex == null) return null
    const stop = activeLayer.stops[colorPickerStopIndex]
    return stop?.kind === 'stop' ? (stop as GradientColorStop) : null
  }, [activeLayer, colorPickerStopIndex])

  useEffect(() => {
    if (colorPickerOpen && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal()
    } else if (!colorPickerOpen && dialogRef.current?.open) {
      dialogRef.current.close()
    }
  }, [colorPickerOpen])

  useEffect(() => {
    if (currentStop?.color) {
      try {
        const c = new Color(currentStop.color)
        setColorStr(currentStop.color)
        const sid = reverseColorJSspaceID(c.space.id)
        setSpace(sid)
        applyColorToCoords(c, sid)
      } catch { /* ignore */ }
    }
  }, [currentStop?.color])

  function applyColorToCoords(c: Color, sp: string) {
    const [a, b, d] = c.coords
    if (sp === 'oklch') {
      setCoords({ c1: String(Math.round(parse_coords(a) * 100)), c2: b.toFixed(2), c3: isNaN(d) ? '0' : String(Math.round(d)), alpha: String(Math.round(c.alpha * 100)) })
    } else if (sp === 'oklab') {
      setCoords({ c1: String(Math.round(parse_coords(a) * 100)), c2: b.toFixed(2), c3: d.toFixed(2), alpha: String(Math.round(c.alpha * 100)) })
    } else {
      setCoords({ c1: String(Math.round(parse_coords(a) * 100)), c2: String(Math.round(parse_coords(b) * 100)), c3: String(Math.round(parse_coords(d) * 100)), alpha: String(Math.round(c.alpha * 100)) })
    }
  }

  function genColor(): string {
    const { c1, c2, c3, alpha } = coords
    if (space === 'oklch') return `oklch(${c1}% ${c2} ${c3}${alphaToString(alpha)})`
    if (space === 'oklab') return `oklab(${c1}% ${c2} ${c3}${alphaToString(alpha)})`
    if (space === 'hsl') return `hsl(${c3} ${c2}% ${c1}%${alphaToString(alpha)})`
    if (space === 'hwb') return `hwb(${c1} ${c2}% ${c3}%${alphaToString(alpha)})`
    if (space === 'srgb') return `rgb(${c1}% ${c2}% ${c3}%${alphaToString(alpha)})`
    if (RGB_COLOR_SPACES.includes(space)) return `color(${space === 'prophoto-rgb' ? 'prophoto-rgb' : space} ${c1}% ${c2}% ${c3}%${alphaToString(alpha)})`
    return `rgb(${c1}% ${c2}% ${c3}%${alphaToString(alpha)})`
  }

  function updateCoord(key: string, value: string) {
    const newCoords = { ...coords, [key]: value }
    setCoords(newCoords)
    try {
      const generated = genColor()
      setColorStr(generated)
      if (colorPickerStopIndex != null) updateStop(colorPickerStopIndex, { color: generated } as any)
    } catch { /* invalid */ }
  }

  const gamut = useMemo(() => { try { return whatsTheGamutDamnit(colorStr) } catch { return '' } }, [colorStr])
  const textOverlay = useMemo(() => { try { return contrast_color(colorStr) } catch { return 'white' } }, [colorStr])

  function getChannelLabel(index: number): string {
    const labels: Record<number, Record<string, string>> = {
      0: { hsl: 'H', hwb: 'H', oklch: 'L', lch: 'L' },
      1: { hsl: 'S', hwb: 'W', oklch: 'C', lch: 'C', oklab: 'a', lab: 'a' },
      2: { hsl: 'L', hwb: 'B', oklch: 'H', lch: 'H', hsl: 'L', oklab: 'b', lab: 'b' },
    }
    return labels[index]?.[space] ?? (index === 0 ? 'R' : index === 1 ? 'G' : 'B')
  }

  const maxValues = {
    c2: space === 'oklch' || space === 'lch' ? 50 : 100,
    c3: space === 'oklch' || space === 'lch' ? 360 : 100,
  }

  return (
    <dialog
      ref={dialogRef}
      className="color-picker-dialog"
      onClose={() => setColorPickerOpen(false)}
      style={{
        '--user-color': colorStr,
        '--contrast-color': textOverlay,
        '--counter-contrast-color': textOverlay === 'white' ? 'black' : 'white',
      } as React.CSSProperties}
    >
      <div className="hd-color-picker">
        {/* Color preview area */}
        <div className="color-picker-preview">
          <select
            value={space}
            onChange={(e) => {
              try {
                const c = new Color(colorStr)
                const converted = c.to(getColorJSspaceID(e.target.value)).toGamut()
                setSpace(e.target.value)
                applyColorToCoords(converted, e.target.value)
              } catch { setSpace(e.target.value) }
            }}
            className="colorspace-select-picker"
          >
            <optgroup label="Standard">
              <option value="srgb">rgb</option>
              <option value="srgb-linear">srgb-linear</option>
              <option value="hsl">hsl</option>
              <option value="hwb">hwb</option>
            </optgroup>
            <optgroup label="HDR">
              <option value="display-p3">display-p3</option>
              <option value="a98-rgb">a98-rgb</option>
            </optgroup>
            <optgroup label="Ultra HDR">
              <option value="lab">lab</option>
              <option value="lch">lch</option>
              <option value="oklch">oklch</option>
              <option value="oklab">oklab</option>
              <option value="rec2020">rec2020</option>
              <option value="prophoto-rgb">prophoto-rgb</option>
              <option value="xyz">xyz</option>
              <option value="xyz-d50">xyz-d50</option>
              <option value="xyz-d65">xyz-d65</option>
            </optgroup>
          </select>
          <span className="gamut-badge">{gamut}</span>
          <output
            className="color-information"
            onClick={() => copyToClipboard(colorStr)}
          >
            {colorStr}
            <svg className="copy-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
          </output>
        </div>

        {/* Color controls */}
        <div className="color-picker-controls">
          {(['c1', 'c2', 'c3', 'alpha'] as const).map((key, idx) => (
            <div key={key} className="channel-control">
              <span className="channel-label">
                {key === 'alpha' ? 'A' : getChannelLabel(idx)}
              </span>
              <div className="channel-slider-wrap">
                <input
                  type="range"
                  className="range-slider"
                  style={{ '--track-fill': `${(Number(coords[key]) / (key === 'alpha' ? 100 : key === 'c2' ? maxValues.c2 : key === 'c3' ? maxValues.c3 : 100)) * 100}%` } as React.CSSProperties}
                  value={Number(coords[key])}
                  min={0}
                  max={key === 'alpha' ? 100 : key === 'c2' ? maxValues.c2 : key === 'c3' ? maxValues.c3 : 100}
                  step={1}
                  onChange={(e) => updateCoord(key, e.target.value)}
                />
              </div>
              <input
                type="number"
                className="channel-number"
                value={coords[key]}
                onChange={(e) => updateCoord(key, e.target.value)}
                min={0}
                max={key === 'alpha' ? 100 : key === 'c2' ? maxValues.c2 : key === 'c3' ? maxValues.c3 : 100}
              />
            </div>
          ))}
        </div>
      </div>
    </dialog>
  )
}
