/* Two REAL attached indoor annexes for the Food Warehouse.
 * The rooms share one renderer, camera, lighting and hologram with main room.
 * No additional WebGL context, no separate stock store, no glass roof.
 */
export function buildWarehouseAnnexes(THREE,manifest,assets){
 if(!Array.isArray(manifest.subrooms)||manifest.subrooms.length!==2)
  throw Error("Cold/Packing room topology missing");
 const root=new THREE.Group();root.name="trialum.agro.warehouse.annexes";
 const mats={
  wall:new THREE.MeshStandardMaterial({color:0xb9d4c8,roughness:.69}),
  floor:new THREE.MeshStandardMaterial({color:0x7baea4,roughness:.42,metalness:.13}),
  frame:new THREE.MeshStandardMaterial({color:0x194f5a,roughness:.33,metalness:.45}),
  rim:new THREE.MeshStandardMaterial({color:0xd7b776,metalness:.62,roughness:.28}),
  mint:new THREE.MeshStandardMaterial({color:0x55cdb8,emissive:0x139e88,emissiveIntensity:.38}),
  cold:new THREE.MeshStandardMaterial({color:0x83d8e1,emissive:0x1782a2,emissiveIntensity:.28}),
  panel:new THREE.MeshStandardMaterial({color:0x265564,roughness:.22,metalness:.27})
 };
 const box=(g,name,mat,at,size)=>{
  const o=new THREE.Mesh(new THREE.BoxGeometry(...size),mats[mat]);o.name=name;
  o.position.set(...at);g.add(o);return o;
 };
 const led=(g,name,x,y,z,w)=>box(g,name,"mint",[x,y,z],[w,.045,.06]);
 const zoneElements={};
 for(const room of manifest.subrooms){
  const g=new THREE.Group();g.name="annex."+room.id;root.add(g);
  const [x,,z]=room.center,w=room.width,d=room.depth,h=room.height;
  // Solid physical roof, independent from the future Garden greenhouse.
  box(g,room.id+".floor","floor",[x,-.085,z],[w,.18,d]);
  box(g,room.id+".roof.solid","wall",[x,h,z],[w,.2,d]);
  box(g,room.id+".rear","wall",[x,h/2,z-d/2],[w,h,.21]);
  for(const side of [-1,1]){
   box(g,room.id+".wall."+side,"wall",[x+side*w/2,h/2,z],[.18,h,d]);
   box(g,room.id+".light."+side,"mint",[x+side*(w/2-.17),h-.22,z],[.065,.05,d-.3]);
  }
  // Entrance is physically attached to the two SMALL warehouse rear portals.
  box(g,room.id+".door.frameTop","rim",[x,3.38,-11.52],[2.52,.17,.3]);
  for(const side of [-1,1])
   box(g,room.id+".door.post."+side,"rim",[x+side*1.2,1.69,-11.52],[.12,3.38,.3]);
  // No fake stock: read-only screen uses original parent food projection.
  box(g,room.id+".terminal","panel",[x,h*.52,z-d/2+.2],[2.3,1,.09]);
  led(g,room.id+".screen.top",x,h*.82,z-d/2+.27,1.83);
  led(g,room.id+".screen.bottom",x,h*.4,z-d/2+.27,1.44);
  if(room.id==="cold"){
   for(const side of [-1,1]){
    const sample=assets.get("cold-locker.glb")?.clone(true);
    if(sample){
     sample.position.set(x+side*1.17,0,z+.32);
     sample.rotation.y=side>0?-Math.PI/2:Math.PI/2;
     sample.scale.set(.82,.9,.83);g.add(sample);
    }
    box(g,"cold.cooling."+side,"cold",[x+side*1.88,2.4,z-1.72],[.12,.82,1.32]);
    box(g,"cold.thermal-monitor."+side,"panel",[x+side*1.86,1.9,z-1.7],[.15,.31,.45]);
   }
   for(let i=0;i<4;i++)
    box(g,"cold.sealed-unit."+i,"cold",[x-1.25+i*.82,.27,z+2.0],[.55,.49,.57]);
  }else{
   for(const side of [-1,1]){
    const rack=assets.get("smart-storage-rack.glb")?.clone(true);
    if(rack){
     rack.position.set(x+side*1.33,0,z+.1);
     rack.rotation.y=side>0?-Math.PI/2:Math.PI/2;
     rack.scale.set(.83,.84,.83);g.add(rack);
    }
   }
   const belt=assets.get("conveyor-sorter.glb")?.clone(true);
   if(belt){belt.position.set(x,0,z+1.72);belt.scale.set(.65,.8,.7);g.add(belt);}
   box(g,"packing.dispatch.slot","rim",[x,.85,z-1.9],[1.58,.16,.73]);
   for(let i=0;i<3;i++)box(g,"packing.package."+i,"panel",
     [x+(i-1)*.52,1.08,z-1.9],[.40,.42,.37]);
  }
  zoneElements[room.id]=g;
 }
 return {root,zoneElements};
}
