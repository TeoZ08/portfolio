import assert from 'node:assert/strict';
const wrap = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
async function turnAndWalk(g) {
  await g.open();
  await g.ready();
  await g.page.mouse.move(640, 360);
  await g.key('c');
  await g.page.waitForFunction(() => Math.abs(window.__environmentQA.read().perspective.pitch + .16) < .001);
  await g.page.waitForTimeout(90);
  let x = 640;
  for (const degrees of [90, 180, 360]) {
    const before = await g.read();
    x += degrees * Math.PI / 180 / .0025;
    await g.page.mouse.move(x, 360);
    const expected = wrap(before.env.perspective.yaw + degrees * Math.PI / 180);
    await g.page.waitForFunction(expected => Math.abs(Math.atan2(Math.sin(window.__environmentQA.read().perspective.yaw - expected), Math.cos(window.__environmentQA.read().perspective.yaw - expected))) < .01, expected);
    const after = await g.shot('turn-' + degrees);
    g.data.observations.push({
      degrees,
      expected,
      actual: after.env.perspective.yaw
    });
    await g.verify('native turn ' + degrees, ['CAMERA.TURN'], async () => assert(Math.abs(wrap(after.env.perspective.yaw - expected)) < .01), {
      coverage: 'partial',
      scope: 'Native angle and wrap; exact first-frame movement basis is a distinct unit rule'
    });
  }
  await g.page.evaluate(() => {
    window.__walkLookSamples = [];
    const start = performance.now();
    function sample() {
      const a = document.querySelector('canvas').__avatarQA;
      window.__walkLookSamples.push({
        time: performance.now(),
        motion: JSON.parse(JSON.stringify(a.motionRef.current)),
        camera: window.__environmentQA.read().perspective
      });
      if (performance.now() - start < 500) requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  const before = await g.read();
  try {
    await g.page.keyboard.down('w');
    await g.page.mouse.move(x + 80, 340);
    await g.page.waitForFunction(() => window.__walkLookSamples.length >= 22);
  } finally {
    await g.page.keyboard.up('w');
  }
  await g.settle();
  const after = await g.shot('simultaneous-W-look');
  const trace = await g.page.evaluate(() => window.__walkLookSamples);
  g.data.observations.push({
    trace
  });
  await g.verify('native W and look cooperate', ['SEQUENCE.WALK_LOOK'], async () => {
    assert(Math.hypot(after.motion.position.x - before.motion.position.x, after.motion.position.z - before.motion.position.z) > .7);
    assert(Math.abs(wrap(after.env.perspective.yaw - before.env.perspective.yaw)) > .15);
    assert(trace.some(t => Math.hypot(t.motion.velocity.x, t.motion.velocity.z) > 3));
    assert(after.control.manualInputEnabled);
  });
}
async function eastBoundary(g) {
  await g.open();
  await g.ready();
  await g.map('Mirante');
  await g.go(30, -10, 'east-clear-route');
  await g.go(35, -10, 'east-boundary-before');
  const yaw = (await g.read()).env.perspective.yaw;
  const key = Math.abs(Math.sin(yaw)) > Math.abs(Math.cos(yaw)) ? Math.sin(yaw) > 0 ? 'w' : 's' : Math.cos(yaw) > 0 ? 'd' : 'a';
  await g.key(key, 2200);
  await g.settle();
  const contact = await g.shot('east-contact');
  await g.key(key, 600);
  await g.settle();
  const blocked = await g.shot('east-still-supported');
  await g.verify('terrain east limit is physical', ['MOVEMENT.BOUNDS'], async () => {
    assert(contact.motion.position.x > 38 && contact.motion.position.x < 39.6);
    assert(Math.abs(blocked.motion.position.x - contact.motion.position.x) < .03);
    assert(blocked.motion.grounded && blocked.control.manualInputEnabled);
  }, {
    coverage: 'partial',
    scope: 'East boundary only; other edges not extrapolated'
  });
  const opposite = {
    w: 's',
    s: 'w',
    a: 'd',
    d: 'a'
  }[key];
  await g.key(opposite, 500);
  await g.settle();
  assert((await g.read()).motion.position.x < blocked.motion.position.x - 1);
  await g.shot('east-return-free');
}
export const turnBoundary = [{
  id: 'CAMERA.NATIVE.TURN.WALK',
  run: turnAndWalk
}, {
  id: 'TERRAIN.PHYSICAL.EAST.LIMIT',
  run: eastBoundary
}];
