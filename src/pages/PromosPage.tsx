import { useNavigate } from 'react-router-dom'
import { BackButton } from '@/components/shared/BackButton'
import { SophiaIntroCard } from '@/components/promo/SophiaIntroCard'
import { AiInsightCard } from '@/components/ai/AiInsightCard'
import { useAiInsights } from '@/hooks/useAiInsights'

export default function PromosPage() {
  const navigate = useNavigate()
  const { data, isPending, isError, refetch, isFetching } = useAiInsights()

  return (
    <div className="px-5 pt-1.5 animate-fadeup">
      <div className="flex items-center gap-3 py-2 pb-4">
        <BackButton onClick={() => navigate('/')} />
        <h1 className="font-display text-[28px] font-medium text-text-primary">Promoções</h1>
      </div>

      <SophiaIntroCard count={data?.insights.length} source={data?.source} />

      <div className="mt-3.5 flex flex-col gap-3">
        {isPending ? (
          <div
            className="rounded-[16px] bg-card p-4"
            style={{ border: '1px solid rgba(200,162,76,.18)' }}
          >
            <p className="text-[14px] text-text-secondary">Sophia está montando recomendações...</p>
          </div>
        ) : isError ? (
          <div
            className="rounded-[16px] bg-card p-4"
            style={{ border: '1px solid rgba(208,124,103,.22)' }}
          >
            <p className="text-[14px] leading-[1.5] text-text-primary">
              Não foi possível gerar as recomendações agora.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 rounded-[10px] border-none px-3.5 py-[9px] text-[13px] font-medium text-gold-light cursor-pointer"
              style={{ background: 'rgba(200,162,76,.14)' }}
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          data?.insights.map((insight) => (
            <AiInsightCard key={insight.id} insight={insight} />
          ))
        )}
      </div>

      {data && (
        <>
          <div className="mt-6 mb-3 flex items-center justify-between">
            <h2 className="font-display text-[22px] font-medium text-text-primary">Automações possíveis</h2>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-[12px] font-medium text-gold-light disabled:opacity-50"
            >
              {isFetching ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>

          <div className="flex flex-col gap-2.5 pb-3">
            {data.automationIdeas.map((idea) => (
              <div
                key={`${idea.area}-${idea.trigger}`}
                className="rounded-card bg-card p-3.5"
                style={{ border: '1px solid rgba(233,220,198,.08)' }}
              >
                <p className="text-[13px] font-semibold text-gold-light">{idea.area}</p>
                <p className="mt-1 text-[13px] leading-[1.45] text-text-primary">{idea.action}</p>
                <p className="mt-1.5 text-[12px] text-text-secondary">
                  <span className="text-text-muted">Gatilho:</span> {idea.trigger}
                </p>
                <p className="mt-1 text-[12px] text-success">{idea.value}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
