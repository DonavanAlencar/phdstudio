# PHD Studio V3 — Hero Typography Refinement

**Fase 05B.2B.3B**  
**Versão:** 1.0  
**Data:** 30/06/2026  
**Status:** Decisão definitiva — Variante **B** adotada e aplicada no código

---

## Pergunta experimental

> A tagline do Hero deve permanecer em **Michroma (Heading)** ou migrar para **Inter (Body emphasis)** para maximizar hierarquia, legibilidade e percepção de software premium?

**Resposta:** **Inter (`Body emphasis`)** — Variante B.

---

## Hipótese A — Display → Heading (Michroma)

**Implementação:** `<Heading as="p" level={2} spacing="none">` · `phd-type-heading-1` · Michroma semibold.

### Capturas

| Viewport | Arquivo |
|----------|---------|
| Desktop 1920×1080 | [`baselines/hero-typography-refinement/variant-a/desktop-hero.png`](./baselines/hero-typography-refinement/variant-a/desktop-hero.png) |
| Tablet 768×1024 | [`baselines/hero-typography-refinement/variant-a/tablet-hero.png`](./baselines/hero-typography-refinement/variant-a/tablet-hero.png) |
| Mobile 390×844 | [`baselines/hero-typography-refinement/variant-a/mobile-hero.png`](./baselines/hero-typography-refinement/variant-a/mobile-hero.png) |

*Origem: estado pós-05B.2B.3 (capturas HDR reutilizadas).*

---

## Hipótese B — Display → Body emphasis (Inter)

**Implementação:** `<Body as="p" emphasis size="lg" spacing="none">` · `phd-type-body-lg` · `phd-type-color-primary` · Inter regular.

### Capturas

| Viewport | Arquivo |
|----------|---------|
| Desktop 1920×1080 | [`baselines/hero-typography-refinement/variant-b/desktop-hero.png`](./baselines/hero-typography-refinement/variant-b/desktop-hero.png) |
| Tablet 768×1024 | [`baselines/hero-typography-refinement/variant-b/tablet-hero.png`](./baselines/hero-typography-refinement/variant-b/tablet-hero.png) |
| Mobile 390×844 | [`baselines/hero-typography-refinement/variant-b/mobile-hero.png`](./baselines/hero-typography-refinement/variant-b/mobile-hero.png) |

*Build local · dev server · Playwright Chromium.*

---

## Comparação completa

### Desktop

| Critério | Variante A | Variante B | Vencedor |
|----------|------------|------------|----------|
| Dominância do Display | Alta; Michroma ocupa bloco superior | **Mais alta**; contraste de família isola o H1 | **B** |
| Tagline — engenharia | Michroma transmite construção wide | Inter transmite eficiência operacional | A (marginal) |
| Tagline — precisão | Escala heading-1 (2rem) — presença wide duplicada | Escala body-lg (1rem) — proporção clássica SaaS | **B** |
| Tagline — software | Parece segundo título de produto | Parece subtítulo de console / changelog | **B** |
| Contraste entre níveis | Escala sim, família não | Escala + família + peso | **B** |
| Esforço cognitivo | Duas camadas wide exigem parsing similar | Leitura imediata: título → explicação | **B** |
| Fluxo de leitura | Headline → “outro título” → corpo | Headline → ponte → corpo | **B** |

**Desktop:** B preserva melhor a dominância do Display sem perder clareza da tagline.

---

### Tablet

| Critério | Variante A | Variante B | Vencedor |
|----------|------------|------------|----------|
| Competição visual | **Alta** — duas camadas Michroma em 3+2 linhas | **Baixa** — Display wide + tagline compacta Inter | **B** |
| Headline | Três linhas Michroma + accent | Idêntico | Empate |
| Tagline | Duas linhas Michroma competem com headline | Duas linhas Inter subordinadas | **B** |
| Ritmo vertical | Bloco tipográfico denso (mesmo registro) | Bloco aliviado; corpo tertiary separa melhor | **B** |
| Legibilidade | Boa, porém esforço de hierarquização maior | Melhor scan F-pattern | **B** |

**Tablet:** B resolve a hipótese do HDR — principal viewport de conflito.

---

### Mobile

| Critério | Variante A | Variante B | Vencedor |
|----------|------------|------------|----------|
| Equilíbrio | Headline 4 linhas Michroma + tagline 2 linhas Michroma = bloco monolítico | Headline Michroma + tagline Inter = alívio visual | **B** |
| Hierarquia | Escala diferencia, família unifica demais | Três registros distintos: wide / humanista / muted | **B** |
| Legibilidade | Tagline wide ocupa largura horizontal | Tagline Inter cabe melhor em 390px | **B** |
| CTAs | Iguais | Iguais | Empate |

**Mobile:** B mantém equilíbrio superior; A concentra ~60% do viewport em Michroma.

---

## Síntese por eixo

| Eixo | Vencedor | Justificativa |
|------|----------|---------------|
| **Headline — dominância** | **B** | Uma única família wide no viewport (DDL: máx. 2 famílias; Michroma só Display+Heading de seção, não tagline hero) |
| **Tagline — engenharia** | A (leve) | Michroma reforça modularidade literal |
| **Tagline — precisão / software** | **B** | Inter emphasis = camada operacional, padrão Linear/Vercel |
| **Hierarquia — contraste** | **B** | Display (wide 700) → Body emphasis (Inter primary) → Body muted (tertiary) |
| **Legibilidade** | **B** | Menor esforço; família muda sinaliza mudança de papel |
| **Ritmo** | **B** | Fluxo headline → explicação → detalhe → ação |
| **Tablet** | **B** | Menor competição — objetivo central do HDR |
| **Mobile** | **B** | Melhor equilíbrio vertical |

---

## Matriz DDL

