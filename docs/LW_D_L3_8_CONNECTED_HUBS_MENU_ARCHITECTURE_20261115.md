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
