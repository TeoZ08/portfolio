"use client";

import { FieldArrival } from "./field/FieldArrival";
import { FieldHouse } from "./field/FieldHouse";
import { FieldLandmarks } from "./field/FieldLandmarks";
import { FieldTerrain } from "./field/FieldTerrain";

export function FieldRegion() {
  return (
    <group name="FIELD_REGION">
      <FieldTerrain />
      <FieldArrival />
      <FieldHouse />
      <FieldLandmarks />
    </group>
  );
}
