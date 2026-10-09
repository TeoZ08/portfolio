import assert from "node:assert/strict";
import test from "node:test";

import {
  canStartJump,
  getDashHopSpeed,
  getManualTraversalSpeed,
  PLAYER_TRAVERSAL,
} from "../src/world/player/player-traversal.ts";

test("selects walk and sprint speeds under the traversal cap", () => {
  assert.equal(getManualTraversalSpeed(1, false), .8);
  assert.equal(getManualTraversalSpeed(1, true), 1.9);
  assert.equal(getManualTraversalSpeed(0, true), 0);
  assert.equal(getManualTraversalSpeed(1, true, true), 0);
  assert.ok(
    getManualTraversalSpeed(1, true) <=
      PLAYER_TRAVERSAL.maximumHorizontalSpeed,
  );
});

test("dash-hop requires a valid grounded sprint jump with movement", () => {
  const validJump = {
    blocked: false,
    cooldownRemaining: 0,
    grounded: true,
    inputMagnitude: 1,
    jumpPressed: true,
    sprinting: true,
  };

  assert.equal(getDashHopSpeed(validJump), 9.2);
  assert.equal(getDashHopSpeed({ ...validJump, sprinting: false }), null);
  assert.equal(getDashHopSpeed({ ...validJump, inputMagnitude: 0.2 }), null);
  assert.equal(getDashHopSpeed({ ...validJump, grounded: false }), null);
  assert.ok(
    (getDashHopSpeed(validJump) ?? Infinity) < 10,
  );
});

test("jump rule rejects held cooldown, airborne, and blocked requests", () => {
  const validJump = {
    blocked: false,
    cooldownRemaining: 0,
    grounded: true,
    jumpPressed: true,
  };

  assert.equal(canStartJump(validJump), true);
  assert.equal(canStartJump({ ...validJump, cooldownRemaining: 0.01 }), false);
  assert.equal(canStartJump({ ...validJump, grounded: false }), false);
  assert.equal(canStartJump({ ...validJump, blocked: true }), false);
  assert.equal(canStartJump({ ...validJump, jumpPressed: false }), false);
});
