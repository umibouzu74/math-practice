import { useState, useMemo } from 'react'
import type { Chapter, ChapterData, Mode } from '../types/index.ts'
import Header from './layout/Header.tsx'
import ModeTabs from './layout/ModeTabs.tsx'
import FormulaCards from './modes/FormulaCards.tsx'
import TermQuiz from './modes/TermQuiz.tsx'

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
  const [mode, setMode] = useState<Mode>('formula')

  const chapterData = useMemo(() => chapterDataMap[chapterId], [chapterId])

  const handleChapterChange = (id: string) => {
    setChapterId(id)
  }

  const renderMode = () => {
    switch (mode) {
      case 'formula':
        return chapterData.formulas.length > 0
          ? <FormulaCards key={`f-${chapterId}`} formulas={chapterData.formulas} />
          : <EmptyState />
      case 'term':
        return chapterData.terms.length > 0
          ? <TermQuiz key={`t-${chapterId}`} terms={chapterData.terms} />
          : <EmptyState />
      case 'pattern':
        return chapterData.patterns.length > 0
          ? <Placeholder label={`\u89E3\u6CD5\u30D1\u30BF\u30FC\u30F3\u5224\u5225\uFF08${chapterData.patterns.length}\u554F\uFF09`} icon="\u{1F9E9}" />
          : <EmptyState />
      case 'practice':
        return chapterData.problems.length > 0
          ? <Placeholder label={`\u7DF4\u7FD2\u554F\u984C\uFF08${chapterData.problems.length}\u554F\uFF09`} icon="\u270F\uFE0F" />
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

function Placeholder({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="card fade-in">
      <div className="complete-card">
        <div className="complete-icon">{icon}</div>
        <div className="complete-title">{label}</div>
        <p style={{ color: 'var(--ink-light)' }}>Step 4 {'\u4EE5\u964D\u3067\u5B9F\u88C5\u4E88\u5B9A'}</p>
      </div>
    </div>
  )
}
