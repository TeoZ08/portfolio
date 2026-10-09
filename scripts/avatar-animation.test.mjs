import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { AVATAR_POSES, getAvatarPose, getAvatarCadence, getAvatarSeatOffset, getAvatarDojoLift } from "../src/world/player/avatar-animation.ts";

const stationary = { velocity: { x: 0, y: 0, z: 0 }, airborne: false, sprinting: false };
const exploring = { physicsLocked: false };

test("seating overrides airborne and locomotion during computer and bench interactions", () => {
  assert.equal(getAvatarPose({ ...stationary, airborne: true, sprinting: true }, { physicsLocked: true }), "seated-pose");
});
test("jump and dash-hop keep the airborne pose even at sprint speed", () => {
  assert.equal(getAvatarPose({ ...stationary, airborne: true, sprinting: true, velocity: { x: 7, y: 2, z: 0 } }, exploring), "jump");
});
test("holding sprint without moving stays idle; actual movement selects walk or run", () => {
  assert.equal(getAvatarPose({ ...stationary, sprinting: true }, exploring), "idle");
  const moving = { ...stationary, velocity: { x: 0, y: 0, z: -3 } };
  assert.equal(getAvatarPose(moving, exploring), "walk");
  assert.equal(getAvatarPose({ ...moving, sprinting: true }, exploring), "run");
  assert.equal(getAvatarCadence("walk", 100), 2.6);
  assert.equal(getAvatarCadence("run", 100), 2.1);
});

test("shipped GLB has its original rig, required clips and no lateral root motion", () => {
  const bytes = readFileSync(new URL("../public/assets/characters/matteo-chibi-v3.glb", import.meta.url));
  const length = bytes.readUInt32LE(12);
  const gltf = JSON.parse(bytes.subarray(20, 20 + length));
  const binary = bytes.subarray(28 + length);
  assert.deepEqual(gltf.animations.map(clip => clip.name).sort(), [...AVATAR_POSES].sort());
  assert.equal(gltf.skins.length, 1);
  assert.equal(gltf.skins[0].joints.length, 24);
  assert.equal(gltf.meshes.length, 19);
  assert.ok(bytes.length < 1_800_000, "Avatar exceeds the uncompressed size budget");
  assert.equal(gltf.images, undefined, "Do not embed user photographs or external textures");
  const root = gltf.nodes.findIndex(node => node.name === "root");
  for (const clip of gltf.animations) {
    for (const channel of clip.channels) {
      if (channel.target.node !== root || channel.target.path !== "translation") continue;
      const accessor = gltf.accessors[clip.samplers[channel.sampler].output];
      const view = gltf.bufferViews[accessor.bufferView];
      const start = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
      for (let i = 0; i < accessor.count; i++) {
        const offset = start + i * (view.byteStride ?? 12);
        assert.ok(Math.abs(binary.readFloatLE(offset)) < .0001, `${clip.name}: root X motion`);
        assert.ok(Math.abs(binary.readFloatLE(offset + 4)) < .0001, `${clip.name}: root Y motion`);
        assert.ok(Math.abs(binary.readFloatLE(offset + 8)) < .0001, `${clip.name}: root Z motion`);
      }
    }
  }
});

test("animated mesh stays finite and feet do not sink into the floor, including the lowered seat", async () => {
  const { AnimationMixer, Box3 } = await import("three");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const bytes = readFileSync(new URL("../public/assets/characters/matteo-chibi-v3.glb", import.meta.url));
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
  const mixer = new AnimationMixer(gltf.scene);
  for (const clip of gltf.animations) {
    mixer.stopAllAction();
    mixer.clipAction(clip).reset().play();
    for (let i = 0; i < 12; i++) {
      mixer.setTime(clip.duration * i / 12);
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse(object => {
        if (object.isSkinnedMesh) { object.skeleton.update(); object.computeBoundingBox(); }
      });
      const box = new Box3().setFromObject(gltf.scene);
      assert.ok(Number.isFinite(box.min.y + box.max.y), `${clip.name}: non-finite vertices`);
      assert.ok(box.min.y > -.035, `${clip.name}: feet below floor`);
      assert.ok(box.max.y < 2.2, `${clip.name}: distorted mesh`);
    }
  }
  mixer.stopAllAction();
  mixer.uncacheRoot(gltf.scene);
});

