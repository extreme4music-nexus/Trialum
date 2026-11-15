> **MANDATORY B0–B9 GLB-FIRST OWNER ARCHITECTURE — 2026-11-15.** [canonical B0–B9](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md) · [asset/scene/GLB contract](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md) · [non-bypassable owner/phase gates](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_PHASE_GATES_20261115.md) · [ADR-004 renderer trial](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md). Original L3.9 **plant engine has explicit OWNER FULL PASS on 2026-11-15** after installing signed QA build; [GitHub #171](https://github.com/extreme4music-nexus/Trialum/actions/runs/43670180653) source SHA 7466c38c0f863cf4299fbdf6263f823c60b2608d. This does **NOT** approve future GLB/3D construction. **B0 is NEXT**, B1 Three.js GLB isolated pilot, B2 assets, B3 world/bridge, then B4 Agro Lobby/B5 Warehouse/B6 Garden/B7 live interactions/B8 PhytoLab/B9 polish. No bypass without an explicit, versioned owner-approved exception. Three.js is the pilot candidate, not already a full replacement; preserve NovaGL2, five first-floor labs, core/save/food, and owner-only GitHub SignQA. **Main-branch master documents are binding on this still-Draft development branch.**

# Trialum Жив Свет — L3.8 CONNECTED HUBS & FULL MENU ROUTING
**Owner instruction:** 2026-11-15. **Implementation branch:** `feature/lw-d-l3-8-connected-hubs-menus-20261115`, isolated from current L3.7 Draft PR #71. **Status:** owner-directed product map; code and QA separate. No owner on-device PASS yet.

## Fundamental geography / terminology (supersedes earlier "universal laboratory lobby" assumption)
The formerly "universal" five-door L3.6 hub is formally **LABORATORY LOBBY** and stays exactly as previously owner-accepted, including entrances to Basic, DNA, Food Production, Flora and Research.

**New global MAIN LOBBY** becomes a common interchange. This hub connects distinct facility lobbies through **corridors and doors**. The true 3D geometry for main hub and additional corridors is **not built yet**: this phase connects all menus with an honest holographic 3D navigation shell and clearly marks unfinished architecture as preview. Never pretend that a new 3D city/corridor/home exists; they will be physically built in future phases.

Conceptual graph:
```text
MAIN LOBBY (global entrance, HUD now; complete 3D architecture later)
  ↳ Laboratory Lobby [EXISTING 3D] → Basic | DNA | Food | Flora | Research [EXISTING 3D]
  ↳ Bioworld / World city [FUTURE 3D] → homes, streets, park, open playground [FUTURE]
  ↳ Nursery / Incubator [FUTURE 3D] → early-life residence of pets, rules per species/age/level
  ↳ Flora garden [FUTURE 3D] → planting, care, growth (distinct from existing Flora Lab)
  ↳ Pets catalog → individual natal card + portrait + level, age, lineage, original home
  ↳ Homes catalog → actual existing habitat + assigned pets → direct existing home screen
  ↳ Social Lobby → Local Playground [EXISTING Classic/full-screen] |
     Shared Playground [EXISTING Classic/full-screen] | Messages [EXISTING] | Friends [EXISTING]
  ↳ Marketplace Lobby → Toys [EXISTING original-playground purchases, UI link only] |
     Clothing Boutique [FUTURE] | Furniture & Interior [FUTURE]
  ↳ More HUD → Play Games | achievements | diary | notifications | settings | others
```

## Menu semantics (owner mapping)
| Owner entry | Current safe route | 3D destination / later intent |
|---|---|---|
| Свет | shared-city **HUD placeholder** | connected outside world, homes, shops, parks and multi-player opt-in public city; never show all players' private information by default |
| Знаење | **Research Lab 3D** | lab-lobby corridor/door, existing real research engine |
| Флора | **Flora Lab 3D** | existing flora; linked **separate garden future placeholder**, planting remains in canonical Classic as available |
| Живеалиште | **Incubator 3D placeholder** | early-life nursery next to lab building; duration rules depend on pet species, stage/age/level; no current relocation |
| Миленичиња | **HUD roster + natal card** | individual photo/portrait, generation, lineage, existing species, level/age, pet details and real habitat |
| Дом | **HUD homes registry** | true present habitat assignment with pets; click opens that existing home directly via canonical game tab. Future 3D house/upgrade mechanics are placeholders |
| Производство на храна | **Food Laboratory 3D** | existing food processing, real recipes and inventory |
| Дружење | **HUD submenu** | Local and Shared playground full-screen original existing gameplay; Friends & Messages HUD entry to original functions |
| Повеќе | **HUD submenu/pages** | distinct navigable pages or labeled future placeholders, original Classic functionality must remain reachable |
| Продавници | **HUD marketplace** | existing toys via original earned-credit mechanic; clothes, covers, furniture/interior upgrades future only |

## Internal currency name — owner creative proposal
**Триони** (singular **Трион**, Latin **Trions**, UI symbol **◈**, abbreviation **TRI**) is the internal fictional no-real-money currency label.
- In this phase **only a DISPLAY ALIAS for the existing `s.longplay.credits`**. One Trion displayed = one original earned credit. Do NOT add a second wallet, mint coins, auto-convert, store an exchange rate, create payment processors or change balance/cost/price rules.
- All toys purchased today continue to use **existing canonical `TrialumPlayground.unlock` and credited resources**. No new 3D shop checkout until accepted separately.
- All purchases 100% earnable in play; no microtransactions, real-money store, ads or data brokers.
- Retail branches: Toy Store (current earned credits where functionality exists), Boutique for clothes/covers (future, no inventory, no checkout), Furniture and Interiors shop (future, no inventory, no checkout), possible habitat upgrades after owner design and original-engine validation.

## Technical and safety gates
- Existing L3.7 user phone acceptance for prior new Basic effects and silent-audio hotfix remains **PENDING**. No automatic owner PASS from CI.
- Preserve all current owner-accepted 3D lab geometry and corridor: **do not repaint L3.6 or silently relabel it as global main lobby**.
- No fake houses, invented pet/natal metadata, forged portrait images, arbitrary upgrade eligibility or fake store prices. Pet cards may render deterministic **original existing creature-art Canvas** from real pet appearance, only while visible.
- Use only existing engine read-only safe snapshot fields in iframe; navigation requests are exact origin+iframe source checked by parent and allowlisted. Direct-home routing must verify actual habitat ID before original `selectHabitat`/Classic screen.
- Full-screen local/shared playground uses same Classic implementations, not a duplicate simulation/social server. UI overlay/toolbar only; no new unauthorized messaging or friend database.
- Messages and Friends retain their already-implemented private opt-in procedures and safe muting, blocking, reporting. HUD may offer navigation cards; do not claim a new rich native 3D social client is built until it actually is.
- Catalog and More pages are separate HUD subpages, with clear navigation, back/close, keyboard Escape, mobile landscape/focus and MK/EN parity. Future modules are real clickable placeholder pages explaining status, not fake gameplay.
- Preserve all three Android/Firebase IDs, GitHub automatic QA signer, offscreen GPU/AI stop, offline game, local progress, pet identity, AI memory and social activity. No new server/DB, Release, FriendsDebug, Play, main merge.

## Phased completion
A: catalogue map, truth audit and documentation.
B: build live 3D holographic Main Lobby HUD, routes to existing 5 real rooms, all categories and labeled future doors (corridor geometry future).
C: real Pet natal cards/portraits, home assignment registry and tested direct-existing-home fallback.
D: social HUD and full-screen Classic playground transitions; Marketplace/More nested HUD and original feature fallbacks.
E: Android/PWA source + test suite, owner-only SignQA APK, test on Galaxy A55; **owner PASS required** before any future physical 3D city/hub architecture.

**Physical new global lobby corridors, city, garden, incubator mechanics, 3D houses, interior upgrades and boutique shop mechanics remain separate upcoming development milestones.**


## IMPLEMENTATION CHECKPOINT — SOURCE AND ANDROID CI VERIFIED (2026-11-15)
**Code now implemented in Draft PR #72 (not merged, NOT owner phone-approved).** All current principal HUD routes are connected.
- `prototypes/lw-d/world-hub-pages.js`: new global Main Lobby (HUD-only for now); Lab Lobby stays the existing physically rendered five-door room. 12 main categories, connected real 3D lab entries, separate honest future city/garden/incubator/boutique/furniture pages, original Social and More subpages.
- `prototypes/lw-d/world-navigation.js`: World Atlas menu and new independent Main Lobby dock entry; clear “Лабораториско лоби” label retained for approved existing 3D scene. Original Classic menu paths still present.
- `prototypes/lw-d/live-context.js`: return from five-door lab HUD to separate global Main Lobby. No geometry replacement.
- `js/app.js`: read-only original saved pet profiles/homes + toy prices, original trained level/lineage/appearance; existing `openExistingHome(id)` validates actual habitat ID and opens the canonical existing habitat, never a fake 3D house.
- Existing original `TrialumCreatureArt` gives a portrait to each pet natal card in 3D HUD. No external images/AI or fabricated saved identities.
- `js/lw-d-interface.js`: existing local/shared Classic playground functions occupy full phone screen with compact HUD toolbar and return to global Main/Social HUD; secure source/origin checks unchanged.
- **Триони / Trions (TRI)** shown as label for original earned credits; no new currency balance/transactions.
- English text catalog, existing full original menus, child HUD and offline APK/PWA assets updated; the former standalone D0 HTML preview remains self-contained.

### Exact QA evidence
- [GitHub Actions **#158 — SUCCESS**](https://github.com/extreme4music-nexus/Trialum/actions/runs/43663150613). Exact compiled and signed source SHA: `864dc765e23b674f4d344d32e6992a7cf734bbda` (later doc-only changes do not alter APK source).
- **OWNER-SIGNED INSTALLABLE ZIP**: `Trialum-LW-D-L3-8-OWNER-SIGNED-SIGNQA-158` — artifact ID `14141405536`, ZIP SHA256 `27f03ca84f295c9bc33d0882f7d716db83af6d02417465b323253882a5ed9958`; expires **2026-11-29**.
- Install the **SIGNED** `Trialum-LW-D-L3-8-SIGNQA-SIGNED.apk` inside, over existing `com.trialum.ziivaiskra.signqa` **without uninstalling or clearing game data**. Ignore `Trialum-LW-D-L3-8-SIGNQA-UNSIGNED-158`.
- Node/3D/English/social/server-check workflows PASS for that source and Android `:app:assembleSignqa` + original permanent QA signing + certificate verification PASS. These are software checks **not** proof of on-device UX.

### OWNER REAL PHONE QA CHECKLIST — pending
1. Start current existing signed QA world; preserve all saves/pets and sound from earlier L3.7. Tap new **🏛️ Главно** dock or Atlas → **Главно лоби**. This should be a clearly separate HUD from the existing physical **Лабораториско лоби**.
2. From Main HUD open **Знаење**, **Флора**, **Производство на храна**, **Лабораториско лоби**; verify each real existing 3D lab and all five existing doors unchanged, and return to global Main HUD.
3. **Свет**, **Градина**, **Живеалиште/инкубатор**, future shops: visible marked future HUD, NO pretend 3D roads/homes/plant growth/purchases.
4. **Миленичиња**: actual original pet portrait and natal cards, age, actual level, species, generation and original home. **Домови**: only actual existing habitats with resident pets; tap one and verify original matching home opens, never an arbitrary one.
5. **Дружење**: local/shared playground full-screen with toolbar; can return to Main/Social HUD. Messages and Friends HUD routes open existing working private features; no bypass of opt-in.
6. **Повеќе**: each subsection has a HUD or original linked route; old Classic access remains.
7. **Продавници**: existing toy price/unlock references stay exact; boutique and furniture show future labels and cannot charge coins. Existing credits exactly equal 3D “Триони” total; no second currency.
8. Real Galaxy A55 landscape/pointer scroll/Escape and Android back, MK/EN, sound/music/mute, offline/restore, FCM, friend invites/messages and backups remain correct.
9. Only OWNER explicit phone PASS may close L3.8. No main merge/Play Release and no newly constructed city, houses, nursery or shops until a later owner-directed implementation phase.
