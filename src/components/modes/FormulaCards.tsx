import { useState, useCallback } from 'react'
import type { Formula } from '../../types/index.ts'
import { shuffle } from '../../utils/shuffle.ts'
import MathDisplay from '../shared/MathDisplay.tsx'
import RatingButtons from '../shared/RatingButtons.tsx'
import CompletionCard from '../shared/CompletionCard.tsx'
import ProgressBar from '../layout/ProgressBar.tsx'

interface FormulaCardsProps {
  formulas: Formula[];
}

type Rating = 'good' | 'ok' | 'bad'

export default function FormulaCards({ formulas }: FormulaCardsProps) {
  const [queue, setQueue] = useState(() => shuffle(formulas))
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [stats, setStats] = useState({ good: 0, ok: 0, bad: 0 })
  const [retryQueue, setRetryQueue] = useState<Formula[]>([])

  const current = queue[idx]
  const total = queue.length
  const done = idx >= total

  const handleRate = useCallback((rating: Rating) => {
    setStats(s => ({ ...s, [rating]: s[rating] + 1 }))
    if (rating !== 'good') {
      setRetryQueue(q => [...q, current])
    }
    setFlipped(false)
    setTimeout(() => setIdx(i => i + 1), 150)
  }, [current])

  const handleRetry = useCallback(() => {
    setQueue(shuffle(retryQueue))
    setRetryQueue([])
    setIdx(0)
    setStats({ good: 0, ok: 0, bad: 0 })
  }, [retryQueue])

  const handleReset = useCallback(() => {
    setQueue(shuffle(formulas))
    setIdx(0)
    setFlipped(false)
    setStats({ good: 0, ok: 0, bad: 0 })
    setRetryQueue([])
  }, [formulas])

  if (done) {
    return (
      <CompletionCard icon="\u{1F3AF}" title="1\u5468\u5B8C\u4E86\uFF01">
        <div className="stats-row" style={{ justifyContent: 'center', marginTop: '1rem' }}>
          <span className="stat-chip green">{'\u25CB'} {stats.good}</span>
          <span className="stat-chip yellow">{'\u25B3'} {stats.ok}</span>
          <span className="stat-chip red">{'\u00D7'} {stats.bad}</span>
        </div>
        {retryQueue.length > 0 && (
          <button className="next-btn" onClick={handleRetry} style={{ maxWidth: 300, margin: '0.5rem auto' }}>
            {'\u25B3\u00D7'}{'\u306E'} {retryQueue.length} {'\u679A\u3092\u5FA9\u7FD2\u3059\u308B'}
          </button>
        )}
        <button className="hint-btn" onClick={handleReset} style={{ marginTop: '0.75rem' }}>
          {'\u6700\u521D\u304B\u3089\u3084\u308A\u76F4\u3059'}
        </button>
      </CompletionCard>
    )
  }

  return (
    <div className="fade-in">
      <ProgressBar current={idx + 1} total={total} label={current.category} />

      <div className="flashcard-container" onClick={() => setFlipped(f => !f)}>
        <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="flashcard-face">
            <div className="flashcard-label">{'\u516C\u5F0F\u540D'}</div>
            <div className="flashcard-title">{current.name}</div>
            {current.example && (
              <div style={{ marginTop: '0.5rem', opacity: 0.6, fontSize: '0.8rem' }}>
                {'\u4F8B'}: <MathDisplay tex={current.example} />
              </div>
            )}
            <div className="tap-hint">{'\u30BF\u30C3\u30D7\u3067\u516C\u5F0F\u3092\u8868\u793A'}</div>
          </div>
          {/* Back */}
          <div className="flashcard-face flashcard-back">
            <div className="flashcard-label">{'\u516C\u5F0F'}</div>
            <div className="flashcard-math">
              <MathDisplay tex={current.formula} display />
            </div>
            {current.note && (
              <div className="flashcard-note">{'\u{1F4A1}'} {current.note}</div>
            )}
          </div>
        </div>
      </div>

      {flipped && (
        <RatingButtons onRate={handleRate} />
      )}
    </div>
  )
}
