"use client";

import { Place, Part, Solid, WorldLettering, PLACE_PALETTE as P } from "./PlaceObjects";
import {PLAZA_SIGN as SIGN} from './wayfinding-layout';
import {DirectionalBoard} from './DirectionalBoard';

export function WorldPaths() {
  return <group name="WORLD_CONNECTING_PATHS">
    <Place name="MIRANTE_RIGHT_HAND_ROUTE_SIGN" x={10/.72} z={-7/.72} yaw={.2}>
      <Part name="MIRANTE_SIGNPOST" position={[0,.9,0]} size={[.15,1.8,.18]} color={P.woodDark} />
      <WorldLettering text="Mirante →" position={[0,1.65,.12]} width={2.1} />
    </Place>
    <Place name="FIELD_HANDMADE_WAYFINDING" {...SIGN}>
      <Solid name="WAYFINDING_SINGLE_BOARD" position={[0,SIGN.centerY,0]} size={[SIGN.width+.14,SIGN.height+.14,.2]} color={P.woodLight} />
      {[-1,1].map(side=><Solid key={side} name="WAYFINDING_OUTSIDE_SUPPORT" position={[side*(SIGN.width/2+.19),1.7,0]} size={[.17,3.4,.18]} color={P.woodDark} />)}
      <DirectionalBoard /><DirectionalBoard reverse />
    </Place>
  </group>;
}
