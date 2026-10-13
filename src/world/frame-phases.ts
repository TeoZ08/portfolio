import type {DevFrameUpdates} from './DevFrameLoop';
export function runFramePhases(updates:DevFrameUpdates,delta:number) {
  updates.interaction?.(delta);
  updates.cameraInput?.(delta);
  updates.player?.(delta);
  updates.cameraTarget?.(delta);
  updates.cameraRig?.(delta);
}
