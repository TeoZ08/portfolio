"""Build the original faceted Matteo portrait, editable rig and in-place clips.

Run from the repository: blender51 -b --python scripts/build-matteo-lowpoly.py
No photographs are embedded in the asset. Coordinates: Z up, front -Y.
"""
import bpy
import bmesh
import math
import random
from pathlib import Path
from mathutils import Vector, Quaternion

ROOT = Path(__file__).resolve().parent.parent
REVIEW = ROOT / "work/avatar-review-v5"
REVIEW.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
random.seed(41)


def material(name, hex_color, roughness=.85, metallic=0):
    rgb = tuple(int(hex_color[i:i+2], 16) / 255 for i in (0, 2, 4))
    # Input palette is sRGB; shader sockets use linear values.
    linear = tuple(c / 12.92 if c < .04045 else ((c + .055) / 1.055) ** 2.4 for c in rgb)
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*linear, 1)
    mat.use_nodes = True
    shader = next(node for node in mat.node_tree.nodes if node.type == "BSDF_PRINCIPLED")
    shader.inputs["Base Color"].default_value = (*linear, 1)
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metallic
    return mat


SKIN = material("Light warm skin", "D5AF94", .76)
EAR = material("Ear and lips", "BA8976", .88)
TEE = material("Off-white cotton", "E8E3D6", .94)
SEAM = material("Cotton seams", "D4CDBE", .94)
PANTS = material("Charcoal twill", "303438", .95)
FOLD = material("Twill seam", "3B4043", .95)
SHOE = material("Warm grey suede", "B8B5AC", .92)
SOLE = material("Off-white rubber", "DDD9CB", .98)
HAIR = material("Dark wavy hair", "17191D", .96)
HAIR_LIGHT = material("Wave ridges", "2B2527", .9)
EYE = material("Eyes and brows", "302820", .72)
WHITE = material("Eye ivory", "E4DBCB", .85)
SILVER = material("Quiet silver", "A8ABA8", .48, .55)
objects = []


def finish(obj, name, mat, bone, weights=None):
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    for face in obj.data.polygons:
        face.use_smooth = False
    if weights:
        for vertex in obj.data.vertices:
            for key, weight in weights(vertex.co + obj.location).items():
                if weight > .001:
                    group = obj.vertex_groups.get(key) or obj.vertex_groups.new(name=key)
                    group.add([vertex.index], weight, "REPLACE")
    else:
        group = obj.vertex_groups.new(name=bone)
        group.add(list(range(len(obj.data.vertices))), 1, "REPLACE")
    objects.append(obj)
    return obj


def ellipsoid(name, pos, scale, mat, bone="head", rotation=(0, 0, 0), segments=16, rings=10):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=pos)
    obj = bpy.context.object
    obj.scale = scale
    obj.rotation_euler = rotation
    return finish(obj, name, mat, bone)


def ring_mesh(name, rows, mat, bone, segments=20, weights=None, folds=0):
    # Rows are z, centre x/y, half-width and half-depth.
    verts, faces = [], []
    for j, (z, x, y, width, depth) in enumerate(rows):
        for i in range(segments):
            a = 2 * math.pi * i / segments
            variation = 1 + folds * math.sin(a * 5 + j * .6)
            verts.append((x + width * math.cos(a) * variation,
                          y + depth * math.sin(a) * variation, z))
    for j in range(len(rows)-1):
        for i in range(segments):
            a = j * segments + i
            b = j * segments + (i+1) % segments
            faces.append((a, b, b+segments, a+segments))
    faces.append(tuple(reversed(range(segments))))
    faces.append(tuple((len(rows)-1)*segments+i for i in range(segments)))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    return finish(obj, name, mat, bone, weights)


def tube(name, points, radius, mat, bone, cyclic=False):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 1
    curve.bevel_depth = radius
    curve.bevel_resolution = 2
    spline = curve.splines.new("POLY")
    spline.points.add(len(points)-1)
    for point, co in zip(spline.points, points):
        point.co = (*co, 1)
    spline.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    return finish(bpy.context.object, name, mat, bone)


def torso_weights(co):
    t = max(0, min(1, (co.z - 1.0) / .27))
    return {"hips": 1-t, "chest": t}


