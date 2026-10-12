import { DOJO as D } from './dojo-layout';

export function pillarSupportNative(file:string,x:number,z:number) {
  if(file==='side-wing')return .54; // top of the visible WING_CONTINUOUS_MASONRY
  const px=x*D.mainScale,pz=z*D.mainScale;
  const onTatami=Math.abs(px)<D.tatamiWidth/2 && Math.abs(pz-D.tatamiZ)<D.tatamiDepth/2;
  const floor=onTatami?D.floor:D.deckTop;
  const origin=.445-.50781*D.mainScale;
  return (floor-origin)/D.mainScale;
}
