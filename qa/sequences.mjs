import assert from 'node:assert/strict';

async function repeatAndAir(g) {
  await g.open(); await g.ready();
  await g.route('chegada-eixo', 1, 3); await g.route('casa', 1);
  await g.near('HOUSE_ENTRY_DOOR');
  await g.page.keyboard.down('e');
  await g.status('approaching');
  for (let i = 0; i < 8; i++) await g.page.keyboard.down('e');
  await g.shot('held-E-native-repeat');
  await g.verify('held E does not reenter or cancel', ['SEQUENCE.E_REPEAT'], async () => {
    assert.equal((await g.read()).env.perspective.interaction, 'approaching');
    const events = await g.page.evaluate(() => window.__functionalEvents.filter(e => e.type === 'keydown' && e.key === 'e'));
    assert(events.length >= 9);
    assert(events.every(e => e.isTrusted));
  }, { coverage: 'partial', scope: 'Native repeated keydown during approaching; other phases remain separate' });
  await g.page.keyboard.up('e');
  await g.key('Escape'); await g.idle();
  await g.near('HOUSE_ENTRY_DOOR');
  await g.interact(); await g.status('approaching');
  await g.interact(); await g.idle();
  await g.shot('double-E-distinct-frames');
  await g.verify('double E cancels approach', ['SEQUENCE.E_DOUBLE'], async () => {
    assert.equal((await g.read()).env.perspective.interaction, 'idle');
    assert((await g.read()).control.manualInputEnabled);
  }, { coverage: 'partial', scope: 'Distinct-frame native E events; same-frame coalescing not forced' });
  await g.near('HOUSE_ENTRY_DOOR');
  try {
    await g.page.keyboard.down('Shift'); await g.page.keyboard.down('w');
    await g.key('Space');
    await g.page.waitForFunction(() => document.querySelector('canvas').__avatarQA.motionRef.current.airborne);
    const airborne = await g.read();
    g.data.observations.push({ scope: 'Immediately before native E while jump/sprint are active; no screenshot pause during held movement', airborne });
    assert(airborne.motion.airborne);
    await g.interact();
    await g.page.keyboard.up('w'); await g.page.keyboard.up('Shift');
    await g.status('approaching');
    await g.shot('E-during-air-sprint');
    await g.key('Escape');
  } finally { await g.page.keyboard.up('w'); await g.page.keyboard.up('Shift'); }
  await g.idle();
  await g.shot('air-cancel-landed');
  await g.verify('air/sprint interaction cancels and lands', ['TARGET.HOUSE_ENTRY_DOOR.CANCEL', 'MOVEMENT.JUMP', 'MOVEMENT.SPRINT'], async () => {
    const s = await g.read(); assert(s.motion.grounded); assert(s.control.manualInputEnabled);
    const before = s.motion.position.x; await g.key('d', 250); await g.settle();
    assert(Math.abs((await g.read()).motion.position.x - before) > .4);
  }, { coverage: 'partial', scope: 'One actual jump/sprint/E/escape sequence at House entrance, not all targets and cameras' });
}
async function archiveReturn(g) {
  await g.open(); await g.ready(); await g.pc();
  await g.click(g.page.locator('.desktop-status button'));
  await g.click(g.page.getByRole('link', { name: /Abrir modo direto/ }));
  await g.page.waitForURL('**/arquivo');
  await g.shot('archive-public-link');
  await g.verify('PC direct link', ['PC.ARCHIVELINK'], async () => assert(g.page.url().endsWith('/arquivo')));
  await g.page.goBack({ waitUntil: 'domcontentloaded' });
  await g.page.waitForFunction(() => !!document.querySelector('canvas')?.__avatarQA, null, { timeout: 60000 });
  await g.idle();
  const returned = await g.shot('browser-back-world');
  await g.verify('SPA return does not leave limbo', ['SEQUENCE.PC_ARCHIVE_RETURN'], async () => {
    assert(returned.motion.grounded); assert(returned.motion.position.y > 0); assert(returned.control.manualInputEnabled);
    assert.equal(returned.region, 'FIELD');
  }, { coverage: 'partial', scope: 'Existing observed return to FIELD retained. Desired return destination awaits product decision.' });
  await g.pc({ physical: false });
  await g.page.reload({ waitUntil: 'domcontentloaded' });
  await g.ready();
  await g.shot('integrated-PC-reloaded');
  await g.verify('PC reload exits safely', ['PC.RELOAD'], async () => {
    const s = await g.read(); assert.equal(s.region, 'FIELD'); assert(s.motion.grounded);
    assert.equal(await g.page.locator('.world-device-overlay').count(), 0);
    assert.equal(await g.page.locator('.desktop-window').count(), 0);
  }, { coverage: 'partial', scope: 'Integrated PC reload only; direct archive reload covered separately' });
}
export const sequences = [
  { id: 'NEGATIVE.REPEAT.DOUBLE.AIR', run: repeatAndAir },
  { id: 'SEQUENCE.ARCHIVE.RETURN', run: archiveReturn },
];
