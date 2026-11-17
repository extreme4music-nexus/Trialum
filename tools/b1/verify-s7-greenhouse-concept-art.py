#!/usr/bin/env python3
"""Verify the FIVE original owner-liked S7 concept PNGs before an art/GLB milestone.
Run: python3 tools/b1/verify-s7-greenhouse-concept-art.py
Fail closed if missing, resized, substituted or recompressed; only exact originals qualify.
"""
from pathlib import Path
import hashlib
import struct
import sys
ROOT=Path(__file__).resolve().parents[2]
DIR=ROOT/"docs/visuals/s7-greenhouse"
FILES=[
 ("REF-01","trialum_paw_shaped_greenhouse_overview.png",(1672,941),"aa67b2e710b125581609646478101d91f9a6944cb016774943cf7b5a385eb10a"),
 ("REF-02","trialum_s7_greenhouse_materials_board.png",(1448,1086),"3df5cf2a231fe758aca8276d2e356a1a56be239a1d44eccdae7e7b9a239a7473"),
 ("REF-03","trialum_s7_agro_greenhouse_concept_board.png",(1448,1086),"b4fde654c40901b280bb2ccc31cbbe6990dd8ae890e709bfc7e137a2b6c4cfc4"),
 ("REF-04","trialum_s7_flora_concept_board.png",(1448,1086),"d03c50163fcb092dc5c5a6653f28fa813d3328c37e5ec75d16f84c2a13345471"),
 ("REF-05","trialum_s7_greenhouse_systems_concept_board.png",(1448,1086),"0647d6cdad81337f23bb309f20644111883f96fc73d33bf3323dc59ba9bed173"),
]
errors=[]
for ref,name,dims,want in FILES:
 p=DIR/name
 if not p.is_file():
  errors.append(f"{ref} MISSING: {p.relative_to(ROOT)}")
  continue
 b=p.read_bytes()
 if not b.startswith(b"\x89PNG\r\n\x1a\n") or len(b)<24:
  errors.append(f"{ref} NOT A PNG: {name}")
  continue
 w,h=struct.unpack(">II",b[16:24])
 got=hashlib.sha256(b).hexdigest()
 if (w,h)!=dims:errors.append(f"{ref} IMAGE DIMENSIONS CHANGED: {(w,h)} != {dims}")
 if got!=want:errors.append(f"{ref} SHA256 MISMATCH: {got} != {want}")
 if got==want and (w,h)==dims:print(f"PASS {ref} {name} {w}x{h}")
if errors:
 print("\n".join(errors),file=sys.stderr)
 print("ART BIBLE NOT FULLY ARCHIVED IN THIS GITHUB BRANCH; DO NOT CLAIM FIVE IMAGES COMMITTED.",file=sys.stderr)
 sys.exit(1)
print("PASS ALL 5 ORIGINAL OWNER-LIKED PNG ASSETS — exact byte-level hashes")
