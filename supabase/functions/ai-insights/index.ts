import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "supabase"

type Role = "super_admin" | "admin" | "employee"

interface ProductRow {
  id: string
  establishment_id: string
  name: string
  category: string
  price: number
  cost: number | null
  stock: number
  created_at: string
  updated_at: string
}

interface ClientRow {
  id: string
  establishment_id: string
  name: string
  birthday: string | null
  created_at: string
}

interface SaleRow {
  id: string
  establishment_id: string
  client_id: string | null
  payment_method: string
  total: number
  items_count: number
  created_at: string
}

interface SaleItemRow {
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface StoreSettingsRow {
  establishment_id: string
  low_stock_threshold: number
  vip_threshold: number
  birthday_alert_days: number
  default_markup: number
  monthly_sales_goal: number
}

interface AiInsight {
  id: string
  kind: string
  priority: "alta" | "media" | "baixa"
  title: string
  summary: string
  rationale: string
  actionLabel: string
  actionRoute: string
  confidence: number
  marketingAngles: string[]
  postIdeas: string[]
  relatedProducts: string[]
  relatedClients: string[]
}

interface AiAutomationIdea {
  area: string
  trigger: string
  action: string
  value: string
}

interface AiActionPlanItem {
  id: string
  priority: "alta" | "media" | "baixa"
  area: string
  title: string
  why: string
  nextStep: string
  suggestedOwner: string
  dueWindow: string
  actionRoute: string
}

interface AiContentIdea {
  id: string
  channel: "Instagram" | "WhatsApp" | "Vitrine" | "Equipe"
  theme: string
  format: string
  hook: string
  caption: string
  cta: string
  relatedProducts: string[]
}

interface AiCustomerAction {
  id: string
  segment: string
  clientNames: string[]
  reason: string
  message: string
  actionRoute: string
}

interface AiPerformanceSignal {
  id: string
  metric: string
  status: "bom" | "atenção" | "crítico"
  summary: string
  recommendation: string
}

const defaultAllowedOrigins = [
  "https://crm-make-dwp.pages.dev",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
]

const insightSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "insights", "automationIdeas", "actionPlan", "contentIdeas", "customerActions", "performanceSignals"],
  properties: {
    summary: { type: "string" },
    insights: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "kind",
          "priority",
          "title",
          "summary",
          "rationale",
          "actionLabel",
          "actionRoute",
          "confidence",
          "marketingAngles",
          "postIdeas",
          "relatedProducts",
          "relatedClients",
        ],
        properties: {
          id: { type: "string" },
          kind: {
            type: "string",
            enum: [
              "estoque_baixo",
              "produto_parado",
              "cliente_inativo",
              "aniversario",
              "marketing",
              "branding",
              "ticket_medio",
              "cross_sell",
              "operacao",
            ],
          },
          priority: { type: "string", enum: ["alta", "media", "baixa"] },
          title: { type: "string" },
          summary: { type: "string" },
          rationale: { type: "string" },
          actionLabel: { type: "string" },
          actionRoute: { type: "string", enum: ["/promos", "/clientes", "/estoque", "/vendas", "/produto"] },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          marketingAngles: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
          postIdeas: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
          relatedProducts: { type: "array", items: { type: "string" }, maxItems: 5 },
          relatedClients: { type: "array", items: { type: "string" }, maxItems: 5 },
        },
      },
    },
    automationIdeas: {
      type: "array",
      minItems: 6,
      maxItems: 14,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["area", "trigger", "action", "value"],
        properties: {
          area: { type: "string" },
          trigger: { type: "string" },
          action: { type: "string" },
          value: { type: "string" },
        },
      },
    },
    actionPlan: {
      type: "array",
      minItems: 4,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "priority", "area", "title", "why", "nextStep", "suggestedOwner", "dueWindow", "actionRoute"],
        properties: {
          id: { type: "string" },
          priority: { type: "string", enum: ["alta", "media", "baixa"] },
          area: { type: "string" },
          title: { type: "string" },
          why: { type: "string" },
          nextStep: { type: "string" },
          suggestedOwner: { type: "string" },
          dueWindow: { type: "string" },
          actionRoute: { type: "string", enum: ["/sophia", "/promos", "/clientes", "/estoque", "/vendas", "/produto", "/usuarios"] },
        },
      },
    },
    contentIdeas: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "channel", "theme", "format", "hook", "caption", "cta", "relatedProducts"],
        properties: {
          id: { type: "string" },
          channel: { type: "string", enum: ["Instagram", "WhatsApp", "Vitrine", "Equipe"] },
          theme: { type: "string" },
          format: { type: "string" },
          hook: { type: "string" },
          caption: { type: "string" },
          cta: { type: "string" },
          relatedProducts: { type: "array", items: { type: "string" }, maxItems: 5 },
        },
      },
    },
    customerActions: {
      type: "array",
      minItems: 2,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "segment", "clientNames", "reason", "message", "actionRoute"],
        properties: {
          id: { type: "string" },
          segment: { type: "string" },
          clientNames: { type: "array", items: { type: "string" }, maxItems: 8 },
          reason: { type: "string" },
          message: { type: "string" },
          actionRoute: { type: "string", enum: ["/clientes", "/promos", "/sophia"] },
        },
      },
    },
    performanceSignals: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "metric", "status", "summary", "recommendation"],
        properties: {
          id: { type: "string" },
          metric: { type: "string" },
          status: { type: "string", enum: ["bom", "atenção", "crítico"] },
          summary: { type: "string" },
          recommendation: { type: "string" },
        },
      },
    },
  },
}

