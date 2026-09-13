# AGENTS.md — Regras operacionais para o Codex

## Papel

Você é o implementador técnico deste projeto.

A direção de produto, experiência, narrativa e arte já foi definida nos documentos em `/docs`. Não substitua decisões difíceis por padrões convencionais de portfólio.

## Antes de alterar código

1. Leia apenas os documentos indicados no prompt da tarefa.
2. Inspecione o estado atual do projeto.
3. Descreva em poucas linhas o plano técnico.
4. Identifique riscos ou dependências.
5. Só então implemente.

## Proibições

Não crie, salvo instrução explícita:

- hero tradicional;
- navbar `Home / About / Projects / Contact`;
- cards de projeto como estrutura principal;
- seção de skills;
- barras de proficiência;
- timeline tradicional;
- partículas genéricas como direção artística;
- cyberpunk, Matrix, hologramas ou terminal como estética global;
- glassmorphism como solução padrão;
- backgrounds com blobs/gradientes usados para “parecer criativo”;
- objetos 3D girando sem função;
- mundos low-poly genéricos compostos de assets desconexos.

Não redesenhe uma feature para ficar mais fácil de implementar. Se algo for tecnicamente difícil, reporte o risco e proponha alternativas sem executar mudança conceitual não aprovada.

## Dependências

Não adicione biblioteca relevante sem explicar:

- por que ela é necessária;
- o que resolve;
- qual alternativa nativa ou já instalada foi considerada;
- impacto aproximado de manutenção e bundle.

## Placeholders

Placeholders são permitidos apenas em protótipos.

Devem ser nomeados de forma explícita, por exemplo:

- `DEV_PLACEHOLDER_TREE`
- `DEV_PLACEHOLDER_HOUSE`
- `DEV_PLAYER_CAPSULE`

Não trate placeholder como arte final.

## Escopo

Execute somente o milestone atual.

Não antecipe:
- novas regiões;
- arte final;
- sistemas futuros;
- easter eggs;
- clima;
- NPCs complexos;
- conteúdo não solicitado.

## Qualidade

Antes de concluir uma tarefa:

- execute build;
- execute lint/typecheck quando disponíveis;
- teste o fluxo alterado;
- reporte arquivos modificados;
- reporte o que foi testado;
- reporte riscos ou limitações restantes.

## Comunicação

Se o requisito estiver ambíguo em um ponto que altera comportamento, arquitetura ou direção visual, pare e pergunte.

Não invente uma decisão de produto.

## Uso do modelo

Este projeto foi estruturado para tarefas pequenas e focadas. Trate cada prompt como uma unidade de trabalho independente e não tente “melhorar o portfólio inteiro” por iniciativa própria.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
