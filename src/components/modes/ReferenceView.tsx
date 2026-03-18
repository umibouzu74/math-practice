import { useState } from 'react'
import type { Formula, Term, Pattern, Problem } from '../../types/index.ts'
import MathDisplay from '../shared/MathDisplay.tsx'

interface ReferenceViewProps {
  formulas: Formula[]
  terms: Term[]
  patterns: Pattern[]
  problems: Problem[]
}

function AccordionSection({
  icon,
  title,
  defaultOpen = true,
  children,
}: {
  icon: string
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="card ref-section">
      <button className="ref-section-header" onClick={() => setOpen(o => !o)}>
        <span className="ref-section-title">
          <span>{icon}</span> {title}
        </span>
        <span className={`ref-chevron ${open ? 'open' : ''}`}>&#9662;</span>
      </button>
      {open && <div className="ref-section-body">{children}</div>}
    </div>
  )
}

function groupByCategory(formulas: Formula[]): Record<string, Formula[]> {
  const groups: Record<string, Formula[]> = {}
  for (const f of formulas) {
    const key = f.category
    if (!groups[key]) groups[key] = []
    groups[key].push(f)
  }
  return groups
}

function ExpandableSolution({ problem }: { problem: Problem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="ref-item">
      <div className="ref-item-problem">
        <MathDisplay tex={problem.problem} display />
      </div>
      <button
        className="ref-solution-toggle"
        onClick={() => setOpen(o => !o)}
      >
        {open ? '解答を閉じる ▲' : '解答を見る ▼'}
      </button>
      {open && (
        <div className="ref-solution-detail fade-in">
          {problem.hints.length > 0 && (
            <div className="ref-solution-hints">
              {problem.hints.map((hint, i) => (
                <div key={i} className="ref-solution-hint">
                  {'💡 ヒント'}{i + 1}{'：'}<MathDisplay tex={hint} />
                </div>
              ))}
            </div>
          )}
          <div className="ref-solution-steps">
            {problem.steps.map((step, i) => (
              <div key={i} className="solution-step">
                <MathDisplay tex={step} display />
              </div>
            ))}
          </div>
          <div className="ref-solution-answer">
            <strong>{'答：'}</strong> <MathDisplay tex={problem.solution} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReferenceView({ formulas, terms, patterns, problems }: ReferenceViewProps) {
  const formulaGroups = groupByCategory(formulas)

  return (
    <div className="fade-in">
      {/* Section 1: 公式一覧 */}
      <AccordionSection icon="\u{1F4D0}" title="公式一覧">
        {Object.entries(formulaGroups).map(([category, items]) => (
          <div key={category} className="ref-group">
            <div className="ref-group-label">{category}</div>
            {items.map(f => (
              <div key={f.id} className="ref-item">
                <div className="ref-item-name">{f.name}</div>
                <div className="ref-item-formula">
                  <MathDisplay tex={f.formula} display />
                </div>
                {f.note && (
                  <div className="ref-item-note">{'\u{1F4A1}'} {f.note}</div>
                )}
                {f.example && (
                  <div className="ref-item-example">
                    例: <MathDisplay tex={f.example} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        {formulas.length === 0 && (
          <div className="ref-empty">データがありません</div>
        )}
      </AccordionSection>

      {/* Section 2: 用語一覧 */}
      <AccordionSection icon="\u{1F4D6}" title="用語一覧">
        {terms.map(t => (
          <div key={t.id} className="ref-item">
            <div className="ref-item-name">{t.term}</div>
            <div className="ref-item-def">{t.definition}</div>
            {t.example && (
              <div className="ref-item-example">
                例: <MathDisplay tex={t.example} />
              </div>
            )}
          </div>
        ))}
        {terms.length === 0 && (
          <div className="ref-empty">データがありません</div>
        )}
      </AccordionSection>

      {/* Section 3: 解法パターン一覧 */}
      <AccordionSection icon="\u{1F9E9}" title="解法パターン一覧">
        {patterns.map(p => (
          <div key={p.id} className="ref-item">
            <div className="ref-item-problem">
              <MathDisplay tex={p.problem} display />
            </div>
            <div className="ref-item-prompt">{p.prompt}</div>
            <div className="ref-item-correct">{p.correct}</div>
            <div className="ref-item-explanation">{p.explanation}</div>
          </div>
        ))}
        {patterns.length === 0 && (
          <div className="ref-empty">データがありません</div>
        )}
      </AccordionSection>

      {/* Section 4: 練習問題一覧 */}
      <AccordionSection icon={'\u270F\uFE0F'} title="練習問題一覧" defaultOpen={false}>
        {problems.map(p => (
          <ExpandableSolution key={p.id} problem={p} />
        ))}
        {problems.length === 0 && (
          <div className="ref-empty">データがありません</div>
        )}
      </AccordionSection>
    </div>
  )
}
