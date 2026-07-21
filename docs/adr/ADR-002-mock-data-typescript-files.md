# ADR-002: Mock Data em Arquivos TypeScript Separados

## Status: Accepted

## Contexto

O MVP nao tem backend. Todos os dados sao locais e vivem em memoria durante a sessao. Precisamos decidir como estruturar esses dados mock.

## Decisao

Criar arquivos TypeScript em `src/data/` com arrays tipados para cada entidade (products, clients, sales, alerts, promos). Os arrays sao copiados para o estado dos Contexts na inicializacao, permitindo mutacao (adicionar produto, cliente, venda) sem afetar os dados originais.

## Alternativas descartadas

- **JSON files**: Perde tipagem TypeScript nativa. Exige type assertion no import.
- **Inline nos Contexts**: Mistura dados com logica de estado. Dificulta localizar e editar os dados mock.
- **MSW (Mock Service Worker)**: Simula chamadas HTTP, mas o app nao tem chamadas HTTP. Adiciona complexidade sem beneficio.

## Consequencias

- **Positivo**: Tipagem forte em tempo de compilacao. Intellisense nos editores.
- **Positivo**: Facil de localizar e editar dados mock (uma pasta, um arquivo por entidade).
- **Positivo**: Quando o backend for implementado, basta substituir os imports nos Contexts por chamadas reais (TanStack Query) — os componentes nao mudam.
- **Negativo**: Dados perdidos ao recarregar a pagina. Aceitavel para esta fase de validacao.