function getAllowedOrigins() {
  const configured = [
    Deno.env.get("ALLOWED_ORIGIN"),
    Deno.env.get("ALLOWED_ORIGINS"),
  ]
    .filter(Boolean)
    .flatMap((value) => value!.split(","))
    .map((value) => value.trim())
    .filter(Boolean)

  return new Set([...defaultAllowedOrigins, ...configured])
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? ""
  const allowedOrigins = getAllowedOrigins()
  const isPagesPreview = origin.startsWith("https://") && origin.endsWith(".crm-make-dwp.pages.dev")
  const allowedOrigin = allowedOrigins.has(origin) || isPagesPreview
    ? origin
    : defaultAllowedOrigins[0]

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  }
}

function daysSince(value: string | null | undefined) {
  if (!value) return null
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000))
}

function daysUntilBirthday(value: string | null) {
  if (!value) return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const birth = new Date(`${value}T00:00:00`)
  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  if (next < today) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate())
  return Math.round((next.getTime() - today.getTime()) / 86_400_000)
}

function safeNumber(value: unknown) {
  return Number.isFinite(Number(value)) ? Number(value) : 0
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function getCurrentMonthContext(now = new Date()) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const currentDay = now.getDate()

  return {
    monthStart,
    nextMonthStart,
    daysInMonth,
    currentDay,
    remainingDaysInMonth: Math.max(1, daysInMonth - currentDay + 1),
    expectedProgress: daysInMonth > 0 ? currentDay / daysInMonth : 0,
  }
}

function parseOpenAiText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string") return payload.output_text
  const output = payload.output
  if (!Array.isArray(output)) return null

  for (const item of output) {
    const content = (item as { content?: unknown }).content
    if (!Array.isArray(content)) continue
    for (const part of content) {
      const typed = part as { type?: string; text?: string }
      if (typed.type === "output_text" && typeof typed.text === "string") return typed.text
    }
  }

  return null
}

function normalizeInsight(insight: Partial<AiInsight>, index: number): AiInsight {
  return {
    id: insight.id || `insight-${index + 1}`,
    kind: insight.kind || "marketing",
    priority: insight.priority || "media",
    title: insight.title || "Oportunidade identificada",
    summary: insight.summary || "A Sophia encontrou uma oportunidade nos dados da unidade.",
    rationale: insight.rationale || "Baseado em estoque, histórico de vendas e comportamento dos clientes.",
    actionLabel: insight.actionLabel || "Ver direção",
    actionRoute: insight.actionRoute || "/promos",
    confidence: Math.min(1, Math.max(0, safeNumber(insight.confidence || 0.7))),
    marketingAngles: (insight.marketingAngles || []).slice(0, 4),
    postIdeas: (insight.postIdeas || []).slice(0, 4),
    relatedProducts: (insight.relatedProducts || []).slice(0, 5),
    relatedClients: (insight.relatedClients || []).slice(0, 5),
  }
}

function normalizeActionPlanItem(item: Partial<AiActionPlanItem>, index: number): AiActionPlanItem {
  return {
    id: item.id || `action-${index + 1}`,
    priority: item.priority || "media",
    area: item.area || "Operação",
    title: item.title || "Executar próxima ação comercial",
    why: item.why || "A Sophia identificou uma oportunidade nos dados recentes.",
    nextStep: item.nextStep || "Revisar a recomendação e definir o responsável.",
    suggestedOwner: item.suggestedOwner || "Equipe",
    dueWindow: item.dueWindow || "Hoje",
    actionRoute: item.actionRoute || "/sophia",
  }
}

function normalizeContentIdea(item: Partial<AiContentIdea>, index: number): AiContentIdea {
  return {
    id: item.id || `content-${index + 1}`,
    channel: item.channel || "Instagram",
    theme: item.theme || "Campanha da semana",
    format: item.format || "Story + Reels",
    hook: item.hook || "Uma oportunidade rápida para movimentar a loja hoje.",
    caption: item.caption || "Aproveite a seleção especial de hoje e fale com a equipe.",
    cta: item.cta || "Chamar no WhatsApp",
    relatedProducts: (item.relatedProducts || []).slice(0, 5),
  }
}

function normalizeCustomerAction(item: Partial<AiCustomerAction>, index: number): AiCustomerAction {
  return {
    id: item.id || `customer-${index + 1}`,
    segment: item.segment || "Clientes para contato",
    clientNames: (item.clientNames || []).slice(0, 8),
    reason: item.reason || "Há oportunidade de relacionamento ou recompra.",
    message: item.message || "Oi, tudo bem? Separei uma sugestão que combina com você.",
    actionRoute: item.actionRoute || "/clientes",
  }
}

function sanitizeCustomerActions(
  actions: AiCustomerAction[],
  context: ReturnType<typeof buildContext>,
): AiCustomerAction[] {
  const clientsByName = new Map(context.clients.map((client) => [client.name, client]))
  const birthdayWindow = context.birthdayAlertDays

  return actions
    .map((action) => {
      const isBirthdayAction = `${action.segment} ${action.reason} ${action.message}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .includes("anivers")

      const clientNames = action.clientNames.filter((name) => {
        const client = clientsByName.get(name)
        if (!client) return false
        if (!isBirthdayAction) return true
        return client.daysUntilBirthday !== null && client.daysUntilBirthday <= birthdayWindow
      })

      return { ...action, clientNames }
    })
    .filter((action) => {
      if (action.clientNames.length > 0) return true
      const isBirthdayAction = `${action.segment} ${action.reason} ${action.message}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .includes("anivers")
      return !isBirthdayAction
    })
}

function normalizePerformanceSignal(item: Partial<AiPerformanceSignal>, index: number): AiPerformanceSignal {
  return {
    id: item.id || `signal-${index + 1}`,
    metric: item.metric || "Operação",
    status: item.status || "atenção",
    summary: item.summary || "Acompanhar este indicador nos próximos dias.",
    recommendation: item.recommendation || "Revisar ações comerciais e medir resultado.",
  }
}

