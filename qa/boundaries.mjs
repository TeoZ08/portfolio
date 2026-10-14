import assert from 'node:assert/strict';
import { world } from './lib/gameplay.mjs';
const distance = (p, t) => Math.hypot(p.x - t.interactionPoint[0], p.y - t.interactionPoint[1], p.z - t.interactionPoint[2]);
function expectedCandidate(position, region) {
  return world.targets.filter(t => t.region === region && distance(position, t) <= t.activationRadius).sort((a, b) => distance(position, a) - distance(position, b) || a.id.localeCompare(b.id))[0]?.id || null;
}
async function release(g) {
  const s = await g.read(),
    id = s.env.interaction.activeTargetId;
  if (s.env.perspective.interaction === 'approaching') {
    await g.key('Escape');
    await g.idle();
  } else if (['using', 'sitting'].includes(s.env.perspective.interaction)) {
    await g.leave(id);
  } else await g.idle();
}
async function radius(g, id) {
  const t = world.targets.find(t => t.id === id);
  await g.open();
  await g.ready();
  if (t.region === 'HOUSE') await g.house({
    physical: false
  });else {
    const dest = world.destinations.find(d => d.id === id) || world.destinations.find(d => d.name === 'Bosque');
    await g.map(dest.name);
  }
  const p = t.interactionPoint,
    y = t.interactionRotationY,
    sign = t.region === 'FIELD' && t.action.type === 'sit' ? -1 : 1,
    dir = [sign * Math.sin(y), sign * Math.cos(y)];
  // The margin exceeds the measured movement tolerance. Equality is tested only
  // as a mathematical rule in the unit suite, not faked in the live world.
  await g.go(p[0] + dir[0] * (t.activationRadius + .15), p[2] + dir[1] * (t.activationRadius + .15), id + '-outside', .10);
  const outside = await g.shot('outside');
  await g.verify(id + ' outside', ['TARGET.' + id + '.BOUNDARY'], () => {
    assert(distance(outside.motion.position, t) > t.activationRadius);
    assert.notEqual(outside.env.interaction.candidateId, id);
    assert.equal(outside.env.interaction.candidateId, expectedCandidate(outside.motion.position, t.region));
  }, {
    coverage: 'partial',
    scope: 'Nativewalk outsideR+.15m; exactglobal equality unclaimed'
  });
  await g.key('e');
  await g.page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const afterOutside = await g.shot('outside-E');
  assert.notEqual(afterOutside.env.interaction.activeTargetId, id);
  await release(g);
  if ((await g.read()).region !== t.region) {
    if (t.region === 'HOUSE') await g.house({
      physical: false
    });else await g.map(world.destinations.find(d => d.id === id)?.name || 'Bosque');
  }
  await g.go(p[0] + dir[0] * (t.activationRadius - .15), p[2] + dir[1] * (t.activationRadius - .15), id + '-inside', .10);
  const inside = await g.shot('inside'),
    expected = expectedCandidate(inside.motion.position, t.region);
  await g.verify(id + ' inside', ['TARGET.' + id + '.BOUNDARY'], () => {
    assert(distance(inside.motion.position, t) < t.activationRadius);
    assert.equal(inside.env.interaction.candidateId, expected);
  }, {
    coverage: 'partial',
    scope: 'Nativewalk insideR-.15m; real competingnearest target allowed; equality unitonly'
  });
  await g.key('e');
  await g.page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const activated = await g.shot('inside-E');
  if (inside.env.interaction.blockedReason) {
    assert.equal(activated.env.perspective.interaction, 'idle');
    assert(activated.control.manualInputEnabled);
  } else assert.equal(activated.env.interaction.activeTargetId, expected);
  await release(g);
}
export const boundaries = world.targets.map(t => ({
  id: 'BOUNDARY.' + t.id,
  contracts: [],
  run: g => radius(g, t.id)
}));
