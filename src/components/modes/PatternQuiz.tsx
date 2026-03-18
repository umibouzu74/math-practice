import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { Pattern } from '../../types/index.ts'
import { shuffle } from '../../utils/shuffle.ts'
import MathDisplay from '../shared/MathDisplay.tsx'
import QuizOption from '../shared/QuizOption.tsx'
import CompletionCard from '../shared/CompletionCard.tsx'
import ProgressBar from '../layout/ProgressBar.tsx'

interface PatternQuizProps {
  patterns: Pattern[];
  onComplete?: (total: number, correct: number) => void;
  onMistake?: (itemId: string) => void;
  onCorrect?: (itemId: string) => void;
}

interface Question extends Pattern {
  shuffledOptions: string[];
}

function generateQuestions(patterns: Pattern[], shouldShuffle: boolean): Question[] {
  const ordered = shouldShuffle ? shuffle(patterns) : patterns
  return ordered.map(p => ({
    ...p,
    shuffledOptions: shuffle([...p.options]),
  }))
}

export default function PatternQuiz({ patterns, onComplete, onMistake, onCorrect }: PatternQuizProps) {
  const [isShuffled, setIsShuffled] = useState(true)
  const [questions, setQuestions] = useState(() => generateQuestions(patterns, true))
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [wrongPatterns, setWrongPatterns] = useState<Pattern[]>([])

  const current = questions[idx]
  const total = questions.length
  const done = idx >= total
  const completedRef = useRef(false)

  useEffect(() => {
    if (done && !completedRef.current) {
      completedRef.current = true
      onComplete?.(total, score)
    }
  }, [done, onComplete, total, score])

  const isCorrect = useMemo(() => {
    if (!selected || done) return false
    return selected === current.correct
  }, [selected, done, current])

  const handleSelect = useCallback((opt: string) => {
    if (selected) return
    setSelected(opt)
    if (opt === current.correct) {
      setScore(s => s + 1)
      onCorrect?.(current.id)
    } else {
      onMistake?.(current.id)
      setWrongPatterns(prev => {
        if (prev.some(p => p.id === current.id)) return prev
        return [...prev, current as Pattern]
      })
    }
  }, [selected, current, onCorrect, onMistake])

  const handleNext = useCallback(() => {
    setSelected(null)
    setIdx(i => i + 1)
  }, [])

  // Keyboard shortcuts: 1-4 to select, Enter/Space for next
  useEffect(() => {
    if (done) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selected) {
        const num = parseInt(e.key)
        if (num >= 1 && num <= current.shuffledOptions.length) {
          handleSelect(current.shuffledOptions[num - 1])
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [done, selected, current, handleSelect, handleNext])

  const handleToggleShuffle = useCallback(() => {
    setIsShuffled(prev => {
      const next = !prev
      setQuestions(generateQuestions(patterns, next))
      setIdx(0)
      setSelected(null)
      setScore(0)
      return next
    })
  }, [patterns])

  const handleRetry = useCallback(() => {
    setQuestions(generateQuestions(wrongPatterns, true))
    setIdx(0)
    setSelected(null)
    setScore(0)
    setWrongPatterns([])
  }, [wrongPatterns])

  const handleReset = useCallback(() => {
    setQuestions(generateQuestions(patterns, isShuffled))
    setIdx(0)
    setSelected(null)
    setScore(0)
    setWrongPatterns([])
  }, [patterns, isShuffled])

  if (done) {
    const pct = Math.round((score / total) * 100)
    const icon = pct >= 80 ? '\u{1F9E0}' : '\u{1F4AA}'
    return (
      <CompletionCard icon={icon} title={`${score} / ${total} 正解（${pct}%）`}>
        {wrongPatterns.length > 0 && (
          <button className="next-btn" onClick={handleRetry} style={{ maxWidth: 300, margin: '0.5rem auto' }}>
            {'不正解の'} {wrongPatterns.length} {'問を復習する'}
          </button>
        )}
        <button className="hint-btn" onClick={handleReset} style={{ marginTop: '0.75rem' }}>
          {'最初からやり直す'}
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
      <ProgressBar current={idx + 1} total={total} label={`正解 ${score}/${idx}`} />

      <div className="card">
        <div className="card-body">
          {/* Question */}
          <div className="quiz-question">
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginBottom: '0.5rem' }}>
              {current.prompt}
            </div>
            <div style={{ textAlign: 'center' }}>
              <MathDisplay tex={current.problem} display />
            </div>
          </div>

          {/* Options */}
          <div className="quiz-options">
            {current.shuffledOptions.map((opt, i) => (
              <QuizOption
                key={i}
                index={i}
                selected={selected !== null}
                isCorrect={opt === current.correct}
                isChosen={opt === selected}
                disabled={selected !== null}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </QuizOption>
            ))}
          </div>

          {/* Explanation */}
          {selected && (
            <div className={`explanation ${isCorrect ? 'correct-bg' : 'wrong-bg'}`}>
              <strong>{isCorrect ? '正解！ ✓' : '不正解… ✗'}</strong>
              <div style={{ marginTop: '0.4rem' }}>
                <strong>{'正解：'}</strong>{current.correct}
              </div>
              <div style={{ marginTop: '0.3rem' }}>{current.explanation}</div>
            </div>
          )}

          {selected && (
            <button className="next-btn" onClick={handleNext}>
              {'次の問題 →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
