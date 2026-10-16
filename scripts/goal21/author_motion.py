"""Versioned motion authoring on the approved 24-bone chibi. No mesh edits.

Two-bone IK targets are solved in armature space and keyed as FK. Controls and
key poses are retained as source metadata; only existing deform bones export.
"""
import bpy,math,json,sys,argparse,hashlib
from pathlib import Path
from mathutils import Vector,Matrix
ap=argparse.ArgumentParser();ap.add_argument('--revision',dest='cycle',type=int,default=1);ap.add_argument('--variant',choices=['manual'],default='manual');args=ap.parse_args(sys.argv[sys.argv.index('--')+1:])
OUT=Path('/home/matteo/Documentos/ChatGPT-Codex/GOAL-21-evolucao-animacoes-2026-10-16');DEST=OUT/'CANDIDATOS'/f'cycle{args.cycle}-{args.variant}';DEST.mkdir(exist_ok=True,parents=True)
bpy.ops.wm.open_mainfile(filepath=str(OUT/'BASELINE/matteo-chibi-natural-run.blend'))
rig=bpy.data.objects['MatteoRig'];scene=bpy.context.scene;scene.render.fps=60;FPS=60
bones={b.name:(b.head_local.copy(),b.tail_local.copy()) for b in rig.data.bones};P0=bones['pelvis'][0].copy();resthash={o.name:hashlib.sha256(repr(([tuple(v.co) for v in o.data.vertices],[tuple(p.vertices) for p in o.data.polygons])).encode()).hexdigest() for o in scene.objects if o.type=='MESH'}
for t in rig.animation_data.nla_tracks:t.mute=True
def smooth(x):x=max(0,min(1,x));return x*x*(3-2*x)
def blendkeys(t,keys):
 for (a,v),(b,w) in zip(keys,keys[1:]):
  if t<=b:return v+(w-v)*smooth((t-a)/(b-a))
 return keys[-1][1]
def orient(h,t):
 y=(Vector(t)-Vector(h)).normalized();x=Vector((1,0,0));x=(x-y*x.dot(y)).normalized();z=x.cross(y).normalized();return Matrix((x,y,z)).transposed()
def matrix(h,t):m=orient(h,t).to_4x4();m.translation=h;return m
residuals=[];contacts=[]
GAITS={'walk':{'stroke':.56,'duty':.54,'duration':1.},'run':{'stroke':.60,'duty':.28,'duration':.75}}
if args.cycle>=2:GAITS={'walk':{'stroke':.50,'duty':.50,'duration':1.},'run':{'stroke':.52,'duty':.24,'duration':.75}}
def ik(h,t,a,b,pole,record=True):
 delta=t-h;distance=delta.length;direction=delta.normalized();reach=max(abs(a-b)+1e-6,min(a+b-1e-5,distance));target=h+direction*reach
 projection=(a*a-b*b+reach*reach)/(2*reach);height=math.sqrt(max(0,a*a-projection*projection));p=Vector(pole);p=(p-direction*p.dot(direction)).normalized();joint=h+direction*projection+p*height
 if record:residuals.append(abs(distance-reach))
 return joint,target
