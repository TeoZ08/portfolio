"""Read-only fresh source and GLB checks in a factory Blender process."""
import bpy,json,math,hashlib
from pathlib import Path
P=Path('/home/matteo/Documentos/ChatGPT-Codex/GOAL-21-evolucao-animacoes-2026-10-16');report={}
for label,file in [('editable',P/'FONTES/matteo-chibi-motion-goal21.blend'),('candidate',P/'CANDIDATOS/cycle3-manual/matteo-chibi-motion.glb'),('retarget',P/'CANDIDATOS/retarget-cc0-probe/retarget-probe.glb')]:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 if file.suffix=='.blend':bpy.ops.wm.open_mainfile(filepath=str(file))
 else:bpy.ops.import_scene.gltf(filepath=str(file))
 rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE');sc=bpy.context.scene
 assert len(rig.data.bones)==24
 actions=[]
 for t in rig.animation_data.nla_tracks:t.mute=True
 for a in bpy.data.actions:
  rig.animation_data.action=a;rig.animation_data.action_slot=a.slots[0];lo,hi=a.frame_range;ext=[]
  for f in [lo,lo+(hi-lo)*.25,lo+(hi-lo)*.5,lo+(hi-lo)*.75,hi]:
   sc.frame_set(int(f),subframe=f%1)
   for b in rig.pose.bones:assert all(math.isfinite(v) for row in b.matrix for v in row)
   root=rig.pose.bones.get('root');assert (root.head-rig.data.bones['root'].head_local).length<1e-5,'Root drift'
   ext.append({'frame':f,'head':list(rig.pose.bones['head'].head)})
  actions.append({'name':a.name,'frameRange':list(a.frame_range),'duration':(hi-lo)/(sc.render.fps/sc.render.fps_base),'posesFinite':True,'samples':ext})
 report[label]={'file':str(file),'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'bytes':file.stat().st_size,'bones':[b.name for b in rig.data.bones],'actions':actions,'motionPathCount':sum(bool(b.motion_path) for b in rig.pose.bones),'meshCount':sum(o.type=='MESH' for o in sc.objects)}
 assert len(actions)==(9 if label!='retarget' else 6)
with bpy.data.libraries.load(str(P/'FONTES/goal21-pose-library.blend'),link=False,assets_only=True) as (src,dst):names=list(src.actions)
assert len(names)==5;report['poseLibraryAssets']=names
(P/'METRICAS/fresh-import-native.json').write_text(json.dumps(report,indent=2)+'\n');print('FRESH_NATIVE_OK',list(report))
