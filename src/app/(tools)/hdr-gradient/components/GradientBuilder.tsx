'use client'

import '../hdr-gradient-tokens.css'
import '../hdr-gradient-overlays.css'
import { useState, useRef, useEffect } from 'react'
import { useActiveLayer, useGradientCss, useGradientActions } from '@/store/hdr-gradient'
import { useHdrGradientStore } from '@/store/hdr-gradient'
import { useShallow } from 'zustand/shallow'
import { isCylindricalSpace } from '@/lib/gradient/colorspace'
import { copyToClipboard } from '@/lib/gradient/clipboard'
import { serializeUrl } from '@/lib/gradient/url'

import GradientTypeSelector from './GradientTypeSelector'
import ColorSpaceSelector from './ColorSpaceSelector'
import HueInterpolationSelector from './HueInterpolationSelector'
import GradientStops from './GradientStops'
import LayersPanel from './LayersPanel'
import PresetsPanel from '../presets'
import ColorPickerDialog from './ColorPickerDialog'
import ImportDialog from './ImportDialog'
import CodeHighlight from './CodeHighlight'
import LinearOverlay from './LinearOverlay'
import RadialOverlay from './RadialOverlay'
import ConicOverlay from './ConicOverlay'

export default function GradientBuilder() {
  const activeLayer = useActiveLayer()
  const css = useGradientCss()
  const previewHd = useHdrGradientStore(useShallow((s) => s.previewHd))
  const layers = useHdrGradientStore(useShallow((s) => s.layers))
  const activeLayerIndex = useHdrGradientStore(useShallow((s) => s.activeLayerIndex))
  const actions = useGradientActions()
  const [boxWidth, setBoxWidth] = useState(0)
  const [boxHeight, setBoxHeight] = useState(0)
  const resizerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const codeRef = useRef<HTMLElement>(null)
  const previewRef = useRef<HTMLElement>(null)
  const restoredRef = useRef(false)

  const modernCss = css.modern
  const classicCss = css.classic
  const gradientBg = previewHd ? modernCss : classicCss
  const allLayersModern = modernCss
  const allLayersClassic = classicCss

  // URL state restore on mount
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    if (window.location.hash) {
      actions.restoreFromHash(window.location.hash)
    }
  }, [actions])

  // URL state sync on change (debounced 350ms)
  useEffect(() => {
    if (!restoredRef.current) return
    const timer = setTimeout(() => {
      const active = layers[activeLayerIndex]
      if (!active) return

      if (layers.length > 1) {
        const compact = layers.map(l => ({
          name: l.name,
          visible: l.visible,
          type: l.type,
          space: l.space,
          interpolation: l.interpolation,
          stops: l.stops,
          linear: l.linear,
          radial: l.radial,
          conic: l.conic,
        }))
        const hash = serializeUrl({
          layers: JSON.stringify(compact),
          active: String(activeLayerIndex),
        })
        history.replaceState(null, '', '#' + hash)
      } else {
        const hash = serializeUrl({
          type: active.type,
          space: active.space,
          ...(isCylindricalSpace(active.space) ? { interpolation: active.interpolation } : {}),
          stops: active.stops,
          linear_named_angle: active.linear.namedAngle,
          linear_angle: active.linear.angle,
          radial_shape: active.radial.shape,
          radial_position: active.radial.position,
          radial_named_position: active.radial.namedPosition,
          radial_size: active.radial.size,
          conic_angle: active.conic.angle,
          conic_position: active.conic.position,
          conic_named_position: active.conic.namedPosition,
        })
        history.replaceState(null, '', '#' + hash)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [layers, activeLayerIndex])

  // Meta theme-color, SVG favicon, and glow color sync
  useEffect(() => {
    const layer = layers[activeLayerIndex]
    if (!layer?.stops?.[0]) return
    const first = layer.stops[0]
    if (first.kind !== 'stop') return
    const timer = setTimeout(() => {
      try {
        import('colorjs.io').then(({ default: Color }) => {
          const c = new Color(first.color)
          const hex = c.to('srgb').toString({ format: 'hex' })

          const meta = document.querySelector('meta[name="theme-color"]')
          if (meta) meta.setAttribute('content', hex)

          const link = document.querySelector('link[rel="icon"]')
          if (link) {
            const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><mask id='s'><rect height='40%' width='100%' fill='white'/><rect height='7%' y='41%' width='100%' fill='white'/><rect height='6%' y='50%' width='100%' fill='white'/><rect height='5%' y='59%' width='100%' fill='white'/><rect height='4%' y='68%' width='100%' fill='white'/><rect height='3%' y='78%' width='100%' fill='white'/><rect height='2%' y='90%' width='100%' fill='white'/><rect height='1%' y='99%' width='100%' fill='white'/></mask><circle mask='url(%23s)' fill='${hex}' cx='50' cy='50' r='50'/></svg>`
            link.setAttribute('href', `data:image/svg+xml;utf8,${svg}`)
          }

          document.documentElement.style.setProperty('--gs-glow-color', hex)
        })
      } catch { }
    }, 500)
    return () => clearTimeout(timer)
  }, [layers, activeLayerIndex])

  // ResizeObserver for preview container
  useEffect(() => {
    const el = resizerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries.at(0)
      if (entry) {
        setBoxWidth(entry.contentBoxSize[0].inlineSize)
        setBoxHeight(entry.contentBoxSize[0].blockSize)
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function addStop() {
    actions.addStop()
  }

  function handleGlobalAction(value: string) {
    switch (value) {
      case 'Start new': actions.reset(); break
      case 'Copy modern CSS': copyToClipboard(allLayersModern); break
      case 'Copy classic CSS': copyToClipboard(allLayersClassic); break
      case 'Import gradient': actions.setImportDialogOpen(true); break
      case 'Tips & tricks': {
        const stagger = 100
        document.querySelectorAll('.hint-badge').forEach((hint, i) => {
          setTimeout(() => {
            (hint as HTMLElement).style.opacity = '1'
            hint.setAttribute('tabindex', '0')
          }, i * stagger)
        })
        break
      }
      case 'Help & feedback': window.open('https://discord.gg/Kt7ksqRM4V', '_blank'); break
      case 'GitHub': window.open('https://github.com/argyleink/gradient-style', '_blank'); break
    }
  }

  return (
    <div
      className="hdr-gradient-wrap"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        overflow: 'auto',
        background: classicCss,
        ...(previewHd ? { background: modernCss } : {}),
        color: 'var(--text-1)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '100%',
        lineHeight: 1.5,
      }}
    >
      <main className="hdr-gradient-builder">
        {/* LEFT SIDEBAR */}
        <div className="primary-sidebar">
          {/* Brand header */}
          <header className="brand">
            <div
              className="brand-logo"
              style={{
                background: previewHd ? allLayersModern : allLayersClassic,
              }}
            />
            <h1 className="brand-name">
              HDR G<b>rad</b>ients
            </h1>
          </header>

          <ColorPickerDialog />
          <LayersPanel />
          <PresetsPanel />
        </div>

        {/* CENTER PANEL - horizontal scroll-snap between preview and code */}
        <div className="preview-panel" ref={scrollRef}>
          {/* Preview section */}
          <section className="preview-section" ref={previewRef}>
            {/* Panel actions - Get CSS code / scroll to code */}
            <div className="panel-actions">
              <button
                className="action-button"
                title="Get the CSS code"
                onClick={() => {
                  copyToClipboard(allLayersModern)
                  codeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'start' })
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                </svg>
              </button>
            </div>

            {/* Preview container with checkerboard */}
            <div className="preview-box gradient-overlays">
              {/* HDR/SDR toggle switch */}
              <div className="hd-toggle">
                <input
                  type="checkbox"
                  checked={previewHd}
                  onChange={() => actions.setPreviewHd(!previewHd)}
                  aria-label="HD on or off?"
                />
                <span className="hd-toggle-label">
                  {previewHd ? 'HDR' : 'SDR'}
                </span>
              </div>

              {/* Resizable preview area */}
              <div
                ref={resizerRef}
                className="resizer"
                style={{
                  background: gradientBg,
                }}
              >
                {activeLayer && boxWidth > 0 && boxHeight > 0 && (
                  <>
                    {activeLayer.type === 'linear' && <LinearOverlay w={boxWidth} h={boxHeight} />}
                    {activeLayer.type === 'radial' && <RadialOverlay w={boxWidth} h={boxHeight} />}
                    {activeLayer.type === 'conic' && <ConicOverlay w={boxWidth} h={boxHeight} />}
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Code preview section */}
          <section className="code-preview-panel" ref={codeRef}>
            <div className="panel-actions" style={{ left: 'var(--size-1)', right: 'auto' }}>
              <button
                className="action-button"
                title="Back to editor"
                onClick={() => previewRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'start' })}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </button>
            </div>
            <span style={{ paddingInline: 'var(--size-3)', fontSize: 'var(--font-size-3)' }}>
              Gradient CSS
            </span>
            <CodeHighlight modernGradient={allLayersModern} classicGradient={allLayersClassic} />
          </section>
        </div>

        {/* RIGHT PANEL (CONTROLS) */}
        <section className="control-panel">
          {/* Menu bar with global actions */}
          <div className="menu-bar">
            <select
              className="gear-button"
              value=""
              onChange={(e) => {
                handleGlobalAction(e.target.value)
                e.target.value = ''
              }}
              aria-label="Global actions"
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                padding: 0,
                fontSize: 0,
                cursor: 'pointer',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23adb5bd' d='M19.14 12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z'/%3E%3C/svg%3E")`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '75%',
              }}
            >
              <option value="" disabled>Global Actions</option>
              <option value="Start new">Start new</option>
              <option value="Import gradient">Import gradient</option>
              <option value="Copy modern CSS">Copy modern CSS</option>
              <option value="Copy classic CSS">Copy classic CSS</option>
              <option value="Tips & tricks">Tips &amp; tricks</option>
              <option value="Help & feedback">Help &amp; feedback</option>
              <option value="GitHub">GitHub</option>
            </select>
          </div>

          <GradientTypeSelector
            idBase="gradient"
            value={activeLayer?.type ?? 'linear'}
            onChange={(t) => actions.setGradientType(t as any)}
          />
          <ColorSpaceSelector />

          {activeLayer && isCylindricalSpace(activeLayer.space) && <HueInterpolationSelector />}

          {activeLayer && <GradientStops />}

          {/* Footer - Add random color */}
          <div className="end-of-stops">
            <button className="add-color-button" onClick={addStop}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
              </svg>
              Add a random color
            </button>
          </div>
        </section>
      </main>

      <ImportDialog />
    </div>
  )
}
