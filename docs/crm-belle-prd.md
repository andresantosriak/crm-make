# PRD: CRM Studio Bellê

**Status:** Planejamento
**Versao:** 1.0
**Data:** 2026-07-20

## TL;DR

App mobile-first de gestao de vendas, estoque, clientes e promocoes para o salao de beleza Studio Bell PG. A primeira versao usa dados mock (sem backend) e implementa 10 telas + overlays com design premium dark/gold. O objetivo e validar a experiencia de uso antes de conectar a um backend real.

---

## Problema

- Bruna, dona do Studio Bell PG, gerencia vendas, estoque e clientes usando planilhas, cadernos ou memoria. Nao tem visibilidade em tempo real do que vendeu no dia, quais produtos estao em estoque baixo, nem quais clientes merecem atencao especial.
- Falta de controle de margem e markup na precificacao: calcula manualmente ou nao calcula.
- Perde oportunidades de fidelizacao (aniversarios, clientes sumidos) e de giro de estoque (produtos parados).
- Evidencia: cenario tipico de saloes de beleza de pequeno/medio porte no Brasil que operam sem sistema digital de gestao.

---

## Personas e Jobs-to-be-Done

### Persona 1 — Bruna (dona do salao)

- **Perfil:** Dona e operadora do Studio Bell PG, salao de beleza focado em maquiagem (make). Trabalha sozinha ou com equipe pequena. Usa o celular como principal dispositivo de trabalho.
- **Job:** Quando estou atendendo no salao e uma cliente quer comprar produtos, quero registrar a venda rapidamente pelo celular, para que eu tenha controle do que vendi, quanto ganhei e o que preciso repor.
- **Dores atuais:**
  - Nao sabe quanto vendeu no dia sem somar manualmente
  - Nao sabe a margem real dos produtos
  - Esquece aniversarios de clientes fieis
  - Produtos parados sem giro nao sao identificados a tempo
- **Ganhos esperados:**
  - Dashboard com vendas do dia, mes e meta em um olhar
  - Registro de venda em menos de 1 minuto
  - Markup e margem calculados automaticamente
  - Alertas proativos de estoque baixo e aniversarios

### Persona 2 — Sophia (assistente IA)

- **Perfil:** Assistente virtual integrada ao CRM. Analisa historico de vendas e estoque para sugerir acoes proativas.
- **Job:** Quando identifico que um produto esta parado ou que uma cliente faz aniversario, quero sugerir promocoes e cupons, para que a Bruna tome acoes de fidelizacao e giro de estoque sem precisar analisar dados.
- **Manifestacao no MVP:** Cards de sugestao no dashboard + tela de promocoes com 3 combos pre-montados. Nao ha IA real na v1 — as sugestoes sao mock estilizadas.

---

## Controle de Acesso (RBAC)

Nao se aplica nesta fase. O app e single-user (Bruna). Login e apenas navegacao visual, sem autenticacao real.

---

## MVP Scope — Telas e Funcionalidades

### Tela 1: Login

**Rota:** `/login`
**Descricao:** Tela de autenticacao visual (sem auth real). Exibe logo do salao, campos de e-mail e senha pre-preenchidos, botao "Entrar" e link "Entrar com biometria".

