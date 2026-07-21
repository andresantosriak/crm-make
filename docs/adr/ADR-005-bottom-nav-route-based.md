# ADR-005: BottomNav Controlado pela Rota via AppShell

## Status: Accepted

## Contexto

O BottomNav deve ser visivel em todas as telas exceto Login e Novo Produto. A tab ativa depende da rota atual. Precisamos decidir onde vive essa logica.

## Decisao

O `AppShell` e um layout wrapper que renderiza `<Outlet />` + `<BottomNav />`. As rotas que mostram o nav ficam aninhadas no AppShell. O BottomNav le a rota atual via `useLocation()` para determinar a tab ativa e se deve se renderizar.

A rota `/login` fica fora do AppShell (sem BottomNav). A rota `/produto` fica dentro do AppShell mas o BottomNav verifica a rota e se oculta quando a rota esta na lista `HIDDEN_NAV_ROUTES`.

## Alternativas descartadas

- **Prop `showNav` passada por cada pagina**: Prop drilling desnecessario. A decisao de mostrar ou nao o nav depende da rota, que ja esta disponivel via hook.
- **BottomNav em todas as paginas individualmente**: Duplicacao. Violar DRY sem motivo.

## Consequencias

- **Positivo**: BottomNav e declarado uma unica vez no AppShell. Adicionar/remover telas do nav e uma mudanca em `HIDDEN_NAV_ROUTES`.
- **Positivo**: O mapeamento rota -> tab ativa e centralizado no BottomNav.
- **Negativo**: Nenhum significativo.
