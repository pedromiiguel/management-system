# 0012 — `src/components/` migra para `presentation/components/`: sol.tsx vira 16 componentes MVVM, ícones viram lucide-react

- **Status:** Aceito (implementado)
- **Estende:** a convenção de componentes de [componentes-mvvm.md](../componentes-mvvm.md); a convenção de `presentation/components/` (componentes globais) de [arquiteture.md](../arquiteture.md#padrão-de-presentation)
- **Reverte parcialmente:** a Decisão 2 do [ADR 0011](0011-clean-architecture-auth.md), que manteve `SolIcon` deliberadamente para os ícones de marca da sidebar/login — ver Decisão 1 abaixo

## Contexto

`grill-with-docs` foi rodado de novo para checar `apps/web/src/components/`,
pasta legada fora da Clean Architecture (`arquiteture.md` só documenta
`presentation/components/` como lar de componente global). Ela tinha dois
arquivos:

- `sol.tsx` (432 linhas): 16 primitivas de design system (`SBtn`, `SIconBtn`,
  `SCard`, `SModal`, `STable`, `STag`, `SChip`, `SStat`, `SKbd`, `SCheck`,
  `SSeg`, `SToggle`, `SBars`, `SDre`, `SProgress`, `ToastProvider`/`useToast`)
  todas soltas num arquivo único, sem pasta/MVVM/barrel — e o ícone caseiro
  `SolIcon`/`IconName` (10 glifos SVG desenhados à mão).
- `confirm.tsx`: diálogo de confirmação imperativo via `react-call`
  (`await Confirm.call({...})`), único consumidor de `SBtn`/`SModal` de
  dentro da própria pasta legada.

Inspeção confirmou o uso real de cada peça antes de decidir o que fazer:

- `SolIcon` usado direto em 2 lugares (`Sidebar.view.tsx` — logo + 6 ícones
  de nav; `LoginPage.view.tsx` — logo) e indiretamente via a prop `icon` de
  `SBtn`/`SIconBtn` em 2 lugares (`ProductsPage.tsx`, `SaleItemsCard.tsx`,
  ambos `icon="trash"`). As variantes `search`/`scan` do glifo nunca chegaram
  a ser usadas em lugar nenhum — dead code puro.
- As 16 primitivas de `sol.tsx` tinham entre 1 e 32 consumidores cada
  (`SBtn`: 32, `useToast`: 20, `SCard`/`SModal`: 18, `STable`: 17 — o grosso
  do uso; `SDre`/`SProgress`: 1 cada, só em `OverviewTab` do financeiro).
  Todos os imports usavam o alias `@/components/sol`, sem nenhum import
  relativo nem aliasing (`import { X as Y }`).
- `ToastProvider`/`useToast` é a única primitiva com estado real
  (`useState`+`useCallback`+`useEffect`+`Context`) — todas as outras 15 são
  puramente apresentacionais (recebem props prontas, renderizam).
- `STableProps` (a interface) não era importada por ninguém fora do próprio
  `sol.tsx`.
- Nenhum teste unitário (`*.test.ts`) do `apps/web` referenciava `sol.tsx`
  ou `confirm.tsx` diretamente — a suíte de 53 arquivos/58 testes cobre só
  `data/handlers`, camada não tocada por esta migração.
- O [ADR 0011](0011-clean-architecture-auth.md) (rodada anterior) havia
  decidido explicitamente **manter** `SolIcon` para os ícones de marca,
  argumentando que eram "glifos hi-fi específicos da marca, sem equivalente
  1:1 no lucide" e que trocar seria *redesign*, fora do escopo de uma
  refatoração estrutural.

## Decisão

Todas as decisões abaixo foram grilled com o usuário via `AskUserQuestion`
(4 perguntas).

### 1. Reverter a Decisão 2 do ADR 0011: `SolIcon` sai por completo, inclusive dos ícones de marca

Decisão explícita do usuário nesta rodada: a migração de ícone é completa,
não parcial. `SolIcon`/`IconName` são removidos do código-fonte por inteiro
— inclusive dos 6 ícones de navegação e do logo (que o ADR 0011 havia
poupado). A prop `icon` de `SBtn`→`Button`/`SIconBtn`→`IconButton` também
muda de tipo, de `IconName` (string) para `LucideIcon` (componente),
fechando a única ponta que ainda dependia do ícone caseiro.

Mapeamento aplicado (só os nomes efetivamente usados no código; `search`/
`scan` nunca tiveram consumidor, mapeamento é só para referência futura):

| `IconName` | lucide-react | Onde |
|---|---|---|
| `sun` | `Sun` | logo (Sidebar, LoginPage) |
| `pdv` | `Barcode` | nav |
| `produtos` | `Package` | nav |
| `estoque` | `Boxes` | nav |
| `financeiro` | `CircleDollarSign` | nav |
| `relatorios` | `ChartColumn` | nav |
| `config` | `SlidersHorizontal` | nav |
| `trash` | `Trash2` | `ProductsPage`, `SaleItemsCard` (`icon=`) |
| `search` | `Search` | não usado — só documentado |
| `scan` | `ScanLine` | não usado — só documentado |

Diferente do ADR 0011 (que tratou os ícones de marca como *redesign* fora de
escopo), esta rodada trata a troca de glifo como consequência aceita da
migração — a aparência visual muda (traço lucide no lugar do SVG
hand-drawn), mas não há mudança de comportamento/estrutura de navegação.

### 2. As 16 primitivas de `sol.tsx` viram pastas MVVM em `presentation/components/`, com nomes melhorados

Decisão do usuário: não é só o ícone que sai de `src/components/` — o
arquivo inteiro migra, um componente por pasta, seguindo a mesma convenção
MVVM+barrel de todo componente global (`componentes-mvvm.md`). Nomes
renomeados para maior clareza (prefixo `S` solto, específico do design
system antigo, sai):

`SBtn`→`Button`, `SIconBtn`→`IconButton`, `SCard`→`Card`, `SModal`→`Modal`,
`STable`(+`STableProps`)→`Table`(+`TableProps`), `STag`→`Tag`,
`SChip`→`Chip`, `SStat`→`StatCard`, `SKbd`→`Kbd`, `SCheck`→`Checkbox`,
`SSeg`→`SegmentedControl` (mantém o generic `<T extends string>`),
`SToggle`→`Toggle`, `SBars`→`BarChart`, `SDre`→`DreLine`,
`SProgress`→`ProgressBar`. `ToastProvider`/`useToast` mantêm o nome (já
claros). As classes CSS (`s-btn`, `s-card`...) em `styles.css` não mudam —
não referenciam os nomes TS, só os literais `clsx('s-btn', ...)` internos.

### 3. ViewModel + View sempre separados, mesmo sem lógica nenhuma

Decisão do usuário: diferente do que `componentes-mvvm.md` permite
("componente puramente apresentacional... colapsa em um único arquivo"),
todo componente desta migração — as 16 primitivas + `Confirm` +
`CupomReceipt`/`Screen` (já existentes, soltos, também entram no escopo) —
ganha `{Nome}.tsx` (ViewModel) e `{Nome}.view.tsx` (View) separados, mesmo
quando o ViewModel é um passthrough fino. Prioriza consistência de pasta
entre os ~19 componentes acima do atalho de colapso para os mais triviais.
Só `Toast/` tem `.model.ts` de fato (o único com estado real).

`Confirm` merece nota à parte: o componente é construído via
`createCallable` (`react-call`), que injeta um `call` especial (não é uma
prop comum). O ViewModel (`Confirm.tsx`) adapta `call.end(true/false)` em
callbacks simples (`onConfirm`/`onCancel`) entregues à View — a View não
conhece `react-call`. `CupomReceipt` tinha uma adaptação real
(`buildCupom(sale, STORE)` — formatação pra exibição, ver critério "Vai
para o ViewModel se: é formatação para exibir" de `componentes-mvvm.md`);
`Screen` é passthrough puro.

### 4. Documentação: ADR 0012 (este documento) + atualização do glossário

Segue o padrão das rodadas anteriores. `componentes-mvvm.md` e
`arquiteture.md` também tiveram a menção a "`SolIcon` em migração" removida
(a migração terminou).

## Faseamento (mesmo espírito das ADRs 0006-0011 — verde a cada fatia)

1. **Ícones**: `SolIcon`→lucide nos 2 usos diretos + 2 via prop `icon=`;
   `Sidebar.constants.ts` (`NAV`) muda de `IconName` para `LucideIcon`.
   `sol.tsx` ainda existe neste ponto, mas `SBtn`/`SIconBtn` internos já
   passam a renderizar o componente lucide recebido via prop, não mais
   `SolIcon` — `SolIcon`/`IconName` ficam mortos dentro do próprio arquivo.
2. **Extração das 16 primitivas**: pastas MVVM criadas em
   `presentation/components/`; todos os ~74 arquivos consumidores
   atualizados (import + identificador renomeado) via script mecânico
   (busca por `import { ... } from '@/components/sol'`, mapeia cada
   especificador pro novo nome/pasta, reescreve em N imports por pasta,
   renomeia ocorrências no corpo do arquivo por regex de word-boundary).
   `sol.tsx` apagado.
3. **`Confirm`/`CupomReceipt`/`Screen`**: movidos para pastas MVVM próprias
   em `presentation/components/`. `CupomReceipt`/`Screen` não exigiram
   mudança nos imports dos consumidores (o path `@/presentation/components/
   {Nome}` já era usado, resolvendo agora pro `index.ts` da pasta em vez do
   arquivo solto). `main.tsx` e os 2 consumidores de `Confirm`
   (`ProductsPage.model.ts`, `SalePage.model.ts`) tiveram o import
   atualizado manualmente (o script da fase 2 só cobria `components/sol`).
4. **`apps/web/src/components/` apagada** — ficou vazia ao final da fase 3.
5. Este ADR + atualização do glossário e dos dois docs de convenção.

## Alternativas rejeitadas

- **Manter `SolIcon` nos ícones de marca (repetir a Decisão 2 do ADR
  0011)**: rejeitado pelo usuário nesta rodada — migração de ícone
  intencionalmente completa, não parcial.
- **Migrar só os usos diretos de `SolIcon`, deixar `SBtn`/`SIconBtn` com
  `icon: IconName`**: rejeitado — deixaria `IconName`/`SolIcon` vivos só
  para servir essas duas primitivas, sem fechar a pendência.
- **Deixar `sol.tsx` onde está, só tirar o ícone**: rejeitado pelo usuário
  — optou por migrar as 16 primitivas inteiras para `presentation/
  components/`, não só o ícone.
- **Colapsar os componentes puramente apresentacionais em arquivo único**
  (opção que `componentes-mvvm.md` permite): rejeitado pelo usuário — prior
  idade para consistência de pasta entre todos os ~19 componentes desta
  migração, mesmo à custa de alguns ViewModels serem passthrough puro.

## Consequências

- `apps/web/src/components/` deixou de existir. `sol.tsx` (432 linhas, 1
  arquivo) virou 16 pastas MVVM em `presentation/components/` (64 arquivos:
  4 por componente, exceto `Toast/` com 5 por ter `.model.ts`).
  `confirm.tsx` virou `presentation/components/Confirm/` (4 arquivos).
  `CupomReceipt.tsx`/`Screen.tsx` (soltos) viraram pastas próprias (4
  arquivos cada).
- `SolIcon`/`IconName` removidos por completo — zero ocorrências no
  código-fonte (só citados nos ADRs 0011/0012 e nos dois docs de convenção,
  como histórico).
- `Sidebar.constants.ts` (`NAV`) e a prop `icon` de `Button`/`IconButton`
  agora tipam por `LucideIcon` em vez de union de string.
- Typecheck (`tsc --noEmit`) limpo em `apps/web` ao final de cada fase.
  Suíte `apps/web` (vitest, `data/handlers`): 58/58 verdes, sem regressão —
  esperado, já que nenhum teste toca `presentation/components/`.
- Verificado no browser (dev server + preview): tela de login (logo +
  botão), sidebar (6 ícones de nav + logo), um modal, uma tabela, um toast
  e o fluxo de confirmação de exclusão de produto — todos renderizando e
  funcionando com os componentes novos.
