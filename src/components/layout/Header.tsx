import type { Chapter } from '../../types/index.ts'

interface HeaderProps {
  chapters: Chapter[];
  selectedChapterId: string;
  onChapterChange: (chapterId: string) => void;
}

export default function Header({ chapters, selectedChapterId, onChapterChange }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-top">
        <h1>数学<span>マスター</span></h1>
        <select
          className="chapter-select"
          value={selectedChapterId}
          onChange={(e) => onChapterChange(e.target.value)}
        >
          {chapters.map((ch) => (
            <option key={ch.id} value={ch.id}>{ch.name}</option>
          ))}
        </select>
      </div>
    </header>
  )
}
