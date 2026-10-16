"""Controlled before/candidate native renders, includes real captured jump replay."""
import bpy,sys,argparse,json,math,time
from pathlib import Path
from mathutils import Vector
ap=argparse.ArgumentParser();ap.add_argument('--revision',type=int,default=1);ap.add_argument('--condition',choices=['before','manual','retarget'],default='manual');ap.add_argument('--stills',action='store_true');ap.add_argument('--jump-only',action='store_true');ap.add_argument('--pace-reference',action='store_true');ap.add_argument('--rate',type=int,default=24);args=ap.parse_args(sys.argv[sys.argv.index('--')+1:])
rate=args.rate;suffix='-pace-reference' if args.pace_reference else '-jump-v2' if args.jump_only else '-critical' if args.stills else ''
P=Path('/home/matteo/Documentos/ChatGPT-Codex/GOAL-21-evolucao-animacoes-2026-10-16');dest=P/'SCREENSHOTS'/f'cycle{args.revision}-{args.condition}{suffix}';dest.mkdir(exist_ok=True,parents=True)
src=P/'BASELINE/matteo-chibi-v3.glb' if args.condition=='before' else P/'CANDIDATOS'/f'cycle{args.revision}-manual/matteo-chibi-motion.glb'
if args.condition=='retarget':src=P/'CANDIDATOS/retarget-cc0-probe/retarget-probe.glb'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(src));rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE');sc=bpy.context.scene
for track in rig.animation_data.nla_tracks:track.mute=True
sc.render.engine='BLENDER_WORKBENCH';sc.render.threads_mode='FIXED';sc.render.threads=2;sc.render.resolution_x=320;sc.render.resolution_y=400;sc.render.resolution_percentage=100;sc.render.image_settings.file_format='PNG';sc.world=bpy.data.worlds.new('G21 controlled audit world');sc.world.color=(.19,.21,.23)
s=sc.display.shading;s.light='STUDIO';s.color_type='MATERIAL';s.show_shadows=True;s.show_cavity=False;s.show_specular_highlight=False;s.background_type='WORLD'
cd=bpy.data.cameras.new('G21Camera');cam=bpy.data.objects.new('G21Camera',cd);sc.collection.objects.link(cam);sc.camera=cam;cd.type='ORTHO'
views={'front':(0,-5,.95),'profile':(5,0,.95),'three-quarter':(3,-5,1.6)}
# Moving diagnostic checker floor is the comoving view of nominal Rapier travel.
# It makes foot/ground drift visible; it is never included in the asset export.
groundmesh=bpy.data.meshes.new('Diagnostic ground');verts=[];faces=[]
for x in range(-12,12):
 for y in range(-20,20):
  i=len(verts);verts.extend([(x*.25,y*.25,-.008),((x+1)*.25,y*.25,-.008),((x+1)*.25,(y+1)*.25,-.008),(x*.25,(y+1)*.25,-.008)]);faces.append((i,i+1,i+2,i+3))
groundmesh.from_pydata(verts,[],faces);ground=bpy.data.objects.new('DIAGNOSTIC_GROUND_NOT_ASSET',groundmesh);sc.collection.objects.link(ground)
for color in [(.19,.21,.23,1),(.24,.26,.28,1)]:
 material=bpy.data.materials.new('Diagnostic ground');material.diffuse_color=color;groundmesh.materials.append(material)
