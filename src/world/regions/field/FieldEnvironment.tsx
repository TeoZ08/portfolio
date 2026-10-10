"use client";

import { useThree } from "@react-three/fiber";
import { useCallback, useMemo, useEffect } from "react";
import { useWorldState } from "@/systems/world-state";
import { useExperienceState } from "@/systems/experience-state";
import { FieldLandscape } from "./FieldLandscape";
import { FIELD_LIGHTING } from "./FieldMaterial";
import { fieldDaylight } from "./field-daylight";
import { Object3D } from "three";
import { FieldSky } from "./FieldSky";

export function FieldEnvironment() {
  const time = useWorldState(state => state.timeOfDay);
  const lowQuality = useExperienceState(state => state.quality === "low");
  const daylight = fieldDaylight(time);
  const sunTarget = useMemo(() => { const target = new Object3D(); target.position.set(0, 0, 0); return target; }, []);
  const {scene,gl,camera} = useThree();
  useEffect(()=>{
    if(process.env.NODE_ENV==='production')return;
    // Read-only diagnostics for local QA; no player/store mutation API.
    const diagnostics={read:()=>({renderer:gl.getContext().getParameter(gl.getContext().RENDERER),calls:gl.info.render.calls,triangles:gl.info.render.triangles,textures:gl.info.memory.textures,geometries:gl.info.memory.geometries,camera:camera.position.toArray()}),shaders:()=>gl.info.programs?.map(p=>{const program=p as unknown as {program:WebGLProgram};return gl.getContext().getAttachedShaders(program.program)?.map(s=>gl.getContext().getShaderSource(s));})};
    Object.assign(window,{__environmentQA:diagnostics});
    return ()=>{delete (window as unknown as {__environmentQA?:unknown}).__environmentQA;};
  },[gl,camera]);
  const attachFog = useCallback((_parent: unknown, fog: unknown) => {
    const previous = scene.fog;
    scene.fog = fog as typeof scene.fog;
    return () => { scene.fog = previous; };
  }, [scene]);
  return (
    <group name="FIELD_PAINTED_DAYLIGHT">
      <fog attach={attachFog} args={[daylight.horizon, daylight.fogNear, daylight.fogFar]} />
      <hemisphereLight args={[daylight.night ? "#a7bac9" : "#c3dcf4", FIELD_LIGHTING.groundFill, daylight.fill]} />
      <directionalLight name="FIELD_COOL_SKY_BOUNCE" position={[35, 55, 65]} color="#d8e9ff" intensity={daylight.night ? .12 : .45} />
      <primitive object={sunTarget} />
      <directionalLight name="FIELD_VISIBLE_SUN" target={sunTarget} position={[daylight.direction[0] * 100, daylight.direction[1] * 100, 0 + daylight.direction[2] * 100]}
        color={daylight.sun} intensity={daylight.intensity} castShadow={!lowQuality}
        shadow-mapSize={lowQuality ? [1024, 1024] : [2048, 2048]} shadow-camera-left={-48} shadow-camera-right={48}
        shadow-camera-top={45} shadow-camera-bottom={-45}
        shadow-camera-near={1} shadow-camera-far={220}
        shadow-radius={3} shadow-bias={-0.0002} shadow-normalBias={0.065} />
      <FieldSky hour={time} />
      <FieldLandscape />
    </group>
  );
}
