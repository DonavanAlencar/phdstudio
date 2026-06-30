# PHD Studio V3 — Component Engineering Specifications (CES)

**Fase 04 · Ponte DDS → Implementação**  
**Versão:** 1.0  
**Data:** Junho de 2026  
**Status:** Especificação técnica — pré-codificação

---

> O CES transforma o [DDS](./PHD_Engineering_Design_System.md) em instruções de engenharia executáveis. **Nenhum componente será codificado sem passar por esta especificação.**

**Referências obrigatórias:**
- [DDL](./PHD_Digital_Design_Language.md)
- [DDS](./PHD_Engineering_Design_System.md)
- [Auditoria de Conformidade](./PHD_Landing_Page_DDS_Compliance_Audit.md)

---

## Índice

1. [Governança do CES](#governança-do-ces)
2. [Convenções globais](#convenções-globais)
3. [Foundation](#foundation)
4. [Typography](#typography)
5. [Actions](#actions)
6. [Forms](#forms)
7. [Layout](#layout)
8. [Content](#content)
9. [Navigation](#navigation)
10. [Feedback](#feedback)
11. [Matriz de implementação](#matriz-de-implementação)

---

# Governança do CES

## Missão

Documentar **como implementar** cada componente da Landing Page V3 sem que o desenvolvedor tome decisões de design.

## Protocolo por componente

Antes de codificar, validar:

1. Especificação CES completa (20 seções)
2. Tokens DDS referenciados existem ou serão criados na Fase 05
3. Anti-padrões da auditoria mapeados
4. Critérios de aceite verificáveis

## Escopo

- **Incluído:** 30 componentes/patterns listados no briefing
- **Excluído:** Código, alteração de `App.tsx`, mudança de arquitetura/copy da Landing

## Identificador de componente

Formato: `phd-{categoria}-{nome}` (ex: `phd-action-button-primary`)

---

# Convenções globais

Aplicam-se a **todos** os componentes salvo exceção documentada.

| Convenção | Especificação | Origem |
|---|---|---|
| Unidade base | `phdu-base` = 8px | DDS §1.1 |
| Luz primária | Superior-esquerda, 45° | DDL Cap. 5 |
| Focus ring | `glow-focus` — branco 10%, 2px, offset 2px | DDS §6.2, §9.2 |
| Hover estrutural | Elevação de sombra, **sem** `translate` | DDS §6.3 |
| Press | `scale-press` = 0.98 | DDS §1.9 |
| Disabled | `opacity-disabled` (25%), sem sombra/hover | DDS §6.5 |
| Cantos estruturais | Chanfro 60° (`radius-chamfer-*`) | DDL Cap. 3 |
| Cantos tipográficos | Squircle (`radius-squircle-sm`) | DDL wordmark STUDIO |
| Texto hierárquico | Opacidade de branco, nunca `gray-*` Tailwind | DDS §1.7 |
| CTA accent por viewport | Máximo 1 `Button Primary` / `CTA Button` visível | DDL Princípio 05 |
| `prefers-reduced-motion` | Durações → instant; glow mantido | DDS §7.8 |

---

# Foundation

---

## CES-001 — Surface

**ID:** `phd-foundation-surface`

### 1. Objetivo

Wrapper primitivo que aplica **material DDS**, elevação e geometria chanfrada a qualquer bloco de interface.

### 2. Papel na interface

Camada estrutural base sobre obsidiana. Todo card, painel e container elevado é uma `Surface` ou composição dela.

### 3. Relação com a DDL

- **Princípio 11** — Materialidade digital crível
- **Cap. 4** — Superfícies como materiais físicos
- **Ambigrama** — corpo sólido do símbolo → grafite

### 4. Relação com o DDS

- Material System §2.2 Grafite (variante padrão)
- Component Philosophy §4.4 — classificação por material
- Elevation: níveis 0–3 (DDS §2.2, §1.10)

### 5. Anatomia

```
┌─ highlight-edge (topo/esquerda) ─────────────┐
│ ┌─ chanfro 60° ──────────────────────────┐ │
│ │  SLOT (children)                        │ │
│ └─────────────────────────────────────────┘ │
│ ▓▓ shadow-contact (base-direita) ▓▓▓▓▓▓▓▓▓▓ │
└────────────────────────────────────────────┘
```

| Parte | Obrigatório |
|---|---|
| Container | Sim |
| Highlight edge | Sim (grafite/metal) |
| Shadow layer | Conforme elevação |
| Children slot | Sim |

### 6. Geometria

| Propriedade | Valor |
|---|---|
| Forma | Retângulo chanfrado |
| Chanfro | `radius-chamfer-md` (8px / 60°) padrão |
| Variante compacta | `radius-chamfer-sm` (4px) |
| Variante hero | `radius-chamfer-lg` (12px) |
| Proporção | Livre; filhos definem altura |

### 7. Material

| Variante | Token | Elevação | Sombra |
|---|---|---|---|
| `obsidian` | `surface-obsidian` | 0 | `shadow-none` |
| `graphite` | `surface-graphite-deep` | 1 | `shadow-contact` |
| `graphite-raised` | `surface-graphite-raised` | 1+ | `shadow-raised` |
| `glass` | `surface-glass-dark` + `blur-md` | 2 | nenhuma (blur) |
| `recessed` | `surface-recessed` | -1 | `shadow-inset` |

**Regra:** `glass` proibido como variant default de cards estáticos (DDS §2.3).

### 8. Tipografia

Surface não define tipografia. Herda do contexto.

### 9. Tokens utilizados

`surface-*`, `shadow-contact`, `shadow-raised`, `shadow-inset`, `highlight-edge`, `radius-chamfer-*`, `border-subtle`

### 10. Espaçamento

Padding interno via prop `padding`: `compact` | `default` | `spacious` → `padding-compact/default/spacious`.

### 11. Hierarquia

| Nível visual | Variant | Contexto |
|---|---|---|
| Fundo | obsidian | Page background |
| Estrutural | graphite | Cards, shells |
| Interativo elevado | graphite-raised | Hover state parent |
| Overlay | glass | Modais, nav scrolled |
| Input area | recessed | Dentro de forms |

### 12. Estados

| Estado | Comportamento |
|---|---|
| Idle | Material base + sombra nível |
| Hover | `overlay-hover` + `shadow-raised` (graphite only) |
| Active | `overlay-active` + `scale-press` no filho interativo |
| Focus | Delegado ao filho focável |
| Disabled | `opacity-disabled`, sombra removida |
| Loading | Skeleton child opcional |
| Error | `border` cor `state-error` |
| Success | Sem alteração de surface |

### 13. Motion

| Transição | Token |
|---|---|
| Hover elevation | `duration-fast`, `ease-default` |
| Press | `duration-instant`, `ease-spring` |

### 14. Acessibilidade

- `role` não imposto; filhos semânticos definem
- Contraste do material não afeta texto (texto em camada superior)
- Focus visível nos filhos interativos

### 15. Responsividade

Material e chanfro **invariantes** em todos os breakpoints. Chanfro 3D bevel desativa se altura < 32px.

### 16. Composição

- Pai: `Section`, `Container`
- Filhos: qualquer conteúdo
- Irmão: `Divider` entre surfaces graphite

### 17. Casos de uso

- Substituir `.strategic-shell` e `.strategic-card` (sem blur)
- Wrapper de seções Problem, Pillars, Video
- Base do `Card`

### 18. Anti-padrões

- `backdrop-blur` em variant graphite estático
- `rounded-2xl` / `rounded-3xl`
- Gradiente de fundo na surface
- Múltiplas sombras empilhadas

### 19. Critérios de aceite

- [ ] Chanfro 60° visível em cantos superiores
- [ ] Sombra deslocada baixo-direita apenas
- [ ] Highlight edge sutil topo/esquerda em graphite
- [ ] Zero blur em cards de conteúdo estático
- [ ] Tokens DDS, zero valores hardcoded

### 20. Notas de migração da Landing

| Atual | Migrar para |
|---|---|
| `.strategic-shell` | `Surface` graphite + `padding-spacious` |
| `.strategic-card` | `Surface` graphite, **remover** `backdrop-filter` |
| `bg-black/40 rounded-2xl shadow-2xl` | `Surface` graphite ou obsidian conforme hierarquia |

**Backlog resolvido:** S1-02, S1-03, S2-02, S2-05

---

## CES-002 — Container

**ID:** `phd-foundation-container`

### 1. Objetivo

Controlar largura máxima, margens horizontais e alinhamento ao grid 12 colunas.

### 2. Papel na interface

Estrutura espacial — define onde o conteúdo respira dentro do viewport.

### 3. Relação com a DDL

- **Cap. 8** — Silêncio estrutural, margens generosas
- **Ambigrama** — campo negro ao redor do símbolo

### 4. Relação com o DDS

- DDS §1.5 Containers
- DDS §3.2 Zonas de layout

### 5. Anatomia

```
│← margin phdu-8 →│  max-width   │← margin phdu-8 →│
│                 ┌──────────────┐                 │
│                 │   children   │                 │
│                 └──────────────┘                 │
```

### 6. Geometria

Sem chanfro. Elemento de layout invisível (sem borda/sombra).

### 7. Material

Transparente — obsidiana do fundo transparece.

### 8. Tipografia

N/A

### 9. Tokens utilizados

`container-wide` (1440px), `container-content` (1120px), `container-narrow` (720px), `container-micro` (480px), `padding-page`

### 10. Espaçamento

| Variant | Max-width | Padding horizontal |
|---|---|---|
| `wide` | 1440px | phdu-8 / phdu-5 / phdu-3 |
| `content` | 1120px | phdu-5 |
| `narrow` | 720px | phdu-5 |
| `micro` | 480px | phdu-3 |

### 11. Hierarquia

Dentro de `Section` → envolve conteúdo → contém `Surface`/`Card`/typography.

### 12. Estados

Estático — sem estados interativos.

### 13. Motion

Nenhum.

### 14. Acessibilidade

Landmark implícito via filho `<main>` / `<section>`.

### 15. Responsividade

| BP | Margin | Max-width |
|---|---|---|
| < md | phdu-3 | 100% |
| md–lg | phdu-5 | 100% |
| ≥ xl | phdu-8 | token variant |

### 16. Composição

- Pai: `Section`
- Filho: grids, `Surface`, patterns

### 17. Casos de uso

- Substituir `container mx-auto px-4` em todas as seções
- `ContactForm` → `container-narrow`
- Hero → `container-wide`

### 18. Anti-padrões

- `px-4` ad-hoc
- Conteúdo edge-to-edge sem margin
- Max-width inconsistente entre seções

### 19. Critérios de aceite

- [ ] Margens seguem `padding-page` por breakpoint
- [ ] Max-width correto por variant
- [ ] Centralização horizontal automática

### 20. Notas de migração

Substituir todas as ocorrências `container mx-auto px-4` por `<Container variant="wide|narrow">`.

**Backlog:** S1-01 (tokens), S2-07 (estrutura)

---

## CES-003 — Divider

**ID:** `phd-foundation-divider`

### 1. Objetivo

Separar módulos com linha estrutural silenciosa ou conector direcional.

### 2. Papel na interface

Ritmo e hierarquia — equivalente à barra do H no ambigrama.

### 3. Relação com a DDL

- **Cap. 3** — Barra diagonal do H como conector
- **Princípio 02** — Interconexão

### 4. Relação com o DDS

- DDS §3.3 Alinhamentos — diagonal apenas para conectores
- Token `border-subtle`, `border-default`

### 5. Anatomia

**Horizontal (padrão):**
```
────────────────────────────  border-subtle 1px
```

**Diagonal (conector):**
```
                    ╱
                   ╱   60° ou ↗
                  ╱
```

### 6. Geometria

| Variant | Ângulo | Espessura |
|---|---|---|
| `horizontal` | 0° | 1px |
| `vertical` | 90° | 1px |
| `diagonal` | 60° ou asc ↗ | 1–2px |

### 7. Material

Linha — sem preenchimento. Cor via token de borda.

### 8. Tipografia

N/A

### 9. Tokens utilizados

`border-subtle` (repouso), `border-default` (ênfase), `accent-*` (conector ativo/IA)

### 10. Espaçamento

Margin vertical: `space-stack-md` mínimo acima e abaixo.

### 11. Hierarquia

Subordinado — nunca compete com conteúdo.

### 12. Estados

| Estado | Visual |
|---|---|
| Idle | `border-subtle` |
| Active (IA connection) | `ai-connection` glow fino |

### 13. Motion

Conector IA: desenho progressivo `duration-normal`.

### 14. Acessibilidade

`role="separator"`, `aria-orientation` horizontal/vertical.

### 15. Responsividade

Horizontal full-width em mobile. Diagonal opcional ocultável < md.

### 16. Composição

Entre cards, abaixo de `SectionHeader`, dentro de `Footer`.

### 17. Casos de uso

- Separador em `Footer` (`border-t border-white/5` → Divider)
- Linha do `Methodology` (gradiente → Divider diagonal accent)

### 18. Anti-padrões

- Gradiente decorativo como divider
- Espessura > 2px sem função
- Divider colorido sem estado IA

### 19. Critérios de aceite

- [ ] 1px, token de borda
- [ ] Diagonal apenas com prop `variant="diagonal"`
- [ ] Espaçamento PHDU

### 20. Notas de migração

Substituir `border-white/10`, gradientes `via-brand-red/50` em Methodology.

**Backlog:** S1-06 (remove gradiente decorativo)

---

## CES-004 — Section

**ID:** `phd-foundation-section`

### 1. Objetivo

Landmark semântico que agrupa conteúdo relacionado com ritmo vertical e densidade de landing.

### 2. Papel na interface

Unidade arquitetural da Landing — cada seção atual (`#problema`, `#contato`) é uma `Section`.

### 3. Relação com a DDL

- **Cap. 8** — Compressão/expansão, vazio ativo
- **Princípio 07** — Silêncio como estrutura

### 4. Relação com o DDS

- DDS §3.6 Densidade — landing: `space-stack-xl`, vazio 40–60%
- DDS §3.5 Composição

### 5. Anatomia

```
<section>                           ← landmark
  └─ overlay obsidiana (opcional)   ← sem gradiente decorativo
  └─ Container
       └─ conteúdo (pattern/cards)
```

### 6. Geometria

Full-width. Sem bordas. `scroll-mt` para âncoras fixas (navbar).

### 7. Material

Fundo: transparência sobre obsidiana global ou `surface-obsidian`. **Proibido** gradiente overlay decorativo (auditoria).

### 8. Tipografia

N/A (delega a `SectionHeader`)

### 9. Tokens utilizados

`space-stack-xl`, `space-stack-2xl`, `padding-spacious`, `surface-obsidian`

### 10. Espaçamento

| Prop | Default landing |
|---|---|
| `paddingY` | `phdu-8` (64px) mobile, `phdu-13` (104px) desktop |
| `gap` | `space-stack-lg` entre blocos internos |
| `scrollMarginTop` | 112px (navbar fixa) |

### 11. Hierarquia

`<main>` → `Section` → `Container` → patterns/components.

### 12. Estados

Estático.

### 13. Motion

Enter: filhos usam `emerge` com `delay-stagger` se `animateOnEnter=true`.

### 14. Acessibilidade

`<section aria-labelledby="...">` com id vinculado ao header.

### 15. Responsividade

Padding Y reduz um nível PHDU em mobile. IDs de âncora preservados.

### 16. Composição

Contém patterns (Hero, Spotlight) ou grids de cards.

### 17. Casos de uso

Wrapper de cada bloco da `HomePage` mantendo `id` existentes.

### 18. Anti-padrões

- `bg-gradient-to-b from-black/80` em toda section
- `py-20` ad-hoc
- Seções coladas sem `space-stack-xl` entre elas

### 19. Critérios de aceite

- [ ] `aria-labelledby` quando há título
- [ ] `scroll-mt` para âncoras
- [ ] Padding PHDU
- [ ] Sem gradiente overlay

### 20. Notas de migração

| Seção atual | `id` preservar |
|---|---|
| ProblemSection | `#problema` |
| ContentGrowthPillarsSection | `#como-crescimento` |
| CreativeSpotlightSection | `#phd-creative-destaque` |
| StrategicContentVideoSection | `#arquitetura-conteudo` |
| PhdInsightsInstitutionalSection | `#insights-crescimento` |
| ContactForm | `#contato` |

**Backlog:** S1-06, S2-07

---

# Typography

> Componentes tipográficos são **wrappers semânticos** que aplicam tokens DDS. Não introduzem cor decorativa.

---

## CES-005 — Display

**ID:** `phd-type-display`

| # | Especificação |
|---|---|
| **1. Objetivo** | Títulos de máximo impacto — hero, landing above-the-fold |
| **2. Papel** | Hierarquia primária; equivalente às hastes verticais do ambigrama (presença) |
| **3. DDL** | Cap. 7 — display wide, tracking generoso; Princípio 06 engenharia tipográfica |
| **4. DDS** | `type-display-xl`, `type-display`; `font-display` |
| **5. Anatomia** | `<h1>` ou `<p role="heading">` → texto + slot opcional para accent inline (cor sólida, não gradiente) |
| **6. Geometria** | Sem container; texto alinhado ao eixo primário (esquerda ou centro em hero) |
| **7. Material** | N/A |
| **8. Tipografia** | `font-display`, weight 700, tracking +0.04em, line-height 1.1 |
| **9. Tokens** | `type-display-xl` (64px), `type-display` (48px), `text-primary` |
| **10. Espaçamento** | Margin-bottom: `space-stack-md`; em hero: `space-stack-lg` antes do body |
| **11. Hierarquia** | Nível 1 — um por viewport em hero |
| **12. Estados** | Idle only; accent word via `<span class="text-accent-brand">` sólido |
| **13. Motion** | Parent `emerge` on hero enter |
| **14. A11y** | Nível heading correto (`h1` único por página); contraste ≥15:1 |
| **15. Responsive** | xl→display, md→heading-1 scale, sm→heading-2 mínimo |
| **16. Composição** | Dentro de `Hero Pattern`; seguido por `Body` |
| **17. Casos de uso** | `StrategicHero` h1 — substituir Montserrat black + gradient text |
| **18. Anti-padrões** | `bg-clip-text bg-gradient`; `font-light`; múltiplos h1 |
| **19. Aceite** | [ ] font-display [ ] sem gradiente [ ] escala responsive [ ] tracking +0.04em |
| **20. Migração** | Trocar `text-transparent bg-clip-text bg-gradient-to-br` por accent sólido ou `text-primary` integral. **Backlog:** S1-05, S1-06 |

---

## CES-006 — Heading

**ID:** `phd-type-heading`

| # | Especificação |
|---|---|
| **1. Objetivo** | Títulos de seção e subseção (h2–h3) |
| **2. Papel** | Estrutura narrativa; módulos repetidos (hexágonos informacionais) |
| **3. DDL** | Cap. 7 — headings com presença, não propaganda |
| **4. DDS** | `type-heading-1` (32px), `type-heading-2` (24px), `type-heading-3` (20px) |
| **5. Anatomia** | `<h2>` / `<h3>` + texto |
| **6. Geometria** | Alinhamento esquerda (padrão) ou centro (`centered` prop) |
| **7. Material** | N/A |
| **8. Tipografia** | `font-display` ou `font-body` semibold 600; tracking +0.02em em h2 |
| **9. Tokens** | `type-heading-*`, `text-primary` |
| **10. Espaçamento** | `margin-bottom: space-stack-sm`; após heading, body com `space-stack-xs` |
| **11. Hierarquia** | h2 > h3 > title; um h2 por `SectionHeader` |
| **12. Estados** | Estático |
| **13. Motion** | `emerge` com section |
| **14. A11y** | Hierarquia semântica sem saltos; `aria-labelledby` na section |
| **15. Responsive** | Downgrade um nível < md (h2→h3 visual) |
| **16. Composição** | `SectionHeader` principal; dentro de `Card` para títulos de card |
| **17. Casos de uso** | Substituir `SectionTitle` (`font-black font-heading`) |
| **18. Anti-padrões** | `font-black` + `tracking-tight` publicitário; caps em blocos longos |
| **19. Aceite** | [ ] tokens type-heading [ ] peso 600 [ ] sem black 900 |
| **20. Migração** | `SectionTitle` → `SectionHeader` usando `Heading`. **Backlog:** S1-05, S2-06 |

---

## CES-007 — Body

**ID:** `phd-type-body`

| # | Especificação |
|---|---|
| **1. Objetivo** | Texto corrido, descrições, parágrafos de apoio |
| **2. Papel** | Informação secundária com legibilidade em dark |
| **3. DDL** | Cap. 7 — corpo eficiente, line-height 1.5 |
| **4. DDS** | `type-body` (16px), `type-body-sm` (14px) |
| **5. Anatomia** | `<p>` ou `<span>` |
| **6. Geometria** | Max-width 65ch em blocos longos |
| **7. Material** | N/A |
| **8. Tipografia** | `font-body`, weight 400, `text-secondary` (70%) padrão |
| **9. Tokens** | `type-body`, `text-secondary`, `text-primary` (ênfase) |
| **10. Espaçamento** | `space-stack-sm` entre parágrafos |
| **11. Hierarquia** | Abaixo de Heading/Display |
| **12. Estados** | `muted` prop → `text-tertiary` |
| **13. Motion** | Nenhum |
| **14. A11y** | Mínimo 16px; line-height ≥1.5; contraste ≥7:1 em secondary |
| **15. Responsive** | `type-body-sm` em mobile opcional |
| **16. Composição** | Após `Heading` em SectionHeader, Card, Hero |
| **17. Casos de uso** | Subtítulos de seção, descrições em cards |
| **18. Anti-padrões** | `text-gray-400` Tailwind; `font-light` |
| **19. Aceite** | [ ] text-secondary token [ ] 16px mínimo [ ] max-width 65ch |
| **20. Migração** | Substituir `text-gray-300/400 font-light`. **Backlog:** S1-05 |

---

## CES-008 — Mono

**ID:** `phd-type-mono`

| # | Especificação |
|---|---|
| **1. Objetivo** | Dados, métricas, valores exatos — precisão de engenharia |
| **2. Papel** | Terminações chanfradas tipográficas (DDL Cap. 7 ritmo) |
| **3. DDL** | Princípio 06 — números sempre monospace |
| **4. DDS** | `type-mono`, `type-mono-lg`, `font-mono` |
| **5. Anatomia** | `<span>` ou `<data>` |
| **6. Geometria** | Tabular nums; align right em contextos métricos |
| **7. Material** | N/A |
| **8. Tipografia** | `font-mono`, weight 500, `text-primary` |
| **9. Tokens** | `type-mono`, `type-mono-lg`, `data-live` (estado ao vivo) |
| **10. Espaçamento** | Inline ou bloco com `space-stack-xs` |
| **11. Hierarquia** | Paralelo a Body para dados; acima de Label |
| **12. Estados** | `live` → `data-live` + `glow-live` sutil |
| **13. Motion** | Valor change: crossfade 200ms, não odometer |
| **14. A11y** | `aria-live="polite"` quando valor atualiza |
| **15. Responsive** | `type-mono-lg` → `type-mono` em mobile |
| **16. Composição** | `Insight Card`, métricas futuras, badges numéricos |
| **17. Casos de uso** | Métricas em cases (quando reativados), KPIs Insights |
| **18. Anti-padrões** | Números em font proporcional; animação odometer |
| **19. Aceite** | [ ] font-mono [ ] tabular nums [ ] sem gradiente |
| **20. Migração** | Cases `text-brand-red font-black` → Mono + cor semântica. **Backlog:** S1-05 |

---

## CES-009 — Label

**ID:** `phd-type-label`

| # | Especificação |
|---|---|
| **1. Objetivo** | Rótulos UI, caps de navegação, metadados, tags textuais |
| **2. Papel** | Estrutura silenciosa — equivalente a divisores tipográficos |
| **3. DDL** | Cap. 7 — tracking +4–6% em caps/labels |
| **4. DDS** | `type-label`, `text-tertiary` ou `text-secondary` |
| **5. Anatomia** | `<label>` (forms) ou `<span>` (UI) |
| **6. Geometria** | Inline ou block; associação `htmlFor` em forms |
| **7. Material** | N/A |
| **8. Tipografia** | `font-body`, weight 500, uppercase, tracking +0.06em, 12px |
| **9. Tokens** | `type-label`, `text-tertiary`, `text-secondary` (nav) |
| **10. Espaçamento** | `space-stack-xs` abaixo quando precede input |
| **11. Hierarquia** | Abaixo de Heading, acima de input/value |
| **12. Estados** | `disabled` → `text-disabled`; `error` → mantém cor, ícone adjacente |
| **13. Motion** | Nenhum |
| **14. A11y** | `<label htmlFor>` obrigatório em forms; nav em `<nav>` |
| **15. Responsive** | Invariante |
| **16. Composição** | `Input`, `Navbar` links, `Badge` texto |
| **17. Casos de uso** | Labels do ContactForm; nav uppercase |
| **18. Anti-padrões** | CAPS em parágrafos; `text-gray-500` |
| **19. Aceite** | [ ] 12px [ ] tracking +0.06em [ ] uppercase só em UI labels |
| **20. Migração** | Form labels `text-sm font-medium text-gray-300`. **Backlog:** S1-05, S2-03 |

---

# Actions

---

## CES-010 — Button Primary

**ID:** `phd-action-button-primary`

| # | Especificação |
|---|---|
| **1. Objetivo** | Ação primária única — CTA de conversão com material Metal Accent |
| **2. Papel** | Único ponto de energia vermelha por viewport (DDL Princípio 05) |
| **3. DDL** | Princípio 05 cor como sinal; Cap. 4 Metal Accent |
| **4. DDS** | Material §2.4 Metal; Component Rules §6; `accent-brand` |
| **5. Anatomia** | `<button>` ou `<a>` → chanfro container → label (`text-inverse`) → slot ícone opcional (esquerda/direita) |
| **6. Geometria** | Chanfro `radius-chamfer-sm`; min-height 48px; padding horizontal `phdu-5` |
| **7. Material** | Metal accent: `accent-brand` + chanfro highlight/sombra + `shadow-accent` |
| **8. Tipografia** | `font-body` semibold 600, `text-inverse`, 16px — **não** uppercase obrigatório |
| **9. Tokens** | `accent-brand`, `accent-brand-hover`, `text-inverse`, `shadow-accent`, `glow-focus` |
| **10. Espaçamento** | Padding: `phdu-3` vertical, `phdu-5` horizontal; ícone gap `space-inline-xs` |
| **11. Hierarquia** | Máximo 1 visível por viewport na landing |
| **12. Estados** | Idle: metal + shadow-accent; Hover: `accent-brand-hover` + luminosity +10%; Focus: `glow-focus`; Pressed: `scale-press`; Loading: spinner hex + disabled; Disabled: `opacity-disabled`, sem chanfro; Error/Success: N/A |
| **13. Motion** | Hover `duration-fast`; press `duration-instant` spring; loading hex-rotate |
| **14. A11y** | Contraste texto ≥15:1; `aria-busy` loading; focus visible |
| **15. Responsive** | Full-width opcional em mobile (`block w-full`) |
| **16. Composição** | Hero (1x), ContactForm submit; **não** duplicar em Footer simultâneo visível |
| **17. Casos de uso** | "Quero um diagnóstico do meu conteúdo" |
| **18. Anti-padrões** | `rounded-lg`; `shadow-lg shadow-brand-red/20` flat; gradiente; múltiplos por viewport |
| **19. Aceite** | [ ] metal chanfro [ ] 1 por viewport [ ] sem rounded-lg [ ] glow-focus |
| **20. Migração** | Hero CTA primário + Form submit; Footer CTA → Secondary ou scroll to #contato. **Backlog:** S1-02, S1-04, S2-01 |

---

## CES-011 — Button Secondary

**ID:** `phd-action-button-secondary`

| # | Especificação |
|---|---|
| **1. Objetivo** | Ação de apoio sem competir com primary — navegação, alternativas |
| **2. Papel** | Grafite estrutural, peso visual menor |
| **3. DDL** | Princípio 05 — vermelho não domina |
| **4. DDS** | Material Grafite §2.2; `surface-graphite-deep`, `border-default` |
| **5. Anatomia** | `<button>` ou `<a>` → surface graphite → label `text-primary` → ícone opcional |
| **6. Geometria** | Chanfro `radius-chamfer-sm`; min-height 48px |
| **7. Material** | Grafite + `border-default` + `shadow-contact` |
| **8. Tipografia** | `font-body` medium 500, `text-primary`, 16px |
| **9. Tokens** | `surface-graphite-deep`, `border-default`, `overlay-hover`, `shadow-contact` |
| **10. Espaçamento** | Igual Primary |
| **11. Hierarquia** | Subordinado ao Primary; pode coexistir no mesmo viewport |
| **12. Estados** | Hover: `overlay-hover` + `shadow-raised`; Focus: `glow-focus`; Pressed: `scale-press`; Disabled: `opacity-disabled`; Loading: spinner monocromático |
| **13. Motion** | Igual Primary |
| **14. A11y** | Igual Primary |
| **15. Responsive** | Full-width em mobile quando paired com Primary |
| **16. Composição** | Ao lado de Primary no Hero ("Ver como funciona") |
| **17. Casos de uso** | `StrategicHero` segundo link; links de portfólio YouTube |
| **18. Anti-padrões** | `border-2 border-white/25` sem token; parecer segundo primary |
| **19. Aceite** | [ ] grafite material [ ] sem vermelho [ ] chanfro |
| **20. Migração** | Hero "Ver como funciona"; YouTube CTA. **Backlog:** S2-01, S1-04 |

---

## CES-012 — Icon Button

**ID:** `phd-action-icon-button`

| # | Especificação |
|---|---|
| **1. Objetivo** | Ação compacta apenas ícone — navegação, fechar, carousel |
| **2. Papel** | Controle tátil mínimo 44×44px |
| **3. DDL** | Cap. 3 iconografia angular 24×24 |
| **4. DDS** | Touch target §9.6; `padding-compact` |
| **5. Anatomia** | `<button>` 44×44 → ícone PHD 24×24 centralizado |
| **6. Geometria** | Chanfro sm ou circular apenas para carousel nav; quadrado chanfrado padrão |
| **7. Material** | Grafite idle; metal accent se ação primária contextual (carousel) |
| **8. Tipografia** | N/A — `aria-label` obrigatório |
| **9. Tokens** | `surface-graphite`, `overlay-hover`, ícone `text-primary` |
| **10. Espaçamento** | Centro geométrico; hit area 44px mínimo |
| **11. Hierarquia** | Subordinado |
| **12. Estados** | Hover overlay; Focus glow; sem translate |
| **13. Motion** | `duration-fast` |
| **14. A11y** | `aria-label` descritivo; 44×44 min |
| **15. Responsive** | Invariante |
| **16. Composição** | Navbar mobile toggle; testimonial arrows (futuro) |
| **17. Casos de uso** | Menu hamburger, carousel prev/next |
| **18. Anti-padrões** | `rounded-full` + `bg-brand-red/80` sem spec; Lucide sem label |
| **19. Aceite** | [ ] 44px [ ] aria-label [ ] ícone 24px angular |
| **20. Migração** | Testimonial arrows, mobile menu. **Backlog:** S3-05, S2-04 |

---

## CES-013 — CTA Button

**ID:** `phd-action-cta-button`

| # | Especificação |
|---|---|
| **1. Objetivo** | Variante semântica de Primary para **conversão final** — formulário e footer |
| **2. Papel** | Mesmo material que Primary mas com regras de posicionamento estritas |
| **3. DDL** | Assinatura visual #3 — accent cirúrgico |
| **4. DDS** | Extends `Button Primary` com `variant="cta"` |
| **4. DDS** | Alias de Primary + props `fullWidth`, `size="lg"` |
| **5. Anatomia** | Idêntico Primary; default `fullWidth=true` em forms |
| **6–11.** | Herda Primary; **regra:** apenas 1 CTA Button ativo no viewport — se Hero tem Primary, Form usa scroll anchor ou Footer usa Secondary |
| **12. Estados** | Herda + Loading no submit |
| **13. Motion** | Herpa + hex spinner on loading |
| **14. A11y** | `type="submit"` em forms; loading `aria-busy` |
| **15. Responsive** | `fullWidth` default mobile |
| **16. Composição** | `ContactForm`; coordenação com Hero CTA |
| **17. Casos de uso** | Submit diagnóstico |
| **18. Anti-padrões** | Múltiplos CTAs vermelhos full-width empilhados na mesma tela |
| **19. Aceite** | [ ] regra 1-accent respeitada [ ] herda metal spec |
| **20. Migração** | Form button + Footer — Footer vira Secondary link #contato. **Backlog:** S1-04, S2-01, S3-06 |

---

# Forms

---

## CES-014 — Input

**ID:** `phd-form-input`

| # | Especificação |
|---|---|
| **1. Objetivo** | Campo de texto single-line com material recesso |
| **2. Papel** | Captura de dados no funil de conversão |
| **3. DDL** | Cap. 4 — área rebaixada; Princípio 11 materialidade |
| **4. DDS** | `surface-recessed`, `shadow-inset`, `radius-squircle-sm` |
| **5. Anatomia** | `Label` → wrapper recesso → `<input>` → mensagem erro opcional |
| **6. Geometria** | Squircle sm (4px); height 48px; width 100% |
| **7. Material** | Recesso: `surface-recessed` + `shadow-inset` |
| **8. Tipografia** | Input: `type-body`, `text-primary`; placeholder: `text-tertiary` |
| **9. Tokens** | `surface-recessed`, `shadow-inset`, `border-default`, `border-strong` (focus), `glow-focus`, `state-error` |
| **10. Espaçamento** | Padding `padding-compact`; label `space-stack-xs` acima |
| **11. Hierarquia** | Subordinado ao form title |
| **12. Estados** | Idle: inset; Hover: `border-strong`; Focus: `glow-focus` (não border-red); Error: `state-error` border + `shake-error`; Disabled: `opacity-disabled`; Success: border `state-success` opcional |
| **13. Motion** | Error shake 2 ciclos; focus instant |
| **14. A11y** | `label`+`id`; `aria-invalid`; `aria-describedby` erro |
| **15. Responsive** | full width |
| **16. Composição** | `ContactForm` |
| **17. Casos de uso** | name, email, phone |
| **18. Anti-padrões** | `bg-brand-gray/40 rounded-lg`; `focus:border-brand-red` |
| **19. Aceite** | [ ] recesso [ ] glow-focus branco [ ] squircle [ ] sem rounded-lg |
| **20. Migração** | Todos inputs ContactForm. **Backlog:** S2-03, S4-05 |

---

## CES-015 — Textarea

**ID:** `phd-form-textarea`

| # | Especificação |
|---|---|
| **1. Objetivo** | Campo multi-line para mensagem opcional |
| **2–4.** | Herda Input — DDL/DDS recesso |
| **5. Anatomia** | Label → `<textarea>` → erro |
| **6. Geometria** | Squircle sm; min-height 120px (15× PHDU); resize vertical only |
| **7–11.** | Herda Input |
| **12. Estados** | Herda Input |
| **13. Motion** | Herda Input |
| **14. A11y** | `aria-invalid`; descrição opcional do campo |
| **15. Responsive** | full width |
| **16. Composição** | ContactForm message field |
| **17. Casos de uso** | Mensagem opcional |
| **18. Anti-padrões** | `resize-none` forçado sem necessidade; mesmos anti-patterns Input |
| **19. Aceite** | [ ] min-height 120px [ ] herda recesso spec |
| **20. Migração** | textarea ContactForm. **Backlog:** S2-03 |

---

## CES-016 — Select

**ID:** `phd-form-select`

| # | Especificação |
|---|---|
| **1. Objetivo** | Seleção única em lista (futuro: qualificação de lead) |
| **2. Papel** | Expansão do form sem quebrar material system |
| **3. DDL** | Princípio 11 — recesso + vidro no dropdown |
| **4. DDS** | Input recesso + dropdown `Surface` glass |
| **5. Anatomia** | Label → trigger (recesso) → chevron angular → listbox glass |
| **6. Geometria** | Trigger igual Input; dropdown chanfro md |
| **7. Material** | Trigger: recesso; List: vidro fumê |
| **8. Tipografia** | `type-body`; options `type-body-sm` |
| **9. Tokens** | Input tokens + `surface-glass-dark`, `blur-md` |
| **10. Espaçamento** | Options `padding-compact` |
| **11. Hierarquia** | Opcional no form |
| **12. Estados** | Open: glass emerge; Selected: `overlay-selected`; Disabled: padrão |
| **13. Motion** | Dropdown `unfold` `duration-fast` |
| **14. A11y** | `listbox`, keyboard arrows, `aria-expanded` |
| **15. Responsive** | Native select fallback mobile se necessário |
| **16. Composição** | ContactForm (fase futura) |
| **17. Casos de uso** | Segmentação de lead pós-MVP |
| **18. Anti-padrões** | Dropdown sem glass; blur no trigger |
| **19. Aceite** | [ ] recesso trigger [ ] glass list apenas |
| **20. Migração** | Não existe hoje — net new. **Backlog:** S2-03 |

---

## CES-017 — Checkbox

**ID:** `phd-form-checkbox`

| # | Especificação |
|---|---|
| **1. Objetivo** | Consentimento LGPD e booleanos |
| **2. Papel** | Compliance legal no form |
| **3. DDL** | Geometria angular — quadrado chanfrado 18×18px |
| **4. DDS** | `surface-recessed` unchecked; `accent-brand` checked |
| **5. Anatomia** | `<input type="checkbox">` visual + label inline |
| **6. Geometria** | 18×18 chanfro 2px; checkmark angular PHD |
| **7. Material** | Recesso → metal accent quando checked |
| **8. Tipografia** | Label: `type-body-sm`, `text-secondary` |
| **9. Tokens** | `accent-brand`, `surface-recessed`, `glow-focus` |
| **10. Espaçamento** | Gap `space-inline-sm` label |
| **11. Hierarquia** | Abaixo dos campos, acima do submit |
| **12. States** | Checked: metal fill + check branco; Focus: glow-focus; Error: border error |
| **13. Motion** | Check `scale` spring `duration-fast` |
| **14. A11y** | Label clicável; `required` |
| **15. Responsive** | Text wraps |
| **16. Composição** | LGPD block ContactForm |
| **17. Casos de uso** | `lgpd-consent` |
| **18. Anti-padrões** | `rounded` default browser; tamanho < 18px |
| **19. Aceite** | [ ] 18px chanfro [ ] check animado [ ] link privacidade |
| **20. Migração** | Checkbox LGPD atual. **Backlog:** S2-03 |

---

# Layout

---

## CES-018 — Hero Pattern

**ID:** `phd-layout-hero-pattern`

| # | Especificação |
|---|---|
| **1. Objetivo** | Composição above-the-fold: proposta de valor + CTA + vazio estrutural |
| **2. Papel** | Primeira impressão — centro de controle, não banner publicitário |
| **3. DDL** | Cap. 8 expansão máxima; Essência; Assinatura visual |
| **4. DDS** | `container-wide`, densidade landing, `space-stack-2xl` |
| **5. Anatomia** | `Section` (min-height 88vh) → `Container wide` → coluna única: `Display` → `Body` (1–2) → action row: `Button Primary` + `Button Secondary` → slot mídia opcional |
| **6. Geometria** | Alinhamento: centro mobile, esquerda desktop (`lg:text-left`); ratio hero 2:3 se mídia |
| **7. Material** | Fundo: obsidiana pura — **sem** radial gradient vermelho |
| **8. Tipografia** | `Display` + `Body`; sem gradient text |
| **9. Tokens** | `space-stack-2xl`, `padding-spacious`, `surface-obsidian` |
| **10. Espaçamento** | Vazio 50%+ viewport; `pt` compensa navbar (112px) |
| **11. Hierarquia** | 1 Display, 1 Primary, 1 Secondary max |
| **12. Estados** | Enter: `emerge` cascata Display→Body→Actions |
| **13. Motion** | `emerge` stagger 60ms; sem parallax |
| **14. A11y** | `h1` único; skip link target |
| **15. Responsive** | Tipografia downscale; CTAs stack vertical mobile |
| **16. Composição** | `Display`, `Body`, `Button Primary/Secondary` |
| **17. Casos de uso** | `StrategicHero` replacement |
| **18. Anti-padrões** | `radial-gradient` vermelho; `drop-shadow` no texto; 2 primaries; vídeo competindo sem hierarquia |
| **19. Aceite** | [ ] 1 primary [ ] sem gradiente [ ] vazio ≥40% [ ] obsidiana pura |
| **20. Migração** | Substituir `StrategicHero` integralmente. **Backlog:** S1-04, S1-05, S1-06, S2-01 |

---

## CES-019 — Spotlight Pattern

**ID:** `phd-layout-spotlight-pattern`

| # | Especificação |
|---|---|
| **1. Objetivo** | Destaque de sub-marca (Creative, Insights) com accent de produto |
| **2. Papel** | Spotlight — um módulo estendido além do grid (haste do ambigrama) |
| **3. DDL** | Sub-marca por cor (DDL Cap. 6); Princípio 05 |
| **4. DDS** | `accent-creative` / `accent-insights`; **sem** purple/amber genéricos Tailwind |
| **5. Anatomia** | `Section` → `Container wide` → `Surface` graphite chanfro lg → grid 2col: content (Label + Heading + Body + CTA Secondary/Primary) + media slot |
| **6. Geometria** | Chanfro lg; accent apenas em Label, ícone container, CTA — não em fundo |
| **7. Material** | Grafite base; accent em elementos pontuais; **proibido** glow 80px colored |
| **8. Tipografia** | `Label` (accent uppercase) + `Heading` + `Body` |
| **9. Tokens** | `accent-creative` ou `accent-insights`; `radius-chamfer-lg` |
| **10. Espaçamento** | `padding-spacious`; `space-stack-lg` entre blocks |
| **11. Hierarquia** | 1 accent de produto por section; vermelho marca em no máximo 1 link |
| **12. Estados** | Media slot: imagem estática; hover media sem scale 110 |
| **13. Motion** | Section `emerge`; sem `translate-y` hover |
| **14. A11y** | `aria-labelledby`; alt em imagens |
| **15. Responsive** | Stack vertical; imagem acima do texto em mobile |
| **16. Composição** | `Insight Card` / `Brand Card` content; `Button Secondary` para link externo |
| **17. Casos de uso** | CreativeSpotlight, PhdInsightsInstitutional |
| **18. Anti-padrões** | `from-purple-950`, `shadow-[0_0_80px purple]`; gradient CTA; ring purple |
| **19. Aceite** | [ ] accent token correto [ ] sem glow decorativo [ ] grafite base |
| **20. Migração** | Rebuild Creative + Insights sections. **Backlog:** S1-06, S3-01, S3-02 |

---

## CES-020 — Section Header

**ID:** `phd-layout-section-header`

| # | Especificação |
|---|---|
| **1. Objetivo** | Cabeçalho padronizado de seção — título + subtítulo opcional |
| **2. Papel** | Substituir `SectionTitle` com tokens DDS |
| **3. DDL** | Cap. 7 ritmo tipográfico — heading + body |
| **4. DDS** | `type-heading-1` + `type-body` |
| **5. Anatomia** | Wrapper → `Heading` h2 → `Body` subtitle opcional |
| **6. Geometria** | `centered` prop: text-align center + max-width 720px |
| **7. Material** | N/A |
| **8. Tipografia** | Heading + Body muted |
| **9. Tokens** | `space-stack-sm` entre title e subtitle; `space-stack-lg` margin-bottom |
| **10. Espaçamento** | `mb`: `space-stack-lg` (substitui `mb-12` ad-hoc) |
| **11. Hierarquia** | Primeiro filho de conteúdo na Section |
| **12. Estados** | Estático |
| **13. Motion** | Com section emerge |
| **14. A11y** | `id` para `aria-labelledby` |
| **15. Responsive** | centered mantém em mobile |
| **16. Composição** | Problem, Pillars, Video sections |
| **17. Casos de uso** | Todas as seções com título |
| **18. Anti-padrões** | `font-black tracking-tight`; subtitle `font-light gray-400` |
| **19. Aceite** | [ ] tokens heading/body [ ] id para a11y |
| **20. Migração** | `SectionTitle` → `SectionHeader`. **Backlog:** S2-06, S1-05 |

---

# Content

---

## CES-021 — Card

**ID:** `phd-content-card`

| # | Especificação |
|---|---|
| **1. Objetivo** | Módulo de conteúdo repetível — unidade hexagonal informacional |
| **2. Papel** | Bloco estrutural P/D do ambigrama |
| **3. DDL** | Princípio 02 interconexão; Cap. 3 módulo hexagonal |
| **4. DDS** | `Surface` variant graphite + Component Rules |
| **5. Anatomia** | `Surface` → slot ícone opcional → `Heading` h3 → `Body` → slot action opcional |
| **6. Geometria** | Chanfro md; ratio ambigram 1:1.5 em grids |
| **7. Material** | Grafite — **nunca** glass em repouso |
| **8. Tipografia** | `type-title` + `type-body-sm` |
| **9. Tokens** | `padding-default`, `shadow-contact`, hover `shadow-raised` |
| **10. Espaçamento** | Gap interno `space-stack-sm` |
| **11. Hierarquia** | Repetido em grid; um pode `featured` com chanfro lg |
| **12. Estados** | Hover: elevação sombra apenas — **sem** translate-y |
| **13. Motion** | `duration-fast` shadow transition |
| **14. A11y** | `<article>`; heading nível adequado |
| **15. Responsive** | 1 col mobile, 3 col desktop em pillars |
| **16. Composição** | Problem section (3 cards), Pillars (3 cards) |
| **17. Casos de uso** | Substituir `strategic-card` |
| **18. Anti-padrões** | `backdrop-blur`; `hover:-translate-y-2`; `rounded-2xl` |
| **19. Aceite** | [ ] Surface graphite [ ] hover shadow only [ ] chanfro |
| **20. Migração** | Problem + Pillars articles. **Backlog:** S1-03, S2-02, S2-05, S4-01 |

---

## CES-022 — Video Card

**ID:** `phd-content-video-card`

| # | Especificação |
|---|---|
| **1. Objetivo** | Container para embed YouTube com descrição |
| **2. Papel** | Prova de execução — portfólio em arquitetura de conteúdo |
| **3. DDL** | Cap. 10 imagens — close de dado, sem stock clichê |
| **4. DDS** | `Card` + aspect ratio video |
| **5. Anatomia** | `Surface` → aspect 16:9 iframe → `Body` description |
| **6. Geometria** | Featured: aspect 21:9 opcional; chanfro md |
| **7. Material** | Grafite sólido — **sem** `backdrop-blur-md` |
| **8. Tipografia** | `type-body` / `type-body-sm` |
| **9. Tokens** | `surface-graphite-deep`, `padding-default` |
| **10. Espaçamento** | Iframe flush top; padding bottom text |
| **11. Hierarquia** | 1 featured + N secondary em grid |
| **12. Estados** | Hover: border `border-accent` sutil — sem translate |
| **13. Motion** | Nenhum no hover |
| **14. A11y** | `title` no iframe; descrição textuais |
| **15. Responsive** | Stack; featured full width |
| **16. Composição** | `StrategicContentVideoSection` |
| **17. Casos de uso** | 4 vídeos estratégicos |
| **18. Anti-padrões** | `backdrop-blur-md`; `hover:-translate-y-0.5`; `border-2` decorative |
| **19. Aceite** | [ ] sem blur [ ] grafite [ ] aspect ratio correto |
| **20. Migração** | FeaturedVideoCard + SecondaryVideoCard. **Backlog:** S3-04, S1-03 |

---

## CES-023 — Brand Card

**ID:** `phd-content-brand-card`

| # | Especificação |
|---|---|
| **1. Objetivo** | Célula de logo institucional no marquee — silenciosa, monocromática |
| **2. Papel** | Prova social sem competir (DDL Cap. 8 silêncio) |
| **3. DDL** | Assinatura obsidiana; Cap. 10 sem stock |
| **4. DDS** | Institutional marquee rules (`index.css` → tokens) |
| **5. Anatomia** | Container fixo height → `<img>` logo monocromático |
| **6. Geometria** | Frame height `phdu-5`–`phdu-8`; width max 15rem |
| **7. Material** | Transparente sobre obsidiana |
| **8. Tipografia** | N/A — `alt=""` decorativo, link `aria-label` |
| **9. Tokens** | Opacity idle 0.34 → hover 0.78; filter monochrome |
| **10. Espaçamento** | `institutional-logo-cell` padding inline phdu |
| **11. Hierarquia** | Subordinado — logos silenciosos |
| **12. Estados** | Hover: opacity only — **sem** drop-shadow vermelho glow |
| **13. Motion** | Opacity `duration-slow` 720ms |
| **14. A11y** | Link com `aria-label` empresa; `prefers-reduced-motion` static wrap |
| **15. Responsive** | Tuning scale per logo opcional |
| **16. Composição** | `InstitutionalBrandsMarquee` track |
| **17. Casos de uso** | 12 logos SVG |
| **18. Anti-padrões** | `drop-shadow red` no hover; logos coloridos |
| **19. Aceite** | [ ] sem glow vermelho hover [ ] opacity tokens [ ] reduced motion |
| **20. Migração** | Refinar CSS existente para tokens; remover glow. **Backlog:** S3-03 |

---

## CES-024 — Insight Card

**ID:** `phd-content-insight-card`

| # | Especificação |
|---|---|
| **1. Objetivo** | Variante de `Spotlight Pattern` para PHD Insights — accent dourado |
| **2. Papel** | Sub-marca Insights com dados e autoridade |
| **3. DDL** | IA por comportamento; accent insights DDL Cap. 6 |
| **4. DDS** | `accent-insights`; Data Language §8.2 métricas futuras |
| **5. Anatomia** | Spotlight + `Label` "Núcleo institucional" + `Heading` + `Body` + `Button Secondary` + media banner |
| **6. Geometria** | Chanfro lg; accent em label border-left opcional |
| **7. Material** | Grafite; accent `accent-insights` pontual; CTA **Secondary** (link blog) — não gradient amber button |
| **8. Tipografia** | `Heading` display scale + `Body` |
| **9. Tokens** | `accent-insights`, `accent-insights-muted` para icon bg |
| **10. Espaçamento** | Spotlight pattern spacing |
| **11. Hierarquia** | Sub-marca — vermelho marca ausente no CTA |
| **12. Estados** | Sem `animate-fade-in-up` com glow box |
| **13. Motion** | `emerge` padrão |
| **14. A11y** | Contraste amber on dark validado |
| **15. Responsive** | Spotlight stack |
| **16. Composição** | `PhdInsightsInstitutionalSection` |
| **17. Casos de uso** | Insights block |
| **18. Anti-padrões** | `bg-gradient-to-r from-amber-600`; `shadow-amber`; `ring-sky` |
| **19. Aceite** | [ ] accent-insights token [ ] secondary CTA [ ] sem gradient button |
| **20. Migração** | Rebuild Insights section. **Backlog:** S3-02, S1-06 |

---

# Navigation

---

## CES-025 — Navbar

**ID:** `phd-nav-navbar`

| # | Especificação |
|---|---|
| **1. Objetivo** | Navegação global fixa com material contextuais |
| **2. Papel** | Haste vertical do ambigrama — eixo estrutural |
| **3. DDL** | Princípio 02; Cap. 8 eixo primário |
| **4. DDS** | Vidro fumê scrolled / transparent idle; DDS §2.3 |
| **5. Anatomia** | `<nav>` → logo → links `Label` → slot `Button Secondary` compact (login) → `Icon Button` mobile |
| **6. Geometria** | Full width; height 64–80px; chanfro não aplicado |
| **7. Material** | Idle: transparente; Scrolled: `surface-glass-dark` + `blur-md` + `border-subtle` bottom |
| **8. Tipografia** | Links: `type-label`, `text-secondary`, hover `text-primary` |
| **9. Tokens** | `surface-glass-dark`, `blur-md`, `border-subtle`, `accent-brand` hover link opcional |
| **10. Espaçamento** | `padding-page` horizontal; gap `space-inline-md` |
| **11. Hierarquia** | Logo + nav + 1 ação login (Secondary compact) |
| **12. Estados** | Scrolled transition `duration-normal`; Mobile open: overlay glass fullscreen |
| **13. Motion** | Background fade `duration-normal`; drawer `slide-right` |
| **14. A11y** | `aria-expanded` menu; focus trap mobile; skip link |
| **15. Responsive** | Links hidden < md; drawer `Icon Button` |
| **16. Composição** | `Label`, `Icon Button`, `Button Secondary` |
| **17. Casos de uso** | Navbar global |
| **18. Anti-padrões** | `bg-red-600` login button; `rounded-lg`; `hover:text-brand-red` em todos links |
| **19. Aceite** | [ ] glass só scrolled [ ] login secondary [ ] glow-focus links |
| **20. Migração** | Navbar App.tsx. **Backlog:** S2-04, S1-04 (login não primary) |

---

## CES-026 — Footer

**ID:** `phd-nav-footer`

| # | Especificação |
|---|---|
| **1. Objetivo** | Encerramento institucional + CTA secundário |
| **2. Papel** | Silêncio estrutural com ação final |
| **3. DDL** | Cap. 8; copy sistema de crescimento |
| **4. DDS** | Grafite card + Divider |
| **5. Anatomia** | `<footer>` → `Container` → row: brand col (logo + `Body`) + `Surface` CTA col → `Divider` → legal row |
| **6. Geometria** | Chanfro md no CTA surface |
| **7. Material** | Footer bg obsidiana; CTA block: graphite |
| **8. Tipografia** | `Body` muted; CTA title `type-title` |
| **9. Tokens** | `surface-graphite-deep`, `border-subtle`, `text-tertiary` legal |
| **10. Espaçamento** | `padding-spacious` top; `space-stack-xl` |
| **11. Hierarquia** | CTA Footer = `Button Secondary` link #contato — **não** segundo Primary |
| **12. Estados** | Link hovers opacity |
| **13. Motion** | Nenhum |
| **14. A11y** | `nav` social com labels; legal links |
| **15. Responsive** | Stack columns mobile |
| **16. Composição** | `Divider`, `Body`, `Button Secondary` |
| **17. Casos de uso** | Footer global |
| **18. Anti-padrões** | Segundo `bg-brand-red` CTA full; `text-gray-600` |
| **19. Aceite** | [ ] CTA secondary [ ] tokens texto [ ] divider |
| **20. Migração** | Footer — trocar primary por secondary scroll. **Backlog:** S1-04, S3-06 |

---

# Feedback

---

## CES-027 — Badge

**ID:** `phd-feedback-badge`

| # | Especificação |
|---|---|
| **1. Objetivo** | Rótulo compacto de status ou categoria |
| **2. Papel** | Sinal cromático pontual |
| **3. DDL** | Princípio 05 — cor como sinal |
| **4. DDS** | Chanfro sm ou circular; `accent-*-muted` bg |
| **5. Anatomia** | `<span>` → texto `type-label` |
| **6. Geometria** | Height 24px; padding horizontal phdu-2; chanfro sm |
| **7. Material** | Flat muted accent ou graphite |
| **8. Tipografia** | `type-label`, uppercase |
| **9. Tokens** | `accent-brand-muted`, `state-*-muted` |
| **10. Espaçamento** | Inline |
| **11. Hierarquia** | Mínima |
| **12. States** | Variants: brand, creative, insights, success, warning |
| **13. Motion** | Nenhum |
| **14. A11y** | `aria-label` se só cor |
| **15. Responsive** | Invariante |
| **16. Composição** | Video cards, cases futuros |
| **17. Casos de uso** | "CASE SUCESSO" → `Badge` brand |
| **18. Anti-padrões** | `rounded-full` pill genérico sem spec |
| **19. Aceite** | [ ] chanfro sm [ ] muted bg |
| **20. Migração** | Cases badge quando reativado. **Backlog:** S1-02 |

---

## CES-028 — Status

**ID:** `phd-feedback-status`

| # | Especificação |
|---|---|
| **1. Objetivo** | Indicador dot + label para estados live/idle |
| **2. Papel** | Feedback funcional mínimo |
| **3. DDL** | Cap. 5 glow funcional em dados ao vivo |
| **4. DDS** | `Status` §8.5 — dot 8px + label |
| **5. Anatomia** | dot circle 8px + `Label` text |
| **6. Geometria** | Dot circular (exceção contenção DDS) 8px |
| **7. Material** | Dot: accent solid; live: `glow-live` |
| **8. Tipografia** | `type-label` |
| **9. Tokens** | `data-live`, `state-success`, `text-tertiary` |
| **10. Espaçamento** | Gap `space-inline-xs` |
| **11. Hierarquia** | Inline metadata |
| **12. States** | live, idle, success, error |
| **13. Motion** | Live: glow pulse subtle 2s |
| **14. A11y** | `aria-live` quando live |
| **15. Responsive** | Invariante |
| **16. Composição** | Form feedback, métricas |
| **17. Casos de uso** | Substituir pulse dot hero "MARKETING + TECNOLOGIA" |
| **18. Anti-padrões** | `animate-pulse` dot decorativo sem status |
| **19. Aceite** | [ ] 8px dot [ ] glow só live |
| **20. Migração** | Hero badge opcional. **Backlog:** S1-06 |

---

## CES-029 — Toast

**ID:** `phd-feedback-toast`

| # | Especificação |
|---|---|
| **1. Objetivo** | Notificação temporária pós-ação (form success/error) |
| **2. Papel** | Feedback não bloqueante — substituir banners inline gradiente |
| **3. DDL** | Princípio 04 — sem glow decorativo |
| **4. DDS** | `Surface` glass + `Toast` inventory |
| **5. Anatomia** | `Surface` glass → icon status → `Body` message → dismiss `Icon Button` |
| **6. Geometria** | Chanfro md; max-width 400px |
| **7. Material** | Vidro fumê — toast é overlay transitório |
| **8. Tipografia** | `type-body-sm` |
| **9. Tokens** | `surface-glass-dark`, `blur-md`, `state-success` / `state-error` border-left 3px chanfro |
| **10. Espaçamento** | `padding-compact` |
| **11. Hierarquia** | Acima de conteúdo z-50 |
| **12. States** | success, error, info; auto-dismiss 5s |
| **13. Motion** | Enter `slide-right`; exit recede |
| **14. A11y** | `role="alert"`; `aria-live="assertive"` |
| **15. Responsive** | Bottom center mobile |
| **16. Composição** | ContactForm submit result |
| **17. Casos de uso** | Substituir success/error gradient blocks |
| **18. Anti-padrões** | `animate-pulse` `animate-bounce` gradient boxes |
| **19. Aceite** | [ ] glass toast [ ] sem bounce [ ] auto dismiss |
| **20. Migração** | Form feedback blocks → Toast. **Backlog:** S4-02, S1-06 |

---

## CES-030 — Loading

**ID:** `phd-feedback-loading`

| # | Especificação |
|---|---|
| **1. Objetivo** | Indicador de processamento — hex rotate PHD |
| **2. Papel** | Linguagem de IA/motion DDL Cap. 9 |
| **3. DDL** | Rotação hexagonal 360° contínuo |
| **4. DDS** | `hex-rotate` `duration-continuous` linear |
| **5. Anatomia** | SVG hex outline 24×24 → opcional `Body` "Enviando..." |
| **6. Geometria** | Hex grid PHD icon 24×24 |
| **7. Material** | Stroke `accent-brand` ou `text-primary` |
| **8. Tipografia** | `type-body-sm` opcional |
| **9. Tokens** | `accent-brand`, `duration-continuous`, `ease-linear` |
| **10. Espaçamento** | Centro do botão ou inline |
| **11. Hierarquia** | Substitui conteúdo do botão em loading |
| **12. States** | loading only |
| **13. Motion** | rotate 360 linear infinite; reduced motion: static hex + opacity pulse mínimo |
| **14. A11y** | `aria-busy="true"`; `aria-label` carregando |
| **15. Responsive** | Invariante |
| **16. Composição** | `Button Primary`, `CTA Button` |
| **17. Casos de uso** | Form submit |
| **18. Anti-padrões** | SVG spin genérico circle; `animate-spin` default |
| **19. Aceite** | [ ] hex SVG PHD [ ] linear rotate [ ] reduced motion fallback |
| **20. Migração** | Submit spinner. **Backlog:** S4-01, S3-05 |

---

# Matriz de implementação

## Componente × Seção da Landing

| Componente | Hero | Clientes | Problema | Pilares | Creative | Vídeos | Insights | CTA/Form | Navbar | Footer |
|---|---|---|---|---|---|---|---|---|---|---|
| Surface | | | ● | ● | ● | ● | ● | ● | | ● |
| Container | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| Divider | | | | | | | | | | ● |
| Section | ● | ● | ● | ● | ● | ● | ● | ● | | |
| Display | ● | | | | | | | | | |
| Heading | | | ● | ● | ● | ● | ● | ● | | |
| Body | ● | | ● | ● | ● | ● | ● | ● | | ● |
| Mono | | | | | | | ○ | | | |
| Label | | | | | ● | | ● | ● | ● | |
| Button Primary | ● | | | | ○ | | | ● | | |
| Button Secondary | ● | | | | ● | ● | ● | | ● | ● |
| Icon Button | | | | | | | | | ● | |
| CTA Button | | | | | | | | ● | | |
| Input | | | | | | | | ● | | |
| Textarea | | | | | | | | ● | | |
| Checkbox | | | | | | | | ● | | |
| Hero Pattern | ● | | | | | | | | | |
| Spotlight Pattern | | | | | ● | | ● | | | |
| Section Header | | | ● | ● | | ● | | | | |
| Card | | | ● | ● | | | | | | |
| Video Card | | | | | | ● | | | | |
| Brand Card | | ● | | | | | | | | |
| Insight Card | | | | | | | ● | | | |
| Navbar | | | | | | | | | ● | |
| Footer | | | | | | | | | | ● |
| Badge | | | | | | ○ | | | | |
| Status | ○ | | | | | | | | | |
| Toast | | | | | | | | ● | | |
| Loading | | | | | | | | ● | | |

● = uso direto na migração V3 · ○ = uso opcional/futuro

---

## Componente × Backlog da Auditoria

| Backlog ID | Componentes que resolvem |
|---|---|
| **S1-01** Foundation tokens | Todos (dependência global) |
| **S1-02** Radius chanfro | Surface, Card, Button, Badge, Input (squircle) |
| **S1-03** Material sem blur estático | Surface, Card, Video Card |
| **S1-04** CTA único | Button Primary, CTA Button, Hero Pattern, Navbar, Footer |
| **S1-05** Tipografia | Display, Heading, Body, Mono, Label, Section Header |
| **S1-06** Sem gradientes | Hero Pattern, Spotlight, Insight Card, Toast, Section |
| **S2-01** Button DDS | Button Primary, Secondary, CTA |
| **S2-02** Card/Surface | Surface, Card |
| **S2-03** Input recesso | Input, Textarea, Checkbox, Select |
| **S2-04** Navbar | Navbar |
| **S2-05** strategic-card | Card, Surface |
| **S2-06** SectionTitle | Section Header |
| **S2-07** Extrair App.tsx | Todos patterns (composição) |
| **S3-01** Creative accent | Spotlight Pattern, Button Secondary |
| **S3-02** Insights accent | Insight Card, Spotlight Pattern |
| **S3-03** Marquee glow | Brand Card |
| **S3-04** Video blur | Video Card |
| **S3-05** Ícones angulares | Icon Button, Loading, Card icons |
| **S3-06** Footer CTA | Footer, Button Secondary |
| **S4-01** Motion tokens | Card, Button, Loading, Hero, Toast |
| **S4-02** Form feedback | Toast, Status |
| **S4-03** WhatsApp | (fora do CES — manter temporário) |
| **S4-04** Scroll video | (fora do CES — refinável) |
| **S4-05** A11y focus | Input, Button, Navbar, todos interativos |
| **S4-06** Legado | N/A — limpeza pós-migração |

---

## Ordem de codificação recomendada (Fase 05)

```
1. Tokens CSS (pré-requisito)
2. Surface → Container → Section → Divider
3. Display, Heading, Body, Label, Mono
4. Button Primary → Secondary → Icon Button → CTA Button
5. Input → Textarea → Checkbox → Loading
6. Card → Section Header
7. Hero Pattern (composição)
8. Navbar → Footer
9. Brand Card → institutional marquee
10. Video Card → Strategic Content section
11. Spotlight → Insight Card → Creative/Insights sections
12. Card grid → Problem + Pillars
13. Toast → Form integration
14. Select (opcional)
```

---

## Conclusão do CES

| Métrica | Valor |
|---|---|
| Componentes especificados | **30** |
| Seções de spec por componente | **20** (mínimo atendido) |
| Cobertura Landing V3 | **100%** das seções ativas |
| Backlog auditoria endereçado | **22/24** itens (S4-03, S4-04 fora do escopo CES) |

**Próxima fase:** Codificação dos componentes nesta ordem, sem alterar arquitetura/copy da Landing.

---

*Documento gerado em Junho de 2026.*  
*Referências: DDL v1.0 · DDS v1.0 · Auditoria v1.0*
