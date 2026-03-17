import { useState, useMemo } from 'react'
import type { Chapter, ChapterData, Mode } from '../types/index.ts'
import Header from './layout/Header.tsx'
import ModeTabs from './layout/ModeTabs.tsx'

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

  return (
    <div>
      <Header
        chapters={chapters}
        selectedChapterId={chapterId}
        onChapterChange={handleChapterChange}
      />
      <ModeTabs activeMode={mode} onModeChange={setMode} />
      <main className="main">
        <div className="fade-in" key={`${chapterId}-${mode}`}>
          <div style={{
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
            border: '1px solid #e5e0d8',
            padding: '3rem 2rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {mode === 'formula' && '\u{1F4D0}'}
              {mode === 'term' && '\u{1F4D6}'}
              {mode === 'pattern' && '\u{1F9E9}'}
              {mode === 'practice' && '\u270F\uFE0F'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {mode === 'formula' && `公式フラッシュカード（${chapterData.formulas.length}枚）`}
              {mode === 'term' && `用語クイズ（${chapterData.terms.length}問）`}
              {mode === 'pattern' && `解法パターン判別（${chapterData.patterns.length}問）`}
              {mode === 'practice' && `練習問題（${chapterData.problems.length}問）`}
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
              Step 3 以降で実装予定
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
