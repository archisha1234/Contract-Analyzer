'use client'
import { useEffect } from 'react'

interface Props {
  contract: string
  clause: string
  text: string
  onClose: () => void
}

export default function ClauseModal({ contract, clause, text, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const isNoData = text === 'No Data Found'

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(26,25,23,0.5)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{
        background: 'var(--paper)',
        border: '0.5px solid var(--border-strong)',
        borderRadius: 16,
        padding: '1.75rem',
        maxWidth: 560,
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 20, color: 'var(--ink-faint)', lineHeight: 1,
          }}
        >×</button>

        <p style={{ margin: '0 0 2px', fontSize: 12, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {contract}
        </p>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: 17, fontFamily: 'var(--font-display)', fontWeight: 400 }}>
          {clause}
        </h3>

        {isNoData ? (
          <p style={{ color: 'var(--ink-faint)', fontStyle: 'italic', fontSize: 14 }}>
            No clause found in this contract.
          </p>
        ) : (
          <p style={{
            fontSize: 13.5, lineHeight: 1.8, color: 'var(--ink)',
            background: 'var(--paper-2)', borderRadius: 8,
            padding: '1rem 1.25rem', whiteSpace: 'pre-wrap',
            borderLeft: '3px solid var(--accent)',
          }}>
            {text}
          </p>
        )}
      </div>
    </div>
  )
}
