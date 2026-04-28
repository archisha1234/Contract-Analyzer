'use client'
import { useState, useCallback } from 'react'
import UploadZone from '@/components/UploadZone'
import ResultsTable from '@/components/ResultsTable'
import { ContractResult } from '@/lib/types'

let idCounter = 0
const uid = () => `c-${++idCounter}-${Date.now()}`

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [pasteText, setPasteText] = useState('')
  const [results, setResults] = useState<ContractResult[]>([])
  const [running, setRunning] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...newFiles.filter(f => !existing.has(f.name))]
    })
  }, [])

  const removeFile = (name: string) => setFiles(f => f.filter(x => x.name !== name))

  const canAnalyze = !running && (files.length > 0 || pasteText.trim().length > 20)

  const analyzeAll = async () => {
    setGlobalError('')
    setRunning(true)

    const contracts: { id: string; name: string; file?: File; text?: string }[] = [
      ...files.map(f => ({ id: uid(), name: f.name, file: f })),
      ...(pasteText.trim().length > 20
        ? [{ id: uid(), name: 'Pasted contract', text: pasteText.trim() }]
        : []),
    ]

    if (contracts.length === 0) { setRunning(false); return }

    // Seed table with pending rows
    setResults(contracts.map(c => ({ id: c.id, name: c.name, status: 'pending' as const })))

    for (const contract of contracts) {
      // Mark as analyzing
      setResults(prev => prev.map(r => r.id === contract.id ? { ...r, status: 'analyzing' } : r))

      try {
        const fd = new FormData()
        if (contract.file) {
          fd.append('file', contract.file)
        } else if (contract.text) {
          fd.append('text', contract.text)
        }

        const res = await fetch('/api/analyze', { method: 'POST', body: fd })
        const data = await res.json()

        if (!res.ok || data.error) {
          setResults(prev => prev.map(r =>
            r.id === contract.id
              ? { ...r, status: 'error', error: data.error || 'Unknown error' }
              : r
          ))
        } else {
          setResults(prev => prev.map(r =>
            r.id === contract.id
              ? { ...r, status: 'done', clauses: data.clauses }
              : r
          ))
        }
      } catch (err) {
        setResults(prev => prev.map(r =>
          r.id === contract.id
            ? { ...r, status: 'error', error: err instanceof Error ? err.message : 'Network error' }
            : r
        ))
      }
    }

    setRunning(false)
  }

  const clearAll = () => {
    setFiles([])
    setPasteText('')
    setResults([])
    setGlobalError('')
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '0.5px solid var(--border)',
        background: 'var(--paper)',
        padding: '0 2rem',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400 }}>
            Contract Review
          </span>
        </div>
        {results.length > 0 && (
          <button
            onClick={clearAll}
            style={{
              background: 'none', border: '0.5px solid var(--border-strong)',
              borderRadius: 6, padding: '5px 12px', fontSize: 12,
              color: 'var(--ink-muted)', cursor: 'pointer',
            }}
          >
            New review
          </button>
        )}
      </header>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Upload section */}
        {results.length === 0 && (
          <div className="animate-fade-up">
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 400,
                fontSize: 36, margin: '0 0 8px', lineHeight: 1.1,
              }}>
                Review contracts<br />
                <em>in seconds.</em>
              </h1>
              <p style={{ margin: 0, fontSize: 15, color: 'var(--ink-muted)', maxWidth: 480 }}>
                Upload PDFs, DOCX files, or paste text — instantly identify 9 key clauses
                from each contract and present them in a clean table.
              </p>
            </div>

            <UploadZone onFiles={addFiles} />

            {/* File pills */}
            {files.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {files.map(f => (
                  <div key={f.name} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--paper-2)', border: '0.5px solid var(--border)',
                    borderRadius: 20, padding: '4px 10px', fontSize: 12, color: 'var(--ink-muted)',
                  }}>
                    📎 {f.name}
                    <span
                      onClick={() => removeFile(f.name)}
                      style={{ cursor: 'pointer', color: 'var(--ink-faint)', fontSize: 14, lineHeight: 1 }}
                    >×</span>
                  </div>
                ))}
              </div>
            )}

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.25rem 0' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '0.5px solid var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>or paste contract text</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '0.5px solid var(--border)' }} />
            </div>

            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="Paste contract text here…"
              style={{
                width: '100%', minHeight: 120, padding: '10px 14px',
                fontSize: 13.5, fontFamily: 'var(--font-body)',
                color: 'var(--ink)', background: 'var(--paper)',
                border: '0.5px solid var(--border-strong)', borderRadius: 10,
                resize: 'vertical', lineHeight: 1.6, outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
            />

            {globalError && (
              <div style={{
                background: 'var(--danger-light)', border: '0.5px solid #f09595',
                borderRadius: 8, padding: '10px 14px', fontSize: 13,
                color: 'var(--danger)', marginTop: 12,
              }}>
                {globalError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem', alignItems: 'center' }}>
              <button
                onClick={analyzeAll}
                disabled={!canAnalyze}
                style={{
                  background: canAnalyze ? 'var(--ink)' : 'var(--paper-3)',
                  color: canAnalyze ? 'var(--paper)' : 'var(--ink-faint)',
                  border: 'none', borderRadius: 8,
                  padding: '11px 22px', fontSize: 14, fontWeight: 500,
                  cursor: canAnalyze ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Analyze contracts
              </button>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-faint)' }}>
                {files.length > 0
                  ? `${files.length} file${files.length > 1 ? 's' : ''} ready`
                  : 'Add files or paste text to start'}
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="animate-fade-up">
            {/* Progress banner while running */}
            {running && (
              <div style={{
                background: 'var(--accent-light)', border: '0.5px solid var(--accent-mid)',
                borderRadius: 8, padding: '10px 16px', fontSize: 13,
                color: 'var(--accent)', marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ animation: 'pulse 1s infinite', display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                Analyzing contracts — results will appear as each one completes…
              </div>
            )}

            {results.some(r => r.status === 'error') && (
              <div style={{
                background: 'var(--danger-light)', border: '0.5px solid #f09595',
                borderRadius: 8, padding: '10px 16px', fontSize: 13,
                color: 'var(--danger)', marginBottom: '1.5rem',
              }}>
                {results.filter(r => r.status === 'error').map(r => (
                  <div key={r.id}><strong>{r.name}:</strong> {r.error}</div>
                ))}
              </div>
            )}

            <ResultsTable results={results} />
          </div>
        )}
      </div>
    </main>
  )
}
