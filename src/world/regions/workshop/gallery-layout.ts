// Physical metres: a U-shaped exhibition room with a broad west-facing porch.
// Rear and side walls support all four original artworks. No beam crosses them.
export const GALLERY_ENVELOPE = {
  width:14,depth:9,wallTop:4.45,roofBottom:4.65,roofTop:4.83,
  entryWidth:7.2,floorTop:.13*.72,sideArtworkClearance:.11,
} as const;
export const GALLERY_WALLS = [
  {name:'GALLERY_REAR_WALL',position:[0,2.275,-4.5],size:[14,4.35,.23]},
  ...[-1,1].map(side=>({name:`GALLERY_SIDE_WALL_${side}`,position:[side*7,2.275,0],size:[.22,4.35,9.0]})),
  ...[-1,1].map(side=>({name:`GALLERY_ENTRY_RETURN_${side}`,position:[side*5.35,1.55,4.5],size:[3.3,2.91,.23]})),
] as const;
