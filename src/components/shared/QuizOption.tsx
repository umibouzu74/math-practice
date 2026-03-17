import type { ReactNode } from 'react'

const markers = ['\u30A2', '\u30A4', '\u30A6', '\u30A8']

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
    <button className={cls} onClick={onClick} disabled={disabled}>
      <span className="option-marker">{markers[index]}</span>
      <span>{children}</span>
    </button>
  )
}
