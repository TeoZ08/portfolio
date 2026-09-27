# Acervo selecionado — passe de exploração

Arquivos fornecidos pelo usuário. Os ZIP/RAR/7z originais permanecem fora do
projeto. Este registro distingue assets usados, reservas e licenças encontradas;
a declaração de uso pessoal não é tratada como substituta de uma licença.

## Usados no mundo

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
