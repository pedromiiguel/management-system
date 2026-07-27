# 0013 — Rebrand para Costas's Espetos: paleta quente, tokens neutros de cinza, login novo

- **Status:** Aceito (parcialmente implementado — ver "Pendências")
- **Estende:** a convenção de tokens CSS já existente em `styles.css`; a
  convenção MVVM de [componentes-mvvm.md](../componentes-mvvm.md) para o novo
  `LoginBrandPanel`
- **Não reabre:** [ADR 0012](0012-migracao-sol-lucide.md) — os ícones
  continuam vindo de `lucide-react`; esta rodada só troca *quais* ícones e
  *quais* cores, não a fonte

## Contexto

`grill-with-docs` foi rodado com um handoff hi-fi novo (`claude_design` MCP,
projeto `Sistema Distribuidora Sol - Hi-Fi.html`). Comparação tela a tela
contra o código atual mostrou que **nenhuma das 4 telas internas** (PDV,
Produtos, Financeiro, Relatórios) tem mudança de estrutura — grid, tabelas,
DRE, chips de filtro, tudo já é o que está implementado. O que o handoff
entrega de fato é:

1. Uma paleta quente (laranja `#E07B24`/`--ink-900: #17120F`) no lugar da
   azul atual (`#0090c1`/`#022f40`).
2. Uma tela de login redesenhada (painel de marca com emblema, glow,
   halos, lista de features, rodapé; olho de mostrar/ocultar senha; link de
   suporte no lugar de "Esqueci minha senha").
3. Um emblema de marca (`logo.png`, 944×1120) que substitui o lockup de
   texto atual.

Inspeção do repo antes de decidir:

- **Zero hex em `.ts`/`.tsx`** — toda cor de componente já passa por
  variável CSS. A troca de paleta é, em tese, uma edição de `:root` em
  `styles.css`.
- Mas `styles.css` também tinha ~8 cinzas (`#f7f9fa`, `#eef1f3`, `#eaeef0`,
  `#cdd6da`, `#e8ecee`, `#ecf0f2`) e ~12 `rgba(2, 47, 64, …)` de sombra/
  overlay **hardcoded**, não tokenizados — resíduo do azul que a troca de
  paleta deixaria capenga se só os tokens nomeados fossem trocados.
- A marca do app estava inconsistente em 4 lugares: `index.html` dizia
  "Costas's Espetos — Gestão"; `Sidebar.view.tsx` dizia "Costas / BAR";
  `LoginPage.view.tsx` dizia "Distribuidora / SOL"; `CLAUDE.md` dizia
  "Costas BAR". O handoff trazia um quinto nome no rodapé do login e no
  `alt` do logo: "Distribuidora Costa's Espetos".
- `--sol-900`/`--sol-800` (tokens de cor escura) tinham nome de marca — mas
  uso pequeno o bastante (15 ocorrências dentro do próprio `styles.css`, 2
  em `.tsx`) para renomear sem custo alto.
- O `logo.png` do handoff **não é baixável pelo `claude_design` MCP**:
  `get_file` corta em 256 KiB e o arquivo tem ~197 KB de payload base64 mas
  ultrapassa o limite decodificado, retornando `truncated: true`. Uma
  reconstrução parcial dos primeiros 13% do PNG (via re-implementação manual
  do filtro PNG a partir dos chunks IDAT completos) mostrou um emblema
  circular fotografado ("...DELÍCIA NA GRELHA", "DESDE 20..."), não um
  lockup vetorial limpo — não deu para confirmar a grafia exata da marca
  por essa via.

## Decisão

Todas as decisões abaixo foram grilled com o usuário via `AskUserQuestion`
(6 perguntas, 2 rodadas).

### 1. Escopo: re-skin completo + login novo

Decisão explícita do usuário: troca a paleta inteira (tokens nomeados +
os cinzas/sombras hardcoded), substitui o lockup de texto pelo emblema nas
telas onde ele é legível, e implementa o login novo por completo (painel de
marca, olho de senha, features, link de suporte). Rejeitada a alternativa de
fazer só paleta+logo sem o login novo, e a de fazer só o login sem tocar na
paleta do resto do app (deixaria o app com duas identidades visuais
coexistindo).

