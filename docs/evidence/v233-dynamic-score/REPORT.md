# Adaptive score slice

Status: `LOCAL_VERIFIED` at application commit `f9d458ac5e578d4e1b6ce0f764aac844774f7fcf`.

This GAME FIRST slice adds a procedural, phase-aware background score using the existing Web Audio graph. Menu/preparation, combat, Boss combat, boon selection, and pause use distinct note patterns, tempo density, timbre, and gain. Victory and defeat silence the loop so their existing stingers remain clear. Muting sound stops score-note generation, and suspended browser audio contexts do no work.

The score adds no external assets, requests, gameplay timers, random-number consumption, combat changes, or balance changes. Low-FPS simulation loss, strict Save/Load nondeterminism, historical performance failures, and `HARDWARE_TEST_PENDING` remain unchanged.

Validation:

- Full affected regression: 111/111 Node tests pass.
- A fresh immutable 28-file artifact from the exact application commit passes 7/7 real local Chromium checks with no Console, Page, or failed-request errors.
- The browser entered a running `AudioContext` through the real Start Game gesture. Preparation scheduled notes, the production countdown changed the score to `wave`, the sound button stopped note generation, Pause selected `paused`, and a controlled living Boss fixture selected `boss` through the production `bossAlive` route.
- `prep-score.webm`: 43,155-byte WebM Opus, 48 kHz, two channels, recorded directly from the production music bus.
- `battle-score.webm`: 50,832-byte WebM Opus, 48 kHz, two channels, recorded directly from the production music bus.

The recordings are browser-generated acceptance evidence, not studio mastering or physical-speaker hardware validation. The Boss setup is a controlled routing fixture and is not a natural ten-wave campaign claim.
