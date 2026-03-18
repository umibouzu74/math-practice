import { useState } from 'react'
import type { Chapter } from '../../types/index.ts'

interface HeaderProps {
  chapters: Chapter[];
  selectedChapterId: string;
  onChapterChange: (chapterId: string) => void;
}

export default function Header({ chapters, selectedChapterId, onChapterChange }: HeaderProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const selectedChapter = chapters.find(ch => ch.id === selectedChapterId)

  return (
    <header className="header">
      <div className="header-top">
        <h1>数学<span>マスター</span></h1>
        <button
          className="chapter-select-btn"
          onClick={() => setModalOpen(true)}
          aria-label="章を選択"
        >
          <span className="chapter-select-name">{selectedChapter?.name ?? ''}</span>
          <span className="chapter-select-arrow">▼</span>
        </button>
      </div>

      {modalOpen && (
        <div className="chapter-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="chapter-modal" onClick={e => e.stopPropagation()}>
            <div className="chapter-modal-header">
              <span className="chapter-modal-title">章を選択</span>
              <button className="chapter-modal-close" onClick={() => setModalOpen(false)} aria-label="閉じる">✕</button>
            </div>
            <div className="chapter-modal-list">
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  className={`chapter-modal-item ${ch.id === selectedChapterId ? 'active' : ''}`}
                  onClick={() => { onChapterChange(ch.id); setModalOpen(false) }}
                >
                  <span className="chapter-modal-item-name">{ch.name}</span>
                  {ch.description && (
                    <span className="chapter-modal-item-desc">{ch.description}</span>
                  )}
                  {ch.id === selectedChapterId && <span className="chapter-modal-check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
