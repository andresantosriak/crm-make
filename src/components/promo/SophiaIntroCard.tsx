export function SophiaIntroCard() {
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
        A Sophia montou <b className="font-semibold text-gold">3 promoções</b> pra você com base no
        seu estoque e histórico de vendas.
      </p>
    </div>
  )
}
