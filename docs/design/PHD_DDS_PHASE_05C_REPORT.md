# PHD Studio V3 — Fase 05C: Motion System

**Data:** 2026-06-30  
**DDS_PHASE:** `05C`  
**Escopo:** Motion Foundation + Interaction Behaviors + Loading & Feedback + Motion Audit (Landing)

---

## Resumo executivo

A Fase 05C consolida toda a motion da PHD Studio V3 em um único módulo DDS (`src/dds/motion/`), aplica microinterações discretas nos componentes oficiais e migra a Landing pública para tokens `phd-*`, eliminando padrões proibidos (bounce, pulse infinito, scale exagerado, durações hardcoded).

A motion comunica **precisão, engenharia, inteligência e estabilidade** — nunca espetáculo ou “landing animada”.

---

## 05C.1 — Motion Foundation

### Motion Tokens implementados

| Categoria | Tokens |
|-----------|--------|
| **Durations** | `instant` (100ms), `fast` (150ms), `normal` (300ms), `slow` (500ms), `transform` (700ms), `continuous` (1200ms), `skeleton` (1500ms), `toast` (5000ms) |
| **Easings** | `ease-standard`, `ease-decelerate`, `ease-accelerate` (+ aliases `default`, `enter`, `exit`) |
| **Delays** | `chain` (40ms), `stagger` (60ms), `maxChain` (600ms) |
| **Physics** | `scale-press`, `scale-emerge`, `translate-emerge`, `translate-hover` (-2px), `shake-error` |
| **Transitions** | `hover-elevation`, `focus`, `opacity`, `material` |

