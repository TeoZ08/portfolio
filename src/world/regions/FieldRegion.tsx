"use client";

import { FieldArrival } from "./field/FieldArrival";
import { FieldHouse } from "./field/FieldHouse";
import { FieldLandmarks } from "./field/FieldLandmarks";
import { FieldTerrain } from "./field/FieldTerrain";
import { FieldVegetation } from "./field/FieldVegetation";
import { FieldEnvironment } from "./field/FieldEnvironment";

export function FieldRegion() {
  return (
    <group name="FIELD_REGION">
      <FieldEnvironment />
      <FieldTerrain />
      <FieldArrival />
      <FieldHouse />
      <FieldLandmarks />
      <FieldVegetation />
    </group>
  );
}