shirt = ring_mesh("T-shirt body", [
    (.89, 0, .012, .157, .102), (.905, 0, .012, .166, .108),
    (.96, 0, .008, .163, .108), (1.06, 0, .006, .155, .100),
    (1.18, 0, 0, .180, .110), (1.31, 0, 0, .211, .115),
    (1.385, 0, 0, .218, .101), (1.425, 0, 0, .164, .084),
    (1.447, 0, 0, .064, .057),
], TEE, "chest", weights=torso_weights, folds=.018)
# Keep authored planar shoulders and cloth panels for the low-poly silhouette.
bpy.context.view_layer.objects.active = shirt
bpy.ops.object.select_all(action="DESELECT")
shirt.select_set(True)
ring_mesh("T-shirt hem", [(.891, 0, .012, .168, .109), (.907, 0, .012, .168, .11)], SEAM, "hips")
ring_mesh("Neck", [(1.42, 0, 0, .054, .048), (1.485, 0, -.002, .055, .052), (1.52, 0, 0, .062, .053)], SKIN, "head")
tube("Collar binding", [(.067*math.cos(a), .057*math.sin(a), 1.445-.015*max(0,-math.sin(a)))
                         for a in [i*2*math.pi/32 for i in range(32)]], .006, SEAM, "chest", True)

# Original low-poly portrait: broad facial planes, soft tapered jaw and full lips.
# Facial landmarks are authored explicitly; no photogrammetry or photo textures.
def poly_object(name, vertices, faces, mat, bone="head"):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    bm=bmesh.new(); bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    bm.to_mesh(mesh); bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    return finish(obj, name, mat, bone)

# Each ring keeps the frontal cheek planes and the rounder back of the skull.
rows = [
    (1.483,.032,-.047,.027), (1.505,.062,-.073,.047),
    (1.541,.087,-.074,.064), (1.578,.098,-.076,.078),
    (1.619,.109,-.077,.085), (1.652,.106,-.072,.087),
    (1.692,.102,-.069,.082), (1.729,.087,-.050,.066),
    (1.751,.045,-.018,.038),
]
verts, faces = [], []
for z,w,front,back in rows:
    verts.extend([(x*w,y,z) for x,y in [
        (-1,.006),(-.72,front+.016),(-.36,front+.002),(0,front),
        (.36,front+.002),(.72,front+.016),(1,.006),
        (.86,back*.7),(.48,back),(0,back+.008),(-.48,back),(-.86,back*.7)]])
for j in range(len(rows)-1):
    for i in range(12):
        a=j*12+i;b=j*12+(i+1)%12;c=b+12;d=a+12
        # A deliberate diagonal on the cheeks gives broad readable facets.
        faces.extend([(a,b,d),(b,c,d)])
faces.extend([tuple(reversed(range(12))),tuple((len(rows)-1)*12+i for i in range(12))])
poly_object("Portrait facial planes",verts,faces,SKIN)

# The nose bridge and tip form one wedge, avoiding a separate spherical nose.
poly_object("Nose bridge and soft tip",[
    (-.013,-.076,1.654),(.013,-.076,1.654),
    (-.016,-.101,1.604),(.016,-.101,1.604),
    (-.024,-.088,1.589),(.024,-.088,1.589),
    (0,-.116,1.600),(0,-.101,1.586),
],[(0,1,6),(0,6,2),(1,3,6),(2,6,7,4),(6,3,5,7),(4,7,5),(0,2,4),(1,5,3)],SKIN)
LIP=material("Natural muted rose lips","AB7468",.94)
LIP_LIGHT=material("Lower lip plane","C18B7B",.94)
# A subtle cupid's bow and fuller lower lip, as in the supplied portrait.
poly_object("Upper lip",[(-.034,-.077,1.567),(-.014,-.086,1.574),(0,-.088,1.570),(.014,-.086,1.574),(.034,-.077,1.567),(0,-.093,1.564)],[(0,1,5),(1,2,5),(2,3,5),(3,4,5)],LIP)
poly_object("Lower lip",[(-.034,-.077,1.567),(0,-.093,1.564),(.034,-.077,1.567),(.018,-.089,1.558),(-.018,-.089,1.558)],[(0,1,4),(1,3,4),(1,2,3)],LIP_LIGHT)