**Elementos:**
- Logo circular com iniciais "PG" em dourado, borda com gradiente
- Titulo "Studio Bell PG" em Cormorant Garamond
- Subtitulo "Make" em uppercase, letter-spacing 2px
- Campo e-mail: pre-preenchido com `contato@studiobellpg.com`
- Campo senha: pre-preenchido com `123456`, type password
- Botao "Entrar": gradiente dourado (linear-gradient 135deg, #d6b25c -> #b78d3d), text #1a1408
- Link "Entrar com biometria": texto #A79B88, sem fundo

**Comportamento:**
- Ambos os botoes navegam para o Dashboard (sem validacao)
- Animacao fadeup 0.5s ao entrar na tela

**Criterios de Aceite:**
- [ ] Campos pre-preenchidos visiveis ao carregar
- [ ] Botao "Entrar" navega para Dashboard
- [ ] Link "Entrar com biometria" navega para Dashboard
- [ ] Animacao fadeup ao montar o componente
- [ ] Campo senha com mascara (type password)
- [ ] Bottom nav NAO aparece nesta tela

---

### Tela 2: Dashboard (Inicio)

**Rota:** `/` ou `/dashboard`
**Descricao:** Tela principal com resumo de vendas, quick actions, sugestoes da Sophia IA e alerta de estoque baixo.

**Secoes (de cima para baixo):**

1. **Header**
   - Saudacao: "Sab, 20 jul" (data mock) + "Ola, Bruna" (Cormorant Garamond 28px)
   - Botao notificacoes (sino com badge vermelho) → navega para Avisos
   - Avatar circular "B" com borda dourada

2. **Card "Vendas de hoje"**
   - Fundo com gradiente sutil e ornamento radial no canto superior direito
   - Valor total formatado em Cormorant Garamond 42px (calculado: soma das vendas com `date === 'Hoje'`)
   - Linha: "N vendas" + "Ticket medio R$ 52,58"
   - Link "Ver historico →" no canto superior direito
   - Card inteiro e clicavel → navega para Historico

3. **Cards duplos "Este mes" e "Meta do mes"**
   - Este mes: "R$ 6.240" + "↑ 12% vs. jun" (cor verde #8FA98A)
   - Meta do mes: "68%" + barra de progresso (gradiente dourado, width 68%)

4. **Quick Actions** (grid 2x2)
   - Nova venda → Tela Nova Venda
   - Novo produto → Tela Novo Produto
   - Promocoes → Tela Promocoes
   - Clientes → Tela Clientes
   - Cada card: icone em container 38x38 com fundo dourado translucido, titulo 14px, subtitulo 12px

5. **Sophia sugere**
   - Titulo com dot pulsante (animacao glow 2.4s) + badge "IA"
   - Card 1: "A Paleta Nude Sunset esta parada ha 21 dias. Que tal um combo pra girar o estoque?" + botao "Criar combo →" (navega para Promocoes)
   - Card 2: "Mariana faz aniversario em 3 dias. Um cupom de 20% costuma trazer ela de volta." + botao "Enviar cupom →" (navega para Clientes)

6. **Estoque baixo**
   - Titulo + link "Ver tudo" (navega para Estoque)
   - Lista de produtos com stock <= 5: tile colorido por categoria, nome, categoria, estoque em laranja (#D07C67)
   - Borda do card com tom avermelhado (rgba(208,124,103,.22))

**Criterios de Aceite:**
- [ ] Valor de vendas de hoje calculado dinamicamente a partir do array de vendas mock
- [ ] Contagem de vendas de hoje correta
- [ ] Quick actions navegam para as telas corretas
- [ ] Dot da Sophia pulsa com animacao glow
- [ ] Estoque baixo mostra apenas produtos com stock <= 5
- [ ] Botao de notificacoes navega para Avisos
- [ ] Card de vendas de hoje e clicavel e navega para Historico
- [ ] Bottom nav visivel com tab "Inicio" ativo (cor dourada)

---

### Tela 3: Nova Venda — Passo 1 (Produtos)

**Rota:** `/vendas` (step: produtos)
**Descricao:** Catalogo de produtos para selecao. Busca, filtro por categoria, toggle lista/grade, controle de quantidade por produto.

**Elementos:**

1. **Header**
   - Titulo "Nova venda" (Cormorant Garamond 28px) + subtitulo "Toque para adicionar"
   - Botao historico (icone relogio) → navega para Historico
   - Toggle lista/grade (segmented control com 2 botoes)

2. **Busca**
   - Input com icone lupa, placeholder "Buscar produto..."
   - Filtra produtos por nome (case-insensitive, includes)

3. **Filtro de categorias**
   - Chips horizontais scrollaveis: "Todos", "Labios", "Rosto", "Olhos"
   - Chip ativo: fundo dourado translucido, texto dourado, borda dourada
   - Chip inativo: fundo #221C15, texto #A79B88

4. **Lista de produtos** (modo lista)
   - Tile colorido por categoria (46x46, border-radius 11px)
   - Nome do produto (14px, truncate com ellipsis)
   - Categoria + preco
   - Se NAO no carrinho: botao "+" dourado (36x36, gradiente)
   - Se no carrinho: controles "-" / quantidade / "+" inline

5. **Grade de produtos** (modo grade)
   - Grid 2 colunas, gap 10px
   - Tile grande (width 100%, height 70px)
   - Nome (13px, max 2 linhas, overflow hidden)
   - Preco em dourado (14px bold)
   - Badge de quantidade no canto superior direito (animacao pop) se no carrinho
   - Card inteiro clicavel (adiciona ao carrinho)
   - Borda dourada se produto esta no carrinho

6. **Floating Cart Bar** (aparece quando carrinho > 0)
   - Posicao absoluta, bottom 88px (acima do bottom nav)
   - "N itens · R$ total" + "Revisar e finalizar"
   - Botao "Avancar →" com gradiente dourado
   - Animacao pop 0.25s ao aparecer

**Criterios de Aceite:**
- [ ] Busca filtra produtos em tempo real
- [ ] Filtro de categoria funciona combinado com busca
- [ ] Toggle lista/grade alterna a visualizacao
- [ ] Adicionar produto incrementa quantidade no carrinho
- [ ] Remover produto decrementa; chegar a 0 remove do carrinho
- [ ] Cart bar aparece quando ha itens no carrinho
- [ ] Cart bar mostra total e contagem corretos
- [ ] Cart bar navega para checkout ao clicar "Avancar"
- [ ] Badge de quantidade no modo grade aparece com animacao pop
- [ ] Borda do card no modo grade muda para dourada quando produto esta no carrinho

---

### Tela 4: Nova Venda — Passo 2 (Checkout)

**Rota:** `/vendas` (step: checkout)
**Descricao:** Revisao dos itens, selecao de cliente e forma de pagamento, confirmacao da venda.

**Secoes:**

1. **Header**
   - Botao voltar (chevron esquerda) → volta para step produtos
   - Titulo "Finalizar venda" (Cormorant Garamond 26px)

2. **Itens**
   - Label "ITENS" uppercase
   - Lista de itens do carrinho em card arredondado
   - Cada item: tile + nome + "Nx R$ X,XX = R$ total" + controles +/-
   - Separador entre itens (borda 1px bottom)

3. **Cliente**
   - Label "CLIENTE" uppercase
   - Botao que abre o Client Picker bottom sheet
   - Se nenhum cliente: icone pessoa + "Selecionar cliente" + "Buscar ou cadastrar"
   - Se cliente selecionado: avatar com iniciais + nome + "Trocar cliente"
   - Borda do card muda para dourada quando cliente esta selecionado

4. **Forma de pagamento**
   - Label "FORMA DE PAGAMENTO" uppercase
   - Grid 2x2 com opcoes: Pix, Cartao de credito, Cartao de debito, Dinheiro
   - Opcao selecionada: fundo dourado translucido, texto dourado, borda dourada
   - Opcao nao selecionada: fundo #221C15, texto #F1EBDF

5. **Total**
   - Card com gradiente, "Total" a esquerda, valor em Cormorant Garamond 28px a direita

6. **Botao confirmar** (floating, bottom 88px)
   - Estados:
     - Sem cliente: "Selecione o cliente" (desabilitado, fundo escuro, texto cinza)
     - Sem pagamento: "Selecione o pagamento" (desabilitado)
     - Tudo preenchido: "Confirmar venda · R$ XX,XX" (gradiente dourado, cursor pointer)

**Criterios de Aceite:**
- [ ] Itens do carrinho listados com quantidades e subtotais corretos
- [ ] Controles +/- funcionam no checkout
- [ ] Botao cliente abre o Client Picker
- [ ] Cliente selecionado exibe nome e iniciais
- [ ] Formas de pagamento sao mutuamente exclusivas
- [ ] Botao confirmar desabilitado ate cliente E pagamento estarem selecionados
- [ ] Label do botao confirmar muda dinamicamente
- [ ] Total calculado corretamente
- [ ] Botao voltar retorna ao step de produtos mantendo o carrinho

---

### Tela 5: Historico de Vendas

**Rota:** `/historico`
**Descricao:** Lista de vendas realizadas com resumo do dia e do mes.

**Secoes:**

1. **Header**
   - Botao voltar → navega para Nova Venda
   - Titulo "Historico" (Cormorant Garamond 28px)

2. **Cards resumo** (2 colunas)
   - Hoje: valor total (Cormorant Garamond 24px bold), contagem de vendas
   - Este mes: R$ 6.240, "↑ 12%"

3. **Lista de vendas**
   - Cada venda: avatar circular com iniciais do cliente, nome do cliente, "N itens · Forma pagamento", valor, data/hora
   - Cards com fundo #221C15, borda sutil

**Criterios de Aceite:**
- [ ] Total de hoje calculado dinamicamente a partir do array de vendas
- [ ] Contagem de vendas de hoje correta
- [ ] Lista exibe todas as vendas mock (6 vendas)
- [ ] Forma de pagamento abreviada: "Cartao de credito" → "Credito", "Cartao de debito" → "Debito"
- [ ] Iniciais do cliente extraidas corretamente (2 primeiras letras dos nomes)

---

### Tela 6: Estoque

**Rota:** `/estoque`
**Descricao:** Lista completa de produtos com preco, margem e indicador de estoque.

**Elementos:**

1. **Header**
   - Titulo "Estoque" (Cormorant Garamond 28px) + "N produtos ativos"
   - Botao "+" (gradiente dourado, 44x44) → navega para Novo Produto

2. **Busca**
   - Input com icone lupa, placeholder "Buscar no estoque..."
   - Filtra por nome (case-insensitive)

3. **Lista de produtos**
   - Tile colorido por categoria (46x46)
   - Nome (14px, truncate)
   - Preco + "margem XX%"
   - Badge de estoque: pill arredondada
     - Estoque <= 5: fundo vermelho translucido (rgba(208,124,103,.16)), texto #D07C67
     - Estoque > 5: fundo verde translucido (rgba(143,169,138,.14)), texto #8FA98A

**Criterios de Aceite:**
- [ ] Lista exibe todos os 10 produtos
- [ ] Busca filtra em tempo real
- [ ] Margem calculada corretamente: (preco - custo) / preco * 100, arredondada
- [ ] Badge de estoque muda de cor conforme threshold (<=5 = vermelho, >5 = verde)
- [ ] Contagem de produtos ativos no header
- [ ] Botao "+" navega para Novo Produto
- [ ] Bottom nav com tab "Estoque" ativo

---

### Tela 7: Novo Produto

**Rota:** `/produto`
**Descricao:** Formulario de cadastro de produto com calculo live de markup, margem e lucro.

**Campos:**

1. **Nome** — input texto, placeholder "Ex.: Batom Matte Rose"
2. **Categoria** — chips selecionaveis: "Labios", "Rosto", "Olhos"
3. **Custo (R$)** — input decimal, placeholder "0,00", inputmode decimal
4. **Preco venda (R$)** — input decimal, placeholder "0,00", inputmode decimal
   - Auto-preenchido quando custo e digitado (usando markup padrao + arredondamento .90)
   - Se o usuario editar manualmente, flag `priceAuto` vira false
5. **Hint de preco** — "Sugerido pelo markup padrao de 180%" ou "Preco ajustado manualmente"
6. **Botoes de arredondamento** — "↓ Arredondar" (floor) e "↑ Arredondar" (ceil) para o .90 mais proximo
7. **Cards Markup e Margem** (lado a lado)
   - Markup: percentual sobre o custo, cor dourada (#C8A24C), Cormorant Garamond 34px
   - Margem: percentual sobre a venda, cor verde (#8FA98A), Cormorant Garamond 34px
8. **Lucro por unidade** — calculado: preco - custo
9. **Quantidade em estoque** — input numerico
10. **Botao "Salvar produto"** — gradiente dourado, navega para Estoque

**Logica de arredondamento .90:**
```
floor90(v) = Math.floor(v - 0.90 + 1e-9) + 0.90
ceil90(v)  = Math.ceil(v - 0.90 - 1e-9) + 0.90
round90(v) = (v - floor90(v)) <= (ceil90(v) - v) ? floor90(v) : ceil90(v)
```

**Logica de preco sugerido:**
- Quando custo muda e priceAuto = true: `preco = round90(custo * (1 + defaultMarkup / 100))`
- defaultMarkup inicial = 180%

**Criterios de Aceite:**
- [ ] Ao digitar custo, preco de venda e calculado automaticamente com markup padrao + arredondamento .90
- [ ] Editar preco manualmente desativa o calculo automatico (priceAuto = false)
- [ ] Botao "↓ Arredondar" arredonda para o .90 inferior
- [ ] Botao "↑ Arredondar" arredonda para o .90 superior
- [ ] Markup calculado: (preco - custo) / custo * 100
- [ ] Margem calculada: (preco - custo) / preco * 100
- [ ] Lucro por unidade: preco - custo
- [ ] Valores exibem "—" quando custo ou preco sao 0
- [ ] Hint muda entre "Sugerido pelo markup padrao" e "Preco ajustado manualmente"
- [ ] Categoria selecionavel por chips (mutuamente exclusiva)
- [ ] Bottom nav NAO aparece nesta tela
- [ ] Botao voltar navega para Estoque

---

### Tela 8: Clientes

**Rota:** `/clientes`
**Descricao:** Lista de clientes com tags especiais (VIP, Aniversario) e informacoes de ultima compra.

**Elementos:**

1. **Header**
   - Titulo "Clientes" + "128 cadastrados"
   - Botao "+" (gradiente dourado, 44x44)

2. **Lista de clientes**
   - Avatar circular com iniciais (fundo gradiente escuro, borda dourada, texto dourado)
   - Nome (15px bold)
   - Tag opcional:
     - "ANIVERSARIO": fundo dourado translucido (rgba(200,162,76,.16)), texto #d9b869
     - "VIP": fundo verde translucido (rgba(143,169,138,.16)), texto #8FA98A
   - Info: "Ult. compra DD/MM · R$ total"
   - Chevron direita

**Criterios de Aceite:**
- [ ] Lista exibe os 5 clientes mock
- [ ] Tags exibidas corretamente para Mariana (ANIVERSARIO) e Patricia (VIP)
- [ ] Clientes sem tag nao exibem badge
- [ ] Iniciais extraidas dos 2 primeiros nomes
- [ ] Total formatado com R$ e virgula
- [ ] Bottom nav com tab "Clientes" ativo

---

### Tela 9: Avisos

**Rota:** `/avisos`
**Descricao:** Notificacoes organizadas por tipo (Estoque, Sophia IA, Cliente).

**Elementos:**

1. **Header**
   - Botao voltar → navega para Dashboard
   - Titulo "Avisos" (Cormorant Garamond 28px)

2. **Lista de avisos**
   - Dot colorido por tipo:
     - Estoque: #D07C67 (laranja/vermelho)
     - Sophia IA: #C8A24C (dourado)
     - Cliente: #8FA98A (verde)
   - Label do tipo em uppercase (10px, letter-spacing 1.2px, cor do dot)
   - Texto do aviso (14px, line-height 1.5)
   - Timestamp (12px, #A79B88)

**Criterios de Aceite:**
- [ ] 4 avisos mock exibidos
- [ ] Cor do dot e do label correspondem ao tipo
- [ ] Botao voltar navega para Dashboard
- [ ] Bottom nav visivel

---

### Tela 10: Promocoes

**Rota:** `/promos`
**Descricao:** Promocoes sugeridas pela Sophia IA com acoes de publicar, editar e enviar.

**Secoes:**

1. **Header**
   - Botao voltar → navega para Dashboard
   - Titulo "Promocoes" (Cormorant Garamond 28px)

2. **Card Sophia intro**
   - Fundo com gradiente e borda dourada
   - Dot pulsante (glow) + texto: "A Sophia montou 3 promocoes pra voce..."

3. **Promo 1: Combo Olhar Marcante**
   - Subtitulo: "Paleta + Mascara + Delineador"
   - Badge: "GIRAR ESTOQUE" (fundo dourado translucido, texto dourado)
   - Preco: R$ 179,90 (Cormorant Garamond 26px) | ~~R$ 204,70~~ (riscado) | "economia R$ 24,80" (verde)
   - Botoes: "Publicar" (gradiente dourado) + "Editar" (fundo escuro)

4. **Promo 2: Leve 2, ganhe 15%**
   - Subtitulo: "Toda a linha de Labios"
   - Badge: "TICKET MEDIO" (fundo verde translucido, texto verde)
   - Botoes: "Publicar" + "Editar"

5. **Promo 3: Cupom aniversario**
   - Subtitulo: "20% para Mariana Alves"
   - Badge: "FIDELIZAR" (fundo vermelho translucido, texto #D07C67)
   - Botao unico: "Enviar por WhatsApp" (gradiente dourado, full width)

**Criterios de Aceite:**
- [ ] 3 cards de promocao exibidos
- [ ] Badges com cores distintas por tipo de promocao
- [ ] Preco original riscado com text-decoration line-through
- [ ] Economia calculada e exibida em verde
- [ ] Dot da Sophia pulsa com animacao glow
- [ ] Botoes presentes mas sem acao real (mock)

---

### Tela 11: Configuracoes

**Rota:** `/config`
**Descricao:** Perfil do salao, toggles de notificacao, markup padrao e configuracoes da loja.

**Secoes:**

1. **Titulo** "Configuracoes" (Cormorant Garamond 28px)

2. **Card perfil**
   - Avatar "PG" (54x54, Cormorant Garamond 24px, borda dourada)
   - "Studio Bell PG · Make"
   - "Bruna · Plano Pro"
   - Chevron direita

3. **Notificacoes** (label uppercase)
   - 4 toggles em card unico:
     - Sugestoes de promocao (ON por padrao)
     - Alertas de estoque baixo (ON por padrao)
     - Aniversarios de clientes (ON por padrao)
     - Resumo diario por e-mail (OFF por padrao)
   - Toggle: 46x27px, border-radius 20px
     - ON: gradiente dourado, knob a direita
     - OFF: fundo cinza translucido, knob a esquerda
   - Separador entre itens

4. **Precificacao** (label uppercase)
   - "Markup padrao" + "Aplicado ao cadastrar produtos"
   - Controles -/+ com valor central (Cormorant Garamond 24px, dourado)
   - Incremento/decremento de 10 em 10 (min 0%, max 500%)
   - Exemplo live: "Custo R$ 20,00 → venda R$ XX,90" (recalculado com round90)

5. **Loja** (label uppercase)
   - "Formas de pagamento" → "Pix, Cartao →"
   - "Categorias de produto" → "4 →"
   - "Backup de dados" → "Sincronizado" (verde)

6. **Botao "Sair da conta"**
   - Borda vermelha translucida (rgba(208,124,103,.3)), texto #D07C67
   - Navega para Login

**Criterios de Aceite:**
- [ ] Toggles funcionam (flip visual + estado persistido durante a sessao)
- [ ] Markup padrao ajustavel com botoes +/- (incremento de 10)
- [ ] Exemplo de markup recalculado live com arredondamento .90
- [ ] Limites: min 0%, max 500%
- [ ] Botao "Sair da conta" navega para Login
- [ ] Bottom nav com tab "Ajustes" ativo

---

### Overlay: Client Picker (Bottom Sheet)

**Ativacao:** Botao "Selecionar cliente" no checkout
**Tipo:** Bottom sheet com backdrop blur

**Elementos:**

1. **Handle** — barra 40x4px centralizada no topo
2. **Header** — "Cliente" + botao "Fechar"
3. **Botao "Cadastrar novo cliente"** — icone + texto, fundo dourado translucido, borda dourada
4. **Form novo cliente** (toggle, expandido ao clicar)
   - Input "Nome completo"
   - Input "Telefone (WhatsApp)" com inputmode tel
   - Botao "Salvar e selecionar" (gradiente dourado)
5. **Busca** — input com lupa, placeholder "Buscar cliente..."
6. **Lista de clientes** — scrollavel, cada item com avatar + nome + ultima compra
   - Clicar em um cliente: seleciona, fecha o picker

**Criterios de Aceite:**
- [ ] Backdrop com blur 3px e fundo semi-transparente
- [ ] Clicar no backdrop fecha o picker
- [ ] Form de novo cliente toggle (mostra/esconde)
- [ ] Salvar novo cliente: adiciona ao inicio da lista, seleciona, fecha picker
- [ ] Busca filtra clientes por nome
- [ ] Selecionar cliente atualiza o checkout
- [ ] Max-height 78% da tela

---

### Overlay: Venda Registrada

**Ativacao:** Confirmar venda no checkout (com cliente + pagamento + itens)
**Tipo:** Fullscreen overlay com backdrop blur

**Elementos:**
- Icone check em circulo verde (88x88, animacao pop 0.4s)
- Titulo "Venda registrada" (Cormorant Garamond 28px)
- Valor total (Cormorant Garamond 34px, dourado)
- Info: "Cliente · nome" + "Pagamento · forma"
- Botao "Nova venda" (fundo escuro) → navega para Nova Venda (carrinho limpo)
- Botao "Voltar ao inicio" (texto simples) → navega para Dashboard

**Criterios de Aceite:**
- [ ] Overlay cobre toda a tela com blur 4px
- [ ] Animacoes fadeup + pop ao aparecer
- [ ] Nome do cliente e forma de pagamento exibidos corretamente
- [ ] Carrinho e limpo apos confirmar
- [ ] Cliente e pagamento resetados
- [ ] Nova venda registrada adicionada ao array de vendas (aparece no historico)
- [ ] Botao "Nova venda" leva ao step de produtos com carrinho vazio
- [ ] Botao "Voltar ao inicio" leva ao Dashboard

---

### Bottom Navigation

**Visibilidade:** Todas as telas exceto Login e Novo Produto.
**Posicao:** Absolute, bottom 0, height 74px, z-index 35.
**Fundo:** rgba(18,14,10,.92) com backdrop-filter blur 16px.

**Tabs:**

| Tab | Label | Telas associadas | Icone |
|-----|-------|-----------------|-------|
| Inicio | Inicio | Dashboard | Casa (home) |
| Vendas | Vendas | Nova Venda, Historico | Sacola (shopping bag) |
| Estoque | Estoque | Estoque, Novo Produto | Cubo 3D (package) |
| Clientes | Clientes | Clientes | Pessoas (users) |
| Ajustes | Ajustes | Configuracoes | Engrenagem (settings) |

**Logica de ativacao:**
- Tab ativo: cor #C8A24C (dourado)
- Tab inativo: cor #7c7264
- Mapeamento: home → Inicio, vendas/historico → Vendas, estoque/produto → Estoque, clientes → Clientes, config → Ajustes

---

## Design System

### Cores

| Token | Hex | Uso |
|-------|-----|-----|
| bg-app | #16120E | Fundo principal do app |
| bg-device | #050403 | Fundo do frame do dispositivo |
| bg-card | #221C15 | Cards, inputs, containers |
| bg-card-hover | #2A2219 | Cards em hover, botoes secundarios |
| bg-elevated | linear-gradient(150deg, #2a2116, #201a12) | Cards destacados (vendas hoje, total, perfil) |
| gold-primary | #C8A24C | Cor principal de acento (icones ativos, textos destaque) |
| gold-light | #d9b869 | Textos dourados claros, links, badges ativos |
| gold-gradient | linear-gradient(135deg, #d6b25c, #b78d3d) | Botoes primarios, avatar, badge quantidade |
| gold-translucent | rgba(200,162,76,.14/.16/.18) | Fundos de icones, chips ativos, bordas |
| text-primary | #F1EBDF | Texto principal (titulos, nomes, valores) |
| text-secondary | #A79B88 | Texto secundario (labels, subtitulos, datas) |
| text-muted | #7c7264 | Texto desabilitado, timestamps, tabs inativos |
| green | #8FA98A | Positivo (margem, crescimento, VIP, estoque ok) |
| red | #D07C67 | Alerta (estoque baixo, aviso estoque, sair) |
| border-subtle | rgba(233,220,198,.08/.10) | Bordas de cards e inputs |
| border-gold | rgba(200,162,76,.18/.3/.4/.45) | Bordas de elementos dourados |
| border-red | rgba(208,124,103,.22/.3) | Bordas de alerta |

### Tipografia

| Elemento | Font | Weight | Size | Extras |
|----------|------|--------|------|--------|
| Titulos de tela | Cormorant Garamond | 500 | 28px | — |
| Titulo checkout | Cormorant Garamond | 500 | 26px | — |
| Valores grandes (vendas hoje) | Cormorant Garamond | 600 | 42px | — |
| Valores medios (markup/margem) | Cormorant Garamond | 600 | 34px | — |
| Valores (total checkout, historico) | Cormorant Garamond | 600 | 28px/24px | — |
| Logo "PG" | Cormorant Garamond | 600 | 32px | letter-spacing 1px |
| Subtitulos de app | Jost | 300 | 13px | letter-spacing 2px, uppercase |
| Body text | Jost | 400 | 14-15px | line-height 1.5 |
| Labels | Jost | 400 | 11px | letter-spacing 1.2px, uppercase |
| Preco em cards | Jost | 600 | 14-16px | — |
| Tab labels | Jost | 400 | 10px | letter-spacing .3px |
| Badges/tags | Jost | 500 | 10-11px | letter-spacing .5-1px |

**Fontes:** Google Fonts — `Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500` e `Jost:wght@300;400;500;600`

### Espacamento e Layout

| Propriedade | Valor |
|-------------|-------|
| Padding lateral do conteudo | 20px |
| Gap entre cards | 12px |
| Gap entre secoes | 12-24px |
| Border-radius cards | 14-16px |
| Border-radius cards grandes | 18-20px |
| Border-radius inputs | 12px |
| Border-radius botoes primarios | 14px |
| Border-radius chips | 20px |
| Border-radius tiles de produto | 10-11px |
| Border-radius avatares | 50% (circulares) |
| Padding interno de cards | 12-16px |
| Padding interno de inputs | 14px 16px |
| Padding bottom do conteudo | 110px (com nav) / 40px (sem nav) |

### Tiles de Produto (por categoria)

| Categoria | Background gradient | Cor do texto |
|-----------|-------------------|--------------|
| Labios | linear-gradient(135deg, #d98a8a, #b25f6a) | #16120E |
| Olhos | linear-gradient(135deg, #b9a0d0, #8a72a8) | #16120E |
| Rosto | linear-gradient(135deg, #e0c39a, #c79a63) | #16120E |
| Fallback | linear-gradient(135deg, #c8a24c, #b78d3d) | #16120E |

O tile exibe a primeira letra do nome do produto em Cormorant Garamond bold.

### Animacoes

| Nome | Definicao | Uso |
|------|-----------|-----|
| fadeup | opacity 0 → 1 + translateY(8px) → 0, 0.35-0.5s ease | Entrada de telas |
| glow | opacity 0.55 → 1 → 0.55, 2.4s ease infinite | Dot pulsante da Sophia IA |
| pop | scale(0.85) + opacity 0 → scale(1) + opacity 1, 0.2-0.4s ease | Badge de quantidade, check de venda, cart bar |

### Componentes Reutilizaveis

1. **ProductTile** — tile colorido com inicial (tamanho configuravel)
2. **CategoryChips** — lista horizontal de chips selecionaveis
3. **SearchInput** — input com icone de lupa
4. **ToggleSwitch** — switch ON/OFF com gradiente dourado
5. **StockBadge** — pill com cor dinamica (verde/vermelho)
6. **ClientAvatar** — circulo com iniciais e borda dourada
7. **FloatingBar** — barra flutuante com sombra e animacao pop
8. **GoldButton** — botao com gradiente dourado
9. **BackButton** — botao redondo com chevron esquerda
10. **BottomNav** — barra de navegacao inferior com tabs

---

## Mock Data Specification

### Produtos (10 itens)

```typescript
const products = [
  { id: 1,  name: 'Batom Matte Vermelho Rubi',  category: 'Labios', price: 39.90,  cost: 14, stock: 24 },
  { id: 2,  name: 'Base Liquida Segunda Pele',   category: 'Rosto',  price: 79.90,  cost: 32, stock: 12 },
  { id: 3,  name: 'Mascara Volume Extremo',      category: 'Olhos',  price: 49.90,  cost: 18, stock: 3  },
  { id: 4,  name: 'Po Compacto Matte HD',        category: 'Rosto',  price: 54.90,  cost: 22, stock: 18 },
  { id: 5,  name: 'Paleta Nude Sunset',          category: 'Olhos',  price: 119.90, cost: 45, stock: 7  },
  { id: 6,  name: 'Delineador Preto Intenso',    category: 'Olhos',  price: 34.90,  cost: 11, stock: 30 },
  { id: 7,  name: 'Blush Pessego',               category: 'Rosto',  price: 44.90,  cost: 15, stock: 2  },
  { id: 8,  name: 'Gloss Labial Cristal',        category: 'Labios', price: 29.90,  cost: 9,  stock: 21 },
  { id: 9,  name: 'Corretivo Alta Cobertura',    category: 'Rosto',  price: 42.90,  cost: 16, stock: 15 },
  { id: 10, name: 'Iluminador Ouro Rose',        category: 'Rosto',  price: 59.90,  cost: 24, stock: 9  },
];
```

**Categorias existentes:** Labios, Rosto, Olhos
**Filtro visual:** "Todos" + as 3 categorias

### Clientes (5 itens)

```typescript
const clients = [
  { name: 'Mariana Alves',   last: '12/07', total: 340.50, tag: { label: 'ANIVERSARIO', bg: 'rgba(200,162,76,.16)', color: '#d9b869' } },
  { name: 'Patricia Souza',  last: '28/06', total: 512.00, tag: { label: 'VIP',         bg: 'rgba(143,169,138,.16)', color: '#8FA98A' } },
  { name: 'Juliana Costa',   last: '05/07', total: 128.90, tag: null },
  { name: 'Camila Ferreira', last: '19/07', total: 89.90,  tag: null },
  { name: 'Renata Lima',     last: '02/07', total: 210.30, tag: null },
];
```

### Vendas (6 itens)

```typescript
const sales = [
  { id: 1, client: 'Patricia Souza',  payment: 'Pix',               total: 189.70, items: 3, date: 'Hoje',  time: '19:40' },
  { id: 2, client: 'Juliana Costa',   payment: 'Cartao de credito',  total: 74.80,  items: 2, date: 'Hoje',  time: '18:12' },
  { id: 3, client: 'Camila Ferreira', payment: 'Dinheiro',           total: 39.90,  items: 1, date: 'Hoje',  time: '16:55' },
  { id: 4, client: 'Mariana Alves',   payment: 'Cartao de debito',   total: 116.20, items: 2, date: 'Hoje',  time: '15:03' },
  { id: 5, client: 'Renata Lima',     payment: 'Pix',               total: 210.30, items: 4, date: 'Ontem', time: '20:10' },
  { id: 6, client: 'Consumidor final',payment: 'Dinheiro',           total: 29.90,  items: 1, date: 'Ontem', time: '17:22' },
];
```

**Calculo "Vendas de hoje":** filtrar por `date === 'Hoje'`, somar totals = R$ 420,60, count = 4
**Ticket medio:** R$ 52,58 (mock fixo no prototipo; pode ser calculado dinamicamente)

### Avisos (4 itens)

```typescript
const avisos = [
  { kind: 'Estoque',      dot: '#D07C67', text: 'Blush Pessego com apenas 2 unidades. Reponha antes do fim de semana.',       when: 'ha 20 min' },
  { kind: 'Estoque',      dot: '#D07C67', text: 'Mascara Volume Extremo abaixo do minimo (3 un.).',                           when: 'ha 2 h'    },
  { kind: 'Sophia · IA',  dot: '#C8A24C', text: 'Paleta Nude Sunset sem vendas ha 21 dias. Sugeri um combo para girar o estoque.', when: 'hoje'  },
  { kind: 'Cliente',      dot: '#8FA98A', text: 'Mariana Alves faz aniversario em 3 dias. Envie um cupom de fidelidade.',     when: 'hoje'      },
];
```

### Toggles de Configuracao

```typescript
const toggleDefaults = {
  promos:  true,   // Sugestoes de promocao
  estoque: true,   // Alertas de estoque baixo
  aniv:    true,   // Aniversarios de clientes
  resumo:  false,  // Resumo diario por e-mail
};
```

### Promocoes (3 itens — dados fixos no HTML)

| Promo | Titulo | Subtitulo | Badge | Preco | Preco original | Economia | Acoes |
|-------|--------|-----------|-------|-------|---------------|----------|-------|
| 1 | Combo Olhar Marcante | Paleta + Mascara + Delineador | GIRAR ESTOQUE (dourado) | R$ 179,90 | R$ 204,70 | R$ 24,80 | Publicar, Editar |
| 2 | Leve 2, ganhe 15% | Toda a linha de Labios | TICKET MEDIO (verde) | — | — | — | Publicar, Editar |
| 3 | Cupom aniversario | 20% para Mariana Alves | FIDELIZAR (vermelho) | — | — | — | Enviar por WhatsApp |

---

## Logica de Negocio

### Arredondamento .90

Todos os precos sugeridos terminam em .90. Tres funcoes:

- **floor90(v):** Arredonda para baixo ate o .90 mais proximo abaixo de v
- **ceil90(v):** Arredonda para cima ate o .90 mais proximo acima de v
- **round90(v):** Arredonda para o .90 mais proximo (distancia minima)

Implementacao:
```typescript
function floor90(v: number): number {
  return Math.floor(v - 0.90 + 1e-9) + 0.90;
}
function ceil90(v: number): number {
  return Math.ceil(v - 0.90 - 1e-9) + 0.90;
}
function round90(v: number): number {
  const d = floor90(v);
  const u = ceil90(v);
  return (v - d) <= (u - v) ? d : u;
}
```

### Markup e Margem

- **Markup** = (preco - custo) / custo * 100 (percentual sobre o custo)
- **Margem** = (preco - custo) / preco * 100 (percentual sobre a venda)
- **Lucro unitario** = preco - custo

### Preco sugerido automatico

Quando o usuario digita o custo e o campo preco esta no modo automatico:
```
preco = round90(custo * (1 + defaultMarkup / 100))
```
O defaultMarkup padrao e 180% e pode ser ajustado na tela de Configuracoes.

### Estoque baixo

Threshold: stock <= 5
- Badge na tela de Estoque: fundo vermelho translucido, texto #D07C67
- Secao no Dashboard: lista produtos abaixo do threshold
- Avisos: notificacoes automaticas

### Formatacao de valores

```typescript
function formatCurrency(n: number): string {
  return 'R$ ' + n.toFixed(2).replace('.', ',');
}
```

### Iniciais de nome

```typescript
function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
```

### Forma de pagamento (abreviacao)

```typescript
function shortPayment(p: string): string {
  if (p === 'Cartao de credito') return 'Credito';
  if (p === 'Cartao de debito') return 'Debito';
  return p;
}
```

---

## Navegacao e Routing

### Mapa de rotas

| Rota | Tela | Bottom Nav | Tab ativo |
|------|------|-----------|-----------|
| `/login` | Login | Oculto | — |
| `/` | Dashboard | Visivel | Inicio |
| `/vendas` | Nova Venda (step 1 ou 2) | Visivel | Vendas |
| `/historico` | Historico de Vendas | Visivel | Vendas |
| `/estoque` | Estoque | Visivel | Estoque |
| `/produto` | Novo Produto | Oculto | — |
| `/clientes` | Clientes | Visivel | Clientes |
| `/avisos` | Avisos | Visivel | — |
| `/promos` | Promocoes | Visivel | — |
| `/config` | Configuracoes | Visivel | Ajustes |

### Fluxo de navegacao

```
Login
  └→ Dashboard
       ├→ Nova Venda (step 1: Produtos)
       │    ├→ Historico (botao relogio)
       │    └→ Checkout (step 2 via cart bar)
       │         ├→ Client Picker (bottom sheet)
       │         │    └→ Selecionar/Cadastrar → volta ao checkout
       │         └→ Confirmar → Overlay "Venda registrada"
       │              ├→ Nova venda (limpa carrinho)
       │              └→ Dashboard
       ├→ Novo Produto → Estoque (ao salvar)
       ├→ Promocoes
       ├→ Clientes
       ├→ Avisos (via botao sino)
       └→ Estoque → Novo Produto (botao +)

Configuracoes
  └→ Sair → Login
```

### Estado global (session state)

O estado e mantido em memoria durante a sessao (nao persiste entre reloads):

```typescript
interface AppState {
  screen: 'login' | 'home' | 'vendas' | 'historico' | 'estoque' | 'produto' | 'clientes' | 'avisos' | 'promos' | 'config';
  cart: Record<number, number>;        // productId → quantity
  q: string;                            // search query (produtos e estoque)
  cat: string;                          // categoria ativa ('Todos' | 'Labios' | 'Rosto' | 'Olhos')
  saleStep: 'produtos' | 'checkout';
  viewMode: 'lista' | 'grade';
  saleClient: Client | null;
  payment: string | null;
  clientPickerOpen: boolean;
  newClientForm: boolean;
  clientQuery: string;
  newClient: { name: string; phone: string };
  saleDone: boolean;
  lastTotal: number;
  lastClient: Client | null;
  lastPayment: string;
  prod: {
    name: string;
    cat: string;
    cost: string;
    price: string;
    stock: string;
    priceAuto: boolean;
  };
  defaultMarkup: number;               // percentual, default 180
  toggles: {
    promos: boolean;
    estoque: boolean;
    aniv: boolean;
    resumo: boolean;
  };
  sales: Sale[];                        // array mutavel (novas vendas adicionadas no inicio)
}
```

---

## Requisitos Nao-Funcionais

- **Performance:** Transicoes de tela em < 300ms. Sem spinners necessarios (tudo local/mock).
- **Responsividade:** Mobile-first. Viewport target 392x812 (iPhone-like). Deve funcionar em qualquer tela >= 320px de largura.
- **Acessibilidade:** Contraste minimo AA nos textos primarios sobre fundo escuro. Inputs com labels associados.
- **Animacoes:** Todas as animacoes CSS-only (fadeup, glow, pop). Respeitar prefers-reduced-motion.

---

## Fora do Escopo (esta versao)

| Item | Motivo |
|------|--------|
| Autenticacao real (Supabase Auth, JWT) | Fase de validacao de UX — login e apenas navegacao visual |
| Backend / Supabase | Dados mock hardcoded — sem persistencia real |
| APIs externas | Nenhuma integracao nesta fase |
| Push notifications | Avisos sao mock estilizados, nao notificacoes reais |
| Sophia IA real | Sugestoes sao mock — nao ha processamento de IA |
| WhatsApp integration | Botao "Enviar por WhatsApp" e visual, sem acao real |
| Edicao/exclusao de produto | Apenas cadastro (novo produto) |
| Edicao/exclusao de cliente | Apenas cadastro (via client picker) |
| Detalhes de venda (drill-down) | Lista do historico sem drill-down |
| Relatorios e graficos | Apenas cards de resumo |
| Multi-usuario / RBAC | Single user (Bruna) |
| Persistencia entre sessoes | Estado em memoria, perdido ao recarregar |
| Internacionalizacao | UI fixa em pt-BR |
| PWA / instalacao | Web app simples, sem service worker |
| Testes automatizados | Serao definidos pelo QA na fase de implementacao |

---

## Suposicoes e Restricoes

### Suposicoes
- A Bruna representa o perfil tipico de dona de salao de beleza que usa celular como principal ferramenta de trabalho
- O fluxo de venda presencial (cliente presente no salao) e o caso de uso principal
- 3 categorias de produto (Labios, Rosto, Olhos) sao suficientes para validar o MVP
- Markup padrao de 180% e um valor razoavel para o mercado de cosmeticos/make

### Restricoes
- Stack definida: Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + React Router
- Codigo em ingles, interface em portugues (pt-BR)
- Dados mock hardcoded — sem chamadas de rede
- Sem backend, sem banco de dados

---

## Historico de Versoes

| Versao | Data | Mudanca |
|--------|------|---------|
| 1.0 | 2026-07-20 | Versao inicial baseada no prototipo Claude Design |
