'use client'

import { useGradientActions } from '@/store/hdr-gradient'
import { buildGradientStrings } from '@/lib/gradient/gradientString'
import type { GradientPreset } from './types'

// Presets matching the Svelte original exactly (19 total)
const PRESETS: GradientPreset[] = [
  { name: 'Wild Flower', type: 'linear', space: 'oklab', stops: [{ kind: 'stop', color: 'oklch(60% .5 353)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: 'oklch(80% .5 325)', auto: '', position1: '100', position2: '100' }], linear: { namedAngle: 'to top right', angle: '45' } },
  { name: 'Tri Dye', type: 'radial', space: 'oklch', stops: [{ kind: 'stop', color: 'oklch(80% .3 34)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: 'oklch(90% .3 200)', auto: '', position1: '100', position2: '100' }], radial: { shape: 'circle', size: 'farthest-corner', namedPosition: '--', position: { x: 50, y: 115 } } },
  { name: 'Peaches', type: 'linear', space: 'oklab', stops: [{ kind: 'stop', color: 'oklch(55% .45 350)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: 'oklch(95% .4 95)', auto: '', position1: '100', position2: '100' }], linear: { namedAngle: 'to bottom left', angle: '225' } },
  { name: 'Midnight', type: 'radial', space: 'oklab', stops: [{ kind: 'stop', color: 'oklch(80% .4 222)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: 'oklch(35% .5 313)', auto: '', position1: '100', position2: '100' }], radial: { shape: 'circle', size: 'farthest-corner', namedPosition: 'top right', position: { x: null, y: null } } },
  { name: 'Stripes', type: 'linear', space: 'oklab', stops: [{ kind: 'stop', color: '#fff', auto: '', position1: null, position2: null }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: '#000', auto: '', position1: '0', position2: '20' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: '#fff', auto: '', position1: '0', position2: '40' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: '#000', auto: '', position1: '0', position2: '60' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: '#fff', auto: '', position1: '0', position2: '80' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: '#000', auto: '', position1: '0', position2: '100' }], linear: { namedAngle: 'to top right', angle: '45' } },
  { name: 'Chlorophyll', type: 'conic', space: 'oklch', stops: [{ kind: 'stop', color: 'oklch(75% 0.5 156)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: 'oklch(70% 0.5 261)', auto: '', position1: '100', position2: '100' }], conic: { angle: '0', namedPosition: 'top left', position: { x: null, y: null } } },
  { name: 'Honeycomb', type: 'linear', space: 'oklab', stops: [{ kind: 'stop', color: 'oklch(95% .5 110)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: 'oklch(72% .5 90)', auto: '', position1: '100', position2: '100' }], linear: { namedAngle: 'to bottom right', angle: '135' } },
  { name: 'Blue Razzberry', type: 'linear', space: 'oklch', stops: [{ kind: 'stop', color: 'oklch(70% .5 340)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: 'oklch(90% .3 200)', auto: '', position1: '100', position2: '100' }], linear: { namedAngle: 'to bottom right', angle: '135' } },
  { name: 'Mmm Pie', type: 'conic', space: 'oklch', stops: [{ kind: 'stop', color: 'oklch(77% 0.50 200)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '26' }, { kind: 'stop', color: 'oklch(77% 0.50 230)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '46' }, { kind: 'stop', color: 'oklch(77% 0.50 260)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '60' }, { kind: 'stop', color: 'oklch(77% 0.50 280)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '82' }, { kind: 'stop', color: 'oklch(77% 0.50 300)', auto: '', position1: '0', position2: '0' }], conic: { angle: '0', namedPosition: 'center', position: { x: null, y: null } } },
  { name: 'Huey', type: 'conic', space: 'oklch', interpolation: 'longer', stops: [{ kind: 'stop', color: 'oklch(70% .3 0)', auto: '', position1: null, position2: null }, { kind: 'hint', auto: '', percentage: '50' }, { kind: 'stop', color: 'oklch(70% .3 0)', auto: '', position1: null, position2: null }], conic: { angle: '0', namedPosition: 'center', position: { x: null, y: null } } },
  { name: 'Solid Yo.', type: 'linear', space: 'oklab', stops: [{ kind: 'stop', color: 'oklch(70% .3 0)', auto: '', position1: null, position2: null }], linear: { namedAngle: 'to right', angle: '90' } },
  { name: 'Soundwave', type: 'radial', space: 'oklch', stops: [{ kind: 'stop', color: 'oklch(95% .25 160)', auto: '', position1: null, position2: null }, { kind: 'hint', auto: '', percentage: '26' }, { kind: 'stop', color: 'oklch(75% 0.5 180)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '46' }, { kind: 'stop', color: 'oklch(75% 0.5 210)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '60' }, { kind: 'stop', color: 'oklch(75% 0.5 230)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '82' }, { kind: 'stop', color: 'oklch(75% 0.5 260)', auto: '', position1: '0', position2: '0' }], radial: { shape: 'circle', size: 'farthest-corner', namedPosition: 'top left', position: { x: null, y: null } } },
  { name: 'Palette', type: 'linear', space: 'oklch', stops: [{ kind: 'stop', color: 'oklch(95% .2 5)', auto: '', position1: null, position2: null }, { kind: 'hint', auto: '', percentage: '10' }, { kind: 'stop', color: 'oklch(95% .25 5)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '26' }, { kind: 'stop', color: 'oklch(95% .3 5)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '46' }, { kind: 'stop', color: 'oklch(95% .35 5)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '72' }, { kind: 'stop', color: 'oklch(95% .4 5)', auto: '', position1: '0', position2: '0' }], linear: { namedAngle: 'to bottom', angle: '180' } },
  { name: 'Sunburst', type: 'conic', space: 'oklab', interpolation: 'longer', stops: [{ kind: 'stop', color: '#fff', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '2' }, { kind: 'stop', color: '#f00', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '8' }, { kind: 'stop', color: '#fff', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '13' }, { kind: 'stop', color: '#f00', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '18' }, { kind: 'stop', color: '#fff', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '21' }, { kind: 'stop', color: '#f00', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: '24' }, { kind: 'stop', color: '#fff', auto: '', position1: '0', position2: '0' }], conic: { angle: '0', namedPosition: 'bottom left', position: { x: null, y: null } } },
  { name: 'LearnUI', type: 'linear', space: 'lch', stops: [{ kind: 'stop', color: 'color(display-p3 25% 25% 100%)', auto: '', position1: null, position2: null }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: 'color(display-p3 100% 85% 30%)', auto: '', position1: null, position2: null }], linear: { namedAngle: 'to right', angle: '90' } },
  { name: 'Neon Stripe', type: 'linear', space: 'oklab', stops: [{ kind: 'stop', color: '#0ff', auto: '', position1: '0', position2: '12' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: '#111', auto: '', position1: '0', position2: '24' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: '#ff0', auto: '', position1: '0', position2: '36' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: '#111', auto: '', position1: '0', position2: '48' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: '#f0f', auto: '', position1: '0', position2: '60' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: '#111', auto: '', position1: '0', position2: '72' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: '#0ff', auto: '', position1: '0', position2: '84' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: '#111', auto: '', position1: '0', position2: '100' }], linear: { namedAngle: 'to right', angle: '90' } },
  { name: 'Sunset Spotlight', type: 'radial', space: 'oklch', stops: [{ kind: 'stop', color: 'oklch(95% .15 75)', auto: '', position1: '0', position2: '0' }, { kind: 'hint', auto: '', percentage: null }, { kind: 'stop', color: 'oklch(70% .25 35)', auto: '', position1: '100', position2: '100' }], radial: { shape: 'circle', size: 'farthest-corner', namedPosition: '--', position: { x: 50, y: 85 } } },
]

function getPresetCss(preset: GradientPreset): string {
  const snapshot = {
    type: preset.type,
    space: preset.space,
    interpolation: preset.interpolation ?? 'shorter',
    stops: preset.stops,
    linear: { named_angle: preset.linear?.namedAngle ?? 'to right', angle: preset.linear?.angle ?? '90' },
    radial: { shape: preset.radial?.shape ?? 'circle', size: preset.radial?.size ?? 'farthest-corner', named_position: preset.radial?.namedPosition ?? 'center', position: preset.radial?.position ?? { x: null, y: null } },
    conic: { angle: preset.conic?.angle ?? '0', named_position: preset.conic?.namedPosition ?? 'center', position: preset.conic?.position ?? { x: null, y: null } },
  }
  return buildGradientStrings(snapshot).modern
}

export default function PresetsPanel() {
  const { applyPreset } = useGradientActions()

  return (
    <div className="presets-panel">
      <span className="presets-label">HD Examples</span>
      <div className="presets-list">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            className="preset-swatch"
            title={preset.name}
            style={{ background: getPresetCss(preset) }}
            onClick={() => applyPreset(preset)}
          />
        ))}
      </div>
    </div>
  )
}

export { PRESETS }
