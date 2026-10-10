"use client";

import { PLAN } from "../masterplan-layout";
import { Place, Part, WorldLettering, PLACE_PALETTE as P } from "./PlaceObjects";

export function WorldPaths() {
  return <group name="WORLD_CONNECTING_PATHS">
    <Place name="MIRANTE_RIGHT_HAND_ROUTE_SIGN" x={10/.72} z={-7/.72} yaw={.2}>
      <Part name="MIRANTE_SIGNPOST" position={[0,.9,0]} size={[.15,1.8,.18]} color={P.woodDark} />
      <WorldLettering text="Mirante →" position={[0,1.65,.12]} width={2.1} />
    </Place>
    <Place name="FIELD_HANDMADE_WAYFINDING" x={PLAN.plaza[0]-3.5} z={PLAN.plaza[1]+5} yaw={.25}>
      <Part name="SIGNPOST" position={[0, 1.02, 0]} size={[.18, 2.05, .2]} color={P.woodDark} castShadow />
      {[["← Casa", 1.75, -.06], ["Ateliê →", 1.22, .07], ["↑ Songahm", .69, -.04]].map(([text,y,angle])=><group key={String(text)} rotation={[0,0,Number(angle)]}>
        <Part name="WAYFINDING_TIMBER" position={[0,Number(y),.01]} size={[2.27,.47,.15]} color={P.woodLight} radius={.045} />
        <WorldLettering text={String(text)} position={[0,Number(y),.092]} width={1.98} />
      </group>)}
    </Place>
  </group>;
}
