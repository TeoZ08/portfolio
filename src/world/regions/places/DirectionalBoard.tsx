"use client";
import {useEffect,useState} from 'react';
import {PLAZA_SIGN as S,SIGN_DESTINATIONS,signArrow} from './wayfinding-layout';

export function DirectionalBoard({reverse=false}:{reverse?:boolean}) {
  const [canvas,setCanvas]=useState<HTMLCanvasElement|null>(null);
  useEffect(()=>{
    const image=document.createElement('canvas');image.width=1024;image.height=614;
    // CPU backing also avoids headless Vulkan/accelerated-2D canvas loss while
    // preserving the normal WebGL texture and natural material lighting.
    const ctx=image.getContext('2d',{willReadFrequently:true});if(!ctx)return;
    ctx.fillStyle='#e6ddc6';ctx.fillRect(0,0,image.width,image.height);
    ctx.strokeStyle='#b4ab90';ctx.lineWidth=3;ctx.strokeRect(15,15,994,584);
    SIGN_DESTINATIONS.forEach((destination,i)=>{
      const y=86+i*147,a=signArrow(destination.point,reverse?Math.PI:S.yaw);
      const dx=a.x*49,dy=-a.up*49;
      ctx.strokeStyle='#34493b';ctx.lineWidth=12;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(114-dx*.7,y-dy*.7);ctx.lineTo(114+dx,y+dy);
      const angle=Math.atan2(dy,dx);
      for(const side of [-1,1]){ctx.moveTo(114+dx,y+dy);ctx.lineTo(114+dx-30*Math.cos(angle+side*.7),y+dy-30*Math.sin(angle+side*.7));}
      ctx.stroke();ctx.fillStyle='#34493b';ctx.textAlign='left';ctx.textBaseline='middle';
      ctx.font='600 66px system-ui, sans-serif';ctx.fillText(destination.label,224,y,730);
      if(i<3){ctx.strokeStyle='#c4baa1';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(200,y+73);ctx.lineTo(974,y+73);ctx.stroke();}
    });setCanvas(image);
  },[reverse]);
  return <mesh name={reverse?'WAYFINDING_REVERSE_FACE':'WAYFINDING_APPROACH_FACE'} position={[0,S.centerY,reverse?-.112:.112]} rotation={[0,reverse?Math.PI:0,0]}>
    <planeGeometry args={[S.width,S.height]} />
    <meshStandardMaterial key={canvas?'lettered':'paper'} color={canvas?'#ffffff':'#e6ddc6'} roughness={1}>
      {canvas&&<canvasTexture attach="map" args={[canvas]} colorSpace="srgb" />}
    </meshStandardMaterial>
  </mesh>;
}
