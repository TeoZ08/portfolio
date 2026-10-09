"use client";

import { useThree } from "@react-three/fiber";
import { useCallback, useMemo } from "react";
import { useWorldState } from "@/systems/world-state";
import { useExperienceState } from "@/systems/experience-state";
import { FieldGeometry } from "./FieldMeshes";
import { makeSurface } from "./field-geometry";
import { FIELD_PALETTE as P, linearColor } from "./field-palette";
import { FIELD_LIGHTING } from "./FieldMaterial";
import { fieldDaylight } from "./field-daylight";
import { Object3D, Vector3 } from "three";
import { FieldClouds } from "./FieldClouds";

function makeHorizon(layer: number) {
  const vertices: number[] = [], triangles: number[] = [], colors: number[] = [];
  const base = linearColor([P.hill, P.hillMiddle, P.hillFar][layer]);
  const slices = 120;
  const rings = 14;
  for (let row = 0; row <= rings; row += 1) {
    const t = row / rings;
    for (let col = 0; col <= slices; col += 1) {
      const angle = col / slices * Math.PI * 2;
      const radiusX = 63 + layer * 37 + t * 58;
      const radiusZ = 78 + layer * 38 + t * 63;
      const peaks = 5 + layer * 4 + 3 * Math.sin(angle * 3 + 0.3) +
        1.7 * Math.sin(angle * 7 + layer) + 1.1 * Math.sin(angle * 11);
      const ridge = Math.sin(t * Math.PI) ** 1.3;
      const x = Math.cos(angle) * radiusX;
      const z = 0 + Math.sin(angle) * radiusZ;
      vertices.push(x, -0.7 + ridge * peaks, z);
      const variation = 0.93 + 0.07 * Math.sin(angle * 9 + t * 7);
      colors.push(...base.map((c) => c * variation));
      if (row < rings && col < slices) {
        const a = row * (slices + 1) + col, b = a + slices + 1;
        triangles.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }
  return makeSurface(vertices, triangles, colors);
}

const HORIZON = [makeHorizon(0), makeHorizon(1), makeHorizon(2)];
const SKY_VERTEX = `
varying vec3 vDirection;
void main() {
  vDirection = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const SKY_FRAGMENT = `
uniform vec3 upperColor;
uniform vec3 horizonColor;
uniform vec3 sunDirection;
uniform vec3 sunColor;
uniform float night;
varying vec3 vDirection;
void main() {
  vec3 direction=normalize(vDirection);
  float height=smoothstep(-.025,.32,direction.y);
  vec3 sky=mix(horizonColor,upperColor,pow(height,.65));
  float facing=max(0.0,dot(direction,sunDirection));
  float halo=pow(facing,48.0)*.18+pow(facing,550.0)*.30;
  sky=mix(sky,sunColor,halo*(1.0-night*.65));
  float disc=smoothstep(cos(.023),cos(.019),facing);
  sky=mix(sky,mix(sunColor,vec3(1),.65),disc);
  gl_FragColor=vec4(sky,1.0);
  #include <colorspace_fragment>
}`;

export function FieldEnvironment() {
  const time = useWorldState(state => state.timeOfDay);
  const lowQuality = useExperienceState(state => state.quality === "low");
  const daylight = fieldDaylight(time);
  const sunTarget = useMemo(() => { const target = new Object3D(); target.position.set(0, 0, 0); return target; }, []);
  const skyUniforms = useMemo(() => ({
    upperColor: { value: linearColor(daylight.upper) },
    horizonColor: { value: linearColor(daylight.horizon) },
    sunDirection: { value: new Vector3(...daylight.direction).normalize() },
    sunColor: { value: linearColor(daylight.sun) }, night: { value: daylight.night ? 1 : 0 },
  }), [daylight.upper, daylight.horizon, daylight.direction[0], daylight.direction[1], daylight.direction[2], daylight.sun, daylight.night]);
  const scene = useThree((state) => state.scene);
  const attachFog = useCallback((_parent: unknown, fog: unknown) => {
    const previous = scene.fog;
    scene.fog = fog as typeof scene.fog;
    return () => { scene.fog = previous; };
  }, [scene]);
  return (
    <group name="FIELD_PAINTED_DAYLIGHT">
      <fog attach={attachFog} args={[daylight.horizon, daylight.fogNear, daylight.fogFar]} />
      <hemisphereLight args={[daylight.night ? "#a7bac9" : "#c3dcf4", FIELD_LIGHTING.groundFill, daylight.fill]} />
      <directionalLight name="FIELD_COOL_SKY_BOUNCE" position={[35, 55, 65]} color="#d8e9ff" intensity={daylight.night ? .12 : 1.1} />
      <primitive object={sunTarget} />
      <directionalLight name="FIELD_VISIBLE_SUN" target={sunTarget} position={[daylight.direction[0] * 100, daylight.direction[1] * 100, 0 + daylight.direction[2] * 100]}
        color={daylight.sun} intensity={daylight.intensity} castShadow={!lowQuality}
        shadow-mapSize={lowQuality ? [1024, 1024] : [4096, 4096]} shadow-camera-left={-48} shadow-camera-right={48}
        shadow-camera-top={45} shadow-camera-bottom={-45}
        shadow-camera-near={1} shadow-camera-far={220}
        shadow-bias={-0.0002} shadow-normalBias={0.065} />
      <mesh name="FIELD_SKY" position={[0, 0, 0]}>
        <sphereGeometry args={[450, 24, 16]} />
        <shaderMaterial uniforms={skyUniforms} vertexShader={SKY_VERTEX}
          fragmentShader={SKY_FRAGMENT} side={1} depthWrite={false} toneMapped={false} />
      </mesh>
      <FieldClouds hour={time} />
      <mesh name="FIELD_DISTANT_GROUND_CONTINUATION" position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[590, 590]} />
        <meshStandardMaterial color={P.hill} roughness={1} />
      </mesh>
      {HORIZON.map((data, i) => <mesh key={i} name={`FIELD_DISTANT_TERRAIN_LAYER_${i}`}>
        <FieldGeometry data={data} />
        <meshStandardMaterial vertexColors roughness={1} side={2} />
      </mesh>)}
    </group>
  );
}
