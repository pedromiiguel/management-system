# Assets estáticos

Servidos por Vite na raiz (`/`). O que estiver aqui é copiado tal qual para o build.

## `logo.png` — pendente

O emblema circular da marca (Costas's Espetos) é usado pela tela de login em
`presentation/flows/login/components/LoginBrandPanel/`, via `/logo.png`.

**O arquivo ainda não está no repo.** Ele vive no projeto de design
(`Sistema Distribuidora Sol - Hi-Fi.html` → `hifi/logo.png`, 944×1120) e não é
baixável pelo MCP `claude_design`: o `get_file` corta em 256 KiB e o arquivo é
maior, voltando `truncated: true`. Baixe pelo claude.ai/design e salve aqui como
`logo.png`. Até lá o login renderiza o `alt` no lugar da imagem.

O emblema é usado só a 196px, no login — na sidebar a marca é lockup
tipográfico, porque a 92px o arco de texto do emblema fica ilegível.
Ver Decisão 5 do [ADR 0013](../../../docs/adr/0013-rebrand-costas-espetos.md).
