# MILESTONE B — Gameplay e narrativa ambiental

## Intenção

Dar ao quarto três interações legíveis e opcionais sem transformar o espaço em uma coleção de prompts. O visitante pode descansar no banco, examinar referências de estudo e consultar a estante; o computador continua sendo o único alvo que abre o Desktop.

## Alvos e coordenadas

| ID | Ação | Ponto de interação | Rotação | Destino local |
| --- | --- | --- | --- | --- |
| `HOUSE_ENTRY_BENCH` | `sit` — “Sentar no banco” | `[-3.8, 0.86, 2.4]` | `Math.PI` | assento `[-3.8, 0.86, 3.55]`, rotação `0` |
| `HOUSE_REFERENCE_BOARD` | `use` — “Examinar mural” | `[0, 0.86, -4.4]` | `0` | permanece no ponto, voltado para o mural |
| `HOUSE_BOOKSHELF` | `use` — “Examinar estante” | `[5.95, 0.86, -1]` | `-Math.PI / 2` | permanece no ponto, voltado para a estante |

O banco usa a extremidade direita livre. O ponto frontal fica no corredor interno, sem bloquear a porta; o assento evita a mochila e os calçados. Mural e estante têm pontos acessíveis, separados do computador e entre si. Todos os três pontos aparecem como marcadores de desenvolvimento quando o F2 está ativo.

## Fluxo de estado

### Sentar

1. `idle` encontra o alvo e recebe a interação.
2. `approaching` leva o player ao ponto frontal e alinha sua rotação.
3. `aligned` trava entrada/física, envia uma única `transitionRequest` ao `seatPoint` e aguarda seu consumo.
4. `sitting` mantém posição e `seatRotationY`, com o prompt “Voltar a explorar”.
5. Ao sair, `exiting` envia uma única solicitação de retorno ao `interactionPoint`.
6. Depois do consumo, `idle` libera física e movimento.

Essa transição é local: não chama transição de região, não mostra flash e não força ressincronização da câmera.

### Inspecionar

1. Mural e estante reutilizam `use` e entram em `using` depois da aproximação.
2. `WorldPresentation` identifica o alvo ativo e mostra um cartão compacto de papel sobre o mundo 3D.
3. `E`, `Esc` ou “Voltar” retornam a `exiting` e então a `idle`.
4. Apenas `HOUSE_COMPUTER` ativa o Desktop; o cartão nunca aparece por cima dele.

## Detalhes visuais

- mesa: descanso de copo tramado e pequeno pen drive;
- quarto: relógio de parede com ponteiros e bilhete adicional preso ao mural;
- entrada externa: capacho tramado, vaso de barro com folhagem e lanterna âmbar sob o toldo.

Todos usam primitivas e materiais já existentes. Nenhum detalhe novo adiciona collider ou ocupa o caminho principal.

## Critérios de aceite

- O banco reposiciona o player no assento antes de assumir `sitting`.
- Sair do banco devolve o player ao ponto frontal e reativa movimento sem jitter.
- Sentar não aciona overlay, flash ou troca de região.
- Mural e estante têm prompts distintos, pontos alcançáveis e cartões factuais.
- O quarto permanece visível atrás do cartão; o layout cabe em telas móveis.
- O computador preserva seu fluxo atual e segue sendo o único alvo com Desktop.
- F2 mostra os três novos pontos de interação.
- Caminhos e colliders permanecem inalterados.
- `npm run test:camera`, `npm run typecheck`, `npm run build` e `git diff --check` passam antes do commit.

## Ideias para próximos milestones — não implementar agora

- obstrução de câmera com teste de linha e recuo suave em paredes/móveis;
- paisagem sonora curta por região e feedback discreto de interação;
- movimento ambiente mínimo em folhas, luz do monitor e pequenos objetos, respeitando `prefers-reduced-motion`.
