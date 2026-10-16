import type { PlayerControlState } from "./player-control";
import type { PlayerMotionState } from "./player-motion";

export const AVATAR_POSES = ["idle", "walk", "run", "jump", "seated-pose", "practice"] as const;
export type AvatarPose = (typeof AVATAR_POSES)[number];

// Visual state follows physics. It never creates movement or moves the capsule.
export function getAvatarPose(motion: PlayerMotionState, control: PlayerControlState): AvatarPose {
  if (control.physicsLocked) return "seated-pose";
  if (control.pose === "practice") return "practice";
  if (motion.airborne) return "jump";
  if (Math.hypot(motion.velocity.x, motion.velocity.z) <= .12) return "idle";
  return motion.sprinting ? "run" : "walk";
}

// Native support-phase travel / duration, scaled with the 1.12 uniform avatar scale.
// This matches planted foot velocity to physics instead of reusing V5 cadence.
type GaitCalibration = { stroke: number; duty: number; duration: number; min: number; max: number };
export function getAvatarCadence(pose: AvatarPose, speed: number, profile?: Partial<Record<AvatarPose, GaitCalibration>>) {
  const gait = profile?.[pose];
  if (gait) return Math.min(gait.max, Math.max(gait.min, Math.max(0, speed) * gait.duty * gait.duration / (gait.stroke * 1.12)));
  // Original V3 remains a preserved asset/fallback with its original calibration.
  if (pose === "walk") return Math.min(2.6, Math.max(.35, speed / (.184 * 1.12 / .60)));
  if (pose === "run") return Math.min(2.1, Math.max(.55, speed / (.270 * 1.12 / (.38 * .75))));
  return 1;
}

// Heights are visual-only: existing scaled furniture and the V3 seated contact.
export function getAvatarSeatOffset(targetId: string | null) {
  if (targetId === "HOUSE_ENTRY_BENCH") return -.435;
  if (targetId === "HOUSE_COMPUTER") return -.450;
  return -.466;
}

// Current surface colliders already support the capsule on the tatami/trim.
// Extra lift duplicated that height (A04); keep one foot/capsule alignment.
export function getAvatarDojoLift(_x: number, _z: number, _scale = .72) {
  return 0;
}
