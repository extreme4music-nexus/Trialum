/**
 * Trialum B1-R1: validate actual *deserialized* GLTFLoader Object3D anchors.
 *
 * A glTF node's .name is a presentation/debug string and Three.js is allowed
 * to sanitize it. The immutable scene contract lives in glTF node extras:
 * userData.semanticAnchor, which GLTFLoader preserves on the resulting node.
 *
 * This module intentionally has no DOM, WebGL, engine or network dependency,
 * so the SAME logic can run in the offline APK and with real GLTFLoader in CI.
 */
export function resolveGLTFAnchors(root, manifest, toleranceMeters=0.015) {
  if (!root || typeof root.traverse!=="function" || typeof root.updateMatrixWorld!=="function") {
    throw new Error("GLTF scene graph unavailable");
  }
  const expected=manifest?.expectedAnchors;
  if (!Array.isArray(expected) || expected.length!==2 ||
      expected.some(id=>typeof id!=="string" || !id.length) ||
      new Set(expected).size!==expected.length) {
    throw new Error("Scene contract requires two distinct semantic anchor IDs");
  }
  if (manifest?.unitsPerMeter!==1 || manifest?.upAxis!=="Y") {
    throw new Error("Non-metric or non-Y-up scene contract");
  }
  if (!Number.isFinite(toleranceMeters) || toleranceMeters<0) {
    throw new Error("Invalid metric anchor tolerance");
  }
  const anchors=new Map();
  let meshCount=0;
  root.updateMatrixWorld(true);
  root.traverse(node=>{
    if (node.isMesh) meshCount++;
    const id=node.userData?.semanticAnchor;
    if (id===undefined) return;
    if (typeof id!=="string" || !expected.includes(id)) {
      throw new Error("Unexpected GLB semantic anchor: "+String(id));
    }
    if (anchors.has(id)) {
      throw new Error("Duplicate GLB semantic anchor: "+id);
    }
    if (node.userData?.hasNoGameAuthority!==true) {
      throw new Error("GLB semantic anchor must not have game authority: "+id);
    }
    const expectedPosition=manifest.anchors?.[id]?.at;
    if (!Array.isArray(expectedPosition)||expectedPosition.length!==3||
        !expectedPosition.every(Number.isFinite)) {
      throw new Error("Bad manifest position for GLB anchor: "+id);
    }
    // World matrix and transform are derived from the real loaded scene,
    // never guessed from an index or a sanitized glTF Object3D.name.
    const position=node.position.clone();
    node.getWorldPosition(position);
    const loaded=[position.x,position.y,position.z];
    if (loaded.some(n=>!Number.isFinite(n))) {
      throw new Error("Non-finite loaded GLB anchor position: "+id);
    }
    if (Math.hypot(...loaded.map((n,i)=>n-expectedPosition[i]))>toleranceMeters) {
      throw new Error("GLB semantic anchor position differs from manifest: "+id);
    }
    anchors.set(id,{node,worldPosition:position});
  });
  if (meshCount<1) throw new Error("GLB has no visible geometry meshes");
  for (const id of expected) {
    if (!anchors.has(id)) throw new Error("Missing GLB semantic anchor: "+id);
  }
  return {anchors,meshCount};
}

/** Returns model wall meshes by stable glTF metadata, not mutable Object3D.name. */
export function collectGLTFWallBlockers(root) {
  const walls=[];
  root.traverse(node=>{
    if (node.isMesh &&
        (node.userData?.semanticPart?.startsWith("pilot.wall") ||
         node.name?.startsWith("pilot.wall"))) walls.push(node);
  });
  return walls;
}
