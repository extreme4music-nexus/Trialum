/* Offline-only S1 visual builder, never executed on user device. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import {build} from "esbuild";
import "./build-agro-lobby.mjs";
import "./build-food-warehouse.mjs"; // separate seven REAL S4 GLB model assets, no runtime geometry builder
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const HERE=path.join(ROOT,"tools/b1");
const DIR=path.join(ROOT,"prototypes/lw-d/three-core");
const OUT=path.join(DIR,"scene.bundle.js");
await build({entryPoints:[path.join(DIR,"scene-app.mjs")],
 bundle:true,format:"esm",platform:"browser",target:["chrome105","es2021"],
 nodePaths:[path.join(HERE,"node_modules")],treeShaking:true,
 minify:true,legalComments:"external",outfile:OUT,logLevel:"info"});
const hash=file=>crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const evidencePath=path.join(ROOT,"prototypes/lw-d/scenes/agro-lobby/asset-evidence.json");
const evidence=JSON.parse(fs.readFileSync(evidencePath,"utf8"));
evidence.engine={source:"prototypes/lw-d/three-core/scene-runtime.mjs",bundle:"prototypes/lw-d/three-core/scene.bundle.js",
 bundleBytes:fs.statSync(OUT).size,sha256:hash(OUT),three:"0.187.0",esbuild:"0.28.2",
 geometryFromGlb:true,gameStateWrites:false};
fs.writeFileSync(evidencePath,JSON.stringify(evidence,null,2)+"\n");
console.log("Agro S1 bundled re-usable Three GLB scene adapter",JSON.stringify(evidence.engine));
