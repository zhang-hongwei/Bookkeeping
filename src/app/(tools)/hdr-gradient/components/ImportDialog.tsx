'use client'

import { useState, useEffect, useRef } from 'react'
import { useHdrGradientStore, useGradientActions } from '@/store/hdr-gradient'
import { parseMultipleGradients } from '@/lib/gradient/parseGradient'

export default function ImportDialog() {
  const importDialogOpen = useHdrGradientStore((s) => s.importDialogOpen)
  const { setImportDialogOpen, applyParsedGradient, addLayer } = useGradientActions()
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [valid, setValid] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (importDialogOpen && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal()
    } else if (!importDialogOpen && dialogRef.current?.open) {
      dialogRef.current.close()
    }
  }, [importDialogOpen])

  useEffect(() => {
    if (!text.trim()) { setError(''); setValid(false); return }
    try {
      const results = parseMultipleGradients(text)
      if (results.length > 0) { setError(''); setValid(true) }
      else { setError('No valid gradients found'); setValid(false) }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid gradient')
      setValid(false)
    }
  }, [text])

  function handleImport() {
    try {
      const results = parseMultipleGradients(text)
      if (results.length === 0) return
      applyParsedGradient(results[0])
      for (let i = 1; i < results.length; i++) {
        applyParsedGradient(results[i])
        addLayer({ seed: 'duplicate', position: 'bottom' })
      }
      setText(''); setError(''); setValid(false)
      setImportDialogOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed')
    }
  }

  function handleClose() {
    setText(''); setError(''); setValid(false)
    setImportDialogOpen(false)
  }

  return (
    <dialog
      ref={dialogRef}
      className="import-dialog"
      onClose={handleClose}
    >
      <h2>Import Gradient</h2>
      <p style={{ margin: 'var(--size-1) 0', color: 'var(--text-2)', fontSize: 'var(--font-size-0)' }}>
        Paste one or more CSS gradients
      </p>
      <textarea
        className="import-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="linear-gradient(to right, red, blue)"
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleImport() }}
      />
      {error && (
        <p style={{ color: '#f44', fontSize: 'var(--font-size-0)', margin: 'var(--size-1) 0' }}>
          {error}
        </p>
      )}
      <div className="import-actions">
        <button className="dialog-button" onClick={handleClose}>Cancel</button>
        <button className="dialog-button primary" disabled={!valid} onClick={handleImport}>Import</button>
      </div>
    </dialog>
  )
}
