# Milestone D — Traversal polish

## Goal

Make exploration feel quicker and more responsive while preserving the existing camera, interaction transitions, house collision, desktop, touch movement, and kinematic character-controller behavior.

## Decisions

- Keep movement camera-relative and preserve normalized diagonal input.
- Tune manual traversal to `4.8 m/s` walking and `7.3 m/s` sprinting, with a hard horizontal cap below `10 m/s`.
- Smooth only manual horizontal motion. Existing interaction-driven approach velocities remain authoritative so room interactions keep their current timing and path.
- Use bounded acceleration and deceleration with the existing Rapier kinematic controller; do not replace collision, grounding, autostep, slope, or snap-to-ground configuration.
- Treat Space as a consumed edge-trigger. A grounded press starts one jump; holding Space cannot queue repeated jumps.
- Use a modest `6.2 m/s` vertical launch with the existing `-20 m/s²` gravity, for an approximate `0.96 m` ballistic apex before collision correction.
- When grounded, sprinting, and moving meaningfully, the same Space press starts a dash-hop by setting horizontal launch speed to `9.2 m/s`, then returning smoothly toward sprint speed.
- Enforce a `0.42 s` jump cooldown and never allow jumping while manual control or physics is locked.
- Clear transient input on blur, hidden document, menu/device blocking, and component cleanup.
- Reuse the walk clip at a higher natural playback rate for sprinting. Add only subtle sprint/airborne response to the fallback avatar; do not invent animation clips.
- Do not add sprint FOV in this milestone. Connecting it safely would broaden the camera rig's state coupling and could interfere with the already-approved obstruction/recenter behavior.
- Keep touch directional controls unchanged. Add no extra mobile HUD; desktop discoverability gets one quiet Shift/Space hint that yields visually to interaction prompts.
- Add pure traversal helpers and focused `node:test` coverage without adding dependencies.

## Risks and controls

- **Ground snap fighting launch:** apply positive jump velocity before controller movement and rely on computed grounding after the upward step.
- **Queued jump after an interaction:** read and consume the edge every frame, even when manual movement is locked, while ignoring the action in blocked states.
- **Dash tunneling or unstable collision:** cap launch speed at `9.2 m/s`, retain the character controller, and keep frame delta capped by the existing frame loop.
- **Interaction regressions from smoothing:** reset manual velocity when interactions own movement and pass `desiredVelocity` through unchanged.

## Acceptance criteria

- WASD/arrows remain camera-relative and diagonal input remains normalized.
- Walking reaches `4.8 m/s`; Shift reaches `7.3 m/s`; acceleration and stopping are visibly smooth but responsive.
- Space produces one grounded jump per press, with no double jump and no hold-to-bunny-hop behavior.
- Shift + meaningful movement + Space produces a forward `9.2 m/s` dash-hop and never exceeds the configured sub-`10 m/s` cap.
- Menu, desktop/device, automated interaction, and physics-locked states cannot sprint, jump, or dash-hop and do not preserve stale jump presses.
- Grounding, collision, slopes, autostep, interaction approaches, camera obstruction/recenter, house, and desktop behavior remain intact.
- Animated visitor uses existing idle/walk/seated clips only; sprint changes walk playback speed. Fallback response remains subtle.
- A fine-pointer desktop hint exposes Shift and Space without covering or competing with interaction prompts; coarse-pointer movement remains usable.
- `npm run test:camera`, movement tests, `npm run typecheck`, `npm run build`, and `git diff --check` all pass before committing.
