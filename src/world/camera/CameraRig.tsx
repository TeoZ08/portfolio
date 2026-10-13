"use client";
import {useThree} from '@react-three/fiber';
import {useRapier} from '@react-three/rapier';
import {useCallback,useEffect,useLayoutEffect,useRef} from 'react';
import {hideAvatarFromLens} from "../player/avatar-camera-visibility";
import {Vector3,Quaternion,Euler} from 'three';
import {CAMERA_RECENTER_EVENT,useExperienceState,worldInputBlocked} from '@/systems/experience-state';
import {useInteractionDebugState} from '@/world/interactions/interaction-state';
import type {CameraResyncRef,DevFrameUpdatesRef} from '@/world/DevFrameLoop';
import type {PlayerControlRef} from '@/world/player/player-control';
import type {PlayerMotionRef} from '@/world/player/player-motion';
import type {CameraPreset} from './camera-presets';
import type {CameraViewRef,CameraTargetRef} from './camera-types';
import {CAMERA_INPUT,getWheelIntent,getZoomRadius,isInteractiveCameraTarget,normalizeWheelDelta} from './camera-controls';
import {PERSPECTIVE,movementBasis,cameraDirection,wrapCameraYaw,clampLookPitch,perspectiveSign,safeCameraDistance,restoreCameraDistance,avatarBlocksLens,writeCameraEye,cameraRenderYaw} from './camera-perspectives';
import {useCameraState,cameraIntent,cameraTelemetry} from './camera-state';
type CameraPointer={pointerType:string;x:number;y:number;startX:number;startY:number};
export function CameraRig({cameraViewRef,frameUpdatesRef,resyncRef,motionRef,playerControlRef}: {
  cameraViewRef:CameraViewRef;frameUpdatesRef:DevFrameUpdatesRef;resyncRef:CameraResyncRef;motionRef:PlayerMotionRef;playerControlRef:PlayerControlRef;
  preset?:CameraPreset;targetRef:CameraTargetRef;
}) {
  const {camera,gl}=useThree();const {world,rapier}=useRapier();
  const manualRef=useRef({pendingYaw:0,pendingPitch:0,targetRadius:cameraIntent.radius,yaw:cameraIntent.yaw,pitch:cameraIntent.pitch,distance:0,avatarHidden:false,previousMode:useCameraState.getState().mode});
  const pointerStateRef=useRef({activePointerId:null as number|null,pointers:new Map<number,CameraPointer>(),pinchDistance:null as number|null});
  const scratch=useRef({eye:new Vector3(),direction:new Vector3(),desired:new Vector3(),quaternion:new Quaternion(),euler:new Euler(0,0,0,'YXZ')}).current;
  const shape=useRef(new rapier.Ball(PERSPECTIVE.cameraClearance)).current;
  const recenterCamera=useCallback(()=>{
    cameraIntent.yaw=wrapCameraYaw(-motionRef.current.rotationY);cameraIntent.pitch=PERSPECTIVE.defaultPitch;cameraIntent.radius=PERSPECTIVE.defaultRadius;
    manualRef.current.targetRadius=cameraIntent.radius;manualRef.current.pendingYaw=0;manualRef.current.pendingPitch=0;
  },[motionRef]);
  const prepare=useCallback((delta:number)=>{
    const m=manualRef.current;
    if(worldInputBlocked()){m.pendingYaw=0;m.pendingPitch=0;return;}
    cameraIntent.yaw=wrapCameraYaw(cameraIntent.yaw+m.pendingYaw);cameraIntent.pitch=clampLookPitch(cameraIntent.pitch+m.pendingPitch);
    cameraIntent.radius=m.targetRadius;m.pendingYaw=0;m.pendingPitch=0;
    const direct=useExperienceState.getState().reducedMotion;const a=direct?1:1-Math.exp(-18*delta);
    m.yaw=wrapCameraYaw(m.yaw+wrapCameraYaw(cameraIntent.yaw-m.yaw)*a);m.pitch+=(cameraIntent.pitch-m.pitch)*a;
    movementBasis(m.yaw,cameraViewRef.current);
  },[cameraViewRef]);
  const updateRig=useCallback((delta:number)=>{
    if(worldInputBlocked())return;
    const m=manualRef.current,mode=useCameraState.getState().mode,sign=perspectiveSign(mode);
    const motion=motionRef.current;writeCameraEye(scratch.eye,motion.position);
    const renderYaw=cameraRenderYaw(mode,m.yaw,motion.rotationY,playerControlRef.current.physicsLocked);
    cameraDirection(renderYaw,m.pitch,scratch.direction);
    const desiredDistance=sign===0?0:cameraIntent.radius;
    // Sweep a real sphere from the body-linked eye, rather than a thin ray
    // with a minimum radius that could force the lens through nearby walls.
    scratch.direction.multiplyScalar(sign||1);
    const hit=sign===0?null:world.castShape(scratch.eye,scratch.quaternion.identity(),scratch.direction,shape,0,desiredDistance,true,
      rapier.QueryFilterFlags.EXCLUDE_SENSORS|rapier.QueryFilterFlags.EXCLUDE_KINEMATIC);
    const safe=safeCameraDistance(desiredDistance,hit?.time_of_impact??null,0.02);
    const reduced=useExperienceState.getState().reducedMotion;
    const regionResync=resyncRef.current.stage===2;
    const start=regionResync?safe:mode!==m.previousMode?0:m.distance;
    m.distance=restoreCameraDistance(start,safe,delta,reduced);
    m.avatarHidden=avatarBlocksLens(mode,m.distance,m.avatarHidden);hideAvatarFromLens(m.avatarHidden);
    scratch.desired.copy(scratch.eye).addScaledVector(scratch.direction,m.distance);camera.position.copy(scratch.desired);
    const front=mode==='third-person-front';scratch.euler.set(front?-m.pitch:m.pitch,front?-renderYaw+Math.PI:-renderYaw,0,'YXZ');camera.quaternion.setFromEuler(scratch.euler);
    camera.near=.04;if('fov' in camera&&camera.fov!==PERSPECTIVE.fov){camera.fov=PERSPECTIVE.fov;camera.updateProjectionMatrix();}
    m.previousMode=mode;resyncRef.current.stage=0;
    cameraTelemetry.renderYaw=renderYaw;cameraTelemetry.yaw=m.yaw;cameraTelemetry.pitch=m.pitch;cameraTelemetry.distance=m.distance;cameraTelemetry.safeDistance=safe;
    cameraTelemetry.eye[0]=scratch.eye.x;cameraTelemetry.eye[1]=scratch.eye.y;cameraTelemetry.eye[2]=scratch.eye.z;cameraTelemetry.mode=mode;
  },[camera,motionRef,playerControlRef,rapier.QueryFilterFlags.EXCLUDE_KINEMATIC,rapier.QueryFilterFlags.EXCLUDE_SENSORS,resyncRef,scratch,shape,world]);
  useEffect(() => {
    const element = gl.domElement;
    const pointerState = pointerStateRef.current;
    const manualCamera = manualRef.current;

    const releasePointerCapture = (pointerId: number) => {
      if (element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId);
      }
    };

    const clearPointerInput = (clearPendingInput: boolean) => {
      for (const pointerId of pointerState.pointers.keys()) {
        releasePointerCapture(pointerId);
      }

      pointerState.pointers.clear();
      pointerState.activePointerId = null;
      pointerState.pinchDistance = null;

      if (clearPendingInput) {
        manualCamera.pendingYaw = 0;
        manualCamera.pendingPitch = 0;
      }
    };

    const getTouchPointers = () =>
      [...pointerState.pointers.entries()].filter(
        ([, pointer]) => pointer.pointerType === "touch",
      );

    const getTouchDistance = () => {
      const touches = getTouchPointers();

      if (touches.length < 2) {
        return null;
      }

      const first = touches[0][1];
      const second = touches[1][1];
      return Math.hypot(second.x - first.x, second.y - first.y);
    };

    const updateTouchMode = () => {
      const touches = getTouchPointers();

      if (touches.length >= 2) {
        pointerState.activePointerId = null;
        pointerState.pinchDistance = getTouchDistance();
        return;
      }

      pointerState.pinchDistance = null;
      pointerState.activePointerId = touches.length === 1 ? touches[0][0] : null;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if(event.pointerType==='touch' && event.clientX<gl.domElement.getBoundingClientRect().width*.45)return;
      if (
        (event.pointerType !== "touch" &&
          event.button !== 0 &&
          event.button !== 2) ||
        worldInputBlocked() ||
        isInteractiveCameraTarget(event.target)
      ) {
        return;
      }

      if (event.pointerType !== "touch") {
        clearPointerInput(false);
      }

      pointerState.pointers.set(event.pointerId, {
        pointerType: event.pointerType, startX: event.clientX, startY: event.clientY,
        x: event.clientX,
        y: event.clientY,
      });

      if (event.pointerType === "touch") {
        updateTouchMode();
      } else {
        pointerState.activePointerId = event.pointerId;
      }

      element.setPointerCapture(event.pointerId);
      event.preventDefault();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const pointer = pointerState.pointers.get(event.pointerId);

      if (!pointer) {
        return;
      }

      if (worldInputBlocked() || isInteractiveCameraTarget(event.target)) {
        clearPointerInput(true);
        return;
      }

      if (
        pointer.pointerType !== "touch" &&
        (event.buttons & 3) === 0
      ) {
        return;
      }

      const deltaX = event.clientX - pointer.x;
      const deltaY = event.clientY - pointer.y;
      pointer.x = event.clientX;
      pointer.y = event.clientY;

      if (pointer.pointerType === "touch") {
        const touchDistance = getTouchDistance();

        if (touchDistance !== null) {
          if (pointerState.pinchDistance !== null && useCameraState.getState().mode !== "first-person") {
            manualCamera.targetRadius = getZoomRadius(
              manualCamera.targetRadius,
              pointerState.pinchDistance - touchDistance,
              PERSPECTIVE.radiusLimits,
            );
          }

          pointerState.pinchDistance = touchDistance;
          event.preventDefault();
          return;
        }

        if (pointerState.activePointerId !== event.pointerId) {
          return;
        }

        manualCamera.pendingYaw +=
          deltaX * CAMERA_INPUT.touchYawSensitivity;
        manualCamera.pendingPitch -=
          deltaY * CAMERA_INPUT.touchPitchSensitivity;
        event.preventDefault();
        return;
      }

      if (pointerState.activePointerId !== event.pointerId || document.pointerLockElement === element) {
        return;
      }

      manualCamera.pendingYaw +=
        deltaX * CAMERA_INPUT.mouseYawSensitivity;
      manualCamera.pendingPitch -=
        deltaY * CAMERA_INPUT.mousePitchSensitivity;
      event.preventDefault();
    };

    const handleWheel = (event: WheelEvent) => {
      if (
        worldInputBlocked() ||
        isInteractiveCameraTarget(event.target)
      ) {
        return;
      }

      const deltaX = normalizeWheelDelta(
        event.deltaX,
        event.deltaMode,
        window.innerWidth,
      );
      const deltaY = normalizeWheelDelta(
        event.deltaY,
        event.deltaMode,
        window.innerHeight,
      );

      if (getWheelIntent(event) === "orbit") {
        // Wheel deltas describe content scroll and are opposite to the
        // physical two-finger gesture. Invert them to match mouse dragging.
        manualCamera.pendingYaw -=
          deltaX * CAMERA_INPUT.trackpadYawSensitivity;
        manualCamera.pendingPitch +=
          deltaY * CAMERA_INPUT.trackpadPitchSensitivity;
      } else if (useCameraState.getState().mode !== "first-person") {
        manualCamera.targetRadius = getZoomRadius(
          manualCamera.targetRadius,
          deltaY,
          PERSPECTIVE.radiusLimits,
        );
      }

      event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F5") {
        event.preventDefault();
        if (!event.repeat && !worldInputBlocked() && !isInteractiveCameraTarget(event.target)) useCameraState.getState().cycle();
        return;
      }
      if (
        event.key.toLowerCase() !== "c" ||
        event.repeat ||
        worldInputBlocked() ||
        isInteractiveCameraTarget(event.target)
      ) {
        return;
      }

      recenterCamera();
      event.preventDefault();
    };

    const handleRecenterRequest = () => {
      if (!worldInputBlocked()) {
        recenterCamera();
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      const pointer = pointerState.pointers.get(event.pointerId);

      if (!pointer) {
        return;
      }

      const consciousClick=pointer.pointerType === 'mouse' && event.button === 0 && Math.hypot(event.clientX-pointer.startX,event.clientY-pointer.startY)<5;
      releasePointerCapture(event.pointerId);
      pointerState.pointers.delete(event.pointerId);
      if(consciousClick && !worldInputBlocked() && window.innerWidth>600 && !matchMedia('(pointer:coarse)').matches) {
        void element.requestPointerLock()?.catch(()=>{});
      }

      if (pointer.pointerType === "touch") {
        updateTouchMode();
      } else if (pointerState.activePointerId === event.pointerId) {
        pointerState.activePointerId = null;
      }
    };

    const handlePointerCancel = (event: PointerEvent) => {
      const pointer = pointerState.pointers.get(event.pointerId);

      if (!pointer) {
        return;
      }

      releasePointerCapture(event.pointerId);
      pointerState.pointers.delete(event.pointerId);

      if (pointer.pointerType === "touch") {
        updateTouchMode();
      } else if (pointerState.activePointerId === event.pointerId) {
        pointerState.activePointerId = null;
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      if (!worldInputBlocked() && !isInteractiveCameraTarget(event.target)) {
        event.preventDefault();
      }
    };

    const handleWindowBlur = () => {
      unlock();
      clearPointerInput(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        unlock();
        clearPointerInput(true);
      }
    };

    const unlock=()=>{if(document.pointerLockElement===element) document.exitPointerLock();};
    const relativeLook=(event:MouseEvent)=>{
      if(document.pointerLockElement!==element)return;
      if(worldInputBlocked()){unlock();return;}
      manualCamera.pendingYaw+=event.movementX*.0025;
      manualCamera.pendingPitch-=event.movementY*.0025;
    };
    const unsubscribe=useExperienceState.subscribe(()=>{if(worldInputBlocked()){unlock();clearPointerInput(true);}});
    const interactionSubscription=useInteractionDebugState.subscribe(state=>{if(state.status!=='idle'){unlock();clearPointerInput(true);}});
    document.addEventListener('mousemove',relativeLook);
    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", handlePointerUp);
    element.addEventListener("pointercancel", handlePointerCancel);
    element.addEventListener("contextmenu", handleContextMenu);
    element.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener(CAMERA_RECENTER_EVENT, handleRecenterRequest);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      unlock();unsubscribe();interactionSubscription();document.removeEventListener('mousemove',relativeLook);
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", handlePointerUp);
      element.removeEventListener("pointercancel", handlePointerCancel);
      element.removeEventListener("contextmenu", handleContextMenu);
      element.removeEventListener("wheel", handleWheel);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener(CAMERA_RECENTER_EVENT, handleRecenterRequest);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearPointerInput(true);
    };
  }, [gl, recenterCamera]);

  useLayoutEffect(()=>{
    const updates=frameUpdatesRef.current;updates.cameraInput=prepare;updates.cameraRig=updateRig;
    return()=>{if(updates.cameraInput===prepare)updates.cameraInput=null;if(updates.cameraRig===updateRig)updates.cameraRig=null;};
  },[frameUpdatesRef,prepare,updateRig]);
  return null;
}
