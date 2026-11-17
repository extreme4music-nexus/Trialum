const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const spec=JSON.parse(fs.readFileSync(path.join(__dirname,"../docs/blueprints/S7_F01_F_RADIAL_WEDGE_PREVIEW_SPEC_20261117.json"),"utf8"));

test("owner rejected solitary huge outer wedge; corrected arc design is owner-review pending",()=>{
 assert.equal(spec.schemaVersion,2);
 assert.equal(spec.assetId,"S7-FLOOR-F01-F");
 assert.equal(spec.originalRejected.locationRadiiM[0],9.15);
 assert.equal(spec.originalRejected.locationRadiiM[1],10.15);
 assert.equal(spec.ownerVisualReferenceApproved,true);
 assert.equal(spec.ownerCorrectedPreviewApprovalPending,true);
 assert.equal(spec.ownerModelApproval,false);
 assert.equal(spec.gameplayWrites,0);
});
test("individual tile uses inside dry walkway by the G01 railing, ~1m arc and 1m depth",()=>{
 const d=spec.design,s=spec.sourceG01;
 assert.deepEqual(s.existingWalkwayRadiiM,[7.2,9.15]);
 assert.equal(s.mainRailRadiusM,7.1);
 assert.equal(d.radialInnerM,7.2);
 assert.equal(d.radialOuterM,8.2);
 assert.ok(d.radialOuterM<s.existingWalkwayRadiiM[1]);
 assert.ok(Math.abs(d.radialWidthM-1)<1e-9);
 assert.equal(d.numberOfSectorsAroundFullRing,48);
 assert.equal(d.angularStepDegrees,7.5);
 assert.ok(Math.abs(d.angularStepRadians*7.7-1.00793)<0.0001);
 assert.equal(d.thicknessM,.06);
 assert.equal(d.bevelM,.004);
 assert.equal(d.radialGroutGapM,.006);
 assert.equal(d.individualMovableGLB,true);
});
test("seven separate preview tiles form adjacent sectors beside real G01, clear of satellite basins",()=>{
 const d=spec.design;
 assert.deepEqual(d.sampleSectorIndices,[3,4,5,6,7,8,9]);
 assert.equal(d.previewTiles.length,7);
 for(let i=0;i<7;i++){
  const it=d.previewTiles[i],idx=i+3,theta=idx*Math.PI*2/48;
  assert.equal(it.sectorIndex,idx);
  assert.equal(it.id,"f01-f-pool-"+String(idx).padStart(2,"0"));
  assert.ok(Math.abs(it.pivot[0]-7.2*Math.cos(theta))<1e-7);
  assert.ok(Math.abs(it.pivot[2]-7.2*Math.sin(theta))<1e-7);
  assert.ok(Math.abs(it.pivot[1]-.192)<1e-10);
  assert.ok(Math.abs(it.rotationY+theta)<1e-9);
  for(let n=0;n<=8;n++){
   const a=theta+n*(Math.PI*2/48)/8;
   for(let r=7.2;r<=8.2;r+=.25){
    const x=r*Math.cos(a),z=r*Math.sin(a);
    for(const basin of spec.sourceG01.satelliteBasins){
     const clearance=Math.hypot(x-basin.x,z-basin.z)-basin.r;
     assert.ok(clearance>0.9,"pool collision near sector "+idx+": "+clearance);
    }
   }
  }
 }
 assert.ok(d.previewOverlayOnExistingWalkway);
 assert.ok(d.physicalInstallationRequiresWalkwayReplacementOrResurfaceSurvey);
});
