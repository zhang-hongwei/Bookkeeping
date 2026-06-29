'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useActiveLayer, useGradientActions } from '@/store/hdr-gradient'
import { useHdrGradientStore } from '@/store/hdr-gradient'
import { useShallow } from 'zustand/shallow'
import { updateStops, removeStop } from '@/lib/gradient/stops'
import { contrast_color_prefer_white } from '@/lib/gradient/color'
import { randomNumber } from '@/lib/gradient/numbers'
import type { GradientStop, GradientColorStop } from '../types'
import { NAMED_POSITION_TO_PERCENT } from '../types'

interface Props {
  w: number
  h: number
}

function percentToDecimal(percent: number) {
  return percent / 100
}

function normalizeDeg(a: number) {
  a = a % 360
  if (a < 0) a += 360
  return a
}

function gradientAngle(ng: number) {
  return ng - 90
}

function nearestNamedPosName(x: number, y: number): string | null {
  const is = (a: number, b: number) => a === b
  if (is(x, 50) && is(y, 50)) return 'center'
  if (is(y, 0)) {
    if (is(x, 0)) return 'top left'
    if (is(x, 50)) return 'top'
    if (is(x, 100)) return 'top right'
  }
  if (is(y, 100)) {
    if (is(x, 0)) return 'bottom left'
    if (is(x, 50)) return 'bottom'
    if (is(x, 100)) return 'bottom right'
  }
  if (is(x, 0) && is(y, 50)) return 'left'
  if (is(x, 100) && is(y, 50)) return 'right'
  return null
}

