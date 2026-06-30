# PHD Studio V3 — Relatório Fase 05B.2B.2

**SectionHeader Migration**  
**Versão:** 1.0  
**Data:** Junho de 2026  
**Status:** CES-020 implementado — primeira migração tipográfica DDS na Landing

---

## Resumo executivo

Implementado o componente `SectionHeader` (CES-020) por composição exclusiva de `Heading`, `Body` e `Label`. Migrados os dois `SectionTitle` ativos na Home (`ProblemSection`, `ContentGrowthPillarsSection`). Hero, Navbar, Footer, Cards, CTAs, formulário, Creative e Vídeos permanecem inalterados.

`npm run typecheck` e `npm run build` passam.

---

## Componente implementado

| Arquivo | CES | ID |
|---|---|---|
| `src/dds/components/layout/SectionHeader.tsx` | CES-020 | `phd-layout-section-header` |
| `src/dds/components/layout/index.ts` | — | Barrel export |

Exportado em `src/dds/index.ts` — `DDS_PHASE = '05B.2B.2'`.

---

## Arquitetura do SectionHeader

```
SectionHeader (wrapper layout)
├── SectionHeader.Eyebrow  →  Label (CES-009)
├── SectionHeader.Title    →  Heading level={2} (CES-006)
└── SectionHeader.Description  →  Body muted (CES-007)
```

- **Contexto React** (`SectionHeaderContext`) propaga `align` e `titleId` opcional aos slots compostos.
- **Tipografia:** zero regras locais — nenhuma classe `font-heading`, `font-black`, `font-sans`, `tracking-tight` ou `text-gray-*`.
- **Espaçamento:** `mb-phd-stack-lg` no wrapper (CES-020 §10); `Heading` com `spacing="default"` (`mb-phd-stack-sm` entre título e descrição); `Label` com `spacing="default"` (`mb-phd-stack-xs` antes do título quando eyebrow presente).
- **Alinhamento:** `align="center"` aplica `text-center` no wrapper e `max-w-phd-narrow mx-auto` na descrição (720px, CES-020 §6).
- **A11y:** `SectionHeader.Title` aceita `id`; `Section` pai usa `labelledBy` para `aria-labelledby`.

---

## API pública

### Root — `SectionHeader`

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `align` | `'left' \| 'center'` | `'left'` | Alinhamento do bloco |
| `titleId` | `string` | — | ID padrão do título (alternativa a `id` no slot Title) |
| `className` | `string` | — | Classes de layout adicionais |
| `ref` | `HTMLDivElement` | — | forwardRef |

### Slots compostos

| Slot | Componente DDS | Props herdadas |
|---|---|---|
| `SectionHeader.Eyebrow` | `Label` | `spacing`, `tone`, `htmlFor`, etc. |
| `SectionHeader.Title` | `Heading` | `spacing`, `scale`, `className`, `id` (level fixo em 2) |
| `SectionHeader.Description` | `Body` | `muted` default `true`, `size`, `className` |

### Exemplo (API preferida — composição)

```tsx
<Section id="como-crescimento" labelledBy="como-crescimento-heading">
  <SectionHeader align="center">
    <SectionHeader.Eyebrow>Método</SectionHeader.Eyebrow>
    <SectionHeader.Title id="como-crescimento-heading">
      Como a PHD Studio transforma conteúdo em crescimento.
    </SectionHeader.Title>
    <SectionHeader.Description>
      Sistema proprietário baseado em Marketing + IA + Tecnologia.
    </SectionHeader.Description>
  </SectionHeader>
</Section>
```

### Composição vs props

**Escolha: composição.**

Não há impedimento técnico para API por props. O padrão composto foi adotado porque:

1. Alinha com CES-020 (anatomia explícita: Eyebrow → Heading → Body).
2. Permite omitir slots opcionais sem props condicionais.
3. Mantém flexibilidade (`id`, `className`, `scale` no Title) sem duplicar tipografia no root.
4. Valida o modelo de composição DDS para fases subsequentes (Hero, Landing em lote).

---

## Seções migradas

| Seção | Arquivo | Antes | Depois |
|---|---|---|---|
| Problema | `App.tsx` → `ProblemSection` | `<SectionTitle title="O problema real…" />` | `<SectionHeader>` + `<SectionHeader.Title id="problema-heading">` |
| Pilares de crescimento | `App.tsx` → `ContentGrowthPillarsSection` | `<SectionTitle title="Como transformamos…" centered />` | `<SectionHeader align="center">` + `<SectionHeader.Title id="como-crescimento-heading">` |

**Nota:** O [Typography Migration Plan](./PHD_TYPOGRAPHY_MIGRATION_PLAN.md) previa 3 `SectionTitle` ativos; na Home atual existem apenas **2** usos de `SectionTitle` (Problema e Pilares). Seções com títulos próprios (Creative, Vídeos, Insights, Contato) não utilizam `SectionTitle` e ficam fora do escopo desta fase.

`SectionTitle` legado permanece em `App.tsx` para rotas/seções inativas (Método, Cases, FAQ, etc.) — não migradas nesta fase.

---

## Componentes DDS reutilizados

| Componente | Uso no SectionHeader | Duplicação de lógica |
|---|---|---|
| `Heading` | `SectionHeader.Title` — `level={2}`, escala `heading-1` via token | Nenhuma |
| `Body` | `SectionHeader.Description` — `muted`, tom tertiary | Nenhuma |
| `Label` | `SectionHeader.Eyebrow` — caps e tracking via token | Nenhuma |

Confirmado: nenhuma classe tipográfica legada dentro de `SectionHeader.tsx`.

---

## Compatibilidade

| Área | Status |
|---|---|
| Hero (`StrategicHero`) | Inalterado |
| Navbar | Inalterada |
| Footer | Inalterado |
| Cards (h3/p dentro das seções) | Inalterados |
| CTAs | Inalterados |
| Formulário de contato | Inalterado |
| `CreativeSpotlightSection` | Inalterado |
| `StrategicContentVideoSection` | Inalterado |
| `PhdInsightsInstitutionalSection` | Inalterado |
| Display, Heading, Body, Mono, Label (fontes) | Inalterados |
| CSS legado fora do escopo | Inalterado |

---

## Qualidade

| Critério | Status |
|---|---|
| forwardRef (root + slots) | OK |
| Tipagem TypeScript exportada | OK |
| Barrel exports (`layout/index.ts`, `dds/index.ts`) | OK |
| Imports circulares | Nenhum detectado (layout → typography, sem retorno) |
| `aria-labelledby` nas seções migradas | OK (`labelledBy` + `id` no Title) |
| Hierarquia de headings | h2 nas seções migradas; h3 nos cards preservados |

---

## Build

```text
npm run typecheck  →  exit 0
npm run build      →  exit 0 (vite build em ~6.7s)
```

---

## Aprovação

**O SectionHeader tornou-se o padrão oficial de cabeçalhos da PHD Studio V3 e valida a arquitetura tipográfica do DDS para as próximas migrações?**

✅ **Sim**

O componente compõe exclusivamente `Heading`, `Body` e `Label` sem exceções tipográficas, substitui `SectionTitle` nas seções ativas previstas e confirma que a infraestrutura da Fase 05B.2B.1 é suficiente para componentes de layout compostos.

---

*Referências: [CES-020](./PHD_Component_Engineering_Specifications.md), [EDD](./PHD_Engineering_Design_System.md), [Typography Migration Plan](./PHD_TYPOGRAPHY_MIGRATION_PLAN.md), [Relatório 05B.2B.1](./PHD_DDS_PHASE_05B2B1_REPORT.md)*
