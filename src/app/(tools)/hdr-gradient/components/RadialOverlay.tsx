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

export default function RadialOverlay({ w, h }: Props) {
  const activeLayer = useActiveLayer()
  const actions = useGradientActions()
  const overlayRef = useRef<HTMLDivElement>(null)
  const [showGhost, setShowGhost] = useState(false)
  const [ghostPercent, setGhostPercent] = useState<number | null>(null)

  const dragRef = useRef({
    moving: false,
    start: { x: 0, y: 0 },
    left: 0,
    top: 0,
    stopIndex: null as number | null,
    target: null as HTMLElement | null,
    removedStop: null as GradientStop | null,
    removedIndex: null as number | null,
  })

  // Named position sync
  useEffect(() => {
    if (!activeLayer || dragRef.current.moving) return
    const x = Number(activeLayer.radial.position.x)
    const y = Number(activeLayer.radial.position.y)
    if (Number.isNaN(x) || Number.isNaN(y)) return
    const name = nearestNamedPosName(x, y)
    if (name && activeLayer.radial.namedPosition !== name) {
      actions.setRadialNamedPosition(name as any)
    }
  }, [activeLayer?.radial.position.x, activeLayer?.radial.position.y, activeLayer?.radial.namedPosition, actions])

  const determineAbsPosition = useCallback(() => {
    if (!activeLayer) return { x: 0, y: 0 }
    let x = activeLayer.radial.position.x ?? 50
    let y = activeLayer.radial.position.y ?? 50
    if (activeLayer.radial.namedPosition !== '--') {
      const namedPos = NAMED_POSITION_TO_PERCENT[activeLayer.radial.namedPosition]
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
    if (activeLayer.radial.namedPosition !== '--') {
      const abs = determineAbsPosition()
      return { x: abs.x + 'px', y: abs.y + 'px' }
    }
    return {
      x: (activeLayer.radial.position.x ?? 50) + '%',
      y: (activeLayer.radial.position.y ?? 50) + '%',
    }
  }, [activeLayer, determineAbsPosition])

  const determineOverlaySize = useCallback(() => {
    if (!activeLayer || !w || !h) return { w: 100, h: 100 }
    const pos = determineAbsPosition()
    const distances = { left: pos.x, right: w - pos.x, top: pos.y, bottom: h - pos.y }
    const furthestInline = Math.max(distances.left, distances.right)
    const furthestBlock = Math.max(distances.top, distances.bottom)
    const shortestInline = Math.min(distances.left, distances.right)
    const shortestBlock = Math.min(distances.top, distances.bottom)
    const larger = Math.max(furthestInline, furthestBlock)
    const shorter = Math.min(shortestInline, shortestBlock)
    const longSide = Math.sqrt(furthestInline ** 2 + furthestBlock ** 2)
    const shortSide = Math.sqrt(shortestInline ** 2 + shortestBlock ** 2)
    const shape = activeLayer.radial.shape
    const size = activeLayer.radial.size

    if (size === 'farthest-side') {
      return shape === 'circle'
        ? { w: larger * 2, h: larger * 2 }
        : { w: furthestInline * 2, h: furthestBlock * 2 }
    } else if (size === 'farthest-corner') {
      if (shape === 'circle') return { w: longSide * 2, h: longSide * 2 }
      const furthestSide = { w: furthestInline * 2, h: furthestBlock * 2 }
      return {
        h: (longSide * furthestSide.h / furthestSide.w) * 2,
        w: (longSide * furthestSide.w / furthestSide.h) * 2,
      }
    } else if (size === 'closest-side') {
      return shape === 'circle'
        ? { w: shorter * 2, h: shorter * 2 }
        : { w: shortestInline * 2, h: shortestBlock * 2 }
    } else if (size === 'closest-corner') {
      if (shape === 'circle') return { w: shortSide * 2, h: shortSide * 2 }
      const closestSide = { w: shortestInline * 2, h: shortestBlock * 2 }
      return {
        h: (shortSide * closestSide.h / closestSide.w) * 2,
        w: (shortSide * closestSide.w / closestSide.h) * 2,
      }
    }
    // Explicit size
    if (shape === 'circle') return { w: parseInt(size) * 2, h: parseInt(size) * 2 }
    const [ew, eh] = size.split(' ')
    return { w: parseInt(ew) * 2, h: parseInt(eh) * 2 }
  }, [activeLayer, w, h, determineAbsPosition])

  // Pointer events
  useEffect(() => {
    const node = overlayRef.current
    if (!node) return

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      const isStop = target.closest('[data-stop-index]')
      const isTrack = target.closest('.invisible-track')

      if (isStop) {
        if (target.closest('.stop-color')) return
        const idx = Number((isStop as HTMLElement).dataset.stopIndex)
        dragRef.current.target = isStop as HTMLElement
        dragRef.current.start = { x: e.screenX, y: e.screenY }
        dragRef.current.stopIndex = idx
      } else if (isTrack) {
        return
      } else {
        dragRef.current.target = target
        // Convert named position to numeric before starting drag
        const store = useHdrGradientStore.getState()
        const layer = store.layers[store.activeLayerIndex]
        if (layer && layer.radial.namedPosition !== '--') {
          const pos = NAMED_POSITION_TO_PERCENT[layer.radial.namedPosition]
          if (pos) {
            dragRef.current.left = pos.x
            dragRef.current.top = pos.y
            actions.setRadialNamedPosition('--')
            actions.setRadialPosition(pos.x, pos.y)
          }
        }
        try { node.setPointerCapture(e.pointerId) } catch {}
        dragRef.current.moving = true
        // Initialize drag position
        const currentPos = useHdrGradientStore.getState().layers[useHdrGradientStore.getState().activeLayerIndex]?.radial.position
        dragRef.current.left = currentPos?.x ?? 50
        dragRef.current.top = currentPos?.y ?? 50
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
          const store = useHdrGradientStore.getState()
          const stops = store.layers[store.activeLayerIndex]?.stops
          const stop = stops?.[d.stopIndex]
          if (!stop) return
          if (stop.kind === 'hint') {
            d.left = parseInt(String(stop.percentage))
          } else {
            const pos = d.target?.dataset.position === '1' ? stop.position1 : stop.position2
            d.left = parseInt(String(pos))
          }
        }
      }

      if (d.moving && d.stopIndex != null) {
        try { node.setPointerCapture(e.pointerId) } catch {}
        const size = determineOverlaySize()
        const apercent = (size.w / 2) / 100
        d.left += (e.movementX || e.movementY * -1) / apercent

        // Pull-away removal
        const lineEl = node.querySelector('.overlay-line')
        if (lineEl) {
          const rect = lineEl.getBoundingClientRect()
          const cy = rect.top + rect.height / 2
          const perp = e.clientY - cy
          const removeArm = 28
          const insertArm = 18
          const store = useHdrGradientStore.getState()
          const stops = store.layers[store.activeLayerIndex]?.stops

          if (Math.abs(perp) > removeArm && d.stopIndex != null && !d.removedStop && stops) {
            const colorCount = stops.filter(s => s?.kind === 'stop').length
            if (colorCount > 1) {
              d.removedStop = { ...stops[d.stopIndex] } as GradientStop
              d.removedIndex = d.stopIndex
              actions.setStops(removeStop([...stops.map(s => ({ ...s }))], d.stopIndex) as GradientStop[])
              d.stopIndex = null
            }
          } else if (Math.abs(perp) <= insertArm && d.removedStop && d.stopIndex == null) {
            const percent = Math.max(0, Math.min(100, Math.round(d.left)))
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
        }

        // Update stop position
        if (d.stopIndex != null) {
          const store = useHdrGradientStore.getState()
          const stops = store.layers[store.activeLayerIndex]?.stops
          if (stops && stops[d.stopIndex]) {
            const newStops = stops.map(s => ({ ...s })) as any[]
            const targetStop = newStops[d.stopIndex]
            if (targetStop.kind === 'stop') {
              if (targetStop.position1 === targetStop.position2)
                targetStop.position2 = String(Math.round(d.left))
              if (d.target?.dataset.position === '1')
                targetStop.position1 = String(Math.round(d.left))
              else
                targetStop.position2 = String(Math.round(d.left))
            } else {
              targetStop.percentage = String(Math.round(d.left))
            }
            actions.setStops(newStops as GradientStop[])
          }
        }
      } else if (d.moving && d.stopIndex == null) {
        // Position drag — use absolute cursor position relative to preview
        const previewEl = node.closest('.preview')
        if (previewEl) {
          const rect = previewEl.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * 100
          const y = ((e.clientY - rect.top) / rect.height) * 100
          actions.setRadialPosition(Math.round(x), Math.round(y))
        }
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      try { node.releasePointerCapture(e.pointerId) } catch {}
      dragRef.current.moving = false
      dragRef.current.stopIndex = null
      dragRef.current.target = null
      dragRef.current.start = { x: 0, y: 0 }
      dragRef.current.removedStop = null
      dragRef.current.removedIndex = null
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
  }, [actions, determineOverlaySize])

  const computePercentFromPointer = useCallback((e: React.MouseEvent) => {
    const overlay = (e.currentTarget as HTMLElement).closest('.radial-overlay')
    const lineEl = overlay?.querySelector('.overlay-line') as HTMLElement | null
    if (!lineEl) return 0
    const rect = lineEl.getBoundingClientRect()
    const t = (e.clientX - rect.left) / rect.width
    return Math.max(0, Math.min(100, Math.round(t * 100)))
  }, [])

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

  const size = determineOverlaySize()
  const position = overlayPosition()
  const lineLength = (size.w / 2) + 'px'
  const positionTooltip = activeLayer.radial.namedPosition === '--'
    ? `${activeLayer.radial.position.x} ${activeLayer.radial.position.y}`
    : activeLayer.radial.namedPosition

  return (
    <div
      ref={overlayRef}
      className="radial-overlay"
      style={{
        left: position.x,
        top: position.y,
        translate: '-50% -50%',
      }}
    >
      <div className="overlay-dot" />
      <div
        className="overlay-dragzone"
        title={positionTooltip}
        style={{ maxInlineSize: `${w * 0.2}px` }}
      />
      <div
        className="overlay-edge"
        style={{ width: `${size.w}px`, height: `${size.h}px` }}
      />
      <div
        className="invisible-track"
        onClick={addStop}
        onMouseMove={(e) => {
          setGhostPercent(computePercentFromPointer(e))
          setShowGhost(true)
        }}
        onMouseEnter={() => setShowGhost(true)}
        onMouseLeave={() => { setShowGhost(false); setGhostPercent(null) }}
      />
      <div className="overlay-line" style={{ width: lineLength }}>
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
              <div key={`rs-${i}`}>
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
                    key={`rs2-${i}`}
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
              key={`rh-${i}`}
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
  )
}