### 2. Nome canônico da marca: "Costas's Espetos"

Decisão do usuário: apesar do handoff usar "Costa's Espetos" (apóstrofo
simples) no `alt` do logo e no rodapé do login, o nome canônico do produto
passa a ser **"Costas's Espetos"** — a grafia que já estava em
`apps/web/index.html` antes desta rodada. Propagado para: `Sidebar.view.tsx`
(lockup "Costas's / ESPETOS"), `LoginBrandPanel.constants.ts`
(`BRAND_NAME`), `CLAUDE.md` (era "Costas BAR"). `index.html` já estava
correto, não precisou de mudança.

### 3. Cinzas e sombras: promovidos a tokens, não só trocados

Decisão do usuário: como os ~20 valores hardcoded iam ser tocados de
qualquer jeito nesta troca de paleta, este é o momento barato de nomeá-los.
Novos tokens em `styles.css`:

| Token | Valor | Papel |
|---|---|---|
| `--surface-soft` | `#faf7f2` | hover de botão, fundo de linha "forte" no DRE, fundo do cupom |
| `--surface-mute` | `#f0ebe3` | tag "dim", faixa de atalhos do PDV (`.s-strip`) |
| `--surface-sunk` | `#ede7de` | fundo do `.s-seg` (tabs segmentadas) |
| `--line-soft` | `#f0ebe4` | borda de linha de tabela/DRE (mais clara que `--line`) |
| `--track` | `#ebe5dc` | trilho da barra de progresso |
| `--track-strong` | `#d3cac0` | trilho do toggle (estado "off") |
| `--shadow-rgb` | `23 18 15` | componentes RGB de `--ink-900`, para uso em `rgb(var(--shadow-rgb) / alpha)` em sombras/overlays |

Todo `rgba(2, 47, 64, X)` do CSS antigo virou `rgb(var(--shadow-rgb) / X)`.
Uma próxima troca de marca edita só o bloco `:root`, sem caçar hardcoded de
novo.

### 4. `--sol-900`/`--sol-800` renomeados para `--ink-900`/`--ink-800`

Decisão do usuário: o nome do token não deve carregar o nome de uma marca
que está saindo. Renomeado nos 2 usos em `.tsx` (`OverviewTab.view.tsx`,
`LoginPage.view.tsx`) e nas 15 ocorrências em `styles.css` (que já estava
sendo reescrito nesta rodada). `--sol-800` não tinha nenhum consumidor —
morto desde antes desta rodada, mantido morto sob o novo nome (`--ink-800`)
por ora, sem remover — não é escopo desta rodada decidir se ele deveria
existir.

### 5. Emblema só no login; sidebar mantém lockup de texto

