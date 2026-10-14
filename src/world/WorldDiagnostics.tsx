"use client";
import {cameraTelemetry,useCameraState} from "./camera/camera-state";
import {useInteractionDebugState} from "./interactions/interaction-state";
import type { PlayerMotionRef } from "./player/player-motion";
import type { PlayerControlRef } from "./player/player-control";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

// Read-only counters for local browser/asset QA, including the House region.
export function WorldDiagnostics({ motionRef, playerControlRef }: { motionRef: PlayerMotionRef; playerControlRef: PlayerControlRef }) {
  const { gl, camera, scene } = useThree();
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const context = gl.getContext();
    const debug = context.getExtension("WEBGL_debug_renderer_info");
    const diagnostics = { inspect: (name: string) => {
      const object = scene.getObjectByName(name);
      return object ? { name: object.name, rotation: object.rotation.toArray(),
        children: object.children.map(child => ({ name: child.name,
          rotation: child.rotation.toArray(), children: child.children.map(node => node.name) })) } : null;
    }, read: () => ({
      playerMotion: { ...motionRef.current, position: {...motionRef.current.position}, velocity: {...motionRef.current.velocity} },
      playerControl: { ...playerControlRef.current, desiredVelocity: {...playerControlRef.current.desiredVelocity} },
      interaction: { status: useInteractionDebugState.getState().status,
        candidateId: useInteractionDebugState.getState().candidateId,
        activeTargetId: useInteractionDebugState.getState().activeTargetId,
        blockedReason: useInteractionDebugState.getState().candidateBlockedReason },
      renderer: debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : context.getParameter(context.RENDERER),
      calls: gl.info.render.calls, triangles: gl.info.render.triangles,
      textures: gl.info.memory.textures, geometries: gl.info.memory.geometries,
      camera: camera.position.toArray(),
      perspective:{...cameraTelemetry,eye:[...cameraTelemetry.eye],selected:useCameraState.getState().mode,quaternion:camera.quaternion.toArray(),locked:!!document.pointerLockElement,interaction:useInteractionDebugState.getState().status},
      fog: scene.fog ? {color: scene.fog.color.getHexString(), near: "near" in scene.fog ? scene.fog.near : null, far: "far" in scene.fog ? scene.fog.far : null} : null,
      hazePrograms: gl.info.programs?.filter(p => context.getShaderSource(p.fragmentShader)?.includes("hazeDensity")).length,
    }) };
    Object.assign(window, { __environmentQA: diagnostics });
    return () => { delete (window as unknown as { __environmentQA?: unknown }).__environmentQA; };
  }, [gl, camera, scene, motionRef, playerControlRef]);
  return null;
}
