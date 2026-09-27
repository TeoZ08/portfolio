"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AnimationMixer, type AnimationAction, type Mesh, type SkinnedMesh } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { useExperienceState } from "@/systems/experience-state";
import type { PlayerMotionRef } from "./player-motion";
import type { PlayerControlRef } from "./player-control";

type Pose = "idle" | "walk" | "seated-pose";
type AnimationState = { mixer: AnimationMixer; actions: Record<Pose, AnimationAction>; current: Pose };

export function AnimatedVisitor({ motionRef, controlRef }: { motionRef: PlayerMotionRef; controlRef: PlayerControlRef }) {
  const gltf = useLoader(GLTFLoader, "/assets/characters/visitor.glb");
  const model = useMemo(() => {
    const model = clone(gltf.scene);
    model.traverse(object => {
      const mesh = object as Mesh;
      if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; }
    });
    return model;
  }, [gltf.scene]);
  const animation = useRef<AnimationState | null>(null);

  useEffect(() => {
    const mixer = new AnimationMixer(model);
    const actions = Object.fromEntries(gltf.animations.map(clip => [clip.name, mixer.clipAction(clip)])) as Record<Pose, AnimationAction>;
    if (!actions.idle || !actions.walk || !actions["seated-pose"]) return;
    actions.idle.play();
    mixer.update(0);
    animation.current = { mixer, actions, current: "idle" };
    return () => {
      animation.current = null;
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      model.traverse(object => { const mesh = object as SkinnedMesh; if (mesh.isSkinnedMesh) mesh.skeleton.dispose(); });
    };
  }, [gltf.animations, model]);

  useFrame((_, rawDelta) => {
    const state = animation.current;
    if (!state || useExperienceState.getState().overlay) return;
    const speed = Math.hypot(motionRef.current.velocity.x, motionRef.current.velocity.z);
    const pose: Pose = controlRef.current.physicsLocked ? "seated-pose" : speed > .12 ? "walk" : "idle";
    if (pose !== state.current) {
      const next = state.actions[pose];
      next.reset().play();
      next.crossFadeFrom(state.actions[state.current], useExperienceState.getState().reducedMotion ? 0 : .18, false);
      // One fixed sitting pose; interaction state/position remain owned by Rapier.
      if (pose === "seated-pose") { next.time = .35; next.paused = true; }
      state.current = pose;
    }
    state.actions.walk.timeScale = Math.min(1.65, Math.max(.55, speed / 2.8));
    state.mixer.update(Math.min(rawDelta, .1));
  });

  // KayKit faces +Z and is 2.27 m tall. Match the current capsule's -Z forward
  // and foot plane; the visual never writes a world position or physical yaw.
  return <group name="VISITOR_KAYKIT_TRAVELLER" position={[0, -.84, 0]} rotation={[0, Math.PI, 0]} scale={.78} dispose={null}>
    <primitive object={model} />
  </group>;
}
