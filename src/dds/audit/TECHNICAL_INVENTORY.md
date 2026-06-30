# PHD Studio V3 — Inventário Técnico Pré-Migração

**Fase 05A · ETAPA 1**  
**Data:** Junho de 2026  
**Escopo:** Mapeamento de valores hardcoded antes da migração DDS (Fase 05B)

---

## Resumo executivo

| Categoria | Ocorrências estimadas | Fonte principal | Token DDS alvo |
|---|---|---|---|
| Cores hardcoded | ~140+ | `App.tsx`, `index.css`, componentes | `phd-*` colors |
| Espaçamentos hardcoded | ~200+ | Tailwind ad-hoc (`px-4`, `py-20`, `gap-12`) | `phd-phdu-*`, `phd-stack-*` |
| Border-radius hardcoded | ~100+ | `rounded-lg/xl/2xl/3xl/full` | `phd-chamfer-*`, `phd-squircle-*` |
| Sombras hardcoded | ~70+ | `shadow-*`, `box-shadow` inline | `phd-shadow-*`, `phd-glow-*` |
| Blur hardcoded | ~15+ | `backdrop-blur`, `blur-*` | `phd-blur-*` |
| Animações hardcoded | ~100+ | `animate-*`, `transition-*`, keyframes | `phd-motion-*`, `phd-duration-*` |
| Tipografia hardcoded | ~250+ | `font-*`, `text-*`, Montserrat/Inter direto | `phd-type-*`, `font-phd-*` |
| Breakpoints hardcoded | ~150+ | `sm:`, `md:`, `lg:`, `@media` | `phd-sm` … `phd-2xl` |
| Z-index hardcoded | ~60+ | `z-10` … `z-50`, `z-[n]` | `z-phd-*` |

---

## 1. Cores hardcoded

### Legado (`tailwind.config.js` / `:root`)

