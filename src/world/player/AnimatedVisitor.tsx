"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { AnimationMixer, AnimationUtils, AdditiveAnimationBlendMode, type AnimationAction, type Mesh, type SkinnedMesh, type Group } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import {registerAvatarCameraView} from "./avatar-camera-visibility";
import { useExperienceState } from "@/systems/experience-state";
import type { PlayerMotionRef } from "./player-motion";
import type { PlayerControlRef } from "./player-control";
import { AVATAR_POSES, getAvatarSeatOffset, getAvatarDojoLift, type AvatarPose } from "./avatar-animation";
import { advanceAvatarMotion, createAvatarMotionClock, consumeAvatarTravel, advanceGaitByDistance, alignedGaitPhase, MOTION_GAITS, CYCLE1_GAITS, type AvatarMotionClock, type AvatarTravelClock, type MotionPhase, type JumpPlayback } from "./avatar-motion-clock";

import { useInteractionDebugState } from "@/world/interactions/interaction-state";
import { PLACE_LAYOUT } from "@/world/regions/places/place-layout";
import { FIELD_SCALE } from "@/world/regions/world-scale";

type AnimationState = {
  mixer: AnimationMixer;
  actions: Record<string, AnimationAction>;
  current: AvatarPose;
  activeClip: string;
  phase: MotionPhase;
  clock: AvatarMotionClock;
  movingLanding: AnimationAction | null;
  travel: AvatarTravelClock;
};

export function AnimatedVisitor({ motionRef, controlRef }: { motionRef: PlayerMotionRef; controlRef: PlayerControlRef }) {
  const reviewRevision = useMemo(() => {
    const requested = process.env.NODE_ENV !== "production" && typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("motionCandidate") : null;
    return requested === "cycle1" || requested === "cycle2" ? requested : "cycle3";
  }, []);
  const gaitProfile = reviewRevision === "cycle1" ? CYCLE1_GAITS : MOTION_GAITS;
  const gltf = useLoader(GLTFLoader, `/assets/characters/matteo-chibi-motion-goal21-${reviewRevision}.glb`);
  const visual = useRef<Group>(null);
  const seatOffset = useRef(-.466);
  const model = useMemo(() => {
    const model = clone(gltf.scene);
    model.traverse(object => {
      const mesh = object as Mesh;
      if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true;
        mesh.material=Array.isArray(mesh.material)?mesh.material.map(m=>m.clone()):mesh.material.clone();
      }
    });
    return model;
  }, [gltf.scene]);
  useLayoutEffect(()=>registerAvatarCameraView(model),[model]);
  useEffect(()=>()=>{model.traverse(o=>{const m=o as Mesh;if(m.isMesh)(Array.isArray(m.material)?m.material:[m.material]).forEach(mat=>mat.dispose());});},[model]);
  const animation = useRef<AnimationState | null>(null);
  const qaEnabled = useMemo(() => process.env.NODE_ENV !== "production" && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("avatarQA"), []);
  const jumpPlayback = useMemo<JumpPlayback>(() => process.env.NODE_ENV !== "production" && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("jumpPrototype") === "sampled" ? "sampled" : "phases", []);

  useEffect(() => {
    const mixer = new AnimationMixer(model);
    const actions = Object.fromEntries(gltf.animations.map(clip => [clip.name, mixer.clipAction(clip)])) as Record<string, AnimationAction>;
    if (AVATAR_POSES.some(pose => !actions[pose])) {
      throw new Error("Matteo avatar is missing a required animation clip");
    }
    actions.idle.play();
    // Moving landings keep locomotion on the legs. An additive upper-body
    // recoil supplies impact without pausing input or dragging a planted pose.
    const landing = gltf.animations.find(clip => clip.name === "jump-land");
    let movingLanding: AnimationAction | null = null;
    if (landing) {
      const upper = landing.clone();
      upper.name = "goal21-moving-impact";
      upper.tracks = upper.tracks.filter(track => /^(spine|chest|neck|head|clavicle[LR]|upper_arm[LR]|forearm[LR]|hand[LR]|elbow_support[LR])\./.test(track.name));
      AnimationUtils.makeClipAdditive(upper, 0, landing);
      movingLanding = mixer.clipAction(upper);
      movingLanding.blendMode = AdditiveAnimationBlendMode;
      movingLanding.play().setEffectiveWeight(0);
      movingLanding.paused = true;
    }
    mixer.update(0);
    animation.current = { mixer, actions, current: "idle", activeClip: "idle", phase: "ground", clock: createAvatarMotionClock(), movingLanding, travel: { previous: null } };
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
    if (qaEnabled) Object.assign(root.gl.domElement, { __avatarQA: { root, motionRef, controlRef, animation: state, motionReview: { asset: reviewRevision, gaitProfile, jumpPlayback } } });
    if (!state) return;
    const distance = consumeAvatarTravel(state.travel, motionRef.current.position);
    if (useExperienceState.getState().overlay) return;
    const reducedMotion = useExperienceState.getState().reducedMotion;
    const decision = advanceAvatarMotion(state.clock, motionRef.current, controlRef.current, rawDelta, jumpPlayback);
    const pose = decision.pose;
    const name = state.actions[decision.clip] ? decision.clip : pose;
    if (name !== state.activeClip) {
      const previous = state.actions[state.activeClip];
      const next = state.actions[name];
      const fromGait = state.activeClip === "walk" || state.activeClip === "run";
      const toGait = name === "walk" || name === "run";
      const phase = fromGait && toGait ? alignedGaitPhase(previous.time / previous.getClip().duration, state.activeClip as "walk" | "run", name as "walk" | "run", gaitProfile) : toGait ? .25 : 0;
      next.reset();
      next.time = phase * next.getClip().duration;
      next.paused = pose === "seated-pose" || decision.fraction !== null;
      next.play();
      next.crossFadeFrom(previous, reducedMotion ? 0 : decision.phase === "ground" ? .10 : .06, false);
      state.activeClip = name;
    }
    state.current = pose;
    state.phase = decision.phase;
    if (decision.fraction !== null) {
      state.actions[name].time = decision.fraction * state.actions[name].getClip().duration;
      state.actions[name].paused = true;
    }
    // Rapier's rendered kinematic transform and its published next position are
    // staggered by a frame. Integrating the next render delta here caused foot
    // jitter at uneven frame times. Consume completed travel instead; physics
    // and input remain untouched, including during fades between the two gaits.
    for (const gait of ["walk", "run"] as const) {
      state.actions[gait].paused = true;
      state.actions[gait].time = advanceGaitByDistance(state.actions[gait].time, distance, gaitProfile[gait]);
    }
    if (state.movingLanding) {
      state.movingLanding.setEffectiveWeight(decision.movingImpact === null ? 0 : reducedMotion ? .5 : 1);
      if (decision.movingImpact !== null) state.movingLanding.time = decision.movingImpact * state.movingLanding.getClip().duration;
    }
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
