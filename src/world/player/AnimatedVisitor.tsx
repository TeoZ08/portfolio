"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AnimationMixer, type AnimationAction, type Mesh, type SkinnedMesh, type Group } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { useExperienceState } from "@/systems/experience-state";
import type { PlayerMotionRef } from "./player-motion";
import type { PlayerControlRef } from "./player-control";
import { AVATAR_POSES, getAvatarCadence, getAvatarPose, getAvatarSeatOffset, getAvatarDojoLift, type AvatarPose } from "./avatar-animation";

import { useInteractionDebugState } from "@/world/interactions/interaction-state";
import { PLACE_LAYOUT } from "@/world/regions/places/place-layout";
import { FIELD_SCALE } from "@/world/regions/world-scale";

type AnimationState = { mixer: AnimationMixer; actions: Record<AvatarPose, AnimationAction>; current: AvatarPose };

export function AnimatedVisitor({ motionRef, controlRef }: { motionRef: PlayerMotionRef; controlRef: PlayerControlRef }) {
  const gltf = useLoader(GLTFLoader, "/assets/characters/matteo-chibi-v3.glb");
  const visual = useRef<Group>(null);
  const seatOffset = useRef(-.466);
  const model = useMemo(() => {
    const model = clone(gltf.scene);
    model.traverse(object => {
      const mesh = object as Mesh;
      if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; }
    });
    return model;
  }, [gltf.scene]);
  const animation = useRef<AnimationState | null>(null);
  const qaEnabled = useMemo(() => process.env.NODE_ENV !== "production" && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("avatarQA"), []);

  useEffect(() => {
    const mixer = new AnimationMixer(model);
    const actions = Object.fromEntries(gltf.animations.map(clip => [clip.name, mixer.clipAction(clip)])) as Record<AvatarPose, AnimationAction>;
    if (AVATAR_POSES.some(pose => !actions[pose])) {
      throw new Error("Matteo avatar is missing a required animation clip");
    }
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

  useFrame((root, rawDelta) => {
    const state = animation.current;
    // Opt-in local diagnostics, disabled in production.
    if (qaEnabled) Object.assign(root.gl.domElement, { __avatarQA: { root, motionRef, controlRef, animation: state } });
    if (!state || useExperienceState.getState().overlay) return;
    const speed = Math.hypot(motionRef.current.velocity.x, motionRef.current.velocity.z);
    const pose = getAvatarPose(motionRef.current, controlRef.current);
    if (pose !== state.current) {
      const next = state.actions[pose];
      next.reset();
      next.paused = pose === "seated-pose" || pose === "jump";
      next.play();
      next.crossFadeFrom(state.actions[state.current], useExperienceState.getState().reducedMotion ? 0 : .18, false);
      // Seated and airborne poses are authored holds, not looping locomotion.
      if (pose === "seated-pose" || pose === "jump") { next.time = 0; next.paused = true; }
      state.current = pose;
    }
    state.actions.walk.timeScale = getAvatarCadence("walk", speed);
    state.actions.run.timeScale = getAvatarCadence("run", speed);
    const reducedMotion = useExperienceState.getState().reducedMotion;
    state.actions.idle.paused = reducedMotion;
    state.actions.practice.paused = reducedMotion;
    state.mixer.update(Math.min(rawDelta, .1));
    // Blend visual alignment with the seated action; Rapier remains unchanged.
    if (visual.current) {
      const dojo = PLACE_LAYOUT.dojo;
      const dx = motionRef.current.position.x / FIELD_SCALE - dojo.x;
      const dz = motionRef.current.position.z / FIELD_SCALE - dojo.z;
      const localX = dx * Math.cos(dojo.yaw) - dz * Math.sin(dojo.yaw);
      const localZ = dx * Math.sin(dojo.yaw) + dz * Math.cos(dojo.yaw);
      if (controlRef.current.physicsLocked) seatOffset.current = getAvatarSeatOffset(useInteractionDebugState.getState().activeTargetId);
      const standingOffset = -.85 + getAvatarDojoLift(localX, localZ, FIELD_SCALE);
      const seated = state.actions["seated-pose"];
      const seatWeight = seated.isScheduled() ? seated.getEffectiveWeight() : 0;
      visual.current.position.y = standingOffset + (seatOffset.current - standingOffset) * seatWeight;
    }
  });

  // Original model is authored at metre scale, facing +Z after glTF export.
  // Match the capsule's -Z forward and foot plane without changing physics.
  return <group name="MATTEO_AVATAR_CHIBI_V3" ref={visual} scale={1.12} position={[0, -.85, 0]} rotation={[0, Math.PI, 0]} dispose={null}>
    <primitive object={model} />
  </group>;
}
