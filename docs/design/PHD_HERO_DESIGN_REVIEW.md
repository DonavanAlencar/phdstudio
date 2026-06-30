# PHD Studio V3 — Hero Design Review (HDR)

**Fase 05B.2B.3A**  
**Versão:** 1.0  
**Data:** 30/06/2026  
**Status:** Revisão de Direção de Arte concluída — nenhum código alterado

---

## Pergunta central

> Se um usuário acessar apenas o Hero durante 5 segundos, ele perceberá a PHD Studio como uma empresa de **software e tecnologia** ou ainda como uma **agência de marketing premium**?

**Resposta:** Perceberá **predominantemente software e tecnologia** — mais do que no VRB —, mas ainda com **resíduo perceptível de landing de marketing** por elementos fora do escopo tipográfico (radial vermelho de fundo, materiais legados dos CTAs, copy orientada a conteúdo/marketing). A migração tipográfica deslocou o eixo perceptual; não o completou sozinha.

---

## ETAPA 1 — Capturas

### Depois (Hero DDS — pós 05B.2B.3)

| Viewport | Resolução | Arquivo |
|----------|-----------|---------|
| Desktop | 1920 × 1080 | [`baselines/hero-dds-hdr/desktop-hero.png`](./baselines/hero-dds-hdr/desktop-hero.png) |
| Tablet | 768 × 1024 | [`baselines/hero-dds-hdr/tablet-hero.png`](./baselines/hero-dds-hdr/tablet-hero.png) |
| Mobile | 390 × 844 | [`baselines/hero-dds-hdr/mobile-hero.png`](./baselines/hero-dds-hdr/mobile-hero.png) |

**Ambiente:** build de produção local · `vite preview` · Playwright Chromium · mesmas resoluções do VRB.

### Antes (VRB v3-foundation — pré tipografia DDS)

| Viewport | Resolução | Arquivo |
|----------|-----------|---------|
| Desktop | 1920 × 1080 | [`baselines/v3-foundation/desktop-hero.png`](./baselines/v3-foundation/desktop-hero.png) |
| Tablet | 768 × 1024 | [`baselines/v3-foundation/tablet-full.png`](./baselines/v3-foundation/tablet-full.png) *(recorte visual: viewport superior)* |
| Mobile | 390 × 844 | [`baselines/v3-foundation/mobile-full.png`](./baselines/v3-foundation/mobile-full.png) *(recorte visual: viewport superior)* |

---

## ETAPA 2 — Comparação (visual, não automatizada)

### Desktop — Antes × Depois

| Dimensão | VRB (antes) | Hero DDS (depois) |
|----------|-------------|-------------------|
| Headline | Montserrat 900, escala até ~6rem (`lg:text-8xl`), `tracking-tight` | Michroma 700, `display-xl` 4rem, tracking +0.04em |
| Accent «clientes?» | Gradiente `bg-clip-text` branco→vermelho | Vermelho sólido `#e50914` |
| Tagline | Inter extrabold, escala manual até ~2.25rem | Michroma semibold, `heading-1` 2rem |
| Corpo | Inter medium, `text-gray-300` | Inter regular, `text-phd-tertiary` |
| CTAs (tipografia) | `font-bold` inline | `Body` semibold / medium |
| Composição | Idêntica | Idêntica |
| Fundo / decor | Radial vermelho + obsidiana | **Inalterado** |
| Botões | `rounded-lg`, sombra vermelha | **Inalterados** |

**Leitura visual:** O “antes” comunicava impacto publicitário (peso 900 + gradiente + escala máxima). O “depois” comunica painel de controle — tipografia wide alinhada ao wordmark STUDIO, accent cirúrgico, hierarquia por escala e opacidade em vez de peso extremo.

### Tablet — Antes × Depois

No VRB, o hero tablet apresentava headline Montserrat preta com gradiente e tagline Inter extrabold grande — ritmo similar ao desktop, com quebras mais frequentes.

