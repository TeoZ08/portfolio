import { PLAN } from "../regions/masterplan-layout";
import { FIELD_SCALE } from "../regions/world-scale";
import { surfaceHeight } from "../regions/field/field-layout";

// Physical metres. Lower the lens under an eave only while its target is in
// that building; keep the visitor's orbit/zoom intent for the open landscape.
const ZONES = [
  { x: PLAN.dojo.x * FIELD_SCALE, z: PLAN.dojo.z * FIELD_SCALE, yaw: PLAN.dojo.yaw, halfX: 7.8, halfZ: 4.8, eye: 3.25 },
  { x: PLAN.gallery.x * FIELD_SCALE, z: PLAN.gallery.z * FIELD_SCALE, yaw: PLAN.gallery.yaw, halfX: 6.6, halfZ: 4.25, eye: 2.95 },
] as const;

export function architecturalCameraPitch(x: number, y: number, z: number, radius: number, requested: number) {
  let pitch = requested;
  for (const zone of ZONES) {
    const dx=x-zone.x,dz=z-zone.z,c=Math.cos(zone.yaw),s=Math.sin(zone.yaw);
    const edge = Math.max(Math.abs(dx*c-dz*s)-zone.halfX, Math.abs(dx*s+dz*c)-zone.halfZ);
    const t = Math.max(0, Math.min(1, 1-edge/1.8));
    const blend = t*t*(3-2*t);
    const ceiling = surfaceHeight(zone.x/FIELD_SCALE, zone.z/FIELD_SCALE)*FIELD_SCALE + zone.eye;
    const cap = Math.asin(Math.max(-.2, Math.min(1, (ceiling-y)/Math.max(radius,.1))));
    pitch = Math.min(pitch, requested+(Math.min(requested,cap)-requested)*blend);
  }
  return pitch;
}
