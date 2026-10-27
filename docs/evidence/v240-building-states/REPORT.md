# v2.4 building-state visual slice

Status: `LOCAL_VERIFIED`

Source commit under test: `fe7a54be7f362327da054c468f27366ac6f3fb2d`

This slice adds persistent battlefield-readable states for representative buildings without changing combat, economy, construction, or balance rules:

- construction foundation and scaffold;
- completed building;
- damaged building cracks;
- critical building roof breach and embers;
- destroyed building rubble that remains dead.

## Automated checks

- `node --check js/renderer.js`: PASS before the source commit.
- `node --check tools/qa/v240_building_states_browser.mjs`: PASS.
- `node --test tests/unit-visual-signatures.test.mjs`: 3/3 PASS; raw output is in `focused-node.log`.
- `git diff --check`: PASS.

## Real browser check

Chromium loaded a fresh 28-file static Playtest artifact generated from the exact source commit. The run used the real home-screen Start control first, then replaced the running world with an explicitly labelled controlled fixture so all five states could be compared in one frame. This fixture is visual evidence and is not represented as natural campaign progression.

Results:

- exact clean source SHA and 28 payload files: PASS;
- real Start reached a playable game: PASS;
- five visual samples produced distinct SHA-256 raster hashes: PASS;
- destroyed tower remained `alive: false` while rubble stayed visible: PASS;
- material Console, Page, HTTP, and failed-request errors: 0;
- screenshot: `building-states.png`;
- state timeline: `timeline.json`;
- raw result: `browser.json`;
- recording: `building-states.webm` (3.76 seconds).

The first recording attempt failed because Playwright's expected private FFmpeg binary was absent. The successful run used the installed system FFmpeg through an isolated workspace Playwright cache. The earlier tooling failure is retained outside Git under `/workspace/diagnostics/riftwatch/`; it was not relabelled as a game failure.

## Acceptance boundary

This is `AFTER_LOCAL` evidence. It is not a public deployment, `AFTER_DEPLOY_LIVE`, natural ten-wave completion, hardware validation, or formal integration approval. Existing low-FPS simulation-time loss, strict Save/Load nondeterminism, historical performance failures, the un-reproduced natural Rift Prototype crash, and `HARDWARE_TEST_PENDING` remain open.
