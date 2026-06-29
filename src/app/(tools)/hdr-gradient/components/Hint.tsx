'use client'

import { useState } from 'react'

interface HintProps {
  title?: string
  copy?: string
}

export default function Hint({ title = '', copy = '' }: HintProps) {
  const [seen, setSeen] = useState(false)

  if (seen) return null

  return (
    <div
      className="hint-badge"
      title={`${title}\n${copy}`}
      onMouseLeave={() => setSeen(true)}
      onBlur={() => setSeen(true)}
    >
      <div className="ping" />
    </div>
  )
}
