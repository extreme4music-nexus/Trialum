# Trialum LW QA v34 — 90% actual mini-AI dialogue / 10% contextual scripted nudges

**Scope:** Internal QA only; after owner-observed v33 shared-room conversation, the
fast 3.5/4-second deterministic subtitles visibly drowned out real mini-LLM
replies (which are intentionally rate limited to 24+ seconds). This changes
*the source of visible spoken turns*, not autonomy/XP/toy scheduling.

## Player-agreed behavior

- **AI OFF/uninstalled/locked:** retain the existing scripted/simulated speech,
  locally and in shared rooms. No fake model invocation.
- **AI ON, playground visible, verified eligible pet + room lease:** do not
  overlay rapid deterministic screenplay subtitles. Aim for **nine successfully
  produced local SmolLM2-135M replies to one safe scripted question** per ten
  successfully scheduled/relayed turns. Interleave small thematic questions to
  re-anchor the conversation, not to abruptly swap subjects. The AI uses
  the recent room question and bounded local topic memory.
- **Persistent AI explicitly consented in Android, Activity in background:**
  native foreground service uses the same 9:1 completed-output selection and
  the same authenticated room-only WSS and English-pivot translator.
  Activity foreground pauses native background inference; no silent auto-start.
- **App background with Persistent AI OFF:** no model inference; current
  simulated gameplay remains available when the player returns.
- Model unavailable/failure, missing room lease, room block, network loss,
  power saver and user's Stop AI must fail closed. Never invent an AI response.
- Existing no-ads/no-payments, saved-world/backup isolation, model opt-in,
  same certificates, unchanged server/PostgreSQL/Caddy/8585/FCM remain.

## Important distinction / QA proof

The client counters in the AI opt-in card count completed LLM outputs queued to
the authorized room (or displayed in the local playground) versus controlled
scripted topic nudges. They are **not** server cryptographic attestation. The
server validates client, room, pet, lease and translated language, but does not
run the AI model and cannot prove a client's sentence was LLM-generated.

A 90/10 scheduler is a *target ratio for successful outputs from opted-in
creatures*, not a promise of a 90% AI ratio among **all** room speech when
non-AI peers independently contribute simulated messages, nor a constant
conversation frequency. Devices remain power/rate limited and Android may
stop the native service. Server accepts a client WSS send before returning any
translation result; a transient failure can reduce the actual delivered ratio.

## Automated gates / physical owner QA

- The dialogue-mix tests verify 9 true model results + one safe simulated
  nudge in local and shared scenes, old scripted fallback with AI off,
  no rapid simulated overlay, native background guardrails.
- CI builds three unsigned candidates from one exact source; permanent
  owner-signing only happens on trusted main after safe checks.
- **Physical QA still needed:** AI ON/OFF comparison, two Android installs with
  2 eligible local models, 30+ connected turns and visible counters, context
  continuity, model failure, app background/foreground handoff, screen off,
  Android notification Stop, power/battery-saver, block, lease expiration and
  reconnection, language pivot accuracy, performance and battery life.
- **Do not update the home server for this Android-only dialogue mix.** The
  healthy v33 translator and server remain as deployed. Public release gated
  on owner testing and moderation review.
