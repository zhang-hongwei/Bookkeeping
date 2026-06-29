'use client'

interface NamedDirectionsProps {
  id?: string
  selected: string
  onChange: (value: string) => void
  mode: 'angle' | 'position'
}

const ANGLE_OPTIONS = [
  'to top left', 'to top', 'to top right',
  'to left', '--', 'to right',
  'to bottom left', 'to bottom', 'to bottom right',
]

const POSITION_OPTIONS = [
  'top left', 'top', 'top right',
  'left', 'center', 'right',
  'bottom left', 'bottom', 'bottom right',
]

const GRID_PLACEMENT: Record<string, React.CSSProperties> = {
  'top left': { justifySelf: 'start', alignSelf: 'start' },
  'top': { justifySelf: 'center', alignSelf: 'start' },
  'top right': { justifySelf: 'end', alignSelf: 'start' },
  'left': { justifySelf: 'start', alignSelf: 'center' },
  '--': { justifySelf: 'center', alignSelf: 'center' },
  'center': { justifySelf: 'center', alignSelf: 'center' },
  'right': { justifySelf: 'end', alignSelf: 'center' },
  'bottom left': { justifySelf: 'start', alignSelf: 'end' },
  'bottom': { justifySelf: 'center', alignSelf: 'end' },
  'bottom right': { justifySelf: 'end', alignSelf: 'end' },
  'to top left': { justifySelf: 'start', alignSelf: 'start' },
  'to top': { justifySelf: 'center', alignSelf: 'start' },
  'to top right': { justifySelf: 'end', alignSelf: 'start' },
  'to left': { justifySelf: 'start', alignSelf: 'center' },
  'to right': { justifySelf: 'end', alignSelf: 'center' },
  'to bottom left': { justifySelf: 'start', alignSelf: 'end' },
  'to bottom': { justifySelf: 'center', alignSelf: 'end' },
  'to bottom right': { justifySelf: 'end', alignSelf: 'end' },
}

export default function NamedDirections({ id, selected, onChange, mode }: NamedDirectionsProps) {
  const options = mode === 'angle' ? ANGLE_OPTIONS : POSITION_OPTIONS

  return (
    <div
      style={{
        display: 'grid',
        placeContent: 'center',
        gridTemplateColumns: 'repeat(3, 2rem)',
        gridTemplateRows: 'repeat(3, 2rem)',
      }}
    >
      {options.map((opt) => {
        const isSelected = selected === opt
        const placement = GRID_PLACEMENT[opt] || {}
        const isCustom = opt === '--'

        return (
          <button
            key={opt}
            title={isCustom ? 'Custom' : opt}
            onClick={() => onChange(opt)}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onChange(opt)
              }
            }}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              cursor: 'pointer',
              border: 'none',
              padding: 0,
              opacity: isSelected ? 1 : 0.4,
              backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)',
              transition: 'opacity 0.15s, background-color 0.15s',
              ...placement,
            }}
          />
        )
      })}
    </div>
  )
}
