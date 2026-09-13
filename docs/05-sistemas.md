# v0.5 — Systems & Feature Design

## Prioridades

- **V1 Essencial**
- **V1+ Importante**
- **Expansão**

## V1 Essencial

### Player Controller
Estados:
- idle;
- walk;
- fast walk/run;
- sit;
- inspect;
- interact;
- use device;
- read;
- special.

Sem pulo livre.

### Câmera inteligente
Estados:
- explore;
- interior;
- inspect;
- device;
- cinematic;
- vista;
- conversation;
- dojo.

### Interação contextual
Cada objeto declara:
- tipo;
- label;
- distância;
- preset de câmera;
- animação;
- ação;
- condições.

### Regiões
- Arrival
- Field
- House
- University
- Workshop
- Community
- Dojo
- Hill
- Forest

### World State
Controla:
- região;
- tempo;
- vento;
- regiões visitadas;
- eventos;
- segredos;
- objetos persistentes.

### Persistência
Inicialmente localStorage versionado.

### Ambiente
- vento;
- vegetação;
- nuvens;
- iluminação;
- áudio;
- eventos simples.

### NPCs
V1 mínima:
- rotina simples;
- movimento;
- idle;
- reação contextual.

### Computador
- desktop;
- janelas;
- pastas;
- projetos;
- terminal inicial.

### Projetos
Uma fonte de verdade usada por:
- mundo;
- computador;
- case studies;
- menu direto.

### Case studies
Estrutura:
- contexto;
- objetivo;
- participação;
- decisões;
- implementação;
- resultado;
- links/mídia.

### Modo direto
Projetos, Sobre, CV e Contato acessíveis sem exploração.

### Mobile, acessibilidade e fallback
Devem existir desde o vertical slice.

## V1+ Importante

- mapa descobrível;
- fast travel;
- terminal mais completo;
- documentos físicos;
- rotinas de NPC;
- música adaptativa;
- eventos ambientais;
- persistência mais rica.

## Expansões

- chuva/clima;
- modo fotografia;
- eventos raros;
- segredos encadeados;
- novas regiões;
- conteúdo sazonal;
- sessões com variações.

## Regra

Uma feature só entra se aumentar pelo menos um destes fatores:
- presença;
- descoberta;
- entendimento sobre Matteo.
