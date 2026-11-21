"""Verify byte identity of the exact frozen visual design and every packaged model."""
import hashlib
import json
import pathlib
import sys
import zipfile
ROOT = pathlib.Path(__file__).resolve().parents[1]
DIR = "prototypes/lw-d/scenes/agro-greenhouse/frozen-master"
def blob(raw):
    return hashlib.sha1(b"blob " + str(len(raw)).encode("ascii") + b"\0" + raw).hexdigest()
manifest = json.loads((ROOT / DIR / "catalog.json").read_bytes())
with zipfile.ZipFile(sys.argv[1]) as apk:
    def read(name):
        return apk.read("assets/web/" + name)
    scene = read(DIR + "/scene.json")
    assert blob(scene) == manifest["sceneBlob"] == "5d68670f7c073d1842b3f89c49b0394c20ffec91"
    assert len(json.loads(scene)["instances"]) == 703
    assert read(DIR + "/catalog.json") == (ROOT / DIR / "catalog.json").read_bytes()
    assert len(manifest["assets"]) == 85
    for asset in manifest["assets"]:
        raw = read(asset["runtimePath"])
        assert raw[:4] == b"glTF" and len(raw) == asset["bytes"] and blob(raw) == asset["blobSha"], asset["id"]
    print("PASS: exact MASTER scene + 85 referenced GLBs in APK; no gameplay authority.")
