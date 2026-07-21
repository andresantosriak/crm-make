import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ProfileCard } from '@/components/settings/ProfileCard'
import { ToggleGroup } from '@/components/settings/ToggleGroup'
import { MarkupControl } from '@/components/settings/MarkupControl'
import { ShopInfo } from '@/components/settings/ShopInfo'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { signOut, isAdmin } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="px-5 pt-1.5 animate-fadeup">
      <h1 className="py-2 pb-4 font-display text-[28px] font-medium text-text-primary">
        Configurações
      </h1>

      <ProfileCard />

      <div className="mt-[22px]">
        <SectionLabel>Notificações</SectionLabel>
        <ToggleGroup />
      </div>

      {isAdmin && (
        <div className="mt-[22px]">
          <SectionLabel>Precificação</SectionLabel>
          <MarkupControl />
        </div>
      )}

      {isAdmin && (
        <>
          <div className="mt-[22px]">
            <SectionLabel>Equipe</SectionLabel>
            <button
              onClick={() => navigate('/usuarios')}
              className="w-full rounded-card bg-card px-4 py-[15px] text-left text-[14px] font-medium text-text-primary cursor-pointer"
              style={{ border: '1px solid rgba(233,220,198,.08)' }}
            >
              Gerenciar usuários →
            </button>
          </div>

          <div className="mt-[22px]">
            <SectionLabel>Loja</SectionLabel>
            <ShopInfo />
          </div>
        </>
      )}

      <button
        onClick={handleLogout}
        className="mt-[22px] w-full rounded-card border bg-transparent px-4 py-[15px] text-[14px] font-medium text-danger cursor-pointer"
        style={{ borderColor: 'rgba(208,124,103,.3)' }}
      >
        Sair da conta
      </button>
    </div>
  )
}
