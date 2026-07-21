import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import type { Client } from '@/types'

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data: clientRows, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('active', true)
        .order('name')

      if (clientsError) throw clientsError

      const { data: salesRows, error: salesError } = await supabase
        .from('sales')
        .select('client_id, total, created_at')
        .is('refunded_at', null)

      if (salesError) throw salesError

      const spentMap = new Map<string, { total: number; last: string | null }>()
      for (const s of salesRows ?? []) {
        if (!s.client_id) continue
        const entry = spentMap.get(s.client_id) ?? { total: 0, last: null }
        entry.total += Number(s.total)
        if (!entry.last || s.created_at > entry.last) entry.last = s.created_at
        spentMap.set(s.client_id, entry)
      }

      return (clientRows ?? []).map((row): Client => ({
        id: row.id,
        name: row.name,
        phone: row.phone ?? null,
        birthday: row.birthday ?? null,
        active: row.active,
        createdBy: row.created_by ?? null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        totalSpent: spentMap.get(row.id)?.total ?? 0,
        lastPurchase: spentMap.get(row.id)?.last ?? null,
      }))
    },
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { name: string; phone?: string | null; birthday?: string | null }) => {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: input.name,
          phone: input.phone ?? null,
          birthday: input.birthday ?? null,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente cadastrado com sucesso')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar cliente')
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; phone?: string | null; birthday?: string | null }) => {
      const { error } = await supabase
        .from('clients')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente atualizado')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar cliente')
    },
  })
}

export function useSoftDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase.rpc('soft_delete_client', {
        p_client_id: clientId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente removido')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover cliente')
    },
  })
}
