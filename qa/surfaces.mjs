import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { baseURL } from './lib/gameplay.mjs';
async function smoke(g) {
  await g.open();
  const enter = g.page.getByRole('button', {
    name: /Entrar e explorar/
  });
  await enter.waitFor();
  await g.page.waitForFunction(() => !document.querySelector('.arrival-dialog button')?.disabled);
  await g.shot('arrival-ready');
  await g.verify('arrival ready and focused', ['UI.READY'], async () => {
    assert.equal(await enter.isDisabled(), false);
    assert.equal(await enter.evaluate(e => e === document.activeElement), true);
  });
  await g.click(enter);
  await g.settle();
  await g.page.waitForFunction(() => !!document.pointerLockElement);
  await g.shot('native-entry-capture');
  await g.verify('arrival persists and captures', ['UI.ARRIVAL', 'CAMERA.LOCKENTRY'], async () => {
    assert.equal(await g.page.locator('.arrival-dialog').evaluate(e => e.open), false);
    assert.equal(JSON.parse(await g.page.evaluate(() => localStorage.getItem('matteo-world-preferences-v1'))).welcomed, true);
    assert.equal(await g.page.evaluate(() => document.pointerLockElement?.tagName), 'CANVAS');
  });
  await g.menu();
  await g.verify('menu releases pointer', ['CAMERA.RELEASE'], async () => assert.equal(await g.page.evaluate(() => document.pointerLockElement), null), {
    coverage: 'partial',
    scope: 'Native menu release; OS blur separate manual case'
  });
  await g.click(g.page.getByRole('button', {
    name: /Abrir o mapa/
  }));
  await g.shot('map-open');
  assert.equal(await g.page.locator('.pause-map-toggle').first().getAttribute('aria-expanded'), 'true');
  await g.click(g.page.getByRole('button', {
    name: 'Guardar o mapa'
  }));
  await g.verify('map opens and hides', ['UI.MAPOPEN'], async () => assert.equal(await g.page.locator('.pause-map-toggle').first().getAttribute('aria-expanded'), 'false'));
  await g.click(g.page.getByRole('button', {
    name: /Rever a chegada/
  }));
  await g.shot('arrival-revisited');
  await g.verify('revisit', ['UI.REVISIT'], async () => assert(await enter.isVisible()));
  await g.key('Escape');
  await g.shot('arrival-escape');
  await g.verify('arrival escape without capture', ['UI.ARRIVALESC'], async () => {
    assert.equal(await g.page.locator('.arrival-dialog').evaluate(e => e.open), false);
    assert.equal(await g.page.evaluate(() => document.pointerLockElement), null);
  });
  await g.click(g.page.getByRole('button', {
    name: /Clique para controlar o olhar/
  }));
  await g.page.waitForFunction(() => !!document.pointerLockElement);
  await g.verify('manual capture', ['CAMERA.LOCKMANUAL'], async () => assert.equal(await g.page.evaluate(() => document.pointerLockElement?.tagName), 'CANVAS'));
  await g.menu();
  const range = g.page.getByLabel('Sensibilidade do mouse');
  await g.click(range);
  await range.press('Home');
  await range.press('ArrowRight');
  assert.equal(await range.inputValue(), '0.00075');
  await g.click(g.page.getByLabel('Inverter eixo Y do mouse'));
  await g.click(g.page.getByLabel('Mira na primeira pessoa'));
  await g.click(g.page.getByLabel('Movimento reduzido'));
  await g.click(g.page.getByLabel('Renderização leve'));
  await g.click(g.page.getByLabel('Sons do ambiente'));
  await g.page.waitForFunction(() => !document.querySelector('.pause-menu input[type=checkbox]:disabled'));
  await g.shot('preferences-changed');
  await g.verify('public preferences persisted', ['PREF.SENSITIVITY', 'PREF.INVERTY', 'PREF.AIM', 'PREF.MOTION', 'PREF.QUALITY'], async () => {
    const s = JSON.parse(await g.page.evaluate(() => localStorage.getItem('matteo-world-preferences-v1')));
    assert.equal(s.mouseSensitivity, .00075);
    assert.equal(s.invertMouseY, true);
    assert.equal(s.crosshair, true);
    assert.equal(s.reducedMotion, true);
    assert.equal(s.quality, 'low');
  }, {
    coverage: 'partial',
    scope: 'Public preference values and storage; exact look inversion calibration is a separate check'
  });
  await g.verify('sound enabled technically', ['PREF.SOUND'], async () => {
    assert(await g.page.getByLabel('Sons do ambiente').isChecked());
    assert.equal(JSON.parse(await g.page.evaluate(() => localStorage.getItem('matteo-world-preferences-v1'))).ambientSound, undefined);
  }, {
    coverage: 'partial',
    scope: 'Gesture-enabled UI; human audibility not certified'
  });
  await g.click(g.page.getByRole('button', {
    name: /Continuar explorando/
  }));
  await g.mode('first-person');
  await g.page.locator('.camera-crosshair').waitFor();
  await g.shot('first-person-crosshair');
  await g.verify('conditional crosshair', ['CAMERA.CROSSHAIR'], async () => {
    assert(await g.page.locator('.camera-crosshair').isVisible());
    await g.mode('third-person-back');
    assert.equal(await g.page.locator('.camera-crosshair').count(), 0);
  });
  await g.page.reload({
    waitUntil: 'domcontentloaded'
  });
  await g.ready();
  await g.shot('reload');
  await g.verify('reload resets world and preserves preferences', ['UI.RELOAD'], async () => {
    const s = await g.read();
    assert.equal(s.region, 'FIELD');
    assert(Math.abs(s.motion.position.z - 26) < .1);
    assert.equal(s.env.perspective.selected, 'third-person-back');
    assert.equal(await g.page.evaluate(() => document.pointerLockElement), null);
    assert.equal(await g.page.locator('.arrival-dialog').evaluate(e => e.open), false);
  });
  await g.menu();
  assert.equal(await range.inputValue(), '0.00075');
  assert(await g.page.getByLabel('Inverter eixo Y do mouse').isChecked());
  assert.equal(await g.page.getByLabel('Sons do ambiente').isChecked(), false);
  await g.click(g.page.getByRole('button', {
    name: /Continuar explorando/
  }));
  for (const width of [320, 390, 768]) {
    await g.page.setViewportSize({
      width,
      height: 844
    });
    await g.shot('resize-' + width);
    await g.verify('resize ' + width, ['TOUCH.RESIZE'], async () => {
      assert(await g.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert(await g.page.locator('.camera-mode-control').isVisible());
    }, {
      coverage: 'partial',
      scope: 'Desktop viewport responsiveness, physical phone and native touch profile tested separately'
    });
  }
}
async function html(g) {
  for (const [url, code] of [['/arquivo', 200], ['/perfil', 200], ['/projetos', 200], ['/projetos/portal-unapi', 200], ['/projetos/portfolio-world', 200], ['/projetos/jarvis-academico', 200], ['/projetos/inexistente', 404]]) {
    const response = await g.page.goto(baseURL + url, {
      waitUntil: 'domcontentloaded'
    });
    const id = 'URL.' + url.replaceAll('/', '_');
    if (url === '/arquivo' || url === '/projetos') await g.page.waitForFunction(() => /^\d{2}:\d{2}$/.test(document.querySelector('.desktop time')?.textContent || ''));
    if (url.startsWith('/projetos/') && code === 200) {
      await g.page.locator('h1').waitFor();
      const images = g.page.locator('img');
      for (let i = 0; i < (await images.count()); i++) {
        await images.nth(i).scrollIntoViewIfNeeded();
        await images.nth(i).evaluate(e => e.decode());
      }
    }
    await g.shot(id);
    await g.verify('HTML ' + url, [id], async () => {
      assert.equal(response.status(), code);
      if (url === '/projetos') assert(g.page.url().endsWith('/arquivo'));
    });
    if (url === '/perfil') {
      await g.verify('profile archive link', ['HTML.PROFILE.BACK'], async () => assert.equal(await g.page.getByRole('link', {
        name: /Arquivo pessoal/
      }).getAttribute('href'), '/arquivo'));
    }
    if (url === '/projetos/jarvis-academico') {
      await g.verify('Jarvis real article images', ['MEDIA.PROJECT.jarvis-academico.1', 'MEDIA.PROJECT.jarvis-academico.2', 'MEDIA.PROJECT.jarvis-academico.3'], async () => {
        assert.equal(await g.page.locator('.project-gallery img').count(), 3);
        assert(await g.page.locator('.project-gallery img').evaluateAll(es => es.every(e => e.complete && e.naturalWidth > 0 && e.alt.length > 0)));
      });
    }
  }
}
async function assetRetry(g) {
  const pattern = '**/assets/songahm/main-house.glb';
  await g.page.route(pattern, route => route.abort('failed'));
  await g.open('/?avatarQA');
  const retry = g.page.getByRole('button', {
    name: /Tentar abrir o mundo novamente/
  });
  await retry.waitFor({
    timeout: 60000
  });
  await g.shot('mandatory-asset-failure');
  await g.verify('mandatory asset has HTML fallback', ['UI.ASSETFAIL'], async () => {
    assert(await retry.isVisible());
    assert(await g.page.getByRole('navigation', {
      name: 'Portfólio sem 3D'
    }).isVisible());
    assert.equal(await g.page.getByRole('link', {
      name: /Ver projetos/
    }).getAttribute('href'), '/projetos');
  }, {
    coverage: 'partial',
    scope: 'Injected required Songahm GLB failure; sky/avatar variants separate'
  });
  await g.page.unroute(pattern);
  await g.click(retry);
  await g.ready();
  await g.shot('retry-restored');
  await g.verify('public retry restores real world', ['UI.ASSETFAIL'], async () => {
    assert.equal((await g.read()).region, 'FIELD');
    assert((await g.read()).motion.grounded);
  }, {
    coverage: 'partial',
    scope: 'Network fixture removed; public reload recovery, no store writes'
  });
}
async function pointerDenied(g) {
  await g.page.route(baseURL + '/qa-sandbox-host', route => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><title>Native sandbox fixture</title>'
  }));
  await g.page.goto(baseURL + '/qa-sandbox-host');
  await g.page.setContent('<iframe sandbox="allow-scripts allow-same-origin" src="' + baseURL + '/?avatarQA" style="width:1260px;height:700px;border:0"></iframe>');
  const frame = g.page.frameLocator('iframe');
  const enter = frame.getByRole('button', {
    name: /Entrar e explorar/
  });
  await enter.click({
    timeout: 60000
  });
  const child = g.page.frames().find(f => f.url().includes('/?avatarQA'));
  await child.waitForFunction(() => document.querySelector('.mouse-control-status')?.dataset.pointerStatus === 'denied');
  const before = await child.evaluate(() => window.__environmentQA.read());
  const box = await frame.locator('canvas').boundingBox();
  await g.page.mouse.move(box.x + 500, box.y + 330);
  await g.page.mouse.down();
  await g.page.mouse.move(box.x + 565, box.y + 310);
  await g.page.mouse.up();
  await child.waitForFunction(yaw => Math.abs(window.__environmentQA.read().perspective.yaw - yaw) > .1, before.perspective.yaw);
  const after = await child.evaluate(() => window.__environmentQA.read());
  g.data.observations.push({
    scope: 'Native sandbox denies pointer lock; mouse drag fallback',
    before,
    after
  });
  await g.shot('native-permission-denial-drag');
  await g.verify('native denial feedback and drag', ['CAMERA.LOCKDENIED', 'CAMERA.DRAG'], async () => {
    assert.equal(await child.evaluate(() => document.pointerLockElement), null);
    assert(await frame.getByRole('button', {
      name: /Captura não permitida/
    }).isVisible());
    assert(Math.abs(after.perspective.yaw - before.perspective.yaw - .1625) < .025);
  });
}
async function dev(g) {
  await g.open('/dev/playground');
  await g.ready();
  for (const [id, x, z, status] of [['CHAIR', 3, 4, 'sitting'], ['CONSOLE', 1.8, 1.4, 'using']]) {
    if (id === 'CONSOLE') {
      await g.go(4.2, 3.5, 'DEV-chair-contour');
      await g.go(4.2, .6, 'DEV-console-east');
      await g.go(1.8, .6, 'DEV-console-south');
    }
    await g.go(x, z, 'DEV-' + id);
    await g.interact();
    await g.status(status);
    await g.shot('DEV-' + id);
    await g.verify('DEV fixture ' + id, ['DEV.' + id], async () => {
      const s = await g.read();
      assert(s.motion.grounded);
      assert.equal(s.control.manualInputEnabled, false);
      if (id === 'CHAIR') assert(s.control.physicsLocked);
    });
    await g.key('Escape');
    await g.idle();
    await g.key('d', 150);
    assert((await g.read()).control.manualInputEnabled);
  }
}
async function systemMotion(g) {
  await g.page.emulateMedia({
    reducedMotion: 'reduce'
  });
  await g.open('/arquivo');
  await g.click(g.page.locator('.desktop-status button'));
  await g.shot('system-reduced-motion');
  await g.verify('native emulated media preference', ['PREF.SYSTEMMOTION'], async () => {
    assert(await g.page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
    assert(await g.page.locator('.desktop').getByLabel('Movimento reduzido').isChecked());
  });
  await g.click(g.page.getByRole('button', {
    name: 'Minimizar janela'
  }));
  await g.click(g.page.getByRole('button', {
    name: /Abrir os projetos/
  }));
  const timing = await g.page.locator('.desktop-window').evaluate(e => ({
    duration: getComputedStyle(e).animationDuration,
    animations: e.getAnimations().map(a => a.effect.getTiming())
  }));
  g.data.observations.push({
    timing,
    scope: 'Browser media emulation, not physical OS configuration'
  });
  await g.shot('system-reduced-animation');
  assert(timing.duration.split(',').every(value => parseFloat(value) <= .05));
}
async function noWebGL(g) {
  const browser = await chromium.launch({
    channel: process.env.QA_CHROME ? undefined : 'chrome',
    executablePath: process.env.QA_CHROME,
    headless: true,
    args: ['--disable-webgl']
  });
  const page = await browser.newPage();
  try {
    await page.goto(baseURL + '/', {
      waitUntil: 'domcontentloaded'
    });
    await page.getByRole('navigation', {
      name: 'Portfólio sem 3D'
    }).waitFor();
    const screenshot = 'SCREENSHOTS/' + g.name + '-native-webgl-disabled.png';
    await page.screenshot({
      path: g.out + '/' + screenshot
    });
    g.data.observations.push({
      screenshot,
      body: await page.locator('body').innerText(),
      scope: 'Separate actual Chrome launched --disable-webgl; no getContext stub'
    });
    await g.verify('native WebGL disabled fallback', ['UI.WEBGL'], async () => {
      assert.equal(await page.evaluate(() => document.createElement('canvas').getContext('webgl2')), null);
      assert.equal(await page.locator('canvas').count(), 0);
      await page.getByRole('link', {
        name: /Ver projetos/
      }).click();
      await page.waitForURL('**/arquivo');
      await page.locator('.file-sidebar button').first().waitFor();
      assert.equal(await page.locator('.project-file-row').count(), 3);
    });
  } finally {
    await browser.close();
  }
}
export const surfaces = [{
  id: 'SURFACE.SYSTEM.MOTION',
  run: systemMotion
}, {
  id: 'RESILIENCE.NATIVE.NO_WEBGL',
  run: noWebGL
}, {
  id: 'SURFACE.SMOKE.PREFS',
  run: smoke
}, {
  id: 'SURFACE.HTML',
  run: html
}, {
  id: 'RESILIENCE.ASSET.RETRY',
  run: assetRetry
}, {
  id: 'RESILIENCE.POINTER.DENIAL',
  run: pointerDenied
}, {
  id: 'DEV.REAL.TARGETS',
  run: dev
}];
