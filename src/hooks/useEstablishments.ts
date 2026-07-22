import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { toEstablishment } from '@/lib/mappers'

interface UseEstablishmentsOptions {
  enabled?: boolean
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function useEstablishments(options: UseEstablishmentsOptions = {}) {
  const enabled = options.enabled ?? true

  return useQuery({
    queryKey: ['establishments'],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('establishments')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) throw error
      if (!Array.isArray(data)) {
        throw new Error('Resposta inválida ao carregar estabelecimentos')
      }
      return (data as Record<string, unknown>[]).map(toEstablishment)
    },
  })
}

export function useCreateEstablishment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { name: string; slug?: string }) => {
      const slug = input.slug?.trim() || slugify(input.name)
      const { data, error } = await supabase.rpc('create_establishment', {
        p_name: input.name.trim(),
        p_slug: slug,
      })

      if (error) throw error
      return data as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['establishments'] })
      queryClient.invalidateQueries({ queryKey: ['store_settings'] })
      toast.success('Estabelecimento criado')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar estabelecimento')
    },
  })
}
