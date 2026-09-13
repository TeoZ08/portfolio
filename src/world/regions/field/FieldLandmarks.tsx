"use client";

export function FieldLandmarks() {
  return (
    <group name="FIELD_LANDMARKS">
      <group name="DEV_PLACEHOLDER_TREE" position={[-5, 0, -20]}>
        <mesh name="DEV_PLACEHOLDER_TREE_TRUNK" position={[0, 1.7, 0]}>
          <cylinderGeometry args={[0.35, 0.5, 3.4, 8]} />
          <meshBasicMaterial color="#786552" />
        </mesh>
        <mesh name="DEV_PLACEHOLDER_TREE_CANOPY" position={[0, 4.2, 0]}>
          <sphereGeometry args={[2.7, 12, 8]} />
          <meshBasicMaterial color="#718365" wireframe />
        </mesh>
        <mesh name="DEV_PLACEHOLDER_TREE_BASE" position={[0, 0.06, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.08, 12]} />
          <meshBasicMaterial color="#d1c1a4" wireframe />
        </mesh>
      </group>

      <mesh name="DEV_DISTANT_HILL" position={[-30, 6, -60]} scale={[1.5, 0.7, 0.9]}>
        <sphereGeometry args={[22, 16, 8]} />
        <meshBasicMaterial color="#53665d" />
      </mesh>
    </group>
  );
}