for side in (-1,1):
    ellipsoid("Faceted ear",(side*.110,.006,1.610),(.017,.016,.033),SKIN,segments=10,rings=5)
    ellipsoid("Inner ear plane",(side*.118,-.009,1.609),(.007,.003,.019),EAR,segments=8,rings=4)
    # Almond apertures with heavy upper lids, warm irises and restrained whites.
    x=side*.045
    eye_y=-.0775
    outline=[(-.026,-.001),(-.014,.010),(.012,.009),(.026,-.001),(.013,-.008),(-.014,-.008)]
    poly_object("Upper eyelid outline",[(x+dx,eye_y,1.637+dz) for dx,dz in outline],[tuple(range(6))],EYE)
    poly_object("Almond eye white",[(x+dx*.85,eye_y-.0008,1.637+dz*.44-.001) for dx,dz in outline],[tuple(range(6))],WHITE)
    ellipsoid("Dark brown iris",(x,-.0796,1.636),(.008,.0018,.0055),EYE,segments=10,rings=5)
    ellipsoid("Pupil",(x,-.0811,1.636),(.0042,.001,.004),HAIR,segments=8,rings=4)
    # Slightly arched brows; no scowl and no heavy beard from the style reference.
    poly_object("Strong eyebrow",[(x-.028,-.076,1.660),(x-.014,-.079,1.668),(x+.014,-.077,1.667),(x+.029,-.070,1.661),(x+.020,-.073,1.657),(x-.016,-.079,1.660)],[(0,1,5),(1,2,4,5),(2,3,4)],HAIR)

# Low-poly hair cap plus broad swept S-locks. No coil strands or sculpted curls.
verts,faces=[],[]
segments=24
hair_rings=8
for j in range(hair_rings+1):
    t=.02+.98*j/hair_rings
    # Reach the skull silhouette near the crown, then follow it down to the nape.
    # A hemisphere stretched to the nape cuts through the rear of the head.
    radius=math.sin(min(1,t/.35)*math.pi/2)
    for i in range(segments):
        a=i/segments*math.tau
        front=max(0,-math.sin(a));back=max(0,math.sin(a))
        edge_z=1.640+.065*front-.060*back
        z=1.797+(edge_z-1.797)*t+.004*math.sin(a*5)*t
        rx=.115+.012*math.sin(math.pi*t)
        ry=.095+.008*math.sin(math.pi*t)
        verts.append((rx*radius*math.cos(a),.008+ry*radius*math.sin(a),z))
for j in range(hair_rings):
    for i in range(segments):
        a=j*segments+i;b=j*segments+(i+1)%segments
        faces.extend([(a,b,a+segments),(b,b+segments,a+segments)])
faces.extend([tuple(range(segments)),tuple(reversed([hair_rings*segments+i for i in range(segments)]))])
poly_object("Faceted wavy hair foundation",verts,faces,HAIR)

def hair_lock(name, controls, width, thickness, mat):
    points=[Vector(p) for p in controls]
    path=[]
    for j in range(len(points)-1):
        a,b,c,d=points[max(0,j-1)],points[j],points[j+1],points[min(len(points)-1,j+2)]
        for step in range(3):
            t=step/3
            path.append(.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t))
    path.append(points[-1])
    vertices,faces=[],[]
    for j,p in enumerate(path):
        t=j/(len(path)-1)
        tangent=(path[min(j+1,len(path)-1)]-path[max(j-1,0)]).normalized()
        across=Vector((1,0,0));across=(across-tangent*across.dot(tangent)).normalized()
        normal=tangent.cross(across).normalized()
        taper=.20+.80*math.sin(math.pi*(.1+.9*t))**.45
        for u,v in [(-1,-.3),(-.75,.45),(0,1),(.75,.45),(1,-.3),(0,-.6)]:
            vertices.append(p+taper*(across*width*u+normal*thickness*v))
        if j:
            for k in range(6):
                a=(j-1)*6+k;b=(j-1)*6+(k+1)%6
                faces.append((a,b,b+6,a+6))
    faces.extend([tuple(reversed(range(6))),tuple((len(path)-1)*6+i for i in range(6))])
    return poly_object(name,vertices,faces,mat)

