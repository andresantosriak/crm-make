import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import type { Product } from '@/types'
import { toProduct, toProductBrand } from '@/lib/mappers'
import { useAuth } from '@/hooks/useAuth'

function useCurrentEstablishmentId() {
  const { isSuperAdmin, selectedEstablishmentId, profile } = useAuth()
  return isSuperAdmin ? selectedEstablishmentId : profile?.establishmentId ?? null
}

export function useProducts() {
  const establishmentId = useCurrentEstablishmentId()

  return useQuery({
    queryKey: ['products', establishmentId ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('products_display')
        .select('*')
        .eq('active', true)

      if (establishmentId) {
        query = query.eq('establishment_id', establishmentId)
      }

      const { data, error } = await query.order('name')

      if (error) throw error
      return (data as Record<string, unknown>[]).map(toProduct)
    },
  })
}

export function useProductBrands() {
  const establishmentId = useCurrentEstablishmentId()

  return useQuery({
    queryKey: ['product-brands', establishmentId ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('product_brands')
        .select('*')
        .eq('active', true)

      if (establishmentId) {
        query = query.eq('establishment_id', establishmentId)
      }

      const { data, error } = await query.order('name')

      if (error) throw error
      return (data as Record<string, unknown>[]).map(toProductBrand)
    },
  })
}

export function useCreateProductBrand() {
  const queryClient = useQueryClient()
  const establishmentId = useCurrentEstablishmentId()

  return useMutation({
    mutationFn: async (input: { name: string }) => {
      if (!establishmentId) {
        throw new Error('Selecione um estabelecimento antes de cadastrar marca')
      }

      const { data, error } = await supabase
        .from('product_brands')
        .insert({
          name: input.name.trim(),
          establishment_id: establishmentId,
        })
        .select('*')
        .single()

      if (error) throw error
      return toProductBrand(data as Record<string, unknown>)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-brands'] })
      toast.success('Marca cadastrada')
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : 'Erro ao cadastrar marca'
      if (msg.includes('duplicate') || msg.includes('product_brands_establishment_name_uidx')) {
        toast.error('Essa marca já está cadastrada')
      } else {
        toast.error(msg)
      }
    },
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const establishmentId = useCurrentEstablishmentId()

  return useMutation({
    mutationFn: async (input: {
      brandId: string
      name: string
      category: 'Lábios' | 'Rosto' | 'Olhos'
      price: number
      cost: number
      stock: number
    }) => {
      if (!establishmentId) {
        throw new Error('Selecione um estabelecimento antes de cadastrar produto')
      }

      const { error } = await supabase
        .from('products')
        .insert({
          brand_id: input.brandId,
          name: input.name,
          category: input.category,
          price: input.price,
          cost: input.cost,
          stock: input.stock,
          establishment_id: establishmentId,
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto cadastrado com sucesso')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar produto')
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Product> & { id: string }) => {
      const updateData: {
        name?: string
        category?: string
        price?: number
        cost?: number
        stock?: number
        brand_id?: string
      } = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.brandId) updateData.brand_id = data.brandId
      if (data.category !== undefined) updateData.category = data.category
      if (data.price !== undefined) updateData.price = data.price
      if (data.cost != null) updateData.cost = data.cost
      if (data.stock !== undefined) updateData.stock = data.stock

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto atualizado')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar produto')
    },
  })
}

export function useSoftDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.rpc('soft_delete_product', {
        p_product_id: productId,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto removido')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover produto')
    },
  })
}
