# PHD Studio V3 — Typography Migration Plan

**Fase 05B.2B.0 · Planejamento**  
**Versão:** 1.0  
**Data:** Junho de 2026  
**Status:** Roadmap aprovado — nenhuma implementação nesta fase

---

> Este documento transforma o inventário da [Fase 05B.2A](./PHD_DDS_PHASE_05B2A_REPORT.md) em um plano técnico completo. **Todas as decisões de migração estão tomadas aqui.** A implementação nas subfases 05B.2B.1–05B.2B.5 deve seguir este plano sem reinterpretação.

**Referências obrigatórias:** [DDL](./PHD_Digital_Design_Language.md) · [DDS](./PHD_Engineering_Design_System.md) · [CES](./PHD_Component_Engineering_Specifications.md) · [Inventário](../src/dds/audit/TYPOGRAPHY_INVENTORY.md)

---

## Índice

1. [Inventário consolidado](#1-inventário-consolidado)
2. [Priorização](#2-priorização)
3. [Mapeamento legado → DDS](#3-mapeamento-legado--dds)
4. [Dependências e ordem](#4-dependências-e-ordem)
5. [Matriz de impacto](#5-matriz-de-impacto)
6. [Análise exclusiva — Hero](#6-análise-exclusiva--hero)
7. [Análise exclusiva — Michroma](#7-análise-exclusiva--michroma)
8. [Plano de bundle e limpeza](#8-plano-de-bundle-e-limpeza)
9. [Roadmap de implementação](#9-roadmap-de-implementação)
10. [Tabela de rastreabilidade](#10-tabela-de-rastreabilidade)
11. [Aprovação](#11-aprovação)

---

## 1. Inventário consolidado

Inventário derivado de `App.tsx`, componentes ativos da Home Page e superfícies adjacentes. Contagens são por **grupo semântico**, não por linha de código.

### 1.1 Home Page — ordem de renderização

| # | Grupo | Elemento | Arquivo | Tipografia atual | Ocorrências |
|---|---|---|---|---|---|
| 1 | **Hero** | H1 principal | `App.tsx` → `StrategicHero` | `font-heading font-black text-[2.25rem]…text-8xl tracking-tight` + gradiente `bg-clip-text` | 1 |
| 1 | **Hero** | Linha de impacto (2º parágrafo) | `StrategicHero` | `font-extrabold text-lg…text-4xl tracking-tight text-white` | 1 |
| 1 | **Hero** | Corpo de apoio (3º parágrafo) | `StrategicHero` | `text-sm md:text-base text-gray-300 font-medium` | 1 |
| 1 | **Hero** | CTA primário | `StrategicHero` | `font-bold text-base md:text-lg` (Inter implícito) | 1 |
| 1 | **Hero** | CTA secundário | `StrategicHero` | `font-bold text-base md:text-lg` | 1 |
| 2 | **Clientes** | Marquee logos | `InstitutionalBrandsMarquee.tsx` | Sem tipografia de texto (apenas `aria-label`) | 0 texto |
| 3 | **Section Headers** | Títulos de seção | `App.tsx` → `SectionTitle` | `font-heading font-black text-3xl md:text-4xl tracking-tight` | 3 ativos |
| 3 | **Section Headers** | Subtítulos | `SectionTitle` | `text-gray-400 text-lg font-light` | 0 ativos (nenhum subtitle nas 3 seções ativas) |
| 4 | **Cards — Problema** | Título card h3 | `ProblemSection` | `text-lg font-bold text-white` (sem `font-heading`) | 3 |
| 4 | **Cards — Problema** | Corpo card | `ProblemSection` | `text-gray-300 text-sm md:text-base` | 3 |
| 5 | **Cards — Pilares** | Título pilar h3 | `ContentGrowthPillarsSection` | `font-heading font-black text-xl` | 3 |
| 5 | **Cards — Pilares** | Corpo pilar | idem | `text-gray-300 text-sm md:text-base` | 3 |
| 6 | **Creative** | Label de contexto | `CreativeSpotlightSection` | `font-black uppercase tracking-[0.35em] text-purple-200` | 1 |
| 6 | **Creative** | Título h2 | idem | `font-heading font-black text-4xl md:text-6xl leading-[1.05]` | 1 |
| 6 | **Creative** | Subtítulo | idem | `font-bold text-xl md:text-2xl lg:text-3xl text-gray-50` | 1 |
| 6 | **Creative** | CTA link | idem | `font-black text-base md:text-lg` | 1 |
| 7 | **Vídeos** | Título seção | `StrategicContentVideoSection.tsx` | `font-heading font-black text-3xl md:text-5xl` | 1 |
| 7 | **Vídeos** | Subtítulo featured | idem | `text-gray-100 text-lg md:text-2xl font-semibold` | 1 |
| 7 | **Vídeos** | Descrição featured | idem | `text-gray-200 text-base md:text-lg font-medium` | 1 |
| 7 | **Vídeos** | Descrição cards secundários | idem | `text-gray-300 text-sm md:text-base` | 3 |
| 7 | **Vídeos** | CTA YouTube | idem | `font-bold uppercase tracking-wide text-sm` | 1 |
| 8 | **Insights** | Label institucional | `PhdInsightsInstitutionalSection.tsx` | `font-black uppercase tracking-[0.28em] text-amber-200/90` | 1 |
| 8 | **Insights** | Título h2 | idem | `font-heading font-black text-4xl md:text-6xl` | 1 |
| 8 | **Insights** | Subtítulo h3 | idem | `font-bold text-2xl md:text-3xl lg:text-4xl tracking-tight` | 1 |
| 8 | **Insights** | Corpo primário | idem | `text-lg md:text-xl text-gray-200` | 1 |
| 8 | **Insights** | Corpo secundário | idem | `text-sm md:text-base text-gray-400` | 1 |
| 8 | **Insights** | CTA blog | idem | `font-black text-base md:text-lg` | 1 |
| 9 | **Forms** | Título formulário h2 | `App.tsx` → `ContactForm` | `font-heading font-black text-3xl md:text-4xl tracking-tight` | 1 |
| 9 | **Forms** | Subtítulo | idem | `text-gray-400 font-light text-sm md:text-base` | 1 |
| 9 | **Forms** | Copy persuasivo | idem | `font-semibold` + `text-gray-300` | 2 |
| 9 | **Forms** | Labels | idem | `text-sm font-medium text-gray-300` | 4 |
| 9 | **Forms** | Inputs placeholder | idem | `text-white placeholder-gray-500` | 4 |
| 9 | **Forms** | LGPD / legal inline | idem | `text-xs text-gray-500` | 1 |
| 9 | **Forms** | Submit CTA | idem | `font-bold text-lg` | 1 |
| 9 | **Forms** | Feedback sucesso/erro | idem | `text-xl font-bold`, `text-sm`, `text-xs` | 6 |
| 10 | **Navbar** | Logo | `App.tsx` → `Navbar` | Imagem (sem texto) | — |
| 10 | **Navbar** | Links desktop | idem | `text-sm font-medium text-gray-300 uppercase tracking-wider` | 7–9 |
| 10 | **Navbar** | CTA login | idem | `font-bold text-sm uppercase tracking-wider` | 1 |
| 10 | **Navbar** | Menu mobile | idem | Mesmos padrões + `text-lg` em CTAs mobile | ~12 |
| 11 | **Footer** | Descrição marca | `App.tsx` → `Footer` | `text-gray-400` | 1 |
| 11 | **Footer** | Título bloco CTA h4 | idem | `text-xl font-bold` | 1 |
| 11 | **Footer** | Copy CTA | idem | `text-gray-400 text-sm` | 1 |
| 11 | **Footer** | Botão CTA | idem | `font-bold` uppercase implícito no texto | 1 |
| 11 | **Footer** | Legal / copyright | idem | `text-sm text-gray-600`, `text-xs text-gray-500` | 5 |
| 11 | **Footer** | Links sociais | idem | Ícones apenas | — |

### 1.2 Componentes legados em `App.tsx` (fora da Home ativa)

| Grupo | Elemento | Estado | Ocorrências |
|---|---|---|---|
| Hero legado | H1 + gradiente | Código morto / rotas antigas | 2 |
| Depoimentos | Nome, citação, role | `TestimonialCard` — não na Home | 3+ |
| Serviços | Título + cards | `ServicesSection` importado mas não no `HomePage` | 4+ |
| Método / Cases / FAQ | SectionTitle + headings | Seções comentadas ou rotas secundárias | 15+ |
| Páginas internas | Login, produtos, logs | `font-heading font-black` em headers | 8+ |

### 1.3 Chat e widgets

| Grupo | Arquivo | Tipografia atual |
|---|---|---|
| Chat desktop header | `ChatWidget.tsx` | `font-heading font-bold text-lg` |
| Chat mobile header | `MobileChatInterface.tsx` | idem |
| Mensagens | `MobileChatMessage.tsx` | `text-gray-100/400` |
| Login mobile | `MobileChatLogin.tsx` | `font-medium text-gray-300`, inline Montserrat 900 |

### 1.4 Admin (`src/admin/**`)

| Grupo | Padrão dominante | Escopo |
|---|---|---|
| Títulos página | `text-2xl font-bold text-gray-900` | 12 arquivos |
| Labels formulário | `text-sm font-medium text-gray-500` | Todos os forms |
| Corpo / tabelas | `text-gray-600`, `text-gray-900` | Listas, detalhes |
| **Tema** | Light-first (inverso do dark DDS) | Fora do escopo Landing imediato |

### 1.5 Resumo quantitativo Landing ativa

| Categoria | Elementos tipográficos | Arquivos |
|---|---|---|
| Hero | 5 | 1 |
| Section Headers | 3 | 1 |
| Cards (Problema + Pilares) | 12 | 1 |
| Creative Spotlight | 4 | 1 |
| Vídeos | 7 | 1 |
| Insights | 6 | 1 |
| Contact Form | 20+ | 1 |
| Navbar | 20+ | 1 |
| Footer | 10+ | 1 |
| Clientes (marquee) | 0 texto | 1 |
| **Total estimado Landing ativa** | **~80 grupos** | **9 arquivos** |

---

## 2. Priorização

| Prioridade | Grupo | Justificativa técnica |
|---|---|---|
| **P0** | Typography Components (CES-005–009) | Pré-requisito bloqueante — sem wrappers não há migração tokenizada |
| **P0** | SectionHeader | Componente compartilhado por 3+ seções ativas; elimina `SectionTitle` duplicado |
| **P0** | Hero H1 + hierarquia above-the-fold | Máximo impacto de identidade (DDL Cap. 7, Assinatura #4); único `h1` da Home |
| **P1** | Section Headers institucionais (Problema, Pilares) | Ritmo narrativo da Landing; dependem de SectionHeader |
| **P1** | Navbar links + labels | Visível em 100% dos viewports; CES-025 especifica `type-label` |
| **P1** | Creative + Insights spotlights | Sub-marcas com tipografia ad-hoc (purple/amber); alto desvio do DDS |
| **P2** | Cards (títulos h3 + corpo) | Repetição modular; risco médio por volume |
| **P2** | Vídeos (`StrategicContentVideoSection`) | Section header + corpo; padrão repetível pós-P1 |
| **P2** | Contact Form (títulos, labels, corpo) | Conversão crítica mas tipografia isolada em `#contato` |
| **P2** | Footer | Encerramento institucional; CTA tipográfico subordinado ao Hero |
| **P3** | Chat widgets | Overlay secundário; mesma família que nav labels |
| **P3** | Páginas satélite (`CreativePage`, login) | Fora do funil principal da Home |
| **P4** | Admin (`src/admin/**`) | Tema light derivado; requer tokens de modo claro não priorizados na Landing |
| **P4** | Seções legadas mortas em `App.tsx` | Cases, FAQ, Método — migrar apenas se reativadas |

---

## 3. Mapeamento legado → DDS

Regra global: **nenhum valor tipográfico hardcoded após migração.** Toda substituição usa componente CES ou utilitário `.phd-type-*` / Tailwind `text-phd-r-*`.

### 3.1 Famílias

| Atual | DDS | Componente / token |
|---|---|---|
| `font-heading` (Montserrat) em H1 hero | **Display** (Michroma) | `<Display>` / `phd-type-display-xl` |
| `font-heading` em h2 seção | **Heading** (Michroma) | `<Heading level={2}>` / `phd-type-heading-1` |
| `font-heading` em h3 card/pilar | **Heading** nível 3 | `<Heading level={3}>` / `phd-type-heading-3` |
| `font-heading` em chat header | **Heading** nível 3 | `<Heading level={3}>` |
| `font-sans` / Inter implícito | **Body** | `<Body>` / `phd-type-body` |
| `font-black` (900) | `font-phd-bold` (700) | Display/Heading bold; nunca 900 |
| `font-extrabold` / `font-bold` em corpo | `font-phd-semibold` ou `font-phd-medium` | Conforme CES por contexto |
| `font-light` (300) | **Remover** | `text-phd-secondary` ou `text-phd-tertiary` — peso regular |
| `font-medium` em labels | `font-phd-medium` | `<Label>` |
| `font-mono` (system) | **Mono** (JetBrains) | `<Mono>` / `font-phd-mono` |

### 3.2 Escala e ritmo

| Atual | DDS |
|---|---|
| `text-[2.25rem] sm:text-6xl md:text-7xl lg:text-8xl` | `text-phd-r-display-xl` (escala responsiva automática) |
| `text-3xl md:text-4xl` (SectionTitle) | `text-phd-r-heading-1` |
| `text-4xl md:text-6xl` (spotlights) | `text-phd-r-display` (tablet/mobile downgrade embutido) |
| `text-xl font-black font-heading` (pilares) | `text-phd-r-heading-3 font-phd-semibold` |
| `text-lg font-bold` (card problema) | `text-phd-r-title font-phd-semibold` |
| `text-sm md:text-base` (corpo) | `text-phd-r-body-sm` ou `text-phd-r-body` |
| `text-xs`, `text-[10px]` | `text-phd-caption` ou `text-phd-label` |
| `leading-[1.02]`, `leading-[1.05]`, `leading-tight` | Leading embutido nos tokens `text-phd-r-*` |
| `tracking-tight` | **Remover** — tracking em `--phd-type-*-tracking` |
| `tracking-wide`, `tracking-wider`, `tracking-[0.35em]` | `text-phd-label` (+0.06em) ou token caption para micro-labels |
| `uppercase` ad-hoc em nav/labels | `<Label>` (uppercase via token) |

### 3.3 Cores de texto

| Atual | DDS |
|---|---|
| `text-white` em títulos | `text-phd-primary` |
| `text-gray-300` | `text-phd-secondary` |
| `text-gray-400` | `text-phd-secondary` ou `text-phd-tertiary` (metadados) |
| `text-gray-500`, `text-gray-600` | `text-phd-tertiary` |
| `text-gray-50`, `text-gray-100`, `text-gray-200` | `text-phd-primary` ou `text-phd-secondary` conforme hierarquia |
| `text-purple-200`, `text-amber-200/90` | `text-phd-primary` + cor de accent produto no **container** (não na tipografia) — texto permanece branco por opacidade |
| `text-transparent bg-clip-text bg-gradient-*` | `text-phd-primary` com `<span className="text-phd-accent-brand">` sólido |
| `placeholder-gray-500` | `placeholder:text-phd-tertiary` |
| `text-brand-red` em métricas | `<Mono>` + `text-phd-data-live` ou accent semântico |

### 3.4 CTAs — decisão fechada

| Elemento | Atual | DDS final | Nota |
|---|---|---|---|
| CTA primário Hero / Form | `font-bold text-base/lg` | **Body** `font-phd-semibold` `text-phd-inverse` | CES-010: font-body 600, não Label |
| CTA secundário Hero | `font-bold` | **Body** `font-phd-medium` `text-phd-primary` | CES-011 |
| Navbar login | `font-bold uppercase tracking-wider` | **Label** nav + peso medium | CES-025 |
| Footer CTA texto | `font-bold` + string CAPS | **Body** semibold; CAPS removido (anti-pattern DDL) | Alinhar a Button Secondary futuro |

---

## 4. Dependências e ordem

```
05B.2B.1  Typography Components (Display, Heading, Body, Mono, Label)
    ↓
05B.2B.2  SectionHeader (substitui SectionTitle)
    ↓
05B.2B.3  Hero (StrategicHero)
    ↓
05B.2B.4  Landing Migration (seções, cards, spotlights, form, nav, footer)
    ↓
05B.2B.5  Cleanup (fontes legadas, classes, bundle)
    ↓
05B.2B.6  Admin + satélites (opcional, P4)
```

### Por que esta ordem minimiza riscos

1. **Componentes primeiro** — garante API estável; evita migração ad-hoc com classes soltas que divergem do CES.
2. **SectionHeader antes do Hero** — Hero não usa SectionHeader, mas SectionHeader valida Heading+Body em contexto real de baixa complexidade antes do above-the-fold.
3. **Hero isolado** — maior impacto visual e decisões únicas (Display XL, remoção de gradiente); bloco próprio permite QA visual focado e rollback simples.
4. **Landing em lote após Hero** — padrões Hero + SectionHeader tornam-se referência; seções restantes são composições repetíveis.
5. **Cleanup por último** — remover Montserrat 900 / Inter 300 só quando nenhum componente legado referenciar; evita regressão durante migração parcial.
6. **Admin separado** — tema light não compartilha tokens de texto da Landing; misturar cedo aumentaria escopo e risco sem ganho na Home.

---

## 5. Matriz de impacto

| Grupo | Impacto visual | Complexidade | Risco | Fase |
|---|---|---|---|---|
| Typography Components | Baixo (sem uso na UI até integração) | Médio | Baixo | 05B.2B.1 |
| SectionHeader | Médio | Baixo | Baixo | 05B.2B.2 |
| Hero | **Muito Alto** | Alto | **Alto** | 05B.2B.3 |
| Section Headers (×3) | Alto | Baixo | Baixo | 05B.2B.4 |
| Navbar | Alto | Médio | Médio | 05B.2B.4 |
| Creative Spotlight | Alto | Médio | Médio | 05B.2B.4 |
| Insights Spotlight | Alto | Médio | Médio | 05B.2B.4 |
| Cards Problema + Pilares | Médio | Baixo | Baixo | 05B.2B.4 |
| Vídeos | Médio | Médio | Baixo | 05B.2B.4 |
| Contact Form | Médio | Alto | Médio | 05B.2B.4 |
| Footer | Baixo | Baixo | Baixo | 05B.2B.4 |
| Clientes marquee | Nulo (sem texto) | Nulo | Nulo | — |
| Chat widgets | Baixo | Baixo | Baixo | 05B.2B.6 |
| Admin | Baixo (usuários internos) | Alto | Médio | 05B.2B.6 |
| Cleanup bundle | Nulo visível | Médio | Médio | 05B.2B.5 |

---

## 6. Análise exclusiva — Hero

**Arquivo:** `App.tsx` → `StrategicHero` (linhas ~3034–3077)  
**Componente CES alvo:** `Hero Pattern` (CES-018) — composição na fase de layout; tipografia na 05B.2B.3.

### 6.1 Elementos e decisões tipográficas

| Elemento | Decisão DDS | Componente | Token escala |
|---|---|---|---|
| **H1** «Seu conteúdo não gera…» | **Display** | `<Display>` (único h1) | `type-display-xl` responsivo |
| **Span accent** «clientes?» | **Display** com cor sólida | `<Display>` + `text-phd-accent-brand` no span | Mesma escala — sem gradiente |
| **2º parágrafo** (tagline extrabold) | **Heading** — não Display | `<Heading level={2}>` visualmente subordinado ao h1 | `type-heading-1` responsivo |
| **3º parágrafo** (corpo explicativo) | **Body** | `<Body muted>` | `type-body` + `text-phd-secondary` |
| **CTA primário** | **Body semibold** (tipografia apenas) | Texto dentro de Button Primary (fase botões separada) | `type-body` + `font-phd-semibold` + `text-phd-inverse` |
| **CTA secundário** | **Body medium** | Texto dentro de Button Secondary | `type-body` + `font-phd-medium` |

### 6.2 Respostas diretas

| Pergunta | Resposta |
|---|---|
| Quais elementos devem utilizar **Display**? | Apenas o **H1** (incluindo o span de accent «clientes?»). |
| Quais devem permanecer **Heading**? | O **2º parágrafo** (tagline de impacto) — semanticamente pode ser `<p>` com estilo Heading-1, não um segundo h1. |
| O subtítulo deve permanecer **Body**? | O **3º parágrafo** sim (`Body`). O 2º parágrafo **não** — é Heading por hierarquia visual. |
| O CTA sofre alteração tipográfica? | **Sim, leve:** `font-bold` → `font-phd-semibold` (700→600); família permanece Inter (Body), não Michroma. Material do botão é escopo separado. |
| O gradiente atual deverá permanecer até outra fase? | **Não.** Remoção na **05B.2B.3** — substituir por `text-phd-accent-brand` sólido no span (CES-005, anti-pattern DDS). Não há fase posterior para gradiente de texto. |

### 6.3 O que não muda na 05B.2B.3

- Copy/textos (proibido pelo escopo V3)
- Layout, espaçamentos, decor de fundo (gradientes de **superfície** permanecem — escopo material, não tipografia)
- Estrutura `Section` + `Container` já migrada na 05B.1

---

## 7. Análise exclusiva — Michroma

**Token:** `--phd-font-role-display` / `--phd-font-role-heading` → Michroma wide (DDL Cap. 7, DDS §1.8).

### 7.1 Onde Michroma **será** aplicada

| Superfície | Michroma? | Papel | Justificativa DDL |
|---|---|---|---|
| **Hero H1** | ✅ Display | Assinatura #4 — «tipografia wide em camadas»; wordmark STUDIO como referência |
| **Section Headers h2** | ✅ Heading | Hastes verticais — presença estrutural, não propaganda |
| **Creative / Insights títulos h2** | ✅ Heading (escala display em spotlight) | Sub-marca mantém hierarquia display-wide para impacto |
| **Card / pilar títulos h3** | ✅ Heading-3 | Módulos hexagonais — presença sem competir com seção |
| **Chat header h3** | ✅ Heading-3 | Consistência de títulos de painel |

### 7.2 Onde Michroma **não** será aplicada

| Superfície | Família | Justificativa DDL |
|---|---|---|
| **Corpo / parágrafos** | Inter (Body) | «Corpo com eficiência» — legibilidade em blocos longos; wide em corpo viola Princípio 06 |
| **CTAs (todos)** | Inter semibold | Engenharia operacional; CAPS/label é para navegação, não ação |
| **Navbar links** | Inter Label | CES-025 — `type-label`, não display |
| **Form labels** | Inter Label | Funcional, compacto |
| **Footer corpo e legal** | Inter Body/Caption | Silêncio estrutural — tipografia não compete |
| **KPIs / métricas** | JetBrains Mono | «Números sempre monospace» — Princípio 06, DDS §8.2 |
| **Inputs** | Inter Body | Recesso tipográfico squircle — CES-014 |
| **Vídeo descrições** | Inter Body | Conteúdo editorial denso |
| **Clientes marquee** | N/A | Sem texto |

### 7.3 Regra de ouro Michroma

> **Máximo 1 família wide por viewport junto com Inter** (DDL: máx. 2 famílias). Michroma aparece apenas em Display + Heading. Tudo mais é Inter ou JetBrains Mono.

---

## 8. Plano de bundle e limpeza

**Executar somente na fase 05B.2B.5**, após grep confirmar zero referências.

| Item | Condição para remoção | Ação |
|---|---|---|
| **Montserrat 900** | Zero `font-black` / `font-extrabold` na Landing + grep `font-heading` = 0 | Remover peso 900 do Google Fonts link |
| **Montserrat família inteira** | Zero `font-heading` e zero `font-phd-legacy` em todo o projeto | Remover Montserrat do link; remover `--phd-font-display-legacy` |
| **Inter 300** | Zero `font-light` em Landing e componentes migrados | Remover peso 300 do link |
| **Inter 800** | Zero `font-extrabold` legado | Remover peso 800 se não usado em admin |
| `font-heading` Tailwind | Substituído por componentes CES | Remover de `tailwind.config.js` |
| `font-sans` override legado | Body usa `font-phd-body` | Avaliar manter Inter como default sans ou forçar `font-phd-body` no root |
| Classes `.phd-type-*` duplicadas | Componentes CES absorvem estilos | Manter utilitários para casos edge — não remover |
| Michroma + JetBrains | Em uso ativo | **Manter**; opcional self-host subset latin |

### Verificação pré-cleanup (critério 05B.2B.5)

```bash
# Deve retornar 0 ocorrências na Landing
rg "font-heading|font-black|font-light|text-gray-[0-9]" App.tsx src/components/
```

---

## 9. Roadmap de implementação

### 05B.2B.1 — Typography Components

| Campo | Detalhe |
|---|---|
| **Objetivo** | Implementar CES-005 a CES-009 como componentes React reutilizáveis |
| **Arquivos** | `src/dds/components/typography/Display.tsx`, `Heading.tsx`, `Body.tsx`, `Mono.tsx`, `Label.tsx`, `index.ts`; export em `src/dds/index.ts` |
| **Risco** | Baixo — componentes novos, sem alteração da Landing |
| **Critérios de aceite** | [ ] Cada componente consome apenas tokens `--phd-*` [ ] Variantes de escala via `typeScaleVariants` [ ] `Display` suporta `as="h1"` [ ] `Heading` níveis 2–3 [ ] `Body` props `muted` [ ] `Mono` com `tabular` default [ ] `Label` uppercase via token [ ] `npm run typecheck` + `build` passam [ ] Zero uso na Landing ainda |

---

### 05B.2B.2 — Section Header

| Campo | Detalhe |
|---|---|
| **Objetivo** | Implementar CES-020 `SectionHeader`; substituir `SectionTitle` nas 3 seções ativas |
| **Arquivos** | `src/dds/components/layout/SectionHeader.tsx` (ou `typography/SectionHeader.tsx`); `App.tsx` — remover `SectionTitle`, atualizar `ProblemSection`, `ContentGrowthPillarsSection` |
| **Risco** | Baixo — troca 1:1 de h2+subtitle; escala menor que Hero |
| **Critérios de aceite** | [ ] `Heading` h2 + `Body` subtitle opcional [ ] `id` para `aria-labelledby` [ ] `centered` prop preservada [ ] Sem `font-black`, `tracking-tight`, `font-light` [ ] 3 seções ativas migradas [ ] Regressão visual aceitável (peso 700 vs 900 esperado) [ ] `typecheck` + `build` |

---

### 05B.2B.3 — Hero

| Campo | Detalhe |
|---|---|
| **Objetivo** | Migrar tipografia do `StrategicHero` conforme §6 deste plano |
| **Arquivos** | `App.tsx` → `StrategicHero` |
| **Risco** | **Alto** — above-the-fold, Michroma, remoção de gradiente |
| **Critérios de aceite** | [ ] Um único `<Display as="h1">` [ ] Span accent sólido `text-phd-accent-brand` — sem `bg-clip-text` [ ] Tagline como `Heading` [ ] Corpo como `Body muted` [ ] CTAs com tipografia Body semibold/medium [ ] Escala via `text-phd-r-display-xl` [ ] Sem `font-heading`, `font-black`, `tracking-tight` [ ] Lighthouse CLS ≤ baseline + 0.02 [ ] QA desktop/tablet/mobile |

---

### 05B.2B.4 — Landing Migration

| Campo | Detalhe |
|---|---|
| **Objetivo** | Migrar tipografia de todas as seções restantes da Home + Navbar + Footer + Form |
| **Arquivos** | `App.tsx` (Navbar, Footer, ContactForm, CreativeSpotlightSection, ContentGrowthPillarsSection cards, ProblemSection cards); `StrategicContentVideoSection.tsx`; `PhdInsightsInstitutionalSection.tsx` |
| **Ordem interna sugerida** | 1. Navbar → 2. Creative → 3. Insights → 4. Pilares cards → 5. Problema cards → 6. Vídeos → 7. ContactForm → 8. Footer |
| **Risco** | Médio — volume alto, mas padrões estabelecidos |
| **Critérios de aceite** | [ ] Zero `font-heading` nos arquivos da Home [ ] Zero `text-gray-*` nos arquivos migrados [ ] Zero `font-light` / `font-black` [ ] Labels nav/form usam `<Label>` [ ] Corpo usa `<Body>` [ ] Títulos spotlight usam `<Heading>` [ ] Métricas futuras usam `<Mono>` [ ] `typecheck` + `build` [ ] Snapshot visual das 8 seções |

---

### 05B.2B.5 — Cleanup

| Campo | Detalhe |
|---|---|
| **Objetivo** | Remover dependências tipográficas legadas e otimizar bundle |
| **Arquivos** | `index.html` (Google Fonts link); `tailwind.config.js`; `src/dds/styles/variables.css` (opcional: remover `--phd-font-display-legacy`) |
| **Risco** | Médio — regressão se migração incompleta |
| **Critérios de aceite** | [ ] Grep zero `font-heading` / `font-black` no projeto Landing [ ] Montserrat removido do font link [ ] Inter 300 removido [ ] `npm run build` [ ] Documentar economia de KB no relatório |

---

### 05B.2B.6 — Satélites e Admin (P4)

| Campo | Detalhe |
|---|---|
| **Objetivo** | Alinhar chat, páginas secundárias; admin em fase separada com tema light |
| **Arquivos** | `ChatWidget.tsx`, `MobileChat/*`, `CreativePage` em `App.tsx`; `src/admin/**` |
| **Risco** | Baixo (chat) / Alto (admin — tema diferente) |
| **Critérios de aceite** | [ ] Chat headers com `<Heading level={3}>` [ ] `CreativePage` com Display/Heading/Body [ ] Admin: documentar escopo ou aplicar tokens light derivados |

---

## 10. Tabela de rastreabilidade

| Componente | Arquivo | Estado atual | Estado final | Fase |
|---|---|---|---|---|
| Hero H1 | `App.tsx` → `StrategicHero` | `font-heading font-black` + gradiente | `<Display as="h1">` Michroma | 05B.2B.3 |
| Hero accent span | `StrategicHero` | `bg-clip-text` gradiente | `<span className="text-phd-accent-brand">` sólido | 05B.2B.3 |
| Hero tagline | `StrategicHero` | `font-extrabold tracking-tight` | `<Heading level={2}>` (visual) | 05B.2B.3 |
| Hero corpo | `StrategicHero` | `text-gray-300 font-medium` | `<Body muted>` | 05B.2B.3 |
| Hero CTA primário | `StrategicHero` | `font-bold` | Body `font-phd-semibold` (em Button) | 05B.2B.3 |
| Hero CTA secundário | `StrategicHero` | `font-bold` | Body `font-phd-medium` | 05B.2B.3 |
| SectionTitle | `App.tsx` | `font-heading font-black tracking-tight` | `<SectionHeader>` → Heading+Body | 05B.2B.2 |
| Problema — título seção | `ProblemSection` | `SectionTitle` | `<SectionHeader>` | 05B.2B.2 |
| Pilares — título seção | `ContentGrowthPillarsSection` | `SectionTitle centered` | `<SectionHeader centered>` | 05B.2B.2 |
| Problema — card h3 | `ProblemSection` | `text-lg font-bold` | `<Heading level={3}>` | 05B.2B.4 |
| Problema — card corpo | `ProblemSection` | `text-gray-300 text-sm` | `<Body size="sm">` | 05B.2B.4 |
| Pilares — card h3 | `ContentGrowthPillarsSection` | `font-heading font-black text-xl` | `<Heading level={3}>` | 05B.2B.4 |
| Pilares — card corpo | `ContentGrowthPillarsSection` | `text-gray-300` | `<Body size="sm" muted>` | 05B.2B.4 |
| Creative — label | `CreativeSpotlightSection` | `font-black uppercase tracking-[0.35em]` | `<Label>` + accent container | 05B.2B.4 |
| Creative — h2 | `CreativeSpotlightSection` | `font-heading font-black text-4xl md:text-6xl` | `<Heading level={2} scale="display">` | 05B.2B.4 |
| Creative — subtítulo | `CreativeSpotlightSection` | `font-bold text-xl…3xl text-gray-50` | `<Body size="lg">` emphasis | 05B.2B.4 |
| Creative — CTA | `CreativeSpotlightSection` | `font-black` | Body semibold | 05B.2B.4 |
| Vídeos — título | `StrategicContentVideoSection.tsx` | `font-heading font-black` | `<SectionHeader>` ou `<Heading>` | 05B.2B.4 |
| Vídeos — featured subtitle | idem | `font-semibold text-gray-100` | `<Body>` primary | 05B.2B.4 |
| Vídeos — descrições | idem | `text-gray-200/300` | `<Body>` / `<Body sm muted>` | 05B.2B.4 |
| Vídeos — CTA | idem | `font-bold uppercase tracking-wide` | `<Label>` ou Body medium | 05B.2B.4 |
| Insights — label | `PhdInsightsInstitutionalSection.tsx` | `font-black uppercase tracking-[0.28em]` | `<Label>` | 05B.2B.4 |
| Insights — h2 | idem | `font-heading font-black text-4xl md:text-6xl` | `<Heading scale="display">` | 05B.2B.4 |
| Insights — h3 | idem | `font-bold tracking-tight` | `<Heading level={3}>` | 05B.2B.4 |
| Insights — corpos | idem | `text-gray-200/400` | `<Body>` / `<Body muted>` | 05B.2B.4 |
| Insights — CTA | idem | `font-black` gradient button | Body semibold (botão = fase material) | 05B.2B.4 |
| Form — título | `ContactForm` | `font-heading font-black` | `<Heading level={2}>` | 05B.2B.4 |
| Form — subtítulo | `ContactForm` | `text-gray-400 font-light` | `<Body sm muted>` | 05B.2B.4 |
| Form — copy bloco | `ContactForm` | `font-semibold` / `text-gray-300` | `<Body>` / `<Body muted>` | 05B.2B.4 |
| Form — labels | `ContactForm` | `text-sm font-medium text-gray-300` | `<Label htmlFor>` | 05B.2B.4 |
| Form — inputs | `ContactForm` | `text-white placeholder-gray-500` | `type-body text-phd-primary` (Input CES futuro) | 05B.2B.4 |
| Form — submit | `ContactForm` | `font-bold text-lg` | Body semibold | 05B.2B.4 |
| Form — feedback | `ContactForm` | gradientes + `font-bold` | Toast CES (tipografia Body) — fase feedback | 05B.2B.6 |
| Navbar — links | `Navbar` | `text-gray-300 uppercase tracking-wider` | `<Label>` + `text-phd-secondary` | 05B.2B.4 |
| Navbar — login CTA | `Navbar` | `font-bold uppercase tracking-wider` | `<Label>` em botão | 05B.2B.4 |
| Footer — descrição | `Footer` | `text-gray-400` | `<Body muted prose>` | 05B.2B.4 |
| Footer — h4 CTA | `Footer` | `text-xl font-bold` | `<Heading level={3}>` ou `title` | 05B.2B.4 |
| Footer — legal | `Footer` | `text-gray-500/600 text-xs` | `<Caption>` / `<Body sm muted>` | 05B.2B.4 |
| Clientes marquee | `InstitutionalBrandsMarquee.tsx` | Sem texto | Sem alteração tipográfica | — |
| Display (primitivo) | `src/dds/components/typography/` | Não existe | CES-005 implementado | 05B.2B.1 |
| Heading (primitivo) | idem | Não existe | CES-006 implementado | 05B.2B.1 |
| Body (primitivo) | idem | Não existe | CES-007 implementado | 05B.2B.1 |
| Mono (primitivo) | idem | Não existe | CES-008 implementado | 05B.2B.1 |
| Label (primitivo) | idem | Não existe | CES-009 implementado | 05B.2B.1 |
| Chat header | `ChatWidget.tsx` | `font-heading font-bold` | `<Heading level={3}>` | 05B.2B.6 |
| CreativePage h1 | `App.tsx` | `font-heading font-black` | `<Display>` ou `<Heading>` | 05B.2B.6 |
| Admin títulos | `src/admin/**` | `text-gray-900 font-bold` | Tokens light (TBD) ou P4 adiado | 05B.2B.6 |
| Montserrat 900 | `index.html` | Carregado | Removido | 05B.2B.5 |
| Inter 300 | `index.html` | Carregado | Removido | 05B.2B.5 |
| `font-heading` Tailwind | `tailwind.config.js` | Ativo | Removido | 05B.2B.5 |

---

## 11. Aprovação

**O projeto possui agora um plano completo e rastreável para executar a migração tipográfica sem decisões adicionais durante a implementação?**

✅ **Sim**

Todos os grupos da Landing ativa estão inventariados, priorizados, mapeados para tokens DDS, ordenados por dependência e distribuídos em subfases com critérios de aceite. Decisões fechadas incluem: Hero (Display vs Heading), remoção do gradiente na 05B.2B.3, escopo Michroma, tipografia de CTAs (Body semibold, não Label) e cleanup de bundle na 05B.2B.5.

---

**PHD Studio V3 · Typography Migration Plan**  
*Fase 05B.2B.0 — Planejamento concluído*