def targets(clip,phase):
 # Forward is Blender -Y. Times below are authored phase values, not physics.
 ankles={s:bones['shin.'+s][1].copy() for s in ['L','R']};footyaw={'L':0.,'R':0.};lift={'L':0.,'R':0.};hipZ=P0.z;lean=0.;yaw=0.;roll=0.;shiftX=0.;armSwing=0.;air=0.;guard=False;landing=0.
 if clip in ['walk','run']:
  run=clip=='run';duty=GAITS[clip]['duty'];stride=GAITS[clip]['stroke'];liftHeight=.16 if run else .07
  lean=(.18 if args.cycle>=2 else .14) if run else .025;yaw=(.065 if run else .035)*math.sin(phase*math.tau);shiftX=(.018 if run else .010)*math.sin(phase*math.tau)
  hipZ=.40+(.035 if run else .012)*math.cos(phase*math.tau*2);armSwing=math.radians(42 if run else 23)
  for side,s in [('L',1),('R',-1)]:
   q=(phase+(0 if s==1 else .5))%1
   if q<duty:y=-stride/2+stride*q/duty;z=0.;support=True
   else:
    u=(q-duty)/(1-duty);y=stride/2-stride*smooth(u);z=liftHeight*math.sin(math.pi*u)**1.5;support=False
    if args.cycle>=2:
     # Cubic Hermite swing matches the support velocity at lift/contact.
     tangent=stride*(1-duty)/duty;y=(2*u**3-3*u*u+1)*stride/2+(u**3-2*u*u+u)*tangent+(-2*u**3+3*u*u)*(-stride/2)+(u**3-u*u)*tangent
   ankles[side]=Vector((s*.111,.015+y,.05+z));lift[side]=z
   contacts.append({'clip':clip,'phase':phase,'side':side,'stance':support,'target':list(ankles[side]),'duty':duty,'stroke':stride})
  # Respect real segment lengths; lower pelvis at double support instead of
  # stretching geometry or allowing IK reach clipping to lift a planted foot.
  for side,s in [('L',1),('R',-1)]:
   h=Vector((s*.101+shiftX,.015,hipZ));t=ankles[side];length=(bones['shin.'+side][0]-bones['thigh.'+side][0]).length+(bones['shin.'+side][1]-bones['shin.'+side][0]).length-.004
   horizontal=(t.x-h.x)**2+(t.y-h.y)**2
   if horizontal<length*length:hipZ=min(hipZ,t.z+math.sqrt(length*length-horizontal))
 elif clip.startswith('jump'):
  if clip=='jump-start':
   anticipation=math.sin(math.pi*phase);hipZ=P0.z-.055*anticipation;lean=.05*anticipation;air=phase*.25
   if args.cycle>=3:
    air=.16*phase;hipZ+=.008*math.sin(math.pi*air);lean-=.03*math.sin(math.pi*air)
    for side,s in [('L',1),('R',-1)]:ankles[side]+=Vector((0,(-.04 if s==1 else .045)*math.sin(math.pi*air),(.10 if s==1 else .15)*math.sin(math.pi*air)**.8))
  elif clip in ['jump-air','jump']:
   air=phase;hipZ=P0.z+.008*math.sin(math.pi*phase);lean=-.03*math.sin(math.pi*phase)
  else:
   landing=math.sin(math.pi*phase)**1.2;hipZ=P0.z-.075*landing;lean=.09*landing
  if clip in ['jump-air','jump']:
   for side,s in [('L',1),('R',-1)]:
    lift[side]=(.10 if s==1 else .15)*math.sin(math.pi*phase)**.8;ankles[side]+=Vector((0,(-.04 if s==1 else .045)*(math.sin(math.pi*phase) if args.cycle>=3 else 1),lift[side]))
 elif clip=='practice':
  guard=True;t=phase*4
  pivot=blendkeys(t,[(0,0),(.75,0),(1.22,1),(1.70,1),(2.38,0),(4,0)])
  shiftX=.055*pivot;hipZ=.398+.012*pivot;yaw=math.radians(68)*pivot;roll=.055*pivot;footyaw['L']=math.radians(100)*pivot
  ankles['L']=Vector((.14,-.09,.05));ankles['R']=Vector((-.13,.12,.05))
  chamber=Vector((-.17,.025,.36));impact=Vector((-.045,-.40,.60))
  if t<1.24:
   u=smooth((t-.78)/.46);ankles['R']=ankles['R'].lerp(chamber,u)
  elif t<1.48:ankles['R']=chamber.lerp(impact,smooth((t-1.24)/.24))
  elif t<1.78:ankles['R']=impact.lerp(chamber,smooth((t-1.48)/.30))
  elif t<2.35:ankles['R']=chamber.lerp(ankles['R'],smooth((t-1.78)/.57))
  if args.cycle>=2:
   # Slightly longer chamber and quieter head/guard are reviewed separately.
   lean=-.035*pivot
 return ankles,footyaw,lift,hipZ,lean,yaw,roll,shiftX,armSwing,air,guard,landing
