'use client'

export default function AngleIcon({ angle }: { angle: number | string | null }) {
  const deg = angle != null ? Number(angle) : 0
  return (
    <div
      className="angle-icon"
      style={{
        backgroundImage: `conic-gradient(rgba(255,255,255,0.55), ${deg}deg, transparent 0%)`,
        borderRadius: '50%',
      }}
      title={`${deg}\u00B0`}
    />
  )
}
