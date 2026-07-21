import type { Promo } from '@/types'

export const promos: Promo[] = [
  {
    title: 'Combo Olhar Marcante',
    subtitle: 'Paleta + Máscara + Delineador',
    badge: { label: 'GIRAR ESTOQUE', bg: 'rgba(200,162,76,.16)', color: '#d9b869' },
    price: 179.90,
    originalPrice: 204.70,
    savings: 24.80,
    actions: ['publish', 'edit'],
  },
  {
    title: 'Leve 2, ganhe 15%',
    subtitle: 'Toda a linha de Lábios',
    badge: { label: 'TICKET MÉDIO', bg: 'rgba(143,169,138,.16)', color: '#8FA98A' },
    actions: ['publish', 'edit'],
  },
  {
    title: 'Cupom aniversário',
    subtitle: '20% para Mariana Alves',
    badge: { label: 'FIDELIZAR', bg: 'rgba(208,124,103,.16)', color: '#D07C67' },
    actions: ['whatsapp'],
  },
]
