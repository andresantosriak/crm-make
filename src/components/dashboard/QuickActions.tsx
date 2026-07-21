import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Plus, Pen, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ActionItem {
  icon: LucideIcon
  title: string
  subtitle: string
  path: string
}

const actions: ActionItem[] = [
  { icon: ShoppingBag, title: 'Nova venda', subtitle: 'Registrar pedido', path: '/vendas' },
  { icon: Plus, title: 'Novo produto', subtitle: 'Custo e margem', path: '/produto' },
  { icon: Pen, title: 'Promoções', subtitle: 'Sugeridas pela IA', path: '/promos' },
  { icon: Users, title: 'Clientes', subtitle: 'Fidelizar', path: '/clientes' },
]

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="mt-3 grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="text-left rounded-[16px] bg-card p-4 cursor-pointer"
            style={{ border: '1px solid rgba(233,220,198,.08)' }}
          >
            <div
              className="mb-2.5 flex h-[38px] w-[38px] items-center justify-center rounded-tile"
              style={{ background: 'rgba(200,162,76,.14)' }}
            >
              <Icon size={19} strokeWidth={1.7} className="text-gold" />
            </div>
            <p className="text-[14px] font-medium text-text-primary">{action.title}</p>
            <p className="text-[12px] text-text-secondary">{action.subtitle}</p>
          </button>
        )
      })}
    </div>
  )
}
