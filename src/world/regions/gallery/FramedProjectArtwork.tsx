"use client";
import { useLoader } from '@react-three/fiber';
import { useEffect } from 'react';
import { TextureLoader, SRGBColorSpace, LinearMipmapLinearFilter, LinearFilter } from 'three';
import { Part, WorldLettering } from '../places/PlaceObjects';
import { FIELD_SCALE as S } from '../world-scale';
import type { GALLERY_ARTWORKS } from '@/content/gallery';

type Artwork = (typeof GALLERY_ARTWORKS)[number];
export function FramedProjectArtwork({artwork:a}:{artwork:Artwork}) {
  const texture=useLoader(TextureLoader,a.src);
  useEffect(()=>{texture.colorSpace=SRGBColorSpace;texture.generateMipmaps=true;texture.minFilter=LinearMipmapLinearFilter;texture.magFilter=LinearFilter;texture.needsUpdate=true;},[texture]);
  const width=a.width/S,height=width*a.imageHeight/a.imageWidth;
  return <group name={`ARTWORK_${a.id}`} position={[a.position[0]/S,a.position[1]/S,a.position[2]/S]} rotation={[0,a.yaw,0]}>
    <Part name="ARTWORK_TIMBER_FRAME" position={[0,0,-.055/S]} size={[width+.16/S,height+.16/S,.12/S]} color="#82654d" castShadow />
    <Part name="ARTWORK_PAPER_MOUNT" position={[0,0,.012/S]} size={[width+.07/S,height+.07/S,.018/S]} color="#faf7ef" finish="paper" />
    <mesh name={`CAPTURE_${a.id}`} position={[0,0,.026/S]}>
      <planeGeometry args={[width,height]} />
      {/* Preserve printed screenshot colours; no emissive/light-panel effect. */}
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
    <WorldLettering compact text={a.title} subtitle={a.caption} position={[0,-height/2-.36/S,.03/S]} width={width} />
  </group>;
}
