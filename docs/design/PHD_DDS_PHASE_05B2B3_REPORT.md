# PHD Studio V3 — Relatório Fase 05B.2B.3

**Hero Migration**  
**Versão:** 1.0  
**Data:** Junho de 2026  
**Status:** Tipografia do `StrategicHero` migrada para componentes DDS — primeira transformação visual da Landing

---

## Resumo executivo

Migrada a tipografia do `StrategicHero` (`App.tsx`) para componentes DDS exclusivos (`Display`, `Heading`, `Body`). Removido gradiente tipográfico no accent «clientes?»; substituído por `text-phd-accent-brand` sólido. Layout, decorações, botões, motion e copy permanecem inalterados.

Navbar, Footer, SectionHeader, Cards, Creative, Vídeos e Formulário **não foram modificados**.

`npm run typecheck` e `npm run build` passam.

`DDS_PHASE` atualizado para `05B.2B.3`.

---

## Camadas implementadas

### Camada 1 — Badge

**Status:** N/A (sem elemento no Hero ativo)

O `StrategicHero` não possui badge superior na arquitetura atual — confirmado no VRB `v3-foundation` (`desktop-hero.png`, commit `f0a5172`) e no [Typography Migration Plan](./PHD_TYPOGRAPHY_MIGRATION_PLAN.md) §6 (inventário de 5 elementos tipográficos, sem badge). O CES-018 (Hero Pattern) define anatomia `Display → Body → CTAs`, sem slot de badge.

Adicionar badge seria **alteração estrutural**, proibida pelo escopo desta fase. O componente `Label` permanece disponível para badge opcional em fase futura (CES-027 backlog S1-06).

---

### Camada 2 — Headline

| Antes | Depois |
|---|---|
| `<h1>` com `font-heading font-black text-[2.25rem]…lg:text-8xl tracking-tight` | `<Display as="h1" scale="display-xl" spacing="none">` |
| Montserrat 900 | Michroma via `--phd-font-role-display` |
| `leading-[1.02]` ad-hoc | `--phd-type-r-display-xl-leading` (1.1 desktop; downscale responsivo) |
| `tracking-tight` | `--phd-type-r-display-xl-tracking` (+0.04em) |

Preservados: `[text-wrap:balance]`, `drop-shadow-[0_4px_32px_rgba(0,0,0,0.85)]`, `max-w-5xl` no container pai (largura não alterada).

---

### Camada 3 — Accent

| Antes | Depois |
|---|---|
| `text-transparent bg-clip-text bg-gradient-to-br from-white via-brand-red to-red-600` | `<span className="text-phd-accent-brand">clientes?</span>` |
| Gradiente tipográfico | Cor sólida `#e50914` (`--phd-accent-brand`) |

Removidos: `bg-clip-text`, qualquer gradiente no texto. Sem efeitos decorativos adicionais.

---

### Camada 4 — Subheadline (tagline)

| Antes | Depois |
|---|---|
| `<p>` com `font-extrabold text-lg…lg:text-4xl tracking-tight text-white` | `<Heading as="p" level={2} spacing="none">` |
| Inter extrabold, escala Tailwind ad-hoc | Michroma `phd-type-heading-1` responsivo |
| `leading-snug md:leading-[1.25]` | Leading tokenizado `--phd-type-r-heading-1-leading` |

Preservados: `mt-4 md:mt-5`, `whitespace-pre-line`, copy integral. Semanticamente `<p>` (não segundo h1); visualmente subordinado ao Display conforme plano §6.

---

### Camada 5 — Corpo

| Antes | Depois |
|---|---|
| `<p>` com `text-sm md:text-base text-gray-300 font-medium` | `<Body muted spacing="none">` |
| `text-gray-300` Tailwind | `phd-type-color-tertiary` (`text-phd-tertiary`) |
| `font-medium` ad-hoc | `font-phd-regular` (peso via token Body) |

Preservados: `mt-6`, `max-w-2xl mx-auto lg:mx-0`, `whitespace-pre-line`.

---

### Camada 6 — CTAs

| Elemento | Antes | Depois |
|---|---|---|
| CTA primário (texto) | `font-bold text-base md:text-lg` inline no `<a>` | `<Body as="span" className="font-phd-semibold text-phd-inverse">` |
| CTA secundário (texto) | `font-bold text-base md:text-lg` inline no `<a>` | `<Body as="span" emphasis className="font-phd-medium">` |

**Inalterados:** classes de material/cor/hover nos `<a>` (`bg-brand-red`, `border-2 border-white/25`, `shadow-lg`, `transition-all`, etc.), ícone `ArrowRight`, dimensões `px-8 py-4`, grid de botões.

---

## Antes × Depois

### Mudanças tipográficas

- Família do H1: Montserrat 900 → Michroma 700 (`Display` / `phd-type-display-xl`)
- Tagline: Inter extrabold escalonado manualmente → Michroma semibold (`Heading` / `phd-type-heading-1`)
- Corpo: `text-gray-300` → tokens `text-phd-tertiary` via `Body muted`
- Accent: gradiente `bg-clip-text` → vermelho marca sólido
- CTAs: `font-bold` → `font-phd-semibold` / `font-phd-medium` em `Body` (Inter)

