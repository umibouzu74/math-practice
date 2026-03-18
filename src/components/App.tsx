import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import type { Chapter, ChapterData, Mode, StudyRecord, MistakeEntry } from '../types/index.ts'
import useLocalStorage from '../hooks/useLocalStorage.ts'
import Header from './layout/Header.tsx'
import ModeTabs from './layout/ModeTabs.tsx'
import FormulaCards from './modes/FormulaCards.tsx'
import TermQuiz from './modes/TermQuiz.tsx'
import PatternQuiz from './modes/PatternQuiz.tsx'
import PracticeProblems from './modes/PracticeProblems.tsx'
import ReferenceView from './modes/ReferenceView.tsx'
import StudyDashboard from './modes/StudyDashboard.tsx'
import MistakeNote from './modes/MistakeNote.tsx'
import CrossReview from './modes/CrossReview.tsx'

import chaptersJson from '../data/chapters.json'
import polynomialJson from '../data/polynomial.json'
import factoringJson from '../data/factoring.json'
import realnumbersJson from '../data/realnumbers.json'
import equationsJson from '../data/equations.json'

const chapters = chaptersJson as Chapter[]
const chapterDataMap: Record<string, ChapterData> = {
  polynomial: polynomialJson as ChapterData,
  factoring: factoringJson as ChapterData,
  realnumbers: realnumbersJson as ChapterData,
  equations: equationsJson as ChapterData,
}

