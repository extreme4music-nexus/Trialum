# Trialum LW-D forward-only restoration of LW-C social and AI

Owner device video 2026-11-14 (30.46 seconds at 2340x1080) confirms that
L3.1 lab machinery and four stations are functioning, but does NOT prove
that Friends, Shared Playground or AI conversations work on that build.

## Root cause
L3.1 descended from main before LW-C draft PR #47 was merged. The newer
LWC contextual conversation runtime was therefore missing from LW-D.
The Friends and shared-room modules from main still existed, but 3D hid
their access inside World Atlas / classic fallback.

## Pinned sources
LW-C source feature/lw-c-contextual-turntaking-session-20261113 at SHA
4e7a3e95ad5ebb1f4588ff211cd915ed86c3ed4f.
LWD starting head feature/lw-d-l3-1-detailed-laboratory-20261114 at
40e681675b0a2f3039d8823357c3c325a460066f.
Separate integration branch feature/lw-d-forward-consolidation-lwc-20261114.

## Restored specifically from LW-C, not a blind full merge
1. Dialogue ledger (36 per-room turns, 90-minute TTL, speaker IDs, answers).
2. Opt-in mini AI speech engine, 90% real model / 10% bounded contextual
   scripted speech, verified-room speaker selection and anti-repetition.
3. Authenticated shared-room reply-to turn IDs, with language independent links.
4. Native Android model prompt bounding and optional pending-turn queue.
5. Play Games explicit profile consent before cloud checks.
6. Script load order and offline Android/PWA cache for dialogue module.
7. Additive English translations and copied LW-C test evidence.
8. Existing 3D laboratory, spatial camera, HUD, five doors, pet/game data,
   backups, server and stable signed app identities not overwritten.

## Crucial limitations
This is CODE RESTORATION until new Android physical owner QA. It is not
evidence of working two-pet conversations on the user's device.
In the current 3D world the social features are accessible through World
Atlas to the ORIGINAL functioning classic tabs; complete 3D pets, social
playgrounds and lab-background AI conversations are not implemented.

## Required QA before OWNER PASS
- Original Friends and Messages tabs still connect normally.
- Shared playground with two or more present pets exchanges authenticated
  messages and actual contextual mini AI replies when explicitly opted in.
- No stuck questions, duplicate self-replies, repeated source text, lost
  pet identities or broken opt-in privacy.
- Resume after background/reconnect. Backup/restore world and local pet IDs.
- L3.1 corridor, machinery, camera, in-machine outcomes and hologram unchanged.
- Google Play Games stays consent-based. The owner controls local signing.
- No public beta, main branch, signed package or server deployment changes.

Next development after recovery owner QA: L3.2 physical DNA laboratory,
followed by food production, flora and research spaces; pet homes,
playgrounds, social interaction spaces and real food warehouse in later slices.
