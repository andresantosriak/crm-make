import { useLocation, useNavigate } from 'react-router-dom'
import { Home, ShoppingBag, Package, Users, Settings } from 'lucide-react'

const tabs = [
  { key: 'home', label: 'Início', icon: Home, path: '/', match: ['/'] },
  { key: 'vendas', label: 'Vendas', icon: ShoppingBag, path: '/vendas', match: ['/vendas', '/historico'] },
  { key: 'estoque', label: 'Estoque', icon: Package, path: '/estoque', match: ['/estoque', '/produto'] },
  { key: 'clientes', label: 'Clientes', icon: Users, path: '/clientes', match: ['/clientes'] },
  { key: 'config', label: 'Ajustes', icon: Settings, path: '/config', match: ['/config'] },
] as const

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const activeTab = tabs.find((t) =>
    (t.match as readonly string[]).includes(location.pathname),
  )?.key ?? ''

  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-35 flex items-center px-3 pb-2.5"
      style={{
        height: 74,
        background: 'rgba(18,14,10,.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(233,220,198,.08)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab
        const Icon = tab.icon
        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            className="flex flex-1 flex-col items-center gap-1 border-none bg-transparent cursor-pointer"
            style={{ color: isActive ? '#C8A24C' : '#7c7264' }}
          >
            <Icon size={22} strokeWidth={1.7} />
            <span className="text-[10px] tracking-[.3px]">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
