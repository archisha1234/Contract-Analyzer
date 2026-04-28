'use client'
import { useState } from 'react'
import { CLAUSES, ContractResult, ClauseType } from '@/lib/types'
import ClauseModal from './ClauseModal'

interface Props {
  results: ContractResult[]
}

interface ModalState { contract: string; clause: string; text: string }

const Tag = ({ type }: { type: ClauseType }) => {
  const styles: Record<string, React.CSSProperties> = {
    risk: { background: '#452a2a', color: '#ff9595', border: '0.5px solid #633b3b' },
    key: { background: '#453a2a', color: '#ffca85', border: '0.5px solid #63533b' },
    standard: { background: '#2a452a', color: '#95ff95', border: '0.5px solid #3b633b' },
  };
  if (!type || type === 'none') return null;
  return (
    <span style={{
      ...styles[type],
      fontSize: '9px',
      fontWeight: 700,
      textTransform: 'uppercase',
      padding: '2px 6px',
      borderRadius: '4px',
      marginBottom: '8px',
      display: 'inline-flex',
      width: 'fit-content',
      whiteSpace: 'nowrap',
      alignItems: 'center',
      justifyContent: 'center',
      letterSpacing: '0.03em'
    }}>
      {type === 'key' ? 'Key term' : type}
    </span>
  );
};

export default function ResultsTable({ results }: Props) {
  const [modal, setModal] = useState<ModalState | null>(null);

  return (
    <>
      {modal && (
        <ClauseModal
          contract={modal.contract}
          clause={modal.clause}
          text={modal.text}
          onClose={() => setModal(null)}
        />
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 22 }}>
          Results
        </h2>
        <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--ink-muted)' }}>
          {results.length} contract{results.length !== 1 ? 's' : ''} · click any cell to read full text
        </p>
      </div>

      <div style={{
        overflowX: 'auto',
        border: '0.5px solid var(--border)',
        borderRadius: 12,
        background: 'var(--paper)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 1200 }}>
          <colgroup>
            <col style={{ width: 160 }} />
            {CLAUSES.map((_, i) => <col key={i} style={{ width: 220 }} />)}
          </colgroup>
          <thead>
            <tr>
              <th style={thStyle(true)}>Contract</th>
              {CLAUSES.map(c => (
                <th key={c} style={thStyle(false)} title={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, ri) => (
              <tr key={r.id}>
                <td style={{
                  ...tdBase, fontWeight: 500, fontSize: 12,
                  color: 'var(--ink-muted)',
                  position: 'sticky', left: 0, background: 'var(--paper)',
                  zIndex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  borderBottom: ri < results.length - 1 ? '0.5px solid var(--border)' : 'none',
                }} title={r.name}>
                  {r.name}
                  {r.status === 'analyzing' && (
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--accent)', marginTop: 2 }}>
                      analyzing…
                    </span>
                  )}
                </td>

                {CLAUSES.map((clause, ci) => {
                  const isLast = ri === results.length - 1
                  const clauseData = r.clauses?.[clause]
                  const val = typeof clauseData === 'string' ? clauseData : clauseData?.text
                  const type = typeof clauseData === 'object' ? clauseData?.type : 'none'

                  const isNoData = val === 'No Data Found' || r.status === 'error'
                  const isLoading = r.status === 'pending' || r.status === 'analyzing'

                  return (
                    <td
                      key={clause}
                      onClick={() => val && !isNoData && setModal({ contract: r.name, clause, text: val })}
                      style={{
                        ...tdBase,
                        borderBottom: !isLast ? '0.5px solid var(--border)' : 'none',
                        borderLeft: '0.5px solid var(--border)',
                        cursor: val && !isNoData ? 'pointer' : 'default',
                        color: isNoData ? 'var(--ink-faint)' : 'var(--ink)',
                        fontStyle: isNoData ? 'italic' : 'normal',
                      }}
                      className={val && !isNoData ? 'clause-cell' : ''}
                    >
                      {isLoading ? (
                        <div className="skeleton" style={{ height: 12, width: '80%' }} />
                      ) : isNoData ? (
                        <span style={{ fontSize: 12 }}>No Data Found</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Tag type={type as ClauseType} />
                          <span style={{ 
                            fontSize: 12, 
                            lineHeight: 1.6, 
                            display: '-webkit-box', 
                            WebkitLineClamp: 3, 
                            WebkitBoxOrient: 'vertical', 
                            overflow: 'hidden' 
                          }}>
                            {val}
                          </span>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .clause-cell:hover { background: var(--paper-2) !important; }
        .skeleton {
          background: var(--border);
          border-radius: 4px;
          animation: pulse 1.5s infinite ease-in-out;
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </>
  )
}

const thStyle = (isFirst: boolean): React.CSSProperties => ({
  padding: '12px 10px',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 10,
  color: 'var(--ink-muted)',
  textAlign: 'left',
  background: 'var(--paper-2)',
  borderBottom: '0.5px solid var(--border)',
  whiteSpace: 'normal', 
  wordWrap: 'break-word',
  lineHeight: '1.3',
  verticalAlign: 'bottom',
  position: isFirst ? 'sticky' : 'static',
  left: isFirst ? 0 : undefined,
  zIndex: isFirst ? 2 : undefined,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
})

const tdBase: React.CSSProperties = {
  padding: '14px 10px',
  verticalAlign: 'top',
}