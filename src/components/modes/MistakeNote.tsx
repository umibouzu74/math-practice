import { useState, useCallback, useMemo } from 'react'
import type { MistakeEntry, ChapterData, Term, Pattern } from '../../types/index.ts'
import { shuffle } from '../../utils/shuffle.ts'
import MathDisplay from '../shared/MathDisplay.tsx'
import QuizOption from '../shared/QuizOption.tsx'
import ProgressBar from '../layout/ProgressBar.tsx'
import CompletionCard from '../shared/CompletionCard.tsx'

interface MistakeNoteProps {
  mistakes: MistakeEntry[];
  chapterData: ChapterData;
  chapterId: string;
  onRemoveMistake: (mode: 'formula' | 'term' | 'pattern' | 'practice', itemId: string) => void;
  onSaveMistake: (mode: 'formula' | 'term' | 'pattern' | 'practice', itemId: string) => void;
}

type DrillMode = null | 'term' | 'pattern'

export default function MistakeNote({ mistakes, chapterData, onRemoveMistake, onSaveMistake }: MistakeNoteProps) {
  const [drillMode, setDrillMode] = useState<DrillMode>(null)

  const termMistakes = useMemo(() =>
    mistakes.filter(m => m.mode === 'term').map(m => chapterData.terms.find(t => t.id === m.itemId)).filter(Boolean) as Term[],
    [mistakes, chapterData.terms]
  )
  const patternMistakes = useMemo(() =>
    mistakes.filter(m => m.mode === 'pattern').map(m => chapterData.patterns.find(p => p.id === m.itemId)).filter(Boolean) as Pattern[],
    [mistakes, chapterData.patterns]
  )
  const formulaMistakes = useMemo(() =>
    mistakes.filter(m => m.mode === 'formula').map(m => chapterData.formulas.find(f => f.id === m.itemId)).filter((f): f is NonNullable<typeof f> => f != null),
    [mistakes, chapterData.formulas]
  )
  const practiceMistakes = useMemo(() =>
    mistakes.filter(m => m.mode === 'practice').map(m => chapterData.problems.find(p => p.id === m.itemId)).filter((p): p is NonNullable<typeof p> => p != null),
    [mistakes, chapterData.problems]
  )

  const totalMistakes = termMistakes.length + patternMistakes.length + formulaMistakes.length + practiceMistakes.length

  if (drillMode === 'term' && termMistakes.length > 0) {
    return <TermDrill
      terms={termMistakes}
      allTerms={chapterData.terms}
      onBack={() => setDrillMode(null)}
      onCorrect={(id) => onRemoveMistake('term', id)}
      onMistake={(id) => onSaveMistake('term', id)}
    />
  }

  if (drillMode === 'pattern' && patternMistakes.length > 0) {
    return <PatternDrill
      patterns={patternMistakes}
      onBack={() => setDrillMode(null)}
      onCorrect={(id) => onRemoveMistake('pattern', id)}
      onMistake={(id) => onSaveMistake('pattern', id)}
    />
  }

  if (totalMistakes === 0) {
    return (
      <div className="card fade-in">
        <div className="complete-card">
          <div className="complete-icon">{'\u{1F389}'}</div>
          <div className="complete-title">{'苦手な項目はありません'}</div>
          <p style={{ color: 'var(--ink-light)', fontSize: '0.88rem' }}>
            {'各モードで間違えた問題がここに集まります'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div style={{ fontSize: '0.85rem', color: 'var(--ink-light)', marginBottom: '1rem' }}>
        {'苦手な項目: '}<strong style={{ color: 'var(--ink)' }}>{totalMistakes}</strong>{' 件'}
      </div>

      {/* Term mistakes */}
      {termMistakes.length > 0 && (
        <div className="card" style={{ marginBottom: '0.75rem' }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <strong>{'📖 用語 ('}{termMistakes.length}{')'}</strong>
              <button className="hint-btn" onClick={() => setDrillMode('term')} style={{ margin: 0 }}>
                {'復習する'}
              </button>
            </div>
            {termMistakes.map(t => (
              <div key={t.id} className="ref-item">
                <div className="ref-item-name">{t.term}</div>
                <div className="ref-item-def">{t.definition}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pattern mistakes */}
      {patternMistakes.length > 0 && (
        <div className="card" style={{ marginBottom: '0.75rem' }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <strong>{'🧩 解法 ('}{patternMistakes.length}{')'}</strong>
              <button className="hint-btn" onClick={() => setDrillMode('pattern')} style={{ margin: 0 }}>
                {'復習する'}
              </button>
            </div>
            {patternMistakes.map(p => (
              <div key={p.id} className="ref-item">
                <div style={{ textAlign: 'center', marginBottom: '0.3rem' }}><MathDisplay tex={p.problem} display /></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent2)' }}><strong>{'正解: '}</strong>{p.correct}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formula mistakes */}
      {formulaMistakes.length > 0 && (
        <div className="card" style={{ marginBottom: '0.75rem' }}>
          <div className="card-body">
            <strong>{'📐 公式 ('}{formulaMistakes.length}{')'}</strong>
            {formulaMistakes.map(f => (
              <div key={f.id} className="ref-item">
                <div className="ref-item-name">{f.name}</div>
                <div className="ref-item-formula"><MathDisplay tex={f.formula} display /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practice mistakes */}
      {practiceMistakes.length > 0 && (
        <div className="card" style={{ marginBottom: '0.75rem' }}>
          <div className="card-body">
            <strong>{'✏️ 演習 ('}{practiceMistakes.length}{')'}</strong>
            {practiceMistakes.map(p => (
              <div key={p.id} className="ref-item">
                <MathDisplay tex={p.problem} display />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---- Term Drill Sub-component ---- */
interface TermDrillProps {
  terms: Term[];
  allTerms: Term[];
  onBack: () => void;
  onCorrect: (id: string) => void;
  onMistake: (id: string) => void;
}

function TermDrill({ terms, allTerms, onBack, onCorrect, onMistake }: TermDrillProps) {
  const [questions] = useState(() => shuffle(terms).map(t => {
    const wrong = shuffle(allTerms.filter(x => x.id !== t.id)).slice(0, 3)
    const options = shuffle([t, ...wrong])
    return { ...t, options, showDef: Math.random() > 0.5 }
  }))
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  const current = questions[idx]
  const total = questions.length
  const done = idx >= total

  const handleSelect = useCallback((value: string) => {
    if (selected) return
    setSelected(value)
    const correct = current.showDef ? value === current.term : value === current.definition
    if (correct) {
      setScore(s => s + 1)
      onCorrect(current.id)
    } else {
      onMistake(current.id)
    }
  }, [selected, current, onCorrect, onMistake])

  if (done) {
    const pct = Math.round((score / total) * 100)
    return (
      <CompletionCard icon={pct >= 80 ? '\u{1F3C6}' : '\u{1F4AA}'} title={`${score} / ${total} 正解（${pct}%）`}>
        <button className="next-btn" onClick={onBack} style={{ maxWidth: 300, margin: '0.5rem auto' }}>
          {'苦手一覧に戻る'}
        </button>
      </CompletionCard>
    )
  }

  const correctKey = current.showDef ? current.term : current.definition
  const isCorrect = selected !== null && selected === correctKey

  return (
    <div className="fade-in">
      <ProgressBar current={idx + 1} total={total} label={`正解 ${score}/${idx}`} />
      <div className="card">
        <div className="card-body">
          <div className="quiz-question">
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
              {current.showDef ? '次の説明に当てはまる用語は？' : '次の用語の意味は？'}
            </div>
            <div style={{ fontWeight: 600 }}>{current.showDef ? current.definition : current.term}</div>
          </div>
          <div className="quiz-options">
            {current.options.map((opt, i) => {
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
              <div style={{ marginTop: '0.3rem' }}><strong>{current.term}</strong>{'：'}{current.definition}</div>
            </div>
          )}
          {selected && (
            <button className="next-btn" onClick={() => { setSelected(null); setIdx(i => i + 1) }}>
              {'次の問題 →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---- Pattern Drill Sub-component ---- */
interface PatternDrillProps {
  patterns: Pattern[];
  onBack: () => void;
  onCorrect: (id: string) => void;
  onMistake: (id: string) => void;
}

function PatternDrill({ patterns, onBack, onCorrect, onMistake }: PatternDrillProps) {
  const [questions] = useState(() => shuffle(patterns).map(p => ({ ...p, shuffledOptions: shuffle([...p.options]) })))
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  const current = questions[idx]
  const total = questions.length
  const done = idx >= total

  const handleSelect = useCallback((opt: string) => {
    if (selected) return
    setSelected(opt)
    if (opt === current.correct) {
      setScore(s => s + 1)
      onCorrect(current.id)
    } else {
      onMistake(current.id)
    }
  }, [selected, current, onCorrect, onMistake])

  if (done) {
    const pct = Math.round((score / total) * 100)
    return (
      <CompletionCard icon={pct >= 80 ? '\u{1F9E0}' : '\u{1F4AA}'} title={`${score} / ${total} 正解（${pct}%）`}>
        <button className="next-btn" onClick={onBack} style={{ maxWidth: 300, margin: '0.5rem auto' }}>
          {'苦手一覧に戻る'}
        </button>
      </CompletionCard>
    )
  }

  const isCorrect = selected === current.correct

  return (
    <div className="fade-in">
      <ProgressBar current={idx + 1} total={total} label={`正解 ${score}/${idx}`} />
      <div className="card">
        <div className="card-body">
          <div className="quiz-question">
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginBottom: '0.5rem' }}>{current.prompt}</div>
            <div style={{ textAlign: 'center' }}><MathDisplay tex={current.problem} display /></div>
          </div>
          <div className="quiz-options">
            {current.shuffledOptions.map((opt, i) => (
              <QuizOption key={i} index={i} selected={selected !== null}
                isCorrect={opt === current.correct} isChosen={opt === selected}
                disabled={selected !== null} onClick={() => handleSelect(opt)}>
                {opt}
              </QuizOption>
            ))}
          </div>
          {selected && (
            <div className={`explanation ${isCorrect ? 'correct-bg' : 'wrong-bg'}`}>
              <strong>{isCorrect ? '正解！ ✓' : '不正解… ✗'}</strong>
              <div style={{ marginTop: '0.4rem' }}><strong>{'正解：'}</strong>{current.correct}</div>
              <div style={{ marginTop: '0.3rem' }}>{current.explanation}</div>
            </div>
          )}
          {selected && (
            <button className="next-btn" onClick={() => { setSelected(null); setIdx(i => i + 1) }}>
              {'次の問題 →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