sweeps=[
    [(-.075,.07,1.75),(-.11,.04,1.785),(-.125,-.005,1.79),(-.11,-.05,1.75),(-.12,-.085,1.72),(-.09,-.11,1.70),(-.08,-.10,1.685)],
    [(-.04,.08,1.75),(-.07,.035,1.81),(-.09,-.01,1.825),(-.065,-.05,1.80),(-.025,-.08,1.755),(-.045,-.11,1.72),(-.07,-.12,1.70)],
    [(0,.07,1.77),(.03,.045,1.805),(.015,0,1.83),(-.02,-.04,1.805),(-.02,-.075,1.77),(.005,-.11,1.72),(-.015,-.12,1.695)],
    [(.035,.07,1.75),(.065,.03,1.81),(.06,-.015,1.805),(.085,-.055,1.775),(.065,-.085,1.75),(.045,-.11,1.725),(.06,-.12,1.705)],
    [(.09,.055,1.75),(.125,.025,1.79),(.13,-.015,1.77),(.125,-.045,1.74),(.105,-.07,1.72),(.095,-.09,1.69),(.10,-.095,1.68)],
]
for i,controls in enumerate(sweeps):
    hair_lock("Sculpted broad S-wave",controls,.034 if i in (1,2,3) else .028,.014,HAIR_LIGHT if i in (1,3) else HAIR)
for side in (-1,1):
    for j in range(2):
        hair_lock("Temple swept wave",[(side*.087,.075,1.730),(side*.111,.032,1.754-j*.018),(side*.113,-.014,1.731-j*.016),(side*.102,-.048,1.699-j*.016),(side*.095,-.055,1.670-j*.009)],.018,.010,HAIR)


def sculpt_union(parts, name, mat, bone_name, voxel, weights=None, ratio=.018):
    bpy.ops.object.select_all(action="DESELECT")
    for item in parts:
        item.select_set(True)
        objects.remove(item)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    obj = bpy.context.object
    remesh = obj.modifiers.new("Joined sculpt volumes", "REMESH")
    remesh.mode = "VOXEL"
    remesh.voxel_size = voxel
    remesh.use_smooth_shade = True
    bpy.ops.object.modifier_apply(modifier=remesh.name)
    smooth = obj.modifiers.new("Sculpt relaxation", "SMOOTH")
    smooth.factor = .65
    smooth.iterations = 5
    bpy.ops.object.modifier_apply(modifier=smooth.name)
    decimate = obj.modifiers.new("Game mesh", "DECIMATE")
    decimate.ratio = ratio
    bpy.ops.object.modifier_apply(modifier=decimate.name)
    obj.vertex_groups.clear()
    obj.data.materials.clear()
    return finish(obj, name, mat, bone_name, weights)


# Join the waves into one faceted mass, retaining a soft asymmetric silhouette
# without separate noodle-like locks or hard gaps into the scalp.
hair_parts=[obj for obj in objects if obj.name.startswith(("Faceted wavy hair foundation","Sculpted broad S-wave","Temple swept wave"))]
sculpt_union(hair_parts,"Unified faceted waves",HAIR,"head",.002,ratio=.012)


