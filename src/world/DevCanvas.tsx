"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useRef } from "react";

import { useWorldState } from "@/systems/world-state";
import {
  createCameraResyncState,
  createDevFrameUpdates,
  DevFrameLoop,
} from "@/world/DevFrameLoop";
import { CameraRig } from "@/world/camera/CameraRig";
import { CameraTarget } from "@/world/camera/CameraTarget";
import { EXPLORE_CAMERA_PRESET } from "@/world/camera/camera-presets";
import { createCameraTargetState } from "@/world/camera/camera-types";
import { InteractionSystem } from "@/world/interactions/InteractionSystem";
import { DEV_INTERACTION_TARGETS } from "@/world/interactions/dev-interaction-targets";
import { DevPlayground } from "@/world/playground/DevPlayground";
import { DevPlayer } from "@/world/player/DevPlayer";
import { createPlayerControlState } from "@/world/player/player-control";
import { createPlayerMotionState } from "@/world/player/player-motion";

function DevelopmentHelpers() {
  return (
    <>
      <axesHelper args={[1.5]} />
      <gridHelper args={[10, 10]} />
    </>
  );
}

export function DevCanvas() {
  const currentRegion = useWorldState((state) => state.currentRegion);
  const timeOfDay = useWorldState((state) => state.timeOfDay);
  const isDevelopment = process.env.NODE_ENV !== "production";
  const frameUpdatesRef = useRef(createDevFrameUpdates());
  const motionRef = useRef(createPlayerMotionState());
  const playerControlRef = useRef(createPlayerControlState());
  const cameraTargetRef = useRef(createCameraTargetState());
  const cameraResyncRef = useRef(createCameraResyncState());

  return (
    <section
      className="foundation-canvas"
      aria-label="Canvas de desenvolvimento com playground de física"
      data-current-region={currentRegion}
      data-time-of-day={timeOfDay}
      data-playground="physics"
    >
      <Canvas
        camera={{
          position: EXPLORE_CAMERA_PRESET.initialPosition,
          fov: EXPLORE_CAMERA_PRESET.fov,
        }}
        dpr={[1, 2]}
      >
        {isDevelopment ? (
          <>
            <DevelopmentHelpers />
            <Physics
              colliders={false}
              gravity={[0, -20, 0]}
              interpolate={false}
              timeStep="vary"
            >
              <DevPlayground />
              <InteractionSystem
                frameUpdatesRef={frameUpdatesRef}
                motionRef={motionRef}
                playerControlRef={playerControlRef}
                targets={DEV_INTERACTION_TARGETS}
              />
              <DevPlayer
                frameUpdatesRef={frameUpdatesRef}
                motionRef={motionRef}
                playerControlRef={playerControlRef}
              />
              <CameraTarget
                frameUpdatesRef={frameUpdatesRef}
                motionRef={motionRef}
                resyncRef={cameraResyncRef}
                targetRef={cameraTargetRef}
              />
              <CameraRig
                frameUpdatesRef={frameUpdatesRef}
                resyncRef={cameraResyncRef}
                targetRef={cameraTargetRef}
              />
              <DevFrameLoop
                frameUpdatesRef={frameUpdatesRef}
                cameraResyncRef={cameraResyncRef}
              />
            </Physics>
          </>
        ) : null}
      </Canvas>
    </section>
  );
}
