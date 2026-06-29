'use client'

import { useState } from 'react'
import { copyToClipboard } from '@/lib/gradient/clipboard'

interface CodeHighlightProps {
  modernGradient: string
  classicGradient: string
}

export default function CodeHighlight({ modernGradient, classicGradient }: CodeHighlightProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    copyToClipboard(modernGradient)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="code-output"
      style={{
        position: 'relative',
        background: 'var(--surface-3)',
        borderRadius: 'var(--radius-2)',
        padding: 'var(--size-3)',
        maxHeight: 260,
        overflow: 'auto',
        scrollbarWidth: 'thin',
        marginInline: 'var(--size-3)',
      }}
    >
      <button
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy CSS'}
        style={{
          position: 'absolute',
          top: 'var(--size-1)',
          right: 'var(--size-1)',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: 'var(--radius-2)',
          color: copied ? '#4caf50' : 'var(--text-2)',
          cursor: 'pointer',
          padding: 'var(--size-1)',
          display: 'grid',
          placeContent: 'center',
        }}
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
          </svg>
        )}
      </button>
      <pre>
        <span className="code-keyword">background</span>
        {': '}
        <span className="code-string">{modernGradient}</span>;
      </pre>
    </div>
  )
}
