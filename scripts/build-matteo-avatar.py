"""Build the original Matteo avatar, editable rig and in-place clips.

Run from the repository: blender51 -b --python scripts/build-matteo-avatar.py
No photographs are embedded in the asset. Coordinates: Z up, front -Y.
"""
import bpy
import math
import random
from pathlib import Path
from mathutils import Vector, Quaternion

ROOT = Path(__file__).resolve().parent.parent
REVIEW = ROOT / "work/avatar-review-v4"
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


SKIN = material("Light warm skin", "DFBBA1", .76)
EAR = material("Ear and lips", "BE8D79", .88)
TEE = material("Off-white cotton", "E8E3D6", .94)
SEAM = material("Cotton seams", "D4CDBE", .94)
PANTS = material("Charcoal twill", "303438", .95)
FOLD = material("Twill seam", "3B4043", .95)
SHOE = material("Warm grey suede", "B8B5AC", .92)
SOLE = material("Off-white rubber", "DDD9CB", .98)
HAIR = material("Dark wavy hair", "211F1D", .78)
HAIR_LIGHT = material("Wave ridges", "302824", .9)
EYE = material("Eyes and brows", "302820", .72)
WHITE = material("Eye ivory", "CFC7B4", .85)
SILVER = material("Quiet silver", "A8ABA8", .48, .55)
objects = []


def finish(obj, name, mat, bone, weights=None):
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    for face in obj.data.polygons:
        face.use_smooth = True
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
# A restrained subdivision softens the shoulder and cloth outline.
bpy.context.view_layer.objects.active = shirt
bpy.ops.object.select_all(action="DESELECT")
shirt.select_set(True)
subdivision = shirt.modifiers.new("Soft cotton silhouette", "SUBSURF")
subdivision.levels = 1
bpy.ops.object.modifier_apply(modifier=subdivision.name)
ring_mesh("T-shirt hem", [(.891, 0, .012, .168, .109), (.907, 0, .012, .168, .11)], SEAM, "hips")
ring_mesh("Neck", [(1.42, 0, 0, .054, .048), (1.485, 0, -.002, .055, .052), (1.52, 0, 0, .062, .053)], SKIN, "head")
tube("Collar binding", [(.067*math.cos(a), .057*math.sin(a), 1.445-.015*max(0,-math.sin(a)))
                         for a in [i*2*math.pi/32 for i in range(32)]], .006, SEAM, "chest", True)

# Anatomical head derived from the CC0 MakeHuman hm08 base. Only the head
# subset is retained in the repository. It is fitted to this original rig.
source_vertices = []
source_faces = {"body": [], "helper-l-eye": [], "helper-r-eye": []}
group = "body"
for line in (ROOT / "assets/characters/source/makehuman-head.obj").read_text().splitlines():
    if line.startswith("v "):
        source_vertices.append(tuple(map(float, line.split()[1:])))
    elif line.startswith("g "):
        group = line[2:]
    elif line.startswith("f "):
        source_faces[group].append([int(value)-1 for value in line.split()[1:]])
for group, faces in source_faces.items():
    used = sorted({i for face in faces for i in face})
    lookup = {old: new for new, old in enumerate(used)}
    coordinates = [(source_vertices[i][0]*.118, -(source_vertices[i][2]-.45)*.118,
                    1.47+(source_vertices[i][1]-6.15)*.118) for i in used]
    mesh = bpy.data.meshes.new("Anatomical head" if group == "body" else group)
    mesh.from_pydata(coordinates, [], [[lookup[i] for i in face] for face in faces])
    mesh.update()
    obj = bpy.data.objects.new(mesh.name, mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    finish(obj, mesh.name, SKIN if group == "body" else WHITE, "head")
    if group == "body":
        obj.data.materials.append(EAR)
        for polygon, face_indices in zip(obj.data.polygons, faces):
            points = [source_vertices[i] for i in face_indices]
            center = tuple(sum(p[axis] for p in points)/len(points) for axis in range(3))
            if 6.66 < center[1] < 6.79 and abs(center[0]) < .22 and center[2] > 1.4:
                polygon.material_index = 1
    subdivision = obj.modifiers.new("Smooth anatomical planes", "SUBSURF")
    subdivision.levels = 1
    bpy.ops.object.modifier_apply(modifier=subdivision.name)
    if group == "body":
        decimate = obj.modifiers.new("Efficient facial surface", "DECIMATE")
        decimate.ratio = .28
        bpy.ops.object.modifier_apply(modifier=decimate.name)
        for vertex in obj.data.vertices:
            if vertex.co.z < 1.53:
                t = max(0, min(1, (vertex.co.z-1.47)/.06))
                vertex.co.y *= .65 + .35*t
for side in (-1, 1):
    ellipsoid("Iris", (side*.0363, -.1115, 1.6038), (.0057, .0014, .0057), EYE)
    tube("Eyebrow", [(side*.023, -.126, 1.629), (side*.041, -.123, 1.634),
                     (side*.062, -.114, 1.628)], .0031, HAIR, "head")

# Broad S-curves make an asymmetric swept wave, rather than a cloud of curls.
def wave_lock(name, controls, width, depth):
    points = [Vector(p) for p in controls]
    path = []
    for j in range(len(points)-1):
        a,b,c,d = points[max(0,j-1)],points[j],points[j+1],points[min(len(points)-1,j+2)]
        for step in range(8):
            t = step/8
            path.append(.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t))
    path.append(points[-1])
    vertices, faces = [], []
    for j,p in enumerate(path):
        t = j/(len(path)-1)
        tangent = (path[min(j+1,len(path)-1)]-path[max(j-1,0)]).normalized()
        across = Vector((1,0,0))
        across = (across-tangent*across.dot(tangent)).normalized()
        normal = tangent.cross(across).normalized()
        taper = .13 + .87*math.sin(math.pi*t)**.5
        for k in range(10):
            angle = k*2*math.pi/10
            vertices.append(p + taper*(across*width*math.cos(angle)+normal*depth*math.sin(angle)))
        if j:
            for k in range(10):
                n = (j-1)*10+k
                faces.append((n,(j-1)*10+(k+1)%10,j*10+(k+1)%10,j*10+k))
    faces += [tuple(reversed(range(10))),tuple((len(path)-1)*10+k for k in range(10))]
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active=obj
    obj.select_set(True)
    return finish(obj,name,HAIR,"head")