export default function App() {
  const [chapterId, setChapterId] = useState(chapters[0].id)
  const [mode, setMode] = useState<Mode>('reference')
  const [records, setRecords] = useLocalStorage<StudyRecord[]>('math-master-records', [])
  const [mistakes, setMistakes] = useLocalStorage<MistakeEntry[]>('math-master-mistakes', [])
  const mainRef = useRef<HTMLElement>(null)
  const [transitioning, setTransitioning] = useState(false)

  const handleModeChange = useCallback((newMode: Mode) => {
    setTransitioning(true)
    setTimeout(() => {
      setMode(newMode)
      window.scrollTo({ top: 0 })
      setTransitioning(false)
    }, 150)
  }, [])

  useEffect(() => {
    // Also reset scroll on chapter change
    window.scrollTo({ top: 0 })
  }, [chapterId])

  const chapterData = useMemo(() => chapterDataMap[chapterId], [chapterId])

  const saveRecord = useCallback((m: Mode, total: number, correct: number, ratings?: { good: number; ok: number; bad: number }) => {
    const record: StudyRecord = {
      chapterId,
      mode: m,
      date: new Date().toISOString(),
      total,
      correct,
      ...(ratings && { ratings }),
    }
    setRecords(prev => [...prev, record])
  }, [chapterId, setRecords])

  const saveMistake = useCallback((itemMode: 'formula' | 'term' | 'pattern' | 'practice', itemId: string) => {
    setMistakes(prev => {
      const existing = prev.find(m => m.chapterId === chapterId && m.mode === itemMode && m.itemId === itemId)
      if (existing) {
        return prev.map(m =>
          m.chapterId === chapterId && m.mode === itemMode && m.itemId === itemId
            ? { ...m, count: m.count + 1, date: new Date().toISOString() }
            : m
        )
      }
      return [...prev, { chapterId, mode: itemMode, itemId, date: new Date().toISOString(), count: 1 }]
    })
  }, [chapterId, setMistakes])

  const removeMistake = useCallback((itemMode: 'formula' | 'term' | 'pattern' | 'practice', itemId: string) => {
    setMistakes(prev => prev.filter(m => !(m.chapterId === chapterId && m.mode === itemMode && m.itemId === itemId)))
  }, [chapterId, setMistakes])

  const handleChapterChange = (id: string) => {
    setChapterId(id)
  }

  const renderMode = () => {
    switch (mode) {
      case 'reference':
        return <ReferenceView
          key={`ref-${chapterId}`}
          formulas={chapterData.formulas}
          terms={chapterData.terms}
          patterns={chapterData.patterns}
          problems={chapterData.problems}
        />
      case 'formula':
        return chapterData.formulas.length > 0
          ? <FormulaCards key={`f-${chapterId}`} formulas={chapterData.formulas}
              onComplete={(total, correct, ratings) => saveRecord('formula', total, correct, ratings)}
              onMistake={(id) => saveMistake('formula', id)}
              onCorrect={(id) => removeMistake('formula', id)} />
          : <EmptyState />
      case 'term':
        return chapterData.terms.length > 0
          ? <TermQuiz key={`t-${chapterId}`} terms={chapterData.terms}
              onComplete={(total, correct) => saveRecord('term', total, correct)}
              onMistake={(id) => saveMistake('term', id)}
              onCorrect={(id) => removeMistake('term', id)} />
          : <EmptyState />
      case 'pattern':
        return chapterData.patterns.length > 0
          ? <PatternQuiz key={`p-${chapterId}`} patterns={chapterData.patterns}
              onComplete={(total, correct) => saveRecord('pattern', total, correct)}
              onMistake={(id) => saveMistake('pattern', id)}
              onCorrect={(id) => removeMistake('pattern', id)} />
          : <EmptyState />
      case 'practice':
        return chapterData.problems.length > 0
          ? <PracticeProblems key={`pr-${chapterId}`} problems={chapterData.problems}
              onComplete={(total, correct, ratings) => saveRecord('practice', total, correct, ratings)}
              onMistake={(id) => saveMistake('practice', id)}
              onCorrect={(id) => removeMistake('practice', id)} />
          : <EmptyState />
      case 'mistakes':
        return <MistakeNote
          key={`m-${chapterId}`}
          mistakes={mistakes.filter(m => m.chapterId === chapterId)}
          chapterData={chapterData}
          chapterId={chapterId}
          onRemoveMistake={removeMistake}
          onSaveMistake={saveMistake}
        />
      case 'review':
        return <CrossReview
          key="review"
          chapterDataMap={chapterDataMap}
          chapters={chapters}
          onSaveMistake={(chapId: string, itemMode: 'term' | 'pattern', itemId: string) => {
            setMistakes(prev => {
              const existing = prev.find(m => m.chapterId === chapId && m.mode === itemMode && m.itemId === itemId)
              if (existing) {
                return prev.map(m =>
                  m.chapterId === chapId && m.mode === itemMode && m.itemId === itemId
                    ? { ...m, count: m.count + 1, date: new Date().toISOString() }
                    : m
                )
              }
              return [...prev, { chapterId: chapId, mode: itemMode, itemId, date: new Date().toISOString(), count: 1 }]
            })
          }}
          onComplete={(total, correct) => saveRecord('pattern', total, correct)}
        />
      case 'dashboard':
        return <StudyDashboard
          key="dashboard"
          records={records}
          chapters={chapters}
          currentChapterId={chapterId}
          onClearRecords={() => setRecords([])}
        />
    }
  }

  return (
    <div>
      <Header
        chapters={chapters}
        selectedChapterId={chapterId}
        onChapterChange={handleChapterChange}
      />
      <ModeTabs activeMode={mode} onModeChange={handleModeChange} />
      <main className={`main ${transitioning ? 'mode-exit' : 'mode-enter'}`} ref={mainRef}>
        {renderMode()}
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card fade-in">
      <div className="complete-card">
        <div className="complete-icon">{'\u{1F4DD}'}</div>
        <div className="complete-title">{'\u6E96\u5099\u4E2D'}</div>
        <p style={{ color: 'var(--ink-light)' }}>{'\u3053\u306E\u30C1\u30E3\u30D7\u30BF\u30FC\u306B\u306F\u307E\u3060\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093'}</p>
      </div>
    </div>
  )
}

