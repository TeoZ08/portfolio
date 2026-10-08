import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { AVATAR_POSES, getAvatarPose, getAvatarCadence } from "../src/world/player/avatar-animation.ts";

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
  assert.equal(getAvatarCadence("walk", 100), 1.55);
  assert.equal(getAvatarCadence("run", 100), 1.65);
});

test("shipped GLB has its original rig, required clips and no lateral root motion", () => {
  const bytes = readFileSync(new URL("../public/assets/characters/matteo-v4.glb", import.meta.url));
  const length = bytes.readUInt32LE(12);
  const gltf = JSON.parse(bytes.subarray(20, 20 + length));
  const binary = bytes.subarray(28 + length);
  assert.deepEqual(gltf.animations.map(clip => clip.name).sort(), [...AVATAR_POSES].sort());
  assert.equal(gltf.skins.length, 1);
  assert.equal(gltf.skins[0].joints.length, 16);
  assert.equal(gltf.meshes.length, 1);
  assert.ok(bytes.length < 2_100_000, "Avatar exceeds the uncompressed size budget");
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
        assert.ok(Math.abs(binary.readFloatLE(offset + 8)) < .0001, `${clip.name}: root Z motion`);
      }
    }
  }
});

test("animated mesh stays finite and feet do not sink into the floor, including the lowered seat", async () => {
  const { AnimationMixer, Box3 } = await import("three");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const bytes = readFileSync(new URL("../public/assets/characters/matteo-v4.glb", import.meta.url));
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
