# LW-D L2.2 — Holographic HUD & Immersive Android QA

Status: **Draft**, not owner-accepted as fully tested Android UX.
User video: \`Screen_Recording_20261114_053433.mp4\` (65.5 s, 2340×1080, Galaxy A55). Review notes:
- Enclosed lab room, four stations and zoom are visible; real game actions update resources.
- Right panel is visually opaque and covers too much workspace; user requests a futuristic semi-transparent frosted glass hologram.
- Android time, battery, cellular signal and recorder indicator plus persistent "Classic view" bar break immersion.
- Camera can orbit behind a wall; separately tracked visual/camera correction, not fixed by L2.2.
- User explicitly requests that HUD **can hide completely**, and the entire game remains a future 3D conversion, with laboratory-first delivery.

## Implemented L2.2
- Lightweight frosted-glass control panel with translucent glass colour, cyan/teal lines and highlights, saturation/blur fallback and accessible high-contrast station buttons.
- Reversible 44×44 px HUD show/hide toggle, keyboard focus handling, aria-expanded/aria-hidden, inert controls when hidden, no duplicate game storage. Owner decides when it is open; toggling does not reset the selected station.
- A low-emphasis **Exit 3D view** action inside the panel; the permanently visible "Classic view" button is suppressed after the live iframe confirms ready. Parent retains a minimal emergency exit until child is ready. Android QA back attempts to restore the classic view.
- Android QA \`.lwd1\` only: uses \`WindowInsetsController\` system bar hide/show while entering/leaving 3D, transient reveal on swipe, fallback legacy flags, restore on return and refocus. No immersive change in release/LW-C packages. Browsers without native bridge can still run 3D and use the HUD controls.
- Maintains exact existing engine actions and original backup/storage/identity; no Play Console/keystore or server change.
- No external resource load or GPU animation on an inactive app.

## Physical QA / acceptance gates
1. On Android 17, open the 3D mode: no permanent clock/battery/signal/navigation overlay; swiping from edge may transiently reveal system bars by Android design.
2. The frosted HUD should show the lab clearly behind it; all real actions still work.
3. Hide HUD while zoomed into synthesis: camera and 3D machine stay unobstructed, toggle stays reachable. Reopen and check original station persists.
4. Exit via **Exit 3D view** and Android Back gesture where supported: restore Android status/navigation bars and classic UI with same world resources.
5. Accessibility: min 44×44 toggle, text readability on bright 3D area, navigation and screen-reader labels, reduced-motion settings.
6. On busy devices measure GPU battery/blur impact; test offline and background/foreground transitions.
7. No release sign-off before verified device video and backup/restore checks.

L2.2 is **presentation and lifecycle only**, not final machine graphics, process physics or laboratory completion.
