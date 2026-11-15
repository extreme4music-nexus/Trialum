/** Trialum 3D scene registry v1 — pure data validation, NO engine or DOM.
 * All scene topology, labels, transforms, and future destinations are data.
 */
export const REQUIRED_PORTAL_IDS=Object.freeze([
 "ground.agro.lobby.door-warehouse",
 "ground.agro.lobby.door-garden",
 "ground.agro.lobby.door-phytolab"
]);
export function validateSceneRegistry(registry,scene){
 if(registry?.schemaVersion!==1||!Array.isArray(registry?.entries)||!Array.isArray(registry?.assetRegistry))
  throw Error("Invalid scene registry version");
 if(scene?.schemaVersion!==1||scene?.rendererAdapter!=="three-glb-v1"||
    scene?.unitsPerMeter!==1||scene?.upAxis!=="Y"||scene?.floorY!==0)
  throw Error("Invalid metric/Y-up renderer scene");
 if(typeof scene.sceneId!=="string"||!scene.sceneId||!scene.authority?.readOnly||
    scene.authority.gameplayWrites!==false||scene.authority.saveWrites!==false||
    scene.authority.inventoryWrites!==false)throw Error("3D may not mutate canonical game");
 const entry=registry.entries.find(x=>x.sceneId===scene.sceneId);
 const asset=registry.assetRegistry.find(x=>x.assetId===scene.modelAssetId);
 if(!entry||!asset||entry.assetId!==asset.assetId||entry.renderer!==scene.rendererAdapter)
  throw Error("Missing exact scene/asset registry binding");
 if(!/^\.\/scenes\/agro-lobby\/[a-z0-9-]+\.glb$/.test(asset.uri)||
    asset.unitsPerMeter!==1||asset.upAxis!=="Y"||
    asset.offline!==true||!asset.license)throw Error("Untrusted scene asset URI/units/license");
 if(!Array.isArray(scene.portals)||scene.portals.length!==3||
    new Set(scene.portals.map(x=>x.id)).size!==3)throw Error("Expected 3 unique physical doors");
 for(const [i,id] of REQUIRED_PORTAL_IDS.entries()){
  const p=scene.portals[i];
  if(p?.id!==id||!Array.isArray(p.at)||p.at.length!==3||!p.at.every(Number.isFinite))
   throw Error("Missing exact semantic portal "+id);
  if(p.action!=="inspect-only"||p.status!=="planned"||
     !p.futureSceneId||typeof p.label!=="string"||!p.label||!p.mk)
   throw Error("Unbuilt rooms MUST remain planned/inspect-only: "+id);
 }
 if(asset.requiredAnchors.length!==3||
   asset.requiredAnchors.some((id,i)=>scene.portals[i].id!==id))
   throw Error("GLB anchor contract out of sync");
 if(!scene.camera?.position?.every(Number.isFinite)||!scene.camera?.target?.every(Number.isFinite))
  throw Error("Invalid scene camera");
 if(!scene.worldMeters||!["width","depth","height"].every(k=>scene.worldMeters[k]>0))
  throw Error("Missing metric world bounds");
 if(scene.continuity?.previewRouteAvailable!==false||
    !scene.continuity?.firstFloorExistingLabLobby)
  throw Error("Cannot pretend old first-floor route is integrated");
 return Object.freeze({scene,entry,asset});
}
export function selectPlannedPortal(scene,id){
 const p=scene.portals.find(x=>x.id===id);
 if(!p)return null;
 // Presentation-only metadata; never navigate, write stock, or emit a command.
 return Object.freeze({id:p.id,label:p.label,mk:p.mk,status:p.status,
   futureSceneId:p.futureSceneId,canEnter:false});
}
