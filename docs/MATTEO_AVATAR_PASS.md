# Matteo — primeiro personagem próprio

## Escopo e direção

Branch: `codex/matteo-avatar`.

Primeiro milestone da nova direção: substituir o visitante KayKit por uma
interpretação 3D de Matteo e validar a integração. A roupa de referência é a
camiseta clara, calça escura solta e tênis claros. Cabelo cacheado escuro,
proporções humanas simplificadas, materiais foscos e acessórios discretos.
Não incluir useART. Não redesenhar outras regiões neste milestone.

O conceito aprovado estabelece identidade e direção. Este modelo é a primeira
versão jogável; o rosto, a escultura dos cachos, as mãos e a naturalidade da
locomoção ainda devem passar pelo julgamento visual do usuário. Não é correto
tratá-lo como uma conversão fiel da imagem gerada ou como arte final aprovada.

## Produção

- `scripts/build-matteo-avatar.py`: geração reproduzível, rig, clips, exportação e renders.
- `assets/characters/matteo-v1.blend`: fonte editável sem cenário de render.
- `public/assets/characters/matteo-v1.glb`: asset servido pelo site.
- `src/world/player/avatar-animation.ts`: seleção de pose a partir da física.
- `src/world/player/AnimatedVisitor.tsx`: reprodução e transições entre clips.
- `src/world/player/VisitorAvatar.tsx`: fallback provisório preservado sem mochila.
- `scripts/avatar-animation.test.mjs`: contrato do GLB e prioridade das poses.
- `public/assets/SOURCES.md`: registro da origem e preservação do asset antigo.

Outros arquivos alterados na integração:

- `.gitignore`: intermediários e backup Blender fora do versionamento.
- `package.json`: comando `test:avatar`, sem novas dependências.
- `src/world/regions/field/field-view.ts`: enquadramento externo do novo corpo.
- `src/world/interactions/interaction-types.ts`: assento opcional para uso sentado.
- `src/world/interactions/InteractionSystem.tsx`: ida ao assento e retorno seguro.
- `src/world/regions/house/house-layout.ts`: ponto físico do assento do computador.
- `src/world/regions/house/house-interaction-targets.ts`: ligação ao assento.
- `docs/MATTEO_AVATAR_PASS.md`: este registro.

Ferramenta usada: Blender 5.1 já instalado (`blender51`). O `/usr/bin/blender`
4.0 estava sem NumPy e não conseguia exportar GLB. Nenhuma instalação foi feita.

Reproduzir na raiz do projeto:

```sh
blender51 -b --factory-startup --threads 4 --python scripts/build-matteo-avatar.py
```

Renders intermediários ficam em `work/avatar-review`, fora do versionamento.
As fotografias do usuário não são copiadas nem incorporadas ao asset.

## Integração

O modelo tem escala métrica, pés na origem e orientação +Z no GLB. O grupo de
apresentação aplica apenas o alinhamento à cápsula já existente. Não modifica
velocidades, colisores, gravidade ou input. Walk e run têm clips distintos;
jump é uma pose estática mantida durante o estado airborne, inclusive dash-hop.
Não há IK dos pés, rig facial ou dedos articulados nesta versão.

A composição externa foi aproximada moderadamente e o FOV passou de 60° a 52°
para que o corpo com proporções humanas permaneça legível. Orbit, obstruction
handling e câmera interna continuam com o funcionamento anterior.

Ao testar o computador, foi encontrada uma inconsistência anterior: a pose
sentada era aplicada no ponto de aproximação, diante da cadeira. Foi adicionado
um `seatPoint` opcional à ação `use`, reaproveitando a passagem de posição do
sistema existente. O computador posiciona no assento e devolve ao ponto seguro
de aproximação ao sair. Banco e usos não sentados mantêm seus próprios fluxos.

## Validação

Comandos aprovados:

```sh
npm run test:camera      # 6 testes
npm run test:movement    # 3 testes
npm run test:avatar      # 4 testes
npm run typecheck
npm run build
git diff --check
```

O contrato do asset verifica clips obrigatórios, 16 ossos, malha única, ausência
de fotos/texturas e de deslocamento horizontal da raiz. Essa verificação encontrou
e permitiu corrigir um erro de eixo do bone root durante a produção. Métricas do
GLB final: 1.071.176 bytes, 29.242 triângulos e 11 materiais, sem novos loaders.
Uma inspeção adicional com GLTFLoader/AnimationMixer confirmou limites verticais
finitos nos cinco clips: altura em repouso de aproximadamente 1,80 m e pés da
pose sentada aproximadamente 3,7 cm acima do plano local do chão.

No navegador local em `http://127.0.0.1:3100` foram verificados renderização,
caminhada até a casa, corrida, salto, dash-hop, entrada no quarto, aproximação ao
computador, abertura dos projetos, sentar/levantar do banco e retorno ao quarto no ponto livre
`[4.25, 0.86, -2.35]`. Não foram observados erros JavaScript; permanece um aviso
de inicialização de dependência já presente na inspeção anterior. A pose sentada
foi ajustada após revisão do contato entre roupa e assento.

Enquadramentos inspecionados: desktop padrão do navegador e 390×844. A verificação
mobile foi visual em viewport emulado; não valida gestos em um dispositivo físico.
A casa ainda fica parcialmente cortada no panorama inicial estreito. Composição
mobile, escala do mobiliário e integração artística do ambiente ficam para o
milestone da chegada/casa, não são declarados resolvidos neste passe.

Revisão React: animação por refs/useFrame, sem publicar estado React por frame;
GLB clonado com SkeletonUtils; geometria e materiais compartilhados preservados;
mixer e skeleton liberados no cleanup; fallback e boundary continuam presentes.

Sem script de lint configurado no projeto. Sem push, deploy ou mudanças nas
dependências. O antigo avatar e as respectivas licenças foram preservados.

Evidências para revisão do usuário foram copiadas para
`/home/matteo/Documents/Codex/2026-10-07/es/outputs/matteo-avatar/`.

## Continuidade — revisão v2

O feedback de proporção e identidade gerou uma segunda revisão, registrada em
`MATTEO_POLISH_V2.md`. O asset ativo passou a ser `matteo-v2.glb`; a v1 permanece
como histórico. Cabelo ondulado, pele mais clara, mapa/quarto compactados, pose
sentada recalibrada e primeiro passe de cenário substituem os parâmetros acima.
