# Personagem low poly e céu — rodada de revisão

## Resultado

- A apresentação começa às 9h, com sol visível, céu azul em gradiente, nuvens com volume e sombras direcionais mais definidas. Manhã, fim de tarde e anoitecer continuam disponíveis no ateliê.
- Vegetação com verdes mais vivos e névoa mais distante. O sol decorativo duplicado foi removido; pinheiros nas rochas tiveram as raízes ajustadas ao terreno.
- Personagem v5 construído no Blender com rosto autoral facetado, cabelo escuro em mechas onduladas, pele mais clara, camiseta ampla, calça escura, tênis claros, corrente e pulseira. As fotos orientam a aparência; a referência orienta os planos low poly. É uma interpretação estilizada, não uma reconstrução fotográfica.
- Câmera de treino frontal permite ler o rosto e o corpo. No celular, o painel de treino ocupa a parte inferior sem cobrir o rosto.
- Rig de 16 ossos e seis animações preservados. GLB de 1.718.952 bytes, menor que o v4 de 1.893.704 bytes. Fontes v4 preservadas.

## Arquivos

- `scripts/build-matteo-lowpoly.py`: gerador reproduzível e renders de revisão.
- `assets/characters/matteo-v5.blend`, `public/assets/characters/matteo-v5.glb`: fonte editável e modelo servido.
- `src/world/player/AnimatedVisitor.tsx`: integração v5.
- `src/world/regions/field/FieldEnvironment.tsx`, `FieldClouds.tsx`, `field-daylight.ts`, `field-palette.ts`, `field-view.ts`: céu, nuvens, luz, cores e câmeras.
- `src/systems/world-state.ts`: manhã inicial.
- `src/world/regions/dojo/SongahmScenery.tsx`: sol único e pinheiros apoiados.
- `src/app/globals.css`: painel móvel de treino.
- `scripts/avatar-animation.test.mjs`, `public/assets/SOURCES.md`: validação do novo asset e procedência.

## Validação

Executados: `blender51 -b --python scripts/build-matteo-lowpoly.py`, `npm run typecheck`, `npm run build`, `npm run test:camera`, `npm run test:movement`, `npm run test:avatar`, `npm run test:study`, `git diff --check`.

Build e typecheck passaram. Os 17 testes passaram; os cinco testes de avatar foram repetidos após a última exportação. Verificam clips, rig, ausência de deslocamento horizontal na raiz, geometria finita e pés acima do piso durante as amostras.

Revisão visual: frente, retrato, perfil, costas e poses no Blender; chegada e treino no navegador; troca manhã/tarde/noite; viewports 390×844 e 320×568. Console sem erros na revisão final. Não existe script de lint neste projeto. Mobile validado por viewport, sem teste em aparelho físico. Não foi realizada publicação.

## Evidências e próxima revisão

As capturas e os nove renders, além de cópias do `.blend` e `.glb`, estão em `/home/matteo/Documents/Codex/2026-10-07/es/outputs/lowpoly-pass`.

Preview local: http://127.0.0.1:3101/ . Próxima revisão recomendada: avaliar pessoalmente a semelhança do rosto e a sensação da manhã, antes de expandir a direção para outras áreas.
