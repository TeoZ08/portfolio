"use client";

type FieldPoint = readonly [number, number];

const FIELD_PATH_POINTS: readonly FieldPoint[] = [
  [0, 14],
  [0, -10],
  [14, -18],
  [14, -34],
  [0, -46],
  [0, -24],
  [-16, -24],
  [-16, -32],
];

const FIELD_PATH_WIDTH = 4.8;

function PathSegment({
  from,
  index,
  to,
}: {
  from: FieldPoint;
  index: number;
  to: FieldPoint;
}) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.hypot(dx, dz);
  const rotationY = Math.atan2(dx, dz);

  return (
    <mesh
      name={`DEV_FIELD_ROAD_SEGMENT_${index}`}
      position={[(from[0] + to[0]) / 2, 0.045, (from[1] + to[1]) / 2]}
      rotation={[0, rotationY, 0]}
    >
      <boxGeometry args={[FIELD_PATH_WIDTH, 0.06, length]} />
      <meshBasicMaterial color="#9a8d78" />
    </mesh>
  );
}

export function FieldArrival() {
  return (
    <group name="FIELD_ARRIVAL_AND_PATH">
      {FIELD_PATH_POINTS.slice(0, -1).map((from, index) => {
        const to = FIELD_PATH_POINTS[index + 1];

        return <PathSegment key={index} from={from} index={index} to={to} />;
      })}
      <mesh name="DEV_ARRIVAL_EDGE_MARKER" position={[0, 0.08, 16.5]}>
        <boxGeometry args={[7, 0.12, 4]} />
        <meshBasicMaterial color="#857968" wireframe />
      </mesh>
    </group>
  );
}
