"use client";

import { FieldArrival } from "./field/FieldArrival";
import { FieldHouse } from "./field/FieldHouse";
import { FieldLandmarks } from "./field/FieldLandmarks";
import { FieldTerrain } from "./field/FieldTerrain";
import { FieldVegetation } from "./field/FieldVegetation";
import { FieldEnvironment } from "./field/FieldEnvironment";
import { WorkshopRegion } from "./WorkshopRegion";
import { UniversityRegion } from "./UniversityRegion";
import { CommunityRegion } from "./CommunityRegion";
import { DojoRegion } from "./DojoRegion";
import { HillRegion } from "./HillRegion";
import { ForestRegion } from "./ForestRegion";
import { WorldPaths } from "./places/WorldPaths";
import { FieldArrivalDetails } from "./field/FieldArrivalDetails";

export function FieldRegion() {
  return (
    <group name="FIELD_REGION">
      <FieldEnvironment />
      <FieldTerrain />
      <FieldArrival />
      <FieldArrivalDetails />
      <FieldHouse />
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