test("chibi cadence cancels support-foot travel at calibrated walk/run speeds", async () => {
  const { AnimationMixer, Vector3 } = await import("three");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const bytes = readFileSync(new URL("../public/assets/characters/matteo-chibi-v3.glb", import.meta.url));
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
  const mixer = new AnimationMixer(gltf.scene);
  for (const [name, speed, start, end] of [["walk", .8, .08, .48], ["run", 1.9, .06, .30]]) {
    mixer.stopAllAction();
    const clip = gltf.animations.find(c => c.name === name);
    mixer.clipAction(clip).reset().play();
    mixer.setTime(clip.duration * start);gltf.scene.updateMatrixWorld(true);
    const foot = gltf.scene.getObjectByName("footL");
    assert.ok(foot, "expected left ankle bone after GLTFLoader name sanitization");
    const a = foot.getWorldPosition(new Vector3());
    mixer.setTime(clip.duration * end);gltf.scene.updateMatrixWorld(true);
    const zTravel = foot.getWorldPosition(new Vector3()).z - a.z;
    const seconds = clip.duration * (end-start) / getAvatarCadence(name, speed);
    assert.ok(Math.abs(zTravel * 1.12 + speed * seconds) < .008, `${name}: support foot slides`);
  }
  mixer.stopAllAction();mixer.uncacheRoot(gltf.scene);
});

test("visual seat and dojo calibration preserves the existing collision heights", () => {
  assert.equal(getAvatarDojoLift(0, 1.1), .113 * .72);
  assert.equal(getAvatarDojoLift(5.5, 3.8), .075 * .72);
  assert.equal(getAvatarDojoLift(6, 4.5), .05 * .72);
  assert.equal(getAvatarDojoLift(0, 5.8), 0);
  assert.equal(getAvatarDojoLift(20, 0), 0);
  const contact=.13838209716022853 * 1.12;
  assert.ok(Math.abs(.86 + getAvatarSeatOffset("HOUSE_ENTRY_BENCH") + contact - .805 * .72) < .002);
  assert.ok(Math.abs(.86 + getAvatarSeatOffset("HOUSE_COMPUTER") + contact - .785 * .72) < .002);
  assert.ok(Math.abs(.86 + getAvatarSeatOffset("HILL_BENCH") + contact + .025 * .72 - .790 * .72) < .002);
});

test("run arms swing below the chest with moderate elbow flexion", async () => {
  const { AnimationMixer, Vector3 } = await import("three");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const bytes = readFileSync(new URL("../public/assets/characters/matteo-chibi-v3.glb", import.meta.url));
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
  const mixer = new AnimationMixer(gltf.scene);
  const clip = gltf.animations.find(c => c.name === "run");
  mixer.clipAction(clip).play();
  for (const side of ["L", "R"]) {
    const shoulder = gltf.scene.getObjectByName(`upper_arm${side}`);
    const elbow = gltf.scene.getObjectByName(`forearm${side}`);
    const hand = gltf.scene.getObjectByName(`hand${side}`);
    assert.ok(shoulder && elbow && hand, "Expected named arm joints");
    const travel=[];
    for(let i=0;i<48;i++) {
      mixer.setTime(clip.duration*i/48);gltf.scene.updateMatrixWorld(true);
      const s=shoulder.getWorldPosition(new Vector3()),e=elbow.getWorldPosition(new Vector3()),h=hand.getWorldPosition(new Vector3());
      const flex=e.clone().sub(s).angleTo(h.clone().sub(e));
      assert.ok(flex < Math.PI/4, `run: ${side} elbow over 45 degrees`);
      assert.ok(h.y < s.y-.20, `run: ${side} hand raised toward chest`);
      travel.push(h.z-s.z);
    }
    assert.ok(Math.max(...travel)-Math.min(...travel)>.20, `run: ${side} arm is static`);
  }
  mixer.stopAllAction();mixer.uncacheRoot(gltf.scene);
});
