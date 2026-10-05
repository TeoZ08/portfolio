# Camera polish — milestone atual

## Problemas observados

- O `CameraRig` original só orbitava enquanto um botão estava pressionado; gestos de dois dedos no trackpad chegam como `WheelEvent` e eram ignorados.
- O raio era fixo, sem zoom/dolly amortecido e sem limites distintos para campo e interior.
- Menus/desktop bloqueavam player e interações, mas o rig não congelava explicitamente a própria acomodação; movimento reduzido também não chegava ao look-ahead/câmera.
- Os colliders Rapier existentes servem ao player, mas ainda não há contrato testado para consulta de obstrução pela câmera.

## Plano

- Separar intenção de entrada de aplicação da câmera com helpers puros e configuração explícita.
- Manter a câmera orbital amortecida nos presets exterior e interior, com limites de raio próprios.
- Preservar o movimento do personagem relativo à orientação visível da câmera e o fluxo campo → casa → computador → desktop.
- Expor recentralização discreta apenas para ponteiros finos; manter os controles de movimento touch intactos.

## Mapeamento de entrada

| Entrada | Resultado |
| --- | --- |
| Arrastar com botão esquerdo ou direito | Orbitar |
| Dois dedos no trackpad | Orbitar sem clique |
| Roda física do mouse | Aproximar/afastar |
| `Ctrl` + roda ou pinça | Aproximar/afastar |
| `C` ou botão “Câmera” | Voltar suavemente à orientação e ao raio do preset |

Como a Web Platform não identifica o hardware do `wheel`, a distinção é conservadora: pinça/`Ctrl` e deltas em linha/página são zoom; deltas em pixels com eixo horizontal, granularidade fina ou baixa magnitude são tratados como trackpad.

## Critérios de aceite

- Drag esquerdo/direito, órbita por trackpad, zoom e recentralização funcionam sem saltos e respeitam pitch, yaw e raio do preset ativo.
- Exterior e interior permanecem em enquadramentos confortáveis e usam limites de zoom diferentes.
- Nenhuma entrada de câmera é aplicada durante menu/computador ou quando teclado/ponteiro está sobre UI interativa/formulário.
- Movimento do jogador continua relativo à câmera; campo, casa, computador e desktop continuam acessíveis.
- Preferência de movimento reduzido remove o look-ahead e encurta a acomodação, sem introduzir movimento adicional.
- Controles touch não são capturados pela câmera e a ajuda de câmera não aparece em ponteiros coarse.
- `npm run typecheck`, `npm run build` e `git diff --check` passam.

## Depois deste milestone

Colisão de câmera fica fora deste patch. O próximo passo deve testar um cast do pivô até a posição desejada contra uma camada explícita de geometria sólida, aplicar margem perto da superfície e amortecer apenas a recuperação do raio. Antes de integrar, validar cantos, portas, teto do interior, transições de região e ausência de jitter; não usar toda a cena como collider implicitamente.

Ideias posteriores de gameplay e storytelling ambiental: presets contextuais authored para banco, janela e computador; vento afetando vegetação, papéis e cortinas; alteração discreta da luz após o retorno do computador; e enquadramentos que revelem casa, árvore e caminhos conforme a exploração, sem HUD permanente ou regiões novas neste milestone.
