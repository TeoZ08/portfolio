import assert from 'node:assert/strict';
async function recover(g, region) {
  await g.open((region === 'DEV_FOUNDATION' ? '/dev/playground' : '/') + '?avatarQA&recoveryQA');
  await g.ready();
  if (region === 'HOUSE') await g.pc();
  if (region === 'FIELD') {
    await g.map('Mirante');
    await g.activate('HILL_BENCH');
  }
  await g.page.waitForFunction(() => typeof window.__recoveryQA?.drop === 'function');
  const before = await g.shot('before-explicit-fault');
  assert.equal(before.region, region);
  g.data.observations.push({
    scope: 'EXPLICIT DEV FAULT INJECTION. Existing recoveryQA.drop moves the rigid body below threshold. This is NOT public gameplay, NOT a route and NOT evidence of physical access.',
    region
  });
  await g.page.evaluate(() => {
    window.__recoveryEvents = [];
    window.addEventListener('world:player-recovered', () => window.__recoveryEvents.push({
      time: performance.now(),
      region: document.querySelector('.world-canvas')?.dataset.currentRegion
    }));
    window.__recoveryQA.drop();
  });
  await g.page.waitForFunction(() => window.__recoveryEvents.length === 1, null, {
    timeout: 5000
  });
  await g.idle();
  const after = await g.shot('recovered-safe-floor');
  const samples = await g.page.evaluate(() => new Promise(resolve => {
    const samples = [],
      start = performance.now();
    function sample() {
      const s = window.__environmentQA.read();
      samples.push({
        time: performance.now(),
        position: s.playerMotion.position,
        grounded: s.playerMotion.grounded,
        interaction: s.interaction,
        events: window.__recoveryEvents.length
      });
      if (performance.now() - start < 1500) setTimeout(sample, 100);else resolve(samples);
    }
    sample();
  }));
  g.data.observations.push({
    samples
  });
  await g.verify('injected fault recovers ' + region, ['MOVEMENT.RECOVERY', 'DEV.RECOVERYQA'], async () => {
    assert.equal(after.region, region);
    assert(after.motion.grounded);
    assert(after.control.manualInputEnabled && !after.control.physicsLocked);
    assert.equal(after.control.pose, null);
    assert.equal(after.env.interaction.activeTargetId, null);
    assert.equal(await g.page.locator('.world-device-overlay').count(), 0);
    assert(samples.every(s => s.events === 1 && s.grounded && s.position.y > .8));
    const expected = region === 'HOUSE' ? 3.6 : region === 'DEV_FOUNDATION' ? 4.5 : 26;
    assert(Math.abs(after.motion.position.z - expected) < .1);
  }, {
    coverage: 'partial',
    scope: 'Controlled rigid-body fault via opt-in existing DEV hook; all3regions and active sit/PC recovery. Natural falls and exact repeated-fault cooldown not inferred.'
  });
  await g.key('d', 200);
  await g.settle();
  assert(Math.abs((await g.read()).motion.position.x - after.motion.position.x) > .4);
  await g.shot('movement-after-recovery');
}
export const faults = ['FIELD', 'HOUSE', 'DEV_FOUNDATION'].map(region => ({
  id: 'FAULT.RECOVERY.' + region,
  async run(g) {
    await recover(g, region);
  }
}));
