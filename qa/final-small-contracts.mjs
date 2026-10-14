import assert from 'node:assert/strict';
async function cameraButton(g) {
  await g.open();
  await g.ready();
  for (const mode of ['third-person-back', 'third-person-front', 'first-person']) {
    await g.mode(mode);
    await g.page.mouse.move(640, 360);
    await g.page.mouse.move(720, 400);
    await g.shot('dirty-look-' + mode);
    await g.menu();
    await g.key('Escape');
    await g.click(g.page.getByRole('button', {
      name: 'Recentralizar câmera',
      exact: true
    }));
    await g.page.waitForFunction(() => Math.abs(window.__environmentQA.read().perspective.pitch + .16) < .001);
    const s = await g.shot('button-recenter-' + mode);
    await g.verify('C button recenter ' + mode, ['CAMERA.RECENTER'], async () => {
      assert.equal(s.env.perspective.selected, mode);
      assert(Math.abs(s.env.perspective.pitch + .16) < .001);
      assert(Math.abs(Math.atan2(Math.sin(s.env.perspective.yaw + s.motion.rotationY), Math.cos(s.env.perspective.yaw + s.motion.rotationY))) < .01);
      if (mode !== 'first-person') assert(Math.abs(s.env.perspective.safeDistance - 4.2) < .01);
    }, {
      coverage: 'full',
      scope: 'Public button, all3modes, physical heading/pitch and safe desired radius in clear arrival area. C-key fixtures separately.'
    });
    await g.page.locator('canvas').click({
      position: {
        x: 640,
        y: 340
      }
    });
  }
  await g.mode('third-person-back');
  await g.page.waitForFunction(() => Math.abs(window.__environmentQA.read().perspective.safeDistance - 4.2) < .01);
  assert.deepEqual(g.data.errors, []);
}
async function desktopRetention(g) {
  await g.open('/arquivo');
  const dock = g.page.locator('.desktop-dock').getByRole('button', {
    name: 'Projetos',
    exact: true
  });
  await g.click(g.page.getByRole('button', {
    name: 'Minimizar janela'
  }));
  await g.shot('minimized-app-indicator');
  await g.verify('minimize retains selected app', ['PC.MINIMIZE'], async () => {
    assert.equal(await g.page.locator('.desktop-window').count(), 0);
    assert((await dock.getAttribute('class')).includes('is-active'));
  });
  await g.click(dock);
  assert.equal(await g.page.locator('.project-file-row').count(), 3);
  await g.click(g.page.getByRole('button', {
    name: 'Mostrar mesa de trabalho'
  }));
  await g.shot('wordmark-app-indicator');
  await g.verify('wordmark retains selected app', ['PC.WORDMARK'], async () => {
    assert.equal(await g.page.locator('.desktop-window').count(), 0);
    assert((await dock.getAttribute('class')).includes('is-active'));
    assert(await g.page.getByRole('button', {
      name: /Abrir os projetos/
    }).isVisible());
  });
}
export const smallContracts = [{
  id: 'CAMERA.PUBLIC.BUTTON.CONTRACT',
  run: cameraButton
}, {
  id: 'PC.HIDDEN.APP.RETENTION',
  run: desktopRetention
}];
