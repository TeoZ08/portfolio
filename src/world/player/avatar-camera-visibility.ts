import type {Object3D,Mesh} from 'three';
// Suppress only avatar colour/depth in first person. The physical capsule,
// animation graph and shadow depth pass stay active. Each material is owned
// by the avatar clone; shared GLB materials are never modified.
export function setAvatarCameraVisibility(root:Object3D,firstPerson:boolean) {
  root.traverse(o=>{
    const mesh=o as Mesh;if(!mesh.isMesh)return;
    for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]) {
      material.userData.cameraRenderBaseline??={colorWrite:material.colorWrite,depthWrite:material.depthWrite};
      const original=material.userData.cameraRenderBaseline;
      material.colorWrite=firstPerson?false:original.colorWrite;
      material.depthWrite=firstPerson?false:original.depthWrite;
    }
  });
}

const views=new Set<Object3D>();let hidden=false;
export function registerAvatarCameraView(root:Object3D) {
  views.add(root);setAvatarCameraVisibility(root,hidden);
  return ()=>{views.delete(root);};
}
export function hideAvatarFromLens(value:boolean) {
  if(value===hidden)return;hidden=value;
  for(const root of views)setAvatarCameraVisibility(root,hidden);
}
