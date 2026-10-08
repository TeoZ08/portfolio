# Entrega local — portfólio de Matteo

Revisão concluída em 08/10/2026. Projeto: `/home/matteo/ProjetosPessoais/MeuSiteFInal`.
Prévia de produção: http://127.0.0.1:3101/ — desenvolvimento: http://127.0.0.1:3100/.
A prévia local depende do processo Next em execução. Para reiniciar: `npm run build` e `npm run start -- --port 3101`.

## Resultado

O mundo compacto mantém a escala humana do personagem e oferece sete destinos com ações próprias. A exploração pode ser feita a pé ou pelo mapa. A chegada explica os controles e oferece acesso direto aos arquivos. Não é necessário completar tarefas para ver os projetos.

| Ambiente | Interação entregue | Evidência |
| --- | --- | --- |
| Casa | Entrar/sair, computador com arquivos, mural, estante e banco | Fluxos exercitados no navegador; `banco-quarto.png`, `mural-quarto.png` |
| Ateliê | Escolher manhã, tarde e anoitecer, alterando céu, luz e atmosfera | `atelie-anoitecer.png` |
| Pátio de estudos | Busca local em trechos atribuídos do Jarvis | `estudos.png`; testes de ausência de evidência e ordenação |
| Jardim comunitário | Oficina curta sobre conferir uma mensagem suspeita; acesso ao Portal UnAPI | `comunidade-mobile.png` |
| Dojang | Prática animada com câmera que mantém o corpo visível | `dojang.png`; movimento livre, sem alegar uma forma oficial Songahm |
| Bosque | Três notas do sino de vento, movimento do objeto e banco | `bosque.png`, `banco-bosque.png`; sino e banco exercitados no navegador |
| Mirante | Sentar e contemplar o caminho, com câmera própria | `mirante.png` |

O avatar v4 tem cabeça anatômica estilizada, cabelo com mechas onduladas, pele mais clara, roupa casual e seis animações. É uma interpretação das referências, não um retrato fotográfico. O `.blend` editável está nesta pasta e em `assets/characters/`; o GLB integrado tem aproximadamente 1,9 MB. As versões anteriores foram preservadas. A cabeça usa uma adaptação de dados MakeHuman CC0, com origem e licença registradas em `assets/characters/source/` e `public/assets/SOURCES.md`.

Luz de fim de tarde, opção de anoitecer, vegetação, montanhas, materiais foscos, pequenas luzes e sons opcionais compõem a ambientação. O áudio inicia por ação deliberada; movimento reduzido e renderização leve ficam disponíveis no menu e persistem entre visitas. Sons permanecem desligados no início de uma nova sessão.

## Conteúdo

Portal UnAPI: https://pet-sistemas.github.io/unapi-oficinas/ — endereço confirmado por Matteo. O contexto foi conferido nas fontes públicas e no repositório TeoZ08/homeUnapi. Jarvis e o próprio portfólio permanecem entre os projetos. useART não foi incluída, conforme orientação. Perfil atualizado com as informações fornecidas, sem métricas ou currículo inventados.

## Arquivos alterados nesta entrega

- Conteúdo: `src/content/portfolio.ts`, `src/content/study-search.ts`, `src/app/perfil/page.tsx`.
- Apresentação: `src/ui/{Arrival,PauseMenu,PlaceExperience,WorldAvailability,WorldMap,WorldPresentation}.tsx`, `src/ui/experience.css`, `src/app/globals.css`, `src/app/page.tsx`.
- Estado e som: `src/systems/{experience-state,world-state,ambient-audio}.ts`.
- Mundo: regiões e objetos em `src/world/regions/`, incluindo `field/{FieldAtmosphere,FieldEnvironment,FieldMeshes,field-interaction-targets,field-view,world-destinations}` e `forest/WindChime.tsx`.
- Navegação e personagem: `src/world/interactions/InteractionSystem.tsx`, câmera, `src/world/WorldCanvas.tsx`, `src/world/player/{AnimatedVisitor,player-control,avatar-animation}`.
- Ativos e verificações: `scripts/build-matteo-avatar.py`, testes de avatar e busca, `package.json`, `.interface-design/system.md`, ativos v3/v4 e atribuições.

A árvore já continha alterações antes desta rodada. Elas foram preservadas; o snapshot inicial está em `work/final-pass/baseline.patch`. Nenhum push, deploy ou nova dependência foi necessário.

## Validação

- `npm run typecheck`: passou.
- `npm run build`: passou, com as rotas estáticas e três estudos de caso.
- `npm run test:camera`: 6 testes passaram.
- `npm run test:movement`: 3 testes passaram.
- `npm run test:avatar`: 5 testes passaram, incluindo rig, clips, peso do GLB, posições finitas e pés acima do chão.
- `npm run test:study`: 3 testes passaram, incluindo citações originais e perguntas sem evidência.
- `git diff --check`: passou.
- Blender 5.1.1: geração e revisão de frente, costas, perfil e poses do avatar.
- Navegador de produção: chegada, mapa, destinos, interação de cada ambiente, computador, banco, mural, estante, sair da casa, acesso direto e leitura UnAPI, perfil, preferências e persistência.
- Responsividade: 390×844 e 320×568, sem largura excedente; ajuste da câmera do jardim, painel com rolagem e fechamento acessível, alvos de movimento de 48 px.
- Console da prévia de produção: nenhum erro nas últimas verificações dos fluxos.

## Limites da verificação

Não há script de lint configurado. Não foi feita medição de desempenho em aparelhos físicos, teste auditivo por uma pessoa, teste completo com leitor de tela ou injeção de falha WebGL. A recuperação de erro tem links diretos e foi verificada por código/typecheck; as páginas independentes foram abertas no navegador. Todos os assentos foram exercitados no navegador. A busca do caderno é extrativa e local; não executa o backend do Jarvis.

## Uso e próximos passos

A entrega está pronta para revisão local. Abra a prévia de produção e compare a identidade do personagem com suas referências. Antes de uma publicação, faça uma visita no seu celular físico, escute o som no volume habitual e confirme sua preferência pela estilização do rosto. Publicação e domínio não foram solicitados nesta etapa.
