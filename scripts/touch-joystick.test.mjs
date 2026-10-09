import assert from "node:assert/strict";
import test from "node:test";
import { calculateJoystick, JOYSTICK_DEADZONE, JOYSTICK_SPRINT_THRESHOLD } from "../src/world/player/touch-joystick.ts";

test("neutral stick and small drags stay still", () => {
  assert.deepEqual(calculateJoystick(0, 0, 42), {x:0,z:0,sprinting:false,thumbX:0,thumbY:0});
  assert.equal(calculateJoystick(42*JOYSTICK_DEADZONE*0.8,0,42).x,0);
  assert.equal(calculateJoystick(20,20,0).z,0);
});
test("cardinal directions and diagonals match camera-relative WASD coordinates", () => {
  assert.equal(calculateJoystick(0,-42,42).z, -1);
  assert.equal(calculateJoystick(42,0,42).x, 1);
  const diag=calculateJoystick(42,-42,42);
  assert.ok(Math.abs(Math.hypot(diag.x,diag.z)-1)<1e-9);
  assert.ok(diag.x>0 && diag.z<0);
});
test("drag magnitude is analog, clamped and sprint starts at outer ring", () => {
  const mid=calculateJoystick(0,-20,42);
  assert.ok(mid.z<0 && mid.z>-1);
  assert.equal(mid.sprinting,false);
  assert.equal(calculateJoystick(0,-42*JOYSTICK_SPRINT_THRESHOLD,42).sprinting,true);
  const far=calculateJoystick(420,-420,42);
  assert.ok(Math.abs(Math.hypot(far.x,far.z)-1)<1e-9);
  assert.ok(Math.abs(Math.hypot(far.thumbX,far.thumbY)-42)<1e-9);
});
test("nonfinite coordinates do not produce invalid input", () => {
  assert.equal(calculateJoystick(Number.NaN,12,42).x,0);
  assert.equal(calculateJoystick(1,Number.POSITIVE_INFINITY,42).sprinting,false);
});
