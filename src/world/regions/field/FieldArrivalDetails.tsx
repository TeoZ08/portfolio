"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { HouseBlockout as Part } from "../house/HouseBlockout";
import { FieldInstances } from "./FieldMeshes";
import { organicEllipsoid, type FieldInstance } from "./field-geometry";
import { surfaceHeight } from "./field-layout";
import { FIELD_PALETTE as P } from "./field-palette";

// Short, deliberately incomplete boundaries frame the arriving road. The
// central route and all previously navigable connections remain unchanged.
const FENCE_LINES = [
  [[-3.8, 6.6], [-3.96, 10.6], [-4.12, 14.8], [-4.23, 18.5]],
  [[3.8, 13.8], [3.98, 17.5], [4.28, 21.5]],
] as const;
const STONE = organicEllipsoid(16, 10, .1);
const STONES: FieldInstance[] = [
  [-4.08, 5.75, .39], [-4.65, 6.04, .33], [-4.36, 5.96, .29],
  [4.18, 12.91, .4], [4.76, 13.12, .28], [4.52, 13.49, .3],
].map(([x, z, scale], i) => ({ position: [x, surfaceHeight(x, z) + scale * .34, z],
  scale: [scale * 1.24, scale * .67, scale], rotation: [0, i * .62, .05], color: i % 2 ? P.stone : P.stoneLight }));

export function FieldArrivalDetails() {
  return <group name="ARRIVAL_ROADSIDE_JOINERY">
    {FENCE_LINES.map((line, side) => <group key={side}>
      {line.map(([x, z], i) => <group key={i} position={[x, surfaceHeight(x, z), z]}>
        <Part name="ARRIVAL_WEATHERED_FENCE_POST" position={[0, .56, 0]} size={[.17, 1.12, .19]}
          rotation={[.018 * (i % 2), 0, (side ? -1 : 1) * .014]} color={i % 2 ? P.wood : P.woodDark} radius={.025} castShadow />
        <Part name="POST_END_GRAIN" position={[0, 1.12, 0]} size={[.16, .025, .18]} color={P.woodLight} radius={.014} />
      </group>)}
      {line.slice(1).map(([bx, bz], i) => {
        const [ax, az] = line[i], ay = surfaceHeight(ax, az), by = surfaceHeight(bx, bz);
        const length = Math.hypot(bx - ax, bz - az), yaw = -Math.atan2(bz - az, bx - ax);
        return <group key={i} position={[(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2]} rotation={[0, yaw, 0]}>
          <RigidBody name="ARRIVAL_FENCE_BOUNDARY" type="fixed" colliders={false}>
            <CuboidCollider args={[length / 2 + .06, .54, .1]} position={[0, .54, 0]} />
          </RigidBody>
          {[.41, .81].map(y => <Part key={y} name="ARRIVAL_FENCE_RAIL" position={[0, y, 0]}
            size={[length + .14, .105, .095]} rotation={[0, 0, Math.atan2(by - ay, length)]} color={P.wood} radius={.022} castShadow />)}
        </group>;
      })}
    </group>)}
    <FieldInstances name="ARRIVAL_GATE_FOOT_STONES" data={STONE} instances={STONES} castShadow />
  </group>;
}
