'use client'
import { useRef, useState } from 'react'

interface Props {
  onFiles: (files: File[]) => void
}

export default function UploadZone({ onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handle = (files: FileList | null) => {
    if (!files) return
    const valid = Array.from(files).filter(f =>
      f.name.match(/\.(pdf|docx|doc)$/i)
    )
    if (valid.length) onFiles(valid)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files) }}
      style={{
        border: `1.5px dashed ${dragging ? 'var(--accent)' : 'var(--border-strong)'}`,
        background: dragging ? 'var(--accent-light)' : 'var(--paper)',
        borderRadius: 12,
        padding: '2rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s',
        userSelect: 'none',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        multiple
        style={{ display: 'none' }}
        onChange={e => handle(e.target.files)}
      />
      <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--ink)' }}>
        Drop <strong>PDF</strong> or <strong>DOCX</strong> files here, or{' '}
        <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>browse</span>
      </p>
      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-faint)' }}>
        Multiple files supported
      </p>
    </div>
  )
}
