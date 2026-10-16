"""Supplementary editable practice source with native foot/pelvis Motion Paths."""
import bpy,json,math
from pathlib import Path
P=Path('/home/matteo/Documentos/ChatGPT-Codex/GOAL-21-evolucao-animacoes-2026-10-16');bpy.ops.wm.open_mainfile(filepath=str(P/'FONTES/matteo-chibi-motion-goal21.blend'));rig=bpy.data.objects['MatteoRig'];sc=bpy.context.scene
for t in rig.animation_data.nla_tracks:t.mute=True
rig.animation_data.action=bpy.data.actions['practice'];rig.animation_data.action_slot=rig.animation_data.action.slots[0];sc.frame_start=0;sc.frame_end=240
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='POSE');bpy.ops.pose.select_all(action='SELECT')
selected=['pelvis','foot.L','foot.R']
status=list(bpy.ops.pose.paths_calculate(display_type='RANGE',range='SCENE'));paths={n:{'count':len(rig.pose.bones[n].motion_path.points),'coordinates':[list(p.co) for p in rig.pose.bones[n].motion_path.points]} for n in selected};poses=[]
for sec in [0,.8,1.24,1.48,1.78,2.35,4.0]:
 f=sec*60;sc.frame_set(int(f),subframe=f%1);h=rig.pose.bones['thigh.R'].head;k=rig.pose.bones['shin.R'].head;a=rig.pose.bones['foot.R'].head;poses.append({'time':sec,'kneeFlexDegrees':math.degrees((k-h).angle(a-k)),'supportFoot':list(rig.pose.bones['foot.L'].head),'kickingFoot':list(a),'pelvis':list(rig.pose.bones['pelvis'].head)})
sc.frame_set(89);file=P/'FONTES/matteo-chibi-practice-motion-paths.blend';bpy.ops.wm.save_as_mainfile(filepath=str(file));(P/'METRICAS/practice-native-motion-paths.json').write_text(json.dumps({'file':str(file),'status':status,'action':'practice','fps':60,'range':[0,240],'paths':paths,'keyPoses':poses,'scope':'Native Motion Paths in editable copy; pelvis is a kinematic landmark, not a physically weighted COM. No user preferences or production GLB changed.'},indent=2)+'\n');print('PRACTICE_PATHS_OK',[(n,paths[n]['count']) for n in selected])
