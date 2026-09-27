// Selected, reproducible imports from the user's local packs. No package install.
// Run: node scripts/import-world-assets.mjs /path/to/Downloads
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
// Already provided by Next.js; only used offline, never in the browser bundle.
import sharp from "sharp";

const source = resolve(process.argv[2] || "/home/matteo/Downloads");
const destination = resolve("public/assets");
const escapeMember = name => name.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
const read = (archive, member) => execFileSync("unzip", ["-p", resolve(source, archive), escapeMember(member)], { maxBuffer: 32 * 1024 * 1024 });
function output(path, data) {
  const file = resolve(destination, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
  console.log(`${path}: ${Math.round(data.length / 1024)} KiB`);
}
const copy = (archive, member, path) => output(path, read(archive, member));
const pad4 = (buffer, byte = 0) => Buffer.concat([buffer, Buffer.alloc((4 - buffer.length % 4) % 4, byte)]);
function readGlb(buffer) {
  const length = buffer.readUInt32LE(12);
  return { json: JSON.parse(buffer.subarray(20, 20 + length)), binary: buffer.subarray(28 + length) };
}
function makeGlb(json, binary) {
  binary = pad4(binary);
  json.buffers = [{ byteLength: binary.length }];
  const text = pad4(Buffer.from(JSON.stringify(json)), 32);
  const header = Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + text.length + binary.length, 8);
  header.writeUInt32LE(text.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
  const chunk = Buffer.alloc(8);
  chunk.writeUInt32LE(binary.length, 0); chunk.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, text, chunk, binary]);
}

// Rig_Medium clips use matching bone names, but different node indices. Merge
// only the used accessors into the character file, without root displacement.
const kaykit = "KayKit_Adventurers_2.0_FREE.zip";
const animations = "KayKit_Character_Animations_1.1.zip";
const character = readGlb(read(kaykit, "KayKit_Adventurers_2.0_FREE/Characters/gltf/Ranger.glb"));
const model = character.json;
model.animations = [];
let characterBinary = pad4(character.binary);
for (const [pack, clipName, outputName] of [
  ["General", "Idle_A", "idle"],
  ["MovementBasic", "Walking_A", "walk"],
  ["Simulation", "Sit_Chair_Idle", "seated-pose"],
]) {
  const input = readGlb(read(animations, `KayKit_Character_Animations_1.1/Animations/gltf/Rig_Medium/Rig_Medium_${pack}.glb`));
  const clip = input.json.animations.find(item => item.name === clipName);
  if (!clip) throw new Error(`Missing animation ${clipName}`);
  const accessors = new Map(), views = new Map();
  function copyAccessor(index) {
    if (accessors.has(index)) return accessors.get(index);
    const accessor = input.json.accessors[index];
    if (!views.has(accessor.bufferView)) {
      const view = input.json.bufferViews[accessor.bufferView];
      const start = view.byteOffset || 0;
      views.set(accessor.bufferView, model.bufferViews.length);
      model.bufferViews.push({ ...view, buffer: 0, byteOffset: characterBinary.length });
      characterBinary = Buffer.concat([characterBinary, pad4(input.binary.subarray(start, start + view.byteLength))]);
    }
    const next = model.accessors.length;
    model.accessors.push({ ...accessor, bufferView: views.get(accessor.bufferView) });
    accessors.set(index, next);
    return next;
  }
  const result = { name: outputName, samplers: [], channels: [] };
  for (const channel of clip.channels) {
    const name = input.json.nodes[channel.target.node].name;
    if (name === "root" || name === "Rig_Medium") continue;
    const node = model.nodes.findIndex(item => item.name === name);
    if (node < 0) throw new Error(`Unmatched bone ${name}`);
    const sampler = clip.samplers[channel.sampler];
    result.channels.push({ sampler: result.samplers.length, target: { ...channel.target, node } });
    result.samplers.push({ ...sampler, input: copyAccessor(sampler.input), output: copyAccessor(sampler.output) });
  }
  model.animations.push(result);
}
// A traveller carries no weapon. Keep bones intact and omit only the quiver mesh.
for (const node of model.nodes) if (node.name === "Ranger_Quiver") { delete node.mesh; delete node.skin; }
for (const material of model.materials) {
  material.pbrMetallicRoughness.roughnessFactor = 1;
  material.pbrMetallicRoughness.baseColorFactor = [.82, .80, .71, 1];
}
const cloak = model.materials.length;
model.materials.push({ name: "Traveller sage cloak", doubleSided: true,
  pbrMetallicRoughness: { baseColorFactor: [.19, .24, .13, 1], metallicFactor: 0, roughnessFactor: 1 } });
