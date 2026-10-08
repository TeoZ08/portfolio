# Acervo selecionado — passe de exploração

Arquivos fornecidos pelo usuário. Os ZIP/RAR/7z originais permanecem fora do
projeto. Este registro distingue assets usados, reservas e licenças encontradas;
a declaração de uso pessoal não é tratada como substituta de uma licença.

## Usados no mundo

### Avatar Matteo v2 — modelo original

O avatar ativo é `characters/matteo-v2.glb`, criado pelo script
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

- Runtime: `characters/matteo-v4.glb`; editable source: `assets/characters/matteo-v4.blend`.
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
