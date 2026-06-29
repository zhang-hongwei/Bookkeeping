'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useActiveLayer, useGradientActions } from '@/store/hdr-gradient'
import { useHdrGradientStore } from '@/store/hdr-gradient'
import { useShallow } from 'zustand/shallow'
import { updateStops, removeStop } from '@/lib/gradient/stops'
import { contrast_color_prefer_white } from '@/lib/gradient/color'
import { randomNumber } from '@/lib/gradient/numbers'
import type { GradientStop, GradientColorStop, NamedDirection } from '../types'
import { NAMED_DIRECTION_TO_DEG } from '../types'

interface Props {
  w: number
  h: number
}

const NAMED_SNAP: [string, number][] = [
  ['to top', 0],
  ['to top right', 45],
  ['to right', 90],
  ['to bottom right', 135],
  ['to bottom', 180],
  ['to bottom left', 225],
  ['to left', 270],
  ['to top left', 315],
]

function degToRad(deg: number) {
  return (deg * Math.PI) / 180
}

export default function LinearOverlay({ w, h }: Props) {
  const activeLayer = useActiveLayer()
  const actions = useGradientActions()
  const overlayRef = useRef<HTMLDivElement>(null)
  const [showGhost, setShowGhost] = useState(false)
  const [ghostPercent, setGhostPercent] = useState<number | null>(null)

  const dragRef = useRef({
    moving: false,
    rotating: false,
    start: { x: 0, y: 0 },
    left: 0,
    stopIndex: null as number | null,
    target: null as HTMLElement | null,
    lastAngle: null as number | null,
    centerX: 0,
    centerY: 0,
    removedStop: null as GradientStop | null,
    removedIndex: null as number | null,
  })

  const angle = activeLayer ? Number(activeLayer.linear.angle) || 0 : 0
  const namedAngle = activeLayer?.linear.namedAngle ?? '--'

  // Named angle snapping effect
  useEffect(() => {
    if (!activeLayer || dragRef.current.rotating) return
    const val = angle
    if (Number.isNaN(val)) return
    const match = NAMED_SNAP.find(([_, deg]) => deg === ((val % 360) + 360) % 360)
    if (match && namedAngle !== match[0]) {
      actions.setLinearNamedAngle(match[0] as NamedDirection)
    }
  }, [angle, namedAngle, activeLayer, actions])

  const gradientLineLength = useCallback(
    (a: number) => {
      if (!w && !h) return null
      const rad = degToRad(a)
      return Math.round(Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad))) + 'px'
    },
    [w, h],
  )

  const gradientAngle = useCallback((ng: number) => ng - 90, [])

  const computePercentFromPointer = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const overlay = overlayRef.current?.parentElement
      const lineEl = overlay?.querySelector('.overlay-line') as HTMLElement | null
      if (!lineEl) return 0
      const lineRect = lineEl.getBoundingClientRect()
      const cx = lineRect.left + lineRect.width / 2
      const cy = lineRect.top + lineRect.height / 2
      const rotDeg = angle - 90
      const rot = (rotDeg * Math.PI) / 180
      const ux = Math.cos(rot)
      const uy = Math.sin(rot)
      const px = e.clientX - cx
      const py = e.clientY - cy
      const t = px * ux + py * uy
      const a = (Math.PI / 180) * angle
      const L = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a))
      const percent = ((t + L / 2) / L) * 100
      return Math.round(Math.max(0, Math.min(100, percent)))
    },
    [angle, w, h],
  )

  // Pointer event handling
  useEffect(() => {
    const node = overlayRef.current
    if (!node) return

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      const isStop = target.closest('[data-stop-index]')
      const isRotator = target.closest('.invisible-rotator')

      if (isStop) {
        if (target.closest('.stop-color')) return
        const idx = Number((isStop as HTMLElement).dataset.stopIndex)
        dragRef.current.target = isStop as HTMLElement
        dragRef.current.start = { x: e.screenX, y: e.screenY }
        dragRef.current.stopIndex = idx
      } else if (isRotator) {
        try {
          node.setPointerCapture(e.pointerId)
        } catch {}
        const previewRect = isRotator.closest('.preview')?.getBoundingClientRect()
        if (previewRect) {
          dragRef.current.centerX = previewRect.left + previewRect.width / 2
          dragRef.current.centerY = previewRect.top + previewRect.height / 2
          const deltaX = e.clientX - dragRef.current.centerX
          const deltaY = e.clientY - dragRef.current.centerY
          let currentAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
          if (currentAngle < 0) currentAngle += 360
          dragRef.current.lastAngle = currentAngle
        }
        dragRef.current.rotating = true
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      const d = dragRef.current

      // Arm stop drag on movement threshold
      if (!d.moving && d.stopIndex != null) {
        const dx = (e.screenX ?? 0) - d.start.x
        const dy = (e.screenY ?? 0) - d.start.y
        if (Math.hypot(dx, dy) > 3) {
          d.moving = true
          try {
            node.setPointerCapture(e.pointerId)
          } catch {}
          // Initialize drag position
          const store = useHdrGradientStore.getState()
          const layer = store.layers[store.activeLayerIndex]
          const stop = layer?.stops[d.stopIndex]
          if (!stop) return
          if (stop.kind === 'hint') {
            d.left = parseInt(String(stop.percentage))
          } else {
            const pos = d.target?.dataset.position === '1' ? stop.position1 : stop.position2
            d.left = parseInt(String(pos))
          }
        }
      }

      if (d.moving) {
        try {
          node.setPointerCapture(e.pointerId)
        } catch {}

        // Project pointer movement onto the line axis
        const rot = (angle - 90) * (Math.PI / 180)
        const ux = Math.cos(rot)
        const uy = Math.sin(rot)
        const dot = (e.movementX || 0) * ux + (e.movementY || 0) * uy
        const a = angle * (Math.PI / 180)
        const L = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a)) || 1
        const deltaPercent = (dot / L) * 100
        d.left += deltaPercent
        d.left = Math.max(0, Math.min(100, d.left))

        // Pull-away removal
        const lineEl = node.querySelector('.overlay-line') as HTMLElement | null
        if (lineEl) {
          const rect = lineEl.getBoundingClientRect()
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const r = ((angle - 90) * Math.PI) / 180
          const nx = -Math.sin(r)
          const ny = Math.cos(r)
          const vx = e.clientX - cx
          const vy = e.clientY - cy
          const perp = vx * nx + vy * ny
          const removeArm = 36
          const insertArm = 24

          const store = useHdrGradientStore.getState()
          const stops = store.layers[store.activeLayerIndex]?.stops

          if (Math.abs(perp) > removeArm && d.stopIndex != null && !d.removedStop && stops) {
            const colorCount = stops.filter((s) => s?.kind === 'stop').length
            if (colorCount > 1) {
              d.removedStop = { ...stops[d.stopIndex] } as GradientStop
              d.removedIndex = d.stopIndex
              const updated = removeStop([...stops.map((s) => ({ ...s }))], d.stopIndex)
              actions.setStops(updated as GradientStop[])
              d.stopIndex = null
            }
          } else if (Math.abs(perp) <= insertArm && d.removedStop && d.stopIndex == null) {
            const percent = Math.max(0, Math.min(100, Math.round(d.left)))
            const currentStops = useHdrGradientStore.getState().layers[useHdrGradientStore.getState().activeLayerIndex]?.stops ?? []
            const colors = currentStops.filter((s) => s.kind === 'stop')
            let k = colors.findIndex((s) => parseFloat(String(s.position1)) > percent)
            if (k === -1) k = colors.length
            const arrIdx = k * 2
            const newStop: any = {
              kind: 'stop',
              color: (d.removedStop as GradientColorStop).color,
              auto: percent,
              position1: String(percent),
              position2: String(percent),
              _manual: true,
            }
            const newStops = [...currentStops.map((s) => ({ ...s }))] as any[]
            if (k === colors.length) {
              newStops.splice(arrIdx, 0, { kind: 'hint', percentage: null, auto: '' }, newStop)
            } else {
              newStops.splice(arrIdx, 0, newStop, { kind: 'hint', percentage: null, auto: '' })
            }
            actions.setStops(updateStops(newStops) as GradientStop[])
            d.stopIndex = arrIdx
            d.removedStop = null
            d.removedIndex = null
          }
        }

        // Update stop position
        if (d.stopIndex != null) {
          const store = useHdrGradientStore.getState()
          const stops = store.layers[store.activeLayerIndex]?.stops
          if (stops && stops[d.stopIndex]) {
            const newStops = stops.map((s) => ({ ...s })) as any[]
            const targetStop = newStops[d.stopIndex]
            if (targetStop.kind === 'stop') {
              if (targetStop.position1 === targetStop.position2)
                targetStop.position2 = String(Math.round(d.left))
              if (d.target?.dataset.position === '1') {
                targetStop.position1 = String(Math.round(d.left))
              } else {
                targetStop.position2 = String(Math.round(d.left))
              }
            } else {
              targetStop.percentage = String(Math.round(d.left))
            }
            actions.setStops(newStops as GradientStop[])
          }
        }
      } else if (d.rotating) {
        try {
          node.setPointerCapture(e.pointerId)
        } catch {}
        actions.setLinearNamedAngle('--')

        const deltaX = e.clientX - d.centerX
        const deltaY = e.clientY - d.centerY
        let currentAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
        if (currentAngle < 0) currentAngle += 360

        if (d.lastAngle !== null) {
          let angleDiff = currentAngle - d.lastAngle
          if (angleDiff > 180) angleDiff -= 360
          if (angleDiff < -180) angleDiff += 360
          let newAngle = angle + angleDiff
          if (newAngle >= 360) newAngle -= 360
          if (newAngle < 0) newAngle += 360
          actions.setLinearAngle(Math.round(newAngle))
        }
        d.lastAngle = currentAngle
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      try {
        node.releasePointerCapture(e.pointerId)
      } catch {}

      const wasRotating = dragRef.current.rotating
      dragRef.current.moving = false
      dragRef.current.rotating = false
      dragRef.current.stopIndex = null
      dragRef.current.target = null
      dragRef.current.start = { x: 0, y: 0 }
      dragRef.current.removedStop = null
      dragRef.current.removedIndex = null

      // Snap to named angle on rotation end
      if (wasRotating) {
        const val = Number(useHdrGradientStore.getState().layers[useHdrGradientStore.getState().activeLayerIndex]?.linear.angle)
        if (!Number.isNaN(val)) {
          const tol = 1
          for (const [name, deg] of NAMED_SNAP) {
            const d = Math.abs((((val - deg) % 360) + 540) % 360 - 180)
            if (d <= tol) {
              actions.setLinearNamedAngle(name as NamedDirection)
              break
            }
          }
        }
      }
    }

    node.addEventListener('pointerdown', onPointerDown, { passive: false })
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('dragleave', onPointerUp)

    return () => {
      node.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('dragleave', onPointerUp)
    }
  }, [angle, w, h, actions])

  const addStop = useCallback(
    (e: React.MouseEvent) => {
      const percent = computePercentFromPointer(e as any)
      const store = useHdrGradientStore.getState()
      const stops = store.layers[store.activeLayerIndex]?.stops
      if (!stops) return
      const colors = stops.filter((s) => s.kind === 'stop')
      let k = colors.findIndex((s) => parseFloat(String(s.position1)) > percent)
      if (k === -1) k = colors.length
      const arrIdx = k * 2
      const newStop: any = {
        kind: 'stop',
        color: `oklch(80% 0.3 ${randomNumber(0, 360)})`,
        auto: percent,
        position1: String(percent),
        position2: String(percent),
        _manual: true,
      }
      const newStops = [...stops.map((s) => ({ ...s }))] as any[]
      if (k === colors.length) {
        newStops.splice(arrIdx, 0, { kind: 'hint', percentage: null, auto: '' }, newStop)
      } else {
        newStops.splice(arrIdx, 0, newStop, { kind: 'hint', percentage: null, auto: '' })
      }
      actions.setStops(updateStops(newStops) as GradientStop[])
    },
    [computePercentFromPointer, actions],
  )

  const onTrackMove = useCallback(
    (e: React.MouseEvent) => {
      setGhostPercent(computePercentFromPointer(e as any))
      setShowGhost(true)
    },
    [computePercentFromPointer],
  )

  const deleteStop = useCallback(
    (stop: GradientStop) => {
      if (!activeLayer) return
      const colorCount = activeLayer.stops.filter((s) => s?.kind === 'stop').length
      if (colorCount <= 1) return
      const idx = activeLayer.stops.indexOf(stop)
      if (idx < 0) return
      actions.setStops(removeStop([...activeLayer.stops.map((s) => ({ ...s }))], idx) as GradientStop[])
    },
    [activeLayer, actions],
  )

  const pickColor = useCallback(
    (stopIndex: number, e: React.MouseEvent) => {
      e.stopPropagation()
      actions.setColorPickerOpen(true, stopIndex)
    },
    [actions],
  )

  if (!activeLayer || !w || !h) return null

  const visualAngleDeg = angle
  const angleTooltip = namedAngle === '--' ? `${angle}deg` : namedAngle
  const lineLength = gradientLineLength(visualAngleDeg)

  return (
    <>
      {/* Pie/angle indicator */}
      <div className="overlay-pie">
        {angle > 0 && <div className="overlay-visual-vert" />}
        <div
          className="overlay-visual solid"
          style={{ '--ng': `${visualAngleDeg}deg` } as React.CSSProperties}
        />
        <div className="overlay-dot" />
      </div>

      {/* Main overlay line */}
      <div
        ref={overlayRef}
        className="linear-overlay"
        style={{ rotate: `${gradientAngle(visualAngleDeg)}deg` }}
      >
        <div className="invisible-rotator" title={angleTooltip} />
        <div
          className="invisible-track"
          onClick={addStop}
          onMouseMove={onTrackMove}
          onMouseEnter={() => setShowGhost(true)}
          onMouseLeave={() => {
            setShowGhost(false)
            setGhostPercent(null)
          }}
        />
        <div className="overlay-line" style={{ width: lineLength ?? undefined }}>
          {showGhost && ghostPercent !== null && (
            <div className="ghost-stop-wrap" style={{ insetInlineStart: `${ghostPercent}%` }}>
              <div className="ghost-stop" />
            </div>
          )}
          {activeLayer.stops.map((stop, i) => {
            if (stop.kind === 'stop') {
              const s = stop as GradientColorStop
              const contrast = contrast_color_prefer_white(s.color)
              return (
                <div key={`s1-${i}`}>
                  <div
                    tabIndex={0}
                    className="overlay-stop-wrap"
                    style={{
                      insetInlineStart: `${s.position1}%`,
                      '--contrast-fill': contrast,
                    } as React.CSSProperties}
                  >
                    <div
                      className="overlay-stop"
                      data-stop-index={i}
                      data-position="1"
                      onDoubleClick={() => deleteStop(s)}
                    >
                      <button
                        className="stop-color"
                        style={{ backgroundColor: s.color }}
                        onClick={(e) => pickColor(i, e)}
                      />
                    </div>
                  </div>
                  {s.position1 !== s.position2 && (
                    <div
                      key={`s2-${i}`}
                      tabIndex={0}
                      className="overlay-stop-wrap"
                      style={{
                        insetInlineStart: `${s.position2}%`,
                        '--contrast-fill': contrast,
                      } as React.CSSProperties}
                    >
                      <div
                        className="overlay-stop"
                        data-stop-index={i}
                        data-position="2"
                        style={{
                          opacity: Number(s.position2) < Number(s.position1) ? 0.5 : 1,
                        }}
                      >
                        <button
                          className="stop-color"
                          style={{ backgroundColor: s.color }}
                          onClick={(e) => pickColor(i, e)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            }
            // Hint
            return (
              <div
                key={`h-${i}`}
                className="overlay-hint"
                tabIndex={0}
                data-stop-index={i}
                style={{
                  insetInlineStart: `${stop.percentage}%`,
                  visibility: stop.percentage == stop.auto ? 'hidden' : 'inherit',
                }}
              >
                <svg viewBox="0 0 256 256">
                  <path d="M216.49 168.49a12 12 0 0 1-17 0L128 97l-71.51 71.49a12 12 0 0 1-17-17l80-80a12 12 0 0 1 17 0l80 80a12 12 0 0 1 0 17Z" />
                </svg>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
