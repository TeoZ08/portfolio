export const CAMERA_MODES = ['first-person', 'third-person-back', 'third-person-front'] as const;
export type CameraMode = typeof CAMERA_MODES[number];
export const CAMERA_MODE_LABELS: Record<CameraMode,string> = {
  'first-person':'Primeira pessoa', 'third-person-back':'Por trás', 'third-person-front':'De frente',
};
// Eye height measured from the authored iris (1.134m), avatar scale (1.12)
// and visual offset (-.85m), relative to the physical capsule centre.
export const PERSPECTIVE = {
  eyeOffset: 1.134 * 1.12 - .85,
  pitchLimit: Math.PI*85/180,
  defaultPitch: -.16,
  defaultRadius: 4.2,
  radiusLimits: [2.6,8] as const,
  cameraClearance: .16,
  fov: 66,
} as const;
export function nextCameraMode(mode:CameraMode):CameraMode {
  return CAMERA_MODES[(CAMERA_MODES.indexOf(mode)+1)%CAMERA_MODES.length];
}
export function wrapCameraYaw(yaw:number) {return Math.atan2(Math.sin(yaw),Math.cos(yaw));}
export function clampLookPitch(pitch:number) {return Math.max(-PERSPECTIVE.pitchLimit,Math.min(PERSPECTIVE.pitchLimit,pitch));}
export function movementBasis(yaw:number,out={forwardX:0,forwardZ:0,rightX:0,rightZ:0}) {
  out.forwardX=Math.sin(yaw);out.forwardZ=-Math.cos(yaw);out.rightX=Math.cos(yaw);out.rightZ=Math.sin(yaw);return out;
}
export function cameraDirection(yaw:number,pitch:number,out={x:0,y:0,z:0}) {
  out.x=Math.sin(yaw)*Math.cos(pitch);out.y=Math.sin(pitch);out.z=-Math.cos(yaw)*Math.cos(pitch);return out;
}
export function perspectiveSign(mode:CameraMode) {return mode==='third-person-front'?1:mode==='third-person-back'?-1:0;}
export function safeCameraDistance(desired:number,hit:number|null,padding:number=PERSPECTIVE.cameraClearance) {
  return hit===null?desired:Math.max(0,Math.min(desired,hit-padding));
}
export function restoreCameraDistance(current:number,safe:number,delta:number,reducedMotion:boolean) {
  // Retract before drawing, never smooth through a wall. Only unobstructed
  // recovery is eased, preserving safety even after a large frame delta.
  return reducedMotion||safe<=current?safe:current+(safe-current)*(1-Math.exp(-7*Math.min(delta,.1)));
}

export function avatarBlocksLens(mode:CameraMode,distance:number,wasHidden:boolean) {
  if(mode==='first-person'||distance<.65)return true;
  return distance>.8?false:wasHidden;
}
export function writeCameraEye(out:{x:number;y:number;z:number},position:{x:number;y:number;z:number}) {
  out.x=position.x;out.y=position.y+PERSPECTIVE.eyeOffset;out.z=position.z;
}

// Authored seated/practice poses may face a different direction. Align only
// the temporary third-person composition; keep exploration intent untouched.
export function cameraRenderYaw(mode:CameraMode,lookYaw:number,bodyRotationY:number,physicsLocked:boolean) {
  return physicsLocked && mode !== 'first-person' ? wrapCameraYaw(-bodyRotationY) : lookYaw;
}
