import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ProfileCard } from '@/components/settings/ProfileCard'
import { ToggleGroup } from '@/components/settings/ToggleGroup'
import { MarkupControl } from '@/components/settings/MarkupControl'
import { MonthlyGoalControl } from '@/components/settings/MonthlyGoalControl'
import { ShopInfo } from '@/components/settings/ShopInfo'

function SelectEstablishmentNotice() {
  return (
    <div
      className="rounded-[16px] bg-card p-4"
      style={{ border: '1px solid rgba(200,162,76,.18)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[12px]"
          style={{ background: 'rgba(200,162,76,.14)' }}
        >
          <Building2 size={18} strokeWidth={1.8} className="text-gold" />
        </div>
        <div>
          <p className="text-[14px] font-medium text-text-primary">Selecione uma unidade</p>
          <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
            Metas, precificação e notificações são configurações de cada estabelecimento.
            Use o seletor no topo da tela para escolher a unidade que deseja configurar.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { signOut, isAdmin, isSuperAdmin, selectedEstablishmentId } = useAuth()
  const canEditEstablishmentSettings = isAdmin && (!isSuperAdmin || !!selectedEstablishmentId)
  const needsEstablishmentSelection = isSuperAdmin && !selectedEstablishmentId

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
        {needsEstablishmentSelection && (
          <p className="mt-2 px-1 text-[12px] text-text-secondary">
            Selecione uma unidade para alterar estas preferências.
          </p>
        )}
      </div>

      {isAdmin && (
        <>
          <div className="mt-[22px]">
            <SectionLabel>Metas</SectionLabel>
            {canEditEstablishmentSettings ? <MonthlyGoalControl /> : <SelectEstablishmentNotice />}
          </div>

          {canEditEstablishmentSettings && (
            <div className="mt-[22px]">
              <SectionLabel>Precificação</SectionLabel>
              <MarkupControl />
            </div>
          )}
        </>
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
            {canEditEstablishmentSettings ? <ShopInfo /> : <SelectEstablishmentNotice />}
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
