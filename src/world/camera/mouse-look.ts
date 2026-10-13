import { wrapCameraYaw, clampLookPitch } from './camera-perspectives';

export const DEFAULT_MOUSE_SENSITIVITY = .0025;
export const MOUSE_SENSITIVITY_LIMITS = [.0005, .008] as const;
export function clampMouseSensitivity(value:number) {
  return Number.isFinite(value) ? Math.max(MOUSE_SENSITIVITY_LIMITS[0],Math.min(MOUSE_SENSITIVITY_LIMITS[1],value)) : DEFAULT_MOUSE_SENSITIVITY;
}
// Both native relative movement and fallback drag are measured in pixels.
export function accumulateMouseLook(target:{pendingYaw:number;pendingPitch:number},dx:number,dy:number,sensitivity:number,invertY:boolean) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
  const scale=clampMouseSensitivity(sensitivity);
  target.pendingYaw+=dx*scale;
  target.pendingPitch+=dy*scale*(invertY?1:-1);
}
// Input, rendered look and movement basis agree in the very next frame.
// Arm recovery is smoothed separately; orientation is never eased.
export function applyLookIntent(intent:{yaw:number;pitch:number},yawDelta:number,pitchDelta:number) {
  intent.yaw=wrapCameraYaw(intent.yaw+yawDelta);
  intent.pitch=clampLookPitch(intent.pitch+pitchDelta);
}