hair_parts = [ellipsoid("Hair foundation", (0,-.005,1.703), (.108,.104,.048), HAIR, segments=32,rings=20),
              ellipsoid("Tapered back hair", (0,.057,1.656), (.102,.052,.069), HAIR, segments=24,rings=16),
              ellipsoid("Temple foundation", (0,.012,1.659), (.102,.079,.038), HAIR, segments=24,rings=16)]
for i in range(8):
    x = -.087+i*.025
    crown = 1.760+.014*math.sin(i*.68)
    hair_parts.append(wave_lock("Swept crown wave", [
        (x,.082,1.680),(x+.023,.045,crown-.018),(x-.006,-.006,crown),
        (x+.010,-.060,crown-.022),(x-.018,-.092,1.688+.014*math.sin(i*.8)),
        (x-.009,-.104,1.661+.016*math.cos(i*.8)),
    ], .024,.013))
for side in (-1,1):
    for i in range(3):
        hair_parts.append(wave_lock("Temple wave", [
            (side*.077,.067,1.704-i*.014),(side*.108,.022,1.711-i*.018),
            (side*.104,-.035,1.687-i*.020),(side*.093,-.058,1.651-i*.016),
        ],.014,.011))


def sculpt_union(parts, name, mat, bone_name, voxel, weights=None):
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
    decimate.ratio = .08
    bpy.ops.object.modifier_apply(modifier=decimate.name)
    obj.vertex_groups.clear()
    obj.data.materials.clear()
    return finish(obj, name, mat, bone_name, weights)


sculpt_union(hair_parts, "Swept wavy silhouette", HAIR, "head", .0025)
for i in range(13):
    x = -.09 + i*.014
    y = -.012 + .04*math.sin(i*.89)
    crown = 1.762 + .012*math.sin(i*.71)
    wave_lock("Loose surface wave", [(x-.014,.065,crown-.052), (x+.018,y+.025,crown),
              (x-.01,y-.032,crown+.008), (x-.026,-.103,1.69+.027*math.sin(i*.6))], .005,.005)


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
    subdivision = sleeve.modifiers.new("Relaxed sleeve fabric", "SUBSURF")
    subdivision.levels = 1
    bpy.ops.object.modifier_apply(modifier=subdivision.name)
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


cotton = [obj for obj in objects if obj.data.materials[0] in (TEE,SEAM)]
shirt = sculpt_union(cotton, "Continuous cotton shirt", TEE, "chest", .003, cotton_weights)
# Restrained diagonal cloth tension in the waist, applied to the exported mesh.
for vertex in shirt.data.vertices:
    p=vertex.co+shirt.location
    if abs(p.y) > .065 and .92 < p.z < 1.38:
        hem = math.exp(-((p.z-(.945+.15*abs(p.x))) / .027)**2)
        fold = .003*math.sin(p.x*78+p.z*18)+.0045*hem*math.sin(p.x*60)
        vertex.co.y += math.copysign(fold,p.y)

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
bpy.ops.export_scene.gltf(filepath=str(asset_dir/"matteo-v4.glb"), export_format="GLB",
                          use_selection=True, export_animations=True, export_animation_mode="ACTIONS",
                          export_force_sampling=True, export_frame_range=False,
                          export_def_bones=True, export_materials="EXPORT", export_yup=True)

# Save an editable character-only source; studio fixtures live only in reviews.
source_dir = ROOT / "assets/characters"
source_dir.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(source_dir/"matteo-v4.blend"))

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
    ("front", (2.5,-5,2.15), (0,0,.9)),
    ("back", (-2.5,5,2.15), (0,0,.9)),
    ("profile", (5,-.25,1.9), (0,0,.9)),
]:
    camera.location = pos
    aim(camera, target)
    scene.render.filepath = str(REVIEW/f"{view}.png")
    bpy.ops.render.render(write_still=True)
for clip in ("walk","run","jump","seated-pose","practice"):
    rig.animation_data.action = bpy.data.actions[clip]
    scene.frame_set(52 if clip == "practice" else 7)
    camera.location = (2.7,-4.5,2.1)
    aim(camera, (0,0,.86))
    scene.render.filepath = str(REVIEW/f"{clip}.png")
    bpy.ops.render.render(write_still=True)
print("AVATAR_COMPLETE", len(body.data.vertices), "vertices", len(body.data.polygons), "faces")
