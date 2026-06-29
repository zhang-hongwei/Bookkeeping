'use client'

import { useState } from 'react'
import { useActiveLayer, useGradientActions } from '@/store/hdr-gradient'
import RangeSlider from './RangeSlider'
import Hint from './Hint'
import { copyToClipboard } from '@/lib/gradient/clipboard'
import { randomNumber } from '@/lib/gradient/numbers'
import { whatsTheGamutDamnit } from '@/lib/gradient/colorspace'

// SVG paths for linked/unlinked icons
const LINKED_ON_PATH =
  'M7 17q-2.075 0-3.538-1.463T2 12q0-2.075 1.463-3.538T7 7h3q.425 0 .713.288T11 8q0 .425-.288.713T10 9H7q-1.25 0-2.125.875T4 12q0 1.25.875 2.125T7 15h3q.425 0 .713.288T11 16q0 .425-.288.713T10 17H7Zm2-4q-.425 0-.713-.288T8 12q0-.425.288-.713T9 11h6q.425 0 .713.288T16 12q0 .425-.288.713T15 13H9Zm5 4q-.425 0-.713-.288T13 16q0-.425.288-.713T14 15h3q1.25 0 2.125-.875T20 12q0-1.25-.875-2.125T17 9h-3q-.425 0-.713-.288T13 8q0-.425.288-.713T14 7h3q2.075 0 3.538 1.463T22 12q0 2.075-1.463 3.538T17 17h-3Z'

const LINKED_OFF_PATH =
  'M15.825 13l-2-2h2q.425 0 .713.288t.287.712q0 .425-.288.713t-.712.287Zm3.425 3.45l-1.5-1.55q.975-.275 1.613-1.063T20 12q0-1.25-.875-2.125T17 9h-3q-.425 0-.713-.288T13 8q0-.425.288-.713T14 7h3q2.075 0 3.538 1.438T22 12q0 1.425-.75 2.638t-2 1.812Zm-.15 5.45l-17-17q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l17 17q.275.275.275.7t-.275.7q-.275.275-.7.275t-.7-.275Z'

// Transition hint icon path
const HINT_ICON_PATH =
  'M15 2c1.94 0 3.59.7 4.95 2.05C21.3 5.41 22 7.06 22 9c0 1.56-.5 2.96-1.42 4.2c-.94 1.23-2.14 2.07-3.61 2.5l.03-.32V15c0-2.19-.77-4.07-2.35-5.65S11.19 7 9 7h-.37l-.33.03c.43-1.47 1.27-2.67 2.5-3.61C12.04 2.5 13.44 2 15 2M9 8a7 7 0 0 1 7 7a7 7 0 0 1-7 7a7 7 0 0 1-7-7a7 7 0 0 1 7-7m0 2a5 5 0 0 0-5 5a5 5 0 0 0 5 5a5 5 0 0 0 5-5a5 5 0 0 0-5-5Z'

// Three-dot menu icon
const DOTS_ICON =
  'M12 20q-.825 0-1.412-.587Q10 18.825 10 18q0-.825.588-1.413Q11.175 16 12 16t1.413.587Q14 17.175 14 18q0 .825-.587 1.413Q12.825 20 12 20Zm0-6q-.825 0-1.412-.588Q10 12.825 10 12t.588-1.413Q11.175 10 12 10t1.413.587Q14 11.175 14 12t-.587 1.412Q12.825 14 12 14Zm0-6q-.825 0-1.412-.588Q10 6.825 10 6t.588-1.412Q11.175 4 12 4t1.413.588Q14 5.175 14 6t-.587 1.412Q12.825 8 12 8Z'