No HDR, Michroma ocupa três linhas na headline («Seu conteúdo / não gera / clientes?») com accent sólido na última linha. A tagline Michroma em duas linhas mantém subordinação por escala, mas a **dupla presença wide** (Display + Heading) é mais evidente em 768px do que no desktop — ambas as camadas competem pelo mesmo “registro” visual.

### Mobile — Antes × Depois

No VRB mobile, headline legada em escala reduzida com gradiente; CTAs empilhados full-width.

No HDR mobile, Michroma em quatro linhas na headline reforça modularidade geométrica; accent «clientes?» isolado em vermelho sólido na linha final funciona como âncora de leitura. Corpo tertiary legível; CTAs permanecem claramente acionáveis. Cookie banner e WhatsApp ocupam área significativa — igual ao VRB.

---

## ETAPA 3 — Hierarquia

### Headline

| Pergunta | Avaliação |
|----------|-----------|
| Continua sendo o primeiro ponto de atenção? | **Sim.** Escala `display-xl`, posição superior, `text-wrap:balance` e accent vermelho na palavra-chave mantêm o H1 como âncora — confirmado nas três capturas. |
| A Michroma aumentou autoridade? | **Sim.** A família wide espelha o STUDIO do logo; transmite engenharia e construção modular em vez de peso publicitário (900). |
| A headline perdeu impacto? | **Parcialmente.** A redução de ~6rem para 4rem no desktop é perceptível: menos “billboard”, mais “console”. A Michroma compensa parcialmente via largura de forma e tracking, mas não restaura 100% da massa visual anterior. |

### Tagline

| Pergunta | Avaliação |
|----------|-----------|
| Está claramente subordinada? | **Sim no desktop** (razão ~2:1 entre display-xl e heading-1). **Com ressalva no tablet/mobile**, onde duas camadas Michroma consecutivas reduzem o contraste de “família” entre níveis. |
| Compete visualmente com o Display? | **Leve competição em tablet.** Ambas usam Michroma; a diferenciação depende quase exclusivamente de escala — funcional, mas menos sofisticada que o par Display/Body típico de produtos SaaS (Linear, Stripe). |

### Corpo

| Pergunta | Avaliação |
|----------|-----------|
| Continua confortável para leitura? | **Sim.** Inter em `body` / `body-sm` responsivo; duas linhas curtas; `max-w-2xl` preservado. |
| O contraste é suficiente? | **Sim.** `text-phd-tertiary` sobre obsidiana mantém leitura confortável; hierarquicamente abaixo do branco pleno da tagline. |

### CTAs

| Pergunta | Avaliação |
|----------|-----------|
| Continuam claramente ações? | **Sim.** Botão vermelho preenchido + ghost border; hierarquia primário/secundário intacta. |
| O peso tipográfico está correto? | **Sim.** `font-phd-semibold` no primário e `font-phd-medium` no secundário — adequado ao CES; Inter operacional, sem Michroma. |

---

## ETAPA 4 — Accent

### Antes: gradiente tipográfico

O gradiente em «clientes?» criava movimento e “efeito premium publicitário”, mas violava DDL/DDS (cor como decoração tipográfica, não sinal). Atraía o olhar com ruído — a leitura da palavra competia com o efeito.

### Depois: accent sólido

| Pergunta | Avaliação |
|----------|-----------|
| O accent continua atraindo o olhar? | **Sim.** Vermelho `#e50914` em uma única palavra no final da headline permanece o segundo ponto focal após o bloco branco. |
| O vermelho está excessivo? | **Não na tipografia.** Uma palavra + CTA primário respeitam DDL Cap. 6 (vermelho como frequência, não superfície). O radial de fundo (fora do escopo 05B.2B.3) ainda expande vermelho na atmosfera. |
| O vermelho ficou fraco? | **Não.** O sólido é mais legível que o gradiente; perde brilho decorativo, ganha precisão semântica. |
| A leitura melhorou? | **Sim.** «clientes?» lê-se de forma imediata, sem artefato de clipping ou transição de cor intra-palavra. |