def pose(clip,phase):
 if args.cycle>=3 and clip=='jump':
  # Same poses as the phase actions, laid out in one normalized timeline.
  if phase<.1:clip='jump-start';phase=phase/.1
  elif phase<.8:clip='jump-air';phase=.16+(phase-.1)/.7*.84
  else:clip='jump-land';phase=(phase-.8)/.2
 for pb in rig.pose.bones:pb.location=(0,0,0);pb.rotation_mode='QUATERNION';pb.rotation_quaternion=(1,0,0,0);pb.scale=(1,1,1)
 ankles,fy,lifts,hz,lean,yaw,roll,sx,swing,air,guard,landing=targets(clip,phase)
 forwardShift=-.08*(yaw/math.radians(68)) if args.cycle>=3 and guard else 0.
 P=P0+Vector((sx,forwardShift,hz-P0.z));R=Matrix.Rotation(yaw,3,'Z')@Matrix.Rotation(roll,3,'Y')@Matrix.Rotation(lean,3,'X');mats={}
 def tr(p):return P+R@(p-P0)
 topR=R@Matrix.Rotation(.11*landing,3,'X') if args.cycle>=2 else R
 def top(p):return P+topR@(p-P0)
 def put(name,h,t,rotation=None):
  m=matrix(h,t) if rotation is None else rotation.to_4x4();m.translation=h;mats[name]=m;pb=rig.pose.bones[name];parent=pb.bone.parent
  kw={'parent_matrix':mats[parent.name],'parent_matrix_local':parent.matrix_local} if parent else {}
  pb.matrix_basis=pb.bone.convert_local_to_pose(m,pb.bone.matrix_local,invert=True,**kw)
 put('root',*bones['root'])
 for name in ['pelvis','spine','chest','neck','head']:
  h,t=map(tr if name=='pelvis' else top,bones[name]);rotation=None
  if name=='head':t=h+Matrix.Rotation(-yaw*(.85 if guard else .55),3,'Z')@(t-h)
  if args.cycle>=2:
   rotation=(R if name=='pelvis' else topR)@rig.data.bones[name].matrix_local.to_3x3()
   if name=='head':rotation=Matrix.Rotation(-yaw*(.85 if guard else .55),3,'Z')@rotation
  put(name,h,t,rotation)
 for side,s in [('L',1),('R',-1)]:
  hip=tr(bones['thigh.'+side][0]);knee0,ankle0=bones['shin.'+side];l1=(knee0-bones['thigh.'+side][0]).length;l2=(ankle0-knee0).length
  pole=Vector((-.30,-1,.8)) if guard and side=='R' else Vector((0,-1,.08))
  isRoundKick=args.cycle>=3 and guard and side=='R'
  knee,ankle=ik(hip,ankles[side],l1,l2,pole,record=not isRoundKick)
  normal=(knee-hip).cross(ankle-knee).normalized()
  if normal.dot(R.col[0])<0:normal=-normal
  chamberAmount=0.
  if isRoundKick:
   t=phase*4;chamberAmount=blendkeys(t,[(0,0),(.78,0),(1.24,1),(1.78,1),(2.35,0),(4,0)])
   upperGuard=(knee-hip).normalized();lowerGuard=(ankle-knee).normalized();guardFlex=upperGuard.angle(lowerGuard)
   kickUpper=Vector((0,-math.sqrt(.75),.5));kickNormal=Vector((0,-.5,-math.sqrt(.75)))
   guardFrame=Matrix((normal,upperGuard,normal.cross(upperGuard).normalized())).transposed()
   kickFrame=Matrix((kickNormal,kickUpper,kickNormal.cross(kickUpper).normalized())).transposed()
   frame=guardFrame.to_quaternion().slerp(kickFrame.to_quaternion(),chamberAmount).to_matrix();normal=frame.col[0].copy();upper=frame.col[1].copy()
   snap=blendkeys(t,[(0,125),(1.24,125),(1.48,20),(1.78,125),(4,125)])
   flex=guardFlex+(math.radians(snap)-guardFlex)*chamberAmount;lower=Matrix.Rotation(flex,3,normal)@upper
   knee=hip+upper*l1;ankle=knee+lower*l2
   # This is an articulated arc about a rolled knee hinge, not a straight
   # endpoint interpolation that merely resembles a front kick.
  def hinge(h,t):
   y=(t-h).normalized();x=normal-y*normal.dot(y)
   if x.length<1e-5:x=R.col[0]-y*R.col[0].dot(y)
   x.normalize();z=x.cross(y).normalized();return Matrix((x,y,z)).transposed()
  put('thigh.'+side,hip,knee,hinge(hip,knee) if args.cycle>=2 else None);put('shin.'+side,knee,ankle,hinge(knee,ankle) if args.cycle>=2 else None)
  fd=Matrix.Rotation(fy[side],3,'Z')@(bones['foot.'+side][1]-ankle0)
  if guard and side=='R' and ankles[side].z>.2:fd=Vector((0,-.085,-.075)).normalized()*fd.length
  footRotation=None
  if args.cycle>=2:
   pitch=0.
   if clip in ['walk','run']:
    q=(phase+(0 if s==1 else .5))%1;duty=GAITS[clip]['duty']
    if q>duty:pitch=.20*math.sin(math.pi*(q-duty)/(1-duty))
   footRotation=Matrix.Rotation(fy[side],3,'Z')@Matrix.Rotation(pitch,3,'X')@rig.data.bones['foot.'+side].matrix_local.to_3x3()
   if guard and side=='R' and ankles[side].z>.2:footRotation=(bones['foot.'+side][1]-ankle0).rotation_difference(fd).to_matrix()@rig.data.bones['foot.'+side].matrix_local.to_3x3()
   if isRoundKick:
    d=(ankle-knee).normalized();target=hinge(ankle,ankle+d)
    footRotation=rig.data.bones['foot.'+side].matrix_local.to_quaternion().slerp(target.to_quaternion(),chamberAmount).to_matrix()
  put('foot.'+side,ankle,ankle+fd,footRotation);jd=((knee-hip).normalized()+(ankle-knee).normalized()).normalized();put('knee_support.'+side,knee,knee+jd*.035,hinge(knee,knee+jd*.035) if args.cycle>=2 else None)
  sh=top(bones['upper_arm.'+side][0]);el0,wr0=bones['forearm.'+side];a=(el0-bones['upper_arm.'+side][0]).length;b=(wr0-el0).length;c=(bones['hand.'+side][1]-wr0).length
  if guard:
   wrist=Vector((s*.18,-.20 if args.cycle>=2 else -.17,(.89 if s==1 else .87) if args.cycle>=2 else (.81 if s==1 else .79)));wrist=P+Matrix.Rotation(yaw*.35,3,'Z')@(wrist-P0);handdir=Vector((0,-.015,.083));el,wrist=ik(sh,wrist,a,b,(s*.8,.15,-.2));u=(el-sh).normalized();d=(wrist-el).normalized()
  elif clip.startswith('jump'):
   peak=math.sin(math.pi*air);wrist=top(wr0)+Vector((s*.025,(-.18 if args.cycle>=2 else -.10)*peak,(.38 if args.cycle>=2 else .20)*peak));el,wrist=ik(sh,wrist,a,b,(s*.8,.1,-.2));u=(el-sh).normalized();d=(wrist-el).normalized();handdir=d*c
  else:
   theta=swing*math.cos(phase*math.tau+(0 if s==1 else math.pi));u=Matrix.Rotation(theta,3,'X')@Vector((s*.30,0,-.954)).normalized();bend=math.radians(70 if clip=='run' else 25);d=Matrix.Rotation(-bend,3,'X')@u;el=sh+u*a;wrist=el+d*b;handdir=d*c
  put('clavicle.'+side,top(bones['clavicle.'+side][0]),sh,topR@rig.data.bones['clavicle.'+side].matrix_local.to_3x3() if args.cycle>=2 else None)
  normal=(el-sh).cross(wrist-el).normalized()
  if normal.dot(topR.col[0])<0:normal=-normal
  put('upper_arm.'+side,sh,el,hinge(sh,el) if args.cycle>=2 else None);put('forearm.'+side,el,wrist,hinge(el,wrist) if args.cycle>=2 else None);put('hand.'+side,wrist,wrist+handdir.normalized()*c,hinge(wrist,wrist+handdir.normalized()*c) if args.cycle>=2 else None);j=(u+d).normalized();put('elbow_support.'+side,el,el+j*.035,hinge(el,el+j*.035) if args.cycle>=2 else None)
 bpy.context.view_layer.update()
 return mats
