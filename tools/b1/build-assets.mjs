/* B1 build stage: locally package modern offline Three.js and generated GLB.
 * npm dependencies are BUILD-ONLY; the phone never downloads third-party code.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import {build} from "esbuild";
import {createGlb} from "./generate-glb.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const HERE=path.join(ROOT,"tools/b1");
const DIR=path.join(ROOT,"prototypes/lw-d/b1");
const manifest=JSON.parse(fs.readFileSync(path.join(DIR,"pilot-scene.json"),"utf8"));
const destination=path.join(DIR,"pilot-room.glb");
const {buffer,scene}=createGlb(manifest);
fs.writeFileSync(destination,buffer);
const output=path.join(DIR,"renderer.bundle.js");
await build({
 entryPoints:[path.join(DIR,"pilot-runtime.mjs")],
 bundle:true,format:"esm",platform:"browser",target:["chrome105","es2021"],
 // Build-time dependencies live under tools/b1, not under the standalone scene.
 nodePaths:[path.join(HERE,"node_modules")],
 treeShaking:true,minify:true,legalComments:"external",
 outfile:output,
 logLevel:"info"
});
const vendor=path.join(DIR,"vendor");
fs.mkdirSync(vendor,{recursive:true});
const license=fs.readFileSync(path.join(HERE,"node_modules/three/LICENSE"),"utf8");
fs.writeFileSync(path.join(vendor,"THREE-MIT-LICENSE.txt"),license);
const sha=file=>crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const evidence={
 pilotOnly:true,
 sceneId:manifest.sceneId,modelFile:"pilot-room.glb",modelBytes:buffer.length,
 glbSha256:sha(destination),rendererFile:"renderer.bundle.js",
 rendererBytes:fs.statSync(output).size,rendererSha256:sha(output),
 rendererLibraries:{"three":"0.187.0","esbuild":"0.28.2"},
 licenseIncluded:true,semanticAnchors:manifest.expectedAnchors,
 nodeCount:scene.nodes.length,offlineRuntime:true,
 sourceOnlyAtBuildTime:true
};
fs.writeFileSync(path.join(DIR,"B1-GENERATED-ASSET-EVIDENCE.json"),JSON.stringify(evidence,null,2)+"\n");
console.log("B1 real external offline GLB, Three.js bundle and license READY",JSON.stringify(evidence));
