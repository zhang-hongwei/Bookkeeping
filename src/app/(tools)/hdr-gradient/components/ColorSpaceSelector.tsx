'use client'

import { useActiveLayer, useGradientActions } from '@/store/hdr-gradient'

export default function ColorSpaceSelector() {
  const activeLayer = useActiveLayer()
  const { setGradientSpace } = useGradientActions()

  if (!activeLayer) return null

  return (
    <div className="colorspace-selector">
      <label>Color Space</label>
      <select
        className="colorspace-select"
        value={activeLayer.space}
        onChange={(e) => setGradientSpace(e.target.value)}
      >
        <optgroup label="Default">
          <option value="oklab">oklab</option>
        </optgroup>
        <optgroup label="Cylindrical">
          <option value="lch">lch</option>
          <option value="oklch">oklch</option>
          <option value="hsl">hsl</option>
          <option value="hwb">hwb</option>
        </optgroup>
        <optgroup label="Cartesian">
          <option value="lab">lab</option>
          <option value="srgb">srgb</option>
          <option value="srgb-linear">srgb-linear</option>
          <option value="xyz">xyz</option>
          <option value="display-p3">display-p3</option>
          <option value="a98-rgb">a98-rgb</option>
          <option value="prophoto-rgb">prophoto-rgb</option>
          <option value="rec2020">rec2020</option>
        </optgroup>
      </select>
    </div>
  )
}
