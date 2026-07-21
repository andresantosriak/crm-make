# CRM Studio Bellê — mapa de automações e análises com IA

## Objetivo

Transformar a Sophia em uma IA ativa e reativa para direcionar vendas, estoque, relacionamento, marketing e branding. A IA deve analisar dados reais por estabelecimento e devolver recomendações práticas, com contexto suficiente para o usuário decidir o próximo passo.

## Modelo recomendado

- **API:** OpenAI Responses API.
- **Modelo padrão:** `gpt-5.6-luna`, configurável por `OPENAI_MODEL`.
- **Reasoning padrão:** `low`, configurável por `OPENAI_REASONING_EFFORT`.
- **Execução:** Supabase Edge Function `ai-insights`.
- **Segurança:** `OPENAI_API_KEY` fica apenas em Supabase Secrets. Nunca usar key no frontend/Cloudflare Pages.
- **Saída:** JSON estruturado com insights, prioridade, confiança, ação sugerida, ângulos de marketing e ideias de postagem.

### Ativação da LLM

```bash
npx supabase secrets set OPENAI_API_KEY="sua-chave-openai"
npx supabase secrets set OPENAI_MODEL="gpt-5.6-luna"
npx supabase secrets set OPENAI_REASONING_EFFORT="low"
npx supabase functions deploy ai-insights
```

Enquanto `OPENAI_API_KEY` não estiver configurada, a Sophia usa um fallback local por regras para manter Dashboard, Avisos e Promoções funcionando sem quebrar a experiência.

`gpt-5.6-luna` foi escolhido como padrão por ser mais barato que `gpt-5.6-sol` e adequado para análises recorrentes de CRM, marketing e estoque. Se a qualidade precisar subir em casos específicos, trocar temporariamente para `gpt-5.6-terra` é o próximo degrau antes de usar o modelo flagship.

## Dados usados pela Sophia

- Estabelecimento atual ou todos os estabelecimentos quando André estiver em visão global.
- Produtos ativos: categoria, preço, estoque, custo para admin/super admin, idade do produto, última venda e quantidade vendida.
- Vendas dos últimos 90 dias: total, quantidade de itens, ticket médio, forma de pagamento e frequência.
- Itens vendidos: produto, quantidade, subtotal e relação com venda.
- Clientes ativos: aniversário, total comprado, última compra e frequência.
- Configurações da unidade: estoque baixo, VIP, aniversário e markup padrão.

## Entrega implementada

### Sophia ativa e reativa — v1

- Edge Function `ai-insights` cruza os dados reais por estabelecimento.
- André, como super admin, pode analisar todos os estabelecimentos ou a unidade selecionada.
- Admin e funcionário analisam apenas o próprio estabelecimento.
- Dashboard exibe os dois insights prioritários.
- Avisos incorpora alertas da Sophia junto dos alertas operacionais.
- Promoções exibe insights completos e automações possíveis.
- Nova tela `/sophia` concentra:
  - resumo executivo;
  - prioridades de ação;
  - sinais de performance;
  - clientes para acionar;
  - ideias de marketing e conteúdo;
  - insights completos.

### Contrato atual da IA

- `summary`: leitura executiva em linguagem simples.
- `insights`: oportunidades comerciais priorizadas.
- `actionPlan`: plano operacional com responsável, prazo e próxima ação.
- `performanceSignals`: sinais de estoque, giro, clientes e ticket médio.
- `customerActions`: segmentos de clientes e mensagens prontas.
- `contentIdeas`: ideias de Instagram, WhatsApp, vitrine e equipe.
- `automationIdeas`: lista de automações possíveis por gatilho.

## Automações e análises possíveis

### Estoque

1. **Estoque baixo**
   - Gatilho: produto abaixo do limite configurado.
   - Ação: sugerir reposição, campanha de últimas unidades e substituto para evitar ruptura.
   - Direção: estoque + post de urgência.

2. **Produto parado**
   - Gatilho: produto sem venda por 21, 30 ou 45 dias.
   - Ação: criar combo, desconto progressivo, destaque em story, vitrine ou abordagem no atendimento.
   - Direção: girar estoque.

3. **Excesso de estoque**
   - Gatilho: estoque alto com baixa saída.
   - Ação: sugerir kits, brinde por compra mínima e live/demonstração.
   - Direção: reduzir capital parado.

4. **Risco de ruptura**
   - Gatilho: produto vendeu nos últimos dias e está perto do limite mínimo.
   - Ação: alertar compra antes de acabar e sugerir produto alternativo.
   - Direção: preservar receita.

5. **Produto herói**
   - Gatilho: produto com venda recorrente ou alto volume.
   - Ação: sugerir campanha de prova social, antes/depois e estoque reforçado.
   - Direção: usar o que já vende como motor de marketing.

6. **Margem sensível**
   - Gatilho: produto com custo alto ou margem baixa, visível apenas para admin.
   - Ação: evitar desconto agressivo e sugerir bundle com item de maior margem.
   - Direção: proteger rentabilidade.

### Clientes

7. **Cliente inativo**
   - Gatilho: cliente sem compra por 30, 60 ou 90 dias.
   - Ação: mensagem de retorno com benefício ligado ao histórico de compra.
   - Direção: recuperar cliente sem depender de aquisição.

