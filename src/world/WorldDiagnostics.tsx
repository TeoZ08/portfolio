"use client";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

// Read-only counters for local browser/asset QA, including the House region.
export function WorldDiagnostics() {
  const { gl, camera, scene } = useThree();
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const context = gl.getContext();
    const debug = context.getExtension("WEBGL_debug_renderer_info");
    const diagnostics = { read: () => ({
      renderer: debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : context.getParameter(context.RENDERER),
      calls: gl.info.render.calls, triangles: gl.info.render.triangles,
      textures: gl.info.memory.textures, geometries: gl.info.memory.geometries,
      camera: camera.position.toArray(),
      fog: scene.fog ? {color: scene.fog.color.getHexString(), near: "near" in scene.fog ? scene.fog.near : null, far: "far" in scene.fog ? scene.fog.far : null} : null,
      hazePrograms: gl.info.programs?.filter(p => context.getShaderSource(p.fragmentShader)?.includes("hazeDensity")).length,
    }) };
    Object.assign(window, { __environmentQA: diagnostics });
    return () => { delete (window as unknown as { __environmentQA?: unknown }).__environmentQA; };
  }, [gl, camera, scene]);
  return null;
}