| Valor | Local | Equivalente DDS |
|---|---|---|
| `#E50914` | `brand.red` | `--phd-accent-brand` |
| `#050505` | `--brand-dark` | Próximo `--phd-surface-obsidian` (#030303) |
| `#121212` | `--brand-gray` | `--phd-surface-graphite` |
| `#000` | `body` background | `--phd-surface-obsidian` |
| `gray-*` Tailwind | `App.tsx`, admin | `--phd-text-*` (opacidade) |

### Hardcoded em componentes (amostra crítica — Landing)

| Arquivo | Valores | Violação DDS |
|---|---|---|
| `App.tsx` | `purple-500`, `amber-*`, `green-*`, `rgba(229,9,20,*)` | Accents não tokenizados |
| `PhdInsightsInstitutionalSection.tsx` | Gradientes amber | `accent-insights` deveria substituir |
| `InstitutionalBrandsMarquee.tsx` | `#030303`, `rgba(229,9,20,0.16)` | Parcialmente alinhado |
| `FloatingWhatsAppButton.tsx` | `#25D366` | Externo à marca (Sprint 4) |
| `index.css` | Scrollbar `#262626`, `#E50914` | Tokens estruturais |

---

## 2. Espaçamentos hardcoded

### Padrões dominantes (não-PHDU)

| Classe Tailwind | Px | PHDU equivalente |
|---|---|---|
| `px-4` | 16px | `phd-2` ✓ |
| `py-3` | 12px | ❌ fora da escala |
| `py-14` / `py-20` / `py-24` | 56/80/96px | ❌ não Fibonacci |
| `gap-12` | 48px | ❌ |
| `mb-12` | 48px | ❌ |
| `p-8` | 32px | ❌ |
| `clamp(...)` | variável | Migrar para tokens responsivos |

### Arquivos com maior densidade

1. `App.tsx` (~147 breakpoints + spacing)
2. `InstitutionalBrandsMarquee.tsx`
3. `PhdInsightsInstitutionalSection.tsx`
4. `StrategicContentVideoSection.tsx`

---

## 3. Border-radius hardcoded

| Padrão | Ocorrências | DDS |
|---|---|---|
| `rounded-lg` | ~40+ | `phd-chamfer-sm` ou `phd-squircle-sm` |
| `rounded-xl` / `2xl` / `3xl` | ~50+ | `phd-chamfer-md/lg` |
| `rounded-full` | ~15+ | `phd-full` (contenção circular) |
| `border-radius: 1rem` | `.strategic-card` | `phd-chamfer-md` |

**Conformidade atual:** ~5% (auditoria Fase 04)

---

## 4. Sombras hardcoded

| Padrão | Arquivos | DDS |
|---|---|---|
| `shadow-2xl`, `shadow-lg` | `App.tsx`, carousels | `phd-raised`, `phd-elevated` |
| `shadow-brand-red/20` | CTAs, Insights | `phd-accent` |
| `drop-shadow` decorativo | Hero, marquee | Anti-pattern DDS |
| `box-shadow` inline | `.strategic-shell`, `.strategic-card` | `phd-contact` + `phd-highlight-edge` |

---

## 5. Blur hardcoded

| Local | Valor | DDS |
|---|---|---|
| `.strategic-card` | `blur(8px)` | ❌ vidro em card estático |
| Navbar scroll | `backdrop-blur` | ✓ vidro fumê (transição) |
| Video cards | `backdrop-blur` | ❌ deveria ser grafite |
| Cookie banner | `backdrop-blur` | ✓ vidro fumê |

---

## 6. Animações hardcoded

### `tailwind.config.js` (legado — preservado)

| Animação | Duração/Easing | DDS equivalente |
|---|---|---|
| `fade-in-up` | 0.8s ease-out | `phd-emerge` (300ms, ease-enter) |
| `marquee` | 50s–420s linear | Mantido (conforme auditoria) |
| `pulse-slow` | 4s | `phd-skeleton-pulse` |

### Padrões problemáticos na Landing

| Padrão | Ocorrências | Violação |
|---|---|---|
| `hover:-translate-y-*` | ~15+ | DDS §6.3 — hover sem deslocamento |
| `scale-105` / `scale-110` | ~10+ | Apenas `scale-press` em click |
| `animate-bounce` | Form feedback | Anti-pattern DDS §10.5 |
| `duration-300` ad-hoc | ~50+ | `duration-phd-normal` |

---

## 7. Tipografia hardcoded

| Config atual | DDS alvo |
|---|---|
| `font-heading` → Montserrat | `font-phd-display` (wide/engineering) |
| `font-sans` → Inter | `font-phd-body` |
| Ausente: monospace | `font-phd-mono` |
| `font-black`, `font-light` | Proibido Light; Bold para display |
| `text-3xl` … `text-6xl` ad-hoc | `text-phd-heading-*`, `text-phd-display-*` |

---

## 8. Breakpoints hardcoded

| Tailwind default | DDS token | Uso Landing |
|---|---|---|
| `sm: 640px` | `phd-sm` | ✓ alinhado |
| `md: 768px` | `phd-md` | ✓ |
| `lg: 1024px` | `phd-lg` | ✓ |
| `xl: 1280px` | `phd-xl` | ✓ |
| `2xl: 1536px` | `phd-2xl` | ✓ |

Breakpoints estão alinhados ao DDS; falta adoção semântica (`phd-*` screens).

---

## 9. Z-index hardcoded

| Padrão atual | Camada DDS |
|---|---|
| `z-10` … `z-50` | `z-phd-raised` … `z-phd-modal` |
| `z-[100]` ad-hoc | `z-phd-max` |

---

## Arquivos prioritários para Fase 05B

| Prioridade | Arquivo | Motivo |
|---|---|---|
| P0 | `App.tsx` | Monólito — Hero, Navbar, Footer, Cards |
| P1 | `src/index.css` | `.strategic-shell`, `.strategic-card` |
| P1 | `PhdInsightsInstitutionalSection.tsx` | Maior violador accent/glow |
| P1 | `StrategicContentVideoSection.tsx` | Cards com blur |
| P2 | `InstitutionalBrandsMarquee.tsx` | Mais conforme — refinamento |
| P2 | `FloatingWhatsAppButton.tsx` | Verde externo |
| P3 | Admin (`src/admin/**`) | Fora do escopo Landing V3 |

---

## Notas

- Este inventário foi gerado por análise estática (grep + auditoria Fase 04).
- Nenhum valor legado foi alterado na Fase 05A.
- Tokens DDS disponíveis em `src/dds/` com prefixo `--phd-*` e classes `phd-*`.
