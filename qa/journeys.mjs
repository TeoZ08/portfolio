import assert from 'node:assert/strict';
import { world } from './lib/gameplay.mjs';
async function assertActive(g, id, state) {
  const t = world.targets.find(x => x.id === id);
  await g.verify(id + ' activation', ['TARGET.' + id], () => {
    assert(state.motion.grounded || t.action.type === 'sit');
    assert(Number.isFinite(state.motion.position.x + state.motion.position.y + state.motion.position.z));
    assert(state.motion.position.y > -1);
    if (t.action.type !== 'enter') {
      assert.equal(state.control.manualInputEnabled, false);
      if (t.action.type === 'sit' || t.action.seated) assert(state.control.physicsLocked);
    }
    if (id === 'DOJO_PRACTICE') {
      assert.equal(state.control.pose, 'practice');
      assert.equal(state.pose, 'practice');
    }
    if (t.action.type === 'enter') {
      assert(Math.hypot(state.motion.position.x - t.action.destinationPoint[0], state.motion.position.y - t.action.destinationPoint[1], state.motion.position.z - t.action.destinationPoint[2]) < .15);
      assert(state.phaseTrace.some(s => s.region === t.action.destinationRegion && s.position && Math.hypot(s.position.x - t.action.destinationPoint[0], s.position.y - t.action.destinationPoint[1], s.position.z - t.action.destinationPoint[2]) < .15 && Math.abs(Math.atan2(Math.sin(s.rotationY - t.action.destinationRotationY), Math.cos(s.rotationY - t.action.destinationRotationY))) < .1), 'Destination heading must be observed at transition application; manual idle subsequently follows preserved camera look');
    }
    assert(state.phaseTrace.some(s => s.status === 'aligned'), 'Actual aligned phase must be observed, not inferred');
    if (t.action.type === 'sit') assert(Math.hypot(state.motion.position.x - t.action.seatPoint[0], state.motion.position.y - t.action.seatPoint[1], state.motion.position.z - t.action.seatPoint[2]) < .1);
    assert.equal(state.region, t.action.type === 'enter' ? t.action.destinationRegion : t.region);
    if (t.action.type !== 'enter') assert.equal(state.env.interaction.activeTargetId, id);
    assert.equal(state.env.perspective.interaction, t.action.type === 'enter' ? 'idle' : t.action.type === 'sit' ? 'sitting' : 'using');
  });
}
async function target(g, id, {
  repeat = true
} = {}) {
  const t = await g.near(id);
  if (g.journeyVariant?.facingAway) {
    await g.page.locator('canvas').click({
      position: {
        x: 480,
        y: 340
      }
    });
    await g.page.mouse.move(480, 340);
    await g.page.waitForTimeout(90);
    const yaw = (await g.read()).env.perspective.yaw,
      wanted = -(t.interactionRotationY + Math.PI),
      delta = Math.atan2(Math.sin(wanted - yaw), Math.cos(wanted - yaw));
    await g.page.mouse.move(480 + Math.round(delta / .0025), 340);
    await g.page.waitForFunction(r => {
      const y = window.__environmentQA.read().playerMotion.rotationY;
      return Math.abs(Math.abs(Math.atan2(Math.sin(y - r), Math.cos(y - r))) - Math.PI) < .02;
    }, t.interactionRotationY);
    const facing = await g.shot(id + '-facing-away');
    await g.verify(id + ' facingaway', ['TARGET.' + id + '.BACK'], () => assert(Math.abs(Math.abs(Math.atan2(Math.sin(facing.motion.rotationY - t.interactionRotationY), Math.cos(facing.motion.rotationY - t.interactionRotationY))) - Math.PI) < .02), {
      coverage: 'partial',
      scope: 'Avatarorientationπ atfrontal accessibleposition; physicalrear separate'
    });
  }
  await g.interact();
  await g.status('approaching');
  await g.shot(id + '-cancel-before');
  if (g.journeyVariant?.escape) await g.key('Escape');else await g.interact();
  await g.idle();
  const cancelled = await g.shot(id + '-cancel-after');
  await g.verify(id + ' cancel', ['TARGET.' + id + '.CANCEL'], () => {
    assert.equal(cancelled.control.manualInputEnabled, true);
    assert.equal(cancelled.control.physicsLocked, false);
    assert.equal(cancelled.env.interaction.activeTargetId, null);
  }, {
    scope: g.journeyVariant?.escape ? 'nativeEscape cancellation' : g.touch ? 'native touch cancellation' : 'native E cancellation; Escape variants separately'
  });
  const state = await g.activate(id);
  await assertActive(g, id, state);
  if (t.action.type !== 'enter') {
    await g.leave(id);
    if (repeat) {
      const again = await g.activate(id);
      await g.verify(id + ' reentry', ['TARGET.' + id + '.REENTER'], () => assert.equal(again.env.interaction.activeTargetId, id));
      await g.leave(id);
    }
  }
  return state;
}
async function journey(g, variant = {}) {
  g.journeyVariant = variant;
  await g.open();
  const initial = await g.ready();
  if (variant.mode) await g.mode(variant.mode);
  await g.shot('arrival');
  assert.equal(initial.region, 'FIELD');
  assert(Math.abs(initial.motion.position.z - 26) < .05);
  assert.equal(await g.page.locator('.world-canvas').getAttribute('data-time-of-day'), '17.5');
  await g.route('chegada-eixo', 1, 3);
  await g.route('casa', 1);
  await target(g, 'HOUSE_ENTRY_DOOR');
  for (const id of ['HOUSE_ENTRY_BENCH', 'HOUSE_REFERENCE_BOARD', 'HOUSE_BOOKSHELF', 'HOUSE_COMPUTER']) await target(g, id);
  await target(g, 'HOUSE_EXIT_DOOR');
  // Door reentry is a physical, public pair; no state/position setters.
  await g.activate('HOUSE_ENTRY_DOOR');
  await g.verify('house entry reentry', ['TARGET.HOUSE_ENTRY_DOOR.REENTER'], async () => assert.equal((await g.read()).region, 'HOUSE'));
  await g.activate('HOUSE_EXIT_DOOR');
  await g.verify('house exit reentry', ['TARGET.HOUSE_EXIT_DOOR.REENTER'], async () => assert.equal((await g.read()).region, 'FIELD'));
  await g.route('casa', 0, 0);
  await g.route('galeria', 1);
  await g.go(15, 10, 'gallery-entry');
  for (const id of ['WORKSHOP_LIGHT_TABLE', 'UNIVERSITY_NOTEBOOK', 'COMMUNITY_WORKSHOP']) await target(g, id);
  await g.go(12.4, 10, 'gallery-return-porch');
  await g.route('galeria', 0, 0);
  await g.route('chegada-eixo', 4);
  await g.go(-2, -13.5, 'dojo-stairs');
  await g.go(-2, -17, 'dojo-floor');
  await target(g, 'DOJO_PRACTICE');
  await g.go(-2, -13.5, 'dojo-return');
  await g.go(0, -4, 'central-return');
  await g.route('mirante-subida', 1, 3);
  await target(g, 'HILL_BENCH');
  for (const [i, p] of [...world.routes.find(r => r.name === 'mirante-subida').points.slice(0, -1)].reverse().entries()) await g.go(...p, 'hill-return-' + i);
  await g.go(-10, -8, 'grove-east');
  await g.go(-15, -5, 'grove-path');
  await target(g, 'FOREST_BENCH');
  await g.go(-12, -2, 'grove-chime');
  await target(g, 'FOREST_CHIMES');
  await g.go(-9.5, 2, 'garden-wall-clearance');
  await g.go(-9.5, 5, 'garden-wall-after');
  await g.go(-10.4, 10, 'house-path-return');
  await g.go(0, 11, 'plaza-return');
  await g.go(0, 26, 'arrival-return');
  const final = await g.shot('arrival-return');
  for (const d of world.destinations) await g.verify('physical route ' + d.id, ['ROUTE.' + d.id], () => assert(g.data.steps.some(s => s.label === d.id + '-active' && s.state.region === 'FIELD' || s.label === d.id + '-active' && s.state.region === 'HOUSE')), {
    scope: 'Continuous journey from Chegada using public native input; waypoint traces recorded'
  });
  await g.verify('return complete', ['MOVEMENT.COLLISION', 'MOVEMENT.STEP', 'MOVEMENT.SLOPE'], () => {
    assert(final.motion.grounded);
    assert(Math.abs(final.motion.position.z - 26) < .25);
    assert.equal(final.env.perspective.interaction, 'idle');
  }, {
    coverage: 'partial',
    scope: 'Routes include dojo stairs/Mirante; not every obstacle or slope angle'
  });
  await g.verify('console clean', [], () => assert.deepEqual(g.data.errors, []));
}
async function maps(g) {
  await g.open();
  await g.ready();
  for (const d of world.destinations) {
    const s = await g.map(d.name),
      t = world.targets.find(x => x.id === d.id);
    await g.verify('map ' + d.id, ['MAP.' + d.id], () => {
      assert.equal(s.region, 'FIELD');
      assert.equal(s.env.perspective.interaction, 'idle');
      assert(s.motion.grounded);
      assert(Math.hypot(s.motion.position.x - t.interactionPoint[0], s.motion.position.z - t.interactionPoint[2]) < 1.2);
    });
  }
}
export const journeys = [{
  id: 'JOURNEY.DESKTOP',
  contracts: [],
  run: journey
}, {
  id: 'JOURNEY.TOUCH',
  touch: true,
  contracts: [],
  run: journey
}, {
  id: 'JOURNEY.FRONT.ORIENTATION.ESC',
  contracts: [],
  run: g => journey(g, {
    mode: 'third-person-front',
    facingAway: true,
    escape: true
  })
}, {
  id: 'MAP.DESKTOP',
  contracts: [],
  run: maps
}, {
  id: 'MAP.TOUCH.LOW',
  touch: true,
  quality: 'low',
  contracts: [],
  run: maps
}];
