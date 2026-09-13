# v0.6 — Technical Architecture & Production Plan

## Stack recomendada

- Next.js
- React
- TypeScript
- Three.js
- React Three Fiber
- Drei
- Zustand
- Rapier
- GSAP
- Motion
- MDX
- Zod
- Blender para pipeline 3D

## Camadas

### Experience Layer
- World
- Regions
- Player
- Camera
- Interactions
- Environment
- NPCs
- Audio
- World State

### Content Layer
- Projects
- Academic work
- Personal information
- Documents
- Case studies

### Application Layer
- Menu
- Settings
- Accessibility
- Persistence
- Routing
- Performance

## Responsabilidades

### Next.js
Rotas, SEO, páginas diretas, conteúdo estático, fallback e metadados.

### R3F/Three
Mundo 3D e interação espacial.

### Zustand
Stores separadas:
- world;
- player;
- interactions;
- progress;
- settings;
- UI;
- audio.

### Rapier
Colisão e controlador cinemático limitado.

### GSAP
Timelines de câmera e sequências.

### Motion
UI HTML.

### MDX
Case studies e conteúdo editorial.

### Zod
Validação dos metadados.

## Pipeline de assets

Concept → Blockout → Blender → GLB → Web

Código controla comportamento. Assets controlam forma.

## Regras de performance

- carregar regiões sob demanda;
- instancing para vegetação/objetos repetidos;
- GLB/glTF;
- otimizar texturas;
- evitar milhares de componentes React para meshes repetidas;
- medir FPS, draw calls, triângulos e memória.

## Computador

Interface HTML sobre o monitor 3D.

Quando o usuário usa o computador:
1. personagem alinha/senta;
2. câmera enquadra monitor;
3. UI HTML assume a área da tela;
4. conteúdo pode expandir para leitura confortável.

## Conteúdo

Projetos centralizados em um registry/metadata + MDX.

Um mesmo projeto é referenciado pelo mundo, computador, rotas e menu.

## Ambiente de desenvolvimento

Criar painel DEV com:
- teleport;
- time;
- region;
- wind;
- colliders;
- interaction points;
- camera zones.

## Fases

0. Foundation
1. Player + Camera Playground
2. Interaction Prototype
3. Environment Prototype
4. Character Art Prototype
5. Vertical Slice Blockout
6. Vertical Slice Art Pass
7. Computer Deepening
8. Project Framework
9. Workshop
10. University
11. Community
12. Dojo
13. Hill + full journey
14. Forest + secrets
15. Polish
