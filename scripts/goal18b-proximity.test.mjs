import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getNearestTarget } from '../src/world/interactions/interaction-proximity.ts';
const {
  targets
} = JSON.parse(readFileSync('qa/fixtures/world-model.json'));
// Unit rule fixtures normalize the coordinate origin; no live player is moved.
for (const original of targets) test('XYZ activation boundary: ' + original.id, () => {
  const t = {
      ...original,
      interactionPoint: [0, 0, 0]
    },
    r = t.activationRadius;
  assert.equal(getNearestTarget({
    x: r - .001,
    y: 0,
    z: 0
  }, [t]), t);
  assert.equal(getNearestTarget({
    x: r,
    y: 0,
    z: 0
  }, [t]), t);
  assert.equal(getNearestTarget({
    x: r + .001,
    y: 0,
    z: 0
  }, [t]), null);
  assert.equal(getNearestTarget({
    x: 0,
    y: r + .001,
    z: 0
  }, [t]), null);
  assert.equal(getNearestTarget({
    x: 0,
    y: 0,
    z: r
  }, [t]), t);
});
test('nearest competitors are independent of array order; exact ties use stable lexicalID', () => {
  const a = {
      ...targets[0],
      id: 'A',
      interactionPoint: [0, 0, 0]
    },
    z = {
      ...a,
      id: 'Z'
    },
    near = {
      ...a,
      id: 'NEAR',
      interactionPoint: [0, 0, .25]
    };
  assert.equal(getNearestTarget({
    x: 0,
    y: 0,
    z: 0
  }, [z, a]), a);
  assert.equal(getNearestTarget({
    x: 0,
    y: 0,
    z: 0
  }, [a, z]), a);
  assert.equal(getNearestTarget({
    x: 0,
    y: 0,
    z: .2
  }, [a, near]), near);
});
test('nonfinite motion cannot select an interaction target', () => {
  for (const x of [NaN, Infinity, -Infinity]) assert.equal(getNearestTarget({
    x,
    y: 0,
    z: 0
  }, targets), null);
});
