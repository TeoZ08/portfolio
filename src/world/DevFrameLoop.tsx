"use client";

import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";

export type DevFramePhase = (delta: number) => void;

export type CameraResyncStage = 0 | 1 | 2;

export type CameraResyncState = {
  active: boolean;
  stage: CameraResyncStage;
};

export type CameraResyncRef = {
  current: CameraResyncState;
};

export type DevFrameUpdates = {
  player: DevFramePhase | null;
  cameraTarget: DevFramePhase | null;
  cameraRig: DevFramePhase | null;
};

export type DevFrameUpdatesRef = {
  current: DevFrameUpdates;
};

const MAX_DEV_FRAME_DELTA = 0.1;

export function createDevFrameUpdates(): DevFrameUpdates {
  return {
    player: null,
    cameraTarget: null,
    cameraRig: null,
  };
}

export function createCameraResyncState(): CameraResyncState {
  return {
    active: true,
    stage: 0,
  };
}

export function DevFrameLoop({
  frameUpdatesRef,
  cameraResyncRef,
}: {
  frameUpdatesRef: DevFrameUpdatesRef;
  cameraResyncRef: CameraResyncRef;
}) {
  useEffect(() => {
    const state = cameraResyncRef.current;
    const requestResync = () => {
      state.stage = 1;
    };
    const handleBlur = () => {
      state.active = false;
      requestResync();
    };
    const handleFocus = () => {
      state.active = true;
      requestResync();
    };
    const handleVisibilityChange = () => {
      state.active = !document.hidden;
      requestResync();
    };

    state.active = !document.hidden;
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [cameraResyncRef]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_DEV_FRAME_DELTA);

    if (delta <= 0) {
      return;
    }

    const updates = frameUpdatesRef.current;

    // Keep the update order explicit while staying on R3F's normal loop.
    updates.player?.(delta);
    updates.cameraTarget?.(delta);
    updates.cameraRig?.(delta);
  });

  return null;
}