ring_mesh("Trouser waist", [(.858, 0, .008, .159, .10), (.94, 0, .005, .153, .096)], PANTS, "hips", folds=.025)
for side, suffix in [(-1,"L"),(1,"R")]:
    x = side*.09
    def leg_weights(co, suffix=suffix):
        t = max(0, min(1, (co.z-.44)/.14))
        return {f"thigh.{suffix}": t, f"shin.{suffix}": 1-t}
    ring_mesh(f"Loose trouser leg {suffix}", [
        (.12,x,-.004,.069,.067), (.15,x,.0,.079,.077),
        (.22,x,.008,.082,.079), (.36,x,.008,.077,.077),
        (.49,x,0,.082,.086), (.58,x,0,.087,.089),
        (.72,x,.002,.086,.094), (.83,x,.006,.080,.096), (.89,x,.006,.072,.088),
    ], PANTS, f"thigh.{suffix}", weights=leg_weights, folds=.035)
    ring_mesh(f"Trouser cuff {suffix}", [(.135,x,0,.073,.07),(.155,x,0,.079,.077)], FOLD, f"shin.{suffix}")
    ellipsoid(f"Sneaker sole {suffix}", (x,-.039,.035), (.076,.142,.031), SOLE, f"foot.{suffix}")
    ellipsoid(f"Sneaker upper {suffix}", (x,-.026,.079), (.071,.124,.057), SHOE, f"foot.{suffix}")
    ellipsoid(f"Sneaker toe {suffix}", (x,-.104,.064), (.068,.056,.029), SOLE, f"foot.{suffix}")
    for i in range(4):
        tube(f"Lace {suffix}", [(x-.032,-.091+i*.016,.112+i*.002), (x+.032,-.086+i*.016,.114+i*.002)], .003, SOLE, f"foot.{suffix}")
    # Arms have enough space from the torso for clear motion silhouettes.
    sx = side*.226
    sleeve = ring_mesh(f"Short sleeve {suffix}", [
        (1.177,sx+side*.017,0,.055,.069), (1.195,sx+side*.017,0,.058,.071),
        (1.29,sx+side*.012,0,.064,.074), (1.375,side*.196,0,.060,.066), (1.401,side*.18,0,.051,.059),
    ], TEE, f"upper_arm.{suffix}", folds=.015)
    bpy.context.view_layer.objects.active = sleeve
    bpy.ops.object.select_all(action="DESELECT")
    sleeve.select_set(True)
    def arm_weights(co, suffix=suffix):
        t = max(0, min(1, (co.z-1.065)/.09))
        return {f"upper_arm.{suffix}": t, f"forearm.{suffix}": 1-t}
    limb_start = len(objects)
    ring_mesh(f"Arm {suffix}", [
        (.868,side*.265,-.006,.030,.031), (.94,side*.266,0,.038,.039),
        (1.035,side*.263,.005,.044,.046), (1.095,side*.258,.004,.042,.044),
        (1.19,side*.252,0,.05,.052), (1.26,side*.244,0,.052,.054),
    ], SKIN, f"upper_arm.{suffix}", segments=16, weights=arm_weights)
    ellipsoid(f"Relaxed hand {suffix}", (side*.265,-.006,.835), (.029,.023,.051), SKIN, f"hand.{suffix}")
    for finger in range(4):
        ellipsoid(f"Finger {suffix}", (side*.265+(-.022+finger*.014),-.010,.776+abs(finger-1.5)*.008),
                  (.009,.014,.033-abs(finger-1.5)*.004), SKIN, f"hand.{suffix}",segments=10,rings=7)
    ellipsoid(f"Thumb {suffix}", (side*.237,-.024,.833), (.015,.018,.034), SKIN, f"hand.{suffix}", rotation=(.2,side*-.35,0), segments=12)

    def limb_weights(co, suffix=suffix):
        if co.z < .87:
            t = max(0,min(1,(co.z-.84)/.03))
            return {f"hand.{suffix}":1-t,f"forearm.{suffix}":t}
        return arm_weights(co)
    sculpt_union(objects[limb_start:].copy(), f"Continuous arm and hand {suffix}", SKIN,
                 f"forearm.{suffix}", .0025, limb_weights)


def cotton_weights(co):
    sleeve = max(0, min(1, (abs(co.x)-.16)/.105)) if co.z > 1.16 else 0
    suffix = "L" if co.x < 0 else "R"
    weights = {key: value*(1-sleeve) for key,value in torso_weights(co).items()}
    weights[f"upper_arm.{suffix}"] = sleeve
    return weights


# Jewellery is subtle and merged with the rest of the mesh, not extra draw calls.
tube("Silver chain", [(.058*math.cos(i*math.pi/24), -.063-.05*math.sin(i*math.pi/24),
                       1.437-.094*math.sin(i*math.pi/24)) for i in range(25)], .0018, SILVER, "chest")
tube("Bracelet", [(.265+.034*math.cos(i*math.pi/12), .034*math.sin(i*math.pi/12), .882)
                   for i in range(24)], .0024, SILVER, "forearm.R", True)

# An original 16-bone rig. Feet are anchored at z=0; root motion stays in Rapier.
bpy.ops.object.select_all(action="DESELECT")
armature_data = bpy.data.armatures.new("Matteo skeleton")
rig = bpy.data.objects.new("MatteoRig", armature_data)
bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")


def bone(name, head, tail, parent=None):
    item = armature_data.edit_bones.new(name)
    item.head, item.tail = head, tail
    if parent:
        item.parent = armature_data.edit_bones[parent]
    return item