export default function GradientStops() {
  const activeLayer = useActiveLayer()
  const { updateStop, removeStop, duplicateStop, setColorPickerOpen, setColorPickerStopIndex } = useGradientActions()
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  if (!activeLayer) return null

  const { stops } = activeLayer
  const colorStopCount = stops.filter((s) => s.kind === 'stop').length

  function handleColorAction(value: string, i: number, selectEl: HTMLSelectElement) {
    switch (value) {
      case 'Remove':
        if (colorStopCount > 1) removeStop(i)
        break
      case 'Duplicate':
        duplicateStop(i)
        break
      case 'Copy CSS color':
        copyToClipboard(stops[i].kind === 'stop' ? (stops[i] as any).color || '' : '')
        break
      case 'Random color': {
        const newColor = `oklch(80% 0.3 ${randomNumber(0, 360)})`
        updateStop(i, { color: newColor } as any)
        break
      }
    }
    selectEl.selectedIndex = 0
  }

  return (
    <section className="gradient-stops">
      {stops.map((stop, i) => {
        if (stop.kind === 'stop') {
          const s = stop as any
          return (
            <fieldset
              key={s.id || i}
              className="stop-card"
              style={{
                accentColor: s.color,
                '--brand': s.color,
                '--gs-glow-color': s.color,
              } as React.CSSProperties}
              onDragOver={(e) => {
                if (dragIdx !== null) {
                  e.preventDefault()
                  e.currentTarget.classList.add('drop-before')
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('drop-before')
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('drop-before')
                setDragIdx(null)
              }}
            >
              <h4>Color {i}</h4>

              {i === 0 && (
                <Hint
                  title="Color stop"
                  copy="The color and position on the gradient line. Use the 3-dot menu for actions like duplicate."
                />
              )}

              {/* Color chip row */}
              <div
                className="color-chip"
                title={`Gamut: ${whatsTheGamutDamnit(s.color || '#000')}`}
              >
                <button
                  className="round"
                  style={{ backgroundColor: s.color }}
                  onClick={() => {
                    setColorPickerStopIndex(i)
                    setColorPickerOpen(true)
                  }}
                  aria-label="Pick color"
                />
                <input
                  type="text"
                  className="color-string"
                  value={s.color || ''}
                  onChange={(e) => updateStop(i, { color: e.target.value } as any)}
                />
                {/* Edit icon (appears on hover) */}
                <button
                  className="edit-icon"
                  onClick={() => {
                    setColorPickerStopIndex(i)
                    setColorPickerOpen(true)
                  }}
                  aria-label="Edit color"
                />
              </div>

              {/* Linked positions toggle + sliders */}
              <div className="positions-pair">
                <button
                  className="linked-button"
                  title="Click to relink positions"
                  onClick={() => updateStop(i, { position2: s.position1 } as any)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d={s.position1 === s.position2 ? LINKED_ON_PATH : LINKED_OFF_PATH}
                    />
                  </svg>
                </button>

                <div className="positions-stack">
                  {/* Position 1 slider */}
                  <div className="slider-set">
                    <RangeSlider
                      value={s.position1}
                      onChange={(v) => updateStop(i, { position1: String(v) } as any)}
                      accentColor={s.color}
                    />
                    <div className="input-suffix">
                      <input
                        type="number"
                        className="slider-percentage"
                        value={s.position1 ?? ''}
                        onChange={(e) => updateStop(i, { position1: e.target.value } as any)}
                      />
                      <sup>%</sup>
                    </div>
                  </div>

                  {/* Position 2 slider */}
                  <div className="slider-set">
                    <RangeSlider
                      value={s.position2}
                      onChange={(v) => updateStop(i, { position2: String(v) } as any)}
                      accentColor={s.position1 === s.position2 ? undefined : s.color}
                    />
                    <div className="input-suffix">
                      <input
                        type="number"
                        className="slider-percentage"
                        value={s.position2 ?? ''}
                        onChange={(e) => updateStop(i, { position2: e.target.value } as any)}
                      />
                      <sup>%</sup>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions dropdown */}
              <select
                className="stop-actions"
                value=""
                onChange={(e) => {
                  handleColorAction(e.target.value, i, e.currentTarget)
                  e.target.value = ''
                }}
                aria-label="Stop actions"
              >
                <option value="" disabled>Actions</option>
                <option value="Duplicate">Duplicate</option>
                <option value="Copy CSS color">Copy CSS color</option>
                <option value="Random color">Random color</option>
                <option value="Remove" disabled={colorStopCount <= 1}>Remove</option>
              </select>

              {/* Drag handle */}
              <div
                className="drag-handle"
                draggable
                onDragStart={(e) => {
                  setDragIdx(i)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onDragEnd={() => setDragIdx(null)}
              >
                <div className="drag-handle-icon" />
              </div>
            </fieldset>
          )
        }

        // Hint stop (transition)
        const h = stop as any
        return (
          <fieldset key={h.id || i} className="hint-card">
            <h4>Transition</h4>

            <div className="slider-set">
              {i === 1 && (
                <Hint
                  title="Transition hint"
                  copy="Adjusts the midpoint between 2 color stops."
                />
              )}
              <svg className="hint-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d={HINT_ICON_PATH} />
              </svg>
              <RangeSlider
                value={h.percentage}
                onChange={(v) => updateStop(i, { percentage: String(v) } as any)}
                accentColor={h.percentage == h.auto ? undefined : 'var(--link)'}
              />
              <div className="input-suffix">
                <input
                  type="number"
                  className="slider-percentage"
                  placeholder={h.auto || ''}
                  value={h.percentage ?? ''}
                  onChange={(e) => updateStop(i, { percentage: e.target.value || null } as any)}
                />
                <sup>%</sup>
              </div>
            </div>
          </fieldset>
        )
      })}

      <div className="end-dropzone" />
    </section>
  )
}