8. **Cliente VIP**
   - Gatilho: total gasto acima do limite configurado.
   - Ação: mimo, pré-venda, atendimento prioritário e campanha exclusiva.
   - Direção: aumentar retenção.

9. **Aniversário**
   - Gatilho: aniversário dentro da janela configurada.
   - Ação: cupom, mensagem humanizada, brinde ou post de relacionamento.
   - Direção: fidelização.

10. **Cliente com baixa recorrência**
    - Gatilho: comprou uma vez e nunca retornou.
    - Ação: sugerir sequência de contato e oferta leve de retorno.
    - Direção: transformar primeira compra em hábito.

11. **Cliente por categoria**
    - Gatilho: cliente compra sempre uma categoria.
    - Ação: cross-sell com categoria complementar.
    - Direção: aumentar ticket médio.

12. **Clientes por sazonalidade**
    - Gatilho: comportamento de compra antes de datas ou eventos.
    - Ação: antecipar campanha e lista de contato.
    - Direção: preparar demanda.

### Vendas

13. **Ticket médio baixo**
    - Gatilho: ticket abaixo do histórico ou meta.
    - Ação: sugerir combos, mínimo para brinde e kits por ocasião.
    - Direção: aumentar valor por venda.

14. **Pico de vendas**
    - Gatilho: dia ou horário com venda acima da média.
    - Ação: sugerir reforço de estoque, escala de equipe e postagem no horário certo.
    - Direção: operar melhor o pico.

15. **Forma de pagamento dominante**
    - Gatilho: Pix/cartão/dinheiro com padrão forte.
    - Ação: ajustar copy de campanha e condição comercial.
    - Direção: reduzir fricção na compra.

16. **Queda de faturamento**
    - Gatilho: queda no dia, semana ou mês.
    - Ação: sugerir ação rápida: lista de clientes, campanha flash e produto herói.
    - Direção: reação comercial.

17. **Venda avulsa alta**
    - Gatilho: muitas vendas sem cliente cadastrado.
    - Ação: sugerir captura de cadastro no checkout.
    - Direção: criar base própria.

### Marketing e conteúdo

18. **Post de produto parado**
    - Gatilho: item com baixa saída.
    - Ação: roteiro de reels, story com enquete, antes/depois e combo.
    - Direção: gerar demanda.

19. **Calendário editorial semanal**
    - Gatilho: início da semana ou ausência de campanha.
    - Ação: pauta de posts, stories, WhatsApp e vitrine.
    - Direção: manter consistência.

20. **Campanha por categoria**
    - Gatilho: categoria com estoque alto, baixa saída ou boa margem.
    - Ação: criar narrativa e oferta da categoria.
    - Direção: marketing por coleção.

21. **Branding da unidade**
    - Gatilho: padrões de compra e produto herói.
    - Ação: sugerir posicionamento, tom de comunicação, promessa e pauta visual.
    - Direção: fortalecer marca local.

22. **Copy para WhatsApp**
    - Gatilho: cliente inativo, aniversário, VIP ou produto de interesse.
    - Ação: gerar mensagem curta, humanizada e sem tom robótico.
    - Direção: aumentar resposta.

23. **Vitrine e exposição**
    - Gatilho: produto com estoque alto ou campanha sugerida.
    - Ação: sugerir montagem de bancada, destaque e kit.
    - Direção: conectar loja física e digital.

24. **Campanha de data comercial**
    - Gatilho: Dia das Mães, Black Friday, Natal, férias, volta às aulas etc.
    - Ação: sugerir kits, cronograma e posts.
    - Direção: antecipação comercial.

### Operação e gestão

25. **Resumo diário automático**
    - Gatilho: fechamento do dia.
    - Ação: gerar resumo de vendas, estoque crítico, clientes para contato e campanha do dia seguinte.
    - Direção: rotina de gestão.

26. **Resumo semanal**
    - Gatilho: segunda-feira ou fechamento semanal.
    - Ação: análise de desempenho, produtos parados, melhores clientes e próximos passos.
    - Direção: planejamento.

27. **Alerta para André**
    - Gatilho: problema crítico em qualquer estabelecimento.
    - Ação: destacar unidade, risco e ação recomendada.
    - Direção: visão global do super admin.

28. **Comparativo entre unidades**
    - Gatilho: André em visão global.
    - Ação: comparar estoque, vendas, ticket, ruptura, reativação e campanhas.
    - Direção: replicar boas práticas.

29. **Treinamento de equipe**
    - Gatilho: padrão de baixa conversão ou produto esquecido.
    - Ação: sugerir script de atendimento e argumento de venda.
    - Direção: melhorar execução.

30. **Checklist reativo**
    - Gatilho: usuário abre dashboard ou promoções.
    - Ação: Sophia atualiza os próximos passos com base nos dados mais recentes.
    - Direção: app como assistente ativo.

## Próximas evoluções

1. Persistir histórico de insights em tabela própria para medir aceitação e resultado.
2. Criar botão “usar sugestão” para registrar quando a recomendação virou campanha.
3. Medir impacto: venda antes/depois, produto girou ou cliente retornou.
4. Permitir feedback do usuário para ajustar o tom da Sophia por estabelecimento.
5. Adicionar agendamento diário/semanal por Edge Function cron.
6. Gerar texto pronto para WhatsApp, Instagram e vitrine.
