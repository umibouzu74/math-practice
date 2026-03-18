import { useState, useCallback, useMemo } from 'react'
import type { Chapter, ChapterData, Term, Pattern } from '../../types/index.ts'
import { shuffle } from '../../utils/shuffle.ts'
import MathDisplay from '../shared/MathDisplay.tsx'
import QuizOption from '../shared/QuizOption.tsx'
import CompletionCard from '../shared/CompletionCard.tsx'
import ProgressBar from '../layout/ProgressBar.tsx'

interface CrossReviewProps {
  chapterDataMap: Record<string, ChapterData>;
  chapters: Chapter[];
  onSaveMistake: (chapterId: string, mode: 'term' | 'pattern', itemId: string) => void;
  onComplete?: (total: number, correct: number) => void;
}

interface ReviewQuestion {
  type: 'term' | 'pattern';
  chapterId: string;
  chapterName: string;
  // Term question fields
  term?: Term;
  termOptions?: Term[];
  showDef?: boolean;
  // Pattern question fields
  pattern?: Pattern;
  shuffledOptions?: string[];
}

const MAX_QUESTIONS = 20

function buildQuestions(chapterDataMap: Record<string, ChapterData>, chapters: Chapter[]): ReviewQuestion[] {
  const questions: ReviewQuestion[] = []

  for (const ch of chapters) {
    const data = chapterDataMap[ch.id]
    if (!data) continue

    // Add term questions
    for (const t of data.terms) {
      const wrong = shuffle(data.terms.filter(x => x.id !== t.id)).slice(0, 3)
      if (wrong.length < 3) continue
      questions.push({
        type: 'term',
        chapterId: ch.id,
        chapterName: ch.name,
        term: t,
        termOptions: shuffle([t, ...wrong]),
        showDef: Math.random() > 0.5,
      })
    }

    // Add pattern questions
    for (const p of data.patterns) {
      questions.push({
        type: 'pattern',
        chapterId: ch.id,
        chapterName: ch.name,
        pattern: p,
        shuffledOptions: shuffle([...p.options]),
      })
    }
  }

  return shuffle(questions).slice(0, MAX_QUESTIONS)
}

export default function CrossReview({ chapterDataMap, chapters, onSaveMistake, onComplete }: CrossReviewProps) {
  const [questions, setQuestions] = useState(() => buildQuestions(chapterDataMap, chapters))
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)

  const current = questions[idx]
  const total = questions.length
  const done = idx >= total

  const correctKey = useMemo(() => {
    if (done) return ''
    if (current.type === 'term' && current.term) {
      return current.showDef ? current.term.term : current.term.definition
    }
    if (current.type === 'pattern' && current.pattern) {
      return current.pattern.correct
    }
    return ''
  }, [done, current])

  const isCorrect = selected !== null && selected === correctKey

  const handleSelect = useCallback((value: string) => {
    if (selected) return
    setSelected(value)
    if (value === correctKey) {
      setScore(s => s + 1)
    } else {
      const id = current.type === 'term' ? current.term!.id : current.pattern!.id
      onSaveMistake(current.chapterId, current.type, id)
    }
  }, [selected, correctKey, current, onSaveMistake])

  const handleNext = useCallback(() => {
    setSelected(null)
    const nextIdx = idx + 1
    setIdx(nextIdx)
    if (nextIdx >= total && !completed) {
      setCompleted(true)
      onComplete?.(total, score + (isCorrect ? 0 : 0))
    }
  }, [idx, total, completed, onComplete, score, isCorrect])

  const handleReset = useCallback(() => {
    setQuestions(buildQuestions(chapterDataMap, chapters))
    setIdx(0)
    setSelected(null)
    setScore(0)
    setCompleted(false)
  }, [chapterDataMap, chapters])

  if (total === 0) {
    return (
      <div className="card fade-in">
        <div className="complete-card">
          <div className="complete-icon">{'\u{1F4DD}'}</div>
          <div className="complete-title">{'データがありません'}</div>
        </div>
      </div>
    )
  }

  if (done) {
    const pct = Math.round((score / total) * 100)
    const icon = pct >= 80 ? '\u{1F3C6}' : pct >= 60 ? '\u{1F44D}' : '\u{1F4DA}'
    return (
      <CompletionCard icon={icon} title={`${score} / ${total} 正解（${pct}%）`}>
        <button className="next-btn" onClick={handleReset} style={{ maxWidth: 300, margin: '0.5rem auto' }}>
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
          {/* Chapter badge */}
          <div style={{ marginBottom: '0.75rem' }}>
            <span className="stat-chip blue">{current.chapterName}</span>
          </div>

          {/* Term question */}
          {current.type === 'term' && current.term && (
            <>
              <div className="quiz-question">
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
                  {current.showDef ? '次の説明に当てはまる用語は？' : '次の用語の意味は？'}
                </div>
                <div style={{ fontWeight: 600 }}>
                  {current.showDef ? current.term.definition : current.term.term}
                </div>
              </div>
              <div className="quiz-options">
                {current.termOptions!.map((opt, i) => {
                  const label = current.showDef ? opt.term : opt.definition
                  return (
                    <QuizOption key={opt.id} index={i} selected={selected !== null}
                      isCorrect={label === correctKey} isChosen={label === selected}
                      disabled={selected !== null} onClick={() => handleSelect(label)}>
                      {label}
                    </QuizOption>
                  )
                })}
              </div>
              {selected && (
                <div className={`explanation ${isCorrect ? 'correct-bg' : 'wrong-bg'}`}>
                  <strong>{isCorrect ? '正解！ ✓' : '不正解… ✗'}</strong>
                  <div style={{ marginTop: '0.3rem' }}>
                    <strong>{current.term.term}</strong>{'：'}{current.term.definition}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pattern question */}
          {current.type === 'pattern' && current.pattern && (
            <>
              <div className="quiz-question">
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginBottom: '0.5rem' }}>
                  {current.pattern.prompt}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <MathDisplay tex={current.pattern.problem} display />
                </div>
              </div>
              <div className="quiz-options">
                {current.shuffledOptions!.map((opt, i) => (
                  <QuizOption key={i} index={i} selected={selected !== null}
                    isCorrect={opt === current.pattern!.correct} isChosen={opt === selected}
                    disabled={selected !== null} onClick={() => handleSelect(opt)}>
                    {opt}
                  </QuizOption>
                ))}
              </div>
              {selected && (
                <div className={`explanation ${isCorrect ? 'correct-bg' : 'wrong-bg'}`}>
                  <strong>{isCorrect ? '正解！ ✓' : '不正解… ✗'}</strong>
                  <div style={{ marginTop: '0.4rem' }}><strong>{'正解：'}</strong>{current.pattern.correct}</div>
                  <div style={{ marginTop: '0.3rem' }}>{current.pattern.explanation}</div>
                </div>
              )}
            </>
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