function buildAutomationIdeas(): AiAutomationIdea[] {
  return [
    {
      area: "Estoque baixo",
      trigger: "Produto atinge ou fica abaixo do limite da unidade",
      action: "Criar alerta com sugestão de compra, substituto e campanha para vender o restante sem ruptura",
      value: "Evita perda de venda e melhora reposição",
    },
    {
      area: "Produto parado",
      trigger: "Produto sem venda por 21, 30 ou 45 dias",
      action: "Sugerir combo, desconto progressivo, destaque no balcão e roteiro de postagem",
      value: "Transforma estoque parado em ação comercial",
    },
    {
      area: "Cliente inativo",
      trigger: "Cliente sem compra por 30, 60 ou 90 dias",
      action: "Gerar mensagem de retorno com oferta ligada ao último perfil de compra",
      value: "Aumenta recompra com personalização",
    },
    {
      area: "Aniversário",
      trigger: "Cliente faz aniversário dentro da janela configurada",
      action: "Criar cupom, mensagem curta e ideia de mimo para atendimento",
      value: "Reativa relacionamento com baixo esforço",
    },
    {
      area: "Ticket médio",
      trigger: "Venda média cai ou combo tem aderência baixa",
      action: "Sugerir kits por categoria, brinde mínimo e oferta de leve 2",
      value: "Eleva valor por venda sem depender só de desconto",
    },
    {
      area: "Branding",
      trigger: "Categorias com boa saída ou produto herói identificado",
      action: "Criar pauta de conteúdo, narrativa da marca e vitrine por ocasião",
      value: "Deixa o marketing mais consistente",
    },
    {
      area: "Calendário de conteúdo",
      trigger: "Semana sem campanha ativa ou data comercial próxima",
      action: "Gerar posts, stories, CTA e variações para WhatsApp",
      value: "Mantém presença digital ativa",
    },
    {
      area: "Operação",
      trigger: "Picos de venda, ruptura ou itens com margem sensível",
      action: "Orientar compra, vitrine e prioridade do time",
      value: "Conecta decisão comercial com rotina da loja",
    },
  ]
}

function buildActionPlan(context: ReturnType<typeof buildContext>, insights: AiInsight[]): AiActionPlanItem[] {
  const lowStock = context.products.filter((product) => product.stock <= product.lowStockThreshold)
  const stalled = context.products.filter((product) => {
    if (product.daysSinceLastSale !== null) return product.daysSinceLastSale >= 21
    return (product.daysSinceCreated ?? 0) >= 21
  })
  const inactiveClients = context.clients.filter((client) => (client.daysSinceLastPurchase ?? 999) >= 45)

  const plan: AiActionPlanItem[] = []

  if (context.monthlySalesGoal > 0 && context.monthlyGoalGap > 0) {
    const progress = context.monthlyGoalProgress ?? 0
    const isBehindPace = progress < context.expectedMonthlyGoalProgress * 0.85
    plan.push({
      id: "action-monthly-goal",
      priority: isBehindPace ? "alta" : "media",
      area: "Meta mensal",
      title: `Acelerar meta mensal (${Math.round(progress * 100)}%)`,
      why: `A unidade vendeu ${formatCurrency(context.monthRevenue)} de ${formatCurrency(context.monthlySalesGoal)}. Ainda faltam ${formatCurrency(context.monthlyGoalGap)}.`,
      nextStep: `Criar uma campanha de 48h combinando produto herói, clientes inativos e meta diária de ${formatCurrency(context.requiredDailyRevenueToGoal)}.`,
      suggestedOwner: context.role === "super_admin" ? "Gestor da unidade" : "Admin",
      dueWindow: isBehindPace ? "Hoje" : "Esta semana",
      actionRoute: "/promos",
    })
  }

  if (lowStock.length > 0) {
    plan.push({
      id: "action-low-stock",
      priority: "alta",
      area: "Estoque",
      title: `Repor ${lowStock.slice(0, 2).map((p) => p.name).join(" e ")}`,
      why: `${lowStock.length} produto(s) estão abaixo do limite de estoque configurado.`,
      nextStep: "Separar pedido de reposição e publicar aviso de últimas unidades antes de acabar.",
      suggestedOwner: context.role === "super_admin" ? "Gestor da unidade" : "Admin",
      dueWindow: "Hoje",
      actionRoute: "/estoque",
    })
  }

  if (stalled.length > 0) {
    plan.push({
      id: "action-stalled-products",
      priority: "media",
      area: "Marketing",
      title: `Criar campanha para ${stalled[0].name}`,
      why: "Há produto com baixa tração no histórico recente.",
      nextStep: "Montar combo, story com enquete e destaque na vitrine por 48h.",
      suggestedOwner: "Marketing/Atendimento",
      dueWindow: "Próximas 48h",
      actionRoute: "/promos",
    })
  }

  if (inactiveClients.length > 0) {
    plan.push({
      id: "action-inactive-clients",
      priority: "media",
      area: "Clientes",
      title: `Reativar ${inactiveClients.slice(0, 3).map((c) => c.name).join(", ")}`,
      why: `${inactiveClients.length} cliente(s) estão sem compra há 45 dias ou mais.`,
      nextStep: "Enviar mensagem curta com benefício de retorno e sugestão ligada ao perfil da cliente.",
      suggestedOwner: "Atendimento",
      dueWindow: "Hoje",
      actionRoute: "/clientes",
    })
  }

  if (context.averageTicket90d > 0) {
    plan.push({
      id: "action-average-ticket",
      priority: context.averageTicket90d < 90 ? "alta" : "baixa",
      area: "Vendas",
      title: "Elevar ticket médio com kits simples",
      why: `Ticket médio dos últimos 90 dias: R$ ${context.averageTicket90d.toFixed(2)}.`,
      nextStep: "Oferecer um kit de entrada com 2 produtos complementares no checkout.",
      suggestedOwner: "Equipe",
      dueWindow: "Esta semana",
      actionRoute: "/vendas",
    })
  }

  for (const insight of insights.slice(0, 3)) {
    if (plan.some((item) => item.title === insight.title)) continue
    plan.push({
      id: `action-${insight.id}`,
      priority: insight.priority,
      area: insight.kind.replace("_", " "),
      title: insight.title,
      why: insight.rationale,
      nextStep: insight.summary,
      suggestedOwner: "Equipe",
      dueWindow: insight.priority === "alta" ? "Hoje" : "Esta semana",
      actionRoute: insight.actionRoute,
    })
  }

  return plan.slice(0, 8)
}

