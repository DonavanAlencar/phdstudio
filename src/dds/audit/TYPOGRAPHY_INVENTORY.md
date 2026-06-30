# PHD Studio V3 — Inventário Tipográfico (Auditoria 05B.2A)

**Fase 05B.2A · ETAPA 1**  
**Data:** Junho de 2026  
**Escopo:** Estado tipográfico da Landing antes da migração (Fase 05B.2B)

---

## Famílias em uso (legado)

| Família | Peso | Aplicação | Mecanismo |
|---|---|---|---|
| **Montserrat** | 400, 600, 700, **900** | Títulos, hero, seções | `font-heading` (Tailwind), inline |
| **Inter** | 300, 400, 500, 600, 800 | Corpo, UI, admin | `font-sans` (default) |
| **System mono** | — | Logs, tabelas admin | `font-mono` Tailwind (não JetBrains) |

## Escala hardcoded (amostra)

| Padrão | Uso | Token DDS alvo |
|---|---|---|
| `text-[2.25rem]` … `text-8xl` | Hero responsivo manual | `text-phd-r-display-xl` |
| `text-3xl md:text-4xl` | SectionTitle | `text-phd-r-heading-1` |
| `text-sm`, `text-xs`, `text-[10px]` | Labels, metadados | `text-phd-label`, `text-phd-caption` |
| `leading-[1.02]`, `leading-[1.05]` | Hero, Insights | tokens `--phd-type-*-leading` |

## Tracking / transform

| Padrão | Ocorrências | DDS |
|---|---|---|
| `tracking-tight` | ~15+ títulos | Anti-pattern — usar tracking embutido em `type-heading-*` |
| `tracking-wide` + `uppercase` | Nav, CTAs, labels | `type-label` (+0.06em) |
| `font-light` | Corpo secundário | Remover — `text-phd-secondary` |
| `font-black` (900) | Hero, SectionTitle | `font-phd-bold` (700) na migração |

## Cores de texto hardcoded

| Padrão | ~Ocorrências | Token |
|---|---|---|
| `text-gray-300/400/500` | ~100+ | `text-phd-secondary` / `text-phd-tertiary` |
| `text-white` | Hero, títulos | `text-phd-primary` |
| Gradiente `bg-clip-text` | Hero h1 | Accent sólido (CES-005) |

## Arquivos com maior densidade tipográfica legada

1. `App.tsx` (~39 refs `font-heading` / `font-black`)
2. `PhdInsightsInstitutionalSection.tsx`
3. `StrategicContentVideoSection.tsx`
4. `ServicesSection.tsx`
5. `InstagramCarousel.tsx` / `YouTubeCarousel.tsx`
6. `MobileChat/*`, `ChatWidget.tsx`

## Classes utilitárias legadas

| Classe Tailwind | Papel |
|---|---|
| `font-heading` | Display legado (Montserrat) |
| `font-sans` | Body legado (Inter) |
| `font-mono` | Mono sistema |
| `font-black`, `font-light`, `font-medium` | Pesos ad-hoc |

## Adoção DDS (pré-05B.2A)

| Recurso | Status antes | Status após 05B.2A |
|---|---|---|
| `font-phd-*` / `text-phd-*` | 0 usos em componentes | Infra pronta, 0 usos (por design) |
| `.phd-type-*` | Inexistente | 14 utilitários opt-in |
| JetBrains Mono carregada | Não | Sim (preload + stylesheet) |
| Michroma (display wide) | Não | Sim (preload + tokens) |
| Escala responsiva centralizada | Não | `--phd-type-r-*` |

## Componentes proibidos de alteração nesta fase

Hero, Navbar, Footer, Button, Card, Input, SectionHeader, SectionTitle — **nenhum alterado**.
