# PHD Studio V3 — Relatório Fase 05B.2A

**Typography Foundation**  
**Versão:** 1.0  
**Data:** Junho de 2026  
**Status:** Infraestrutura tipográfica DDS implementada — migração visual pendente (05B.2B)

---

## Resumo executivo

A Fase 05B.2A entrega a **fundação tipográfica completa** do PHD Engineering Design System: famílias semânticas, tokens centralizados, escala responsiva, utilitários opt-in, font-features e estratégia de carregamento. **Nenhum componente da Landing foi migrado** — a UI continua renderizando Montserrat/Inter via classes legadas (`font-heading`, `font-sans`).

`npm run typecheck` e `npm run build` passam sem erros.

---

## Arquivos criados

| Arquivo | Função |
|---|---|
| `src/dds/tokens/font-families.ts` | Papéis Display/Heading/Body/Label/Mono, fallbacks, estratégia font-display |
| `src/dds/tokens/font-features.ts` | OpenType: ligatures, tabular/lining nums, kerning, data features |
| `src/dds/tokens/type-scale.ts` | Escala estática + responsiva (mapa semântico por token) |
| `src/dds/styles/fonts.css` | Classes opt-in de font-features |
| `src/dds/styles/typography-scale.css` | Overrides responsivos `--phd-type-r-*` (desktop / tablet / mobile) |
| `src/dds/styles/typography.css` | Utilitários `.phd-type-*` e cores hierárquicas |
| `src/dds/utils/typography.ts` | Helpers: `typeClass`, `typeRoleClass`, `typeStyleProps` |
| `src/dds/utils/typography-variants.ts` | Presets `createVariants` para escala, papel e peso |
| `src/dds/typography/index.ts` | API pública do módulo tipografia |
| `src/dds/audit/TYPOGRAPHY_INVENTORY.md` | Inventário tipográfico da Landing (auditoria ETAPA 1) |

---

## Arquivos modificados

| Arquivo | Justificativa |
|---|---|
| `src/dds/tokens/typography.ts` | Consolidação da API tipográfica (roles, responsive, features) |
| `src/dds/tokens/index.ts` | Export dos novos tokens |
| `src/dds/styles/variables.css` | Famílias com fallback stack, papéis semânticos, tracking body/caption/mono, font-features |
| `src/dds/styles/index.css` | Import da cadeia tipográfica (scale → fonts → utilities) |
| `src/dds/tailwind/extend.js` | `font-phd-heading/label/legacy`, `text-phd-r-*` responsivos |
| `src/dds/utils/index.ts` | Export dos helpers tipográficos |
| `src/dds/index.ts` | `DDS_PHASE = '05B.2A'`, export `./typography` |
| `index.html` | Carregamento Michroma + JetBrains Mono + preload stylesheet (legado Montserrat/Inter preservado) |

**Não modificados (conforme restrição):** `App.tsx`, Hero, Navbar, Footer, Button, Card, Input, SectionTitle, layouts, textos.

---

## Estratégia tipográfica

### Famílias

| Papel DDS | Token CSS | Família ativa (infra) | Legado Landing (inalterado) |
|---|---|---|---|
| **Display** | `--phd-font-role-display` | Michroma | Montserrat via `font-heading` |
| **Heading** | `--phd-font-role-heading` | Michroma | Montserrat via `font-heading` |
| **Body** | `--phd-font-role-body` | Inter | Inter via `font-sans` |
| **Label** | `--phd-font-role-label` | Inter | Inter + uppercase ad-hoc |
| **Mono** | `--phd-font-role-mono` | JetBrains Mono → IBM Plex Mono | `font-mono` sistema |
| **Legacy bridge** | `--phd-font-display-legacy` | Montserrat | Usado por `font-phd-legacy` / `font-heading` |

### Fallbacks

```text
Sans:  system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif
Mono:  ui-monospace, 'Cascadia Code', 'Segoe UI Mono', monospace
```

### Carregamento

- **Provedor:** Google Fonts com `display=swap` (FOIT evitado)
- **Preload:** `as="style"` no bundle de fontes crítico
- **Famílias no bundle:** Inter (300–800), Montserrat (400–900), Michroma, JetBrains Mono (400, 500)
- **Pesos DDS oficiais:** 400, 500, 600, 700 — pesos 300/800/900 mantidos apenas para legado
- **Self-host:** documentado como otimização futura (subsetting + cache longo)

### Performance

| Métrica | Observação |
|---|---|
| **Arquivos de fonte** | +2 famílias (Michroma, JetBrains Mono) — carregadas mas não aplicadas à Landing |
| **CSS bundle** | +~3 KB gzip (utilitários `.phd-type-*` opt-in) |
| **CLS** | `font-display: swap` + fallbacks system-ui; escala em `rem` evita saltos entre breakpoints |
| **LCP** | Preload do stylesheet de fontes; Michroma/JetBrains não bloqueiam hero (hero usa Montserrat já em cache) |
| **Otimização futura** | Remover Inter 300 e Montserrat 900 após migração 05B.2B; self-host subset latin |

---

## Tokens implementados

### Famílias e papéis

