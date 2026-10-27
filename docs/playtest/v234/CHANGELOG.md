# Riftwatch v234 Playtest Candidate

Status: `PLAYTEST-EXPERIMENTAL`. This is an isolated candidate preparation, not a public deployment, Gameplay Integration, or formal QA acceptance.

## Game First changes since public v228

- Plain WASD camera movement coexists with Shift+A Attack-Move.
- Trained units exit on the Rally-facing side; the real Rally target remains active.
- Double-clicking the Canvas selects visible allied units of the same type.
- The commander exposes production Mark and Aegis range previews.
- Rift Prototype awakening has a dedicated gameplay cue.
- Music adapts to preparation, wave, Boss, boon, and pause states.
- Construction, training, commands, deposits, wave warnings, and combat retain audible feedback.
- Ranged, melee, guard, cavalry, and civilization-specific units use more distinct silhouettes.

## Provenance

The feature chain is linear and already integrated before this candidate:

1. `f9a0eb8a6ecfc0322973bd0156ff0cd3874c5d6c` — control-group clear behavior.
2. `d92641dc73e1ea85c4ab585dcecab72cc6f43a82` — input, Rally exit, and double-click gameplay changes.
3. `5df177bee911b8f9251248115e6128aa92b7b563` — hero skill range preview.
4. `86704e1fe6d8ef356a6706c0218854ca6aa593b7` — Rift Prototype awakening cue.
5. `f9d458ac5e578d4e1b6ce0f764aac844774f7fcf` — adaptive battlefield score.
6. `d989bb7236cb7e6bc4bee6892ff0fae9196bc2da` — battlefield role silhouettes.

The exact candidate Build SHA, ZIP SHA-256, 28-file manifest, tests, proposed immutable Pages path, and publication approval boundary are recorded in `APPROVAL-PLAN.json` after the candidate artifact is generated.

## Limits retained

- Low-FPS simulation time loss remains `SIMULATION_INTEGRITY_BLOCKED`.
- Basic Save/Load continuation passes; strict deterministic continuation remains FAIL.
- Historical performance failures remain unchanged.
- Natural Rift Prototype crash remains `NOT_REPRODUCED`.
- Physical mid-end Windows acceptance remains `HARDWARE_TEST_PENDING`.
- Full natural ten-wave stability is not certified.
