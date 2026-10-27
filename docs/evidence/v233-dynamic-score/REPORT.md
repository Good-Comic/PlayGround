# Adaptive score slice

Status: implementation in progress until exact-commit Chromium audio verification is recorded.

This GAME FIRST slice adds a procedural, phase-aware background score using the existing Web Audio graph. Menu/preparation, combat, Boss combat, boon selection, and pause use distinct note patterns, tempo density, timbre, and gain. Victory and defeat silence the loop so their existing stingers remain clear. Muting sound stops score-note generation, and suspended browser audio contexts do no work.

The score adds no external assets, requests, gameplay timers, random-number consumption, combat changes, or balance changes. Low-FPS simulation loss, strict Save/Load nondeterminism, historical performance failures, and `HARDWARE_TEST_PENDING` remain unchanged.
