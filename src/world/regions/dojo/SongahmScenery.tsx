"use client";

import { FieldGeometry } from "../field/FieldMeshes";
import { makeSurface, organicEllipsoid } from "../field/field-geometry";
import { HouseMaterial } from "../house/HouseMaterial";
import { PLACE_PALETTE as P } from "../places/PlaceObjects";

type MountainMassProps = {
  name: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  rotationY?: number;
};

// Stratified, off-centre shoulders: no regular cone silhouette.
function makeCliff() {
  const vertices: number[] = [], indices: number[] = [];
  const rings = [[-1,1],[-.5,.98],[0,.76],[.38,.65],[.7,.36],[.92,.22],[1,.035]];
  const segments = 17;
  rings.forEach(([height,radius],row) => {
    for (let i=0;i<=segments;i++) {
      const a=i/segments*Math.PI*2;
      const shoulder=radius*(1+.18*Math.sin(a*3+row*.45)+.09*Math.cos(a*5-row*.7));
      vertices.push(Math.cos(a)*shoulder+.13*height, height,
        Math.sin(a)*shoulder+.08*Math.sin(row*.8));
      if(row<rings.length-1 && i<segments) {
        const n=row*(segments+1)+i, b=n+segments+1;
        indices.push(n,b,n+1,n+1,b,b+1);
      }
    }
  });
  return makeSurface(vertices,indices);
}
const CLIFF = makeCliff();
const PINE_CROWN = organicEllipsoid(11,6,.19);

function MountainMass({ name, position, scale, color, rotationY = 0 }: MountainMassProps) {
  return <mesh name={name} position={position} scale={scale} rotation={[0, rotationY, 0]}>
    <FieldGeometry data={CLIFF} />
    <HouseMaterial color={color} />
  </mesh>;
}

function RidgePine({ position, scale = 1, color = P.foliageShade }: {
  position: [number, number, number]; scale?: number; color?: string;
}) {
  return <group position={position} scale={scale} name="SONGAHM_DISTANT_RIDGE_PINE">
    <mesh position={[0, 1.25, 0]}><cylinderGeometry args={[.08, .13, 2.5, 5]} /><HouseMaterial color={P.woodDark} /></mesh>
    {[[1.7, .78, .85], [2.25, .6, .7], [2.72, .4, .58]].map(([y, radius, height]) =>
      <mesh key={y} position={[.16*Math.sin(y*4), y, 0]} scale={[radius, height*.24, radius*.65]}><FieldGeometry data={PINE_CROWN} /><HouseMaterial color={color} /></mesh>)}
  </group>;
}

function MistBand({ position, scale, opacity }: {
  position: [number, number, number]; scale: [number, number, number]; opacity: number;
}) {
  return <mesh name="SONGAHM_SPARSE_MIST_BAND" position={position} scale={scale} renderOrder={2}>
    <sphereGeometry args={[1, 24, 8]} />
    <meshBasicMaterial color={P.mountainMist} transparent opacity={opacity} depthWrite={false} />
  </mesh>;
}

export function SongahmScenery() {
  return <group name="SONGAHM_PAINTERLY_BOUNDARY_SCENERY">


    <group name="SONGAHM_FAR_PALE_RIDGE">
      <MountainMass name="FAR_CLIFF_LEFT" position={[-24, 9, -39]} scale={[15, 10, 7]} color={P.mountainFar} rotationY={.18} />
      <MountainMass name="FAR_CLIFF_CENTER" position={[2, 11, -42]} scale={[19, 12, 8]} color={P.mountainFar} rotationY={-.12} />
      <MountainMass name="FAR_CLIFF_RIGHT" position={[28, 8, -40]} scale={[14, 9, 7]} color={P.mountainFar} rotationY={.28} />
    </group>

    <group name="SONGAHM_MIDDLE_BLUE_GREEN_RIDGE">
      <MountainMass name="MIDDLE_VERTICAL_CLIFF" position={[-17, 11, -30]} scale={[10, 12, 6]} color={P.mountainMiddle} rotationY={-.22} />
      <MountainMass name="MIDDLE_SPLIT_PEAK" position={[7, 9, -32]} scale={[13, 10, 7]} color={P.mountainMiddle} rotationY={.19} />
      <MountainMass name="MIDDLE_RIGHT_SHOULDER" position={[25, 6.5, -31]} scale={[11, 7.5, 6]} color={P.mountainMiddle} rotationY={-.1} />
      <mesh name="SONGAHM_DISTANT_WATERFALL" position={[-15.7, 10.4, -23.75]}>
        <planeGeometry args={[.72, 10.5, 1, 6]} />
        <meshBasicMaterial color={P.songahmCream} transparent opacity={.62} depthWrite={false} />
      </mesh>
    </group>

    <group name="SONGAHM_DARK_NEAR_RIDGE">
      <MountainMass name="NEAR_RIDGE_LEFT" position={[-18, 6.2, -21]} scale={[12, 7.2, 6]} color={P.mountainNear} rotationY={.24} />
      <MountainMass name="NEAR_RIDGE_RIGHT" position={[12, 5.2, -23]} scale={[17, 6.2, 6]} color={P.mountainNear} rotationY={-.2} />
      {/* Roots seated on the triangulated cliff surface, not above its silhouette. */}
      <RidgePine position={[-23, 9.631, -19]} scale={1.35} />
      <RidgePine position={[-13.5, 6.702, -18.5]} scale={1.08} />
      <RidgePine position={[8.5, 8.536, -20.5]} scale={1.22} color={P.mountainNear} />
      <RidgePine position={[18.5, 9.833, -21]} scale={.96} color={P.mountainNear} />
    </group>

    <MistBand position={[-10, 5.5, -19]} scale={[17, 1.15, 2.8]} opacity={.13} />
    <MistBand position={[15, 8.4, -28]} scale={[21, 1.4, 3.4]} opacity={.1} />
    <MistBand position={[-19, 11.5, -35]} scale={[15, 1.2, 3]} opacity={.08} />
  </group>;
}