### Mudanças perceptuais

- Headline com presença **wide** alinhada ao wordmark STUDIO do ambigrama — menos “banner publicitário”, mais painel de controle
- Accent cirúrgico e legível — sem efeito neon ou degradê genérico
- Hierarquia mais nítida: Display (impacto) → Heading (conexão) → Body (explicação) → Body nos CTAs (ação operacional)
- Peso visual do hero ligeiramente menor no desktop (4rem vs 6rem legado em `lg:text-8xl`) — decisão intencional do token `display-xl`; compensação por Michroma wide e tracking +0.04em

### Decisões de direção de arte

1. **Michroma apenas no Display e Heading do hero** — corpo e CTAs permanecem Inter (DDL Princípio 06, regra de ouro Michroma)
2. **Accent sólido** — anti-pattern DDS/DDL para gradiente tipográfico eliminado
3. **`spacing="none"`** nos componentes tipográficos — margens estruturais (`mt-*`) preservadas no escopo, sem alterar ritmo vertical
4. **Sem ajuste de container** — quebras de linha da Michroma absorvidas pela escala responsiva nativa, não por largura

---

## Componentes DDS utilizados

| Componente | CES | Uso no Hero |
|---|---|---|
| `Display` | CES-005 | H1 «Seu conteúdo não gera…» + span accent |
| `Heading` | CES-006 | Tagline (as=`p`, level=2) |
| `Body` | CES-007 | Corpo descritivo (`muted`); texto dos CTAs |
| `Label` | CES-009 | — (badge ausente na arquitetura atual) |
| `Mono` | CES-008 | — (não aplicável) |

Confirmado no `StrategicHero`: zero `font-heading`, `font-black`, `tracking-tight`, `bg-clip-text`, `text-gray-*` tipográfico.

---

## Compatibilidade

| Área | Status |
|---|---|
| Navbar | Inalterada |
| Footer | Inalterado |
| SectionHeader (Problema, Pilares) | Inalterado |
| Cards (h3/p) | Inalterados |
| CreativeSpotlightSection | Inalterado |
| StrategicContentVideoSection | Inalterado |
| PhdInsightsInstitutionalSection | Inalterado |
| ContactForm | Inalterado |
| InstitutionalBrandsMarquee | Inalterado |
| Hero legado (`Hero`) | Inalterado (código morto / rotas antigas) |

**Única área modificada:** `StrategicHero` em `App.tsx` + metadado `DDS_PHASE` em `src/dds/index.ts`.

---

## QA Técnico

```text
npm run typecheck  →  exit 0
npm run build      →  exit 0 (vite build em ~7.4s)
```

---

## QA de Direção de Arte

| Critério | Resultado |
|---|---|
| Hierarquia visual melhorou? | ✅ |
| Legibilidade preservada? | ✅ |
| Consistência com a DDL? | ✅ |
| Consistência com o DDS? | ✅ |
| Consistência com o ambigrama? | ✅ |
| Percepção de software premium aumentou? | ✅ |

Nenhum critério negativo.

---

## Comparação com VRB v3-foundation

Referência: `docs/design/baselines/v3-foundation/desktop-hero.png` (pré-tipografia DDS).

| Dimensão | VRB (antes) | Pós 05B.2B.3 |
|---|---|---|
| Composição espacial | Coluna centralizada, CTAs abaixo do corpo | **Idêntica** — mesmos `mt-*`, `max-w-*`, alinhamento `text-center lg:text-left` |
| Headline | Montserrat black, gradiente em «clientes?» | Michroma wide, accent vermelho sólido |
| Tagline | Inter extrabold grande | Michroma heading-1 — subordinação mais clara ao H1 |
| Corpo | gray-300 Inter medium | Body tertiary tokenizado |
| Fundo / decor | Gradiente radial vermelho + obsidiana | **Inalterado** |
| Botões | Vermelho + ghost border | **Inalterados** (apenas tipografia interna) |

**Conclusão da comparação:**

- A identidade visual **evoluiu** — primeira superfície com Michroma e tokens tipográficos oficiais
- A composição permaneceu **equilibrada** — sem regressão estrutural detectável
- A leitura ficou **mais clara** — hierarquia Display → Heading → Body e accent sem ruído de gradiente
- A percepção de **tecnologia e engenharia aumentou** — wide display + accent cirúrgico, sem tom publicitário/neon

---

## Aprovação

**O Hero tornou-se a primeira seção plenamente alinhada à identidade visual da PHD Studio V3 e estabelece o padrão para a migração das demais áreas da Landing?**

✅ **Sim**

O `StrategicHero` consome exclusivamente primitivos tipográficos DDS, remove anti-padrões legados (gradiente, `font-black`, `tracking-tight`) e valida o modelo de migração em camadas para as fases 05B.2B.4+.

---

*Referências: [DDL](./PHD_Digital_Design_Language.md), [DDS](./PHD_Engineering_Design_System.md), [CES](./PHD_Component_Engineering_Specifications.md), [Typography Migration Plan](./PHD_TYPOGRAPHY_MIGRATION_PLAN.md), [Relatório 05B.2B.2](./PHD_DDS_PHASE_05B2B2_REPORT.md), [VRB v3-foundation](./baselines/v3-foundation/README.md)*