### Arquivos da fundação

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/dds/styles/variables.css` | CSS custom properties `--phd-duration-*`, `--phd-ease-*` |
| `src/dds/styles/motion.css` | Keyframes + classes utilitárias opt-in |
| `src/dds/tokens/motion.ts` | Tokens TS referenciando CSS vars |
| `src/dds/motion/durations.ts` | API de durações + `durationMs` |
| `src/dds/motion/easings.ts` | Curvas + aliases semânticos |
| `src/dds/motion/delays.ts` | `staggerDelay()`, `chainDelay()` |
| `src/dds/motion/physics.ts` | Física + padrões enter/exit/loading/feedback |
| `src/dds/motion/utilities.ts` | `componentMotion`, `transitionUtilities` |
| `src/dds/motion/index.ts` | `motionSystem` consolidado |
| `src/dds/tailwind/extend.js` | Utilitários Tailwind `duration-phd-*`, `ease-phd-*`, `animate-phd-*` |

---

## 05C.2 — Interaction Behaviors

| Componente | Motion aplicada |
|------------|-----------------|
| **Button** | `componentMotion.button` — press, material, fast; secondary com hover elevation |
| **Card** | `componentMotion.cardInteractive` — elevação 2px, material, shadow |
| **VideoCard** | Herda Card + `componentMotion.videoCard` |
| **Input / Textarea** | `componentMotion.input` — focus ring, material, shake em erro, emerge em sucesso |
| **Surface** | `phd-transition-material`, hover elevation em `interactive` |
| **Toast** | Enter `emerge-subtle`, exit `recede`, auto-dismiss via token `toast` |

**Proibidos removidos dos componentes:** bounce, scale exagerado, floating.

---

## 05C.3 — Loading & Feedback

| Padrão | Implementação DDS |
|--------|-------------------|
| **Loading** | `phd-motion-hex-rotate` (Button spinner) |
| **Skeleton** | `phd-motion-skeleton-pulse` + `--phd-duration-skeleton` |
| **Success** | `phd-motion-emerge-subtle` (Input/Toast) |
| **Error** | `phd-motion-shake-error` |
| **Progress** | `phd-motion-progress-fill` |
| **Focus** | `phd-transition-focus` |
| **Toast** | Ciclo enter → visible → exit com `recede` |
| **Status live** | Glow estático (`shadow-phd-glow-live`) — sem pulse infinito |

---

## 05C.4 — Motion Audit (Landing)

### Antes → Depois

| Local | Antes | Depois |
|-------|-------|--------|
| Hero legado (`Hero`) | `animate-fade-in-up`, `animate-pulse` | `animate-phd-emerge`, dot estático |
| `PhdInsightsInstitutionalSection` | `fade-in-up` + `0.85s` hardcoded | `animate-phd-emerge` |
| `ServicesSection` | `duration-300`, `hover:-translate-y-1`, `scale-105` | `phd-hover-elevation`, tokens DDS |
| `YouTubeCarousel` | `animate-pulse`, `scale-110`, `fade-in-up` | skeleton DDS, opacity hover, `materialize` |
| `ChatWidget` | `animate-bounce`, `hover:scale-110` | skeleton pulse com stagger token |
| `FloatingWhatsAppButton` | `hover:scale-[1.06]` | `phd-motion-press` |
| `StrategicContentVideoSection` | sem stagger | `staggerDelay()` nos VideoCards |
| `index.css` (logos institucionais) | `720ms` hardcoded | `var(--phd-duration-transform)` |
| `Navbar` / `StrategicHero` / `Footer` | `duration-300` | `duration-phd-normal` |
| `tailwind.config.js` | `fadeInUp 0.8s ease-out` | Delegado a tokens `phd-emerge` |

### Exceções documentadas

| Padrão | Motivo |
|--------|--------|
| Marquee institucional (`--inst-marquee-dur`) | Loop contínuo atmosférico; `prefers-reduced-motion` desativa; duração por breakpoint é decisão editorial, não microinteração |
| Rotas admin (`/produtos`, `/logs`, etc.) | Fora do escopo Landing; `fade-in-up` deprecado mas mapeado para tokens DDS |

### Itens legados remanescentes (fora da home pública)

Seções antigas em `App.tsx` (testimonials, cases, rotas Vexin/admin) ainda contêm `duration-300` e `hover:scale` — não fazem parte do `HomePage` atual. Migração recomendada na Fase 05D.

---

## Arquivos modificados

```
src/dds/motion/utilities.ts          (novo)
src/dds/motion/easings.ts
src/dds/motion/durations.ts
src/dds/motion/physics.ts
src/dds/motion/index.ts
src/dds/tokens/motion.ts
src/dds/styles/variables.css
src/dds/styles/motion.css
src/dds/tailwind/extend.js
src/dds/index.ts
src/dds/components/actions/Button.tsx
src/dds/components/content/Card.tsx
src/dds/components/content/VideoCard.tsx
src/dds/components/forms/Input.tsx
src/dds/components/forms/Textarea.tsx
src/dds/components/feedback/Toast.tsx
src/dds/components/foundation/Surface.tsx
App.tsx
src/components/PhdInsightsInstitutionalSection.tsx
src/components/ServicesSection.tsx
src/components/YouTubeCarousel.tsx
src/components/ChatWidget.tsx
src/components/FloatingWhatsAppButton.tsx
src/components/StrategicContentVideoSection.tsx
src/index.css
tailwind.config.js
docs/design/PHD_DDS_PHASE_05C_REPORT.md (este arquivo)
```

---

## QA Técnico

| Critério | Status |
|----------|--------|
| Motion tokens reutilizados | ✅ Centralizados em `src/dds/motion/` |
| Ausência de valores hardcoded na Landing pública | ✅ Migrado para `phd-*` |
| Ausência de animações duplicadas | ✅ Legado `fade-in-up` deprecado |
| TypeScript (`tsc --noEmit`) | ✅ Passou |
| `prefers-reduced-motion` | ✅ Global em `motion.css` |
| Performance (60 fps) | ✅ CSS-only, `transform`/`opacity`, sem libs JS de animação |

---

## QA de Direção de Arte

| Critério | Avaliação |
|----------|-----------|
| Fluidez | Microinterações ≤ 300ms na maioria dos casos |
| Naturalidade | Curvas `ease-standard` / `ease-decelerate` |
| Coerência | Mesmos tokens em Button, Card, Input, Toast |
| Percepção premium | Elevação 2px, material transition, sem bounce |
| Discrição | Motion orienta e informa; não compete com conteúdo |
| Consistência desktop/mobile | `motion-safe:` / `motion-reduce:` aplicados |

---

## Commit sugerido

```
feat(dds): implement Motion System phase 05C

Centralize motion tokens and utilities in src/dds/motion/, apply
discrete interaction behaviors to DDS components, and migrate the
public landing to phd-* motion patterns without spectacle animations.
```

---

## Critério de conclusão

- [x] Motion Foundation reutilizável em `src/dds/motion/`
- [x] Componentes DDS com motion aplicada (Button, Card, VideoCard, Input, Toast, CTA)
- [x] Loading & Feedback padronizados via DDS
- [x] Landing pública auditada e migrada
- [x] Layout, tipografia, materiais e copy preservados
- [x] Relatório e QA documentados
