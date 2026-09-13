"use client";

import { Canvas } from "@react-three/fiber";

import { useWorldState } from "@/systems/world-state";

function DevelopmentHelpers() {
  return (
    <>
      <axesHelper args={[1.5]} />
      <gridHelper args={[10, 10]} />
    </>
  );
}

export function DevCanvas() {
  const currentRegion = useWorldState((state) => state.currentRegion);
  const timeOfDay = useWorldState((state) => state.timeOfDay);
  const isDevelopment = process.env.NODE_ENV !== "production";

  return (
    <section
      className="foundation-canvas"
      aria-label="Canvas de desenvolvimento"
      data-current-region={currentRegion}
      data-time-of-day={timeOfDay}
    >
      <Canvas camera={{ position: [3, 3, 3], fov: 50 }} dpr={[1, 2]}>
        {isDevelopment ? <DevelopmentHelpers /> : null}
      </Canvas>
    </section>
  );
}
