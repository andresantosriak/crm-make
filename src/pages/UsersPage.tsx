import { useState, useCallback, useEffect, useMemo, type FormEvent } from 'react'
import { Building2, Plus, Shield, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUsers, useCreateUser, useUpdateUserRole } from '@/hooks/useUsers'
import { useCreateEstablishment, useEstablishments } from '@/hooks/useEstablishments'
import { ClientAvatar } from '@/components/client/ClientAvatar'

export default function UsersPage() {
  const { user, isSuperAdmin, selectedEstablishmentId } = useAuth()
  const { data: users, isPending } = useUsers()
  const { data: establishments = [] } = useEstablishments()
  const createUser = useCreateUser()
  const updateRole = useUpdateUserRole()
  const createEstablishment = useCreateEstablishment()

  const [showForm, setShowForm] = useState(false)
  const [showEstablishmentForm, setShowEstablishmentForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'employee'>('employee')
  const [newEstablishmentId, setNewEstablishmentId] = useState(selectedEstablishmentId ?? '')
  const [newEstablishmentName, setNewEstablishmentName] = useState('')

  const passwordTooShort = newPassword.length > 0 && newPassword.length < 8
  const establishmentById = useMemo(
    () => new Map(establishments.map((establishment) => [establishment.id, establishment.name])),
    [establishments],
  )

  useEffect(() => {
    if (selectedEstablishmentId) {
      setNewEstablishmentId(selectedEstablishmentId)
    }
  }, [selectedEstablishmentId])

  const handleCreateUser = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim() || newPassword.length < 8) return
    if (isSuperAdmin && !newEstablishmentId) return

    await createUser.mutateAsync({
      email: newEmail.trim(),
      full_name: newName.trim(),
      role: newRole,
      password: newPassword,
      establishment_id: isSuperAdmin ? newEstablishmentId : undefined,
    })

    setNewName('')
    setNewEmail('')
    setNewPassword('')
    setNewRole('employee')
    setShowForm(false)
  }, [newName, newEmail, newPassword, newRole, newEstablishmentId, isSuperAdmin, createUser])

  const handleCreateEstablishment = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!newEstablishmentName.trim()) return

    await createEstablishment.mutateAsync({ name: newEstablishmentName.trim() })
    setNewEstablishmentName('')
    setShowEstablishmentForm(false)
  }, [newEstablishmentName, createEstablishment])

  const handleToggleRole = useCallback((userId: string, currentRole: string) => {
    if (userId === user?.id) return
    if (currentRole === 'super_admin') return
    const nextRole = currentRole === 'admin' ? 'employee' : 'admin'
    updateRole.mutate({ userId, role: nextRole as 'admin' | 'employee' })
  }, [user, updateRole])

  return (
    <div className="px-5 pt-1.5 animate-fadeup">
      <div className="flex items-center justify-between py-2 pb-3.5">
        <div>
          <h1 className="font-display text-[28px] font-medium text-text-primary">Equipe</h1>
          <p className="text-[13px] text-text-secondary">
            {users?.length ?? 0} {(users?.length ?? 0) === 1 ? 'membro' : 'membros'}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex h-[44px] items-center gap-2 rounded-[13px] border-none px-[16px] text-[14px] font-semibold cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #d6b25c, #b78d3d)',
            color: '#1a1408',
          }}
        >
          <Plus size={18} strokeWidth={2} />
          Convidar
        </button>
      </div>

      {isSuperAdmin && (
        <div className="mb-4 rounded-card bg-card p-3.5" style={{ border: '1px solid rgba(233,220,198,.08)' }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-text-primary">Estabelecimentos</p>
              <p className="mt-0.5 text-[12px] text-text-secondary">
                {establishments.length} {establishments.length === 1 ? 'unidade ativa' : 'unidades ativas'}
              </p>
            </div>
            <button
              onClick={() => setShowEstablishmentForm((v) => !v)}
              className="flex items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[12px] font-medium text-gold cursor-pointer"
              style={{ borderColor: 'rgba(200,162,76,.3)', background: 'rgba(200,162,76,.10)' }}
            >
              <Building2 size={14} />
              Nova unidade
            </button>
          </div>

          {showEstablishmentForm && (
            <form onSubmit={handleCreateEstablishment} className="mt-3 flex gap-2">
              <input
                value={newEstablishmentName}
                onChange={(e) => setNewEstablishmentName(e.target.value)}
                placeholder="Nome do estabelecimento"
                className="min-w-0 flex-1 rounded-[10px] bg-app-bg px-3.5 py-3 text-[14px] text-text-primary outline-none"
                style={{ border: '1px solid rgba(233,220,198,.10)' }}
              />
              <button
                disabled={createEstablishment.isPending}
                className="rounded-[10px] border-none px-3.5 text-[13px] font-semibold disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #d6b25c, #b78d3d)', color: '#1a1408' }}
              >
                Criar
              </button>
            </form>
          )}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreateUser}
          className="mb-4 flex flex-col gap-2.5 rounded-card bg-card p-3.5"
          style={{ border: '1px solid rgba(233,220,198,.10)' }}
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome completo"
            className="rounded-[10px] bg-app-bg px-3.5 py-3 text-[14px] text-text-primary outline-none"
            style={{ border: '1px solid rgba(233,220,198,.10)' }}
          />
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            type="email"
            placeholder="E-mail"
            className="rounded-[10px] bg-app-bg px-3.5 py-3 text-[14px] text-text-primary outline-none"
            style={{ border: '1px solid rgba(233,220,198,.10)' }}
          />
          <div>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              placeholder="Senha inicial (mín. 8 caracteres)"
              className="w-full rounded-[10px] bg-app-bg px-3.5 py-3 text-[14px] text-text-primary outline-none"
              style={{ border: `1px solid ${passwordTooShort ? 'rgba(208,124,103,.5)' : 'rgba(233,220,198,.10)'}` }}
            />
            {passwordTooShort && (
              <p className="mt-1 text-[12px] text-danger">Mínimo 8 caracteres</p>
            )}
          </div>
          {isSuperAdmin && (
            <select
              value={newEstablishmentId}
              onChange={(e) => setNewEstablishmentId(e.target.value)}
              className="rounded-[10px] bg-app-bg px-3.5 py-3 text-[14px] text-text-primary outline-none"
              style={{ border: `1px solid ${!newEstablishmentId ? 'rgba(208,124,103,.45)' : 'rgba(233,220,198,.10)'}` }}
            >
              <option value="">Selecione o estabelecimento</option>
              {establishments.map((establishment) => (
                <option key={establishment.id} value={establishment.id}>
                  {establishment.name}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNewRole('employee')}
              className="flex-1 rounded-[10px] border px-3 py-2.5 text-[13px] font-medium cursor-pointer"
              style={{
                background: newRole === 'employee' ? 'rgba(200,162,76,.16)' : 'transparent',
                borderColor: newRole === 'employee' ? 'rgba(200,162,76,.4)' : 'rgba(233,220,198,.10)',
                color: newRole === 'employee' ? '#d9b869' : '#A79B88',
              }}
            >
              Funcionário
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setNewRole('admin')}
                className="flex-1 rounded-[10px] border px-3 py-2.5 text-[13px] font-medium cursor-pointer"
                style={{
                  background: newRole === 'admin' ? 'rgba(200,162,76,.16)' : 'transparent',
                  borderColor: newRole === 'admin' ? 'rgba(200,162,76,.4)' : 'rgba(233,220,198,.10)',
                  color: newRole === 'admin' ? '#d9b869' : '#A79B88',
                }}
              >
                Admin local
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={createUser.isPending}
            className="rounded-tile border-none px-3 py-[13px] text-[14px] font-semibold cursor-pointer disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #d6b25c, #b78d3d)',
              color: '#1a1408',
            }}
          >
            {createUser.isPending ? 'Criando...' : 'Criar e convidar'}
          </button>
        </form>
      )}

      {isPending ? (
        <div className="flex justify-center py-10">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'rgba(200,162,76,.3)', borderTopColor: 'transparent' }}
          />
        </div>
      ) : (
        users?.map((u) => {
          const isSelf = u.id === user?.id
          return (
            <div
              key={u.id}
              className="mb-[9px] flex items-center gap-3 rounded-card bg-card p-[13px]"
              style={{ border: '1px solid rgba(233,220,198,.08)' }}
            >
              <ClientAvatar name={u.fullName || 'U'} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-text-primary">
                  {u.fullName || 'Sem nome'}{isSelf ? ' (você)' : ''}
                </p>
                <p className="text-[12px] text-text-secondary">
                  {u.role === 'super_admin'
                    ? 'Admin geral'
                    : u.role === 'admin'
                      ? 'Admin local'
                      : 'Funcionário'}
                  {isSuperAdmin && u.establishmentId ? ` · ${establishmentById.get(u.establishmentId) ?? 'Unidade'}` : ''}
                </p>
              </div>
              {!isSelf && u.role !== 'super_admin' && isSuperAdmin && (
                <button
                  onClick={() => handleToggleRole(u.id, u.role)}
                  disabled={updateRole.isPending}
                  className="flex items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[12px] cursor-pointer disabled:opacity-50"
                  style={{
                    background: u.role === 'admin' ? 'rgba(200,162,76,.12)' : 'transparent',
                    borderColor: u.role === 'admin' ? 'rgba(200,162,76,.3)' : 'rgba(233,220,198,.12)',
                    color: u.role === 'admin' ? '#d9b869' : '#A79B88',
                  }}
                  title={u.role === 'admin' ? 'Rebaixar para funcionário' : 'Promover para admin'}
                >
                  {u.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                  {u.role === 'admin' ? 'Admin' : 'Func.'}
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
