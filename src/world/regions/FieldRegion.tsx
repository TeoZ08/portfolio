"use client";

import { FieldHouse } from "./field/FieldHouse";
import { FieldLandmarks } from "./field/FieldLandmarks";
import { FieldTerrain } from "./field/FieldTerrain";
import { FieldVegetation } from "./field/FieldVegetation";
import { FieldAtmosphere } from "./field/FieldAtmosphere";
import { FieldEnvironment } from "./field/FieldEnvironment";
import { WorkshopRegion } from "./WorkshopRegion";
import { DojoRegion } from "./DojoRegion";
import { HillRegion } from "./HillRegion";
import { ForestRegion } from "./ForestRegion";
import { WorldPaths } from "./places/WorldPaths";
import { FieldArrivalDetails } from "./field/FieldArrivalDetails";
import { FIELD_SCALE } from "./world-scale";
import { FieldGarden } from "./field/FieldGarden";

export function FieldRegion() {
  return (
    <group name="FIELD_REGION" scale={FIELD_SCALE}>
      <FieldEnvironment />
      <FieldAtmosphere />
      <FieldTerrain />
      <FieldArrivalDetails />
      <FieldHouse />
      <FieldGarden />
      <FieldLandmarks />
      <FieldVegetation />
      <WorldPaths />
      <WorkshopRegion />
      <DojoRegion />
      <HillRegion />
      <ForestRegion />
    </group>
  );
}
