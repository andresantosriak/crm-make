import { useState, useCallback, type FormEvent } from 'react'
import { Plus, Shield, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUsers, useCreateUser, useUpdateUserRole } from '@/hooks/useUsers'
import { ClientAvatar } from '@/components/client/ClientAvatar'

export default function UsersPage() {
  const { user } = useAuth()
  const { data: users, isPending } = useUsers()
  const createUser = useCreateUser()
  const updateRole = useUpdateUserRole()

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'employee'>('employee')

  const passwordTooShort = newPassword.length > 0 && newPassword.length < 8

  const handleCreateUser = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim() || newPassword.length < 8) return

    await createUser.mutateAsync({
      email: newEmail.trim(),
      full_name: newName.trim(),
      role: newRole,
      password: newPassword,
    })

    setNewName('')
    setNewEmail('')
    setNewPassword('')
    setNewRole('employee')
    setShowForm(false)
  }, [newName, newEmail, newPassword, newRole, createUser])

  const handleToggleRole = useCallback((userId: string, currentRole: string) => {
    if (userId === user?.id) return
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
              Admin
            </button>
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
                  {u.role === 'admin' ? 'Administrador' : 'Funcionário'}
                </p>
              </div>
              {!isSelf && (
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
