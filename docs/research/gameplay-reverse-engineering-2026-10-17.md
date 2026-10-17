# Engineering reverse study: optional discoveries (17 Oct 2026)

## Scope and safety

Experiment isolated on branch `experiment/contextual-discoveries-20261017`, worktree
`~/ProjetosPessoais/portfolio-gameplay-research-20261017`.
The deployed portfolio, original worktree, main branch, animation assets, Rapier controller and camera rig are untouched.
Production requests to `/dev/gameplay-lab` resolve to Next.js 404.

This is a gameplay architecture research prototype, not an art-direction proposal
or a required quest for visitors. Projects still have direct routes.

## Actual references examined

1. **thaslle/world** — https://github.com/thaslle/world (MIT):
   - `src/hooks/use-store.ts`: progression store with found items and stages.
   - `src/components/player/index.tsx`: Rapier collision-based collection.
   - `src/components/assets/collectibles/collectible.tsx`: instanced interactive objects.
   - The original index-based collection would shift item identifiers after removals;
     the experiment deliberately switches to stable IDs and idempotent collection.
2. **pmndrs/ecctrl** — https://github.com/pmndrs/ecctrl (MIT):
   - robust floating controller, runtime animation state, Rapier integration.
   - **Not installed or transplanted.** Existing portfolio already has a tailored
     kinematic character controller, custom camera and distance-paced animations.
     Latest Ecctrl 2.0.2 lists Three >=0.184.0 as peer; current project is 0.182.0.
3. **Chris-B/Portfolio-Website** — https://github.com/Chris-B/Portfolio-Website:
   - external architectural reference for multiple rooms/overlays;
     no implementation copied; license not presumed.
4. **ssethsara/react-three-npc** — https://github.com/ssethsara/react-three-npc (MIT):
   - potential later path for patrols/navmesh; not needed for this vertical slice.

## What was adapted, and why

The World example establishes **explore → encounter → record → reveal**.
For our kinematic Rapier player, directly porting its `onCollisionEnter` collection
would unnecessarily modify the proven locomotion/collision code. The adapter instead
uses the existing, 10 Hz debug-position publisher and a single distance check for
keyboard (F), click and accessible HTML button. This is enough for a research demo;
a production integration should use an independent interaction-position signal,
not a diagnostic store.

Implementation:
- Stable project-linked IDs: `jarvis`, `unapi`, `aquaia`.
- No persistent state (every lab visit resets).
- Duplicate/out-of-range/invalid interaction ignored by the same pure reducer.
- A single proximity resolver drives UI and keyboard capture.
- Pure unit-tested logic independent of Three/React/Rapier.
- No new npm dependencies, models, textures or audio.
- Objects rotate gently but don't bob vertically.
- The last discovery reveals an optional message; essential content is never gated.

## How to run

```bash
cd ~/ProjetosPessoais/portfolio-gameplay-research-20261017
npm install --include=optional --omit=peer
npm run typecheck
node --experimental-strip-types --test scripts/discovery-lab.test.mjs
npm run dev -- --port 3001
```

Open `http://localhost:3001/dev/gameplay-lab` **locally** (not the public site).
Move with WASD, approach a marker, and press **F** or click; the HTML button is
an accessible fallback. The playground original is still `/dev/playground`.

## Verification (17 Oct 2026)

- Five discovery-logic unit tests: **pass**.
- TypeScript: **pass**.
- Local Next.js dev response: **HTTP 200**.
- Headless Chrome via Playwright: **F keyboard** 0/3 → 1/3, **reset** 1/3 → 0/3, **button** 0/3 → 1/3, zero page errors.
- The browser smoke test used \`localhost:3001\` (not \`127.0.0.1\`), since Next.js dev resource origin protection blocked HMR at the other hostname.
- A temporary node_modules symlink outside the worktree root also required \`--webpack\` during smoke testing; installing normal local dependencies avoids this.

## Acceptance criteria for any actual merge

1. Exercise the three markers via keyboard and mouse without accidental collection at range.
2. Verify mobile accessibility using the HTML interaction button; don't claim swipe controls
   work until independently tested.
3. Watch FPS and draw calls; replace individual meshes with instances if scaling beyond
   this three-object POC.
4. Verify the original animation, camera, collisions, sit/use/enter flows remain unaffected.
5. Build a narrative/content review before placing real collectibles in the world.

**Decision:** keep as a standalone proof of concept. Do **not** merge or publish
as part of this experiment without visual and functional review.
