import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { toStoreSettings } from '@/lib/mappers'

export function useStoreSettings() {
  return useQuery({
    queryKey: ['store_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single()

      if (error) throw error
      return toStoreSettings(data as Record<string, unknown>)
    },
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Partial<{
      default_markup: number
      low_stock_threshold: number
      vip_threshold: number
      birthday_alert_days: number
      toggle_promos: boolean
      toggle_estoque: boolean
      toggle_aniversario: boolean
      toggle_resumo: boolean
    }>) => {
      const { error } = await supabase
        .from('store_settings')
        .update(updates)
        .eq('id', 1)

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