- `--phd-font-fallback-sans`, `--phd-font-fallback-mono`
- `--phd-font-display-wide`, `--phd-font-display-legacy`, `--phd-font-body-family`, `--phd-font-mono-family`
- `--phd-font-role-display|heading|body|label|mono`
- `--phd-font-display-strategy-display|body|mono` → `swap`

### Escala estática (desktop base)

| Token | Size | Leading | Tracking | Weight |
|---|---|---|---|---|
| `display-xl` | 4rem | 1.1 | +0.04em | 700 |
| `display` | 3rem | 1.1 | +0.04em | 700 |
| `heading-1` | 2rem | 1.2 | +0.02em | 600 |
| `heading-2` | 1.5rem | 1.3 | +0.02em | 600 |
| `heading-3` | 1.25rem | 1.3 | +0.01em | 600 |
| `title` | 1.125rem | 1.4 | 0 | 500 |
| `body` / `body-lg` | 1rem | 1.5 | 0 | 400 |
| `body-sm` | 0.875rem | 1.5 | 0 | 400 |
| `caption` | 0.75rem | 1.4 | +0.02em | 400 |
| `label` | 0.75rem | 1.0 | +0.06em | 500, uppercase |
| `mono` | 0.875rem | 1.4 | 0 | 500, tabular |
| `mono-lg` | 1.5rem | 1.2 | -0.01em | 500, tabular |

### Escala responsiva (`--phd-type-r-*`)

| Breakpoint | Comportamento |
|---|---|
| **Desktop** (≥1280px) | Valores base |
| **Tablet** (<1280px) | -1 nível hierárquico (ex.: display-xl → display) |
| **Mobile** (<768px) | -2 níveis (ex.: display-xl → heading-1) |

### Font features

| Token | Features |
|---|---|
| `--phd-font-features-body` | kern, liga |
| `--phd-font-features-display` | kern, liga, calt |
| `--phd-font-features-mono` | kern, liga, calt |
| `--phd-font-features-data` | tnum, lnum, kern |
| `--phd-font-variant-numeric-tabular` | tabular-nums lining-nums |

### Utilitários CSS (opt-in)

`.phd-type-display-xl`, `.phd-type-display`, `.phd-type-heading-1/2/3`, `.phd-type-title`, `.phd-type-body`, `.phd-type-body-lg`, `.phd-type-body-sm`, `.phd-type-caption`, `.phd-type-label`, `.phd-type-mono`, `.phd-type-mono-lg`, `.phd-type-color-*`, `.phd-type-prose`, `.phd-font-features-*`

### Tailwind DDS

`font-phd-display|heading|body|label|mono|legacy`, `text-phd-*`, `text-phd-r-*`, `font-phd-regular|medium|semibold|bold`

### Helpers TypeScript

`typeClass()`, `typeRoleClass()`, `typeStyleProps()`, `typeScaleVariants`, `typeRoleVariants`, `typeWeightVariants`

---

## Auditoria — estado tipográfico atual da Landing

Resumo completo em `src/dds/audit/TYPOGRAPHY_INVENTORY.md`.

| Dimensão | Estado |
|---|---|
| Família dominante títulos | Montserrat 900 (`font-black` + `font-heading`) |
| Família corpo | Inter (300–600) |
| Escala | Tailwind ad-hoc (`text-3xl` … `text-8xl`, valores arbitrários) |
| Hierarquia de cor | `text-gray-*` (~100+ ocorrências) |
| Anti-patterns DDS | Gradiente em texto (Hero), `tracking-tight`, `font-light`, peso 900 |
| Adoção tokens DDS | 0% nos componentes (esperado nesta fase) |
| Regressão visual | Nenhuma — componentes não alterados |

---

## Compatibilidade (ETAPA 8)

| Critério | Status |
|---|---|
| Nenhuma página mudou visualmente | ✅ |
| Nenhuma seção migrada | ✅ |
| Nenhuma classe antiga removida | ✅ (`font-heading`, `font-sans` intactos) |
| Nenhum componente alterado | ✅ |
| Infraestrutura apenas preparatória | ✅ |

---

## Pendências — Fase 05B.2B (Typography Migration)

1. **Componentes CES-005–009:** `Display`, `Heading`, `Body`, `Mono`, `Label`
2. **SectionHeader:** substituir `SectionTitle` em `App.tsx`
3. **Migração Landing:** ~250+ ocorrências `font-heading` / `text-gray-*` / escala ad-hoc → tokens
4. **Hero:** remover gradiente texto; aplicar `type-display-xl` + accent sólido
5. **Pesos:** eliminar `font-black` (900) → `font-phd-bold` (700); remover `font-light`
6. **Limpeza fontes:** remover Inter 300 e Montserrat 900 do bundle após migração
7. **Self-host opcional:** Michroma + JetBrains subset latin em `public/fonts/`
8. **Storybook / página de referência** tipográfica para QA visual

---

## Aprovação

**A infraestrutura tipográfica do DDS está pronta para iniciar a migração visual da Landing?**

✅ **Sim**

Não há bloqueadores. Tokens, escala responsiva, utilitários, font-features e carregamento de fontes estão implementados e validados por typecheck/build. A migração de componentes permanece exclusivamente na Fase 05B.2B.

---

**PHD Studio V3 · DDS Fase 05B.2A**  
*Typography Foundation — concluída*
