import test from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import { sourceModule } from '../qa/lib/source-module.mjs';
const {
  getPlayerStartPosition,
  createPlayerMotionState,
  resetPlayerMotionState
} = await sourceModule('src/world/player/player-motion.ts');
const {
  HOUSE_CEILING
} = await sourceModule('src/world/regions/house/house-layout.ts');
await RAPIER.init();
test('DEV spawn grounds on its actual18×14 floor and walking remains supported', () => {
  const spawn = getPlayerStartPosition('DEV_FOUNDATION'),
    w = new RAPIER.World({
      x: 0,
      y: -20,
      z: 0
    });
  w.createCollider(RAPIER.ColliderDesc.cuboid(9, .25, 7).setTranslation(0, -.25, 0));
  const b = w.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(...spawn)),
    c = w.createCollider(RAPIER.ColliderDesc.capsule(.5, .35), b),
    cc = w.createCharacterController(.01);
  cc.enableSnapToGround(.2);
  w.step();
  for (let i = 0; i < 180; i++) {
    cc.computeColliderMovement(c, {
      x: 0,
      y: -.033,
      z: -.015
    });
    const p = b.translation(),
      m = cc.computedMovement();
    b.setNextKinematicTranslation({
      x: p.x + m.x,
      y: p.y + m.y,
      z: p.z + m.z
    });
    w.step();
    assert(b.translation().y > .84, 'DEV must never enter recovery loop');
    assert(cc.computedGrounded(), 'DEV walk is grounded');
  }
  w.free();
});
test('regional reset preserves Field/House SPA policy while DEV recovery uses reachable floor', () => {
  assert.deepEqual(getPlayerStartPosition('FIELD'), [0, .9, 26]);
  assert.deepEqual(getPlayerStartPosition('HOUSE'), getPlayerStartPosition('FIELD'));
  const dev = getPlayerStartPosition('DEV_FOUNDATION'),
    motion = createPlayerMotionState(dev);
  assert(Math.abs(motion.position.z) < 7);
  motion.position.y = -20;
  resetPlayerMotionState(motion, dev);
  assert.deepEqual(motion.position, {
    x: dev[0],
    y: dev[1],
    z: dev[2]
  });
  assert.equal(motion.airborne, true);
});
test('camera sphere meets the shared physical ceiling before the visible underside', () => {
  const w = new RAPIER.World({
      x: 0,
      y: 0,
      z: 0
    }),
    s = .72,
    p = HOUSE_CEILING.position,
    h = HOUSE_CEILING.halfSize;
  w.createCollider(RAPIER.ColliderDesc.cuboid(...h.map(v => v * s)).setTranslation(...p.map(v => v * s)));
  w.step();
  const eye = {
      x: 0,
      y: 1.28,
      z: 0
    },
    hit = w.castShape(eye, {
      x: 0,
      y: 0,
      z: 0,
      w: 1
    }, {
      x: 0,
      y: 1,
      z: 0
    }, new RAPIER.Ball(.16), 0, 4.2, true);
  assert(hit, 'shared ceiling must block upward camera sweep');
  const y = eye.y + hit.time_of_impact - .02;
  assert(y <= (p[1] - h[1]) * s - .16);
  assert(y > eye.y);
  const firstPerson = w.castShape(eye, {
    x: 0,
    y: 0,
    z: 0,
    w: 1
  }, {
    x: 0,
    y: 1,
    z: 0
  }, new RAPIER.Ball(.16), 0, 0, true);
  assert.equal(firstPerson, null);
  w.free();
});