function buildContentIdeas(context: ReturnType<typeof buildContext>, insights: AiInsight[]): AiContentIdea[] {
  const product = context.products.find((item) => item.stock <= item.lowStockThreshold)
    ?? context.products.find((item) => (item.daysSinceLastSale ?? 0) >= 21)
    ?? context.products[0]

  const ideas: AiContentIdea[] = []

  if (context.monthlySalesGoal > 0 && context.monthlyGoalGap > 0) {
    ideas.push({
      id: "content-monthly-goal",
      channel: "WhatsApp",
      theme: "Campanha para bater a meta",
      format: "Lista de transmissão + status",
      hook: `Faltam ${formatCurrency(context.monthlyGoalGap)} para a meta do mês.`,
      caption: `Hoje a curadoria é direta: selecione 3 produtos com boa saída, convide clientes inativos e ofereça um kit com chamada simples para fechar a diferença da meta.`,
      cta: "Chamar clientes prioritários",
      relatedProducts: context.products.slice(0, 3).map((item) => item.name),
    })
  }

  if (product) {
    ideas.push({
      id: "content-last-units",
      channel: "Instagram",
      theme: product.stock <= product.lowStockThreshold ? "Últimas unidades" : "Produto da semana",
      format: "Story com enquete + Reels curto",
      hook: product.stock <= product.lowStockThreshold
        ? `Restam poucas unidades de ${product.name}.`
        : `${product.name} merece voltar para a vitrine.`,
      caption: `Hoje a dica é ${product.name}: fácil de combinar, ótimo para destacar a beleza do dia e perfeito para montar um kit rápido.`,
      cta: "Responder o story para reservar",
      relatedProducts: [product.name],
    })
  }

  ideas.push({
    id: "content-whatsapp-reactivation",
    channel: "WhatsApp",
    theme: "Reativação de clientes",
    format: "Mensagem curta individual",
    hook: "Apareceu uma sugestão que combina com você.",
    caption: "Oi, tudo bem? Vi uma opção que combina com seu histórico aqui no Studio. Posso te mandar a sugestão?",
    cta: "Responder para receber a indicação",
    relatedProducts: insights.flatMap((insight) => insight.relatedProducts).slice(0, 3),
  })

  ideas.push({
    id: "content-branding-week",
    channel: "Vitrine",
    theme: "Coleção da semana",
    format: "Bancada + post fixo",
    hook: "Uma curadoria pronta para facilitar a escolha.",
    caption: "Separe uma bancada com produto herói, complemento e item de entrada. A comunicação deve ser simples: escolha rápida, resultado bonito e atendimento próximo.",
    cta: "Montar vitrine hoje",
    relatedProducts: context.products.slice(0, 3).map((item) => item.name),
  })

  return ideas.slice(0, 6)
}

function buildCustomerActions(context: ReturnType<typeof buildContext>): AiCustomerAction[] {
  const inactiveClients = context.clients.filter((client) => (client.daysSinceLastPurchase ?? 999) >= 45).slice(0, 6)
  const birthdays = context.clients.filter((client) => client.daysUntilBirthday !== null && client.daysUntilBirthday <= 7).slice(0, 6)
  const vipClients = context.clients.filter((client) => client.totalSpent >= context.vipThreshold).slice(0, 6)

  const actions: AiCustomerAction[] = []

  if (inactiveClients.length > 0) {
    actions.push({
      id: "customer-inactive",
      segment: "Clientes sem compra recente",
      clientNames: inactiveClients.map((client) => client.name),
      reason: "Estão há 45 dias ou mais sem comprar.",
      message: "Oi, tudo bem? Faz um tempinho que você não passa por aqui. Separei uma sugestão que combina com você. Quer que eu te mande?",
      actionRoute: "/clientes",
    })
  }

  if (birthdays.length > 0) {
    actions.push({
      id: "customer-birthday",
      segment: "Aniversariantes",
      clientNames: birthdays.map((client) => client.name),
      reason: "Aniversário dentro da janela configurada.",
      message: "Hoje tem um carinho especial para você no Studio. Quer aproveitar seu mimo de aniversário?",
      actionRoute: "/clientes",
    })
  }

  if (vipClients.length > 0) {
    actions.push({
      id: "customer-vip",
      segment: "Clientes VIP",
      clientNames: vipClients.map((client) => client.name),
      reason: "Clientes com maior valor acumulado.",
      message: "Separei uma condição especial para clientes VIP antes de divulgar para todo mundo. Quer ver?",
      actionRoute: "/clientes",
    })
  }

  return actions
}