bone("root", (0,0,0), (0,0,.15))
bone("hips", (0,0,.93), (0,0,1.10), "root")
bone("chest", (0,0,1.10), (0,0,1.43), "hips")
bone("head", (0,0,1.43), (0,0,1.73), "chest")
for side, suffix in [(-1,"L"),(1,"R")]:
    bone(f"thigh.{suffix}", (side*.09,0,.93), (side*.09,0,.50), "hips")
    bone(f"shin.{suffix}", (side*.09,0,.50), (side*.09,0,.12), f"thigh.{suffix}")
    bone(f"foot.{suffix}", (side*.09,0,.12), (side*.09,-.12,.04), f"shin.{suffix}")
    bone(f"upper_arm.{suffix}", (side*.235,0,1.375), (side*.26,0,1.09), "chest")
    bone(f"forearm.{suffix}", (side*.26,0,1.09), (side*.265,0,.875), f"upper_arm.{suffix}")
    bone(f"hand.{suffix}", (side*.265,0,.875), (side*.265,0,.75), f"forearm.{suffix}")
bpy.ops.object.mode_set(mode="OBJECT")

# Join into one skinned mesh; material groups become glTF primitives.
bpy.ops.object.select_all(action="DESELECT")
for obj in objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = objects[0]
bpy.ops.object.join()
body = bpy.context.object
body.name = "Matteo illustrated body"
modifier = body.modifiers.new("Matteo skin", "ARMATURE")
modifier.object = rig
body.parent = rig


def rotate(name, angle, axis=(1,0,0)):
    pose = rig.pose.bones[name]
    basis = pose.bone.matrix_local.to_quaternion()
    pose.rotation_quaternion = basis.inverted() @ Quaternion(Vector(axis), angle) @ basis


def reset_pose():
    for pose in rig.pose.bones:
        pose.rotation_mode = "QUATERNION"
        pose.rotation_quaternion = (1,0,0,0)
        pose.location = (0,0,0)
        pose.scale = (1,1,1)


def key_pose(frame):
    for pose in rig.pose.bones:
        pose.keyframe_insert("rotation_quaternion", frame=frame)
        pose.keyframe_insert("location", frame=frame)


rig.animation_data_create()
scene = bpy.context.scene
scene.render.fps = 30
for clip, duration in [("idle",90),("walk",30),("run",22),("jump",30),("seated-pose",30),("practice",90)]:
    action = bpy.data.actions.new(clip)
    rig.animation_data.action = action
    for frame in range(duration+1):
        reset_pose()
        phase = frame/duration * 2*math.pi
        if clip == "idle":
            rotate("chest", .012*math.sin(phase))
            rotate("head", .014*math.sin(phase), (0,0,1))
            rotate("upper_arm.L", .035, (0,1,0))
            rotate("upper_arm.R", -.035, (0,1,0))
            rotate("forearm.L", -.10)
            rotate("forearm.R", -.06)
        elif clip in ("walk","run"):
            running = clip == "run"
            amplitude = .68 if running else .36
            rotate("chest", .10 if running else .025)
            # Root bone's local Y is Blender world Z (vertical).
            rig.pose.bones["root"].location.y = (.027 if running else .012) * (1-math.cos(phase*2))
            rotate("hips", .045*math.sin(phase), (0,0,1))
            for index, suffix in enumerate(("L","R")):
                p = phase+index*math.pi
                rotate(f"thigh.{suffix}", amplitude*math.sin(p))
                rotate(f"shin.{suffix}", (.98 if running else .48)*max(0, -math.sin(p)))
                rotate(f"foot.{suffix}", -.15*max(0, -math.sin(p)))
                rotate(f"upper_arm.{suffix}", -amplitude*.67*math.sin(p))
                rotate(f"forearm.{suffix}", -.85 if running else -.18)
        elif clip == "jump":
            rotate("chest", .065)
            for suffix in ("L","R"):
                rotate(f"thigh.{suffix}", -.20)
                rotate(f"shin.{suffix}", .38)
                rotate(f"upper_arm.{suffix}", -.22)
                rotate(f"forearm.{suffix}", -.40)
        elif clip == "seated-pose":
            # Hip .64m places the trouser surface on the rescaled .53-.56m seats.
            # Sloped thighs keep the feet near the ground on these high seats.
            rig.pose.bones["root"].location.y = -.29
            for suffix in ("L","R"):
                rotate(f"thigh.{suffix}", -1.25)
                rotate(f"shin.{suffix}", 1.25)
                rotate(f"upper_arm.{suffix}", -.18)
                rotate(f"forearm.{suffix}", -1.13)
        elif clip == "practice":
            # Free movement study, not an official Songahm form. Guard, front
            # knee lift and controlled extension; the supporting foot stays put.
            t = frame / duration
            lift = math.sin(math.pi * max(0, min(1, (t-.32)/.44))) ** 2
            extension = math.sin(math.pi * max(0, min(1, (t-.48)/.22))) ** 2
            rotate("chest", -.035 * lift)
            rotate("upper_arm.L", -.65)
            rotate("forearm.L", -1.4)
            rotate("upper_arm.R", -.48)
            rotate("forearm.R", -1.5)
            rotate("thigh.R", -1.12 * lift)
            rotate("shin.R", .9 * lift * (1-extension))
            rotate("foot.R", -.18 * lift)
        key_pose(frame+1)
    curves = [curve for layer in action.layers for strip in layer.strips
              for bag in strip.channelbags for curve in bag.fcurves]
    for curve in curves:
        for point in curve.keyframe_points:
            point.interpolation = "LINEAR"
    track = rig.animation_data.nla_tracks.new()
    track.name = clip
    strip = track.strips.new(clip, 1, action)
    strip.name = clip
    track.mute = True
