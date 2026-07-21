import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { toStoreSettings } from '@/lib/mappers'
import { useAuth } from '@/hooks/useAuth'

export function useStoreSettings() {
  const { isSuperAdmin, selectedEstablishmentId, profile } = useAuth()
  const establishmentId = isSuperAdmin ? selectedEstablishmentId : profile?.establishmentId ?? null

  return useQuery({
    queryKey: ['store_settings', establishmentId],
    enabled: !!establishmentId,
    queryFn: async () => {
      if (!establishmentId) {
        throw new Error('Selecione um estabelecimento antes de carregar configurações')
      }

      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('establishment_id', establishmentId)
        .single()

      if (error) throw error
      return toStoreSettings(data as Record<string, unknown>)
    },
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  const { isSuperAdmin, selectedEstablishmentId, profile } = useAuth()
  const establishmentId = isSuperAdmin ? selectedEstablishmentId : profile?.establishmentId ?? null

  return useMutation({
    mutationFn: async (updates: Partial<{
      default_markup: number
      monthly_sales_goal: number
      low_stock_threshold: number
      vip_threshold: number
      birthday_alert_days: number
      toggle_promos: boolean
      toggle_estoque: boolean
      toggle_aniversario: boolean
      toggle_resumo: boolean
    }>) => {
      if (!establishmentId) {
        throw new Error('Selecione um estabelecimento antes de salvar configurações')
      }

      const { error } = await supabase
        .from('store_settings')
        .update(updates)
        .eq('establishment_id', establishmentId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store_settings'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar configurações')
    },
  })
}
