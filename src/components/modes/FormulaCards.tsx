import { useState, useCallback, useEffect, useRef, type TouchEvent as ReactTouchEvent } from 'react'
import type { Formula } from '../../types/index.ts'
import { shuffle } from '../../utils/shuffle.ts'
import MathDisplay from '../shared/MathDisplay.tsx'
import RatingButtons from '../shared/RatingButtons.tsx'
import CompletionCard from '../shared/CompletionCard.tsx'
import ProgressBar from '../layout/ProgressBar.tsx'

interface FormulaCardsProps {
  formulas: Formula[];
  onComplete?: (total: number, correct: number, ratings: { good: number; ok: number; bad: number }) => void;
  onMistake?: (itemId: string) => void;
  onCorrect?: (itemId: string) => void;
}

type Rating = 'good' | 'ok' | 'bad'

export default function FormulaCards({ formulas, onComplete, onMistake, onCorrect }: FormulaCardsProps) {
  const [isShuffled, setIsShuffled] = useState(true)
  const [queue, setQueue] = useState(() => shuffle(formulas))
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [stats, setStats] = useState({ good: 0, ok: 0, bad: 0 })
  const [retryQueue, setRetryQueue] = useState<Formula[]>([])

  const current = queue[idx]
  const total = queue.length
  const done = idx >= total
  const completedRef = useRef(false)

  // Swipe handling
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)

  const handleTouchStart = useCallback((e: ReactTouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    setSwipeOffset(0)
  }, [])

  const handleTouchMove = useCallback((e: ReactTouchEvent) => {
    if (!touchStartRef.current) return
    const dx = e.touches[0].clientX - touchStartRef.current.x
    const dy = e.touches[0].clientY - touchStartRef.current.y
    // Only track horizontal swipe
    if (Math.abs(dx) > Math.abs(dy)) {
      // Suppress drag at boundaries (first card can't go right, unflipped can't go left)
      if (dx > 0 && idx === 0) {
        setSwipeOffset(dx * 0.2) // dampened feedback
      } else if (dx < 0 && !flipped) {
        setSwipeOffset(dx * 0.2) // dampened feedback
      } else {
        setSwipeOffset(dx)
      }
    }
  }, [idx, flipped])

  const handleTouchEnd = useCallback(() => {
    const threshold = 80
    if (swipeOffset > threshold && idx > 0) {
      // Swipe right → previous card
      setFlipped(false)
      setIdx(i => i - 1)
    } else if (swipeOffset < -threshold && flipped) {
      // Swipe left → skip (only when card is flipped, to avoid accidental skips)
      setFlipped(false)
      setTimeout(() => setIdx(i => i + 1), 150)
    }
    setSwipeOffset(0)
    touchStartRef.current = null
  }, [swipeOffset, idx, flipped])

  useEffect(() => {
    if (done && !completedRef.current) {
      completedRef.current = true
      onComplete?.(total, stats.good, stats)
    }
  }, [done, onComplete, total, stats])

  const handleRate = useCallback((rating: Rating) => {
    setStats(s => ({ ...s, [rating]: s[rating] + 1 }))
    if (rating === 'good') {
      onCorrect?.(current.id)
    } else {
      onMistake?.(current.id)
      setRetryQueue(q => [...q, current])
    }
    setFlipped(false)
    setTimeout(() => setIdx(i => i + 1), 150)
  }, [current, onMistake, onCorrect])

  const handleRetry = useCallback(() => {
    setQueue(shuffle(retryQueue))
    setRetryQueue([])
    setIdx(0)
    setStats({ good: 0, ok: 0, bad: 0 })
  }, [retryQueue])

  const handleToggleShuffle = useCallback(() => {
    setIsShuffled(prev => {
      const next = !prev
      setQueue(next ? shuffle(formulas) : [...formulas])
      setIdx(0)
      setFlipped(false)
      setStats({ good: 0, ok: 0, bad: 0 })
      setRetryQueue([])
      return next
    })
  }, [formulas])

  const handleReset = useCallback(() => {
    setQueue(isShuffled ? shuffle(formulas) : [...formulas])
    setIdx(0)
    setFlipped(false)
    setStats({ good: 0, ok: 0, bad: 0 })
    setRetryQueue([])
  }, [formulas, isShuffled])

  // Keyboard shortcuts: Space to flip, 1/2/3 for ○△×
  useEffect(() => {
    if (done) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!flipped) {
          setFlipped(true)
        }
      }
      if (flipped) {
        if (e.key === '1') handleRate('good')
        else if (e.key === '2') handleRate('ok')
        else if (e.key === '3') handleRate('bad')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [done, flipped, handleRate])

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
      <div className="shuffle-toggle-row">
        <button
          className={`shuffle-toggle-btn ${isShuffled ? 'active' : ''}`}
          onClick={handleToggleShuffle}
          aria-label={isShuffled ? 'ランダム順' : '順番通り'}
        >
          {isShuffled ? '🔀 ランダム' : '📋 順番通り'}
        </button>
      </div>
      <ProgressBar current={idx + 1} total={total} label={current.category} />

      <div
        className="flashcard-container"
        onClick={() => setFlipped(f => !f)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label="公式カードをめくる（左右スワイプで移動）"
      >
        <div
          className={`flashcard ${flipped ? 'flipped' : ''}`}
          style={swipeOffset !== 0 ? { transform: `${flipped ? 'rotateY(180deg) ' : ''}translateX(${swipeOffset}px)`, transition: 'none' } : undefined}
        >
          {/* Front */}
          <div className="flashcard-face">
            <div className="flashcard-label">{'\u516C\u5F0F\u540D'}</div>
            <div className="flashcard-title">{current.name}</div>
            {current.example && (
              <div style={{ marginTop: '0.5rem', opacity: 0.6, fontSize: '0.8rem' }}>
                {'\u4F8B'}: <MathDisplay tex={current.example} />
              </div>
            )}
            <div className="tap-hint">{'タップで公式を表示 ｜ ← → スワイプで移動'}</div>
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
