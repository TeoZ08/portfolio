"use client";

import { HOUSE_PALETTE as P } from "./house-palette";

// A static shadow-only fourth wall preserves the authored window light. The
// entrance-side camera enclosure stays behind it and adds no Rapier colliders.
function WindowShadowWall() {
  const parts = [
    { position: [0, 0.71, 6.23], size: [16, 1.42, 0.15] },
    { position: [0, 4.12, 6.23], size: [16, 0.76, 0.15] },
    { position: [-6.91, 2.58, 6.23], size: [2.18, 2.32, 0.15] },
    { position: [-0.075, 2.58, 6.23], size: [6.65, 2.32, 0.15] },
    { position: [6.825, 2.58, 6.23], size: [2.35, 2.32, 0.15] },
    ...[-4.6, 4.45].flatMap(x => [
      { position: [x, 2.55, 6.23], size: [0.075, 2.32, 0.15] },
      { position: [x, 2.36, 6.23], size: [2.36, 0.075, 0.15] },
    ]),
  ];
  return <group name="HOUSE_CUTAWAY_WINDOW_SHADOW_MASK">
    {parts.map(({ position, size }, i) => <mesh key={i} position={position as [number, number, number]} castShadow>
      <boxGeometry args={size as [number, number, number]} />
      <meshStandardMaterial colorWrite={false} depthWrite={false} />
    </mesh>)}
  </group>;
}

export function HouseLighting() {
  return <group name="HOUSE_LATE_AFTERNOON_LIGHT">
    <ambientLight color={P.trim} intensity={0.28} />
    <hemisphereLight color={P.fill} groundColor={P.bounce} intensity={1.4} />
    <directionalLight name="HOUSE_WARM_WINDOW_LIGHT" color={P.sun} intensity={2.7}
      position={[-5, 8, 12]} castShadow shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-13} shadow-camera-right={13} shadow-camera-top={12} shadow-camera-bottom={-12}
      shadow-camera-near={0.5} shadow-camera-far={48} shadow-bias={-0.00015} shadow-normalBias={0.025}
      shadow-radius={3} />
    <WindowShadowWall />
  </group>;
}
