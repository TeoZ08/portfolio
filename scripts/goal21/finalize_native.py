"""Native Bake Action, Motion Paths and separate pose-asset library on a copy."""
import bpy,json,hashlib,shutil,math
from pathlib import Path
P=Path('/home/matteo/Documentos/ChatGPT-Codex/GOAL-21-evolucao-animacoes-2026-10-16');D=P/'CANDIDATOS/cycle3-manual';B=D/'pre-native';B.mkdir(exist_ok=True)
for name in ['matteo-chibi-motion.blend','matteo-chibi-motion.glb']:
 if not (B/name).exists():shutil.copy2(D/name,B/name)
manifest=P/'EVIDENCIAS/render-cycle3-manual-critical.json'
if manifest.exists():
 m=json.loads(manifest.read_text());m['source']=str(B/'matteo-chibi-motion.glb');m['sourceSha256']=hashlib.sha256((B/'matteo-chibi-motion.glb').read_bytes()).hexdigest();manifest.write_text(json.dumps(m,indent=2)+'\n')
bpy.ops.wm.open_mainfile(filepath=str(B/'matteo-chibi-motion.blend'));rig=bpy.data.objects['MatteoRig'];sc=bpy.context.scene
def activate(a):
 for t in rig.animation_data.nla_tracks:t.mute=True
 rig.animation_data.action=a;rig.animation_data.action_slot=a.slots[0]
def sample(f):
 sc.frame_set(int(f),subframe=f%1);return {b.name:[list(r) for r in b.matrix] for b in rig.pose.bones}
original=bpy.data.actions['walk'];activate(original);phases=[0,15,30,45,60];before={f:sample(f) for f in phases}
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig
status=list(bpy.ops.nla.bake(frame_start=0,frame_end=60,step=1,only_selected=False,visual_keying=True,clear_constraints=False,clear_parents=False,use_current_action=False,bake_types={'POSE'}));baked=rig.animation_data.action
after={f:sample(f) for f in phases};error=max(abs(before[f][n][r][c]-after[f][n][r][c]) for f in phases for n in before[f] for r in range(4) for c in range(4));assert error<1e-5
for t in rig.animation_data.nla_tracks:
 for strip in t.strips:
  if strip.action==original:strip.action=baked
bpy.data.actions.remove(original);baked.name='walk';baked.use_fake_user=True
sc.frame_start=0;sc.frame_end=60;bpy.ops.object.mode_set(mode='POSE');bpy.ops.pose.select_all(action='SELECT');pathstatus=list(bpy.ops.pose.paths_calculate(display_type='RANGE',range='SCENE'));paths=[{'bone':b.name,'points':len(b.motion_path.points)} for b in rig.pose.bones if b.motion_path];assert len(paths)==24;bpy.ops.object.mode_set(mode='OBJECT')
assets=[]
for name,clip,sec in [('G21 Guard right-rear','practice',0),('G21 Chamber right','practice',1.24),('G21 Round kick middle','practice',1.48),('G21 Rechamber right','practice',1.78),('G21 Landing absorption','jump-land',.09)]:
 activate(bpy.data.actions[clip]);sample(sec*60);values={b.name:(b.location.copy(),b.rotation_quaternion.copy(),b.scale.copy()) for b in rig.pose.bones};asset=bpy.data.actions.new(name);rig.animation_data.action=asset
 for bone in rig.pose.bones:
  bone.location,bone.rotation_quaternion,bone.scale=values[bone.name]
  for prop in ['location','rotation_quaternion','scale']:bone.keyframe_insert(prop,frame=0,group=bone.name)
 asset.asset_mark();asset.asset_data.description=f'GOAL21 chibi24, {clip} t={sec:.3f}s; technical study, human visual approval pending.';assets.append(asset)
library=P/'FONTES/goal21-pose-library.blend';bpy.data.libraries.write(str(library),set(assets),fake_user=True,compress=True)
activate(bpy.data.actions['idle'])
for a in assets:bpy.data.actions.remove(a)
sc.frame_start=0;sc.frame_end=240;sc.frame_set(0);rig['native_bake_evidence']='walk visual Bake Action, max matrix error '+str(error);rig['pose_library']=str(library)
source=P/'FONTES/matteo-chibi-motion-goal21.blend';bpy.ops.wm.save_as_mainfile(filepath=str(source));shutil.copy2(source,D/'matteo-chibi-motion.blend')
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.collections['MATTEO CHIBI V3 | skinned export'].objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(D/'matteo-chibi-motion.glb'),export_format='GLB',use_selection=True,export_animation_mode='ACTIONS',export_animations=True,export_force_sampling=True,export_optimize_animation_size=True,export_cameras=False,export_lights=False)
result={'source':str(source),'glb':str(D/'matteo-chibi-motion.glb'),'originalPreserved':str(B),'bake':{'status':status,'frames':[0,60],'comparedFrames':phases,'maxMatrixElementError':error},'motionPaths':{'status':pathstatus,'bones':paths,'range':[0,60],'action':'walk'},'poseAssets':{'library':str(library),'count':len(assets),'userAssetPreferencesChanged':False},'scope':'Analytic IK targets authored as FK; native visual bake validated; no mesh/material/rest/skin changes; pose assets separate from exported actions.'}
(P/'METRICAS/native-production-workflow.json').write_text(json.dumps(result,indent=2)+'\n');print('NATIVE_PRODUCTION_OK',error,len(paths),len(assets))