function buildPerformanceSignals(context: ReturnType<typeof buildContext>): AiPerformanceSignal[] {
  const lowStockCount = context.products.filter((product) => product.stock <= product.lowStockThreshold).length
  const stalledCount = context.products.filter((product) => {
    if (product.daysSinceLastSale !== null) return product.daysSinceLastSale >= 21
    return (product.daysSinceCreated ?? 0) >= 21
  }).length
  const inactiveCount = context.clients.filter((client) => (client.daysSinceLastPurchase ?? 999) >= 45).length
  const monthlyProgress = context.monthlyGoalProgress ?? 0
  const monthlyGoalSignal: AiPerformanceSignal = context.monthlySalesGoal > 0
    ? {
      id: "signal-monthly-goal",
      metric: "Meta mensal",
      status: monthlyProgress >= context.expectedMonthlyGoalProgress ? "bom" : monthlyProgress < context.expectedMonthlyGoalProgress * 0.75 ? "crítico" : "atenção",
      summary: `${formatCurrency(context.monthRevenue)} vendidos de ${formatCurrency(context.monthlySalesGoal)} (${Math.round(monthlyProgress * 100)}%).`,
      recommendation: context.monthlyGoalGap > 0
        ? `Faltam ${formatCurrency(context.monthlyGoalGap)}. Ritmo sugerido: ${formatCurrency(context.requiredDailyRevenueToGoal)} por dia até virar o mês.`
        : "Meta atingida. Use a Sophia para proteger estoque e manter relacionamento ativo.",
    }
    : {
      id: "signal-monthly-goal",
      metric: "Meta mensal",
      status: "atenção",
      summary: "A unidade ainda não tem meta mensal configurada.",
      recommendation: "Configure uma meta em Ajustes para a Sophia medir ritmo, falta para meta e campanhas de recuperação.",
    }

  return [
    monthlyGoalSignal,
    {
      id: "signal-stock",
      metric: "Estoque crítico",
      status: lowStockCount > 0 ? "crítico" : "bom",
      summary: lowStockCount > 0 ? `${lowStockCount} produto(s) exigem reposição.` : "Nenhum produto abaixo do limite.",
      recommendation: lowStockCount > 0 ? "Priorize reposição e evite campanha que aumente demanda sem estoque." : "Manter rotina de conferência semanal.",
    },
    {
      id: "signal-stalled",
      metric: "Giro de produtos",
      status: stalledCount > 0 ? "atenção" : "bom",
      summary: stalledCount > 0 ? `${stalledCount} produto(s) com baixa tração recente.` : "Giro sem alerta relevante no período.",
      recommendation: stalledCount > 0 ? "Usar conteúdo demonstrativo e combo leve para gerar demanda." : "Reforçar os produtos heróis atuais.",
    },
    {
      id: "signal-clients",
      metric: "Relacionamento",
      status: inactiveCount > 0 ? "atenção" : "bom",
      summary: inactiveCount > 0 ? `${inactiveCount} cliente(s) pedem contato ativo.` : "Base sem alerta forte de inatividade.",
      recommendation: inactiveCount > 0 ? "Separar lista de WhatsApp e abordar com mensagem individual." : "Manter cadência de relacionamento.",
    },
    {
      id: "signal-ticket",
      metric: "Ticket médio",
      status: context.averageTicket90d < 90 ? "atenção" : "bom",
      summary: `Ticket médio de R$ ${context.averageTicket90d.toFixed(2)} nos últimos 90 dias.`,
      recommendation: "Testar kits por categoria e oferta de complemento no checkout.",
    },
  ]
}

function fallbackInsights(context: ReturnType<typeof buildContext>): AiInsight[] {
  const insights: AiInsight[] = []

  if (context.monthlySalesGoal > 0 && context.monthlyGoalGap > 0) {
    const progress = context.monthlyGoalProgress ?? 0
    insights.push({
      id: "monthly-goal",
      kind: "operacao",
      priority: progress < context.expectedMonthlyGoalProgress * 0.85 ? "alta" : "media",
      title: "Meta mensal precisa de ação comercial",
      summary: `A unidade está em ${Math.round(progress * 100)}% da meta. Faltam ${formatCurrency(context.monthlyGoalGap)} e o ritmo sugerido é ${formatCurrency(context.requiredDailyRevenueToGoal)} por dia.`,
      rationale: `Meta configurada: ${formatCurrency(context.monthlySalesGoal)}. Vendido no mês: ${formatCurrency(context.monthRevenue)}.`,
      actionLabel: "Criar campanha",
      actionRoute: "/promos",
      confidence: 0.84,
      marketingAngles: ["Campanha de recuperação", "Meta do mês", "Lista de clientes prioritários"],
      postIdeas: ["Status WhatsApp com curadoria da semana", "Story com kit rápido para fechar o mês"],
      relatedProducts: context.products.slice(0, 3).map((product) => product.name),
      relatedClients: context.clients.slice(0, 3).map((client) => client.name),
    })
  }

  for (const product of context.products.filter((p) => p.stock <= p.lowStockThreshold).slice(0, 2)) {
    insights.push({
      id: `stock-${product.id}`,
      kind: "estoque_baixo",
      priority: "alta",
      title: `${product.name} pode romper estoque`,
      summary: `Restam ${product.stock} unidades. Priorize reposição e use o item como gatilho de urgência enquanto ainda há estoque.`,
      rationale: `Limite configurado: ${product.lowStockThreshold}. O produto está dentro da zona de alerta.`,
      actionLabel: "Ver estoque",
      actionRoute: "/estoque",
      confidence: 0.9,
      marketingAngles: ["Últimas unidades", "Reposição consciente", "Favorito quase acabando"],
      postIdeas: [`Story: últimos itens de ${product.name}`, `Combo rápido com ${product.category}`],
      relatedProducts: [product.name],
      relatedClients: [],
    })
  }

  const stalledProducts = context.products.filter((product) => {
    if (product.daysSinceLastSale !== null) return product.daysSinceLastSale >= 21
    return (product.daysSinceCreated ?? 0) >= 21
  })

  for (const product of stalledProducts.slice(0, 2)) {
    const inactiveDays = product.daysSinceLastSale ?? product.daysSinceCreated
    const inactiveLabel = inactiveDays
      ? `há ${inactiveDays} dias`
      : "no período analisado"

    insights.push({
      id: `stalled-${product.id}`,
      kind: "produto_parado",
      priority: "media",
      title: `${product.name} está parado`,
      summary: `Sem venda recente ${inactiveLabel}. Monte um combo ou destaque visual para girar estoque.`,
      rationale: "Produto com baixa tração no histórico recente.",
      actionLabel: "Criar campanha",
      actionRoute: "/promos",
      confidence: 0.76,
      marketingAngles: ["Antes e depois", "Combo de descoberta", "Produto esquecido da semana"],
      postIdeas: [`Reels mostrando como usar ${product.name}`, `Story com enquete: você usaria ${product.name}?`],
      relatedProducts: [product.name],
      relatedClients: [],
    })
  }

  for (const client of context.clients.filter((c) => (c.daysSinceLastPurchase ?? 999) >= 45).slice(0, 2)) {
    insights.push({
      id: `client-${client.id}`,
      kind: "cliente_inativo",
      priority: client.totalSpent >= context.vipThreshold ? "alta" : "media",
      title: `${client.name} está sem comprar`,
      summary: `Cliente sem compra há ${client.daysSinceLastPurchase ?? "muitos"} dias. Envie uma abordagem personalizada com sugestão ligada ao histórico.`,
      rationale: `Total acumulado: R$ ${client.totalSpent.toFixed(2)}.`,
      actionLabel: "Ver clientes",
      actionRoute: "/clientes",
      confidence: 0.72,
      marketingAngles: ["Saudade da cliente", "Oferta de retorno", "Atendimento personalizado"],
      postIdeas: ["Mensagem WhatsApp com benefício de retorno", "Lista VIP da semana para contato ativo"],
      relatedProducts: [],
      relatedClients: [client.name],
    })
  }

  return insights.slice(0, 6)
}

