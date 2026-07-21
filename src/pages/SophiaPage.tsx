import { useNavigate } from 'react-router-dom'
import { Bot, CalendarDays, MessageCircle, RefreshCw, Signal, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { BackButton } from '@/components/shared/BackButton'
import { AiInsightCard } from '@/components/ai/AiInsightCard'
import { useAiInsights } from '@/hooks/useAiInsights'
import type { AiInsightPriority, AiPerformanceSignal } from '@/types'

const priorityColor: Record<AiInsightPriority, string> = {
  alta: '#D07C67',
  media: '#C8A24C',
  baixa: '#8FA98A',
}

const signalColor: Record<AiPerformanceSignal['status'], string> = {
  bom: '#8FA98A',
  atenção: '#C8A24C',
  crítico: '#D07C67',
}

export default function SophiaPage() {
  const navigate = useNavigate()
  const { data, isPending, isError, refetch, isFetching } = useAiInsights()

  return (
    <div className="px-5 pt-1.5 animate-fadeup">
      <div className="flex items-center gap-3 py-2 pb-4">
        <BackButton onClick={() => navigate('/')} />
        <div className="min-w-0">
          <h1 className="font-display text-[28px] font-medium text-text-primary">Sophia IA</h1>
          <p className="text-[12px] text-text-secondary">Direção comercial ativa</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-gold disabled:opacity-50"
          style={{ background: 'rgba(200,162,76,.12)' }}
          aria-label="Atualizar Sophia"
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {isPending ? (
        <StateCard text="Sophia está cruzando estoque, vendas, clientes e marketing..." />
      ) : isError ? (
        <StateCard text="Não foi possível atualizar a Sophia agora." danger />
      ) : data ? (
        <>
          <section
            className="rounded-[18px] bg-card p-4"
            style={{ border: '1px solid rgba(200,162,76,.20)' }}
          >
            <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[1px] text-gold-light">
              <Bot size={15} />
              {data.source === 'openai' ? data.model : 'modo local'}
            </div>
            <p className="mt-2 text-[15px] leading-[1.5] text-text-primary">{data.summary}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Metric label="Produtos" value={data.metrics.products} />
              <Metric label="Clientes" value={data.metrics.clients} />
              <Metric label="Vendas 90d" value={data.metrics.sales90d} />
              <Metric label="Ticket" value={`R$ ${data.metrics.averageTicket90d.toFixed(0)}`} />
            </div>
          </section>

          <SectionTitle icon={Sparkles} title="Prioridades de ação" />
          <div className="flex flex-col gap-2.5">
            {data.actionPlan.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.actionRoute)}
                className="rounded-card bg-card p-3.5 text-left"
                style={{ border: '1px solid rgba(233,220,198,.08)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[.8px]" style={{ color: priorityColor[item.priority] }}>
                      {item.priority} · {item.area}
                    </p>
                    <h2 className="mt-1 text-[15px] font-medium leading-[1.3] text-text-primary">{item.title}</h2>
                  </div>
                  <span className="shrink-0 rounded-chip px-2 py-1 text-[10px] text-gold-light" style={{ background: 'rgba(200,162,76,.12)' }}>
                    {item.dueWindow}
                  </span>
                </div>
                <p className="mt-2 text-[12px] leading-[1.45] text-text-secondary">{item.why}</p>
                <p className="mt-2 text-[13px] leading-[1.45] text-text-primary">{item.nextStep}</p>
                <p className="mt-2 text-[11px] text-text-muted">Responsável: {item.suggestedOwner}</p>
              </button>
            ))}
          </div>

          <SectionTitle icon={Signal} title="Sinais de performance" />
          <div className="grid grid-cols-1 gap-2.5">
            {data.performanceSignals.map((signal) => (
              <div
                key={signal.id}
                className="rounded-card bg-card p-3.5"
                style={{ border: '1px solid rgba(233,220,198,.08)' }}
              >
                <p className="text-[11px] font-medium uppercase tracking-[.8px]" style={{ color: signalColor[signal.status] }}>
                  {signal.status}
                </p>
                <h2 className="mt-1 text-[15px] font-medium text-text-primary">{signal.metric}</h2>
                <p className="mt-1.5 text-[12px] leading-[1.45] text-text-secondary">{signal.summary}</p>
                <p className="mt-1.5 text-[12px] leading-[1.45] text-gold-light">{signal.recommendation}</p>
              </div>
            ))}
          </div>

          <SectionTitle icon={MessageCircle} title="Clientes para acionar" />
          <div className="flex flex-col gap-2.5">
            {data.customerActions.map((action) => (
              <div
                key={action.id}
                className="rounded-card bg-card p-3.5"
                style={{ border: '1px solid rgba(233,220,198,.08)' }}
              >
                <p className="text-[13px] font-semibold text-gold-light">{action.segment}</p>
                <p className="mt-1 text-[12px] text-text-secondary">{action.reason}</p>
                <p className="mt-2 text-[13px] leading-[1.45] text-text-primary">“{action.message}”</p>
                {action.clientNames.length > 0 && (
                  <p className="mt-2 text-[11px] text-text-muted">{action.clientNames.join(', ')}</p>
                )}
              </div>
            ))}
          </div>

          <SectionTitle icon={CalendarDays} title="Marketing e conteúdo" />
          <div className="flex flex-col gap-2.5">
            {data.contentIdeas.map((idea) => (
              <div
                key={idea.id}
                className="rounded-card bg-card p-3.5"
                style={{ border: '1px solid rgba(233,220,198,.08)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-gold-light">{idea.channel}</p>
                  <span className="rounded-chip px-2 py-1 text-[10px] text-text-secondary" style={{ border: '1px solid rgba(233,220,198,.10)' }}>
                    {idea.format}
                  </span>
                </div>
                <h2 className="mt-2 text-[15px] font-medium text-text-primary">{idea.theme}</h2>
                <p className="mt-1.5 text-[12px] leading-[1.45] text-text-secondary">{idea.hook}</p>
                <p className="mt-2 text-[13px] leading-[1.45] text-text-primary">{idea.caption}</p>
                <p className="mt-2 text-[12px] font-medium text-success">{idea.cta}</p>
              </div>
            ))}
          </div>

          <SectionTitle icon={Bot} title="Insights completos" />
          <div className="flex flex-col gap-3 pb-3">
            {data.insights.map((insight) => (
              <AiInsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

function StateCard({ text, danger = false }: { text: string; danger?: boolean }) {
  return (
    <div
      className="rounded-[16px] bg-card p-4"
      style={{ border: danger ? '1px solid rgba(208,124,103,.22)' : '1px solid rgba(200,162,76,.18)' }}
    >
      <p className="text-[14px] leading-[1.5] text-text-primary">{text}</p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[12px] bg-app-bg p-3" style={{ border: '1px solid rgba(233,220,198,.06)' }}>
      <p className="text-[11px] text-text-muted">{label}</p>
      <p className="mt-0.5 text-[18px] font-medium text-text-primary">{value}</p>
    </div>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="mt-6 mb-3 flex items-center gap-2">
      <Icon size={17} className="text-gold" />
      <h2 className="font-display text-[22px] font-medium text-text-primary">{title}</h2>
    </div>
  )
}
