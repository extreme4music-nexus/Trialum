/** Trialum G01 AQUATIC READ-ONLY VISUAL PROJECTION.
 * Candidate module, NOT wired into existing Android scene until owner visual pass.
 * Never imports game engine or mutates player, game time, resources or plants.
 * Sole canonical input: s.agro.gardenPlants, not GLB meshes or invented species.
 */
const ZONE="aquarium";
const STAGE_FILES=Object.freeze({
 sprout:"aquaglow-sprout.glb",
 young:"aquaglow-young.glb",
 growing:"aquaglow-growing.glb",
 mature:"aquaglow-mature.glb",
 weakened:"aquaglow-weakened.glb",
 dead:"aquaglow-dead.glb",
});
const SLOT_COORDS=Object.freeze([
 Object.freeze({id:"aquatic-slot-1",x:-2.7,y:-1.04,z:-2}),
 Object.freeze({id:"aquatic-slot-2",x:2.7,y:-1.04,z:-2}),
 Object.freeze({id:"aquatic-slot-3",x:-2.7,y:-1.04,z:2}),
 Object.freeze({id:"aquatic-slot-4",x:2.7,y:-1.04,z:2}),
]);
const safe=(n,alt=0)=>Number.isFinite(Number(n))?Math.max(0,Math.min(100,Number(n))):alt;
export function aquaglowRenderStage(plant){
 if(!plant||typeof plant!=="object"||
    plant.species!=="aquaglow"||plant.medium!=="aquatic"||
    plant.bedId!==ZONE)return null;
 const health=safe(plant.health,0);
 if(plant.dead===true||health<=0)return "dead";
 if(health<40)return "weakened";
 const growth=safe(plant.growth,3);
 if(growth>=85)return "mature";
 if(growth>=50)return "growing";
 if(growth>=20)return "young";
 return "sprout";
}
export function projectG01Aquatic(scenePlantRecords){
 const list=Array.isArray(scenePlantRecords)?scenePlantRecords:[];
 const present=new Map();
 for(const plant of list){
  if(!plant||typeof plant.id!=="string"||!plant.id||
     plant.id.length>100||present.has(plant.id))continue;
  const stage=aquaglowRenderStage(plant);
  if(stage)present.set(plant.id,{
    id:plant.id,stage,file:STAGE_FILES[stage],
    growth:safe(plant.growth,3),health:safe(plant.health,0),
    hydration:safe(plant.hydration,0),dead:plant.dead===true||safe(plant.health,0)===0,
    readyForTransplant:plant.dead!==true&&safe(plant.growth,3)>=85&&safe(plant.health,0)>=50
  });
 }
 const sorted=[...present.values()].sort((a,b)=>a.id.localeCompare(b.id,"en"));
 return Object.freeze(sorted.slice(0,SLOT_COORDS.length).map((plant,i)=>
  Object.freeze({...plant,slotId:SLOT_COORDS[i].id,
   xyz:Object.freeze([SLOT_COORDS[i].x,SLOT_COORDS[i].y,SLOT_COORDS[i].z])})));
}
export const G01AquaglowVisualContract=Object.freeze({
 source:"s.agro.gardenPlants",engineBedId:ZONE,canonicalSpecies:"aquaglow",
 slotCount:4,files:STAGE_FILES,slots:SLOT_COORDS,
 noGameplayWrites:true,installedInLiveScene:false,
 note:"Stage selection only. Actual GLB cloning/render/mixer wiring remains gated by owner visual PASS."
});
