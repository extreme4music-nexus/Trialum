#!/usr/bin/env python3
"""Produce one fully offline, unsigned, standalone WebGL2 UX demonstration HTML."""
from pathlib import Path

base = Path(__file__).resolve().parent
html = (base / "world.html").read_text(encoding="utf-8")
style = (base / "world.css").read_text(encoding="utf-8")
simulation = (base / "sim.js").read_text(encoding="utf-8")
room = (base / "lab-room.js").read_text(encoding="utf-8")
process = (base / "lab-process.js").read_text(encoding="utf-8")
world = (base / "world.js").read_text(encoding="utf-8")
replacements = {
    '<link rel="stylesheet" href="world.css">': "<style>\n" + style + "\n</style>",
    '<script src="sim.js"></script>': "<script>\n" + simulation + "\n</script>",
    '<script src="lab-room.js"></script>': "<script>\n" + room + "\n</script>",
    '<script src="lab-process.js"></script>': "<script>\n" + process + "\n</script>",
    '<script src="world.js"></script>': "<script>\n" + world + "\n</script>"
}
for source, target in replacements.items():
    if html.count(source) != 1:
        raise SystemExit("Expected exactly one marker: " + source)
    html = html.replace(source, target)
# Live bridge runs only inside the game; standalone review HTML must not load it.
html = html.replace('<script src="live-context.js"></script>', '')

if 'src="lab-process.js"' in html or 'src="lab-room.js"' in html or 'src="world.js"' in html or 'href="world.css"' in html or 'src="sim.js"' in html:
    raise SystemExit("Preview still has external runtime dependencies")
out = base / "build" / "lw-d-landscape-preview.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print("Standalone preview generated:", out)
print("File size:", out.stat().st_size)
