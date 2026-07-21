import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { AiInsightsResponse } from '@/types'

export function useAiInsights() {
  const { session, isLoading, isSuperAdmin, selectedEstablishmentId, profile } = useAuth()
  const establishmentId = isSuperAdmin ? selectedEstablishmentId : profile?.establishmentId ?? null
  const canLoadInsights = !isLoading && !!session?.access_token && (isSuperAdmin || !!establishmentId)

  return useQuery({
    queryKey: ['ai-insights', session?.user.id ?? 'anon', establishmentId ?? 'all'],
    staleTime: 5 * 60 * 1000,
    enabled: canLoadInsights,
    queryFn: async () => {
      const { data: authData } = await supabase.auth.getSession()
      const accessToken = authData.session?.access_token

      if (!accessToken) {
        throw new Error('Sessão expirada. Entre novamente para atualizar a Sophia.')
      }

      const { data, error } = await supabase.functions.invoke('ai-insights', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          establishment_id: establishmentId,
        },
      })

      if (error) throw new Error('Erro ao gerar insights da Sophia')
      return data as AiInsightsResponse
    },
  })
}
