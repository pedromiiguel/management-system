# 0013 — Rebrand para Costa's Espetos: paleta quente, tokens neutros de cinza, login novo

- **Status:** Aceito (implementado)
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

### 2. Nome canônico da marca: "Costa's Espetos" (corrigido após upload do logo real)

Primeira rodada de grilling só tinha 13% do PNG reconstruído (limite de
256 KiB do `get_file` do MCP `claude_design`) — não dava para ler o nome
gravado no emblema. Nessa rodada o usuário confirmou "Costas's Espetos"
(duplo possessivo), a grafia que já estava em `apps/web/index.html`.

Depois do usuário subir `logo.png` manualmente (944×1120, completo) para
`apps/web/public/`, o nome gravado na arte ficou visível: **"COSTA'S"**
(possessivo simples), não "Costas's". Segunda rodada de grilling: usuário
confirmou a correção para bater com o logo. Nome canônico final:
**"Costa's Espetos"**. Propagado para: `Sidebar.view.tsx` (lockup "Costa's
/ ESPETOS"), `LoginBrandPanel.constants.ts` (`BRAND_NAME`), `CLAUDE.md`
(era "Costas BAR"), `apps/web/index.html` (era "Costas's Espetos — Gestão",
tinha o mesmo erro que foi confirmado como certo na 1ª rodada).

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

### 5. Emblema completo só no login; sidebar ganha ícone recortado + texto

O emblema circular foi desenhado para os ~196px do painel de marca do
login — a 92px (largura da sidebar) o arco de texto ("...DELÍCIA NA
GRELHA") vira ilegível, e o emblema completo é uma ilustração carregada
(chopes brindando, espetinhos na grelha, panela de caldo, 3 faixas de
texto) que não funciona como ícone pequeno. Primeira decisão do usuário
(1ª rodada, com só 13% do PNG visível): usar o emblema só no login e
manter a sidebar com lockup tipográfico puro.

Depois do upload do `logo.png` completo, o usuário revisou essa decisão:
pediu para a sidebar ganhar um ícone da marca, não só texto. Como o
emblema inteiro continua ilegível a 92px, a solução foi recortar
programaticamente só o elemento da grelha com os espetinhos (a peça mais
literal do nome "Espetos") do próprio `logo.png` — sem chroma-key ou
edição de cor, só um crop retangular (`x:175,y:395,460×270` do arquivo
original 944×1120) que fica inteiramente dentro da ilustração, sem tocar
o fundo preto opaco do canvas externo. Salvo como `apps/web/public/
logo-mark.png`, exibido a 28px via `object-fit: cover` num container
arredondado, ao lado do lockup "Costa's / ESPETOS" (que se mantém —
o ícone sozinho não substitui o texto, complementa).

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

## Alternativas rejeitadas

- **Só re-skin, sem login novo**: rejeitada — deixaria a peça central do
  handoff (o login) de fora.
- **Só login novo, resto do app azul**: rejeitada pelo usuário — geraria
  duas identidades visuais coexistindo.
- **Manter "Costas's Espetos" (grafia do `index.html`)**: essa foi a decisão
  da 1ª rodada, rejeitada depois pelo próprio usuário na 2ª rodada, ao ver
  que o `logo.png` completo grava "COSTA'S" — corrigido para bater com o
  logo (ver Decisão 2).
- **Só trocar valor dos cinzas hardcoded, sem promover a token**: rejeitada
  — usuário preferiu pagar o custo de nomear agora, já que os valores iam
  ser tocados de qualquer forma.
- **Manter `--sol-900`/`--sol-800`**: rejeitada — nome de token não deve
  carregar marca que está saindo.
- **Emblema completo também na sidebar, fiel ao handoff**: rejeitada — o
  emblema inteiro não é legível a 92px. Resolvido com um recorte (Decisão 5),
  não com o emblema completo nem só texto.
- **"Falar com o suporte" como `mailto:`/WhatsApp**: rejeitada por ora —
  nenhum canal definido nesta rodada; texto morto até haver decisão.

## Consequências

- `apps/web/src/styles.css`: `:root` reescrito com paleta quente; 7 tokens
  novos de superfície/sombra; `--sol-900`/`--sol-800` renomeados para
  `--ink-900`/`--ink-800`. Nenhuma classe CSS (`.s-*`) muda de nome.
- `Sidebar.view.tsx`: `Sun` (lucide) removido; ícone recortado
  (`logo-mark.png`, 28px, `object-fit: cover`) + lockup tipográfico "Costa's
  / ESPETOS" no lugar do círculo com ícone lucide.
- `LoginPage.model.ts`/`.types.ts`/`.tsx`/`.view.tsx`: ganham
  `passwordVisible`/`onTogglePasswordVisible`; a marca do login (glow,
  halos, emblema, features, rodapé) extraída para `presentation/flows/
  login/components/LoginBrandPanel/` (MVVM completo: `.tsx`, `.view.tsx`,
  `.constants.ts`, `index.ts`).
- `CLAUDE.md`, `apps/web/index.html`: "Costas BAR"/"Costas's Espetos" →
  "Costa's Espetos".
- `apps/web/public/logo.png` (944×1120, upload manual do usuário — o MCP
  `claude_design` não baixa acima de 256 KiB) e `apps/web/public/
  logo-mark.png` (recorte da grelha com espetinhos, 460×270, gerado a
  partir do primeiro) adicionados ao repo.
- Typecheck (`tsc --noEmit`) limpo em `apps/web`. Suíte `apps/web` (vitest):
  58/58 verdes, sem regressão (nenhum teste toca `styles.css`/`Sidebar`/
  `LoginPage`).
