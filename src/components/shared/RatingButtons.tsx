interface RatingButtonsProps {
  onRate: (rating: 'good' | 'ok' | 'bad') => void;
  goodLabel?: string;
  okLabel?: string;
  badLabel?: string;
}

export default function RatingButtons({
  onRate,
  goodLabel = '\u25CB \u308F\u304B\u3063\u305F',
  okLabel = '\u25B3 \u3042\u3084\u3057\u3044',
  badLabel = '\u00D7 \u5FD8\u308C\u3066\u305F',
}: RatingButtonsProps) {
  return (
    <div className="rating-row fade-in">
      <button className="rating-btn good" onClick={() => onRate('good')}>{goodLabel}</button>
      <button className="rating-btn ok" onClick={() => onRate('ok')}>{okLabel}</button>
      <button className="rating-btn bad" onClick={() => onRate('bad')}>{badLabel}</button>
    </div>
  )
}
