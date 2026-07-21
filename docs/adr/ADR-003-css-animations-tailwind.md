# ADR-003: Animacoes CSS via Tailwind @keyframes

## Status: Accepted

## Contexto

O prototipo define 3 animacoes: fadeup (entrada de telas), glow (dot pulsante da Sophia IA) e pop (badge de quantidade, cart bar, check de venda). Precisamos decidir como implementa-las.

## Decisao

Definir as 3 animacoes como `@keyframes` no Tailwind config (`tailwind.config.ts`) e usar via classes utilitarias: `animate-fadeup`, `animate-glow`, `animate-pop`.

## Alternativas descartadas

- **Framer Motion**: Dependencia de ~30KB+ (gzipped). As animacoes do app sao simples (opacity + transform). Framer Motion se justifica para gestos, drag, layout animations — nenhum desses existe aqui.
- **CSS Modules / arquivo CSS separado**: Funciona, mas perde a integracao com Tailwind. Ter as animacoes no config permite usar junto com `motion-reduce:` para acessibilidade.
- **React Spring**: Mesma justificativa de Framer Motion — overhead desproporcional para 3 animacoes CSS simples.

## Consequencias

- **Positivo**: Zero dependencias extras. Animacoes rodam em GPU (transform + opacity).
- **Positivo**: `prefers-reduced-motion` tratavel via Tailwind `motion-reduce:animate-none`.
- **Negativo**: Se futuras versoes precisarem de animacoes interativas (drag, spring, gestures), sera necessario adicionar uma lib de animacao.
