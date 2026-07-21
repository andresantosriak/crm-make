interface SophiaIntroCardProps {
  count?: number
  source?: string
}

export function SophiaIntroCard({ count = 0, source = 'rules' }: SophiaIntroCardProps) {
  return (
    <div
      className="flex items-start gap-3 rounded-card-lg p-[18px]"
      style={{
        background: 'linear-gradient(150deg, #2a2116, #201a12)',
        border: '1px solid rgba(200,162,76,.2)',
      }}
    >
      <span className="mt-[5px] h-[9px] w-[9px] shrink-0 rounded-full bg-gold animate-glow" />
      <p className="text-[15px] leading-[1.5] text-text-primary">
        A Sophia analisou estoque, vendas e clientes e montou{' '}
        <b className="font-semibold text-gold">{count || 'novos'} direcionamentos</b> pra você.
        {source === 'openai' ? ' A leitura está usando OpenAI.' : ' Configure a OpenAI para enriquecer ainda mais.'}
      </p>
    </div>
  )
}
