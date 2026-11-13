# LW-C follow-up — Context-first multi-pet AI session dialogue

**Date:** 2026-11-13. **Stage:** DRAFT code/CI candidate; **NOT OWNER DEVICE PASS**; **NOT LW-D**; no public/store deployment.

## Owner's explicit goal (before LW-D)
- A question or statement must remain eligible for an AI answer until peers have received it and there is an opportunity to answer. New incoming speech must not overwrite unanswered speech.
- With 2, 3, or 4+ pets, choose the responding pet pseudo-randomly among actual live peers, not always the same pet. A pet must not answer its own question or repeat the same statement.
- Every AI response should be anchored in actual recent session speech, sometimes an earlier **real** statement (speaker and pet ID retained), not a fresh unrelated sentence. Maintain a larger session memory, but not necessarily hours.
- Continue original 90% real local model / 10% scripted **per AI pet**, with controlled contextual scripted nudges and the existing ~24-second model cooldown/battery protection.
- **Private player↔pet conversations must never be sent to shared playground prompts, backend or other devices.** Speech history used here is ephemeral social speech only.
- Owner first performs physical QA on three signed Android app identities; no automatic LW-D start or owner PASS.

## Implementation boundaries
- `js/playground-dialogue-session.js`: in-memory, room-keyed 36-turn ring with a **pet ID, exact speaker display name, turn ID, parent reply-to turn ID, time**. Duplicate turn IDs are rejected. When a reply is observed, its parent is marked answered. Oldest turn pruned after 90 minutes or more than 36 turns. Nothing writes complete text into world JSON, localStorage or the private server.
- Each authorized client uses the existing authenticated shared-room WSS speech stream and verified occupants. **At most one nominated responder per turn in the same room snapshot** is selected from a stable per-turn pseudo-random hash; after ~30 seconds, other candidates are eligible if the nominated device/pet cannot respond. Selection is eventually consistent **not a server-authoritative atomic speaking lock**, so network delays and different views can occasionally still yield two candidates. No new server data table or migration.
- Up to ten recent short lines plus occasionally a bounded older turn are passed to the local model, with model context size capped at ~1450 characters; the specific referenced input line is included in the immediate prompt. The same author name and ID are preserved across similar display names.
- One AI completion at a time per Android device; uses the pre-existing rate limit and explicit local-model opt-in. If no eligible earlier speech exists, at most one opening anchored to a visible playground toy can occur. Non-AI pets retain bounded scripted dialogue and can seed contextual AI responses.
- Native optional persistent AI background service retains up to 24 unhandled authenticated room turns in RAM and retries after cooldown, without foreground inference overlap or newly added timers; Android still may stop the service. No promise of guaranteed delivery after offline disconnect or process death.
- Existing `js/playground-memory.js` only persists **coarse, date-stamped theme IDs** and limited display names for prior days. **There is NO verbatim previous-day transcript**, thus an AI must not invent exact yesterday quotes; prior-day questions may only reference verified coarse themes or honestly say it does not remember the exact wording.
- Existing room relay is not end-to-end encrypted. A separate user-requested E2EE/privacy architecture remains a future design; this patch does **not** claim to implement it.

## Acceptance and rollback
1. Unit tests: no lost questions through pending model cooldown, 2/3/4-pet response allocation, same-name different-ID memory, old-turn recall, duplicate/replay, room isolation and bounded memory.
2. Regression: 9:1 AI/script mix, non-AI fallback, anonymous/no-model no private chat leakage, XP and room lease unchanged, English translation/room membership guards.
3. GitHub CI: exact-head JS, server/privacy contracts, English catalog and Android SDK36 builds. Use pinned existing certificates and new Android monotonically increased versionCode for all three installable variants.
4. Owner physically tests all three **properly signed** variants, including mixed AI/non-AI pets, 3/4 live pets, session return/background/reconnect/battery and conversation quality. Only the owner can mark OWNER PASS.
5. If new dialogue fails, revert the client-side changes without resetting saved worlds. Home Debian, Caddy, PostgreSQL, Google Play and existing production ports are unchanged.

**This is a focused LW-C conversation-quality refinement. The much larger LW-D redesign begins only after the owner's full scope review.**
