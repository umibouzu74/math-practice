import { useState, useCallback, useMemo } from 'react'
import type { Pattern } from '../../types/index.ts'
import { shuffle } from '../../utils/shuffle.ts'
import MathDisplay from '../shared/MathDisplay.tsx'
import QuizOption from '../shared/QuizOption.tsx'
import CompletionCard from '../shared/CompletionCard.tsx'
import ProgressBar from '../layout/ProgressBar.tsx'

interface PatternQuizProps {
  patterns: Pattern[];
}

interface Question extends Pattern {
  shuffledOptions: string[];
}

function generateQuestions(patterns: Pattern[]): Question[] {
  return shuffle(patterns).map(p => ({
    ...p,
    shuffledOptions: shuffle([...p.options]),
  }))
}

export default function PatternQuiz({ patterns }: PatternQuizProps) {
  const [questions, setQuestions] = useState(() => generateQuestions(patterns))
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  const current = questions[idx]
  const total = questions.length
  const done = idx >= total

  const isCorrect = useMemo(() => {
    if (!selected || done) return false
    return selected === current.correct
  }, [selected, done, current])

  const handleSelect = useCallback((opt: string) => {
    if (selected) return
    setSelected(opt)
    if (opt === current.correct) setScore(s => s + 1)
  }, [selected, current])

  const handleNext = useCallback(() => {
    setSelected(null)
    setIdx(i => i + 1)
  }, [])

  const handleReset = useCallback(() => {
    setQuestions(generateQuestions(patterns))
    setIdx(0)
    setSelected(null)
    setScore(0)
  }, [patterns])

  if (done) {
    const pct = Math.round((score / total) * 100)
    const icon = pct >= 80 ? '\u{1F9E0}' : '\u{1F4AA}'
    return (
      <CompletionCard icon={icon} title={`${score} / ${total} 正解（${pct}%）`}>
        <button className="next-btn" onClick={handleReset} style={{ maxWidth: 300, margin: '1rem auto 0' }}>
          {'もう一度チャレンジ'}
        </button>
      </CompletionCard>
    )
  }

  return (
    <div className="fade-in">
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
