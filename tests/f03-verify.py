#!/usr/bin/env python3
"""F03: assert all 54 real GLBs, embedded source-derived PBR and owner safety gates."""
from pathlib import Path
import hashlib, json, struct, collections
R=Path(__file__).resolve().parents[1]
P=R/"build/s7-floor-f03"
m=json.loads((P/"qa-manifest.json").read_text())
assert len(m["models"])==54
assert collections.Counter(x["finish"] for x in m["models"])=={"s":27,"t":27}
assert len({a["file"] for a in m["models"]})==54
assert m["ownerRenderPass"] and not m["ownerGlbPass"] and m["gameplayWrites"]==0
for finish in ("s","t"):
 color=(P/f"f03-{finish}-reference-derived-atlas.png").read_bytes()
 normal=(P/f"f03-{finish}-subtle-normal.png").read_bytes()
 assert hashlib.sha256(color).hexdigest()==m["embeddedAtlasSha256"][finish]
 assert hashlib.sha256(normal).hexdigest()==m["embeddedNormalSha256"][finish]
for row in m["models"]:
 raw=(P/row["file"]).read_bytes()
 assert raw[:4]==b"glTF" and struct.unpack_from("<II",raw,4)==(2,len(raw))
 jl,tag=struct.unpack_from("<I4s",raw,12);assert tag==b"JSON"
 o=json.loads(raw[20:20+jl])
 bl,tag=struct.unpack_from("<I4s",raw,20+jl);assert tag==b"BIN\x00"
 buf=raw[28+jl:28+jl+bl]
 assert len(buf)==bl and o["asset"]["version"]=="2.0"
 assert len(o["meshes"])==1 and len(o["images"])==2
 assert row["sha256"]==hashlib.sha256(raw).hexdigest() and len(raw)==row["size"]
 e=o["nodes"][0]["extras"];assert e["family"]=="F03"
 assert e["finish"]==("SMOOTH_HONED" if row["finish"]=="s" else "SUBTLE_MICRO_TEXTURE")
 assert e["ownerRenderPass"] and not e["ownerGlbVisualPass"]
 assert not e["inGame"] and e["gameplayWrites"]==0 and not e["slipResistanceCertified"]
 pbr=o["materials"][0]["pbrMetallicRoughness"]
 assert pbr["metallicFactor"]==0
 assert abs(pbr["roughnessFactor"]-(.61 if row["finish"]=="s" else .79))<1e-8
 for idx,postfix in enumerate(("reference-derived-atlas.png","subtle-normal.png")):
  im=o["images"][idx];v=o["bufferViews"][im["bufferView"]]
  emb=buf[v["byteOffset"]:v["byteOffset"]+v["byteLength"]]
  assert emb==(P/f"f03-{row['finish']}-{postfix}").read_bytes()
 assert row["triangles"]>0 and o["accessors"][3]["count"]==3*row["triangles"]
assert len([x for x in m["models"] if x["module"]=="F"])==2
assert len([x for x in m["models"] if x["module"]=="G"])==6
assert len([x for x in m["models"] if x["module"]=="L"])==8
assert len([x for x in m["models"] if x["module"]=="R"])==8
print("PASS: 54/54 genuine F03 S/T GLBs, embedded approved source-derived textures, sane solids, gameplay untouched")
