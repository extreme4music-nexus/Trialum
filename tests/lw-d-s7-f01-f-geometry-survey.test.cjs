const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const spec=JSON.parse(fs.readFileSync(path.join(__dirname,"../docs/blueprints/S7_F01_F_RADIAL_WEDGE_PREVIEW_SPEC_20261117.json"),"utf8"));
test("F01-F remains render-only until individual owner model approval",()=>{
 assert.equal(spec.schemaVersion,1);
 assert.equal(spec.module,"F01-F");
 assert.equal(spec.kind,"VISUAL_PROPOSAL_NOT_GLB");
 assert.equal(spec.ownerVisualApproval,false);
 assert.equal(spec.gameplayWrites,0);
 assert.equal(spec.candidate.material,"F01.cream-white.PBR-dry");
 assert.equal(spec.candidate.thicknessM,.06);
 assert.equal(spec.candidate.bevelM,.004);
});
test("proposed wedge is 1m outside measured G01 walkway, not across basin",()=>{
 const s=spec.candidate,source=spec.referenceProvenance;
 assert.equal(source.mainBasinRadiusM,6.7);
 assert.equal(source.walkwayInnerRadiusM,7.2);
 assert.equal(source.walkwayOuterRadiusM,9.15);
 assert.equal(s.radialInnerM,source.walkwayOuterRadiusM);
 assert.equal(s.radialOuterM-s.radialInnerM,1);
 assert.ok(Math.abs(s.angularSpanRadians*((s.radialInnerM+s.radialOuterM)/2)-1)<1e-8);
 assert.ok(s.sectorStartDegrees>40&&s.sectorEndDegrees<50);
});
test("measured wedge candidate clears all three actual satellite basin rims",()=>{
 const s=spec.candidate;
 for(const basin of spec.referenceProvenance.satelliteBasins){
  let closest=Infinity;
  for(let i=0;i<=128;i++){
   const theta=(s.sectorStartDegrees+(s.sectorEndDegrees-s.sectorStartDegrees)*i/128)*Math.PI/180;
   for(let j=0;j<=12;j++){
    const rad=s.radialInnerM+(s.radialOuterM-s.radialInnerM)*j/12;
    closest=Math.min(closest,Math.hypot(rad*Math.cos(theta)-basin.x,rad*Math.sin(theta)-basin.z)-basin.radius);
   }
  }
  assert.ok(closest>0.5,"unsafe dry sector near "+basin.id+": "+closest);
 }
});
