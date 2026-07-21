export function ShopInfo() {
  return (
    <div
      className="overflow-hidden rounded-[16px] bg-card"
      style={{ border: '1px solid rgba(233,220,198,.08)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-[15px]"
        style={{ borderBottom: '1px solid rgba(233,220,198,.06)' }}
      >
        <span className="text-[14px] text-text-primary">Formas de pagamento</span>
        <span className="text-[13px] text-text-secondary">Pix, Cartão →</span>
      </div>
      <div
        className="flex items-center justify-between px-4 py-[15px]"
        style={{ borderBottom: '1px solid rgba(233,220,198,.06)' }}
      >
        <span className="text-[14px] text-text-primary">Categorias de produto</span>
        <span className="text-[13px] text-text-secondary">4 →</span>
      </div>
      <div className="flex items-center justify-between px-4 py-[15px]">
        <span className="text-[14px] text-text-primary">Backup de dados</span>
        <span className="text-[13px] text-success">Sincronizado</span>
      </div>
    </div>
  )
}
