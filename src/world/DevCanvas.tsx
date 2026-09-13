"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";

import { useWorldState } from "@/systems/world-state";
import { DevPlayground } from "@/world/playground/DevPlayground";
import { DevPlayer } from "@/world/player/DevPlayer";

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
      aria-label="Canvas de desenvolvimento com playground de física"
      data-current-region={currentRegion}
      data-time-of-day={timeOfDay}
      data-playground="physics"
    >
      <Canvas camera={{ position: [10, 8, 10], fov: 50 }} dpr={[1, 2]}>
        {isDevelopment ? (
          <>
            <DevelopmentHelpers />
            <Physics
              colliders={false}
              gravity={[0, -20, 0]}
              interpolate={false}
              timeStep="vary"
            >
              <DevPlayground />
              <DevPlayer />
            </Physics>
          </>
        ) : null}
      </Canvas>
    </section>
  );
}