---

## ETAPA 5 — Escala (6rem → 4rem)

| Pergunta | Avaliação |
|----------|-----------|
| O Hero perdeu presença? | **Sim, moderadamente no desktop.** A headline ocupa menos área vertical e horizontal perceptiva; o vazio ao redor aumenta relativamente. |
| A Michroma compensou essa redução? | **Parcialmente.** Tracking +0.04em e formas wide mantêm presença estrutural; o olho lê “sistema” em vez de “grito”. Não equivale à massa de 6rem Montserrat 900. |
| Existe necessidade de ajuste no token Display? | **Avaliar em fase futura.** Um incremento de `display-xl` para 4.5–5rem em viewport ≥1280px restauraria presença sem violar modularidade — **não implementar nesta revisão**. Conclusão: compensação atual é **aceitável**, ajuste de token é **opcional e de baixa prioridade**. |

---

## ETAPA 6 — Ambigrama

| Qualidade | Transmitida? | Evidência visual |
|-----------|--------------|------------------|
| Engenharia | ✅ | Michroma wide + hierarquia rígida; corpo Inter eficiente |
| Modularidade | ✅ | Letras com ritmo de blocos; quebras de linha em grid implícito (mobile: 4 linhas headline) |
| Precisão | ✅ | Accent cirúrgico; tokens; ausência de gradiente tipográfico |
| Construção geométrica | ✅ | Paralelo direto com hastes do ambigrama e wordmark STUDIO |

**A relação visual com o ambigrama está perceptível?**

**Sim.** Em 5 segundos, o usuário que conhece o logo associa a headline Michroma ao STUDIO — coerência de família wide que não existia com Montserrat. A transição de identidade gráfica → tipografia de interface é a conquista principal desta fase.

---

## ETAPA 7 — Software Premium

### Proximidade comparativa

| Referência | Afinidade | Justificativa técnica |
|------------|-----------|----------------------|
| **Vercel** | Alta | Dark-first, tipografia como protagonista, accent mínimo, vazio generoso |
| **Linear** | Alta | Hierarquia tipográfica rígida, sensação de produto, não campanha |
| **Stripe** | Média-alta | Clareza de proposta + CTA único; PHD ainda mais escura e com radial decorativo |
| **Framer** | Média | Impacto visual forte, mas Framer usa mais cor/atmosfera — PHD está mais contida |
| **Apple** | Média | Silêncio e escala, mas Apple usa San Francisco (humanista), não wide display |

### O que ainda remete a outros perfis

| Perfil | Resíduo | Causa (não tipografia) |
|--------|---------|------------------------|
| Landing de agência | Moderado | Copy centrada em “conteúdo/posts”; radial vermelho atmosférico; CTAs `rounded-lg` legados |
| Startup genérica | Baixo | Michroma distancia do template Inter-bold padrão |
| IA genérica | Baixo | Sem badges “AI”, sem glow neon, sem gradientes tipográficos |

**Conclusão:** O Hero **aproxima-se mais de Vercel/Linear** do que de agência premium genérica — **desde a migração tipográfica**. Materiais e decor legados ainda ancoram leitura de marketing funnel.

---

## ETAPA 8 — DDL

| Critério | Resultado | Nota |
|----------|-----------|------|
| Geometria | ✅ | Tipografia wide modular; composição em coluna com vazio estrutural |
| Hierarquia | ✅ | Display → Heading → Body → CTAs; accent em única palavra |
| Precisão | ✅ | Tokens DDS; zero classes tipográficas legadas no Hero |
| Engenharia | ✅ | Michroma em display/heading; Inter no corpo e CTAs; peso 700 não 900 |
| Silêncio visual | ✅ | ≥40% viewport em vazio; densidade controlada |
| Accent cirúrgico | ⚠️ → ✅* | *Tipografia: ✅ (uma palavra + CTA). Decor de fundo: radial vermelho ainda expande accent além do cirúrgico — fora do escopo 05B.2B.3, pendente CES-018 |

