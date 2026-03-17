import { useState, useMemo, useCallback } from 'react'
import type { Chapter, ChapterData, Mode, StudyRecord } from '../types/index.ts'
import useLocalStorage from '../hooks/useLocalStorage.ts'
import Header from './layout/Header.tsx'
import ModeTabs from './layout/ModeTabs.tsx'
import FormulaCards from './modes/FormulaCards.tsx'
import TermQuiz from './modes/TermQuiz.tsx'
import PatternQuiz from './modes/PatternQuiz.tsx'
import PracticeProblems from './modes/PracticeProblems.tsx'
import ReferenceView from './modes/ReferenceView.tsx'

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
  const [, setRecords] = useLocalStorage<StudyRecord[]>('math-master-records', [])

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
        />
      case 'formula':
        return chapterData.formulas.length > 0
          ? <FormulaCards key={`f-${chapterId}`} formulas={chapterData.formulas}
              onComplete={(total, correct, ratings) => saveRecord('formula', total, correct, ratings)} />
          : <EmptyState />
      case 'term':
        return chapterData.terms.length > 0
          ? <TermQuiz key={`t-${chapterId}`} terms={chapterData.terms}
              onComplete={(total, correct) => saveRecord('term', total, correct)} />
          : <EmptyState />
      case 'pattern':
        return chapterData.patterns.length > 0
          ? <PatternQuiz key={`p-${chapterId}`} patterns={chapterData.patterns}
              onComplete={(total, correct) => saveRecord('pattern', total, correct)} />
          : <EmptyState />
      case 'practice':
        return chapterData.problems.length > 0
          ? <PracticeProblems key={`pr-${chapterId}`} problems={chapterData.problems}
              onComplete={(total, correct, ratings) => saveRecord('practice', total, correct, ratings)} />
          : <EmptyState />
    }
  }

  return (
    <div>
      <Header
        chapters={chapters}
        selectedChapterId={chapterId}
        onChapterChange={handleChapterChange}
      />
      <ModeTabs activeMode={mode} onModeChange={setMode} />
      <main className="main">
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

