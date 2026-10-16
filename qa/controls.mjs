import assert from 'node:assert/strict';
const modes = ['third-person-back', 'third-person-front', 'first-person'];
async function desktop(g, mode) {
  await g.open();
  await g.ready();
  await g.mode(mode);
  const page = g.page;
  await g.shot('start');
  for (const [k, axis, sign, id] of [['w', 'z', -1, 'MOVEMENT.WASD'], ['s', 'z', 1, 'MOVEMENT.BACKWARD'], ['a', 'x', -1, 'MOVEMENT.WASD'], ['d', 'x', 1, 'MOVEMENT.WASD'], ['ArrowUp', 'z', -1, 'MOVEMENT.ARROWS'], ['ArrowDown', 'z', 1, 'MOVEMENT.ARROWS'], ['ArrowLeft', 'x', -1, 'MOVEMENT.ARROWS'], ['ArrowRight', 'x', 1, 'MOVEMENT.ARROWS']]) {
    const before = await g.read();
    await g.key(k, 260);
    await g.settle();
    const after = await g.shot(k);
    await g.verify('native ' + k, [id], () => assert((after.motion.position[axis] - before.motion.position[axis]) * sign > .25), {
      scope: 'Flat arrival area, actualnative input; instantaneous speed separately'
    });
  }
  for (const side of ['a', 'd']) {
    await page.keyboard.down('w');
    await page.keyboard.down(side);
    await page.waitForFunction(() => {
      const m = window.__environmentQA.read().playerMotion;
      return m.grounded && Math.hypot(m.velocity.x, m.velocity.z) > 3.4;
    });
    const diagonal = await g.read();
    await page.keyboard.up('w');
    await page.keyboard.up(side);
    await g.settle();
    await g.shot('diagonal-' + side);
    await g.verify('diagonal norm ' + side, ['MOVEMENT.DIAGONAL'], () => assert(Math.hypot(diagonal.motion.velocity.x, diagonal.motion.velocity.z) < 3.8));
  }
  await page.keyboard.down('Shift');
  await page.keyboard.down('w');
  await page.waitForFunction(() => {
    const m = window.__environmentQA.read().playerMotion;
    return m.sprinting && Math.hypot(m.velocity.x, m.velocity.z) > 6;
  });
  const sprint = await g.read();
  await page.keyboard.up('w');
  await page.keyboard.up('Shift');
  await g.settle();
  await g.shot('sprint');
  await g.verify('sprint speed', ['MOVEMENT.SPRINT'], () => {
    assert(sprint.motion.sprinting);
    assert(Math.hypot(sprint.motion.velocity.x, sprint.motion.velocity.z) < 6.4);
  });
  const beforeJump = await g.read();
  await g.key('Space');
  // Save the physical state in the same poll that observes takeoff. A slow
  // screenshot can finish after this short jump has already landed.
  const takeoff = await page.waitForFunction(() => {
    const motion = window.__environmentQA.read().playerMotion;
    return motion.airborne ? { time: performance.now(), motion: JSON.parse(JSON.stringify(motion)) } : null;
  });
  const jump = await takeoff.jsonValue();
  await takeoff.dispose();
  g.data.observations.push({ label: 'Native takeoff before screenshot', ...jump });
  await g.shot('jump');
  await g.verify('jump', ['MOVEMENT.JUMP'], () => {
    assert(jump.motion.airborne);
    assert(jump.motion.position.y > beforeJump.motion.position.y + .05);
  });
  await g.settle();
  await page.keyboard.down('Shift');
  await page.keyboard.down('w');
  await page.waitForFunction(() => window.__environmentQA.read().playerMotion.sprinting);
  await g.key('Space');
  await page.waitForFunction(() => {
    const m = window.__environmentQA.read().playerMotion;
    return m.airborne && Math.hypot(m.velocity.x, m.velocity.z) > 7;
  });
  const dash = await g.read();
  g.data.observations.push({
    dash
  });
  await page.keyboard.up('w');
  await page.keyboard.up('Shift');
  await g.shot('dash');
  await g.verify('dash cap', ['MOVEMENT.DASH'], () => assert(Math.hypot(dash.motion.velocity.x, dash.motion.velocity.z) <= 9.3));
  await g.settle();
  // Set pointer coordinates before recentering so the baseline is a settled frame.
  await page.locator('canvas').click({
    position: {
      x: 640,
      y: 340
    }
  });
  await page.mouse.move(640, 360);
  await g.key('c');
  await page.waitForTimeout(90);
  const beforeLook = await g.read();
  await page.mouse.move(700, 400);
  await page.waitForFunction(y => Math.abs(window.__environmentQA.read().perspective.yaw - y) > .1, beforeLook.env.perspective.yaw);
  const look = await g.shot('look');
  await g.verify('mouse look', ['CAMERA.LOOK'], () => {
    assert(Math.abs(look.env.perspective.yaw - beforeLook.env.perspective.yaw - .15) < .025);
    assert(Math.abs(look.env.perspective.pitch - beforeLook.env.perspective.pitch + .1) < .025);
  });
  await g.key('c');
  await page.waitForTimeout(90);
  const centered = await g.shot('recenter');
  await g.verify('recenter', ['CAMERA.RECENTER'], () => {
    assert(Math.abs(centered.env.perspective.pitch + .16) < .001);
    assert.equal(centered.env.perspective.selected, mode);
  });
  if (mode === 'first-person') {
    const materials = await page.evaluate(() => {
      const root = document.querySelector('canvas').__avatarQA.root.scene.getObjectByName('MATTEO_AVATAR_CHIBI_V3'),
        rows = [];
      root.traverse(o => {
        if (o.isMesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) rows.push({
          name: o.name,
          colorWrite: m.colorWrite,
          depthWrite: m.depthWrite,
          castShadow: o.castShadow
        });
      });
      return rows;
    });
    g.data.observations.push({
      materials
    });
    await g.verify('firstperson body visibility', ['CAMERA.AVATAR'], () => {
      assert(materials.length > 0);
      assert(materials.every(m => m.colorWrite === false && m.depthWrite === false));
      assert(materials.some(m => m.castShadow));
    }, {
      coverage: 'partial',
      scope: 'Firstperson realruntime materials andshadowflag; distance<.65 cases/castsupportnotallverified'
    });
  }
  const wheelBefore = await g.read();
  await page.mouse.wheel(0, 160);
  await page.waitForTimeout(120);
  const wheel = await g.shot('wheel');
  await g.verify('wheel zoom', ['CAMERA.WHEEL'], () => {
    if (mode === 'first-person') assert.equal(wheel.env.perspective.distance, 0);else assert(wheel.env.perspective.safeDistance > wheelBefore.env.perspective.safeDistance);
  });
  const fineBefore = await g.read();
  await page.mouse.wheel(6, 3);
  await page.waitForFunction(y => Math.abs(window.__environmentQA.read().perspective.yaw - y) > .005, fineBefore.env.perspective.yaw);
  const fine = await g.shot('fine-wheel');
  await g.verify('fine wheel look', ['CAMERA.TRACKPAD'], () => assert(Math.abs(fine.env.perspective.yaw - fineBefore.env.perspective.yaw) > .005), {
    coverage: 'partial',
    scope: 'Fine Wheel native event; hardware trackpad not certified'
  });
  const initial = (await g.read()).env.perspective.selected;
  const cycle = [];
  for (let i = 0; i < 3; i++) {
    await g.key('F5');
    const expected = modes[(modes.indexOf(initial) + i + 1) % 3];
    await page.waitForFunction(m => window.__environmentQA.read().perspective.selected === m, expected);
    cycle.push((await g.read()).env.perspective.selected);
  }
  await g.verify('F5 three modes', ['CAMERA.MODE'], () => assert.deepEqual(cycle, [modes[(modes.indexOf(initial) + 1) % 3], modes[(modes.indexOf(initial) + 2) % 3], initial]));
  await page.keyboard.down('F5');
  for (let i = 0; i < 4; i++) await page.keyboard.down('F5');
  await page.keyboard.up('F5');
  await page.waitForFunction(m => window.__environmentQA.read().perspective.selected === m, modes[(modes.indexOf(initial) + 1) % 3]);
  await g.verify('held F5', ['CAMERA.MODEHOLD'], async () => assert.equal((await g.read()).env.perspective.selected, modes[(modes.indexOf(initial) + 1) % 3]));
  await g.key('Space');
  await page.waitForFunction(() => window.__environmentQA.read().playerMotion.airborne);
  await g.menu();
  const paused = await g.shot('pause-air');
  await page.waitForFunction(() => window.__environmentQA.read().playerMotion.grounded);
  await g.verify('air pause', ['MOVEMENT.PAUSEAIR', 'UI.PAUSE'], () => assert(paused.motion.airborne));
  const blockedMode = (await g.read()).env.perspective.selected;
  await g.key('F5');
  await g.verify('F5 in menu', ['CAMERA.MODEBLOCK'], async () => assert.equal((await g.read()).env.perspective.selected, blockedMode), {
    coverage: 'partial',
    scope: 'Menu overlay; input/button/link contexts separatePC tests'
  });
  await g.click(page.getByRole('button', {
    name: /Continuar explorando/
  }));
  await g.key('w', 200);
  await g.settle();
  await g.shot('resumed');
  await g.verify('resume', ['UI.RESUME', 'CAMERA.LOCKRESUME', 'MOVEMENT.STOP'], async () => {
    const s = await g.read();
    assert(s.motion.grounded);
    assert(Math.hypot(s.motion.velocity.x, s.motion.velocity.z) < .04);
    assert(s.env.perspective.locked);
  });
  await g.mode(mode);
  await g.map('Mirante');
  await g.interact();
  await g.status('sitting');
  const sitting = await g.shot('sitting');
  await g.verify('pose', ['CAMERA.POSE'], () => assert(sitting.control.physicsLocked), {
    coverage: 'partial',
    scope: 'Mirante pose locksbody; eye/head comparison separatemanual/visual'
  });
  await g.key('F5');
  await g.key('Escape');
  await g.idle();
  await g.map('Galeria · UnAPI');
  await g.near('COMMUNITY_WORKSHOP');
  await g.interact();
  await g.status('approaching');
  await g.key('F5');
  await g.shot('F5-approaching');
  await g.key('Escape');
  await g.idle();
  await g.interact();
  await g.status('using');
  const usingBefore = await g.read();
  await g.key('F5');
  const usingAfter = await g.shot('F5-using');
  await g.verify('F5 panel blocked', ['CAMERA.MODEBLOCK'], () => assert.equal(usingAfter.env.perspective.selected, usingBefore.env.perspective.selected), {
    coverage: 'partial',
    scope: 'using panel; not allfocusableHTMLcontexts'
  });
  await g.key('Escape');
  await g.idle();
}
async function touch(g, mode) {
  await g.open();
  await g.ready();
  await g.mode(mode);
  const p = g.page,
    cdp = g.cdp,
    point = (id, x, y) => ({
      id,
      x,
      y,
      radiusX: 5,
      radiusY: 5,
      force: 1
    });
  const send = async (type, points) => {
    g.data.inputs.push({
      nativeTouch: type,
      points
    });
    await cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: points
    });
  };
  const box = await p.locator('.touch-joystick-pad').boundingBox(),
    x = box.x + box.width / 2,
    y = box.y + box.height / 2,
    r = box.width * .31;
  const initial = await g.read();
  await send('touchStart', [point(1, x, y)]);
  await send('touchMove', [point(1, x, y - r * .98)]);
  await send('touchStart', [point(1, x, y - r * .98), point(2, 275, 360)]);
  await send('touchMove', [point(1, x, y - r * .98), point(2, 305, 380)]);
  await p.waitForFunction(v => {
    const s = window.__environmentQA.read();
    return s.playerMotion.moving && s.playerMotion.sprinting && Math.abs(s.perspective.yaw - v) > .05;
  }, initial.env.perspective.yaw);
  const coupled = await g.shot('two-contacts');
  await g.verify('touch simultaneous', ['TOUCH.JOYSTICK', 'TOUCH.MULTI', 'TOUCH.LOOK'], () => {
    assert(coupled.motion.moving && coupled.motion.sprinting);
    assert(Math.abs(coupled.env.perspective.yaw - initial.env.perspective.yaw) > .05);
  });
  const jump = await p.locator('.touch-jump').boundingBox();
  await send('touchStart', [point(1, x, y - r * .98), point(2, 305, 380), point(3, jump.x + jump.width / 2, jump.y + jump.height / 2)]);
  await p.waitForFunction(() => window.__environmentQA.read().playerMotion.airborne);
  const air = await g.shot('three-contacts-jump');
  await g.verify('native touch jump', ['TOUCH.JUMP'], () => assert(air.motion.airborne));
  await send('touchCancel', []);
  await g.settle();
  const released = await g.shot('cancelled');
  await g.verify('native touchCancel', ['TOUCH.CANCEL'], () => assert(Math.hypot(released.motion.velocity.x, released.motion.velocity.z) < .04));
  const zoomBefore = await g.read();
  await send('touchStart', [point(11, 210, 330), point(12, 340, 330)]);
  await send('touchMove', [point(11, 190, 330), point(12, 360, 330)]);
  await send('touchEnd', []);
  await p.waitForTimeout(150);
  const pinch = await g.shot('pinch');
  await g.verify('pinch', ['TOUCH.PINCH'], () => {
    if (mode === 'first-person') assert.equal(pinch.env.perspective.distance, 0);else assert(pinch.env.perspective.safeDistance < zoomBefore.env.perspective.safeDistance);
  });
  await p.touchscreen.tap(280, 430);
  await p.touchscreen.tap(280, 430);
  await g.shot('double-tap');
  await g.verify('tap/double', ['TOUCH.TAP', 'TOUCH.DOUBLE'], async () => {
    assert.equal((await g.read()).env.perspective.locked, false);
    assert.equal(await p.evaluate(() => visualViewport.scale), 1);
  });
  const cycle = [];
  for (let i = 0; i < 3; i++) {
    await g.click(p.locator('.camera-mode-control'));
    const expected = modes[(modes.indexOf(mode) + i + 1) % 3];
    await p.waitForFunction(m => window.__environmentQA.read().perspective.selected === m, expected);
    cycle.push((await g.read()).env.perspective.selected);
  }
  await g.verify('touch camera button', ['TOUCH.CAMERA'], () => assert.equal(cycle.at(-1), mode));
  await g.map('Mirante');
  await g.interact();
  await g.status('sitting');
  await g.shot('touch-sit');
  await g.leave('HILL_BENCH');
  await g.verify('touchCTA sit/stand', ['TOUCH.CTA'], async () => assert.equal((await g.read()).control.physicsLocked, false));
  await g.map('Casa');
  await g.interact();
  await g.idle();
  const beforeExit = await g.read();
  await g.stick('s', 1250);
  await g.page.waitForFunction(() => document.querySelector('.world-canvas')?.dataset.currentRegion === 'FIELD');
  await g.idle();
  const exit = await g.shot('backward-house-exit');
  await g.verify('house backward exit', ['MOVEMENT.AUTOEXIT'], () => {
    assert.equal(beforeExit.region, 'HOUSE');
    assert.equal(exit.region, 'FIELD');
    assert(exit.motion.grounded);
  });
}
export const controls = [];
for (const quality of ['balanced', 'low']) for (const mode of modes) {
  controls.push({
    id: 'CONTROLS.' + quality + '.' + mode,
    quality,
    contracts: [],
    run: async g => {
      await desktop(g, mode);
      await g.verify('natural console/network clean', [], () => assert.deepEqual(g.data.errors, []));
    }
  });
  controls.push({
    id: 'TOUCH.' + quality + '.' + mode,
    quality,
    touch: true,
    contracts: [],
    run: async g => {
      await touch(g, mode);
      await g.verify('natural console/network clean', [], () => assert.deepEqual(g.data.errors, []));
    }
  });
}
