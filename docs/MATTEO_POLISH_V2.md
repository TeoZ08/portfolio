# Revisão visual v2 — avatar, proporção e chegada

Pedido: dar presença ao personagem, corrigir cabelo excessivamente cacheado e pele,
melhorar seu modelo no Blender, compactar o mapa e começar o cenário.

## Resultado implementado

- Avatar v2 produzido no Blender 5.1 existente: pele mais clara, cabelo de mechas
  largas onduladas, transições de rosto e mangas suavizadas, mãos unidas e relevo
  discreto no tecido. Fonte editável e GLB preservam rig e cinco clips.
- Câmera externa mais próxima: offset 4.4/2.7/5.6, FOV 48°, zoom entre 5.8 e 12.
  O corpo continua com cerca de 1.81 m; não foi aumentado junto à cápsula.
- Campo e quarto em escala uniforme de 0.72: distâncias e arquitetura 28% menores.
  Caminhos, vegetação, terreno e colisores herdam a mesma transformação. Pontos de
  interação convertem X/Z e conservam a altura da cápsula. Não muda velocidade,
  gravidade, saltos ou entrada do controle.
- Pose sentada recalibrada para assentos de aproximadamente 0.53–0.56 m. Quadril
  em 0.64 m e joelhos ajustados; pés acima do piso no GLB exportado.
- Cenário iniciado na chegada/casa: jardim frontal de pedra com entrada aberta,
  pedras de passagem, varanda mais larga apoiada em postes, nova cerca próxima,
  paleta de verdes mais sóbria e luz/neblina revistas. Montanhas do Songahm usam
  massa irregular e pinheiros com copas achatadas, substituindo cones regulares.
- useART continua fora do escopo. Nenhuma região nova ou conteúdo pessoal inventado.

O modelo continua estilizado. Este passe não entrega escultura facial realista,
IK dos pés, dedos articulados ou naturalidade de animação de produção cinematográfica.
O conceito visual aprovado ainda é a referência de acabamento; a v2 não é uma
reprodução fiel dele. O passe do cenário é uma primeira intervenção na composição,
não uma conclusão de todas as regiões.

## Arquivos desta revisão

- `scripts/build-matteo-avatar.py`
- `assets/characters/matteo-v2.blend`
- `public/assets/characters/matteo-v2.glb`
- `public/assets/SOURCES.md`
- `scripts/avatar-animation.test.mjs`
- `src/world/player/AnimatedVisitor.tsx`
- `src/world/player/VisitorAvatar.tsx`
- `src/world/camera/camera-presets.ts`
- `src/world/regions/world-scale.ts`
- `src/world/regions/FieldRegion.tsx`
- `src/world/regions/HouseRegion.tsx`
- `src/world/regions/field/FieldGarden.tsx`
- `src/world/regions/field/FieldArrivalDetails.tsx`
- `src/world/regions/field/FieldEnvironment.tsx`
- `src/world/regions/field/FieldHouse.tsx`
- `src/world/regions/field/field-interaction-targets.ts`
- `src/world/regions/field/field-palette.ts`
- `src/world/regions/field/field-view.ts`
- `src/world/regions/house/HouseInterior.tsx`
- `src/world/regions/house/house-layout.ts`
- `src/world/regions/house/house-interaction-targets.ts`
- `src/world/regions/dojo/SongahmScenery.tsx`
- `docs/MATTEO_AVATAR_PASS.md` (nota de continuidade)
- `docs/MATTEO_POLISH_V2.md` (este registro)

A branch local `codex/matteo-avatar` já continha o passe anterior sem commit;
as alterações anteriores foram preservadas, incluindo a correção de usar/sair
sentado no computador. Avatar v1 e visitante KayKit preservados.

## Comandos e validação

```sh
blender51 -b --factory-startup --threads 4 --python scripts/build-matteo-avatar.py
npm run test:avatar
npm run test:camera
npm run test:movement
npm run typecheck
npm run build
git diff --check
node work/check-avatar.mjs
```

As últimas execuções passaram: cinco testes do avatar, seis de câmera e três de
movimento. O teste novo amostra a malha deformada de todos os clips e rejeita pés
abaixo do piso e coordenadas não finitas. Amostragem de 12 instantes por clip:
menor altura entre 0.0035 e 0.0085 m; maior altura abaixo de 1.87 m.
Não existe comando de lint neste pacote. Nenhuma dependência instalada.

Verificação no navegador local: caminhada no terreno escalado, chegada e entrada
na casa, aproximação/uso/retorno do computador, sentar/levantar do banco e saída.
Enquadramento desktop e 390×844. Console sem erros; permanece o aviso anterior
de inicialização depreciada da biblioteca de física.
Evidências da pose sentada e retorno ficam nas capturas desta revisão.
O teste no viewport estreito verifica apresentação, não reproduz um aparelho físico.

## Continuidade recomendada

Julgar a identidade do avatar pela captura próxima e pela versão em movimento.
O próximo trabalho de arte deve concentrar rosto, cabelo e naturalidade da pose,
e então dar função visual aos espaços restantes a partir dos projetos existentes.
Manter o cenário compacto e validar cada região no jogo antes de expandir o mapa.
