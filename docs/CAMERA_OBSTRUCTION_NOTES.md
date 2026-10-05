# Camera obstruction comfort

## Architecture

`CameraRig` keeps the visitor's zoom preference in `targetRadius` and its
normal smoothed value in `currentRadius`. Obstruction uses a separate
`obstructionRadius`, so a wall can temporarily retract the rendered camera
without changing the visitor's chosen zoom.

Every camera update casts a normalized Rapier ray from a point slightly away
from the look-at pivot toward the desired camera position. A real hit limits
the rendered radius to the hit distance minus wall padding, subject to a
minimum comfort distance. Retraction is intentionally faster than restoration;
restoration eases back to `currentRadius`. Reduced-motion uses its own moderate
damping rates and caps the delta used by obstruction smoothing.

The pure distance calculation lives in `camera-controls.ts` and is covered by
`npm run test:camera`.

## Filtering

The installed Rapier API exposes:

```ts
world.castRay(
  ray,
  maxToi,
  solid,
  filterFlags,
  filterGroups?,
  excludeCollider?,
  excludeRigidBody?,
  predicate?,
)
```

The camera query combines `EXCLUDE_SENSORS` and `EXCLUDE_KINEMATIC`.
`DEV_PLAYER_CAPSULE` is a kinematic rigid body, so it cannot collapse the
camera onto the pivot. Trigger sensors are also ignored. Fixed house walls,
furniture blockouts, terrain, boundary colliders, large stones, the landmark
tree and the exterior house remain queryable. Visual meshes without Rapier
colliders never affect the camera.

## Acceptance

- Orbiting or zooming behind a real fixed collider retracts the camera.
- Leaving the obstruction restores the prior zoom smoothly.
- Retraction never writes to `targetRadius`.
- Player and sensor colliders are ignored by category, not by fragile names.
- Field and interior use the same collider-driven behavior.
- The wall padding and asymmetric damping reduce edge flicker at floors and
  door frames.
- Reduced-motion avoids a one-frame obstruction snap.

## Known limitations

- This is a single center ray, not a sphere cast, so it does not model the
  complete camera frustum or near-plane width.
- Only authored Rapier colliders can obstruct the camera. Detailed visual
  geometry without a collider is intentionally ignored.
- When geometry is closer to the pivot than the minimum comfort distance, the
  minimum wins. Level colliders should leave enough room around playable
  camera pivots.