function buildContext(params: {
  role: Role
  establishments: Array<{ id: string; name: string }>
  products: ProductRow[]
  clients: ClientRow[]
  sales: SaleRow[]
  saleItems: SaleItemRow[]
  settings: StoreSettingsRow[]
}) {
  const settingsByEstablishment = new Map(params.settings.map((setting) => [setting.establishment_id, setting]))
  const saleById = new Map(params.sales.map((sale) => [sale.id, sale]))
  const salesByClient = new Map<string, SaleRow[]>()
  const saleItemsByProduct = new Map<string, SaleItemRow[]>()

  for (const sale of params.sales) {
    if (!sale.client_id) continue
    const entry = salesByClient.get(sale.client_id) ?? []
    entry.push(sale)
    salesByClient.set(sale.client_id, entry)
  }

  for (const item of params.saleItems) {
    const entry = saleItemsByProduct.get(item.product_id) ?? []
    entry.push(item)
    saleItemsByProduct.set(item.product_id, entry)
  }

  const products = params.products.map((product) => {
    const items = saleItemsByProduct.get(product.id) ?? []
    const productSales = items
      .map((item) => saleById.get(item.sale_id))
      .filter(Boolean) as SaleRow[]
    const lastSale = productSales.sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
    const setting = settingsByEstablishment.get(product.establishment_id)

    return {
      id: product.id,
      establishmentId: product.establishment_id,
      name: product.name,
      category: product.category,
      price: safeNumber(product.price),
      cost: params.role === "employee" ? null : product.cost,
      stock: safeNumber(product.stock),
      lowStockThreshold: setting?.low_stock_threshold ?? 5,
      quantitySold90d: items.reduce((sum, item) => sum + safeNumber(item.quantity), 0),
      revenue90d: items.reduce((sum, item) => sum + safeNumber(item.subtotal), 0),
      daysSinceLastSale: daysSince(lastSale?.created_at),
      daysSinceCreated: daysSince(product.created_at),
    }
  })

  const clients = params.clients.map((client) => {
    const clientSales = (salesByClient.get(client.id) ?? []).sort((a, b) => b.created_at.localeCompare(a.created_at))
    const totalSpent = clientSales.reduce((sum, sale) => sum + safeNumber(sale.total), 0)
    return {
      id: client.id,
      establishmentId: client.establishment_id,
      name: client.name,
      totalSpent,
      purchaseCount90d: clientSales.length,
      daysSinceLastPurchase: daysSince(clientSales[0]?.created_at),
      daysUntilBirthday: daysUntilBirthday(client.birthday),
    }
  })

  const totalRevenue = params.sales.reduce((sum, sale) => sum + safeNumber(sale.total), 0)
  const averageTicket = params.sales.length ? totalRevenue / params.sales.length : 0
  const monthContext = getCurrentMonthContext()
  const monthSales = params.sales.filter((sale) => {
    const createdAt = new Date(sale.created_at)
    return createdAt >= monthContext.monthStart && createdAt < monthContext.nextMonthStart
  })
  const monthRevenue = monthSales.reduce((sum, sale) => sum + safeNumber(sale.total), 0)
  const monthlySalesGoal = params.settings.reduce(
    (sum, setting) => sum + safeNumber(setting.monthly_sales_goal),
    0,
  )
  const monthlyGoalProgress = monthlySalesGoal > 0 ? monthRevenue / monthlySalesGoal : null
  const monthlyGoalGap = monthlySalesGoal > 0 ? Math.max(0, monthlySalesGoal - monthRevenue) : 0
  const requiredDailyRevenueToGoal = monthlySalesGoal > 0
    ? monthlyGoalGap / monthContext.remainingDaysInMonth
    : 0

  return {
    generatedAt: new Date().toISOString(),
    role: params.role,
    canUseCostContext: params.role !== "employee",
    establishments: params.establishments,
    totalRevenue90d: totalRevenue,
    salesCount90d: params.sales.length,
    averageTicket90d: averageTicket,
    monthRevenue,
    monthSalesCount: monthSales.length,
    monthlySalesGoal,
    monthlyGoalProgress,
    monthlyGoalGap,
    requiredDailyRevenueToGoal,
    expectedMonthlyGoalProgress: monthContext.expectedProgress,
    remainingDaysInMonth: monthContext.remainingDaysInMonth,
    vipThreshold: params.settings[0]?.vip_threshold ?? 500,
    birthdayAlertDays: params.settings[0]?.birthday_alert_days ?? 7,
    products: products
      .sort((a, b) => {
        if (a.stock <= a.lowStockThreshold && b.stock > b.lowStockThreshold) return -1
        return (b.daysSinceLastSale ?? 0) - (a.daysSinceLastSale ?? 0)
      })
      .slice(0, 35),
    clients: clients
      .sort((a, b) => (b.daysSinceLastPurchase ?? 0) - (a.daysSinceLastPurchase ?? 0))
      .slice(0, 35),
  }
}

