import { RefreshCw } from 'lucide-react'
import { AiInsightCard } from '@/components/ai/AiInsightCard'
import { useAiInsights } from '@/hooks/useAiInsights'

export function SophiaSuggestions() {
  const { data, isPending, isError, refetch, isFetching } = useAiInsights()
  const insights = data?.insights.slice(0, 2) ?? []

  return (
    <>
      <div className="mt-6 mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-[7px] w-[7px] rounded-full bg-gold animate-glow" />
          <h2 className="font-display text-[20px] font-medium text-text-primary">
            Sophia sugere
          </h2>
          <span
            className="rounded-chip px-2 py-0.5 text-[10px] tracking-[1px] text-text-secondary"
            style={{ border: '1px solid rgba(233,220,198,.14)' }}
          >
            IA
          </span>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gold disabled:opacity-50"
          style={{ background: 'rgba(200,162,76,.12)' }}
          aria-label="Atualizar insights da Sophia"
        >
          <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {isPending ? (
        <div
          className="rounded-[16px] bg-card p-4"
          style={{ border: '1px solid rgba(200,162,76,.18)' }}
        >
          <p className="text-[14px] leading-[1.5] text-text-secondary">
            Sophia está lendo estoque, vendas e clientes...
          </p>
        </div>
      ) : isError ? (
        <div
          className="rounded-[16px] bg-card p-4"
          style={{ border: '1px solid rgba(208,124,103,.22)' }}
        >
          <p className="text-[14px] leading-[1.5] text-text-primary">
            Não consegui gerar os insights agora. Tente atualizar em alguns instantes.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {insights.map((insight) => (
            <AiInsightCard key={insight.id} insight={insight} compact />
          ))}
        </div>
      )}

      {data && (
        <p className="mt-2 text-[11px] text-text-muted">
          {data.source === 'openai' ? `Modelo ${data.model}` : 'Modo local até configurar OpenAI'} · {data.metrics.products} produtos analisados
        </p>
      )}
    </>
  )
}
