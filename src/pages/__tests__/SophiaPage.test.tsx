import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SophiaPage from '../SophiaPage'

vi.mock('@/hooks/useAiInsights', () => ({
  useAiInsights: () => ({
    isPending: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
    data: {
      source: 'openai',
      model: 'gpt-5.6-luna',
      generatedAt: '2026-07-21T00:00:00Z',
      summary: 'Sophia encontrou oportunidades claras para estoque e marketing.',
      metrics: { establishments: 1, products: 10, clients: 5, sales90d: 8, averageTicket90d: 122.88 },
      actionPlan: [
        {
          id: 'a1',
          priority: 'alta',
          area: 'Estoque',
          title: 'Repor Máscara Volume Extremo',
          why: 'Produto abaixo do limite.',
          nextStep: 'Comprar reposição e comunicar últimas unidades.',
          suggestedOwner: 'Admin',
          dueWindow: 'Hoje',
          actionRoute: '/estoque',
        },
      ],
      performanceSignals: [
        {
          id: 's1',
          metric: 'Estoque crítico',
          status: 'crítico',
          summary: '2 produtos exigem reposição.',
          recommendation: 'Priorizar pedido hoje.',
        },
      ],
      customerActions: [
        {
          id: 'c1',
          segment: 'Clientes sem compra recente',
          clientNames: ['Patrícia Souza'],
          reason: 'Sem compra recente.',
          message: 'Oi, tudo bem? Separei uma sugestão para você.',
          actionRoute: '/clientes',
        },
      ],
      contentIdeas: [
        {
          id: 'm1',
          channel: 'Instagram',
          theme: 'Últimas unidades',
          format: 'Story',
          hook: 'Restam poucas unidades.',
          caption: 'Destaque de hoje.',
          cta: 'Responder story',
          relatedProducts: ['Máscara Volume Extremo'],
        },
      ],
      insights: [
        {
          id: 'i1',
          kind: 'estoque_baixo',
          priority: 'alta',
          title: 'Máscara Volume Extremo pode romper estoque',
          summary: 'Restam 3 unidades.',
          rationale: 'Limite configurado: 5.',
          actionLabel: 'Ver estoque',
          actionRoute: '/estoque',
          confidence: 0.9,
          marketingAngles: ['Últimas unidades'],
          postIdeas: ['Story de urgência'],
          relatedProducts: ['Máscara Volume Extremo'],
          relatedClients: [],
        },
      ],
      automationIdeas: [],
    },
  }),
}))

describe('SophiaPage', () => {
  it('should render action, performance, customer and content sections', () => {
    render(
      <MemoryRouter>
        <SophiaPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Sophia IA')).toBeInTheDocument()
    expect(screen.getByText('Prioridades de ação')).toBeInTheDocument()
    expect(screen.getByText('Sinais de performance')).toBeInTheDocument()
    expect(screen.getByText('Clientes para acionar')).toBeInTheDocument()
    expect(screen.getByText('Marketing e conteúdo')).toBeInTheDocument()
    expect(screen.getByText('Repor Máscara Volume Extremo')).toBeInTheDocument()
  })
})