def curves(action):return [fc for la in action.layers for st in la.strips for bag in st.channelbags for fc in bag.fcurves]
durations={'walk':1.,'run':.75,'jump':1.,'jump-start':.10,'jump-air':.60,'jump-land':.18,'practice':4.}
for name,seconds in durations.items():
 old=bpy.data.actions.get(name)
 if old:
  for track in list(rig.animation_data.nla_tracks):
   if any(st.action==old for st in track.strips):rig.animation_data.nla_tracks.remove(track)
  if rig.animation_data.action==old:rig.animation_data.action=None
  bpy.data.actions.remove(old)
 action=bpy.data.actions.new(name);action.use_fake_user=True;rig.animation_data.action=action
 frames=round(seconds*FPS)
 for f in range(frames+1):
  scene.frame_set(f);pose(name,f/frames)
  for pb in rig.pose.bones:
   pb.keyframe_insert('location',frame=f,group=pb.name);pb.keyframe_insert('rotation_quaternion',frame=f,group=pb.name);pb.keyframe_insert('scale',frame=f,group=pb.name)
 # Continuous quaternion hemisphere for stable glTF linear sampling.
 for pb in rig.pose.bones:
  fs=sorted([fc for fc in curves(action) if fc.data_path==f'pose.bones["{pb.name}"].rotation_quaternion'],key=lambda fc:fc.array_index)
  if len(fs)!=4:continue
  last=None
  for i in range(len(fs[0].keyframe_points)):
   q=[fc.keyframe_points[i].co.y for fc in fs]
   if last and sum(x*y for x,y in zip(last,q))<0:
    q=[-x for x in q]
    for fc,v in zip(fs,q):fc.keyframe_points[i].co.y=v
   last=q
 for fc in curves(action):
  for k in fc.keyframe_points:k.interpolation='LINEAR'
 track=rig.animation_data.nla_tracks.new();track.name=name;strip=track.strips.new(name,0,action);strip.name=name;track.mute=True
 action['semantic_phases']='guard,chamber,pivot,extension,rechamber,settle' if name=='practice' else 'support,swing' if name in ['walk','run'] else 'physics-driven jump phase'
