import type { Mode } from '../../types/index.ts'

const modes: { id: Mode; icon: string; label: string }[] = [
  { id: 'reference', icon: '\u{1F4DA}', label: '一覧' },
  { id: 'formula', icon: '\u{1F4D0}', label: '公式' },
  { id: 'term', icon: '\u{1F4D6}', label: '用語' },
  { id: 'pattern', icon: '\u{1F9E9}', label: '解法' },
  { id: 'practice', icon: '\u270F\uFE0F', label: '演習' },
]

interface ModeTabsProps {
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function ModeTabs({ activeMode, onModeChange }: ModeTabsProps) {
  return (
    <div className="tabs">
      {modes.map((m) => (
        <button
          key={m.id}
          className={`tab ${activeMode === m.id ? 'active' : ''}`}
          onClick={() => onModeChange(m.id)}
        >
          <span className="tab-icon">{m.icon}</span>
          {m.label}
        </button>
      ))}
    </div>
  )
}
