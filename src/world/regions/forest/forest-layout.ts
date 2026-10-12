import { authorPoint } from '../masterplan-layout';
import { plantingAllowed, plantingObstructions } from '../field/planting-clearance';

// Physical anchors curated around the structures. The two old trees close to
// the Songahm entrance are moved to the western grove, not merely clipped away.
export const FOREST_CANDIDATES=[
 [-22,0,.95],[-24,-6,1.1],[-22,-12,.95],[-20,-15,.85],[-26,6,1.05],
 [-27,17,.9],[-28,-18,1.1],[-24,-18,.8],[-23,-22,1],[-30,-5,1.1],
 [30,18,.9],[32,-5,.8],
].map(([x,z,s],index)=>{
 const spread=index%3===0?1.32:index%3===1?.86:1.05;
 const height=index%3===0?.9:index%3===1?1.13:1;
 const point=authorPoint(x,z);return {index,x:point[0],z:point[1],scale:s,spread,height,trunkRadius:.23*s,crownRadius:3.8*s*spread};
});
export const FOREST_TREES=FOREST_CANDIDATES.filter(t=>plantingAllowed(t.x,t.z,t.trunkRadius,t.crownRadius));
export const FOREST_EXCLUSIONS=FOREST_CANDIDATES.filter(t=>!FOREST_TREES.includes(t)).map(t=>({...t,reasons:plantingObstructions(t.x,t.z,t.trunkRadius,t.crownRadius)}));