# Original idle/seated keys were authored at24fps: preserve duration under60fps.
for name,seconds in [('idle',3.),('seated-pose',2.)]:
 action=bpy.data.actions[name]
 for fc in curves(action):
  for k in fc.keyframe_points:k.co.x*=60/24;k.handle_left.x*=60/24;k.handle_right.x*=60/24
 for track in rig.animation_data.nla_tracks:
  for strip in track.strips:
   if strip.action==action:strip.action_frame_end=seconds*FPS;strip.frame_end=seconds*FPS
rig.animation_data.action=bpy.data.actions['idle'];rig.animation_data.action_slot=rig.animation_data.action.slots[0];scene.frame_start=0;scene.frame_end=240;scene.frame_set(0)
assert len(rig.data.bones)==24
for o in scene.objects:
 if o.type=='MESH':assert resthash[o.name]==hashlib.sha256(repr(([tuple(v.co) for v in o.data.vertices],[tuple(p.vertices) for p in o.data.polygons])).encode()).hexdigest()
scene['goal21_cycle']=args.cycle;scene['motion_source']='IK target design bakedFK; original geometry/material/skin/rest preserved';rig['gait_contact_manifest']=json.dumps(GAITS)
blendfile=DEST/'matteo-chibi-motion.blend';glbfile=DEST/'matteo-chibi-motion.glb';bpy.ops.wm.save_as_mainfile(filepath=str(blendfile))
bpy.ops.object.select_all(action='DESELECT')
for ob in bpy.data.collections['MATTEO CHIBI V3 | skinned export'].objects:ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(glbfile),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_optimize_animation_size=True,export_cameras=False,export_lights=False)
(DEST/'authoring.json').write_text(json.dumps({'cycle':args.cycle,'variant':args.variant,'fps':FPS,'gaits':GAITS,'durations':{**durations,'idle':3.,'seated-pose':2.},'meshHashes':resthash,'maxIKReachResidual':max(residuals),'targetSamples':contacts,'blend':str(blendfile),'glb':str(glbfile),'rootMotion':False},indent=2)+'\n')
print('GOAL21_AUTHORED',args.cycle,args.variant,'maxReachResidual',max(residuals),'bytes',glbfile.stat().st_size)
