"use client";

import { useThree } from "@react-three/fiber";
import { useCallback } from "react";
import { FieldGeometry } from "./FieldMeshes";
import { makeSurface } from "./field-geometry";
import { FIELD_PALETTE as P, linearColor } from "./field-palette";
import { FIELD_LIGHTING } from "./FieldMaterial";

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
      const z = -35 + Math.sin(angle) * radiusZ;
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
const SKY_UNIFORMS = {
  upperColor: { value: linearColor(P.skyHigh) },
  horizonColor: { value: linearColor(P.horizon) },
};
const SKY_VERTEX = `
varying vec3 vDirection;
void main() {
  vDirection = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const SKY_FRAGMENT = `
uniform vec3 upperColor;
uniform vec3 horizonColor;
varying vec3 vDirection;
void main() {
  float height = smoothstep(-0.04, 0.72, normalize(vDirection).y);
  gl_FragColor = vec4(mix(horizonColor, upperColor, height), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function FieldEnvironment() {
  const scene = useThree((state) => state.scene);
  const attachFog = useCallback((_parent: unknown, fog: unknown) => {
    const previous = scene.fog;
    scene.fog = fog as typeof scene.fog;
    return () => { scene.fog = previous; };
  }, [scene]);
  return (
    <group name="FIELD_GOLDEN_HOUR_PROTOTYPE">
      <fog attach={attachFog} args={[P.sky, 85, 280]} />
      <hemisphereLight args={[P.fill, FIELD_LIGHTING.groundFill, 1.8]} />
      <directionalLight name="FIELD_LATE_AFTERNOON_SUN" position={[-34, 22, 18]}
        color={P.sun} intensity={2.7} castShadow
        shadow-mapSize={[4096, 4096]} shadow-camera-left={-65} shadow-camera-right={65}
        shadow-camera-top={65} shadow-camera-bottom={-80}
        shadow-camera-near={1} shadow-camera-far={220}
        shadow-bias={-0.0002} shadow-normalBias={0.065} />
      <mesh name="FIELD_SKY" position={[0, 0, -35]}>
        <sphereGeometry args={[450, 24, 16]} />
        <shaderMaterial uniforms={SKY_UNIFORMS} vertexShader={SKY_VERTEX}
          fragmentShader={SKY_FRAGMENT} side={1} depthWrite={false} />
      </mesh>
      <mesh name="FIELD_DISTANT_GROUND_CONTINUATION" position={[0, -0.65, -35]} rotation={[-Math.PI / 2, 0, 0]}>
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
