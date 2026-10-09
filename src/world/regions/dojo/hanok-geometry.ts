import { Float32BufferAttribute, type Matrix4, type BufferGeometry } from "three";

export function transformedGeometry(source: BufferGeometry, matrix: Matrix4) {
  const geometry=source.clone(),a=source.getAttribute("position");
  // Hanok uses KHR_mesh_quantization. Convert before baking transforms; applying
  // matrices to integer attributes truncates vertices and can empty a trimesh.
  const positions=Float32Array.from({length:a.count*3},(_,i)=>i%3===0?a.getX(i/3):i%3===1?a.getY(Math.floor(i/3)):a.getZ(Math.floor(i/3)));
  geometry.setAttribute("position",new Float32BufferAttribute(positions,3));
  const n=source.getAttribute("normal");
  if(n)geometry.setAttribute("normal",new Float32BufferAttribute(Float32Array.from({length:n.count*3},(_,i)=>i%3===0?n.getX(i/3):i%3===1?n.getY(Math.floor(i/3)):n.getZ(Math.floor(i/3))),3));
  return geometry.applyMatrix4(matrix);
}

