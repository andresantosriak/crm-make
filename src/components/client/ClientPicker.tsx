import { useState, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'
import { useClients, useCreateClient } from '@/hooks/useClients'
import { useCart } from '@/hooks/useCart'
import { ClientAvatar } from '@/components/client/ClientAvatar'
import type { Client } from '@/types'

interface ClientPickerProps {
  open: boolean
  onClose: () => void
}

export function ClientPicker({ open, onClose }: ClientPickerProps) {
  const { data: clients = [] } = useClients()
  const createClient = useCreateClient()
  const { setClient } = useCart()
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  )

  const handlePick = useCallback(
    (client: Client) => {
      setClient(client)
      onClose()
    },
    [setClient, onClose],
  )

  const handleSaveNew = useCallback(() => {
    const name = newName.trim()
    if (!name) return
    createClient.mutate(
      { name, phone: newPhone.trim() || null },
      {
        onSuccess: (data) => {
          const created: Client = {
            id: data.id,
            name: data.name,
            phone: data.phone ?? null,
            birthday: data.birthday ?? null,
            active: true,
            createdBy: data.created_by ?? null,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            totalSpent: 0,
            lastPurchase: null,
          }
          setClient(created)
          setNewName('')
          setNewPhone('')
          setShowForm(false)
          onClose()
        },
      },
    )
  }, [newName, newPhone, createClient, setClient, onClose])

  if (!open) return null

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[55]"
        style={{
          background: 'rgba(8,6,4,.6)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
      />
      <div
        className="fixed left-0 right-0 bottom-0 z-[56] flex flex-col animate-fadeup"
        style={{
          maxHeight: '78%',
          background: '#1c1710',
          border: '1px solid rgba(233,220,198,.10)',
          borderRadius: '26px 26px 0 0',
          padding: '18px 20px 26px',
        }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-sm" style={{ background: 'rgba(233,220,198,.18)' }} />

        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="font-display text-[22px] font-medium text-text-primary">Cliente</h2>
          <button onClick={onClose} className="border-none bg-transparent text-[14px] text-text-secondary cursor-pointer">
            Fechar
          </button>
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="mb-3.5 flex w-full items-center gap-2.5 rounded-[13px] border px-[13px] py-[13px] text-[14px] font-medium text-gold-light cursor-pointer"
          style={{ background: 'rgba(200,162,76,.12)', borderColor: 'rgba(200,162,76,.3)' }}
        >
          <Plus size={18} strokeWidth={1.9} />
          Cadastrar novo cliente
        </button>

        {showForm && (
          <div
            className="mb-3.5 flex flex-col gap-2.5 rounded-card bg-card p-3.5"
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
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              inputMode="tel"
              placeholder="Telefone (WhatsApp)"
              className="rounded-[10px] bg-app-bg px-3.5 py-3 text-[14px] text-text-primary outline-none"
              style={{ border: '1px solid rgba(233,220,198,.10)' }}
            />
            <button
              onClick={handleSaveNew}
              disabled={createClient.isPending}
              className="rounded-tile border-none px-3 py-[13px] text-[14px] font-semibold cursor-pointer disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #d6b25c, #b78d3d)',
                color: '#1a1408',
              }}
            >
              {createClient.isPending ? 'Salvando...' : 'Salvar e selecionar'}
            </button>
          </div>
        )}

        <div className="relative mb-3">
          <Search size={16} strokeWidth={1.8} className="absolute left-[13px] top-[13px] text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full rounded-tile bg-card py-3 pr-3.5 pl-[38px] text-[14px] text-text-primary outline-none"
            style={{ border: '1px solid rgba(233,220,198,.10)' }}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((client) => (
            <button
              key={client.id}
              onClick={() => handlePick(client)}
              className="flex w-full items-center gap-3 border-none bg-transparent px-0.5 py-[11px] text-left cursor-pointer"
              style={{ borderBottom: '1px solid rgba(233,220,198,.06)' }}
            >
              <ClientAvatar name={client.name} size="sm" />
              <div className="flex-1">
                <p className="text-[15px] text-text-primary">{client.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
