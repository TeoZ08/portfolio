"""Actual Quaternius directional retarget control; not the selected production gait.

20 semantic chains, native segment lengths, four support bones derived. This
control deliberately does not fake foot locks: compare it with authored IK gait.
"""
import bpy,json,math,sys,hashlib
from pathlib import Path
from mathutils import Vector,Matrix
P=Path('/home/matteo/Documentos/ChatGPT-Codex/GOAL-21-evolucao-animacoes-2026-10-16');D=P/'CANDIDATOS/retarget-cc0-probe';D.mkdir(exist_ok=True,parents=True);source=json.loads((P/'BASELINE/quaternius-donor-samples.json').read_text())
bpy.ops.wm.open_mainfile(filepath=str(P/'BASELINE/matteo-chibi-natural-run.blend'));rig=bpy.data.objects['MatteoRig'];sc=bpy.context.scene
for t in rig.animation_data.nla_tracks:t.mute=True
rest={b.name:b.matrix_local.copy() for b in rig.data.bones};heads={b.name:b.head_local.copy() for b in rig.data.bones}
mapping={'root':'root','pelvis':'pelvis','spine':'spine_01','chest':'spine_03','neck':'neck_01','head':'Head'}
for side,suffix in [('L','l'),('R','r')]:
 for target,src in [('clavicle','clavicle'),('upper_arm','upperarm'),('forearm','lowerarm'),('hand','hand'),('thigh','thigh'),('shin','calf'),('foot','foot')]:mapping[target+'.'+side]=src+'_'+suffix
def orient(head,tail,right):
 y=(tail-head).normalized();x=right-y*right.dot(y)
 if x.length<1e-5:x=Vector((0,1,0))-y*y.y
 x.normalize();z=x.cross(y).normalized();m=Matrix((x,y,z)).transposed().to_4x4();m.translation=head;return m
def curves(a):return [f for l in a.layers for s in l.strips for b in s.channelbags for f in b.fcurves]
metrics=[]
for name,donorName in [('walk','Walk_Loop'),('run','Sprint_Loop')]:
 old=bpy.data.actions[name]
 for t in list(rig.animation_data.nla_tracks):
  if any(s.action==old for s in t.strips):rig.animation_data.nla_tracks.remove(t)
 if rig.animation_data.action==old:rig.animation_data.action=None
 bpy.data.actions.remove(old);action=bpy.data.actions.new(name);action.use_fake_user=True;rig.animation_data.action=action
 donor=next(a for a in source['actions'] if a['name']==donorName);samples=donor['samples'];duration=donor['duration'];basePelvis=Vector(samples[0]['bones']['pelvis']['head']);rows=[]
 for i,sample in enumerate(samples):
  frame=sample['time']*24;sc.frame_set(int(frame),subframe=frame%1);matrices={}
  for pb in rig.pose.bones:pb.rotation_mode='QUATERNION';pb.matrix_basis=Matrix.Identity(4)
  def put(n,h,t,right=Vector((1,0,0))):
   m=orient(h,t,right);matrices[n]=m;pb=rig.pose.bones[n];parent=pb.bone.parent;kw={'parent_matrix':matrices[parent.name],'parent_matrix_local':rest[parent.name]} if parent else {};pb.matrix_basis=pb.bone.convert_local_to_pose(m,rest[n],invert=True,**kw)
  def head(n):
   parent=rig.data.bones[n].parent
   return heads[n].copy() if parent is None else matrices[parent.name]@(rest[parent.name].inverted()@heads[n])
  for n in ['root','pelvis','spine','chest','neck','head']:
   h=head(n);src=sample['bones'][mapping[n]];direction=Vector(src['tail'])-Vector(src['head'])
   if n=='root':h=heads[n];direction=rig.data.bones[n].tail_local-heads[n]
   if n=='pelvis':h.z+=(Vector(src['head']).z-basePelvis.z)*.48
   put(n,h,h+direction.normalized()*rig.data.bones[n].length)
  for side in ['L','R']:
   for chain in [['clavicle','upper_arm','forearm','hand'],['thigh','shin','foot']]:
    for tag in chain:
     n=tag+'.'+side;src=sample['bones'][mapping[n]];h=head(n);direction=(Vector(src['tail'])-Vector(src['head'])).normalized();put(n,h,h+direction*rig.data.bones[n].length)
   for support,upper,lower in [('elbow_support','upper_arm','forearm'),('knee_support','thigh','shin')]:
    n=support+'.'+side;h=head(n);u=matrices[upper+'.'+side].col[1].xyz.normalized();v=matrices[lower+'.'+side].col[1].xyz.normalized();put(n,h,h+(u+v).normalized()*rig.data.bones[n].length)
  bpy.context.view_layer.update()
  rows.append({'time':sample['time'],'feet':{s:list(rig.pose.bones['foot.'+s].head) for s in ['L','R']}})
  for pb in rig.pose.bones:
   for prop in ['location','rotation_quaternion','scale']:pb.keyframe_insert(prop,frame=frame,group=pb.name)
 for pb in rig.pose.bones:
  fs=sorted([f for f in curves(action) if f.data_path==f'pose.bones["{pb.name}"].rotation_quaternion'],key=lambda f:f.array_index);last=None
  if len(fs)!=4:continue
  for i in range(len(fs[0].keyframe_points)):
   q=[f.keyframe_points[i].co.y for f in fs]
   if last and sum(x*y for x,y in zip(last,q))<0:
    q=[-x for x in q]
    for f,v in zip(fs,q):f.keyframe_points[i].co.y=v
   last=q
 for f in curves(action):
  for k in f.keyframe_points:k.interpolation='LINEAR'
 track=rig.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,0,action);track.mute=True
 metrics.append({'clip':name,'donor':donorName,'duration':duration,'samples':rows})
rig.animation_data.action=bpy.data.actions['idle'];rig.animation_data.action_slot=rig.animation_data.action.slots[0];sc.frame_set(0);sc.frame_end=96
rig['retarget_scope']='20directsemanticdirections +4derivedsupports; native segmentlengths; no footplant correction. Control candidate only.'
bpy.ops.wm.save_as_mainfile(filepath=str(D/'retarget-probe.blend'));bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.collections['MATTEO CHIBI V3 | skinned export'].objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(D/'retarget-probe.glb'),export_format='GLB',use_selection=True,export_animation_mode='ACTIONS',export_animations=True,export_force_sampling=True,export_optimize_animation_size=True,export_cameras=False,export_lights=False)
(D/'retarget.json').write_text(json.dumps({'source':'Quaternius Standard CC0, preserved License.txt','method':'Directional retarget control, full20semantic chains, 4derivedsupports; no foot locking or new mesh. Not the production winner by default.','mapping':mapping,'clips':metrics},indent=2)+'\n');print('RETARGET_PROBE_OK',len(mapping))
