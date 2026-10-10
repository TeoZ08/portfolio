"use client";

import { useLayoutEffect, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import { fieldDaylight } from "./field-daylight";

// Fixed, composed banks of cumulus. All lobes share one mesh/material/draw call.
const CLOUDS = [-2.85, -1.55, -.7, .2, 1.1, 2.05, 2.8].flatMap((angle, bank) => {
  const radius = 180 + bank % 3 * 20;
  const center = [Math.cos(angle) * radius, 29 + bank % 4 * 11, -35 + Math.sin(angle) * radius];
  return Array.from({ length: 4 + bank % 5 }, (_, lobe) => {
    const x = (lobe % 5 - 2) * (8 + bank * 1.4);
    const high = lobe > 4;
    return {
      position: [center[0] + x * Math.cos(angle + Math.PI / 2), center[1] + (high ? 6 : 0) + Math.sin(lobe * 2.1 + bank) * 2,
        center[2] + x * Math.sin(angle + Math.PI / 2) + (high ? 3 : 0)],
      scale: [12 + Math.sin(lobe * 7) * 2, high ? 6 + bank % 3 : 3 + bank % 4, 7 + lobe % 4],
      yaw: angle + lobe * .3,
    };
  });
});
export function FieldClouds({ hour }: { hour: number }) {
  const clouds = useRef<InstancedMesh>(null);
  const daylight = fieldDaylight(hour);
  useLayoutEffect(() => {
    const object = new Object3D();
    CLOUDS.forEach((cloud, index) => {
      object.position.set(...cloud.position as [number, number, number]);
      object.scale.set(...cloud.scale as [number, number, number]);
      object.rotation.set(0, cloud.yaw, 0); object.updateMatrix();
      clouds.current?.setMatrixAt(index, object.matrix);
    });
    if (clouds.current) {
      clouds.current.instanceMatrix.needsUpdate = true;
      clouds.current.computeBoundingSphere();
    }
  }, []);
  return <instancedMesh ref={clouds} args={[undefined, undefined, CLOUDS.length]} name="FIELD_FACETED_CUMULUS" frustumCulled={false}>
    <icosahedronGeometry args={[1, 3]} />
    <meshStandardMaterial color={daylight.night ? "#67839e" : "#fff9ed"} roughness={1} emissive={daylight.night ? "#172d43" : "#b9cbd7"} emissiveIntensity={daylight.night ? .05 : .3} fog />
  </instancedMesh>;
}
