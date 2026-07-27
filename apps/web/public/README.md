# Assets estáticos

Servidos por Vite na raiz (`/`). O que estiver aqui é copiado tal qual para o build.

## `logo.png`

Emblema circular completo da marca (Costa's Espetos), 944×1120. Usado pelo
painel de marca do login (`presentation/flows/login/components/
LoginBrandPanel/`, via `/logo.png`), a 196px — o único tamanho em que o
arco de texto da ilustração é legível.

Upload manual do usuário — o MCP `claude_design` não baixa arquivos acima
de 256 KiB (`get_file` retorna `truncated: true` para este arquivo, que
tem ~2,2 MB).

## `logo-mark.png`

Recorte de `logo.png` (só a grelha com os espetinhos, 460×270, sem
chroma-key — a região cortada não toca o fundo preto opaco do canvas
original). Usado pela sidebar (`AppShell/components/Sidebar/`, via
`/logo-mark.png`) a 28px, ao lado do lockup tipográfico "Costa's /
ESPETOS" — o emblema inteiro não é legível nesse tamanho.

Ver Decisão 5 do [ADR 0013](../../../docs/adr/0013-rebrand-costas-espetos.md).
