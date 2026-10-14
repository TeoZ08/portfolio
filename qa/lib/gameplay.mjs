import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
export const world = JSON.parse(readFileSync(new URL('../fixtures/world-model.json', import.meta.url)));
export const baseURL = process.env.QA_BASE_URL || 'http://localhost:3154';
export async function launch() {
  return chromium.launch({
    channel: process.env.QA_CHROME ? undefined : 'chrome',
    executablePath: process.env.QA_CHROME,
    headless: process.env.QA_HEADED !== '1',
    args: process.platform === 'linux' ? ['--use-gl=angle', '--use-angle=vulkan', '--enable-features=Vulkan'] : []
  });
}
export class Gameplay {
  constructor(browser, out, name, {
    touch = false,
    quality = 'balanced'
  } = {}) {
    this.browser = browser;
    this.out = out;
    this.name = name;
    this.touch = touch;
    this.quality = quality;
    this.data = {
      name,
      startedAt: new Date().toISOString(),
      inputs: [],
      steps: [],
      routes: [],
      errors: [],
      observations: [],
      assertions: []
    };
  }
  async init() {
    await mkdir(path.join(this.out, 'SCREENSHOTS'), {
      recursive: true
    });
    await mkdir(path.join(this.out, 'EVIDENCIAS'), {
      recursive: true
    });
    this.context = await this.browser.newContext({
      viewport: this.touch ? {
        width: 390,
        height: 844
      } : {
        width: 1280,
        height: 720
      },
      hasTouch: this.touch,
      isMobile: this.touch,
      deviceScaleFactor: 1
    });
    this.page = await this.context.newPage();
    this.cdp = await this.context.newCDPSession(this.page);
    this.page.on('pageerror', e => this.data.errors.push({
      kind: 'pageerror',
      message: e.message
    }));
    this.page.on('response', r => {
      if (r.status() >= 400) this.data.errors.push({
        kind: 'http',
        url: r.url(),
        status: r.status()
      });
    });
    this.page.on('console', m => {
      if (m.type() === 'error') this.data.errors.push({
        kind: 'console',
        message: m.text()
      });
    });
    await this.context.addInitScript(() => {
      window.__functionalEvents = [];
      for (const type of ['keydown', 'keyup', 'pointerdown', 'pointerup', 'blur', 'focus', 'visibilitychange', 'world:travel', 'world:chime']) window.addEventListener(type, e => window.__functionalEvents.push({
        type,
        key: e.key,
          repeat: e.repeat,
        detail: e.detail,
        isTrusted: e.isTrusted,
        time: performance.now(),
        active: document.activeElement?.tagName,
        fade: document.querySelector('.world-transition')?.classList.contains('world-transition--active')
      }), true);
    });
    return this;
  }
  async read() {
    return this.page.evaluate(() => {
      const a = document.querySelector('canvas')?.__avatarQA,
        env = window.__environmentQA?.read();
      const clone = x => x ? JSON.parse(JSON.stringify(x)) : null;
      return {
        time: performance.now(),
        motion: clone(a?.motionRef.current || env?.playerMotion),
        control: clone(a?.controlRef.current || env?.playerControl),
        pose: a?.animation?.current,
        env,
        region: document.querySelector('.world-canvas')?.dataset.currentRegion,
        fade: document.querySelector('.world-transition')?.classList.contains('world-transition--active'),
        prompt: document.querySelector('.world-interaction-prompt')?.innerText,
        menuDisabled: document.querySelector('.world-menu-access')?.disabled,
        body: document.body.innerText,
        focus: document.activeElement?.outerHTML.slice(0, 400)
      };
    });
  }
  async save() {
    await writeFile(path.join(this.out, 'EVIDENCIAS', this.name + '.json'), JSON.stringify(this.data, null, 2));
  }
  async shot(label) {
    const file = this.name + '-' + label.replace(/[^\w.-]/g, '_') + '-' + String(this.data.steps.length).padStart(3, '0') + '.png';
    await this.page.screenshot({
      path: path.join(this.out, 'SCREENSHOTS', file)
    });
    const state = await this.read();
    this.data.steps.push({
      label,
      screenshot: 'SCREENSHOTS/' + file,
      state
    });
    await this.save();
    return state;
  }
  async key(key, duration = 0) {
    this.data.inputs.push({
      key,
      duration,
      time: new Date().toISOString()
    });
    await this.page.keyboard.down(key);
    if (duration) await this.page.waitForTimeout(duration);
    await this.page.keyboard.up(key);
  }
  async click(locator) {
    this.data.inputs.push({
      gesture: this.touch ? 'tap' : 'click',
      time: new Date().toISOString()
    });
    if (this.touch) await locator.tap();else await locator.click();
  }
  async open(url = '/?avatarQA') {
    await this.page.goto(baseURL + url, {
      waitUntil: 'domcontentloaded'
    });
    if (url.startsWith('/arquivo')) await this.page.waitForFunction(() => /^\d{2}:\d{2}$/.test(document.querySelector('.desktop time')?.textContent || ''));
  }
  async ready() {
    await this.page.waitForFunction(() => window.__environmentQA && (document.querySelector('canvas')?.__avatarQA || location.pathname === '/dev/playground' && window.__environmentQA.read().playerMotion), null, {
      timeout: 60000
    });
    const enter = this.page.getByRole('button', {
      name: /Entrar e explorar/
    });
    if (await enter.isVisible()) await this.click(enter);
    await this.settle();
    if (this.quality === 'low') {
      await this.menu();
      if (!(await this.page.getByLabel('Renderização leve').isChecked())) await this.click(this.page.getByLabel('Renderização leve'));
      await this.click(this.page.getByRole('button', {
        name: /Continuar explorando/
      }));
    }
    const s = await this.read();
    this.data.renderer = s.env.renderer;
    return s;
  }
  async status(status) {
    await this.page.waitForFunction(s => window.__environmentQA?.read().perspective.interaction === s, status, {
      timeout: 15000
    });
  }
  async idle() {
    await this.status('idle');
    await this.page.waitForFunction(() => !document.querySelector('.world-transition')?.classList.contains('world-transition--active'));
    await this.settle();
  }
  async settle() {
    await this.page.waitForFunction(() => {
      const m = document.querySelector('canvas')?.__avatarQA?.motionRef.current || window.__environmentQA?.read().playerMotion;
      return m && m.grounded && Math.hypot(m.velocity.x, m.velocity.z) < .04;
    }, null, {
      timeout: 12000
    });
  }
  async mode(mode) {
    const modes = ['third-person-back', 'third-person-front', 'first-person'];
    for (let n = 0; n < 3; n++) {
      const before = (await this.read()).env.perspective.selected;
      if (before === mode) return;
      const next = modes[(modes.indexOf(before) + 1) % 3];
      if (this.touch) await this.click(this.page.locator('.camera-mode-control'));else await this.key('F5');
      await this.page.waitForFunction(m => window.__environmentQA?.read().perspective.selected === m, next, {
        timeout: 1500
      });
    }
    throw Error('Camera mode not reached ' + mode);
  }
  async go(x, z, label, tolerance = .24) {
    let stalled = 0,
      last = Infinity;
    const trace = [];
    for (let i = 0; i < 200; i++) {
      const s = await this.read();
      if (!s.motion) throw Error('Motion unavailable ' + label);
      const p = s.motion.position,
        dx = x - p.x,
        dz = z - p.z,
        d = Math.hypot(dx, dz);
      trace.push({
        position: p,
        distance: d,
        grounded: s.motion.grounded,
        status: s.env.perspective.interaction
      });
      if (d < tolerance) {
        await this.settle();
        this.data.routes.push({
          label,
          destination: [x, z],
          reached: true,
          trace
        });
        await this.save();
        return;
      }
      if (d > last - Math.min(.025, tolerance / 10)) stalled++;else stalled = 0;
      if (stalled > 15) {
        this.data.routes.push({
          label,
          destination: [x, z],
          reached: false,
          trace
        });
        await this.shot('blocked-' + label);
        throw Error('Harness waypoint blocked ' + label);
      }
      last = d;
      const yaw = s.env.perspective.yaw,
        f = Math.sin(yaw) * dx - Math.cos(yaw) * dz,
        r = Math.cos(yaw) * dx + Math.sin(yaw) * dz;
      const action = Math.abs(f) > Math.abs(r) ? f > 0 ? 'w' : 's' : r > 0 ? 'd' : 'a';
      const duration = Math.min(330, Math.max(tolerance < .1 ? 20 : 45, Math.max(Math.abs(f), Math.abs(r)) / 3.6 * 700));
      if (this.touch) await this.stick(action, duration);else await this.key(action, duration);
      await this.page.waitForTimeout(100);
    }
    throw Error('Harness route iterations ' + label);
  }
  async stick(action, duration) {
    const box = await this.page.locator('.touch-joystick-pad').boundingBox();
    if (!box) throw Error('Native joystick not available');
    const x = box.x + box.width / 2,
      y = box.y + box.height / 2,
      delta = {
        w: [0, -28],
        s: [0, 28],
        a: [-28, 0],
        d: [28, 0]
      }[action];
    this.data.inputs.push({
      nativeTouch: action,
      duration
    });
    const point = (x, y) => ({
      x,
      y,
      id: 1,
      radiusX: 5,
      radiusY: 5,
      force: 1
    });
    await this.cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [point(x, y)]
    });
    await this.cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [point(x + delta[0], y + delta[1])]
    });
    await this.page.waitForTimeout(duration);
    await this.cdp.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });
  }
  async verify(label, contracts, assertion, {
    coverage = 'full',
    scope = ''
  } = {}) {
    const record = {
      label,
      contracts,
      coverage,
      scope,
      step: this.data.steps.length - 1
    };
    try {
      await assertion();
      record.status = 'passing';
    } catch (e) {
      record.status = 'failing';
      record.error = e.message;
      throw e;
    } finally {
      this.data.assertions.push(record);
      await this.save();
    }
  }
  async route(name, from = 0, to = Infinity) {
    const r = world.routes.find(r => r.name === name);
    for (const [i, p] of r.points.entries()) if (i >= from && i <= to) await this.go(...p, name + '-' + i);
  }
  async near(id) {
    const t = world.targets.find(x => x.id === id),
      p = t.interactionPoint,
      y = t.interactionRotationY,
      sign = t.region === 'FIELD' && t.action.type === 'sit' ? -1 : 1;
    const point = id === 'HOUSE_BOOKSHELF' ? [p[0] - .12, p[2] + .85] : [p[0] + sign * Math.sin(y) * .85, p[2] + sign * Math.cos(y) * .85];
    await this.go(...point, id + '-near');
    await this.page.waitForFunction(label => document.querySelector('.world-interaction-prompt')?.innerText.includes(label), t.label, {
      timeout: 2500
    });
    return t;
  }
  async activate(id, {
    cancel = false
  } = {}) {
    const t = await this.near(id);
    if (cancel) {
      await this.interact();
      await this.status('approaching');
      await this.shot(id + '-approaching');
      await this.interact();
      await this.idle();
      await this.shot(id + '-cancelled');
    }
    await this.interact();
    await this.status(t.action.type === 'sit' ? 'sitting' : t.action.type === 'use' ? 'using' : 'idle');
    if (t.action.type === 'enter') await this.idle();
    return this.shot(id + '-active');
  }
  async interact() {
    if (this.touch) await this.click(this.page.locator('.world-interaction-prompt'));else await this.key('e');
    await this.page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  async leave(id) {
    if (id === 'HOUSE_COMPUTER') await this.click(this.page.getByRole('button', {
      name: /Voltar ao quarto/
    }));else if (this.touch && ['DOJO_PRACTICE', 'WORKSHOP_LIGHT_TABLE', 'UNIVERSITY_NOTEBOOK', 'COMMUNITY_WORKSHOP', 'FOREST_CHIMES'].includes(id)) await this.click(this.page.getByRole('button', {
      name: /Fechar e voltar a explorar/
    }));else await this.interact();
    await this.idle();
    return this.shot(id + '-returned');
  }
  async menu() {
    if (this.touch) await this.click(this.page.locator('.world-menu-access'));else await this.key('Escape');
    await this.page.getByRole('button', {
      name: /Continuar explorando/
    }).waitFor({
      state: 'visible'
    });
  }
  async map(name) {
    await this.menu();
    await this.click(this.page.getByRole('button', {
      name: /Abrir o mapa/
    }));
    await this.click(this.page.getByRole('button').filter({
      hasText: name
    }).first());
    await this.idle();
    return this.shot('map-' + name);
  }
  async house({
    physical = true
  } = {}) {
    if (physical) {
      await this.route('chegada-eixo', 1, 3);
      await this.route('casa', 1);
    } else await this.map('Casa');
    await this.activate('HOUSE_ENTRY_DOOR');
  }
  async pc({
    physical = true
  } = {}) {
    await this.house({
      physical
    });
    await this.activate('HOUSE_COMPUTER');
    await this.page.getByRole('button', {
      name: /Abrir os projetos/
    }).waitFor({
      state: 'visible'
    });
  }
  async end() {
    this.data.nativeEvents = await this.page.evaluate(() => window.__functionalEvents || []).catch(() => []);
    this.data.finishedAt = new Date().toISOString();
    await this.save();
    await this.context.close();
  }
}
