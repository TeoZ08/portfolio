import assert from 'node:assert/strict';
async function extremes(g, location, ceiling) {
  for (const mode of ['third-person-back', 'third-person-front', 'first-person']) {
    await g.mode(mode);
    await g.key('c');
    await g.page.waitForFunction(() => Math.abs(window.__environmentQA.read().perspective.pitch + .16) < .001);
    await g.page.locator('canvas').click({
      position: {
        x: 640,
        y: 340
      }
    });
    for (const y of [4000, -4000]) {
      await g.page.mouse.move(640, y);
      await g.page.waitForFunction(() => Math.abs(window.__environmentQA.read().perspective.pitch) > 1.4);
      const s = await g.shot(location + '-' + mode + '-' + (y > 0 ? 'down' : 'up'));
      await g.verify(location + ' ' + mode + ' pitch', ['CAMERA.PITCH', 'CAMERA.RETRACT'], async () => {
        assert(Math.abs(s.env.perspective.pitch) <= 85 * Math.PI / 180 + .001);
        assert(s.env.camera.every(Number.isFinite));
        assert(s.motion.grounded);
        if (ceiling !== undefined) {
          assert.equal(s.region, 'HOUSE', 'Ceiling comparison requires actual House region');
          assert(s.env.camera[1] < ceiling, 'Camera remains below shared House ceiling');
        }
      }, {
        coverage: 'partial',
        scope: 'Low-quality camera extrema at real reachable points; roof appearance requires visual review'
      });
    }
    await g.key('c');
    await g.page.waitForFunction(() => Math.abs(window.__environmentQA.read().perspective.pitch + .16) < .001);
    await g.shot(location + '-' + mode + '-recentered');
  }
}
export const interiors = [{
  id: 'INTERIOR.CAMERA.LOW',
  quality: 'low',
  async run(g) {
    await g.open();
    await g.ready();
    await g.house();
    await g.go(0, 0, 'house-center');
    await extremes(g, 'house-center', 3.24);
    await g.go(0, 3.5, 'house-front');
    await g.go(4.6, 3.5, 'house-east-corner');
    await extremes(g, 'house-east-corner', 3.24);
    await g.go(0, 3.5, 'house-corner-return');
    await g.go(-4.6, 3.5, 'house-west-corner');
    await extremes(g, 'house-west-corner', 3.24);
    await g.map('Dojang');
    await extremes(g, 'songahm-roof');
    const errors = g.data.errors.filter(e => e.kind === 'pageerror');
    assert.deepEqual(errors, []);
  }
}];
