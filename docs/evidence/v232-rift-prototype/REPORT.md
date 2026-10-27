# Rift Prototype natural-flow and audio slice

Status: `NOT_REPRODUCED` for the reported natural Rift Prototype crash; `LOCAL_VERIFIED` for the new awakening audio cue after affected tests and browser verification.

The exact pre-change build `149f063e37fb68bf02e97535a389f4ef01210ad4` completed a real local Chromium preparation period and first wave through the production UI and rAF loop. Seed `rift-browser-120`, Teutons, Ashlands, the supported 1.5× setting, Reduced Motion, and a 1280×720 viewport reached the boon screen after 111.46 wall seconds / 165.04 active simulation seconds. The core retained 3000 HP. Console errors, Page Errors, and failed requests were all zero.

That natural offer contained `citizen_arms`, `war_banner`, and `pack_mules`; it did not contain Rift Prototype. The run therefore proves this specific natural wave reaches settlement cleanly, but it does not reproduce or disprove the reported crash at a natural Rift Prototype claim. The failed target check is intentionally retained in `natural-browser.json`; no card, phase, or `chooseBoon` state was injected.

A prior diagnostic run with explicit SwiftShader at 1600×1000 advanced only 56.87 simulated seconds in 125 wall seconds and never reached the boon screen. It had no browser errors. This is consistent with the known production `dt <= 0.05` low-FPS time-loss defect and remains a failure observation, not hardware acceptance.

The gameplay slice adds a dedicated mechanical awakening cue to a successfully spawned Rift Prototype. It uses the existing Web Audio/SFX system, adds no external assets or network requests, and does not alter combat stats, card probability, simulation, or balance. The cue only fires after `spawnUnit` returns a live unit, so a failed spawn cannot announce a unit that was not created.

Validation:

- `focused-node.log.txt`: 25/25 affected navigation, wave settlement, smoke-time, and Rift Prototype tests pass.
- `natural-browser.json`: genuine natural first-wave run; wave settlement PASS, target card offer FAIL/NOT_REPRODUCED, browser errors 0.
- Post-change immutable-artifact Chromium evidence is generated after the application commit and records the real boon UI, live prototype, movement order, and cue invocation.

The public GitHub Pages v228 build and OmGitHub Issues #17/#18 were not changed. This is local Chromium/SwiftShader-class evidence, not physical mid-end hardware or OmGitHub Preview verification.
