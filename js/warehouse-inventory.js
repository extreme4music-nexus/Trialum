/* Trialum real warehouse locations, piggybacking exclusively on original
 * s.foodFactory.stock. NOT an additional food currency or recipe engine.
 * Reconciliation makes every location sum exactly to the existing stock.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.TrialumWarehouseInventory=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const ZONES=Object.freeze(["rack","cold","packing","hand"]);
 const cap=n=>Number.isSafeInteger(n)&&n>=0&&n<=100000000?n:0;
 const safeId=id=>typeof id==="string"&&id.length<=32&&/^[a-z0-9][a-z0-9_-]*$/i.test(id);
 const empty=()=>({rack:0,cold:0,packing:0,hand:0});
 const truth=(s,id)=>cap(Number(s?.foodFactory?.stock?.[id]));
 function reconcileOne(s,id,mutate=false){
  const total=truth(s,id);
  const raw=s?.foodFactory?.warehouseBins?.[id];
  if(!raw||typeof raw!=="object")return {...empty(),rack:total};
  const bins=Object.fromEntries(ZONES.map(k=>[k,cap(raw[k])]));
  // If original production/feeding changed stock, never carry stale double stock.
  let sum=ZONES.reduce((n,k)=>n+bins[k],0);
  if(sum>total){
   let excess=sum-total;
   for(const zone of ["rack","packing","cold","hand"]){
    const take=Math.min(excess,bins[zone]);bins[zone]-=take;excess-=take;
   }
  }else if(sum<total)bins.rack+=total-sum;
  if(mutate)s.foodFactory.warehouseBins[id]={...bins};
  return bins;
 }
 function project(s,recipes){
  return (Array.isArray(recipes)?recipes:[]).filter(r=>safeId(r.id)).map(r=>{
   const bins=reconcileOne(s,r.id);
   return {id:r.id,name:String(r.name||r.id).slice(0,68),
    stock:truth(s,r.id),...bins};
  });
 }
 function action(s,recipes,{op,recipe,from,to}={}){
  if(!s?.foodFactory||!s.foodFactory.stock||!Array.isArray(recipes)||
    !safeId(recipe)||!recipes.some(r=>r.id===recipe))
   return {ok:false,message:"Непозната храна или невалиден свет."};
  if(!["take","put"].includes(op))return {ok:false,message:"Недозволена операција."};
  if(op==="take"&&(!["rack","cold","packing"].includes(from)||to!=="hand"))
   return {ok:false,message:"Избери полица, ладилник или пакување."};
  if(op==="put"&&(from!=="hand"||!["rack","cold","packing"].includes(to)))
   return {ok:false,message:"Избери место каде ќе ја оставиш порцијата."};
  // Pure projection before validation to avoid changing state on failure.
  const bins=reconcileOne(s,recipe,false);
  if(bins[from]<1)return {ok:false,message:"Нема порција на избраното место."};
  // The canonical stock remains untouched: only its physical locations change.
  bins[from]-=1;bins[to]+=1;
  if(!s.foodFactory.warehouseBins||typeof s.foodFactory.warehouseBins!=="object")
   s.foodFactory.warehouseBins=Object.create(null);
  s.foodFactory.warehouseBins[recipe]=bins;
  return {ok:true,message:op==="take"?"Земена е една вистинска порција.":"Порцијата е оставена во избраната просторија."};
 }
 function snapshotFromProjection(food){
  const rs=Array.isArray(food?.recipes)?food.recipes:[];
  return rs.map(r=>({id:r.id,name:r.name,stock:cap(r.stock),
   rack:cap(r.rack),cold:cap(r.cold),packing:cap(r.packing),hand:cap(r.hand)}));
 }
 return Object.freeze({ZONES,project,action,reconcileOne,snapshotFromProjection});
});
