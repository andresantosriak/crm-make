import { useNavigate } from 'react-router-dom'

export function SophiaSuggestions() {
  const navigate = useNavigate()

  return (
    <>
      <div className="mt-6 mb-3 flex items-center gap-2">
        <span
          className="h-[7px] w-[7px] rounded-full bg-gold animate-glow"
        />
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

      <div
        className="rounded-[16px] bg-card p-4"
        style={{ border: '1px solid rgba(200,162,76,.18)' }}
      >
        <p className="text-[14px] leading-[1.5] text-text-primary">
          A <b className="font-semibold text-gold">Paleta Nude Sunset</b> está parada há 21 dias.
          Que tal um combo pra girar o estoque?
        </p>
        <button
          onClick={() => navigate('/promos')}
          className="mt-3 rounded-[10px] border-none px-3.5 py-[9px] text-[13px] font-medium text-gold-light cursor-pointer"
          style={{ background: 'rgba(200,162,76,.14)' }}
        >
          Criar combo →
        </button>
      </div>

      <div
        className="mt-2.5 rounded-[16px] bg-card p-4"
        style={{ border: '1px solid rgba(233,220,198,.08)' }}
      >
        <p className="text-[14px] leading-[1.5] text-text-primary">
          <b className="font-semibold text-gold">Mariana</b> faz aniversário em 3 dias. Um cupom de
          20% costuma trazer ela de volta.
        </p>
        <button
          onClick={() => navigate('/clientes')}
          className="mt-3 rounded-[10px] border-none px-3.5 py-[9px] text-[13px] font-medium text-gold-light cursor-pointer"
          style={{ background: 'rgba(200,162,76,.14)' }}
        >
          Enviar cupom →
        </button>
      </div>
    </>
  )
}
