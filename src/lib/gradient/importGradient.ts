import type { ParsedGradient } from './parseGradient'
import { updateStops } from './stops'

/**
 * Convert angle with any CSS unit to degrees string.
 * Supports: deg, turn, rad, grad, and unitless numbers.
 */
export function toDegreesString(valueWithUnit: string): string {
  if (!valueWithUnit) return '0'
  const v = valueWithUnit.trim().toLowerCase()
  let deg: number
  if (v.endsWith('deg')) {
    deg = parseFloat(v.replace('deg', ''))
  } else if (v.endsWith('turn')) {
    deg = parseFloat(v.replace('turn', '')) * 360
  } else if (v.endsWith('rad')) {
    deg = parseFloat(v.replace('rad', '')) * (180 / Math.PI)
  } else if (v.endsWith('grad')) {
    deg = parseFloat(v.replace('grad', '')) * 0.9
  } else {
    deg = parseFloat(v)
  }
  if (isNaN(deg)) return '0'
  return String(parseFloat(deg.toFixed(4)))
}

/**
 * Normalize a parsed gradient for import:
 * 1. Strip % suffix from positions
 * 2. Auto-insert hints between adjacent stops when none exist
 * 3. Run updateStops for consistent auto-distribution
 * 4. Convert angle units to degrees
 */
export function normalizeParsedGradient(parsed: ParsedGradient): ParsedGradient {
  // 1) strip % suffix from positions
  const normalizedStops = parsed.stops.map(s => {
    if (s.kind === 'stop') {
      return {
        ...s,
        position1: s.position1 ? String(s.position1).replace(/%$/, '') : null,
        position2: s.position2 ? String(s.position2).replace(/%$/, '') : null,
      }
    }
    return {
      ...s,
      percentage: s.percentage ? String(s.percentage).replace(/%$/, '') : null,
    }
  })

  // 2) auto-insert hints between adjacent stops if none exist
  const hasAnyHints = normalizedStops.some(s => s.kind === 'hint')
  let stopsWithHints = normalizedStops
  if (!hasAnyHints) {
    const colors = normalizedStops.filter(s => s.kind === 'stop')
    const rebuilt: typeof normalizedStops = []
    colors.forEach((st, idx) => {
      rebuilt.push({ ...st })
      if (idx < colors.length - 1) {
        rebuilt.push({ kind: 'hint', auto: null, percentage: null })
      }
    })
    stopsWithHints = rebuilt
  }

  // 3) normalize via updateStops
  const finalStops = updateStops(stopsWithHints as any)

  // 4) convert angle units
  return {
    ...parsed,
    stops: finalStops as ParsedGradient['stops'],
    linear: parsed.linear
      ? { ...parsed.linear, angleDeg: parsed.linear.angleDeg ? toDegreesString(parsed.linear.angleDeg) : null }
      : undefined,
    conic: parsed.conic
      ? { ...parsed.conic, fromDeg: parsed.conic.fromDeg ? toDegreesString(parsed.conic.fromDeg) : null }
      : undefined,
  }
}
