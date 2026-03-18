import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { Term } from '../../types/index.ts'
import { shuffle } from '../../utils/shuffle.ts'
import MathDisplay from '../shared/MathDisplay.tsx'
import QuizOption from '../shared/QuizOption.tsx'
import CompletionCard from '../shared/CompletionCard.tsx'
import ProgressBar from '../layout/ProgressBar.tsx'

interface TermQuizProps {
  terms: Term[];
  onComplete?: (total: number, correct: number) => void;
  onMistake?: (itemId: string) => void;
  onCorrect?: (itemId: string) => void;
}

interface Question extends Term {
  options: Term[];
  showDef: boolean;
}

function generateQuestions(termList: Term[], shouldShuffle: boolean): Question[] {
  const ordered = shouldShuffle ? shuffle(termList) : termList
  return ordered.map(t => {
    const wrong = shuffle(termList.filter(x => x.id !== t.id)).slice(0, 3)
    const options = shuffle([t, ...wrong])
    const showDef = Math.random() > 0.5
    return { ...t, options, showDef }
  })
}

export default function TermQuiz({ terms, onComplete, onMistake, onCorrect }: TermQuizProps) {
  const [isShuffled, setIsShuffled] = useState(true)
  const [questions, setQuestions] = useState(() => generateQuestions(terms, true))
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [wrongTerms, setWrongTerms] = useState<Term[]>([])

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
    return current.showDef
      ? selected === current.term
      : selected === current.definition
  }, [selected, done, current])

  const correctKey = !done
    ? (current.showDef ? current.term : current.definition)
    : ''

  const handleSelect = useCallback((value: string) => {
    if (selected) return
    setSelected(value)
    const correct = current.showDef
      ? value === current.term
      : value === current.definition
    if (correct) {
      setScore(s => s + 1)
      onCorrect?.(current.id)
    } else {
      onMistake?.(current.id)
      setWrongTerms(prev => {
        if (prev.some(t => t.id === current.id)) return prev
        return [...prev, current as Term]
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
        if (num >= 1 && num <= current.options.length) {
          const opt = current.options[num - 1]
          const value = current.showDef ? opt.term : opt.definition
          handleSelect(value)
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
      setQuestions(generateQuestions(terms, next))
      setIdx(0)
      setSelected(null)
      setScore(0)
      return next
    })
  }, [terms])

  const handleRetry = useCallback(() => {
    setQuestions(generateQuestions(wrongTerms, true))
    setIdx(0)
    setSelected(null)
    setScore(0)
    setWrongTerms([])
  }, [wrongTerms])

  const handleReset = useCallback(() => {
    setQuestions(generateQuestions(terms, isShuffled))
    setIdx(0)
    setSelected(null)
    setScore(0)
    setWrongTerms([])
  }, [terms, isShuffled])

  if (done) {
    const pct = Math.round((score / total) * 100)
    const icon = pct >= 80 ? '\u{1F3C6}' : pct >= 60 ? '\u{1F44D}' : '\u{1F4DA}'
    return (
      <CompletionCard icon={icon} title={`${score} / ${total} \u6B63\u89E3\uFF08${pct}%\uFF09`}>
        {wrongTerms.length > 0 && (
          <button className="next-btn" onClick={handleRetry} style={{ maxWidth: 300, margin: '0.5rem auto' }}>
            {'不正解の'} {wrongTerms.length} {'問を復習する'}
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
      <ProgressBar current={idx + 1} total={total} label={`\u6B63\u89E3 ${score}/${idx}`} />

      <div className="card">
        <div className="card-body">
          {/* Question */}
          {current.showDef ? (
            <div className="quiz-question">
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
                {'\u6B21\u306E\u8AAC\u660E\u306B\u5F53\u3066\u306F\u307E\u308B\u7528\u8A9E\u306F\uFF1F'}
              </div>
              <div style={{ fontWeight: 600 }}>{current.definition}</div>
            </div>
          ) : (
            <div className="quiz-question">
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
                {'\u6B21\u306E\u7528\u8A9E\u306E\u610F\u5473\u306F\uFF1F'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{current.term}</div>
            </div>
          )}

          {/* Options */}
          <div className="quiz-options">
            {current.options.map((opt, i) => {
              const label = current.showDef ? opt.term : opt.definition
              const value = current.showDef ? opt.term : opt.definition

              return (
                <QuizOption
                  key={opt.id}
                  index={i}
                  selected={selected !== null}
                  isCorrect={value === correctKey}
                  isChosen={value === selected}
                  disabled={selected !== null}
                  onClick={() => handleSelect(value)}
                >
                  {label}
                </QuizOption>
              )
            })}
          </div>

          {/* Explanation */}
          {selected && (
            <div className={`explanation ${isCorrect ? 'correct-bg' : 'wrong-bg'}`}>
              <strong>{isCorrect ? '\u6B63\u89E3\uFF01 \u2713' : '\u4E0D\u6B63\u89E3\u2026 \u2717'}</strong>
              <div style={{ marginTop: '0.3rem' }}>
                <strong>{current.term}</strong>{'\uFF1A'}{current.definition}
              </div>
              {current.example && (
                <div style={{ marginTop: '0.3rem' }}>
                  {'\u4F8B'}: <MathDisplay tex={current.example} />
                </div>
              )}
            </div>
          )}

          {selected && (
            <button className="next-btn" onClick={handleNext}>
              {'\u6B21\u306E\u554F\u984C \u2192'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
