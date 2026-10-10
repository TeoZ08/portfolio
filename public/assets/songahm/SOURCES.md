# Sources — GOAL10 Songahm and regional soil

Imported from the user's local asset lab, 2026-10-09. No starter village, perimeter walls, Japanese gate or complete pack is loaded. Source assets remain untouched.

## Hanok modules

Pack: https://3dassets.dev/packs/korean-hanok-village-and-street
Declared license: CC0 1.0, https://creativecommons.org/publicdomain/zero/1.0/
The source publisher declares these assets AI-generated. This provenance is preserved; inclusion does not imply official Songahm cultural endorsement.

| Local GLB | ID | Original file URL | Bytes |
| --- | --- | --- | ---: |
| main-house.glb | 38035 | https://cdn.3dassets.dev/assets/38035/v1/model.glb | 420740 |
| side-wing.glb | 38034 | https://cdn.3dassets.dev/assets/38034/v1/model.glb | 232312 |
| plinth.glb | 38033 | https://cdn.3dassets.dev/assets/38033/v1/model.glb | 7604 |
| basin.glb | 38074 | https://cdn.3dassets.dev/assets/38074/v1/model.glb | 10988 |
| persimmon.glb | 38085 | https://cdn.3dassets.dev/assets/38085/v1/model.glb | 96904 |
| pine.glb | 38086 | https://cdn.3dassets.dev/assets/38086/v1/model.glb | 50700 |
| bamboo.glb | 38087 | https://cdn.3dassets.dev/assets/38087/v1/model.glb | 97940 |
| stepping-stones.glb | 38089 | https://cdn.3dassets.dev/assets/38089/v1/model.glb | 22804 |

Main house uses visible frame/roof only. Enclosed rooms/doors are omitted; low perimeter sills are removed in the runtime clone to preserve training access. Side wings retain their own scale. Stepping-stone base and colored grit are omitted. Quantized positions/normals are converted to Float32 before transforms. Original GLB files are unchanged.

## Kenney

https://kenney.nl/assets/nature-kit — CC0. Selected only rock_largeA, rock_smallC, plant_bushSmall. Materials remapped to stone and sage; geometry instanced per primitive, no cyan conifers or pastel rocks. The original pack license is included as KENNEY-LICENSE.txt.

## Poly Haven

https://polyhaven.com/a/gravel_ground_01
https://polyhaven.com/a/rocks_ground_09
https://polyhaven.com/license — CC0.
Diffuse and roughness JPEGs, 1K. Download URLs and original checksums in the user's asset-lab download-summary.json. Four source maps are used unchanged, sRGB diffuse, linear roughness, repeat wrapping and mipmaps. No synthetic replacement textures.
