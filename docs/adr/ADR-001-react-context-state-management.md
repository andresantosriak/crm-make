# ADR-001: React Context para State Management

## Status: Accepted

## Contexto

O CRM Studio Belle tem 3 areas de estado compartilhado: carrinho de vendas (entre step 1 e step 2), dados mutaveis (products, clients, sales que crescem durante a sessao) e configuracoes (markup padrao, toggles). Precisamos decidir como gerenciar esse estado.

## Decisao

Usar React Context com 3 providers focados: CartContext, DataContext e SettingsContext. Cada um com seu hook de acesso (useCart, useData, useSettings).

## Alternativas descartadas

- **Zustand**: Overhead desnecessario. O app tem ~10 telas, sem server state, sem cache, sem middleware. Context resolve sem dependencia extra.
- **Redux Toolkit**: Ainda mais overhead que Zustand. Boilerplate de slices, actions e reducers nao se justifica para um app com 3 areas de estado.
- **useState no componente pai**: Causaria prop drilling em 3+ niveis (AppShell -> Page -> Component), tornando o codigo fragil e verboso.

## Consequencias

- **Positivo**: Zero dependencias extras, menor bundle, padrao nativo do React que toda a equipe conhece.
- **Positivo**: Cada context e independente — mudar o carrinho nao re-renderiza componentes que so usam settings.
- **Negativo**: Se o app crescer significativamente (50+ telas, estado complexo com selectors), pode precisar migrar para Zustand. Nesta fase de MVP com mock data, esse cenario e improvavel.
