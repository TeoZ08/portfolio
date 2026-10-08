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

export function getAvatarCadence(pose: AvatarPose, speed: number) {
  if (pose === "walk") return Math.min(1.55, Math.max(.55, speed / 2.6));
  if (pose === "run") return Math.min(1.65, Math.max(.8, speed / 5.8));
  return 1;
}