export default function ConicOverlay({ w, h }: Props) {
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
    top: 0,
    stopIndex: null as number | null,
    target: null as HTMLElement | null,
    angle: null as number | null,
    lastAngle: null as number | null,
    centerX: 0,
    centerY: 0,
    removedStop: null as GradientStop | null,
    removedIndex: null as number | null,
    visualOffsetDeg: null as number | null,
  })

  const conicAngle = activeLayer ? Number(activeLayer.conic.angle) || 0 : 0

  // Named position sync
  useEffect(() => {
    if (!activeLayer || dragRef.current.moving || dragRef.current.rotating) return
    const x = Number(activeLayer.conic.position.x)
    const y = Number(activeLayer.conic.position.y)
    if (Number.isNaN(x) || Number.isNaN(y)) return
    const name = nearestNamedPosName(x, y)
    if (name && activeLayer.conic.namedPosition !== name) {
      actions.setConicNamedPosition(name as any)
    }
  }, [activeLayer?.conic.position.x, activeLayer?.conic.position.y, activeLayer?.conic.namedPosition, actions])

  const determineAbsPosition = useCallback(() => {
    if (!activeLayer) return { x: 0, y: 0 }
    let x = activeLayer.conic.position.x ?? 50
    let y = activeLayer.conic.position.y ?? 50
    if (activeLayer.conic.namedPosition !== '--') {
      const namedPos = NAMED_POSITION_TO_PERCENT[activeLayer.conic.namedPosition]
      if (namedPos) {
        x = namedPos.x
        y = namedPos.y
      }
    }
    return {
      x: Math.round(w * percentToDecimal(x)),
      y: Math.round(h * percentToDecimal(y)),
    }
  }, [activeLayer, w, h])

  const overlayPosition = useCallback(() => {
    if (!activeLayer) return { x: '50%', y: '50%' }
    if (activeLayer.conic.namedPosition !== '--') {
      const abs = determineAbsPosition()
      return { x: abs.x + 'px', y: abs.y + 'px' }
    }
    return {
      x: (activeLayer.conic.position.x ?? 50) + '%',
      y: (activeLayer.conic.position.y ?? 50) + '%',
    }
  }, [activeLayer, determineAbsPosition])

  const computeVisualOffsetDeg = useCallback((root: HTMLElement | null): number | null => {
    try {
      const stopsEl = root?.querySelector('.conic-stops')
      const sample = root?.querySelector('.conic-stops .overlay-stop')
      if (!stopsEl || !sample) return null
      const rect = stopsEl.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const srect = sample.getBoundingClientRect()
      const sx = srect.left + srect.width / 2
      const sy = srect.top + srect.height / 2
      let screenDeg = Math.atan2(sy - cy, sx - cx) * (180 / Math.PI)
      if (screenDeg < 0) screenDeg += 360
      const idx = parseInt((sample as HTMLElement).dataset.stopIndex || '0')
      const pos = (sample as HTMLElement).dataset.position === '2' ? 'position2' : 'position1'
      const store = useHdrGradientStore.getState()
      const stops = store.layers[store.activeLayerIndex]?.stops
      const declared = stops?.[idx]?.[pos as 'position1' | 'position2'] ?? 0
      const declaredDeg = (parseFloat(String(declared)) / 100) * 360
      return normalizeDeg(screenDeg - declaredDeg)
    } catch {
      return null
    }
  }, [])

  const computePercentFromPointer = useCallback(
    (e: React.MouseEvent) => {
      const root = (e.currentTarget as HTMLElement).closest('.conic-overlay')
      const stopsEl = root?.querySelector('.conic-stops')
      if (!stopsEl) return 0
      const rect = stopsEl.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      let deg = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
      if (deg < 0) deg += 360
      const dynamicOffset = computeVisualOffsetDeg(root as HTMLElement)
      const baseOffset = normalizeDeg(conicAngle - 180)
      const offset = dynamicOffset ?? baseOffset
      const localDeg = normalizeDeg(deg - offset)
      return Math.round((localDeg / 360) * 100)
    },
    [conicAngle, computeVisualOffsetDeg],
  )

  // Pointer events
  useEffect(() => {
    const node = overlayRef.current
    if (!node) return

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      const isStop = target.closest('[data-stop-index]')
      const isRotator = target.closest('.invisible-rotator')
      const isDrag = target.closest('.overlay-dragzone')
      const isRing = target.closest('.invisible-ring')

      if (isRing) return

      if (isDrag) {
        dragRef.current.target = target
        const store = useHdrGradientStore.getState()
        const layer = store.layers[store.activeLayerIndex]
        if (layer && layer.conic.namedPosition !== '--') {
          const pos = NAMED_POSITION_TO_PERCENT[layer.conic.namedPosition]
          if (pos) {
            dragRef.current.left = pos.x
            dragRef.current.top = pos.y
            actions.setConicNamedPosition('--')
            actions.setConicPosition(pos.x, pos.y)
          }
        }
        try { node.setPointerCapture(e.pointerId) } catch {}
        dragRef.current.moving = true
        const currentPos = useHdrGradientStore.getState().layers[useHdrGradientStore.getState().activeLayerIndex]?.conic.position
        dragRef.current.left = currentPos?.x ?? 50
        dragRef.current.top = currentPos?.y ?? 50
      } else if (isRotator) {
        try { node.setPointerCapture(e.pointerId) } catch {}
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
      } else if (isStop) {
        if (target.closest('.stop-color')) return
        const idx = Number((isStop as HTMLElement).dataset.stopIndex)
        dragRef.current.target = isStop as HTMLElement
        dragRef.current.start = { x: e.screenX, y: e.screenY }
        dragRef.current.stopIndex = idx
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      const d = dragRef.current

      // Arm stop drag
      if (!d.moving && d.stopIndex != null) {
        const dx = (e.screenX ?? 0) - d.start.x
        const dy = (e.screenY ?? 0) - d.start.y
        if (Math.hypot(dx, dy) > 3) {
          d.moving = true
          try { node.setPointerCapture(e.pointerId) } catch {}
          // Initialize
          try {
            d.visualOffsetDeg = computeVisualOffsetDeg(node)
          } catch {}
          const store = useHdrGradientStore.getState()
          const stops = store.layers[store.activeLayerIndex]?.stops
          const stop = stops?.[d.stopIndex]
          if (!stop) return
          if (stop.kind === 'hint') {
            d.angle = parseInt(String(stop.percentage))
          } else {
            const pos = d.target?.dataset.position === '1' ? stop.position1 : stop.position2
            d.angle = parseInt(String(pos))
          }
        }
      }

      if (d.moving && d.stopIndex != null) {
        try { node.setPointerCapture(e.pointerId) } catch {}

        const stopsEl = node.querySelector('.conic-stops')
        if (stopsEl) {
          const rect = stopsEl.getBoundingClientRect()
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2

          // Pull-away based on radial distance from ring
          const dx = e.clientX - cx
          const dy = e.clientY - cy
          const dist = Math.hypot(dx, dy)
          let ringRadius = 59
          const sampleStop = node.querySelector('.conic-stops .overlay-stop') as HTMLElement | null
          if (sampleStop) {
            const srect = sampleStop.getBoundingClientRect()
            const sx = srect.left + srect.width / 2
            const sy = srect.top + srect.height / 2
            ringRadius = Math.hypot(sx - cx, sy - cy)
          }
          const radialDelta = Math.abs(dist - ringRadius)
          const removeArm = 28
          const insertArm = 18

          const store = useHdrGradientStore.getState()
          const stops = store.layers[store.activeLayerIndex]?.stops

          if (radialDelta > removeArm && d.stopIndex != null && !d.removedStop && stops) {
            const colorCount = stops.filter(s => s?.kind === 'stop').length
            if (colorCount > 1) {
              d.removedStop = { ...stops[d.stopIndex] } as GradientStop
              d.removedIndex = d.stopIndex
              actions.setStops(removeStop([...stops.map(s => ({ ...s }))], d.stopIndex) as GradientStop[])
              d.stopIndex = null
            }
          } else if (radialDelta <= insertArm && d.removedStop && d.stopIndex == null) {
            const percent = Math.max(0, Math.min(100, Math.round(d.angle ?? 0)))
            const currentStops = useHdrGradientStore.getState().layers[useHdrGradientStore.getState().activeLayerIndex]?.stops ?? []
            const colors = currentStops.filter(s => s.kind === 'stop')
            let k = colors.findIndex(s => parseFloat(String(s.position1)) > percent)
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
            const newStops = [...currentStops.map(s => ({ ...s }))] as any[]
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

          // Compute angle around ring
          let deg = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
          if (deg < 0) deg += 360
          const baseOffset = normalizeDeg(conicAngle - 180)
          const offset = d.visualOffsetDeg ?? baseOffset
          const localDeg = normalizeDeg(deg - offset)
          const percent = Math.max(0, Math.min(100, Math.round((localDeg / 360) * 100)))
          d.angle = percent

          // Update stop position
          if (d.stopIndex != null) {
            const currentStops = useHdrGradientStore.getState().layers[useHdrGradientStore.getState().activeLayerIndex]?.stops
            if (currentStops && currentStops[d.stopIndex]) {
              const newStops = currentStops.map(s => ({ ...s })) as any[]
              const targetStop = newStops[d.stopIndex]
              if (targetStop.kind === 'stop') {
                if (targetStop.position1 === targetStop.position2)
                  targetStop.position2 = String(percent)
                if (d.target?.dataset.position === '1')
                  targetStop.position1 = String(percent)
                else
                  targetStop.position2 = String(percent)
              } else {
                targetStop.percentage = String(percent)
              }
              actions.setStops(newStops as GradientStop[])
            }
          }
        }
      } else if (d.moving && d.stopIndex == null) {
        // Position drag
        const wpercent = w / 50
        const hpercent = h / 50
        d.left += (e.movementX || 0) / wpercent
        d.top += (e.movementY || 0) / hpercent
        actions.setConicPosition(Math.round(d.left), Math.round(d.top))
      } else if (d.rotating) {
        try { node.setPointerCapture(e.pointerId) } catch {}
        const deltaX = e.clientX - d.centerX
        const deltaY = e.clientY - d.centerY
        let currentAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
        if (currentAngle < 0) currentAngle += 360
        if (d.lastAngle !== null) {
          let angleDiff = currentAngle - d.lastAngle
          if (angleDiff > 180) angleDiff -= 360
          if (angleDiff < -180) angleDiff += 360
          let newAngle = conicAngle + angleDiff
          if (newAngle >= 360) newAngle -= 360
          if (newAngle < 0) newAngle += 360
          actions.setConicAngle(Math.round(newAngle))
        }
        d.lastAngle = currentAngle
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      try { node.releasePointerCapture(e.pointerId) } catch {}
      dragRef.current.moving = false
      dragRef.current.rotating = false
      dragRef.current.angle = null
      dragRef.current.stopIndex = null
      dragRef.current.target = null
      dragRef.current.left = 0
      dragRef.current.top = 0
      dragRef.current.start = { x: 0, y: 0 }
      dragRef.current.removedStop = null
      dragRef.current.removedIndex = null
      dragRef.current.visualOffsetDeg = null
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
  }, [conicAngle, w, h, actions, computeVisualOffsetDeg])

  const addStop = useCallback(
    (e: React.MouseEvent) => {
      const percent = computePercentFromPointer(e)
      const store = useHdrGradientStore.getState()
      const stops = store.layers[store.activeLayerIndex]?.stops
      if (!stops) return
      const colors = stops.filter(s => s.kind === 'stop')
      let k = colors.findIndex(s => parseFloat(String(s.position1)) > percent)
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
      const newStops = [...stops.map(s => ({ ...s }))] as any[]
      if (k === colors.length) {
        newStops.splice(arrIdx, 0, { kind: 'hint', percentage: null, auto: '' }, newStop)
      } else {
        newStops.splice(arrIdx, 0, newStop, { kind: 'hint', percentage: null, auto: '' })
      }
      actions.setStops(updateStops(newStops) as GradientStop[])
    },
    [computePercentFromPointer, actions],
  )

  const deleteStop = useCallback(
    (stop: GradientStop) => {
      if (!activeLayer) return
      const colorCount = activeLayer.stops.filter(s => s?.kind === 'stop').length
      if (colorCount <= 1) return
      const idx = activeLayer.stops.indexOf(stop)
      if (idx < 0) return
      actions.setStops(removeStop([...activeLayer.stops.map(s => ({ ...s }))], idx) as GradientStop[])
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

  const position = overlayPosition()
  const positionTooltip = activeLayer.conic.namedPosition === '--'
    ? `${activeLayer.conic.position.x} ${activeLayer.conic.position.y}`
    : activeLayer.conic.namedPosition

  return (
    <div
      ref={overlayRef}
      className="conic-overlay"
      style={{
        rotate: `${gradientAngle(conicAngle)}deg`,
        left: position.x,
        top: position.y,
        translate: '-50% -50%',
      }}
    >
      {/* Pie/angle indicator */}
      <div className="overlay-pie" style={{ rotate: `${-conicAngle + 90}deg` }}>
        {conicAngle > 0 && <div className="overlay-visual-vert large" />}
        <div
          className="overlay-visual solid large"
          style={{ '--ng': `${conicAngle}deg` } as React.CSSProperties}
        />
        <div
          className="overlay-visual dotted large"
          style={{ '--ng': `${conicAngle}deg` } as React.CSSProperties}
        />
        <div className="overlay-dot" />
      </div>
      <div className="invisible-rotator large" title={`${conicAngle}deg`} />
      <div
        className="overlay-dragzone small"
        title={positionTooltip}
        style={{ maxInlineSize: `${w * 0.2}px` }}
      />
      <div
        className="invisible-ring"
        onClick={addStop}
        onMouseMove={(e) => {
          setGhostPercent(computePercentFromPointer(e))
          setShowGhost(true)
        }}
        onMouseEnter={() => setShowGhost(true)}
        onMouseLeave={() => { setShowGhost(false); setGhostPercent(null) }}
      />
      <div className="conic-stops" style={{ rotate: '-90deg', translate: '0px -12px' }}>
        {showGhost && ghostPercent !== null && (
          <div
            className="ghost-stop-wrap"
            style={{ transform: `rotateZ(${360 * (ghostPercent / 100)}deg) translate(0, 59px)` }}
          >
            <div className="ghost-stop" />
          </div>
        )}
        {activeLayer.stops.map((stop, i) => {
          if (stop.kind === 'stop') {
            const s = stop as GradientColorStop
            return (
              <div key={`cs-${i}`}>
                <div
                  tabIndex={0}
                  className="overlay-stop-wrap"
                  style={{ transform: `rotateZ(${360 * (parseInt(String(s.position1)) / 100)}deg) translate(0, 59px)` }}
                  onDoubleClick={() => deleteStop(s)}
                >
                  <div className="overlay-stop" data-stop-index={i} data-position="1">
                    <button
                      className="stop-color"
                      style={{ backgroundColor: s.color }}
                      onClick={(e) => pickColor(i, e)}
                    />
                  </div>
                </div>
                {s.position1 !== s.position2 && (
                  <div
                    key={`cs2-${i}`}
                    tabIndex={0}
                    className="overlay-stop-wrap"
                    style={{ transform: `rotateZ(${360 * (parseInt(String(s.position2)) / 100)}deg) translate(0, 59px)` }}
                  >
                    <div
                      className="overlay-stop"
                      data-stop-index={i}
                      data-position="2"
                      style={{ opacity: Number(s.position2) < Number(s.position1) ? 0.5 : 1 }}
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
          return (
            <div
              key={`ch-${i}`}
              className="overlay-hint"
              tabIndex={0}
              data-stop-index={i}
              style={{
                transform: `rotateZ(${360 * (parseInt(String(stop.percentage)) / 100)}deg) translate(0, 85px)`,
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
  )
}
