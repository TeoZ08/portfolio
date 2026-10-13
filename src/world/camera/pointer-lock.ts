"use client";
import { create } from 'zustand';

export type PointerControlStatus='free'|'pending'|'locked'|'denied'|'unavailable';
export const usePointerControl=create<{ready:boolean;status:PointerControlStatus}>(()=>({ready:false,status:'free'}));
let canvas:HTMLCanvasElement|null=null;
let canCapture:()=>boolean=()=>false;
let onUnexpectedRelease:()=>void=()=>{};
let suppressRelease=false;
let requestId=0;
export function desktopMouseAvailable() {
  return typeof window!=='undefined' && matchMedia('(any-pointer: fine)').matches;
}
export function releaseGameplayPointerLock() {
  requestId++;
  if(document.pointerLockElement===canvas && canvas){suppressRelease=true;document.exitPointerLock();}
  else if(usePointerControl.getState().status==='pending')usePointerControl.setState({status:'free'});
}
// Must be called synchronously from an intentional click/key activation.
// No timers, effects or page-load attempts can manufacture user activation.
export function requestGameplayPointerLock(gesture?:unknown) {
  const event=gesture as {nativeEvent?:Event;pointerType?:string}|undefined;
  const native=(event?.nativeEvent??event) as (PointerEvent & {sourceCapabilities?:{firesTouchEvents:boolean}})|undefined;
  if(native?.pointerType==='touch' || native?.sourceCapabilities?.firesTouchEvents)return;
  if(!desktopMouseAvailable())return;
  if(!canvas || !usePointerControl.getState().ready){usePointerControl.setState({status:'unavailable'});return;}
  if(!canCapture())return;
  if(document.pointerLockElement===canvas)return;
  if(usePointerControl.getState().status==='pending')return;
  if(!canvas.requestPointerLock){usePointerControl.setState({status:'unavailable'});return;}
  const element=canvas,id=++requestId;
  suppressRelease=false;usePointerControl.setState({status:'pending'});
  document.querySelector<HTMLElement>('.world-canvas')?.focus({preventScroll:true});
  try {
    const requested=element.requestPointerLock();
    void requested?.catch(()=>{if(id===requestId && canvas===element)usePointerControl.setState({status:'denied'});});
  } catch {if(id===requestId)usePointerControl.setState({status:'denied'});}
}
export function connectGameplayPointerLock(element:HTMLCanvasElement,allowed:()=>boolean,onRelease:()=>void) {
  canvas=element;canCapture=allowed;onUnexpectedRelease=onRelease;
  usePointerControl.setState({ready:true,status:document.pointerLockElement===element?'locked':'free'});
  const change=()=>{
    const wasLocked=usePointerControl.getState().status==='locked';
    const locked=document.pointerLockElement===element;
    if(locked && !allowed()){releaseGameplayPointerLock();return;}
    usePointerControl.setState({status:locked?'locked':'free'});
    if(wasLocked && !locked && !suppressRelease)onUnexpectedRelease();
    if(!locked)suppressRelease=false;
  };
  const denied=()=>usePointerControl.setState({status:'denied'});
  document.addEventListener('pointerlockchange',change);
  document.addEventListener('pointerlockerror',denied);
  return ()=>{
    releaseGameplayPointerLock();document.removeEventListener('pointerlockchange',change);document.removeEventListener('pointerlockerror',denied);
    if(canvas===element){canvas=null;canCapture=()=>false;onUnexpectedRelease=()=>{};usePointerControl.setState({ready:false,status:'free'});}
  };
}
