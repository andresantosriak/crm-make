# ADR-004: NewSalePage Gerencia Steps Internamente

## Status: Accepted

## Contexto

A tela de Nova Venda tem 2 passos: selecao de produtos (step 1) e checkout (step 2). Ambos compartilham o mesmo carrinho. Precisamos decidir se sao rotas separadas ou estados internos.

## Decisao

Um unico componente `NewSalePage` na rota `/vendas` gerencia o step via estado local. O step alterna entre `'produtos'` e `'checkout'` sem mudar a URL.

## Alternativas descartadas

- **Sub-rotas (`/vendas/produtos` e `/vendas/checkout`)**: Adiciona complexidade de routing sem beneficio. O usuario nao precisa de deep link para o checkout — ele chega la pelo fluxo natural. Alem disso, o botao "voltar" do browser causaria navegacao inesperada se fossem rotas separadas.
- **Query parameter (`/vendas?step=checkout`)**: Possivel, mas adiciona parsing desnecessario. O step e efemero e nao precisa ser compartilhavel via URL.

## Consequencias

- **Positivo**: Transicao entre steps e instantanea (sem re-mount da pagina).
- **Positivo**: O carrinho vive naturalmente no escopo da pagina + CartContext, sem risco de perda entre navegacoes.
- **Negativo**: O botao de voltar do browser nao navega entre steps. Aceitavel — o app tem botao de voltar proprio no header.