for i,poly in enumerate(groundmesh.polygons):poly.material_index=((i//40)+(i%40))%2
raw=json.loads((P/'BASELINE_BROWSER/EVIDENCIAS/desktop-balanced-third-person-back-frames.json').read_text())['frames'];episodes=[];start=None
for i,f in enumerate(raw):
 if f['airborne'] and start is None:start=i
 if not f['airborne'] and start is not None:
  part=raw[start:i]
  if len(part)>12 and max(math.hypot(x['velocity']['x'],x['velocity']['z']) for x in part)<.1:episodes.append((start,i))
  start=None
assert episodes,'Need observed stationary Rapier jump before replay'
lo,hi=episodes[0];replay=raw[max(0,lo-3):min(len(raw),hi+20)];epoch=replay[0]['t'];takeoff=raw[lo]['t']-epoch;land=raw[hi]['t']-epoch;groundBodyY=raw[lo-1]['position']['y'];jumpduration=(replay[-1]['t']-epoch)/1000
manifest={'condition':args.condition,'revision':args.revision,'source':str(src),'engine':sc.render.engine,'fps':rate,'size':[320,400],'clips':[],'jumpReplay':{'file':'BASELINE_BROWSER/EVIDENCIAS/desktop-balanced-third-person-back-frames.json','firstFrame':max(0,lo-3),'lastFrame':min(len(raw),hi+20)-1,'scope':'Actual captured Rapier height/vy replay; camera tracks horizontal body motion; rig object Z changes only for presentation, not exported root motion.'}};began=time.perf_counter()
def set_action(name,sec):
 action=bpy.data.actions.get(name)
 if not action:action=next(a for a in bpy.data.actions if a.name.split('|')[-1]==name)
 rig.animation_data.action=action;rig.animation_data.action_slot=action.slots[0];frame=action.frame_range[0]+sec*(sc.render.fps/sc.render.fps_base);sc.frame_set(int(frame),subframe=frame%1)
for clip,seconds in [('walk',2.),('run',2.),('jump',jumpduration),('practice',4.)]:
 if args.pace_reference and clip not in ['walk','run']:continue
 if args.jump_only and clip!='jump':continue
 if args.condition=='retarget' and clip not in ['walk','run']:continue
 for view,loc in views.items():
  cd.ortho_scale=2.8 if clip=='jump' else 1.95;cam.location=loc
  if args.jump_only:cam.location.z=2.0 # Look down, keeping floor foreground below the resting soles.
  look=Vector((0,0,1.1 if clip=='jump' else .72));cam.rotation_euler=(look-cam.location).to_track_quat('-Z','Y').to_euler();rows=[]
  indices=[round(t*rate) for t in [0,.8,1.2,1.48,1.75,2.2,3.958]] if args.stills and clip=='practice' else [round(q*(max(2,round(seconds*rate))-1)) for q in [0,.25,.5,.75,1]] if args.stills else list(range(max(2,round(seconds*rate))))
  for i in indices:
   nominal=(2.0 if clip=='walk' else 4.5) if args.pace_reference else (3.6 if clip=='walk' else 6.2)
   t=i/rate;rig.location=(0,0,0);ground.location.y=(nominal/1.12*t)%.5 if clip in ['walk','run'] else 0
   if clip=='jump':
    nearest=min(replay,key=lambda f:abs((f['t']-epoch)/1000-t));rig.location.z=(nearest['position']['y']-groundBodyY)/1.12
    if args.condition=='before':name='jump';at=0
    elif t*1000<takeoff:name='idle';at=0
    elif t*1000<land:
     age=t-takeoff/1000
     if age<.1:name='jump-start';at=max(0,age)
     else:name='jump-air';at=max(0,min(1,.5-nearest['velocity']['y']/12.4))*.6
    elif t*1000-land<180:name='jump-land';at=max(0,t-land/1000)
    else:name='idle';at=0
   else:
    name=clip;duration=next(a.frame_range[1]-a.frame_range[0] for a in bpy.data.actions if a.name==name)/(sc.render.fps/sc.render.fps_base)
    if clip in ['walk','run']:
     if args.condition=='before':cadence=2.6 if clip=='walk' else 2.1
     elif args.condition=='retarget':cadence=1.0 # Uncorrected CC0 control, original donor timing; not production-calibrated.
     else:
      authored=json.loads((P/'CANDIDATOS'/f'cycle{args.revision}-manual/authoring.json').read_text());sample=next(s for s in authored['targetSamples'] if s['clip']==clip);cadence=nominal*sample['duty']*duration/(sample['stroke']*1.12)
     at=t*cadence%duration
    else:at=t%duration
   set_action(name,at);directory=dest/clip/view;directory.mkdir(exist_ok=True,parents=True);file=directory/f'{i:04d}.png';sc.render.filepath=str(file);bpy.ops.render.render(write_still=True);rows.append({'index':i,'time':t,'action':name,'actionTime':at,'path':str(file.relative_to(P))})
  manifest['clips'].append({'clip':clip,'view':view,'duration':seconds,'frames':rows,'presentation':'Gait plays at calibrated nominal speed cadence against comoving checker floor; jump replays captured height; practice uses native action duration.','paceProposalOnly':args.pace_reference,'visualSpeedMetresPerSecond':nominal if clip in ['walk','run'] else None});manifest['elapsedSeconds']=time.perf_counter()-began
  (P/'EVIDENCIAS'/f'render-cycle{args.revision}-{args.condition}{suffix}.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('G21_RENDER_OK',args.revision,args.condition,len(manifest['clips']),manifest['elapsedSeconds'])
