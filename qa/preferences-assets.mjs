import assert from 'node:assert/strict';
async function preferences(g) {
  await g.cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 2,
    mobile: false
  });
  g.data.observations.push({
    scope: 'Native browser DPR2 emulation; CSS viewport1280×720, not hardware certification'
  });
  await g.open();
  await g.ready();
  const settings = () => g.page.evaluate(() => {
    const gl = document.querySelector('canvas').__avatarQA.root.gl;
    return {
      pixelRatio: gl.getPixelRatio(),
      shadows: gl.shadowMap.enabled
    };
  });
  const balanced = await settings();
  assert.equal(balanced.pixelRatio, 2);
  assert(balanced.shadows);
  await g.menu();
  await g.click(g.page.getByLabel('Renderização leve'));
  await g.click(g.page.getByRole('button', {
    name: /Continuar explorando/
  }));
  await g.page.waitForFunction(() => document.querySelector('canvas').__avatarQA.root.gl.getPixelRatio() === 1);
  const low = await settings();
  await g.shot('DPR2-low-render');
  await g.verify('effective public quality setting', ['PREF.QUALITY'], async () => {
    assert.equal(low.pixelRatio, 1);
    assert.equal(low.shadows, false);
  }, {
    coverage: 'full',
    scope: 'Effective gl pixel ratio2→1 and shadows true→false, native public preference. Reload persistence tested separately.'
  });
  await g.menu();
  const slider = g.page.getByLabel('Sensibilidade do mouse');
  await slider.focus();
  await slider.press('Home');
  assert.equal(await slider.inputValue(), '0.0005');
  await slider.press('ArrowRight');
  assert.equal(await slider.inputValue(), '0.00075');
  await slider.press('End');
  assert.equal(await slider.inputValue(), '0.008');
  await slider.press('Home');
  for (let i = 0; i < 18; i++) await slider.press('ArrowRight');
  await g.click(g.page.getByLabel('Inverter eixo Y do mouse'));
  await g.click(g.page.getByRole('button', {
    name: /Continuar explorando/
  }));
  await g.page.mouse.move(640, 360);
  await g.key('c');
  await g.page.waitForTimeout(90);
  const before = await g.read();
  await g.page.mouse.move(680, 400);
  await g.page.waitForFunction(p => window.__environmentQA.read().perspective.pitch > p + .15, before.env.perspective.pitch);
  const after = await g.shot('calibrated-inverted-look');
  await g.verify('native sensitivity and inversion', ['PREF.SENSITIVITY', 'PREF.INVERTY'], async () => {
    assert(Math.abs(after.env.perspective.yaw - before.env.perspective.yaw - .2) < .025);
    assert(Math.abs(after.env.perspective.pitch - before.env.perspective.pitch - .2) < .025);
    const saved = JSON.parse(await g.page.evaluate(() => localStorage.getItem('matteo-world-preferences-v1')));
    assert.equal(saved.mouseSensitivity, .005);
    assert.equal(saved.invertMouseY, true);
  });
  await g.page.reload({
    waitUntil: 'domcontentloaded'
  });
  await g.ready();
  await g.menu();
  await g.verify('mouse preferences survive refresh', ['PREF.SENSITIVITY', 'PREF.INVERTY'], async () => {
    assert.equal(await slider.inputValue(), '0.005');
    assert(await g.page.getByLabel('Inverter eixo Y do mouse').isChecked());
  });
}
async function corruptStorage(g) {
  await g.context.addInitScript(() => {
    if (!sessionStorage.getItem('qa-corrupt-pref-seeded')) {
      localStorage.setItem('matteo-world-preferences-v1', '{');
      sessionStorage.setItem('qa-corrupt-pref-seeded', 'true');
    }
  });
  g.data.observations.push({
    scope: 'Explicit isolated malformed preference seed BEFORE app mount. No player/camera/store setter and no route proof.'
  });
  await g.page.emulateMedia({
    reducedMotion: 'reduce'
  });
  await g.open();
  assert.equal(await g.page.evaluate(() => localStorage.getItem('matteo-world-preferences-v1')), '{');
  await g.ready();
  await g.menu();
  await g.shot('corrupt-pref-safe-fallback');
  assert(await g.page.getByLabel('Movimento reduzido').isChecked());
  assert.equal(await g.page.getByLabel('Renderização leve').isChecked(), false);
  await g.click(g.page.getByLabel('Renderização leve'));
  await g.click(g.page.getByRole('button', {
    name: /Continuar explorando/
  }));
  await g.page.reload({
    waitUntil: 'domcontentloaded'
  });
  await g.ready();
  await g.menu();
  await g.shot('corrected-public-preference-reloaded');
  await g.verify('malformed storage fallback and public persistence', ['PREF.STORAGE'], async () => {
    const saved = JSON.parse(await g.page.evaluate(() => localStorage.getItem('matteo-world-preferences-v1')));
    assert.equal(saved.quality, 'low');
    assert.equal(saved.reducedMotion, true);
    assert(await g.page.getByLabel('Renderização leve').isChecked());
    assert((await g.read()).motion.grounded);
    assert.deepEqual(g.data.errors, []);
  });
}
async function optionalAsset(g, asset) {
  const pattern = asset === 'sky' ? '**/assets/sky/painted-cloud-panorama.webp' : '**/assets/characters/matteo-chibi-v3.glb';
  await g.page.route(pattern, r => r.abort('failed'));
  g.data.observations.push({
    scope: 'Explicit asset network failure, expected errors recorded; not a natural product failure',
    pattern
  });
  await g.open();
  await g.ready();
  const name = asset === 'sky' ? 'FIELD_PROCEDURAL_SKY_FALLBACK' : 'DEV_MATTEO_ASSET_FALLBACK';
  await g.page.waitForFunction(name => !!window.__environmentQA.inspect(name), name);
  const before = await g.read();
  await g.key('w', 350);
  await g.settle();
  const after = await g.shot('optional-' + asset + '-fallback-walk');
  await g.verify('optional ' + asset + ' fallback stays playable', ['UI.ASSETFAIL'], async () => {
    assert(await g.page.evaluate(name => !!window.__environmentQA.inspect(name), name));
    assert(after.motion.grounded);
    assert(Math.hypot(after.motion.position.x - before.motion.position.x, after.motion.position.z - before.motion.position.z) > .8);
    assert.equal(await g.page.locator('.world-unavailable').count(), 0);
  }, {
    coverage: 'partial',
    scope: 'Optional ' + asset + ' only, complements mandatory GLB public Retry proof'
  });
}
async function sidebarKeyboard(g) {
  await g.open('/arquivo');
  for (const name of ['Projetos', 'Faculdade', 'Notas', 'Terminal', 'Matteo', 'Contato']) {
    let found = false;
    for (let i = 0; i < 35; i++) {
      await g.key('Tab');
      if (await g.page.evaluate(name => document.activeElement.matches('.file-sidebar button') && document.activeElement.getAttribute('aria-label') === name, name)) {
        found = true;
        break;
      }
    }
    assert(found, 'Reach sidebar ' + name + ' with native Tab');
    await g.key('Enter');
    await g.shot('keyboard-app-' + name);
    await g.verify('native sidebar keyboard ' + name, ['A11Y.PC.SIDEBAR'], async () => assert.equal(await g.page.locator('.desktop-window').getAttribute('aria-label'), name), {
      coverage: 'partial',
      scope: 'Native Tab/Enter on all6apps, complements AX/touch D06 fixture'
    });
  }
}
async function touchResize(g) {
  await g.open();
  await g.ready();
  const before = await g.read();
  for (const width of [320, 390, 768]) {
    await g.page.setViewportSize({
      width,
      height: 844
    });
    await g.page.locator('.touch-joystick-pad').waitFor({
      state: 'visible'
    });
    await g.shot('native-touch-resize-' + width);
    await g.verify('touch HUD resize ' + width, ['TOUCH.RESIZE'], async () => {
      assert(await g.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      for (const selector of ['.touch-joystick-pad', '.camera-mode-control', '.world-menu-access']) {
        const b = await g.page.locator(selector).boundingBox();
        assert(b && b.x >= 0 && b.x + b.width <= width + .1 && b.y >= 0 && b.y + b.height <= 844 + .1);
      }
      const after = await g.read();
      assert(Math.hypot(after.motion.position.x - before.motion.position.x, after.motion.position.z - before.motion.position.z) < .01);
      assert(after.motion.grounded);
    });
  }
}
export const preferencesAssets = [{
  id: 'TOUCH.NATIVE.RESIZE',
  touch: true,
  run: touchResize
}, {
  id: 'PREF.RENDER.SENSITIVITY.INVERT',
  run: preferences
}, {
  id: 'FAULT.STORAGE.MALFORMED',
  run: corruptStorage
}, {
  id: 'ASSET.OPTIONAL.SKY',
  run: g => optionalAsset(g, 'sky')
}, {
  id: 'ASSET.OPTIONAL.AVATAR',
  run: g => optionalAsset(g, 'avatar')
}, {
  id: 'CONTRACT.SIDEBAR.KEYBOARD',
  run: sidebarKeyboard
}];