| Critério | A (Heading) | B (Body emphasis) |
|----------|-------------|-------------------|
| **Geometria** | ✅ Michroma dupla reforça grade wide | ✅ Michroma restrita ao Display; geometria no título |
| **Hierarquia** | ⚠️ Escala ok; família duplicada enfraquece níveis | ✅ Três registros tipográficos distintos |
| **Precisão** | ⚠️ Dois blocos wide = ambiguidade de papel | ✅ Cada camada com função semântica clara |
| **Engenharia** | ✅ Double-wide = impacto técnico | ✅ **Princípio 06:** presença no Display, eficiência no corpo |
| **Silêncio visual** | ⚠️ Tagline ocupa massa visual de sub-título display | ✅ Tagline compacta; vazio relativo aumenta |
| **Accent** | ✅ (inalterado) | ✅ (inalterado) |

**DDL tipográfica:** B vence 5/6 critérios; A vence apenas em geometria literal da tagline, com custo de hierarquia.

---

## Posicionamento (Etapa 5)

### Proximidade — software premium

| Referência | A | B |
|------------|---|---|
| **Vercel** | Média | **Alta** — hero title display + subtitle sans |
| **Linear** | Média | **Alta** — hierarquia rígida display/body |
| **Stripe** | Média-alta | **Alta** — proposta clara em sans abaixo do título |

### Proximidade — perfis indesejados

| Perfil | A | B |
|--------|---|---|
| **Landing de agência** | **Mais próxima** — double bold/wide = billboard | Menos próxima |
| **Startup genérica** | Média | **Menos próxima** — contraste display/body é padrão SaaS maduro |

**Justificativa técnica:** Produtos premium (Vercel, Linear, Stripe) reservam fonte display/distintiva ao **título principal** e usam sans humanista/neutra para subtítulos. A Variante A viola esse padrão ao empilhar duas camadas Michroma — comportamento mais próximo de landing promocional do que de console de produto.

---

## Etapa 6 — Decisão

### **B — Migrar definitivamente para Display → Body emphasis**

**Justificativa:**

1. **HDR confirmado experimentalmente** — competição tablet/mobile reduzida de forma visível nas capturas.
2. **DDL Princípio 06** — «títulos com presença, corpo com eficiência»; tagline hero é ponte narrativa, não título de seção.
3. **Regra de ouro Michroma** (Typography Migration Plan §7.3) — Michroma em Display + Heading de **seção**, não em tagline subordinada ao único h1.
4. **Padrão replicável** — Creative/Insights spotlights: título `Heading`/`Display`, subtítulo impacto → `Body emphasis/lg`, corpo → `Body muted`.

### Variante C — descartada

**Híbrido `Heading scale="title"` (Inter via token title):** O componente `Heading` usa Michroma por padrão (`phd-font-role-heading`). Forçar Inter via `scale="title"` quebraria a API semântica do CES-006. **`Body emphasis`** é o caminho correto no DDS.

**Híbrido `Body emphasis` + `font-phd-semibold`:** Adicionaria peso sem tokenização pura; desnecessário — emphasis + escala body-lg cumprem hierarquia.

---

## Implementação aplicada

**Arquivo:** `App.tsx` → `StrategicHero`

```tsx
<Body
  as="p"
  emphasis
  size="lg"
  spacing="none"
  className="mt-4 md:mt-5 whitespace-pre-line"
>
  {`Então o problema não é conteúdo.\nÉ a forma como ele está estruturado.`}
</Body>
```

**Inalterado:** Display, accent, corpo muted, CTAs, layout, copy, decor, materiais.

**Import removido:** `Heading` (não utilizado no Hero).

---

## Padrão definitivo V3 — Hero

```
Display (Michroma, display-xl)     ← único wide acima da dobra
    ↓
Body emphasis lg (Inter, primary)  ← tagline / ponte narrativa
    ↓
Body muted (Inter, tertiary)       ← corpo explicativo
    ↓
Body semibold/medium (CTAs)        ← ação operacional
```

**Replicação obrigatória (05B.2B.4+):**

| Superfície | Título | Tagline / subtítulo impacto | Corpo |
|------------|--------|----------------------------|-------|
| Hero | `Display` | **`Body emphasis lg`** | `Body muted` |
| SectionHeader | `Heading` h2 | `Body muted` (description) | — |
| Creative / Insights spotlight | `Heading` display/h2 | **`Body emphasis lg`** | `Body muted` |
| Cards | `Heading` h3 | — | `Body sm muted` |

---

## QA

```text
npm run typecheck  →  exit 0
npm run build      →  exit 0 via npx vite build --outDir dist-build
                     (dist/ bloqueado por EPERM em dist/videos/background.mp4 — OneDrive/processo local;
                      build padrão falha ao esvaziar dist/; bundle compila sem erro de código)
```

---

## Decisão final

**Qual hierarquia tipográfica deverá ser adotada definitivamente pela PHD Studio V3?**

### **B**

Display (Michroma) → Body emphasis (Inter) para a tagline do Hero.

---

## Recomendação

**O Hero atual deve se tornar o padrão visual definitivo para a PHD Studio V3?**

### ✅ **Sim**

Com a Variante B aplicada, a hierarquia tipográfica do Hero está **fechada** para replicação em larga escala. Pendências remanescentes (materiais CTAs, radial decor, token display-xl) são escopo de fases posteriores — **não bloqueiam** o padrão tipográfico.

---

*Referências: [HDR](./PHD_HERO_DESIGN_REVIEW.md), [05B.2B.3 Report](./PHD_DDS_PHASE_05B2B3_REPORT.md), [Typography Migration Plan](./PHD_TYPOGRAPHY_MIGRATION_PLAN.md), [DDL](./PHD_Digital_Design_Language.md)*
