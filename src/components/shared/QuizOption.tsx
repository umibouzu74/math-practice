import type { ReactNode } from 'react'

const markers = ['\u30A2', '\u30A4', '\u30A6', '\u30A8']
const keyHints = ['1', '2', '3', '4']

interface QuizOptionProps {
  index: number;
  children: ReactNode;
  selected: boolean;
  isCorrect: boolean;
  isChosen: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function QuizOption({
  index,
  children,
  isCorrect,
  isChosen,
  disabled,
  onClick,
}: QuizOptionProps) {
  let cls = 'quiz-option'
  if (disabled) {
    cls += ' disabled'
    if (isCorrect) cls += ' correct'
    else if (isChosen) cls += ' wrong'
  }

  return (
    <button
      className={cls}
      onClick={onClick}
      disabled={disabled}
      aria-label={`選択肢${markers[index]}（キー${keyHints[index]}）`}
      role="option"
      aria-selected={isChosen}
    >
      <span className="option-marker">
        {markers[index]}
        <span className="option-key-hint">{keyHints[index]}</span>
      </span>
      <span>{children}</span>
    </button>
  )
}
