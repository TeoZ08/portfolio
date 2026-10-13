import {create} from 'zustand';
import {nextCameraMode,PERSPECTIVE,type CameraMode} from './camera-perspectives';
export const useCameraState=create<{mode:CameraMode;cycle:()=>void}>((set)=>({
  mode:'third-person-back',cycle:()=>set(s=>({mode:nextCameraMode(s.mode)})),
}));
// Mutable intent is shared across region/preset changes and never set through
// React every frame. Only mode changes are published to UI by Zustand.
export const cameraIntent={yaw:0,pitch:PERSPECTIVE.defaultPitch as number,radius:PERSPECTIVE.defaultRadius as number};
export const cameraTelemetry={renderYaw:0,yaw:0,pitch:0,distance:0,safeDistance:0,eye:[0,0,0],mode:'third-person-back' as CameraMode};
