// Native GLB metres. The supplied asset has a gap between its central post and
// window, not a reversed face. These solids complete the closed ancillary room.
export const WING_ENVELOPE = [
  {name:'WING_FRONT_WINDOW_LEFT_JAMB',position:[.57,1.755,1.51],size:[1.04,2.25,.16],finish:'plaster',color:'#d9d6c9'},
  {name:'WING_FRONT_WINDOW_RIGHT_JAMB',position:[2.64,1.755,1.51],size:[.46,2.25,.16],finish:'plaster',color:'#d9d6c9'},
  {name:'WING_FRONT_WINDOW_APRON',position:[1.75,1.005,1.51],size:[1.45,.75,.16],finish:'plaster',color:'#d9d6c9'},
  {name:'WING_FRONT_WINDOW_LINTEL',position:[1.75,2.68,1.51],size:[1.45,.4,.16],finish:'plaster',color:'#d9d6c9'},
] as const;

// One masonry volume under the timber floor replaces the original series of
// bevelled plates. The five door steps overlap and reach that same floor.
export const WING_MASONRY = [
  {name:'WING_CONTINUOUS_MASONRY',position:[0,.02,.15],size:[6.55,1.04,4.5],finish:'stone',color:'#989785'},
  ...[.54,.405,.27,.135,.0675].map((top,i)=>({name:`WING_DOOR_STEP_${i}`,position:[-1.4,(top-.5)/2,2.45+i*.6],size:[3.0,top+.5,.72],finish:'stone',color:'#b8b3a0'})),
] as const;
