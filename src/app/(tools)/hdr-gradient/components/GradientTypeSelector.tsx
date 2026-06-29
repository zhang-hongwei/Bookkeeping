'use client'

interface GradientTypeSelectorProps {
  idBase?: string
  value: string
  onChange: (type: string) => void
}

function LinearIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16}>
      <path
        fill="currentColor"
        d="M9 13v-2h2v2m0 2v-2h2v2m-2-4V9h2v2M9 9V7h2v2m-2 8v-2h2v2M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2m15 10v2h-2v-2m2-4v2h-2v-2m2-4v2h-2V7m-5-2v2h2V5h2v2h-2v2h2v2h-2v2h2v2h-2v2h2v2h-2v-2h-2v2H5V5Z"
      />
    </svg>
  )
}

function RadialIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10Z" />
        <path d="M12 22c-3.314 0-6-4.477-6-10S8.686 2 12 2" />
      </g>
    </svg>
  )
}

function ConicIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16}>
      <path
        fill="currentColor"
        d="M12 22c-5.52-.006-9.994-4.48-10-10v-.2C2.11 6.305 6.635 1.928 12.13 2c5.497.074 9.904 4.569 9.868 10.065C21.962 17.562 17.497 22 12 22Zm-8-9.828A8 8 0 1 0 20 12h-8V4a8.01 8.01 0 0 0-8 8v.172Z"
      />
    </svg>
  )
}

const GRADIENT_TYPES = [
  { key: 'linear', label: 'Linear gradient', Icon: LinearIcon },
  { key: 'radial', label: 'Radial gradient', Icon: RadialIcon },
  { key: 'conic', label: 'Conic gradient', Icon: ConicIcon },
] as const

export default function GradientTypeSelector({
  idBase = 'layer',
  value,
  onChange,
}: GradientTypeSelectorProps) {
  return (
    <fieldset className="gradient-type-selector">
      {GRADIENT_TYPES.map(({ key, label, Icon }) => {
        const inputId = `${idBase}-type-${key}`
        return (
          <div key={key} className="type-switch">
            <input
              type="radio"
              id={inputId}
              name={`${idBase}-gradient-type`}
              value={key}
              checked={value === key}
              onChange={() => onChange(key)}
            />
            <label htmlFor={inputId}>{label}</label>
            <Icon />
          </div>
        )
      })}
    </fieldset>
  )
}