for (const mesh of model.meshes) if (mesh.name === "Ranger_Cape") {
  for (const primitive of mesh.primitives) primitive.material = cloak;
}
output("characters/visitor.glb", makeGlb(model, characterBinary));
copy(kaykit, "KayKit_Adventurers_2.0_FREE/License.txt", "characters/KayKit-Adventurers-LICENSE.txt");
copy(animations, "KayKit_Character_Animations_1.1/License.txt", "characters/KayKit-Animations-LICENSE.txt");

// Retain source glTF/materials. Dependencies are imported only for this shortlist.
const naturePack = "Stylized Nature MegaKit[Standard].zip";
const dependencies = new Set();
for (const name of ["Fern_1", "Mushroom_Common", "Rock_Medium_1", "DeadTree_1", "Bush_Common"]) {
  const bytes = read(naturePack, `glTF/${name}.gltf`);
  const json = JSON.parse(bytes);
  output(`nature/${name}.gltf`, bytes);
  for (const entry of [...json.buffers, ...json.images]) if (entry.uri) dependencies.add(entry.uri);
}
for (const name of dependencies) {
  const bytes = read(naturePack, `glTF/${name}`);
  output(`nature/${name}`, name.endsWith(".png")
    ? await sharp(bytes).resize(512, 512, { fit: "inside", withoutEnlargement: true }).png({ compressionLevel: 9 }).toBuffer()
    : bytes);
}
copy(naturePack, "License_Standard.txt", "nature/LICENSE.txt");

// Convert only two static machines to compact indexed GLB. Their embedded palette
// stays intact; a matte tint in the grove removes the preview's luminous look.
for (const [archive, name, outputName] of [
  ["Companion-bot.zip", "Companion-bot", "companion"],
  ["MobileStorageBot.zip", "MobileStorageBot", "storage"],
]) {
  const object = new OBJLoader().parse(read(archive, `Package/${name}.obj`).toString());
  const json = { asset: { version: "2.0", generator: "Selected local OBJ import" }, scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], bufferViews: [], accessors: [],
    materials: [{ name: "Weathered machine", pbrMetallicRoughness: { baseColorTexture: { index: 0 }, baseColorFactor: [.66, .70, .61, 1], metallicFactor: 0, roughnessFactor: 1 } }],
    textures: [{ source: 0 }], images: [] };
  let binary = Buffer.alloc(0);
  function bufferView(bytes, target) {
    const index = json.bufferViews.length;
    json.bufferViews.push({ buffer: 0, byteOffset: binary.length, byteLength: bytes.length, ...(target ? { target } : {}) });
    binary = Buffer.concat([binary, pad4(bytes)]);
    return index;
  }
  object.traverse(mesh => {
    if (!mesh.isMesh) return;
    const geo = mergeVertices(mesh.geometry);
    // OBJ palette UVs use a bottom-left origin; embedded glTF images use top-left.
    const uv = geo.getAttribute("uv");
    if (uv) for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
    const attributes = {};
    for (const [name, semantic] of [["position", "POSITION"], ["normal", "NORMAL"], ["uv", "TEXCOORD_0"]]) {
      const a = geo.getAttribute(name);
      if (!a) continue;
      const accessor = { bufferView: bufferView(Buffer.from(a.array.buffer, a.array.byteOffset, a.array.byteLength), 34962), componentType: 5126, count: a.count, type: a.itemSize === 2 ? "VEC2" : "VEC3" };
      if (name === "position") { geo.computeBoundingBox(); accessor.min = geo.boundingBox.min.toArray(); accessor.max = geo.boundingBox.max.toArray(); }
      attributes[semantic] = json.accessors.length; json.accessors.push(accessor);
    }
    const a = geo.index;
    const indices = json.accessors.length;
    json.accessors.push({ bufferView: bufferView(Buffer.from(a.array.buffer, a.array.byteOffset, a.array.byteLength), 34963), componentType: a.array instanceof Uint32Array ? 5125 : 5123, count: a.count, type: "SCALAR" });
    json.scenes[0].nodes.push(json.nodes.length);
    json.nodes.push({ name: outputName, mesh: json.meshes.length });
    json.meshes.push({ primitives: [{ attributes, indices, material: 0 }] });
    geo.dispose(); mesh.geometry.dispose();
  });
  json.images.push({ bufferView: bufferView(read(archive, `Package/${name}.png`)), mimeType: "image/png" });
  output(`machines/${outputName}.glb`, makeGlb(json, binary));
}

copy("Humble Gift - Paper UI System.zip", "Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/1 Paper/1.png", "ui/paper.png");
copy("Humble Gift - Paper UI System.zip", "Humble Gift - Paper UI System v1.1/License.pdf", "ui/HumblePixel-LICENSE.pdf");
output("ui/compass.svg", execFileSync("bsdtar", ["-xOf", resolve(source, "Game-Icon-Pack-v1.4-SVG.7z"), "no-padding/2-items/compass.svg"]));
