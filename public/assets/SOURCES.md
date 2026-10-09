# Acervo selecionado — passe de exploração

Arquivos fornecidos pelo usuário. Os ZIP/RAR/7z originais permanecem fora do
projeto. Este registro distingue assets usados, reservas e licenças encontradas;
a declaração de uso pessoal não é tratada como substituta de uma licença.

## Usados no mundo

### Avatar ativo nesta feature — Matteo chibi V3

`characters/matteo-chibi-v3.glb` é uma cópia byte a byte da fonte aprovada
`work/avatar-chibi-v3/matteo-chibi-v3.glb`, preservada no projeto principal.
Base **Chibi Model Base**, Magicless, [BlendSwap #82527](https://www.blendswap.com/blend/82527),
**CC0 1.0**. Registro da licença: `characters/Matteo-Chibi-CC0-LICENSE.html`.
Rosto, cabelo A e roupas derivados da v2 aprovada; rig/animações da META 03.
24 ossos, 7.114 triângulos e seis clips: `idle`, `walk`, `run`, `jump`,
`seated-pose`, `practice`. Sem fotografias ou texturas externas incorporadas.
Escala uniforme de runtime 1,12; nenhum GLB/blend de origem foi modificado.
Os arquivos Matteo anteriores permanecem preservados como histórico; os
registros abaixo descrevem as seleções anteriores, não o avatar ativo da feature.


### Histórico: Avatar Matteo v2 — modelo original

O avatar daquela revisão era `characters/matteo-v2.glb`, criado pelo script
`scripts/build-matteo-avatar.py`, com fonte editável em
`assets/characters/matteo-v2.blend`. A direção foi aprovada pelo usuário a partir
de um estudo visual baseado nas próprias fotografias. As fotos não são copiadas
para o repositório, incorporadas ao GLB ou requisitadas pelo navegador.

Modelo em metros, materiais foscos sem texturas, malha única com 11 grupos de
material e esqueleto original de 16 ossos. Clips: `idle`, `walk`, `run`, `jump`
(pose mantida no ar) e `seated-pose` (pose estática). Os clips não deslocam a raiz
horizontalmente: posição, orientação e colisões continuam pertencendo ao Rapier.
A revisão v2 ajusta cabelo ondulado, pele, roupa e pose sentada.
A v1 foi preservada como referência da revisão. O modelo é uma interpretação jogável, não uma reprodução final do
concept art aprovado. Não utiliza malha nem animações KayKit.

O antigo `characters/visitor.glb` e suas licenças permanecem preservados como
reserva; o avatar ativo não carrega esse arquivo. A tabela abaixo registra a
seleção original e os demais assets ainda utilizados.

| Origem | Seleção | Destino | Licença incluída |
| --- | --- | --- | --- |
| KayKit_Adventurers_2.0_FREE.zip | Ranger, sem aljava | `characters/visitor.glb` | CC0; `characters/KayKit-Adventurers-LICENSE.txt` |
| KayKit_Character_Animations_1.1.zip | Rig_Medium Idle_A, Walking_A; Sit_Chair_Idle amostrado como pose estática | Mesmo GLB | CC0; `characters/KayKit-Animations-LICENSE.txt` |
| Stylized Nature MegaKit[Standard].zip, Quaternius | Fern_1, Bush_Common, Mushroom_Common, Rock_Medium_1, DeadTree_1 | `nature/` | CC0; `nature/LICENSE.txt` |
| Companion-bot.zip | OBJ e paleta convertidos para GLB | `machines/companion.glb` | Nenhuma licença encontrada no pacote fornecido |
| MobileStorageBot.zip | OBJ e paleta convertidos para GLB | `machines/storage.glb` | Nenhuma licença encontrada no pacote fornecido |

O visitante tem 1,77 m visuais, com os pés ancorados à cápsula existente. Os clips
de osso são mapeados por nome; animações não movem a raiz física. GLB selecionado:
cerca de 554 KiB. O rig original e o controller Rapier não são substituídos.

Natureza: texturas limitadas a 512 px, roughness alta, cores integradas à paleta.
Samambaias, arbustos, pedras e cogumelos são instanciados; não possuem novos
colliders. As duas máquinas são estáticas, sem emissão, animação ou interação.
São detalhes da clareira opcional do Bosque, fora do caminho principal.

## Usados somente no menu de pausa

| Origem | Seleção | Destino | Licença incluída |
| --- | --- | --- | --- |
| Humble Gift - Paper UI System.zip, HumblePixel | Plain / 1 Paper / 1.png | `ui/paper.png` | PDF original: `ui/HumblePixel-LICENSE.pdf` |
| Game-Icon-Pack-v1.4-SVG.7z | `no-padding/2-items/compass.svg` | `ui/compass.svg` | Nenhuma licença encontrada no pacote fornecido |

Não há UI de papel nem ícones permanentes sobre o cenário. As rotas profissionais
continuam acessíveis no menu e diretamente por URL.

## Avaliados e reservados — não carregados no site

| Pacote | Avaliação / decisão |
| --- | --- |
| Universal Animation Library[Standard].zip | CC0, variantes com e sem root motion; desnecessário misturar rigs neste passe |
| Arachnodroid.zip | VOX/OBJ e preview; reservado, nenhuma licença embutida encontrada |
| ReconBot.zip | VOX/OBJ e preview; reservado, nenhuma licença embutida encontrada |
| MechaTrooper.zip | VOX/OBJ e preview; reservado, nenhuma licença embutida encontrada |
| FieldFighter.zip | VOX/OBJ e preview; reservado, nenhuma licença embutida encontrada |
| QuadrupedTank.zip | VOX/OBJ e preview; reservado, nenhuma licença embutida encontrada |
| MechGolem.zip | VOX/OBJ e preview; reservado, nenhuma licença embutida encontrada |
| Mecha01.rar | VOX/OBJ e preview; reservado, nenhuma licença embutida encontrada |
| Game-Icon-Pack-v1.4-PNG.7z | Equivalentes raster; SVG suficiente para o único ícone selecionado |
| New free backgrounds part4.zip | Fundos 2D pixel art; pacote remete à licença Craftpix; reservado para eventual fallback |
| free-sky-with-clouds-background-pixel-art-set.zip | Céus 2D pixel art; pacote remete à licença Craftpix; não substitui céu 3D |
| Free Pixel Effects Pack.zip | README declara domínio público; sem efeito necessário neste passe |

Este catálogo é técnico. Não existe galeria de robôs adicionada ao portfólio nem
download de assets reservados no navegador. Confirmar as fontes/licenças ausentes
antes de redistribuir esses arquivos fora deste projeto pessoal.

## Reimportação

`node scripts/import-world-assets.mjs /pasta/com/os/pacotes`

O script importa somente a seleção acima, reduz as texturas e agrupa os clips
necessários no GLB. Utiliza Three já instalado e Sharp fornecido por Next.js
apenas offline; não acrescenta loaders ou bibliotecas ao bundle do navegador.

## Matteo avatar v4 — anatomical head

- Archived asset: `characters/matteo-v4.glb`; editable source: `assets/characters/matteo-v4.blend`.
- Build: `scripts/build-matteo-avatar.py`. Original clothing, hair, rig and in-place animation studies authored for this portfolio.
- Head topology adapted from the MakeHuman hm08 base mesh, explicitly released under **CC0 in September 2020**. Source: https://github.com/makehumancommunity/makehuman/blob/master/makehuman/data/3dobjs/base.obj
- The repository retains only the head subset at `assets/characters/source/makehuman-head.obj` and the asset license at `assets/characters/source/MAKEHUMAN-CC0.md`. MakeHuman application code was not incorporated.
- Copyright holders listed in the source asset: Data Collection AB, Joel Palmius, Jonas Hauquier (2020). No user photographs are embedded.
- The `practice` animation is a free movement study, not an official Songahm form.

## Public editorial sources — final portfolio pass

- Portal supplied by Matteo: https://pet-sistemas.github.io/unapi-oficinas/
- Public project documentation: https://github.com/TeoZ08/homeUnapi/blob/main/README.md
- Jarvis: https://github.com/TeoZ08/jarvis-academico and https://teoz08-jarvis-academico.hf.space
- The notebook searches quoted portfolio paragraphs locally; it does not call or simulate the remote Jarvis agent.

## Matteo avatar v5 — original low-poly portrait

- Current runtime: `characters/matteo-v5.glb`; editable source: `assets/characters/matteo-v5.blend`.
- Generator: `scripts/build-matteo-lowpoly.py`, run with Blender 5.1.1.
- Original facial planes, eyelids, nose, lips and unified broad wavy hair authored for this portfolio using Matteo's supplied photographs as visual references. No MakeHuman topology is used in v5.
- The supplied Pinterest screenshot guided the faceted visual language. No downloaded character, texture or third-party mesh from that screenshot is incorporated.
- Casual clothing, silver accessories, 16-bone rig and the six in-place animations continue from the original portfolio avatar pipeline. The source photographs are not embedded or served by the website.
- Sky, sun shader and instanced cumulus clouds are procedural local assets, with no HDRI downloads or added runtime dependencies.

### GOAL 06 — corrida natural (integrada em produção)

Nesta versão, o GLB chibi mantém a malha/rig CC0 Magicless e cinco clips da versão aprovada. Apenas `run` recebe um refinamento manual de ombros, cotovelos e mãos. A biblioteca Quaternius Universal Animation Library Standard foi avaliada como referência e candidata de retarget (`Jog_Fwd_Loop`), mas a candidata manual foi escolhida por manter braços mais relaxados nas proporções do chibi. Nenhuma malha ou biblioteca Quaternius é incluída no site.

Fonte de avaliação: https://quaternius.com/packs/universalanimationlibrary.html — licença CC0 1.0 Universal confirmada no `License.txt` do pacote. Scripts, .blend, comparativo e licença de avaliação ficam em `work/chibi-run-retarget-v1/` da pasta principal; a biblioteca completa permanece fora do Git.
