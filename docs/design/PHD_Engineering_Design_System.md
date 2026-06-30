# PHD Studio V3 — Engineering Design System (DDS)

**Fase 02 · Sistema de Engenharia Visual**  
**Versão:** 1.0  
**Data:** Junho de 2026  
**Status:** Infraestrutura documental — pré-implementação

---

> O DDS **não é uma biblioteca de componentes**. É um sistema de engenharia visual que operacionaliza a [Digital Design Language (DDL)](./PHD_Digital_Design_Language.md).

**Documento de referência obrigatório:** `docs/design/PHD_Digital_Design_Language.md`

---

## Índice

1. [Governança do DDS](#governança-do-dds)
2. [Etapa 1 — Foundation](#etapa-1--foundation)
3. [Etapa 2 — Material System](#etapa-2--material-system)
4. [Etapa 3 — Layout System](#etapa-3--layout-system)
5. [Etapa 4 — Component Philosophy](#etapa-4--component-philosophy)
6. [Etapa 5 — Component Inventory](#etapa-5--component-inventory)
7. [Etapa 6 — Component Rules](#etapa-6--component-rules)
8. [Etapa 7 — Motion System](#etapa-7--motion-system)
9. [Etapa 8 — Data Language](#etapa-8--data-language)
10. [Etapa 9 — Accessibility](#etapa-9--accessibility)
11. [Etapa 10 — Anti-Patterns](#etapa-10--anti-patterns)
12. [Conclusão e próxima fase](#conclusão-e-próxima-fase)

---

# Governança do DDS

## Missão

Transformar a linguagem filosófica da DDL em um **sistema técnico reutilizável** capaz de responder:

> *"Como qualquer interface pode ser construída seguindo rigorosamente a Digital Design Language da PHD Studio?"*

## Protocolo de validação

Antes de incluir qualquer token, padrão ou componente no DDS, responder:

| Pergunta | Critério de aprovação |
|---|---|
| De qual **princípio da DDL** deriva? | Mínimo 1 dos 12 princípios |
| De qual **elemento do ambigrama** nasce? | Geometria, material, luz ou comportamento |
| Qual **percepção** pretende produzir? | Alinhada à Essência (Cap. 1 DDL) |
| O que acontece se for **removido**? | A identidade se mantém ou se dilui? |

**Se não houver resposta, o elemento não pertence ao DDS.**

## Escopo desta fase

### Incluído
- Tokens, materiais, layout, filosofia, inventário, regras, motion, dados, acessibilidade, anti-padrões

### Excluído (fases futuras)
- Implementação em código (CSS, Tailwind, React)
- Biblioteca Figma
- Migração da Landing Page
- Alteração de componentes, páginas ou layouts existentes

## Hierarquia do sistema

```
DDL (Filosofia)
 └── DDS (Engenharia)
      ├── Foundation (Tokens)
      ├── Materials (Superfícies)
      ├── Layout (Espaço)
      ├── Philosophy (DNA de componentes)
      ├── Inventory (O que construir)
      ├── Rules (Como comportar)
      ├── Motion (Física)
      ├── Data (Linguagem analítica)
      ├── Accessibility (Inclusão sem diluição)
      └── Anti-Patterns (O que nunca fazer)
           └── Implementação (Fase 03+)
                └── Auditoria Landing Page (Fase 04)
                     └── Migração Visual V3 (Fase 05)
```

---

# Etapa 1 — Foundation

> Fundação derivada dos Capítulos 3, 5, 6, 7, 8 e 9 da DDL.

---

## 1.1 PHDU — PHD Unit

### Definição

A **PHD Unit (PHDU)** é a unidade modular fundamental do sistema. Deriva da espessura de traço do ambigrama e da paridade traço/espaço (1:1).

| Token | Valor | Uso |
|---|---|---|
| `phdu-base` | **8px** | Unidade atômica |
| `phdu-scale` | Fibonacci × PHDU | Ritmo espacial |

### Escala PHDU

| Token | Cálculo | Valor | Uso primário |
|---|---|---|---|
| `phdu-0` | — | 0px | Reset |
| `phdu-1` | 1× | 8px | Micro-gap, bordas internas |
| `phdu-2` | 2× | 16px | Padding compacto, ícones |
| `phdu-3` | 3× | 24px | Padding padrão, gutter mobile |
| `phdu-5` | 5× | 40px | Separação de grupos |
| `phdu-8` | 8× | 64px | Separação de seções |
| `phdu-13` | 13× | 104px | Hero, respiro institucional |
| `phdu-21` | 21× | 168px | Margens de página amplas |

**Origem DDL:** Cap. 3 (PHDU), Cap. 8 (ritmo Fibonacci)  
**Origem ambigrama:** espessura monolinear do traço  
**Percepção:** precisão matemática, ritmo previsível

### Regras PHDU

1. Todo espaçamento usa múltiplos de `phdu-1` (8px)
2. Valores fora da escala Fibonacci são proibidos exceto `phdu-2` e `phdu-3` para densidade UI
3. Tipografia base: `phdu-2` = 16px (1rem)
4. Ícones: grid `phdu-3` × `phdu-3` (24×24)

---

## 1.2 Escala espacial

### Spacing tokens

| Token | Valor | Aplicação |
|---|---|---|
| `space-inline-xs` | phdu-1 (8px) | Gap entre ícone e label |
| `space-inline-sm` | phdu-2 (16px) | Gap entre elementos inline |
| `space-inline-md` | phdu-3 (24px) | Gap entre grupos inline |
| `space-stack-xs` | phdu-1 (8px) | Entre linhas densas |
| `space-stack-sm` | phdu-2 (16px) | Entre parágrafo e elemento |
| `space-stack-md` | phdu-3 (24px) | Entre blocos de conteúdo |
| `space-stack-lg` | phdu-5 (40px) | Entre seções de card |
| `space-stack-xl` | phdu-8 (64px) | Entre seções de página |
| `space-stack-2xl` | phdu-13 (104px) | Hero, landing |

### Padding tokens

| Token | Valor | Aplicação |
|---|---|---|
| `padding-compact` | phdu-2 (16px) | Inputs, badges, chips |
| `padding-default` | phdu-3 (24px) | Cards, painéis |
| `padding-spacious` | phdu-5 (40px) | Hero, modais |
| `padding-page` | phdu-5 / phdu-8 | Margens de página (responsive) |

### Densidade por contexto

| Contexto | space-stack | padding | Vazio mínimo |
|---|---|---|---|
| Dashboard | sm–md | compact–default | 20% |
| Landing | lg–2xl | spacious | 40–60% |
| Modal | md | default | 30% local |
| Mobile | xs–sm | compact | 15% |

**Origem DDL:** Cap. 8 (compressão/expansão)  
**Percepção:** controle, respiração intencional

---

## 1.3 Grid System

### Grid estrutural (12 colunas)

O grid ortogonal de 12 colunas é a **projeção plana** da grade hexagonal — interface utilizável sem forçar layouts isométricos em toda tela.

| Propriedade | Desktop (≥1280px) | Tablet (768–1279px) | Mobile (<768px) |
|---|---|---|---|
| Colunas | 12 | 8 | 4 |
| Gutter | phdu-3 (24px) | phdu-3 (24px) | phdu-2 (16px) |
| Margin | phdu-8 (64px) | phdu-5 (40px) | phdu-3 (24px) |
| Max-width | 1440px | 100% | 100% |

### Grid angular (decorativo/estrutural)

| Propriedade | Valor |
|---|---|
| Ângulo primário | 60° |
| Ângulo secundário | 120° |
| Uso | Divisores, conectores, hero accents, data viz |
| Proibição | Não usar como grid de layout principal |

### Grid de contenção

| Elemento | Grid | Forma |
|---|---|---|
| Ícone UI | 24×24px | Quadrado, traço angular |
| App icon | 48×48px mínimo | Círculo inscrito (anel de contenção) |
| Avatar produto | 32×32 / 40×40 | Hexágono ou círculo |
| Badge | auto × phdu-3 | Chanfrado ou circular |

### Colunas semânticas

| Zona | Colunas (desktop) | Função |
|---|---|---|
| Sidebar | 2–3 | Haste vertical (eixo estrutural) |
| Conteúdo primário | 6–8 | Módulos hexagonais de informação |
| Painel contextual | 3–4 | Dados, ações, IA |
| Full-width | 12 | Hero, tabelas, dashboards |

**Origem DDL:** Cap. 3 (grade hexagonal planificada)  
**Origem ambigrama:** hastes verticais = sidebar, módulos P/D = cards

---

## 1.4 Breakpoints

| Token | Valor | Nome | Comportamento |
|---|---|---|---|
| `bp-xs` | 0px | Mobile | 4 colunas, compact density |
| `bp-sm` | 640px | Mobile landscape | 4 colunas |
| `bp-md` | 768px | Tablet | 8 colunas |
| `bp-lg` | 1024px | Tablet landscape | 8–12 colunas |
| `bp-xl` | 1280px | Desktop | 12 colunas, default |
| `bp-2xl` | 1536px | Wide | 12 colunas, max-width 1440px |

### Regras de breakpoint

1. Mobile-first na implementação futura; dark-first na identidade
2. Sidebar colapsa em drawer abaixo de `bp-lg`
3. Tipografia escala down uma posição abaixo de `bp-md`
4. Chanfro 3D desativa abaixo de 32px de altura do componente

---

## 1.5 Containers

| Token | Max-width | Padding | Uso |
|---|---|---|---|
| `container-full` | 100% | padding-page | Dashboards, apps |
| `container-wide` | 1440px | phdu-8 | Landing, marketing |
| `container-content` | 1120px | phdu-5 | Artigos, docs |
| `container-narrow` | 720px | phdu-5 | Forms, onboarding |
| `container-micro` | 480px | phdu-3 | Modais, dialogs |

### Proporções de container (DDL Cap. 3)

| Proporção | Token | Uso |
|---|---|---|
| 1:1.5 | `ratio-ambigram` | Cards horizontais padrão |
| 1:√3 | `ratio-panel` | Sidebars, modais verticais |
| 2:3 | `ratio-hero` | Hero sections |
| 1:2 | `ratio-split` | Split layouts |

---

## 1.6 Radius System

> Cantos não são estética — são **gramática de material**.

### Árvore de decisão

```
O elemento é tipográfico (wordmark, label display)?
├── SIM → Squircle (border-radius suave)
└── NÃO → O elemento é estrutural (card, botão, input)?
    ├── SIM → Chanfro 60° (clip-path) OU reto (0px)
    └── NÃO → O elemento é de contenção (app icon, avatar)?
        ├── SIM → Circular (50%) OU hexagonal
        └── NÃO → Reto (0px)
```

### Tokens de radius

| Token | Valor | Origem | Uso |
|---|---|---|---|
| `radius-none` | 0px | Hastes do ambigrama | Dividers, tabelas, bordas estruturais |
| `radius-chamfer-sm` | clip 4px / 60° | Terminações chanfradas | Badges, chips, botões pequenos |
| `radius-chamfer-md` | clip 8px / 60° | Módulo hexagonal | Cards, painéis, botões |
| `radius-chamfer-lg` | clip 12px / 60° | Escala ampliada | Hero cards, modais |
| `radius-squircle-sm` | 4px | Wordmark STUDIO | Labels, tags tipográficas |
| `radius-squircle-md` | 8px | Cantos do wordmark | Inputs de texto, textareas |
| `radius-full` | 50% | Anel de contenção (ícones) | Avatares, app icons, toggles |

### Quando usar cada tipo

| Tipo | Quando | Nunca |
|---|---|---|
| **Chanfro 60°** | Superfícies estruturais (Grafite, Metal) | Tipografia, inputs longos |
| **Squircle** | Elementos tipográficos, campos de texto | Cards, botões primários |
| **Reto (0px)** | Tabelas, grids de dados, dividers | Botões, cards |
| **Circular** | App icons, avatares de sistema | Cards, containers de conteúdo |
| **Curva livre** | — | **Proibido** em qualquer contexto |

### Chanfro — especificação técnica

```
Chanfro PHD (canto superior-esquerdo exemplar):

    ╱────────
   ╱
  │
  │

Ângulo de corte: 60° (derivado da grade hexagonal)
Direção: corta do exterior para interior
Aplicação: clip-path ou SVG mask — nunca border-radius simulado
```

**Origem DDL:** Cap. 3 (terminações chanfradas), Cap. 4 (bordas grafite)  
**Percepção:** usinado, industrial, exclusivo PHD

---

## 1.7 Color Tokens

> Cores com **comportamento**, não paleta decorativa.

### Superfícies (Camada 0)

| Token | Valor | HSL | Uso |
|---|---|---|---|
| `surface-obsidian` | `#030303` | — | Fundo primário da aplicação |
| `surface-obsidian-textured` | `#030303` + noise 2% | — | Fundo com granulação (hero, ícones) |
| `surface-graphite-deep` | `#0A0A0A` | — | Cards, painéis (elevação 1) |
| `surface-graphite` | `#121212` | — | Cards hover, áreas interativas |
| `surface-graphite-raised` | `#1A1A1A` | — | Elementos elevados, dropdowns |
| `surface-recessed` | `#080808` | — | Inputs, áreas rebaixadas |

### Texto (Camada 1)

| Token | Valor | Opacidade | Uso |
|---|---|---|---|
| `text-primary` | `#FFFFFF` | 100% | Títulos, corpo principal |
| `text-secondary` | `#FFFFFF` | 70% | Descrições, subtítulos |
| `text-tertiary` | `#FFFFFF` | 40% | Placeholders, metadados |
| `text-disabled` | `#FFFFFF` | 25% | Elementos desabilitados |
| `text-inverse` | `#030303` | 100% | Texto sobre metal accent |

### Estrutura (bordas e divisores)

| Token | Valor | Uso |
|---|---|---|
| `border-subtle` | `rgba(255,255,255,0.06)` | Bordas de cards em repouso |
| `border-default` | `rgba(255,255,255,0.10)` | Bordas de inputs, dividers |
| `border-strong` | `rgba(255,255,255,0.15)` | Bordas de foco inativo, separadores |
| `border-accent` | Cor do produto a 40% | Estados ativos, seleção |

### Accents — Marca e produtos (Camada 2)

| Token | Valor | Produto | Papel |
|---|---|---|---|
| `accent-brand` | `#E50914` | PHD Studio | Ação primária, marca, crítico |
| `accent-brand-hover` | `#FF1A1A` | PHD Studio | Hover de CTA |
| `accent-brand-muted` | `rgba(229,9,20,0.15)` | PHD Studio | Background de alerta |
| `accent-creative` | `#2563EB` | PHD Creative | Ação em contexto criativo |
| `accent-creative-hover` | `#3B82F6` | PHD Creative | Hover |
| `accent-creative-muted` | `rgba(37,99,235,0.15)` | PHD Creative | Background sutil |
| `accent-insights` | `#F5A623` | PHD Insights | Dados, métricas, analytics |
| `accent-insights-hover` | `#FFBB40` | PHD Insights | Hover |
| `accent-insights-muted` | `rgba(245,166,35,0.15)` | PHD Insights | Background de highlight |
| `accent-flow` | `#9CA3AF` | PHD Content Flow | Fluxo, pipeline, automação |
| `accent-flow-hover` | `#B0B7C3` | PHD Content Flow | Hover |
| `accent-flow-muted` | `rgba(156,163,175,0.15)` | PHD Content Flow | Background sutil |
| `accent-dev` | `#10B981` | Tecnologia / Dev | Código, integrações, infra |

### Estados

| Token | Valor | Uso |
|---|---|---|
| `state-success` | `#10B981` | Confirmação, conclusão |
| `state-success-muted` | `rgba(16,185,129,0.15)` | Background de sucesso |
| `state-warning` | `#F5A623` | Atenção, revisão necessária |
| `state-warning-muted` | `rgba(245,166,35,0.15)` | Background de warning |
| `state-error` | `#E50914` | Erro crítico (reusa brand) |
| `state-error-muted` | `rgba(229,9,20,0.15)` | Background de erro |
| `state-info` | `#2563EB` | Informação neutra |
| `state-info-muted` | `rgba(37,99,235,0.15)` | Background de info |

### Overlays

| Token | Valor | Uso |
|---|---|---|
| `overlay-scrim` | `rgba(3,3,3,0.70)` | Backdrop de modal |
| `overlay-scrim-heavy` | `rgba(3,3,3,0.85)` | Backdrop de dialog crítico |
| `overlay-hover` | `rgba(255,255,255,0.04)` | Hover em superfícies |
| `overlay-active` | `rgba(255,255,255,0.08)` | Active/pressed |
| `overlay-selected` | `rgba(255,255,255,0.06)` | Item selecionado em lista |

### IA

| Token | Valor | Uso |
|---|---|---|
| `ai-processing` | Cor accent do produto | Glow durante processamento |
| `ai-suggestion` | `rgba(255,255,255,0.30)` | Conteúdo fantasma (antecipação) |
| `ai-connection` | Cor accent a 60% | Linhas conectoras entre dados |
| `ai-resolved` | `text-primary` | Dado após resolução |

### Feedback — dados ao vivo

| Token | Valor | Uso |
|---|---|---|
| `data-live` | `accent-brand` | Valor em tempo real |
| `data-positive` | `state-success` | Tendência positiva |
| `data-negative` | `state-error` | Tendência negativa |
| `data-neutral` | `text-secondary` | Sem variação |

### Comportamento cromático — regras

| Regra | Especificação |
|---|---|
| Accent máximo por viewport | 15% da área visível |
| CTAs primários por viewport | 1 |
| Cores de produto simultâneas | 1 (+ vermelho de marca residual) |
| Texto colorido | Proibido (exceto status labels) |
| Gradiente | Proibido (exceto noise em obsidiana) |
| Fundo colorido | Proibido |

**Origem DDL:** Cap. 6 (comportamento cromático)  
**Percepção:** energia cirúrgica, maturidade operacional

---

## 1.8 Typography Tokens

### Famílias (direção para implementação)

| Token | Família direcionada | Papel |
|---|---|---|
| `font-display` | Sans-serif geométrica wide (ex: Michroma, Orbitron, custom) | Display, hero |
| `font-body` | Sans-serif neutra (ex: Inter, DM Sans) | Corpo, UI |
| `font-mono` | Monospace técnica (ex: JetBrains Mono, IBM Plex Mono) | Dados, código |

### Escala tipográfica

| Token | Size | Line-height | Weight | Tracking | Uso |
|---|---|---|---|---|---|
| `type-display-xl` | 64px / 4rem | 1.1 | 700 | +0.04em | Hero landing |
| `type-display` | 48px / 3rem | 1.1 | 700 | +0.04em | Títulos de impacto |
| `type-heading-1` | 32px / 2rem | 1.2 | 600 | +0.02em | Página |
| `type-heading-2` | 24px / 1.5rem | 1.3 | 600 | +0.02em | Seção |
| `type-heading-3` | 20px / 1.25rem | 1.3 | 600 | +0.01em | Grupo |
| `type-title` | 18px / 1.125rem | 1.4 | 500 | 0 | Card title |
| `type-body` | 16px / 1rem | 1.5 | 400 | 0 | Parágrafo |
| `type-body-sm` | 14px / 0.875rem | 1.5 | 400 | 0 | Texto secundário |
| `type-caption` | 12px / 0.75rem | 1.4 | 400 | +0.02em | Metadados |
| `type-label` | 12px / 0.75rem | 1.0 | 500 | +0.06em | Labels UI, caps |
| `type-mono` | 14px / 0.875rem | 1.4 | 500 | 0 | Métricas, dados |
| `type-mono-lg` | 24px / 1.5rem | 1.2 | 500 | -0.01em | KPI grande |

### Mapeamento semântico

| Papel DDL | Token DDS |
|---|---|
| Display | `type-display-xl`, `type-display` |
| Headings | `type-heading-1` → `type-heading-3` |
| Titles | `type-title` |
| Body | `type-body`, `type-body-sm` |
| Caption | `type-caption` |
| Label | `type-label` |
| Mono | `type-mono`, `type-mono-lg` |

### Regras tipográficas

1. Máximo 2 famílias por viewport (`font-display` + `font-body` OU `font-body` + `font-mono`)
2. Dados numéricos: sempre `font-mono`
3. Itálico: proibido
4. Light/Thin: proibido
5. Hierarquia por opacidade (`text-*`), não por cor

**Origem DDL:** Cap. 7  
**Origem ambigrama:** display wide = STUDIO; mono = precisão das hastes

---

## 1.9 Motion Tokens

### Duração

| Token | Valor | Uso |
|---|---|---|
| `duration-instant` | 100ms | Micro-feedback |
| `duration-fast` | 150ms | Hover, focus |
| `duration-normal` | 300ms | Transições padrão |
| `duration-slow` | 500ms | Modais, páginas |
| `duration-transform` | 700ms | Reorganização IA |
| `duration-continuous` | 1200ms+ | Loading, streaming |

### Easing

| Token | Curva | Uso |
|---|---|---|
| `ease-default` | `cubic-bezier(0.16, 1, 0.3, 1)` | Transições gerais |
| `ease-enter` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Elementos entrando |
| `ease-exit` | `cubic-bezier(0.4, 0.0, 1, 1)` | Elementos saindo |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Micro-interações (damping alto) |
| `ease-linear` | `linear` | Rotação de loading apenas |

### Delay (cascata)

| Token | Valor | Uso |
|---|---|---|
| `delay-chain` | 40ms | Entre elementos em cascata |
| `delay-stagger` | 60ms | Listas, grids animados |
| `delay-max-chain` | 600ms | Duração total máxima de cadeia |

### Massa (multiplicador de duração)

| Token | Multiplicador | Elemento |
|---|---|---|
| `mass-infinite` | ∞ (não move) | Fundo, obsidiana |
| `mass-heavy` | 1.5× | Cards, painéis |
| `mass-medium` | 1.0× | Dados, valores |
| `mass-light` | 0.7× | Ícones, badges |
| `mass-minimal` | 0.5× | Toggles, checkboxes |

### Física — transformações

| Token | Valor | Uso |
|---|---|---|
| `scale-press` | 0.98 | Click/tap |
| `scale-emerge` | 0.95 → 1.0 | Modal enter |
| `translate-emerge` | 8–16px Y | Card enter |
| `rotate-transform` | 180deg | IA transform |
| `rotate-loading` | 360deg continuous | Processing |
| `shake-error` | 2–3px × 2 ciclos | Erro |

**Origem DDL:** Cap. 9  
**Percepção:** organismo único, engenharia viva

---

## 1.10 Shadow System

> Sombras derivadas da luz superior-esquerda a 45°.

### Elevação

| Token | Valor | Nível | Material |
|---|---|---|---|
| `shadow-none` | none | 0 | Obsidiana |
| `shadow-contact` | `2px 4px 12px rgba(0,0,0,0.25)` | 1 | Grafite |
| `shadow-raised` | `4px 8px 24px rgba(0,0,0,0.35)` | 2 | Grafite hover |
| `shadow-elevated` | `8px 16px 48px rgba(0,0,0,0.45)` | 3 | Modal, dropdown |
| `shadow-accent` | `4px 8px 24px rgba(229,9,20,0.20)` | 3+ | Metal accent |

### Sombra interna (recesso)

| Token | Valor | Uso |
|---|---|---|
| `shadow-inset` | `inset 0 2px 4px rgba(0,0,0,0.30)` | Inputs, áreas rebaixadas |
| `shadow-inset-deep` | `inset 0 4px 8px rgba(0,0,0,0.40)` | Textarea, code block |

### Highlight (luz)

| Token | Valor | Uso |
|---|---|---|
| `highlight-edge` | `inset 1px 0 0 rgba(255,255,255,0.06)` | Borda superior de card |
| `highlight-edge-left` | `inset 0 1px 0 rgba(255,255,255,0.04)` | Borda esquerda |
| `highlight-glass` | `inset 0 1px 0 rgba(255,255,255,0.15)` | Topo de vidro fumê |

### Glow funcional

| Token | Valor | Uso |
|---|---|---|
| `glow-focus` | `0 0 0 2px rgba(255,255,255,0.10)` | Focus ring |
| `glow-processing` | `0 0 12px rgba({accent}, 0.30)` | IA processando |
| `glow-live` | `0 0 8px rgba({accent}, 0.40)` | Dado ao vivo |
| `glow-connection` | `0 0 4px rgba({accent}, 0.50)` | Conector ativo |

### Regras de sombra

1. Direção sempre: deslocamento positivo em X (direita) e Y (baixo)
2. Sombras coloridas: apenas em `shadow-accent` e `glow-*`
3. Máximo 1 sombra por elemento (sem empilhamento)
4. Vidro fumê: blur, não sombra

**Origem DDL:** Cap. 5 (luz e sombra)  
**Percepção:** profundidade crível, ambiente unificado

---

## 1.11 Opacity System

### Escala de opacidade

| Token | Valor | Uso |
|---|---|---|
| `opacity-full` | 100% | Texto primário, ícones ativos |
| `opacity-high` | 85% | Corpo de texto |
| `opacity-medium` | 70% | Texto secundário |
| `opacity-low` | 40% | Terciário, placeholders |
| `opacity-subtle` | 15% | Bordas, dividers |
| `opacity-faint` | 8% | Hover backgrounds |
| `opacity-ghost` | 30% | Sugestões IA (fantasma) |
| `opacity-disabled` | 25% | Elementos desabilitados |

### Blur (vidro fumê)

| Token | Valor | Uso |
|---|---|---|
| `blur-none` | 0 | Grafite, metal |
| `blur-sm` | 8px | Tooltip glass |
| `blur-md` | 16px | Dropdown, popover |
| `blur-lg` | 24px | Modal backdrop |
| `blur-xl` | 40px | Overlay fullscreen |

### Transparência de superfície

| Token | Valor | Uso |
|---|---|---|
| `surface-glass-light` | `rgba(18,18,18,0.60)` | Vidro sobre fundo claro |
| `surface-glass-dark` | `rgba(18,18,18,0.75)` | Vidro sobre obsidiana |
| `surface-glass-heavy` | `rgba(10,10,10,0.85)` | Modal sobre conteúdo |

**Origem DDL:** Cap. 4 (vidro fumê 60–80%), Cap. 5 (hierarquia por opacidade)

---

# Etapa 2 — Material System

> Transformação dos quatro materiais da DDL (Cap. 4) em sistema operacional.

---

## 2.1 Obsidiana

### Definição
Campo primário de operação. Canvas absoluto sobre o qual toda interface é construída.

### Tokens
- `surface-obsidian` / `surface-obsidian-textured`

### Comportamento

| Propriedade | Especificação |
|---|---|
| Absorção de luz | Total — não reflete |
| Textura | Noise 2–3% opacidade, granulação fina |
| Variação tonal | < 1% — imperceptível à distância |
| Elevação | 0 — nunca se move, nunca tem sombra |
| Interação | Nenhuma — não é clicável |

### Profundidade
Obsidiana **é** o fundo do universo visual. Não tem profundidade — tem **presença**. Tudo existe sobre ela.

### Interação com luz
- Não recebe highlight
- Não recebe sombra
- Reflexo difuso mínimo apenas quando cards estão presentes (sombra projetada sobre ela)

### Estados
Obsidiana não tem estados — é imutável.

### Limitações
- Nunca usar como cor de card ou elemento interativo
- Nunca substituir por `#000000` flat sem textura em contextos hero/ícone
- Em modo claro (derivado): inverte para branco com mesma lógica

### Aplicações
- Background de aplicação
- Hero backgrounds
- Área atrás de modais (scrim combina com obsidiana)
- Canvas de dashboards

### Anti-padrões
- Gradiente no fundo
- Pattern decorativo hexagonal em toda tela
- Imagem de fundo sem overlay obsidiana

**DDL:** Princípio 03 (Escuro como campo nativo) · **Ambigrama:** campo negro ao redor do símbolo

---

## 2.2 Grafite

### Definição
Superfície estrutural sólida. O "corpo" do ambigrama — placa usinada sobre obsidiana.

### Tokens
- `surface-graphite-deep` / `surface-graphite` / `surface-graphite-raised`

### Comportamento

| Propriedade | Especificação |
|---|---|
| Elevação | Nível 1 sobre obsidiana |
| Acabamento | Matte — difusão uniforme |
| Bordas | Chanfro 60° (`radius-chamfer-md`) |
| Sombra | `shadow-contact` em repouso, `shadow-raised` em hover |
| Reflexo | Nenhum especular |

### Profundidade
Grafite é **apoiado** sobre obsidiana. Sombra de contato indica peso. Highlight sutil na borda superior-esquerda indica luz.

### Interação com luz
- `highlight-edge` + `highlight-edge-left` em repouso
- Sombra aumenta em hover (+1 nível)
- Sem emissão própria

### Estados

| Estado | Comportamento |
|---|---|
| Default | `surface-graphite-deep`, `shadow-contact` |
| Hover | `surface-graphite`, `shadow-raised`, `overlay-hover` |
| Active | `surface-graphite-raised`, `shadow-contact`, `scale-press` |
| Selected | `border-accent`, `overlay-selected` |
| Disabled | `opacity-disabled`, sem sombra |

### Limitações
- Não usar transparência (não é vidro)
- Chanfro 3D (bevel) apenas em elementos ≥ 48px de altura
- Máximo 3 níveis de grafite empilhados

### Aplicações
- Cards
- Sidebars
- Painéis de conteúdo
- Tabelas (container)
- List items

**DDL:** Princípio 11 (Materialidade) · **Ambigrama:** corpo sólido do símbolo

---

## 2.3 Vidro Fumê

### Definição
Camada de transição. Separa sem bloquear. Contexto flutuante sobre grafite ou obsidiana.

### Tokens
- `surface-glass-dark` / `surface-glass-heavy`
- `blur-md` / `blur-lg` / `blur-xl`

### Comportamento

| Propriedade | Especificação |
|---|---|
| Transparência | 60–85% |
| Blur | 16–40px backdrop-filter |
| Borda | `border-subtle` (8–12% branco) |
| Reflexo | `highlight-glass` no topo |
| Sombra | Nenhuma — profundidade via blur |

### Profundidade
Vidro fumê **flutua** acima de outras camadas. Não projeta sombra — distorce o que está abaixo.

### Interação com luz
- Reflexo especular fino no topo (1px)
- Refração sutil na borda de entrada da luz
- Transmissão da luz ambiente do fundo

### Estados

| Estado | Comportamento |
|---|---|
| Default | `surface-glass-dark`, `blur-md` |
| Open (modal) | `surface-glass-heavy`, `blur-lg` |
| Scrim | `overlay-scrim` sobre obsidiana |

### Limitações
- **Nunca** como material de card estático
- **Nunca** em mais de 1 camada de vidro simultânea
- Performance: limitar blur em mobile a `blur-sm`
- Fallback sem backdrop-filter: `surface-graphite-deep` sólido

### Aplicações
- Modais
- Dropdowns
- Tooltips (contexto)
- Popovers
- Command palette
- Overlay de IA (contexto, não decoração)

**DDL:** Cap. 4 (vidro fumê) · **Ambigrama:** anel de contenção translúcido

---

## 2.4 Metal Accent

### Definição
Superfície de ação e energia. Material que emite presença — o vermelho (ou accent do produto) com peso físico.

### Tokens
- `accent-brand` (+ variantes hover/muted)
- `shadow-accent`
- Chanfro com highlight/sombra de cor

### Comportamento

| Propriedade | Especificação |
|---|---|
| Acabamento | Matte metálico |
| Chanfro | Visível — highlight +15% luminosidade, sombra -20% |
| Sombra | `shadow-accent` (colorida, sutil) |
| Peso visual | Maior que qualquer superfície adjacente |
| Área máxima | 15% do viewport |

### Profundidade
Metal accent é o elemento mais **elevado** do sistema. Parece o único material que emite energia própria.

### Interação com luz
- Highlight no chanfro superior-esquerdo
- Emissão sutil em estado ativo (glow funcional, não neon)
- Hover: +10% luminosidade, sombra aumenta

### Estados

| Estado | Comportamento |
|---|---|
| Default | Cor accent sólida, chanfro, `shadow-accent` |
| Hover | `accent-*-hover`, luminosidade +10% |
| Active | `scale-press`, sombra reduz |
| Processing | `glow-processing` pulsante |
| Disabled | `opacity-disabled`, sem chanfro, sem sombra |

### Limitações
- Um CTA metal por viewport
- Nunca como background de seção
- Nunca em texto de corpo
- Texto sobre metal: sempre `text-inverse` (escuro)

### Aplicações
- Botão primário (CTA)
- Toggle ativo
- Badge de status crítico
- Indicador de gravação/live
- FAB (floating action button)

**DDL:** Princípio 05 (Cor como sinal) · **Ambigrama:** vermelho sólido com chanfro 3D

---

## 2.5 Convivência de materiais

| Combinação | Permitido | Notas |
|---|---|---|
| Obsidiana + Grafite | ✅ | Padrão principal |
| Obsidiana + Vidro | ✅ | Modais |
| Grafite + Vidro | ✅ | Dropdown sobre card |
| Grafite + Metal | ✅ | CTA em card |
| Vidro + Metal | ✅ | CTA em modal |
| Metal + Metal | ⚠️ | Máximo 2 accents visíveis |
| Vidro + Vidro | ❌ | Proibido |
| 4 materiais simultâneos | ❌ | Máximo 3 |

---

# Etapa 3 — Layout System

> Arquitetura espacial derivada do Cap. 8 DDL e da anatomia do ambigrama.

---

## 3.1 Filosofia de layout

O layout PHD organiza informação como o ambigrama organiza letras:

- **Haste vertical (sidebar)** = eixo estrutural fixo
- **Módulos hexagonais (cards)** = blocos de conteúdo repetidos
- **Barra diagonal (conector)** = relação entre módulos
- **Campo negro (margem)** = silêncio estrutural

## 3.2 Zonas de layout

```
┌──────────────────────────────────────────────────────┐
│  MARGIN (phdu-8)                                     │
│  ┌──────┬─────────────────────────────┬───────────┐  │
│  │      │                             │           │  │
│  │ SIDE │      CONTENT PRIMARY        │  CONTEXT  │  │
│  │ BAR  │      (6-8 cols)             │  PANEL    │  │
│  │      │                             │  (3-4)    │  │
│  │ 2-3  │                             │           │  │
│  │ cols │                             │           │  │
│  │      │                             │           │  │
│  └──────┴─────────────────────────────┴───────────┘  │
│  MARGIN (phdu-8)                                     │
└──────────────────────────────────────────────────────┘
        ↑ OBSIDIANA (fundo)
```

| Zona | Colunas | Material | Comportamento |
|---|---|---|---|
| Sidebar | 2–3 | Grafite | Fixa, haste vertical |
| Content | 6–8 | Grafite (cards) | Fluido, scroll |
| Context | 3–4 | Grafite / Vidro | Opcional, colapsável |
| Full | 12 | Obsidiana / Grafite | Hero, tabelas |

## 3.3 Alinhamentos

| Regra | Especificação |
|---|---|
| Eixo primário | Esquerda — conteúdo ancora à esquerda |
| Baseline grid | Múltiplos de phdu-2 (16px) |
| Títulos | Alinhados ao eixo primário do grid |
| Dados numéricos | Alinhados à direita dentro do módulo |
| Modais / empty states | Centralizado (exceção) |
| Conectores | Diagonal ↗ (60°) entre módulos relacionados |

## 3.4 Ritmo espacial

### Regra dos vazios

| Contexto | Vazio mínimo | Token |
|---|---|---|
| Landing / Hero | 40–60% | `space-stack-2xl` |
| Página de conteúdo | 30% | `space-stack-xl` |
| Dashboard | 20% | `space-stack-lg` |
| Modal | 30% local | `padding-spacious` |
| Mobile | 15% | `space-stack-md` |

### Ritmo de repetição
- Cards em grid: gap uniforme (`space-inline-md`)
- Um card por seção pode estender além do grid (destaque — haste estendida)
- Seções separadas por no mínimo `space-stack-xl`

## 3.5 Composição

### Padrões de composição aprovados

| Padrão | Proporção | Uso |
|---|---|---|
| **Split 1:2** | Sidebar + Content | Apps, dashboards |
| **Split 2:1** | Content + Panel | Edição com preview |
| **Centered narrow** | container-narrow | Forms, onboarding |
| **Full bleed hero** | container-full | Landing |
| **Grid 3-up** | 3 cards `ratio-ambigram` | Features, produtos |
| **Stack vertical** | 1 coluna | Mobile, artigos |

### Assimetria controlada
- Peso visual pode concentrar-se à esquerda (conteúdo) ou direita (painel)
- Módulos internos **sempre** alinhados ao grid
- Diagonal ↗ pode atravessar composição como divider direcional

## 3.6 Densidade

| Nível | Padding | Space | Tipografia | Contexto |
|---|---|---|---|---|
| **Compact** | `padding-compact` | `space-stack-xs` | `type-body-sm` | Tabelas, admin |
| **Default** | `padding-default` | `space-stack-md` | `type-body` | Apps, CMS |
| **Spacious** | `padding-spacious` | `space-stack-xl` | `type-display` | Landing, onboarding |

## 3.7 Regras de layout

1. Conteúdo nunca toca a borda do viewport — sempre `padding-page`
2. Máximo 3 níveis de aninhamento de cards
3. Sidebar nunca desaparece em desktop sem equivalente (drawer)
4. Hero nunca tem mais de 1 CTA metal accent
5. Seções consecutivas nunca sem `space-stack-xl` entre elas
6. Grid angular é accent, nunca estrutura

**Origem DDL:** Cap. 8, Cap. 3 · **Percepção:** controle, hierarquia, silêncio

---

# Etapa 4 — Component Philosophy

> Como um componente PHD deve nascer — antes de existir qualquer implementação.

---

## 4.1 A pergunta fundamental

Um componente PHD deve parecer:

| Qualidade | Resposta | Justificativa |
|---|---|---|
| Construído? | **Sim** | Princípio 01 — geometria antes de decoração |
| Encaixado? | **Sim** | Princípio 02 — interconexão; compartilha eixos |
| Suspenso? | **Apenas vidro fumê** | Modais flutuam; cards apoiam |
| Apoiado? | **Sim** | Grafite apoia-se sobre obsidiana com sombra |
| Usinado? | **Sim** | Chanfros, bordas precisas, material definido |
| Sólido? | **Sim** | Peso visual, massa em animação |
| Modular? | **Sim** | Módulos repetíveis como hexágonos do símbolo |

## 4.2 Metáfora do componente

> Todo componente é um **bloco usinado** que se encaixa em uma estrutura maior — como P, H e D se encaixam no ambigrama.

Não é:
- Um card flutuando sem gravidade
- Um botão genérico com border-radius
- Um popup alienígena sem relação com o layout
- Um elemento decorativo sem função

É:
- Uma peça com material definido
- Com peso e sombra coerentes
- Que compartilha eixo com vizinhos
- Que reage à luz do sistema
- Que se move com física do sistema

## 4.3 Anatomia de um componente

```
┌─ Highlight edge (luz) ─────────────────────┐
│ ┌─ Chanfro 60° ──────────────────────────┐ │
│ │                                         │ │
│ │  CONTEÚDO (texto, ícone, dado)          │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│ ▓▓ Sombra de contato (base-direita) ▓▓▓▓▓▓▓ │
└─────────────────────────────────────────────┘
         ↑ Material (grafite/metal/vidro)
```

### Camadas internas

| Camada | Função |
|---|---|
| Container | Material + forma (chanfro) |
| Padding | `padding-compact` ou `padding-default` |
| Content | Texto, ícone, dado |
| State layer | `overlay-hover` / `overlay-active` |
| Focus ring | `glow-focus` |

## 4.4 Classificação de componentes por material

| Material | Componentes |
|---|---|
| **Obsidiana** | Page background, scrim |
| **Grafite** | Card, Sidebar, Table, Panel, List |
| **Vidro fumê** | Modal, Dropdown, Tooltip, Popover |
| **Metal accent** | Button primary, Toggle on, Badge critical, FAB |
| **Recesso** | Input, Textarea, Code block |

## 4.5 Hierarquia de componentes

```
Nível 0 — Foundation (tokens, materiais)
Nível 1 — Primitives (Surface, Text, Icon, Divider)
Nível 2 — Inputs (Button, Input, Select, Switch...)
Nível 3 — Composites (Card, Dialog, Navbar, Table...)
Nível 4 — Patterns (Hero, Dashboard layout, CTA section)
Nível 5 — Templates (Landing page, App shell, CMS layout)
```

## 4.6 Princípios de nascimento

Antes de criar qualquer componente, documentar:

1. **Material** — qual dos 4 materiais?
2. **Geometria** — chanfro, squircle, reto ou circular?
3. **Elevação** — nível 0–3?
4. **Massa** — heavy, medium, light?
5. **Estados** — quais estados existem?
6. **Conexão** — com quais componentes se relaciona?
7. **Derivación DDL** — princípio + elemento do ambigrama

**Percepção alvo:** peça de engenharia, não widget de biblioteca.

---

# Etapa 5 — Component Inventory

> Mapeamento completo de componentes futuros. **Nenhum será desenvolvido nesta fase.**

Legenda: `[P]` = Prioridade alta (Fase 03) · `[M]` = Média · `[B]` = Baixa

---

## 5.1 Foundation

| Componente | Descrição | Material | Prioridade |
|---|---|---|---|
| **Surface** | Wrapper base com material e elevação | Todos | P |
| **Card** | Container de conteúdo com chanfro | Grafite | P |
| **Divider** | Separador horizontal/vertical/diagonal | Obsidiana/Grafite | P |
| **Container** | Max-width + padding responsivo | — | P |
| **Stack** | Layout flex vertical com space tokens | — | P |
| **Grid** | Layout grid 12 colunas | — | P |
| **Spacer** | Espaçamento semântico (phdu) | — | P |
| **Icon** | Ícone monoline angular 24×24 | — | P |
| **Text** | Tipografia semântica com tokens | — | P |
| **Bevel** | Wrapper de chanfro 3D (≥48px) | Grafite/Metal | M |

---

## 5.2 Navigation

| Componente | Descrição | Material | Prioridade |
|---|---|---|---|
| **Navbar** | Barra superior de navegação global | Grafite / Vidro | P |
| **Sidebar** | Navegação lateral fixa (haste vertical) | Grafite | P |
| **SidebarItem** | Item de navegação com estado ativo | Grafite + accent | P |
| **Breadcrumb** | Trilha de navegação hierárquica | Text only | M |
| **Tabs** | Navegação por abas com indicador | Grafite | P |
| **TabPanel** | Conteúdo de aba | Grafite | P |
| **Pagination** | Navegação de páginas | Grafite | M |
| **Stepper** | Progresso de etapas (diagonal ↗) | Grafite + accent | M |
| **CommandPalette** | Busca global (⌘K) | Vidro fumê | M |
| **MobileDrawer** | Sidebar colapsada em mobile | Vidro fumê | P |

---

## 5.3 Inputs

| Componente | Descrição | Material | Prioridade |
|---|---|---|---|
| **Button** | Ação — primary (metal), secondary (grafite), ghost | Metal / Grafite | P |
| **IconButton** | Ação compacta com ícone | Grafite / Metal | P |
| **Input** | Campo de texto single-line | Recesso | P |
| **Textarea** | Campo de texto multi-line | Recesso | P |
| **Select** | Seleção em dropdown | Recesso + Vidro | P |
| **Combobox** | Select com busca | Recesso + Vidro | M |
| **Switch** | Toggle binário | Metal (on) / Grafite (off) | P |
| **Checkbox** | Seleção múltipla | Grafite + accent | P |
| **Radio** | Seleção única | Grafite + accent | P |
| **Slider** | Valor em range | Grafite + accent | M |
| **DatePicker** | Seleção de data | Recesso + Vidro | B |
| **FileUpload** | Upload com drag & drop | Grafite (dashed) | M |
| **SearchInput** | Input com ícone de busca | Recesso | P |
| **TagInput** | Input de tags/chips | Recesso + chips | M |

---

## 5.4 Feedback

| Componente | Descrição | Material | Prioridade |
|---|---|---|---|
| **Alert** | Mensagem inline (success/warning/error/info) | Grafite + accent muted | P |
| **Toast** | Notificação temporária | Vidro fumê | P |
| **Dialog** | Modal de confirmação | Vidro fumê | P |
| **Modal** | Overlay de conteúdo | Vidro fumê | P |
| **Drawer** | Painel lateral deslizante | Vidro fumê / Grafite | M |
| **Progress** | Barra de progresso | Grafite + accent | P |
| **ProgressCircle** | Progresso circular (anel) | accent | M |
| **Skeleton** | Placeholder de carregamento | Grafite pulsante | P |
| **Spinner** | Loading hexagonal rotativo | accent | P |
| **Tooltip** | Dica contextual | Vidro fumê | P |
| **Popover** | Conteúdo flutuante | Vidro fumê | M |
| **EmptyState** | Estado vazio com ação | Grafite | P |

---

## 5.5 Data

| Componente | Descrição | Material | Prioridade |
|---|---|---|---|
| **Table** | Dados tabulares | Grafite | P |
| **DataGrid** | Tabela com sorting/filtering | Grafite | M |
| **Metric** | KPI com valor mono grande | Grafite | P |
| **MetricDelta** | Variação (+/-) com cor semântica | Text + data tokens | P |
| **Chart** | Visualização (barras angulares 60°) | Grafite | M |
| **Sparkline** | Mini gráfico inline | accent | M |
| **Timeline** | Sequência temporal (conector ↗) | Grafite | M |
| **Badge** | Status compacto | Metal / Grafite | P |
| **Status** | Indicador de estado (dot + label) | accent | P |
| **Tag** | Label categorização | Grafite | P |
| **Chip** | Tag removível | Grafite | M |
| **Avatar** | Imagem/ícone circular | Circular | P |
| **Code** | Bloco de código mono | Recesso | M |
| **Copy** | Texto copiável com feedback | Mono + toast | M |

---

## 5.6 Media

| Componente | Descrição | Material | Prioridade |
|---|---|---|---|
| **Image** | Imagem com tratamento PHD | Chanfro frame | M |
| **Video** | Player com controles grafite | Grafite | M |
| **Gallery** | Grid de imagens | Grafite cards | B |
| **Carousel** | Slides com transição reorganização | Grafite | M |
| **Logo** | Ambigrama + wordmark | — | P |

---

## 5.7 Layout (Patterns)

| Componente | Descrição | Material | Prioridade |
|---|---|---|---|
| **Hero** | Seção principal de landing | Obsidiana + accent | P |
| **Spotlight** | Destaque de feature com vazio | Obsidiana | M |
| **CTA** | Call-to-action section | Grafite + Metal | P |
| **Footer** | Rodapé institucional | Grafite | P |
| **Section** | Wrapper de seção com ritmo | — | P |
| **SplitLayout** | 1:2 ou 2:1 | — | P |
| **DashboardShell** | Layout app com sidebar | Grafite | P |
| **OnboardingStep** | Tela de onboarding (centered) | Obsidiana | M |

---

## 5.8 IA (Comportamentais — não decorativos)

| Componente | Descrição | Material | Prioridade |
|---|---|---|---|
| **AIContainer** | Container que reorganiza conteúdo | Grafite → transform | P |
| **SuggestionGhost** | Conteúdo fantasma (30% opacidade) | `ai-suggestion` | P |
| **ConnectionLine** | Conector diagonal entre dados | `ai-connection` | M |
| **ProcessingIndicator** | Hexágono rotativo + glow | accent + glow | P |
| **ReorganizeTransition** | Layout shift de IA (180°) | Motion tokens | M |
| **InsightCard** | Card de insight com accent dourado | Grafite + insights | M |

---

## 5.9 Resumo quantitativo

| Categoria | Total | Prioridade P |
|---|---|---|
| Foundation | 10 | 9 |
| Navigation | 10 | 6 |
| Inputs | 14 | 10 |
| Feedback | 12 | 9 |
| Data | 14 | 8 |
| Media | 5 | 1 |
| Layout | 8 | 5 |
| IA | 6 | 3 |
| **Total** | **79** | **51** |

---

# Etapa 6 — Component Rules

> Regras universais de comportamento para todos os componentes do inventário.

---

## 6.1 Respiração

| Regra | Especificação |
|---|---|
| Padding interno mínimo | `padding-compact` (16px) |
| Gap entre filhos | `space-inline-sm` mínimo |
| Conteúdo nunca toca borda do componente | 1× phdu-1 mínimo |
| Labels separados do input | `space-stack-xs` |
| Ícone + texto | `space-inline-xs` |

## 6.2 Foco (focus)

| Propriedade | Valor |
|---|---|
| Estilo | `glow-focus` — ring branco 10% |
| Offset | 2px |
| Movimento | Nenhum — apenas glow |
| Cor | Nunca accent color no focus ring |
| Visibilidade | Sempre visível em navegação por teclado |
| Forma | Segue geometria do componente (chanfro/squircle) |

## 6.3 Hover

| Material | Comportamento |
|---|---|
| Grafite | `overlay-hover` + `shadow-raised` |
| Metal | Luminosidade +10% |
| Vidro | `highlight-glass` intensifica |
| Recesso | `border-strong` |
| Text/Link | `text-primary` (de secondary) |
| Movimento | Nenhum deslocamento — apenas material |

## 6.4 Estados

| Estado | Visual | Motion |
|---|---|---|
| **Default** | Material base | — |
| **Hover** | +1 elevação ou overlay | `duration-fast` |
| **Active/Pressed** | `scale-press` + overlay-active | `duration-instant` |
| **Focus** | `glow-focus` | instant |
| **Selected** | `border-accent` + `overlay-selected` | `duration-normal` |
| **Disabled** | `opacity-disabled`, sem sombra, sem hover | — |
| **Loading** | Skeleton ou Spinner, interação bloqueada | continuous |
| **Error** | `state-error` border + `shake-error` | `duration-fast` |
| **Success** | `glow-live` breve → default | 300ms |

## 6.5 Desabilitado

- Opacidade: `opacity-disabled` (25%)
- Sombra: removida
- Hover: desativado
- Cursor: not-allowed
- Cor: nunca cinza diferente — mesma cor com opacidade reduzida
- Chanfro: mantido (forma não muda, apenas energia)

## 6.6 Aparição (enter)

| Tipo de componente | Padrão | Token |
|---|---|---|
| Card, Panel | Emergir (fade + translate-y) | `ease-enter`, `duration-normal` |
| Modal, Dialog | Materializar (scale + fade) | `ease-enter`, `duration-slow` |
| Toast | Emergir da direita | `ease-enter`, `duration-normal` |
| Dropdown | Desdobrar (expand) | `ease-enter`, `duration-fast` |
| Tooltip | Fade | `duration-fast` |
| Dados IA | Reorganizar | `ease-default`, `duration-transform` |

## 6.7 Desaparecimento (exit)

| Tipo | Padrão | Token |
|---|---|---|
| Card removido | Receder (fade + translate-y↑) | `ease-exit`, `duration-normal` |
| Modal | Dissolver (scale↓ + fade) | `ease-exit`, `duration-slow` |
| Toast | Receder para direita | `ease-exit`, `duration-normal` |
| IA response | Transformar (nunca desaparece) | `duration-transform` |

## 6.8 Envelhecimento visual

Componentes não "envelhecem" — estados visuais comunicam tempo:

| Conceito | Tratamento |
|---|---|
| Dado recente | `text-primary`, sem decoração |
| Dado antigo | `text-tertiary` |
| Alert não lido | `border-accent` sutil |
| Alert lido | `border-subtle`, `text-secondary` |
| Sessão expirada | `opacity-disabled` no container |

## 6.9 Regras de composição

1. Nunca mais de 1 metal accent por card
2. Nunca vidro sobre vidro
3. Inputs sempre em recesso (nunca grafite plano)
4. Tabelas sempre em grafite container (nunca nuas sobre obsidiana)
5. Ícones sempre 24×24 com traço angular
6. Badge nunca maior que o conteúdo que acompanha

**Origem DDL:** Cap. 9 (reações), Princípio 09 (física) · **Percepção:** sistema vivo e coerente

---

# Etapa 7 — Motion System

> Documentação completa de movimento utilizando Motion Tokens (§1.9).

---

## 7.1 Arquitetura de motion

```
Motion System
├── Tokens (duração, easing, massa, delay)
├── Padrões de entrada (enter)
├── Padrões de saída (exit)
├── Padrões de transformação (IA)
├── Padrões de loading
├── Microinterações
└── Cascata (chain)
```

## 7.2 Entrada (Enter)

| Padrão | Keyframes | Duração | Easing | Componentes |
|---|---|---|---|---|
| **emerge** | opacity 0→1, translateY(16px→0) | `duration-normal` | `ease-enter` | Card, Section |
| **emerge-subtle** | opacity 0→1, translateY(8px→0) | `duration-normal` | `ease-enter` | List item |
| **materialize** | opacity 0→1, scale(0.95→1), shadow grow | `duration-slow` | `ease-enter` | Modal |
| **unfold** | height 0→auto, opacity 0→1 | `duration-normal` | `ease-enter` | Accordion |
| **slide-right** | translateX(100%→0) | `duration-normal` | `ease-enter` | Toast, Drawer |
| **fade** | opacity 0→1 | `duration-fast` | `ease-enter` | Tooltip |

### Stagger de entrada
- Lista de cards: `delay-stagger` (60ms) entre itens
- Direção da cascata: superior-esquerda → inferior-direita
- Máximo 8 itens com stagger; após isso, grupo em batch

## 7.3 Saída (Exit)

| Padrão | Keyframes | Duração | Easing |
|---|---|---|---|
| **recede** | opacity 1→0, translateY(0→-8px) | `duration-normal` | `ease-exit` |
| **dissolve** | opacity 1→0, scale(1→0.95) | `duration-slow` | `ease-exit` |
| **collapse** | height auto→0, opacity 1→0 | `duration-normal` | `ease-exit` |
| **slide-right-out** | translateX(0→100%) | `duration-normal` | `ease-exit` |

## 7.4 Reorganização (IA)

| Padrão | Descrição | Duração | Uso |
|---|---|---|---|
| **transform-180** | Container rotaciona 180° em Y, conteúdo muda | `duration-transform` | Resposta IA |
| **reorder** | Elementos mudam posição no grid | `duration-transform` | Priorização |
| **align-to-grid** | Pontos dispersos → grid hexagonal | `duration-transform` | Resolução |
| **ghost-to-solid** | Opacity 30%→100% | `duration-slow` | Antecipação → conteúdo |
| **connect** | Linha diagonal ↗ desenha entre elementos | `duration-normal` | Conexão de dados |

### Regras IA motion
1. Nunca introduzir elementos novos com fade — sempre reorganizar existentes
2. Glow `glow-processing` ativo durante toda transformação
3. Ao completar: glow dissipa em 300ms
4. IA nunca faz bounce, wiggle ou shake (exceto erro)

## 7.5 Loading

| Padrão | Descrição | Duração |
|---|---|---|
| **hex-rotate** | Hexágono outline gira 360° | `duration-continuous`, `ease-linear` |
| **skeleton-pulse** | Opacidade 50%↔100% | 1500ms, `ease-default` |
| **progress-fill** | Barra preenche da esquerda | Proporcional ao valor |
| **chain-wait** | Cascata de skeletons com stagger | `delay-stagger` |

## 7.6 Microinterações

| Evento | Padrão | Duração | Easing |
|---|---|---|---|
| Hover elevation | shadow level +1 | `duration-fast` | `ease-default` |
| Click press | `scale-press` (0.98) | `duration-instant` | `ease-spring` |
| Toggle switch | thumb translateX | `duration-fast` | `ease-spring` |
| Checkbox check | scale(0→1) + opacity | `duration-fast` | `ease-spring` |
| Copy feedback | flash `glow-live` 200ms | 200ms | `ease-exit` |
| Error | `shake-error` | `duration-fast` | linear |

## 7.7 Transições de página

| Tipo | Padrão | Duração |
|---|---|---|
| Navegação lateral (tabs) | Crossfade conteúdo | `duration-normal` |
| Navegação profunda (rotas) | emerge novo conteúdo | `duration-slow` |
| Modal open/close | materialize / dissolve | `duration-slow` |
| Sidebar collapse | width transition | `duration-normal` |

### Proibido em navegação
- Rotação parcial (90°)
- Slide vertical de página inteira
- Zoom in/out de viewport
- Parallax

## 7.8 Reduced motion

Quando `prefers-reduced-motion: reduce`:
- Todas as durações → `duration-instant` (0ms ou 100ms máx)
- Transformações → crossfade simples
- Loading → skeleton estático (sem rotação)
- IA → mudança instantânea de conteúdo
- Glow → mantido (não é movimento)

**Origem DDL:** Cap. 9 completo · **Percepção:** física, organismo, confiança

---

# Etapa 8 — Data Language

> Linguagem exclusiva para representação de dados — PHD Insights como referência.

---

## 8.1 Filosofia

Dados na PHD não são números em tela — são **evidência de sistema inteligente**. A apresentação deve comunicar precisão, relevância e fluxo.

## 8.2 Métricas (KPIs)

### Anatomia de uma métrica

```
┌─ Card Grafite ──────────────────────┐
│  LABEL (type-label, tertiary)      │
│                                    │
│  2,847  (type-mono-lg, primary)    │  ← Valor
│  ▲ +12.4%  (MetricDelta)          │  ← Variação
│                                    │
│  ─── sparkline (opcional) ───      │
└────────────────────────────────────┘
```

### Regras

| Propriedade | Token |
|---|---|
| Valor | `type-mono-lg`, `text-primary` |
| Label | `type-label`, `text-tertiary` |
| Variação positiva | `data-positive` + ▲ |
| Variação negativa | `data-negative` + ▼ |
| Sem variação | `data-neutral` + — |
| Ao vivo | `data-live` + `glow-live` |
| Comparação | `text-tertiary`, `type-caption` |

## 8.3 Dashboards

### Layout de dashboard

| Zona | Conteúdo | Densidade |
|---|---|---|
| Top | 3–4 métricas primárias | Compact |
| Middle | Gráficos principais | Default |
| Bottom | Tabelas de detalhe | Compact |
| Side (opcional) | Filtros, contexto | Default |

### Regras
- Máximo 4 métricas no topo (módulos P/D repetidos)
- 1 gráfico hero (barra diagonal = destaque)
- Dados em repouso: silenciosos (`text-secondary`)
- Dados ativos: `text-primary` + glow se live
- Filtros em grafite recesso, não em vidro

## 8.4 Gráficos

### Gramática visual

| Elemento | Tratamento |
|---|---|
| Barras | Chanfro no topo, ângulo 60° opcional |
| Linhas | 2px, cor accent do produto |
| Área | accent-muted como fill |
| Eixos | `border-subtle`, `type-caption` |
| Grid | `border-subtle` a 5% opacidade |
| Tooltip | Vidro fumê, `type-mono` |
| Legenda | `type-caption`, inline |

### Cores em gráficos
- Série primária: accent do produto
- Série secundária: `text-secondary`
- Série terciária: `text-tertiary`
- Nunca mais de 3 séries coloridas
- Séries adicionais: variação de opacidade, não cor nova

## 8.5 Indicadores

| Tipo | Visual |
|---|---|
| **Status dot** | Círculo 8px, cor semântica |
| **Trend arrow** | ▲/▼ monocromático com cor data |
| **Progress** | Barra chanfrada, accent fill |
| **Ring** | Anel circular (contenção), accent stroke |
| **Sparkline** | Linha 1px sem eixos |

## 8.6 Tabelas

| Propriedade | Token |
|---|---|
| Container | Grafite card |
| Header | `type-label`, `text-tertiary`, sticky |
| Row | `type-body-sm`, `text-secondary` |
| Row hover | `overlay-hover` |
| Row selected | `overlay-selected` + `border-accent` |
| Cell numérica | `type-mono`, align right |
| Divider | `border-subtle` |
| Zebra | Proibido — usar hover apenas |

## 8.7 Timeline

- Conector vertical (haste) + nós (módulos hexagonais)
- Conector diagonal ↗ entre eventos relacionados
- Timestamp: `type-mono`, `text-tertiary`
- Evento ativo: `border-accent`
- Evento passado: `text-secondary`

## 8.8 Estados de dados

| Estado | Tratamento |
|---|---|
| Carregando | Skeleton com `skeleton-pulse` |
| Vazio | EmptyState com ação |
| Erro | `state-error` border + mensagem |
| Stale (antigo) | `text-tertiary` + timestamp |
| Live | `glow-live` + `data-live` |
| IA processando | `glow-processing` + hex-rotate |

**Origem DDL:** Cap. 11 (IA), Cap. 6 (cores de dados), ambigrama (módulos repetidos)  
**Percepção:** inteligência operacional, precisão analítica

---

# Etapa 9 — Accessibility

> Inclusão sem diluição da identidade visual.

---

## 9.1 Contraste

| Relação | Mínimo WCAG | PHD target | Token |
|---|---|---|---|
| Texto primário / obsidiana | AA 4.5:1 | ≥ 15:1 | `text-primary` |
| Texto secundário / obsidiana | AA 4.5:1 | ≥ 7:1 | `text-secondary` |
| Texto terciário / obsidiana | AA 4.5:1 (large) | ≥ 4.5:1 | `text-tertiary` |
| Texto / grafite | AA 4.5:1 | ≥ 10:1 | `text-primary` on graphite |
| Texto / metal accent | AA 4.5:1 | ≥ 15:1 | `text-inverse` |
| Focus ring / fundo | 3:1 | ≥ 3:1 | `glow-focus` |
| Accent / obsidiana | 3:1 (UI) | ≥ 4.5:1 | `accent-brand` |

### Regras
- `text-tertiary` nunca para corpo longo — apenas metadados
- Accent sobre grafite: verificar contraste; preferir metal (text-inverse)
- Modo claro (derivado): revalidar todos os pares

## 9.2 Foco

| Propriedade | Especificação |
|---|---|
| Método | `glow-focus` (box-shadow) |
| Cor | Branco 10% — nunca accent |
| Espessura | 2px |
| Offset | 2px |
| Visibilidade | `:focus-visible` apenas (não em click) |
| Forma | Segue chanfro/squircle do componente |
| Nunca | `outline: none` sem substituto |

## 9.3 Teclado

| Padrão | Comportamento |
|---|---|
| Tab order | Segue ordem visual (esquerda→direita, cima→baixo) |
| Enter/Space | Ativa botões, toggles, selects |
| Escape | Fecha modais, dropdowns, popovers |
| Arrow keys | Navega em tabs, menus, radio groups |
| ⌘K / Ctrl+K | Command palette |
| Skip link | Primeiro elemento focável — "Pular para conteúdo" |
| Trap focus | Em modais e dialogs |

## 9.4 Redução de movimento

```css
/* Implementação futura */
@media (prefers-reduced-motion: reduce) {
  /* Ver §7.8 */
}
```

- Animações → instantâneas ou removidas
- Glow → mantido (estado, não movimento)
- Skeleton → estático
- IA transform → crossfade
- Scroll behavior → auto (nunca smooth)

## 9.5 Legibilidade

| Regra | Especificação |
|---|---|
| Tamanho mínimo corpo | 16px (`type-body`) |
| Tamanho mínimo caption | 12px (`type-caption`) |
| Line-height mínimo | 1.4 para corpo |
| Comprimento de linha | 45–75 caracteres |
| Parágrafos | `type-body`, nunca `type-caption` |
| CAPS | Apenas `type-label` (tracking compensa) |
| Zoom | Layout funcional até 200% zoom |

## 9.6 Responsividade

| Breakpoint | Adaptação |
|---|---|
| Mobile | Sidebar → drawer, tipografia -1 nível |
| Tablet | 8 colunas, padding reduzido |
| Desktop | Layout completo |
| Touch targets | Mínimo 44×44px |
| Hover states | Desativados em touch (via `@media (hover)`) |

## 9.7 Semântica

- HTML semântico obrigatório (`<nav>`, `<main>`, `<section>`, `<button>`)
- ARIA labels em ícones sem texto
- `aria-live="polite"` para toasts e alertas
- `role="dialog"` + `aria-modal` em modais
- Status indicators com `aria-label` descritivo
- IA: `aria-busy="true"` durante processamento

## 9.8 Identidade preservada

Acessibilidade **não justifica**:
- Trocar chanfro por border-radius "mais acessível"
- Usar cores mais claras que quebram dark-first
- Remover glow funcional de estados
- Simplificar geometria para "legibilidade"
- Adicionar bordas coloridas permanentes

Acessibilidade **exige**:
- Contraste suficiente nos tokens existentes
- Focus visível em todos os interativos
- Navegação completa por teclado
- Texto legível em tamanho e peso

**Origem DDL:** Princípio 08 (escala com integridade) · **Percepção:** inclusão sem compromisso

---

# Etapa 10 — Anti-Patterns

> Tudo que **nunca** poderá existir em um produto PHD Studio.

---

## 10.1 Geometria

| Anti-padrão | Por quê | Alternativa DDS |
|---|---|---|
| Border-radius genérico (8px, 12px) em cards | Não deriva do ambigrama | `radius-chamfer-md` |
| Hexágonos decorativos em todo fundo | Decoração sem função (Princípio 01) | Obsidiana com textura sutil |
| Ícones com curvas | Gramática angular violada | Ícones monoline 60°/120° |
| Layout isométrico completo | Inutilizável para dados | Grid 12 colunas com accents angulares |
| Cantos arredondados em botões primários | Não é PHD — é genérico | Chanfro ou metal accent |

## 10.2 Cor

| Anti-padrão | Por quê | Alternativa |
|---|---|---|
| Vermelho como background de seção | Princípio 05 violado | `surface-obsidian` + accent pontual |
| Gradiente em qualquer superfície | Não existe no brand system | Cor sólida + luz |
| Múltiplos CTAs vermelhos | Fadiga + confusão | 1 CTA metal por viewport |
| Texto colorido (azul link) | Hierarquia por opacidade | `text-secondary` + underline no hover |
| Rainbow de accents em dashboard | Princípio 05 | 1 accent de produto + neutros |
| Neon / cores saturadas demais | Posicionamento tech, não gaming | Accents com saturação controlada |

## 10.3 Superfície e luz

| Anti-padrão | Por quê | Alternativa |
|---|---|---|
| Glassmorphism em cards estáticos | Vidro é transição, não estrutura | Grafite |
| Glow decorativo em hero | Princípio 04 violado | Luz via chanfro e sombra |
| Sombra colorida aleatória | Sem origem de luz | `shadow-contact` ou `shadow-accent` |
| Múltiplas sombras empilhadas | Sem origem única | 1 sombra por elemento |
| Fundo branco como padrão | Princípio 03 violado | Obsidiana (dark-first) |
| Skeuomorphism (texturas realistas) | Datado | Materialidade digital crível |

## 10.4 Tipografia

| Anti-padrão | Por quê | Alternativa |
|---|---|---|
| Fonte script/decorative | Engenharia, não publicidade | `font-display` wide |
| Light/Thin weight | Ilegível em dark, fragilidade | Regular mínimo |
| Itálico para ênfase | Não previsto | Semibold ou accent label |
| CAPS em parágrafos | Grita, não comunica | `type-body` sentence case |
| Números em fonte proporcional | Imprecisão visual | `font-mono` sempre |

## 10.5 Movimento

| Anti-padrão | Por quê | Alternativa |
|---|---|---|
| Bounce excessivo | Não é física PHD | `ease-spring` com damping alto |
| Parallax scroll | Decorativo, sem função | Espaço estático generoso |
| Animação em loop infinito (exceto loading) | Distração | Estático após enter |
| Slide de página inteira | Desorientação | Crossfade ou emerge |
| Partículas flutuantes | Clichê de IA | Reorganização de dados |
| Hover que desloca elemento | Quebra apoiado/usinado | Elevação via sombra |

## 10.6 IA

| Anti-padrão | Por quê | Alternativa |
|---|---|---|
| Avatar de robô/assistente | Princípio 10 violado | AIContainer reorganizando |
| Badge "AI Powered" | Marketing, não engenharia | Comportamento inteligente |
| Cérebro/chip como ícone | Clichê | Hex-rotate processing |
| Chat bubble com "..." | Genérico | Container transform |
| Partículas / neural network bg | Clichê visual de IA | Dados alinhando em grid |
| Texto "Gerado por IA" | Reduz confiança | Silêncio inteligente |
| Holograma / matrix verde | Princípio 10 + Essência | Glow funcional |

## 10.7 Layout

| Anti-padrão | Por quê | Alternativa |
|---|---|---|
| Cards flutuando sem estrutura | Não apoiado, não encaixado | Grafite com `shadow-contact` |
| Seções coladas sem respiro | Princípio 07 violado | `space-stack-xl` mínimo |
| Conteúdo edge-to-edge | Sem margem = sem silêncio | `padding-page` |
| Mais de 3 níveis de card aninhado | Complexidade visual | Flat hierarchy |
| Sidebar sem relação com conteúdo | Princípio 02 violado | Eixo compartilhado |

## 10.8 Dados

| Anti-padrão | Por quê | Alternativa |
|---|---|---|
| Gráfico 3D | Distorce dados | Barras/linhas 2D angulares |
| Cores aleatórias por série | Sem semântica | Accent + opacidade |
| Zebra striping em tabelas | Visual datado | Hover apenas |
| Números animados (odometer) | Gimmick | Fade de valor com `type-mono` |
| Dashboard com 20 métricas | Sem hierarquia | Máximo 4 KPIs top |

## 10.9 Checklist de rejeição

Antes de aprovar qualquer elemento visual, verificar:

- [ ] Deriva de princípio DDL?
- [ ] Deriva de elemento do ambigrama?
- [ ] Usa material correto?
- [ ] Usa token correto (não valor arbitrário)?
- [ ] Tem no máximo 1 accent por viewport?
- [ ] Focus visível por teclado?
- [ ] Contraste WCAG AA?
- [ ] Motion usa tokens?
- [ ] Glow é funcional (não decorativo)?
- [ ] Passaria no teste "é PHD ou é genérico?"

---

# Conclusão e próxima fase

## O que o DDS estabelece

O PHD Engineering Design System operacionaliza a DDL em:

| Entrega | Status |
|---|---|
| Foundation (tokens completos) | ✅ Documentado |
| Material System (4 materiais) | ✅ Documentado |
| Layout System (grid, zonas, ritmo) | ✅ Documentado |
| Component Philosophy | ✅ Documentado |
| Component Inventory (79 componentes) | ✅ Mapeado |
| Component Rules (universais) | ✅ Documentado |
| Motion System (padrões completos) | ✅ Documentado |
| Data Language | ✅ Documentado |
| Accessibility | ✅ Documentado |
| Anti-Patterns (40+ itens) | ✅ Documentado |

## Resposta à pergunta-missão

> *"Como qualquer interface pode ser construída seguindo rigorosamente a DDL?"*

1. **Começar** com tokens PHDU — todo espaço, tamanho e ritmo deriva de 8px
2. **Escolher** material (obsidiana, grafite, vidro, metal) antes de desenhar
3. **Aplicar** geometria chanfrada em estruturas, squircle em tipografia
4. **Usar** cor como sinal — accent cirúrgico, nunca superfície
5. **Iluminar** com origem única — sombras e highlights coerentes
6. **Compor** com grid 12 colunas e silêncio generoso
7. **Animar** com física — reorganização, não decoração
8. **Apresentar** dados com monospace, métricas e gramática analítica
9. **Garantir** acessibilidade sem diluir identidade
10. **Validar** contra anti-patterns antes de implementar

## O que NÃO foi feito (por design)

- ❌ Implementação em código (CSS, Tailwind, React)
- ❌ Biblioteca Figma
- ❌ Componentes visuais desenvolvidos
- ❌ Alteração da Landing Page
- ❌ Alteração de qualquer arquivo existente do projeto

## Próximas fases

| Fase | Nome | Entrega |
|---|---|---|
| **03** | Implementação DDS | Tokens em código, primitives, Storybook |
| **04** | Auditoria Landing Page | Mapeamento componente-a-componente |
| **05** | Migração Visual V3 | Landing Page e produtos no novo sistema |

---

**PHD Studio V3 · Engineering Design System**  
*Fase 02 concluída — Infraestrutura documental pronta*  
*Referência: [PHD Digital Design Language](./PHD_Digital_Design_Language.md)*

---

*Documento gerado em Junho de 2026.*  
*Todo token e regra deriva diretamente da DDL v1.0.*
