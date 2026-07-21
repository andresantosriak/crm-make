import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { AiInsightsResponse } from '@/types'

export function useAiInsights() {
  const { isSuperAdmin, selectedEstablishmentId, profile } = useAuth()
  const establishmentId = isSuperAdmin ? selectedEstablishmentId : profile?.establishmentId ?? null

  return useQuery({
    queryKey: ['ai-insights', establishmentId ?? 'all'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          establishment_id: establishmentId,
        },
      })

      if (error) throw new Error('Erro ao gerar insights da Sophia')
      return data as AiInsightsResponse
    },
  })
}