**Checklist DDL tipográfico do Hero:** 6/6 nos elementos migrados. Decor de superfície permanece dívida conhecida.

---

## Tipografia — Avaliação completa

| Camada | Componente | Veredito |
|--------|------------|----------|
| Display (H1) | Michroma `display-xl` | Aprovado — assinatura V3 estabelecida |
| Accent | `text-phd-accent-brand` | Aprovado — anti-pattern eliminado |
| Tagline | `Heading` Michroma `heading-1` | Aprovado com ressalva — considerar peso visual em tablet |
| Corpo | `Body muted` | Aprovado |
| CTAs | `Body` semibold/medium | Aprovado |
| Badge | N/A | Consistente com arquitetura VRB |

**Anti-padrões eliminados no Hero:** `font-heading`, `font-black`, `tracking-tight`, `bg-clip-text`, `text-gray-*` tipográfico.

---

## ETAPA 9 — Decisão

### **B — Aprovar com ajustes**

O Hero **pode servir como referência tipográfica** para a Landing (Display, Heading, Body, accent sólido, hierarquia por tokens), mas **não como referência integral de direção de arte** até os ajustes abaixo serem endereçados nas fases competentes.

### Ajustes necessários (priorizados por impacto)

| # | Impacto | Ajuste | Fase sugerida |
|---|---------|--------|---------------|
| 1 | **Alto** | Reavaliar tagline em **Inter `Body` emphasis/lg** em vez de Michroma `Heading` — reduz dupla camada wide e aproxima de padrão SaaS (Linear/Stripe) sem perder hierarquia | 05B.2B.3B ou 05B.2B.4 |
| 2 | **Médio** | Avaliar incremento de `--phd-type-display-xl-size` para **4.5–5rem** em desktop (≥1280px) se presença above-the-fold for prioridade sobre silêncio | Token review pós-HDR |
| 3 | **Médio** | Remover **radial gradient vermelho** do `decor` do Hero (CES-018 — obsidiana pura) | Hero Pattern / material |
| 4 | **Baixo** | Migrar CTAs para **Button Primary/Secondary** DDS (chanfro, metal accent) — tipografia já correta | CES-010/011 |

**Nenhum ajuste acima deve ser feito nesta fase HDR.**

---

## Recomendação

**O Hero atual deve se tornar o padrão visual definitivo para a PHD Studio V3?**

### ⚠️ **Sim, com ajustes**

O Hero estabelece corretamente o **padrão tipográfico** V3 (Michroma display, accent sólido, tokens, hierarquia DDS) e move o posicionamento perceptual para **software premium**. Para ser padrão **definitivo integral**, requer os quatro ajustes listados — sendo o item 1 (tagline Inter vs Michroma) o mais relevante para a pergunta dos 5 segundos.

---

## Posicionamento estratégico

| Dimensão | Avaliação |
|----------|-----------|
| Marketing + IA + Tecnologia | Copy comunica marketing de conteúdo; tipografia comunica tecnologia — **equilíbrio inclinado para tech após migração** |
| Engenharia / software premium | **Melhorou significativamente** vs VRB |
| Clichês de agência | **Reduzidos** na tipografia; persistem em decor e materiais |
| Clichês de IA genérica | **Ausentes** |

Esta revisão serve como referência para as migrações 05B.2B.4+: **replicar o modelo Display + accent sólido + Body muted**; **não replicar cegamente Michroma em todas as taglines** sem validar hierarquia por viewport.

---

## Anexos

- [Relatório 05B.2B.3](./PHD_DDS_PHASE_05B2B3_REPORT.md)
- [Typography Migration Plan](./PHD_TYPOGRAPHY_MIGRATION_PLAN.md)
- [VRB v3-foundation](./baselines/v3-foundation/README.md)
- [Capturas HDR](./baselines/hero-dds-hdr/README.md)

---

*PHD Studio V3 · Hero Design Review · Fase 05B.2B.3A — revisão concluída sem alteração de código*
