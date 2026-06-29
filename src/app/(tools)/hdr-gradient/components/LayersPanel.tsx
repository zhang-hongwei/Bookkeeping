'use client'

import { useHdrGradientStore, useGradientActions, useActiveLayer } from '@/store/hdr-gradient'
import { useShallow } from 'zustand/shallow'
import GradientTypeSelector from './GradientTypeSelector'
import LinearControls from './LinearControls'
import RadialControls from './RadialControls'
import ConicControls from './ConicControls'

export default function LayersPanel() {
  const { layers, activeLayerIndex } = useHdrGradientStore(
    useShallow((s) => ({ layers: s.layers, activeLayerIndex: s.activeLayerIndex })),
  )
  const { addLayer, selectLayer, deleteLayer, moveLayer, toggleLayerVisibility, setGradientType } = useGradientActions()

  function handleLayerAction(action: string, i: number) {
    switch (action) {
      case 'Move up': moveLayer(i, Math.max(0, i - 1)); break
      case 'Move down': moveLayer(i, Math.min(layers.length - 1, i + 1)); break
      case 'Move to top': moveLayer(i, 0); break
      case 'Move to bottom': moveLayer(i, layers.length - 1); break
      case 'Toggle visibility': toggleLayerVisibility(i); break
      case 'Remove': deleteLayer(i); break
    }
  }

  return (
    <section className="sidebar-body-wrapper">
      <div className="layers-container">
        {layers.map((layer, i) => {
          const bgModern = layer.cachedCss?.modern || ''
          const bgClassic = layer.cachedCss?.classic || ''
          const thumbBg = bgModern
            ? `${bgModern}, var(--conic-checkerboard)`
            : 'var(--gradient-checkerboard)'

          return (
            <div
              key={layer.id}
              className={`layer-card${i === activeLayerIndex ? ' active' : ''}`}
              onFocus={() => { if (i !== activeLayerIndex) selectLayer(i) }}
              tabIndex={-1}
            >
              <div className="layer-header">
                {/* Gradient thumbnail */}
                <div
                  className="layer-thumb"
                  style={{
                    backgroundImage: thumbBg,
                    backgroundSize: 'cover, 12px 12px',
                    opacity: layer.visible !== false ? 1 : 0.3,
                  }}
                />

                {/* Gradient type selector */}
                <GradientTypeSelector
                  idBase={`layer-${layer.id}`}
                  value={layer.type}
                  onChange={(t) => {
                    if (i !== activeLayerIndex) selectLayer(i)
                    if (layer.type !== t) setGradientType(t as any)
                  }}
                />

                {/* Layer actions dropdown */}
                <select
                  className="layer-actions"
                  value=""
                  onChange={(e) => {
                    handleLayerAction(e.target.value, i)
                    e.target.value = ''
                  }}
                  aria-label="Layer actions"
                >
                  <option value="" disabled>Actions</option>
                  <option value="Move up">Move up</option>
                  <option value="Move down">Move down</option>
                  <option value="Move to top">Move to top</option>
                  <option value="Move to bottom">Move to bottom</option>
                  <option value="Toggle visibility">Toggle visibility</option>
                  <option value="Remove" disabled={layers.length <= 1}>Remove</option>
                </select>
              </div>

              {/* Layer body (controls for the active layer) */}
              {i === activeLayerIndex && (
                <div className="layer-body">
                  {layer.type === 'linear' && <LinearControls />}
                  {layer.type === 'radial' && <RadialControls />}
                  {layer.type === 'conic' && <ConicControls />}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add layer button */}
      <div>
        <button
          className="add-layer-button"
          title="New layer"
          onClick={() => addLayer({ seed: 'new', position: 'top' })}
        >
          <span className="sr-only">New layer</span>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
          </svg>
        </button>
      </div>
    </section>
  )
}
