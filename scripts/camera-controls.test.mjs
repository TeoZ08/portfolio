import assert from "node:assert/strict";
import test from "node:test";

import {
  getCameraDefaultView,
  getWheelIntent,
  getZoomRadius,
} from "../src/world/camera/camera-controls.ts";
import {
  EXPLORE_CAMERA_PRESET,
  INTERIOR_CAMERA_PRESET,
} from "../src/world/camera/camera-presets.ts";

test("classifies ctrl+wheel and line-mode input as zoom", () => {
  assert.equal(
    getWheelIntent({ ctrlKey: true, deltaMode: 0, deltaX: 0, deltaY: 8 }),
    "zoom",
  );
  assert.equal(
    getWheelIntent({ ctrlKey: false, deltaMode: 1, deltaX: 0, deltaY: 3 }),
    "zoom",
  );
});

test("classifies fine pixel deltas as trackpad orbit input", () => {
  assert.equal(
    getWheelIntent({ ctrlKey: false, deltaMode: 0, deltaX: 0, deltaY: 14 }),
    "orbit",
  );
  assert.equal(
    getWheelIntent({ ctrlKey: false, deltaMode: 0, deltaX: -24, deltaY: 2 }),
    "orbit",
  );
  assert.equal(
    getWheelIntent({ ctrlKey: false, deltaMode: 0, deltaX: 0, deltaY: 120 }),
    "zoom",
  );
});

test("default views and zoom stay inside each preset's limits", () => {
  const field = getCameraDefaultView(EXPLORE_CAMERA_PRESET);
  const interior = getCameraDefaultView(INTERIOR_CAMERA_PRESET);

  assert.ok(field.radius >= EXPLORE_CAMERA_PRESET.radiusLimits[0]);
  assert.ok(field.radius <= EXPLORE_CAMERA_PRESET.radiusLimits[1]);
  assert.ok(interior.radius >= INTERIOR_CAMERA_PRESET.radiusLimits[0]);
  assert.ok(interior.radius <= INTERIOR_CAMERA_PRESET.radiusLimits[1]);

  assert.equal(
    getZoomRadius(
      EXPLORE_CAMERA_PRESET.radiusLimits[0],
      -10000,
      EXPLORE_CAMERA_PRESET.radiusLimits,
    ),
    EXPLORE_CAMERA_PRESET.radiusLimits[0],
  );
  assert.equal(
    getZoomRadius(
      INTERIOR_CAMERA_PRESET.radiusLimits[1],
      10000,
      INTERIOR_CAMERA_PRESET.radiusLimits,
    ),
    INTERIOR_CAMERA_PRESET.radiusLimits[1],
  );
});