async function createAiInsights(context: ReturnType<typeof buildContext>) {
  const apiKey = Deno.env.get("OPENAI_API_KEY")
  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-5.6-luna"
  const reasoningEffort = Deno.env.get("OPENAI_REASONING_EFFORT") ?? "low"
  const fallback = fallbackInsights(context)
  const fallbackActionPlan = buildActionPlan(context, fallback)
  const fallbackContentIdeas = buildContentIdeas(context, fallback)
  const fallbackCustomerActions = buildCustomerActions(context)
  const fallbackPerformanceSignals = buildPerformanceSignals(context)

  if (!apiKey) {
    return {
      source: "rules",
      model: "fallback-local",
      summary: "Insights gerados por regras locais. Configure OPENAI_API_KEY para ativar a Sophia com LLM.",
      insights: fallback,
      automationIdeas: buildAutomationIdeas(),
      actionPlan: fallbackActionPlan,
      contentIdeas: fallbackContentIdeas,
      customerActions: fallbackCustomerActions,
      performanceSignals: fallbackPerformanceSignals,
    }
  }

  const systemPrompt = [
    "Voce e Sophia IA, estrategista comercial e de marketing para pequenos estabelecimentos de beleza.",
    "Analise estoque, vendas, clientes, ticket medio, meta mensal, ritmo do mes, comportamento recente e calendario comercial.",
    "Gere direcionamento pratico em pt-BR: o que fazer, por que fazer, qual campanha criar e quais ideias de postagem usar.",
    "A resposta deve funcionar como central de comando: plano de acao, sinais de performance, mensagens para clientes, ideias de conteudo e automacoes.",
    "Para cada recomendacao, seja especifico: cite produtos/clientes quando existirem, prioridade, proximo passo, canal e chamada para acao.",
    "Se monthlySalesGoal for maior que zero, use monthRevenue, monthlyGoalGap, monthlyGoalProgress, expectedMonthlyGoalProgress e requiredDailyRevenueToGoal para indicar se a unidade esta no ritmo da meta.",
    "Quando a meta estiver atrasada, recomende uma acao comercial concreta: campanha de 48h, lista de clientes, produto heroi, kit, WhatsApp, vitrine ou postagem.",
    "Quando a meta nao estiver configurada, trate isso como lacuna de gestao e sugira configurar em Ajustes, sem inventar percentuais.",
    "Nunca invente dados. Use apenas produtos e clientes presentes no contexto.",
    "So trate aniversario como acao ativa quando daysUntilBirthday estiver dentro de birthdayAlertDays.",
    "Se daysUntilBirthday for maior que birthdayAlertDays, pode citar como planejamento futuro, mas nao como alerta da semana.",
    "Se o role for employee, nunca mencione custo, margem ou lucro. Para admin/super_admin pode usar esse contexto sem expor valores sensiveis desnecessarios.",
    "Priorize acoes que movem venda: reposicao, giro de estoque, reativacao, fidelizacao, branding e conteudo.",
    "Se os dados forem insuficientes, diga qual dado falta e ofereca uma acao segura mesmo assim.",
  ].join(" ")

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      reasoning: { effort: reasoningEffort },
      instructions: systemPrompt,
      input: [
        {
          role: "user",
          content: JSON.stringify({
            request: "Crie insights comerciais e automacoes de IA para o CRM Studio Belle.",
            context,
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "crm_ai_insights",
          strict: true,
          schema: insightSchema,
        },
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("OpenAI error:", response.status, error.slice(0, 500))
    return {
      source: "rules",
      model: "fallback-local",
      summary: "A Sophia usou regras locais porque a LLM não respondeu agora.",
      insights: fallback,
      automationIdeas: buildAutomationIdeas(),
      actionPlan: fallbackActionPlan,
      contentIdeas: fallbackContentIdeas,
      customerActions: fallbackCustomerActions,
      performanceSignals: fallbackPerformanceSignals,
    }
  }

  const payload = await response.json() as Record<string, unknown>
  const text = parseOpenAiText(payload)
  if (!text) {
    return {
      source: "rules",
      model: "fallback-local",
      summary: "A Sophia usou regras locais porque a resposta da LLM veio sem texto estruturado.",
      insights: fallback,
      automationIdeas: buildAutomationIdeas(),
      actionPlan: fallbackActionPlan,
      contentIdeas: fallbackContentIdeas,
      customerActions: fallbackCustomerActions,
      performanceSignals: fallbackPerformanceSignals,
    }
  }

  try {
    const parsed = JSON.parse(text) as {
      summary?: string
      insights?: Array<Partial<AiInsight>>
      automationIdeas?: AiAutomationIdea[]
      actionPlan?: Array<Partial<AiActionPlanItem>>
      contentIdeas?: Array<Partial<AiContentIdea>>
      customerActions?: Array<Partial<AiCustomerAction>>
      performanceSignals?: Array<Partial<AiPerformanceSignal>>
    }
    const insights = (parsed.insights || []).map(normalizeInsight).slice(0, 8)
    const performanceSignals = (parsed.performanceSignals || fallbackPerformanceSignals)
      .map(normalizePerformanceSignal)
      .slice(0, 8)
    const hasMonthlyGoalSignal = performanceSignals.some((signal) => {
      const normalizedMetric = signal.metric
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
      return signal.id === "signal-monthly-goal" || normalizedMetric.includes("meta mensal")
    })
    const monthlyGoalSignal = fallbackPerformanceSignals.find((signal) => signal.id === "signal-monthly-goal")
    const mergedPerformanceSignals = hasMonthlyGoalSignal || !monthlyGoalSignal
      ? performanceSignals
      : [monthlyGoalSignal, ...performanceSignals].slice(0, 8)

    return {
      source: "openai",
      model,
      summary: parsed.summary || "Sophia analisou os dados e encontrou oportunidades comerciais.",
      insights,
      automationIdeas: (parsed.automationIdeas || buildAutomationIdeas()).slice(0, 14),
      actionPlan: (parsed.actionPlan || fallbackActionPlan).map(normalizeActionPlanItem).slice(0, 10),
      contentIdeas: (parsed.contentIdeas || fallbackContentIdeas).map(normalizeContentIdea).slice(0, 8),
      customerActions: sanitizeCustomerActions(
        (parsed.customerActions || fallbackCustomerActions).map(normalizeCustomerAction),
        context,
      ).slice(0, 8),
      performanceSignals: mergedPerformanceSignals,
    }
  } catch (error) {
    console.error("OpenAI parse error:", error)
    return {
      source: "rules",
      model: "fallback-local",
      summary: "A Sophia usou regras locais porque a resposta da LLM não estava em JSON válido.",
      insights: fallback,
      automationIdeas: buildAutomationIdeas(),
      actionPlan: fallbackActionPlan,
      contentIdeas: fallbackContentIdeas,
      customerActions: fallbackCustomerActions,
      performanceSignals: fallbackPerformanceSignals,
    }
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Token de autenticação ausente" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user: caller }, error: authError } = await callerClient.auth.getUser()
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: "Não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const { data: callerProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("role, establishment_id")
      .eq("id", caller.id)
      .single()

    if (profileError || !callerProfile) {
      return new Response(
        JSON.stringify({ error: "Perfil não encontrado" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const body = await req.json().catch(() => ({})) as { establishment_id?: string | null }
    const role = callerProfile.role as Role
    let establishmentIds: string[] = []

    if (role === "super_admin") {
      if (body.establishment_id) {
        establishmentIds = [body.establishment_id]
      } else {
        const { data, error } = await adminClient
          .from("establishments")
          .select("id")
          .eq("active", true)
        if (error) throw error
        establishmentIds = (data ?? []).map((row) => row.id)
      }
    } else if (callerProfile.establishment_id) {
      establishmentIds = [callerProfile.establishment_id]
    }

    if (establishmentIds.length === 0) {
      return new Response(
        JSON.stringify({
          source: "rules",
          model: "fallback-local",
          summary: "Nenhum estabelecimento disponível para análise.",
          insights: [],
          automationIdeas: buildAutomationIdeas(),
          actionPlan: [],
          contentIdeas: [],
          customerActions: [],
          performanceSignals: [],
          metrics: {
            establishments: 0,
            products: 0,
            clients: 0,
            sales90d: 0,
            averageTicket90d: 0,
            monthRevenue: 0,
            monthlySalesGoal: 0,
            monthlyGoalProgress: null,
            monthlyGoalGap: 0,
            requiredDailyRevenueToGoal: 0,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const since = new Date(Date.now() - 90 * 86_400_000).toISOString()

    const [
      establishmentsResult,
      productsResult,
      clientsResult,
      salesResult,
      settingsResult,
    ] = await Promise.all([
      adminClient.from("establishments").select("id, name").in("id", establishmentIds),
      adminClient.from("products").select("id, establishment_id, name, category, price, cost, stock, created_at, updated_at").eq("active", true).in("establishment_id", establishmentIds).limit(80),
      adminClient.from("clients").select("id, establishment_id, name, birthday, created_at").eq("active", true).in("establishment_id", establishmentIds).limit(120),
      adminClient.from("sales").select("id, establishment_id, client_id, payment_method, total, items_count, created_at").is("refunded_at", null).in("establishment_id", establishmentIds).gte("created_at", since).limit(180),
      adminClient.from("store_settings").select("establishment_id, low_stock_threshold, vip_threshold, birthday_alert_days, default_markup, monthly_sales_goal").in("establishment_id", establishmentIds),
    ])

    for (const result of [establishmentsResult, productsResult, clientsResult, salesResult, settingsResult]) {
      if (result.error) throw result.error
    }

    const saleIds = (salesResult.data ?? []).map((sale) => sale.id)
    const saleItemsResult = saleIds.length
      ? await adminClient
        .from("sale_items")
        .select("sale_id, product_id, quantity, unit_price, subtotal")
        .in("sale_id", saleIds)
        .limit(400)
      : { data: [], error: null }

    if (saleItemsResult.error) throw saleItemsResult.error

    const context = buildContext({
      role,
      establishments: establishmentsResult.data ?? [],
      products: productsResult.data ?? [],
      clients: clientsResult.data ?? [],
      sales: salesResult.data ?? [],
      saleItems: saleItemsResult.data ?? [],
      settings: settingsResult.data ?? [],
    })
    const ai = await createAiInsights(context)

    return new Response(
      JSON.stringify({
        ...ai,
        generatedAt: context.generatedAt,
        metrics: {
          establishments: context.establishments.length,
          products: context.products.length,
          clients: context.clients.length,
          sales90d: context.salesCount90d,
          averageTicket90d: context.averageTicket90d,
          monthRevenue: context.monthRevenue,
          monthlySalesGoal: context.monthlySalesGoal,
          monthlyGoalProgress: context.monthlyGoalProgress,
          monthlyGoalGap: context.monthlyGoalGap,
          requiredDailyRevenueToGoal: context.requiredDailyRevenueToGoal,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("AI insights error:", error)
    return new Response(
      JSON.stringify({ error: "Erro ao gerar insights da Sophia" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
