import { useNavigate } from 'react-router-dom'
import { Lightbulb, Megaphone, Sparkles } from 'lucide-react'
import type { AiInsight } from '@/types'

interface AiInsightCardProps {
  insight: AiInsight
  compact?: boolean
}

const priorityColor: Record<string, string> = {
  alta: '#D07C67',
  media: '#C8A24C',
  baixa: '#8FA98A',
}

export function AiInsightCard({ insight, compact = false }: AiInsightCardProps) {
  const navigate = useNavigate()
  const color = priorityColor[insight.priority] ?? '#C8A24C'

  return (
    <div
      className="rounded-[16px] bg-card p-4"
      style={{ border: `1px solid ${insight.priority === 'alta' ? 'rgba(208,124,103,.22)' : 'rgba(200,162,76,.18)'}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <Sparkles size={14} className="text-gold" />
            <span className="text-[10px] font-medium uppercase tracking-[1px]" style={{ color }}>
              {insight.priority}
            </span>
          </div>
          <h3 className="text-[16px] font-medium leading-[1.25] text-text-primary">{insight.title}</h3>
        </div>
        <span
          className="shrink-0 rounded-chip px-2 py-1 text-[10px] uppercase tracking-[.7px]"
          style={{ background: 'rgba(200,162,76,.14)', color: '#d9b869' }}
        >
          {Math.round(insight.confidence * 100)}%
        </span>
      </div>

      <p className="mt-2 text-[14px] leading-[1.5] text-text-primary">{insight.summary}</p>
      {!compact && (
        <p className="mt-2 text-[12px] leading-[1.45] text-text-secondary">{insight.rationale}</p>
      )}

      {!compact && insight.marketingAngles.length > 0 && (
        <div className="mt-3 rounded-[12px] bg-app-bg p-3" style={{ border: '1px solid rgba(233,220,198,.08)' }}>
          <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-gold-light">
            <Megaphone size={14} />
            Ângulos de marketing
          </div>
          <div className="flex flex-wrap gap-1.5">
            {insight.marketingAngles.map((angle) => (
              <span
                key={angle}
                className="rounded-chip px-2 py-1 text-[11px] text-text-secondary"
                style={{ border: '1px solid rgba(233,220,198,.10)' }}
              >
                {angle}
              </span>
            ))}
          </div>
        </div>
      )}

      {!compact && insight.postIdeas.length > 0 && (
        <div className="mt-3">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-gold-light">
            <Lightbulb size={14} />
            Ideias de postagem
          </div>
          <ul className="space-y-1.5">
            {insight.postIdeas.slice(0, 3).map((idea) => (
              <li key={idea} className="text-[12px] leading-[1.45] text-text-secondary">
                {idea}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => navigate(insight.actionRoute || '/promos')}
        className="mt-3 rounded-[10px] border-none px-3.5 py-[9px] text-[13px] font-medium text-gold-light cursor-pointer"
        style={{ background: 'rgba(200,162,76,.14)' }}
      >
        {insight.actionLabel || 'Ver direção'} →
      </button>
    </div>
  )
}
