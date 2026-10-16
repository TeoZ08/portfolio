import type { PlayerMotionState } from "./player-motion";
import type { PlayerControlState } from "./player-control";
import { getAvatarPose, type AvatarPose } from "./avatar-animation";

export const JUMP_START_SECONDS = .10;
export const JUMP_LAND_SECONDS = .18;
export type JumpPlayback = "phases" | "sampled";
export type MotionPhase = "ground" | "start" | "air" | "land";
export type AvatarMotionClock = {
  wasAirborne: boolean;
  flightAge: number;
  landingAge: number;
  launched: boolean;
};
export function createAvatarMotionClock(): AvatarMotionClock {
  return { wasAirborne: false, flightAge: 0, landingAge: Infinity, launched: false };
}
export type AvatarTravelClock = { previous: { x: number; z: number } | null };
export function consumeAvatarTravel(clock: AvatarTravelClock, position: { x: number; z: number }) {
  const distance = clock.previous ? Math.hypot(position.x - clock.previous.x, position.z - clock.previous.z) : 0;
  clock.previous = { x: position.x, z: position.z };
  // Region/map travel is a relocation, never a stride. This also bounds recovery.
  return Number.isFinite(distance) && distance <= 1.25 ? distance : 0;
}
export function advanceGaitByDistance(time: number, distance: number, gait: { duration: number; duty: number; stroke: number }) {
  return (time + Math.max(0, distance) * gait.duty * gait.duration / (gait.stroke * 1.12)) % gait.duration;
}
const unit = (x: number) => Math.max(0, Math.min(1, x));

// Read physical motion; this clock never writes capsule velocity, input or pose.
export function advanceAvatarMotion(
  clock: AvatarMotionClock,
  motion: PlayerMotionState,
  control: PlayerControlState,
  delta: number,
  playback: JumpPlayback = "phases",
) {
  const pose = getAvatarPose(motion, control);
  const dt = Math.max(0, Math.min(.1, delta));
  let phase: MotionPhase = "ground";
  let clip: string = pose;
  let fraction: number | null = null;
  let movingImpact: number | null = null;
  if (pose === "seated-pose" || pose === "practice") {
    clock.wasAirborne = motion.airborne;
    clock.flightAge = 0;
    clock.landingAge = Infinity;
    clock.launched = false;
    return { pose, phase, clip, fraction, movingImpact };
  }
  if (motion.airborne) {
    if (!clock.wasAirborne) {
      clock.flightAge = 0;
      clock.launched = motion.velocity.y > 1;
    } else clock.flightAge += dt;
    clock.wasAirborne = true;
    clock.landingAge = Infinity;
    phase = clock.launched && clock.flightAge < JUMP_START_SECONDS && motion.velocity.y > 0 ? "start" : "air";
    const airFraction = unit(.5 - motion.velocity.y / 12.4);
    if (playback === "sampled") {
      clip = "jump";
      fraction = phase === "start" ? .1 * unit(clock.flightAge / JUMP_START_SECONDS) : .1 + .7 * unit((airFraction - .16) / .84);
    } else {
      clip = phase === "start" ? "jump-start" : "jump-air";
      fraction = phase === "start" ? unit(clock.flightAge / JUMP_START_SECONDS) : airFraction;
    }
  } else {
    if (clock.wasAirborne) {
      // Ignore tiny contact jitter/spawn settling; a real input jump still lands.
      clock.landingAge = clock.launched || clock.flightAge > .12 ? 0 : Infinity;
      clock.wasAirborne = false;
    }
    if (clock.landingAge < JUMP_LAND_SECONDS) {
      const progress = unit(clock.landingAge / JUMP_LAND_SECONDS);
      phase = "land";
      if (pose === "idle") {
        clip = playback === "sampled" ? "jump" : "jump-land";
        fraction = playback === "sampled" ? .8 + .2 * progress : progress;
      } else movingImpact = progress; // Locomotion legs keep working during landing.
      clock.landingAge += dt;
    }
  }
  return { pose, phase, clip, fraction, movingImpact };
}

export const MOTION_GAITS = {
  walk: { stroke: .50, duty: .50, duration: 1, min: 0, max: 4.25 },
  run: { stroke: .52, duty: .24, duration: .75, min: 0, max: 2.75 },
} as const;
export const CYCLE1_GAITS = {
  walk: { stroke: .56, duty: .54, duration: 1, min: 0, max: 4.25 },
  run: { stroke: .60, duty: .28, duration: .75, min: 0, max: 2.75 },
} as const;
type Gaits = { walk: { duty: number }; run: { duty: number } };
export function alignedGaitPhase(phase: number, from: "walk" | "run", to: "walk" | "run", gaits: Gaits = MOTION_GAITS) {
  // Preserve the supporting side and its stance progress across walk/run changes.
  const side = phase >= .5 ? .5 : 0;
  const local = (phase - side) * 2;
  const source = Math.min(1, gaits[from].duty * 2);
  const target = Math.min(1, gaits[to].duty * 2);
  const mapped = local < source ? local / source * target
    : target + (local - source) / Math.max(.001, 1 - source) * (1 - target);
  return (side + mapped / 2) % 1;
}

export type AvatarMotionDecision = ReturnType<typeof advanceAvatarMotion> & { pose: AvatarPose };
