import type { ReactNode } from 'react'

interface CompletionCardProps {
  icon: string;
  title: string;
  children?: ReactNode;
}

export default function CompletionCard({ icon, title, children }: CompletionCardProps) {
  return (
    <div className="card fade-in">
      <div className="complete-card">
        <div className="complete-icon">{icon}</div>
        <div className="complete-title">{title}</div>
        {children}
      </div>
    </div>
  )
}
