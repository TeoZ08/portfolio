import test from "node:test";
import assert from "node:assert/strict";
import {
  discover,
  DISCOVERY_REACH,
  LAB_DISCOVERIES,
  nearestAvailableDiscovery,
  explorationComplete,
  horizontalDistance,
} from "../src/world/gameplay-lab/discovery-logic.ts";

const first = LAB_DISCOVERIES[0];
const position = first.position;

test("the closest discovered object is only offered inside its interaction radius", () => {
  const nearby = nearestAvailableDiscovery([], position);
  assert.equal(nearby?.target.id, first.id);
  assert.equal(nearby.distance, 0);
  assert.equal(nearestAvailableDiscovery([], [100, 0, 100]), null);
  assert.equal(DISCOVERY_REACH, 1.75);
});

test("a discovery cannot be triggered from a distant location or by an unknown ID", () => {
  const initial = [];
  assert.equal(discover(initial, first.id, [100, 0, 100]), initial);
  assert.equal(discover(initial, "invalid", position), initial);
  assert.equal(discover(initial, first.id, [Infinity, 0, 0]), initial);
  assert.equal(horizontalDistance([NaN, 0, 0], position), Infinity);
});

test("collecting uses stable IDs and ignores repeated interaction", () => {
  const initial = [];
  const found = discover(initial, first.id, position);
  assert.deepEqual(found, [first.id]);
  assert.equal(discover(found, first.id, position), found);
  assert.equal(nearestAvailableDiscovery(found, position), null);
});

test("collecting all optional discoveries unlocks the completion message", () => {
  let found = [];
  for (const target of LAB_DISCOVERIES) {
    assert.equal(explorationComplete(found), false);
    found = discover(found, target.id, target.position);
  }
  assert.equal(explorationComplete(found), true);
  assert.equal(found.length, LAB_DISCOVERIES.length);
});

test("closeness is evaluated on the ground plane without changing world physics", () => {
  assert.equal(horizontalDistance([0, 1, 0], [0, 100, 0]), 0);
  assert.equal(horizontalDistance([1, 1, 2], [4, 2, 6]), 5);
});
