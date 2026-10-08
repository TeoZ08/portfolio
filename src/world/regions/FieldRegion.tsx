"use client";

import { FieldArrival } from "./field/FieldArrival";
import { FieldHouse } from "./field/FieldHouse";
import { FieldLandmarks } from "./field/FieldLandmarks";
import { FieldTerrain } from "./field/FieldTerrain";
import { FieldVegetation } from "./field/FieldVegetation";
import { FieldAtmosphere } from "./field/FieldAtmosphere";
import { FieldEnvironment } from "./field/FieldEnvironment";
import { WorkshopRegion } from "./WorkshopRegion";
import { UniversityRegion } from "./UniversityRegion";
import { CommunityRegion } from "./CommunityRegion";
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
      <FieldArrival />
      <FieldArrivalDetails />
      <FieldHouse />
      <FieldGarden />
      <FieldLandmarks />
      <FieldVegetation />
      <WorldPaths />
      <WorkshopRegion />
      <UniversityRegion />
      <CommunityRegion />
      <DojoRegion />
      <HillRegion />
      <ForestRegion />
    </group>
  );
}