O emblema circular foi desenhado para os ~196px do painel de marca do
login — a 92px (largura da sidebar) o arco de texto ("...DELÍCIA NA
GRELHA") vira ilegível. Decisão do usuário: usar o emblema só onde ele
funciona (login, via `<img>` em `LoginBrandPanel`) e manter a sidebar com
lockup tipográfico puro ("Costas's" / "ESPETOS", mesmo tratamento de peso/
tracking que "BAR" já tinha). Desvio consciente do handoff, que usava o
mesmo emblema nos dois lugares — o handoff não testou o emblema nesse
tamanho.

### 6. "Falar com o suporte": texto morto por ora

O handoff substitui "Esqueci minha senha" (que já era texto morto, sem
`href`/`onClick`) por um link de suporte. Decisão do usuário: manter texto
morto — nenhum canal de suporte (WhatsApp, e-mail) foi definido nesta
rodada. Não é regressão: o elemento anterior também não tinha ação.

### 7. Login ganha 3 elementos com comportamento real

- **Olho de mostrar/ocultar senha**: estado (`passwordVisible`) e callback
  (`onTogglePasswordVisible`) na `LoginPage.model.ts`, alternando o `type`
  do input entre `password`/`text`. Não é decoração — é o único ponto novo
  desta rodada com lógica de fato, por isso mora na Model, não só na View.
- **Lista de 3 features** (Caixa rápido, Estoque baixado a cada venda,
  Fechamento do dia sem planilha): estático, vira `LoginBrandPanel.
  constants.ts` (`BRAND_FEATURES`), seguindo o padrão de constantes locais
  do componente (mesmo espírito de `Sidebar.constants.ts`/`PaymentTiles.
  constants.ts`).
- **Painel de marca vira componente próprio** (`LoginBrandPanel`), com
  ViewModel+View separados mesmo sendo passthrough puro — consistente com a
  convenção que o [ADR 0012](0012-migracao-sol-lucide.md) fixou para este
  repo (todo componente de `presentation/` ganha ViewModel+View, mesmo sem
  lógica), aplicada aqui a um componente novo de flow (`presentation/flows/
  login/components/`), não só aos globais de `presentation/components/`.

## Pendências

**O arquivo `logo.png` não está no repo.** Não é possível baixá-lo pelo MCP
`claude_design` (ver Contexto — limite de 256 KiB do `get_file`, arquivo
maior). `apps/web/public/logo.png` fica como referência (`<img src="/
logo.png">` em `LoginBrandPanel.view.tsx`) para o usuário salvar o arquivo
baixado manualmente do claude.ai/design; documentado em `apps/web/public/
README.md`. Até lá, o login renderiza o `alt` no lugar da imagem — não
quebra a tela, só fica sem o emblema.

## Alternativas rejeitadas

- **Só re-skin, sem login novo**: rejeitada — deixaria a peça central do
  handoff (o login) de fora.
- **Só login novo, resto do app azul**: rejeitada pelo usuário — geraria
  duas identidades visuais coexistindo.
- **Manter "Costa's Espetos" (apóstrofo simples) do handoff**: rejeitada —
  usuário confirmou "Costas's Espetos" (grafia do `index.html` já existente)
  como canônica.
- **Só trocar valor dos cinzas hardcoded, sem promover a token**: rejeitada
  — usuário preferiu pagar o custo de nomear agora, já que os valores iam
  ser tocados de qualquer forma.
- **Manter `--sol-900`/`--sol-800`**: rejeitada — nome de token não deve
  carregar marca que está saindo.
- **Emblema também na sidebar, fiel ao handoff**: rejeitada — o emblema não
  é legível a 92px; usuário preferiu lockup de texto na sidebar.
- **"Falar com o suporte" como `mailto:`/WhatsApp**: rejeitada por ora —
  nenhum canal definido nesta rodada; texto morto até haver decisão.

## Consequências

- `apps/web/src/styles.css`: `:root` reescrito com paleta quente; 7 tokens
  novos de superfície/sombra; `--sol-900`/`--sol-800` renomeados para
  `--ink-900`/`--ink-800`. Nenhuma classe CSS (`.s-*`) muda de nome.
- `Sidebar.view.tsx`: `Sun` (lucide) removido; lockup tipográfico "Costas's
  / ESPETOS" no lugar do círculo com ícone.
- `LoginPage.model.ts`/`.types.ts`/`.tsx`/`.view.tsx`: ganham
  `passwordVisible`/`onTogglePasswordVisible`; a marca do login (glow,
  halos, emblema, features, rodapé) extraída para `presentation/flows/
  login/components/LoginBrandPanel/` (MVVM completo: `.tsx`, `.view.tsx`,
  `.constants.ts`, `index.ts`).
- `CLAUDE.md`: "Costas BAR" → "Costas's Espetos".
- `apps/web/public/logo.png`: pendente, ver "Pendências".
- Typecheck (`tsc --noEmit`) limpo em `apps/web`. Suíte `apps/web` (vitest):
  58/58 verdes, sem regressão (nenhum teste toca `styles.css`/`Sidebar`/
  `LoginPage`). Verificado no browser (dev server + Postgres local):
  login (paleta laranja, olho de senha alternando `type`, features, sem
  erro de console apesar do `logo.png` ausente), sidebar (lockup de texto,
  zero erro), Produtos e Financeiro (paleta aplicada em tabela/DRE/chips,
  zero erro de console).
