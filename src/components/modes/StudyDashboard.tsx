import { useMemo } from 'react'
import type { StudyRecord, Chapter } from '../../types/index.ts'

interface StudyDashboardProps {
  records: StudyRecord[]
  chapters: Chapter[]
  currentChapterId: string
  onClearRecords: () => void
}

const modeLabels: Record<string, string> = {
  formula: '公式カード',
  term: '用語クイズ',
  pattern: '解法クイズ',
  practice: '演習問題',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${month}/${day} ${hour}:${min}`
}

export default function StudyDashboard({ records, chapters, currentChapterId, onClearRecords }: StudyDashboardProps) {
  const chapterRecords = useMemo(
    () => records.filter(r => r.chapterId === currentChapterId && r.mode !== 'reference' && r.mode !== 'dashboard'),
    [records, currentChapterId]
  )

  const chapterName = chapters.find(c => c.id === currentChapterId)?.name ?? ''

  const summaryByMode = useMemo(() => {
    const map: Record<string, { attempts: number; totalQ: number; totalCorrect: number }> = {}
    for (const r of chapterRecords) {
      if (!map[r.mode]) map[r.mode] = { attempts: 0, totalQ: 0, totalCorrect: 0 }
      map[r.mode].attempts++
      map[r.mode].totalQ += r.total
      map[r.mode].totalCorrect += r.correct
    }
    return map
  }, [chapterRecords])

  const totalAttempts = chapterRecords.length
  const recentRecords = useMemo(
    () => [...chapterRecords].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10),
    [chapterRecords]
  )

  const studyDays = useMemo(() => {
    const days = new Set(records.map(r => r.date.slice(0, 10)))
    return days.size
  }, [records])

  return (
    <div className="fade-in">
      {/* Overall stats */}
      <div className="card">
        <div className="card-body">
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
            {'全体の学習状況'}
          </div>
          <div className="stats-row">
            <span className="stat-chip blue">{'学習日数'} {studyDays}</span>
            <span className="stat-chip blue">{'総セッション'} {records.filter(r => r.mode !== 'reference' && r.mode !== 'dashboard').length}</span>
          </div>
        </div>
      </div>

      {/* Chapter summary */}
      <div className="card">
        <div className="card-body">
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
            {chapterName} {'のまとめ'}
          </div>
          {totalAttempts === 0 ? (
            <div style={{ color: 'var(--ink-light)', textAlign: 'center', padding: '1.5rem' }}>
              {'まだ学習記録がありません。各モードで学習を始めましょう！'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(summaryByMode).map(([mode, data]) => {
                const pct = data.totalQ > 0 ? Math.round((data.totalCorrect / data.totalQ) * 100) : 0
                return (
                  <div key={mode} className="dashboard-mode-row">
                    <div className="dashboard-mode-label">{modeLabels[mode] ?? mode}</div>
                    <div className="dashboard-mode-stats">
                      <span>{data.attempts}{'回'}</span>
                      <span className="dashboard-mode-bar-container">
                        <span className="dashboard-mode-bar" style={{ width: `${pct}%` }} />
                      </span>
                      <span style={{ fontWeight: 600, minWidth: '3em', textAlign: 'right' }}>{pct}{'%'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent history */}
      {recentRecords.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
              {'最近の学習履歴'}
            </div>
            <div className="dashboard-history">
              {recentRecords.map((r, i) => {
                const pct = r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0
                return (
                  <div key={i} className="dashboard-history-item">
                    <div className="dashboard-history-date">{formatDate(r.date)}</div>
                    <div className="dashboard-history-mode">{modeLabels[r.mode] ?? r.mode}</div>
                    <div className="dashboard-history-result">
                      {r.ratings ? (
                        <span>
                          <span style={{ color: 'var(--success)' }}>{'○'}{r.ratings.good}</span>
                          {' '}
                          <span style={{ color: 'var(--accent)' }}>{'△'}{r.ratings.ok}</span>
                          {' '}
                          <span style={{ color: 'var(--error)' }}>{'×'}{r.ratings.bad}</span>
                        </span>
                      ) : (
                        <span>{r.correct}{'/'}{r.total}{' ('}{pct}{'%)'}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Clear records */}
      {records.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <button
            className="hint-btn"
            onClick={onClearRecords}
            style={{ fontSize: '0.78rem', opacity: 0.7 }}
          >
            {'学習記録をリセット'}
          </button>
        </div>
      )}
    </div>
  )
}
