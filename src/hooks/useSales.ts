import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import type { Json } from '@/integrations/supabase/types'
import { toSale } from '@/lib/mappers'
import { useAuth } from '@/hooks/useAuth'

export function useSales() {
  const { isSuperAdmin, selectedEstablishmentId, profile } = useAuth()
  const establishmentId = isSuperAdmin ? selectedEstablishmentId : profile?.establishmentId ?? null

  return useQuery({
    queryKey: ['sales', establishmentId ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select('*')
        .is('refunded_at', null)

      if (establishmentId) {
        query = query.eq('establishment_id', establishmentId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return (data as Record<string, unknown>[]).map(toSale)
    },
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  const { isSuperAdmin, selectedEstablishmentId, profile } = useAuth()
  const establishmentId = isSuperAdmin ? selectedEstablishmentId : profile?.establishmentId ?? null

  return useMutation({
    mutationFn: async (input: {
      p_client_id: string | null
      p_payment_method: string
      p_items: Array<{
        product_id: string
        quantity: number
        unit_price: number
        original_unit_price?: number
        discount_amount?: number
        combo_group_id?: string | null
        combo_name?: string | null
        combo_discount_type?: string | null
        combo_discount_value?: number | null
      }>
    }) => {
      if (!establishmentId) {
        throw new Error('Selecione um estabelecimento antes de registrar venda')
      }

      const { data, error } = await supabase.rpc('create_sale', {
        p_client_id: input.p_client_id ?? undefined,
        p_establishment_id: establishmentId,
        p_payment_method: input.p_payment_method,
        p_items: input.p_items as unknown as Json,
      })

      if (error) throw error
      return data as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Venda registrada com sucesso')
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : 'Erro ao registrar venda'
      if (msg.includes('Estoque insuficiente')) {
        toast.error('Estoque insuficiente para um dos produtos')
      } else {
        toast.error(msg)
      }
    },
  })
}

export function useCancelSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (saleId: string) => {
      const { error } = await supabase.rpc('cancel_sale', {
        p_sale_id: saleId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Venda estornada')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao estornar venda')
    },
  })
}
