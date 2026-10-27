# v2.4 direction-aware unit animation

Status: `LOCAL_VERIFIED`

Application source: `8e8fd67712431cf46cbcd2bae3f7285d33384e1a`

This GAME FIRST slice adds an eight-direction isometric visual state for the existing procedural unit renderer. Movement updates facing from the actual velocity, attacks face their live target, and hit/death states add recoil and a short falling/fading transition. The representative Chromium scene covers militia, archer and light cavalry. Gameplay radii, pathfinding, damage, attack cadence and balance values are unchanged.

## Verification

- Focused Node regression: 18/18 PASS (`focused-node.log.txt`). This includes directional state persistence, movement and combat facing, death-state Save/Load, expiration without revival, the existing combat stance/retarget checks, civilization families and unit signatures.
- Exact-artifact Chromium: 5/5 PASS (`browser.json`). The immutable artifact contains 29 payload files and reports `SHA256_MATCH_29_FILES` for source `8e8fd67712431cf46cbcd2bae3f7285d33384e1a`.
- The browser used the real home-screen Start flow before installing an explicitly controlled directional-combat fixture.
- Real movement visited `SE`, `S`, `SW`, `W`, `NW`, `N`, `NE`, and `E`.
- Militia, archer and light cavalry entered the live attack state while preserving radii `0.26`, `0.24`, and `0.32`.
- A real kill was performed. The paused inspection then sampled `deathAnim` at 1.1, 0.6, and 0.15 seconds; all frames had different raster hashes and the unit remained dead.
- Console errors, Page errors, HTTP errors and failed requests: 0.

The large preparation timer visible in controlled-fixture captures is deliberate fixture isolation (`prepTimer = 1e6`), not a natural campaign observation. The first discarded browser attempt had a harness reference to a target that the fixture had already cleared; it is retained outside Git under `/workspace/diagnostics/riftwatch/v240-directional-8e8fd67` and is not classified as a game failure.

## Evidence

- `directional-animation.webm`: real Chromium recording.
- `directional-movement.png`: eight-direction movement sequence endpoint.
- `attack-hit.png`: representative live combat facing and hit state.
- `death-1_1.png`, `death-0_6.png`, `death-0_15.png`: controlled inspection of the death-fall transition.
- `timeline.json`: compact raw observation record.

## Acceptance boundary

This establishes a reusable renderer-driven directional animation state for representative units. It is not an authored sprite atlas, a complete unique animation set for every unit, a natural ten-wave certification, public deployment, or physical-hardware validation. Low-FPS simulation time loss, strict deterministic Save/Load, historical performance failures, the natural Rift Prototype crash reproduction gap, full ten-wave stability, and `HARDWARE_TEST_PENDING` remain open. Evidence is `AFTER_LOCAL` only.
