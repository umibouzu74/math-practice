import { useState, useCallback, useEffect, useRef } from 'react'
import type { Problem } from '../../types/index.ts'
import MathDisplay from '../shared/MathDisplay.tsx'
import RatingButtons from '../shared/RatingButtons.tsx'
import CompletionCard from '../shared/CompletionCard.tsx'
import ProgressBar from '../layout/ProgressBar.tsx'

interface PracticeProblemsProps {
  problems: Problem[];
  onComplete?: (total: number, correct: number, ratings: { good: number; ok: number; bad: number }) => void;
}

export default function PracticeProblems({ problems, onComplete }: PracticeProblemsProps) {
  const [idx, setIdx] = useState(0)
  const [hintsShown, setHintsShown] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [selfRating, setSelfRating] = useState<string | null>(null)
  const [ratings, setRatings] = useState({ good: 0, ok: 0, bad: 0 })

  const total = problems.length
  const done = idx >= total
  const current = !done ? problems[idx] : null
  const completedRef = useRef(false)

  useEffect(() => {
    if (done && !completedRef.current) {
      completedRef.current = true
      onComplete?.(total, ratings.good, ratings)
    }
  }, [done])

  const handleRate = useCallback((rating: 'good' | 'ok' | 'bad') => {
    setSelfRating(rating)
    setRatings(r => ({ ...r, [rating]: r[rating] + 1 }))
  }, [])

  const handleNext = useCallback(() => {
    setIdx(i => i + 1)
    setHintsShown(0)
    setShowSolution(false)
    setSelfRating(null)
  }, [])

  const handleReset = useCallback(() => {
    setIdx(0)
    setHintsShown(0)
    setShowSolution(false)
    setSelfRating(null)
    setRatings({ good: 0, ok: 0, bad: 0 })
  }, [])

  if (done) {
    const totalRated = ratings.good + ratings.ok + ratings.bad
    const icon = ratings.good >= totalRated * 0.7 ? '\u{1F3C6}' : '\u{1F4AA}'
    return (
      <CompletionCard icon={icon} title={`${totalRated}問 完了！`}>
        <div className="stats-row" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
          <span className="stat-chip green">{'○ '}{ratings.good}</span>
          <span className="stat-chip yellow">{'△ '}{ratings.ok}</span>
          <span className="stat-chip red">{'× '}{ratings.bad}</span>
        </div>
        <button className="next-btn" onClick={handleReset} style={{ maxWidth: 300, margin: '1rem auto 0' }}>
          {'もう一度チャレンジ'}
        </button>
      </CompletionCard>
    )
  }

  return (
    <div className="fade-in">
      <ProgressBar current={idx + 1} total={total} label="練習問題" />

      <div className="card">
        <div className="card-body">
          {/* Problem */}
          <div className="quiz-question" style={{ borderLeftColor: 'var(--accent)' }}>
            <MathDisplay tex={current!.problem} display />
          </div>

          {/* Hints */}
          <div style={{ marginBottom: '1rem' }}>
            {current!.hints.map((hint, i) => (
              <div key={i}>
                {i < hintsShown && (
                  <div className="hint-box fade-in" style={{ marginBottom: '0.5rem' }}>
                    {'💡 ヒント'}{i + 1}{'：'}<MathDisplay tex={hint} />
                  </div>
                )}
              </div>
            ))}
            {hintsShown < current!.hints.length && !showSolution && (
              <button className="hint-btn" onClick={() => setHintsShown(h => h + 1)}>
                {'ヒント '}{hintsShown + 1}{' を見る'}
              </button>
            )}
          </div>

          {/* Solution toggle / display */}
          {!showSolution ? (
            <button className="hint-btn primary" onClick={() => setShowSolution(true)}>
              {'解答を見る'}
            </button>
          ) : (
            <div className="solution-box fade-in">
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--accent2)' }}>
                {'解答'}
              </div>
              {current!.steps.map((step, i) => (
                <div key={i} className="solution-step">
                  <MathDisplay tex={step} display />
                </div>
              ))}
              <div style={{ marginTop: '0.75rem', padding: '0.6rem', background: '#f0f9ff', borderRadius: '6px', textAlign: 'center' }}>
                <strong>{'答：'}</strong> <MathDisplay tex={current!.solution} />
              </div>
            </div>
          )}

          {/* Self-rating */}
          {showSolution && !selfRating && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--ink-light)', marginBottom: '0.5rem' }}>
                {'自己評価：'}
              </div>
              <RatingButtons
                onRate={handleRate}
                goodLabel="○ 解けた"
                okLabel="△ 惜しい"
                badLabel="× 解けず"
              />
            </div>
          )}

          {/* Next button */}
          {selfRating && (
            <button className="next-btn" onClick={handleNext}>
              {'次の問題 →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
