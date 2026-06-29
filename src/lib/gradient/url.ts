// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeUrl(state: Record<string, any>): string {
  const hash = new URLSearchParams("")

  for (const key in state) {
    if (key == 'stops') {
      for (const stop of state[key])
        hash.append(key, JSON.stringify(stop))
    }
    else if (key == 'radial_position' || key == 'conic_position') {
      hash.set(key, JSON.stringify(state[key]))
    }
    else if (key == 'layers') {
      hash.set(key, state[key])
    }
    else
      hash.set(key, state[key])
  }

  return hash.toString()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deserializeUrl(hash: string): Record<string, any> {
  const raw = typeof hash === 'string' ? hash.replace(/^#/, '') : ''
  const params = new URLSearchParams(raw)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: Record<string, any> = {}

  for (const [k, value] of params.entries()) {
    const key = k.startsWith('#') ? k.slice(1) : k

    if (key === 'stops') {
      out[key] = params.getAll(k).map(JSON.parse)
    }
    else if (key === 'radial_position' || key === 'conic_position') {
      try { out[key] = JSON.parse(value) } catch { out[key] = null }
    }
    else if (key === 'layers') {
      try { out[key] = JSON.parse(value) } catch { out[key] = null }
    }
    else if (key === 'active') {
      out[key] = Number(value)
    }
    else if (key === 'type') {
      out[key] = value
    }
    else {
      out[key] = value
    }
  }

  return out
}

export function restoreStateFromUrl(): Record<string, unknown> | null {
  if (typeof window !== 'undefined' && window.location.hash) {
    return deserializeUrl(window.location.hash)
  }
  return null
}