rig.animation_data.action = None
reset_pose()
scene.frame_set(1)

asset_dir = ROOT / "public/assets/characters"
asset_dir.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action="DESELECT")
rig.select_set(True)
body.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.export_scene.gltf(filepath=str(asset_dir/"matteo-v5.glb"), export_format="GLB",
                          use_selection=True, export_animations=True, export_animation_mode="ACTIONS",
                          export_force_sampling=True, export_frame_range=False,
                          export_def_bones=True, export_materials="EXPORT", export_yup=True)

# Save an editable character-only source; studio fixtures live only in reviews.
source_dir = ROOT / "assets/characters"
source_dir.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(source_dir/"matteo-v5.blend"))

scene.render.engine = "BLENDER_EEVEE"
scene.view_settings.view_transform = "AgX"
scene.world.color = (.25,.25,.25)
scene.render.resolution_x = 800
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
floor_mat = material("Studio floor", "BEB5A3")
bpy.ops.mesh.primitive_plane_add(size=200)
floor = bpy.context.object
floor.data.materials.append(floor_mat)


def aim(obj, point):
    obj.rotation_euler = (Vector(point)-obj.location).to_track_quat("-Z","Y").to_euler()


for pos, energy, size in [((-3,-4,5),450,4),((3,-1,3),220,3),((1,3,4),500,3)]:
    bpy.ops.object.light_add(type="AREA", location=pos)
    light = bpy.context.object
    light.data.energy, light.data.shape, light.data.size = energy, "DISK", size
    aim(light, (0,0,.9))
bpy.ops.object.camera_add(location=(2.7,-4.5,2.3))
camera = bpy.context.object
camera.data.type = "ORTHO"
camera.data.ortho_scale = 2.13
scene.camera = camera
for view, pos, target in [
    ("front", (2.0,-5,2.05), (0,0,.91)),
    ("portrait", (.36,-2,1.75), (0,-.01,1.64)),
    ("back", (-2.5,5,2.15), (0,0,.9)),
    ("profile", (5,-.25,1.9), (0,0,.9)),
]:
    camera.data.ortho_scale = .58 if view == "portrait" else 2.16
    camera.location = pos
    aim(camera, target)
    scene.render.filepath = str(REVIEW/f"{view}.png")
    bpy.ops.render.render(write_still=True)
camera.data.ortho_scale = 2.16
for clip in ("walk","run","jump","seated-pose","practice"):
    rig.animation_data.action = bpy.data.actions[clip]
    scene.frame_set(52 if clip == "practice" else 7)
    camera.location = (2.7,-4.5,2.1)
    aim(camera, (0,0,.86))
    scene.render.filepath = str(REVIEW/f"{clip}.png")
    bpy.ops.render.render(write_still=True)
print("AVATAR_COMPLETE", len(body.data.vertices), "vertices", len(body.data.polygons), "faces")
