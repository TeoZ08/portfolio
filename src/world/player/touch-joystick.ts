// Normalized analog input for the mobile movement stick. Pure for deterministic tests.
export const JOYSTICK_DEADZONE = 0.12;
export const JOYSTICK_SPRINT_THRESHOLD = 0.86;

export function calculateJoystick(dx: number, dy: number, radius: number) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(radius) || radius <= 0) {
    return { x: 0, z: 0, sprinting: false, thumbX: 0, thumbY: 0 };
  }

  const distance = Math.hypot(dx, dy);
  if (distance < 0.0001) {
    return { x: 0, z: 0, sprinting: false, thumbX: 0, thumbY: 0 };
  }

  const reach = Math.min(1, distance / radius);
  const input = reach <= JOYSTICK_DEADZONE
    ? 0
    : (reach - JOYSTICK_DEADZONE) / (1 - JOYSTICK_DEADZONE);
  const factor = 1 / distance;

  return {
    x: dx * factor * input,
    z: dy * factor * input, // upward drag => negative Z => forward movement
    sprinting: reach >= JOYSTICK_SPRINT_THRESHOLD,
    thumbX: dx * factor * Math.min(distance, radius),
    thumbY: dy * factor * Math.min(distance, radius),
  };
}
