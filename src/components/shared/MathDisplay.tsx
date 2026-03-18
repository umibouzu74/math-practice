import { useRef, useEffect, memo } from 'react'
import katex from 'katex'

interface MathDisplayProps {
  tex: string;
  display?: boolean;
}

export default memo(function MathDisplay({ tex, display = false }: MathDisplayProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(tex, ref.current, {
          displayMode: display,
          throwOnError: false,
          trust: true,
        })
      } catch {
        ref.current.textContent = tex
      }
    }
  }, [tex, display])

  if (display) {
    return <div ref={ref as React.RefObject<HTMLDivElement>} className="katex-display" />
  }
  return <span ref={ref as React.RefObject<HTMLSpanElement>} />
})
