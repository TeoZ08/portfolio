"use client";

import { HouseBed } from "./HouseBed";
import { HouseWorkspace } from "./HouseWorkspace";
import { HousePersonalDetails, HouseRug } from "./HousePersonalDetails";

export function HouseRoom() {
  return (
    <group name="HOUSE_ROOM_VISUAL_PROTOTYPE">
      <HouseBed />
      <HouseWorkspace />
      <HousePersonalDetails />
      <HouseRug name="HOUSE_STUDY_WOVEN_RUG" position={[0.8, 0.034, -2.25]} size={[7.2, 4.15]} />
    </group>
  );
}
