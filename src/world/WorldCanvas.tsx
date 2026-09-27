"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useEffect, useRef, type ReactNode } from "react";

import { useWorldState, type WorldRegion } from "@/systems/world-state";
import { useExperienceState } from "@/systems/experience-state";
import {
  createCameraResyncState,
  createDevFrameUpdates,
  DevFrameLoop,
} from "@/world/DevFrameLoop";
import { CameraRig } from "@/world/camera/CameraRig";
import { CameraTarget } from "@/world/camera/CameraTarget";
import { EXPLORE_CAMERA_PRESET, type CameraPreset } from "@/world/camera/camera-presets";
import {
  createCameraTargetState,
  createCameraViewState,
} from "@/world/camera/camera-types";
import { InteractionSystem } from "@/world/interactions/InteractionSystem";
import type { InteractionTarget } from "@/world/interactions/interaction-types";
import { DevPlayer } from "@/world/player/DevPlayer";
import { createPlayerControlState } from "@/world/player/player-control";
import { createPlayerMotionState } from "@/world/player/player-motion";

const EMPTY_INTERACTION_TARGETS: readonly InteractionTarget[] = [];

type WorldCanvasProps = {
  children: ReactNode;
  canvasLabel: string;
  region: WorldRegion;
  dataWorldMode: "physics-playground" | "vertical-slice";
  backgroundColor?: string;
  showHelpers?: boolean;
  playerColor?: string;
  cameraPreset?: CameraPreset;
  targets?: readonly InteractionTarget[];
};

function DevelopmentHelpers() {
  return (
    <>
      <axesHelper args={[1.5]} />
      <gridHelper args={[10, 10]} />
    </>
  );
}

export function WorldCanvas({
  backgroundColor = "#111111",
  canvasLabel,
  children,
  dataWorldMode,
  region,
  showHelpers = false,
  playerColor,
  cameraPreset = EXPLORE_CAMERA_PRESET,
  targets = EMPTY_INTERACTION_TARGETS,
}: WorldCanvasProps) {
  const currentRegion = useWorldState((state) => state.currentRegion);
  const timeOfDay = useWorldState((state) => state.timeOfDay);
  const lowQuality = useExperienceState((state) => state.quality === "low");
  const setCurrentRegion = useWorldState((state) => state.setCurrentRegion);
  const beginRegionTransition = useWorldState(
    (state) => state.beginRegionTransition,
  );
  const completeRegionTransition = useWorldState(
    (state) => state.completeRegionTransition,
  );
  const isDevelopment = process.env.NODE_ENV !== "production";
  const frameUpdatesRef = useRef(createDevFrameUpdates());
  const motionRef = useRef(createPlayerMotionState());
  const playerControlRef = useRef(createPlayerControlState());
  const cameraTargetRef = useRef(createCameraTargetState());
  const cameraViewRef = useRef(
    createCameraViewState(cameraPreset.offset),
  );
  const cameraResyncRef = useRef(createCameraResyncState());

  useEffect(() => {
    setCurrentRegion(region);
  }, [region, setCurrentRegion]);

  return (
    <section
      className="world-canvas"
      aria-label={canvasLabel}
      data-current-region={currentRegion}
      data-playground={
        dataWorldMode === "physics-playground" ? "physics" : undefined
      }
      data-time-of-day={timeOfDay}
      data-world-mode={dataWorldMode}
    >
      <Canvas
        shadows={dataWorldMode === "vertical-slice" && !lowQuality ? "soft" : false}
        camera={{
          position: cameraPreset.initialPosition,
          fov: cameraPreset.fov,
        }}
        dpr={lowQuality ? 1 : [1, 2]}
      >
        <color attach="background" args={[backgroundColor]} />
        {isDevelopment && showHelpers ? <DevelopmentHelpers /> : null}
        <Physics
          colliders={false}
          gravity={[0, -20, 0]}
          interpolate={false}
          timeStep="vary"
        >
          {children}
          <InteractionSystem
            cameraResyncRef={cameraResyncRef}
            frameUpdatesRef={frameUpdatesRef}
            motionRef={motionRef}
            onTransitionComplete={completeRegionTransition}
            onTransitionStart={beginRegionTransition}
            playerControlRef={playerControlRef}
            targets={targets}
          />
          <DevPlayer
            solidColor={playerColor}
            cameraViewRef={cameraViewRef}
            frameUpdatesRef={frameUpdatesRef}
            motionRef={motionRef}
            playerControlRef={playerControlRef}
          />
          <CameraTarget
            preset={cameraPreset}
            frameUpdatesRef={frameUpdatesRef}
            motionRef={motionRef}
            playerControlRef={playerControlRef}
            resyncRef={cameraResyncRef}
            targetRef={cameraTargetRef}
          />
          <CameraRig
            preset={cameraPreset}
            cameraViewRef={cameraViewRef}
            frameUpdatesRef={frameUpdatesRef}
            resyncRef={cameraResyncRef}
            targetRef={cameraTargetRef}
          />
          <DevFrameLoop
            frameUpdatesRef={frameUpdatesRef}
            cameraResyncRef={cameraResyncRef}
          />
        </Physics>
      </Canvas>
    </section>
  );
}
