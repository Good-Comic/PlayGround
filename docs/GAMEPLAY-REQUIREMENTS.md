> PERF_IN_PROGRESS: p0.4 source `59c852911bef17ce1376efa4970937bb8da96308` recovered and checkpointed. Final repeated performance and P0 browser regressions pending; original thresholds and failures retained. No release/deployment approval. See GAMEPLAY-PROGRESS.md and evidence/performance-recovery/checkpoint.json.

# Gameplay requirement matrix — Master Directive v1.0

Current implementation commit: `c305aec96afd6c499f5b82046d991c5a0da02a3d`. Phase A is NOT COMPLETE: 100/1000-unit performance gates FAIL; Phase B remains BLOCKED. Current measured results are preserved in docs/evidence/phase-a-v3/acceptance.json.

Implementation and acceptance are separate. `AFTER_LOCAL` never means live deployment. See GAMEPLAY-QA.md for reproducible commands and artifact locations. Commit references and measured results are recorded in GAMEPLAY-PROGRESS.md.

| ID | Source | Implementation | Files | Tests / gameplay evidence | Limitations / next gate |
|---|---|---|---|---|---|
| QA-1 | §3,9,10 | Implemented reusable three-stage capture, build provenance and analysis | tools/qa/*, js/build-info.js | real-input screenshots, HAR, trace, state timeline | AFTER_DEPLOY_LIVE blocked; no deploy authorization |
| A1-1 | §4 A1 | Half-tile A*, swept static collisions, radius-aware endpoints, legal spawns, route invalidation, bounded search admission | js/navigation.js, js/game.js | navigation-economy tests: 7 classes, water, trees, building, dynamic obstacle | Crowd/relative formation/local yielding added in js/crowd.js; 24-unit and8-unit narrow-queue tests PASS. 100/1000-unit performance FAIL; not an all-map/crowd proof |
| A1-2 | §4 A1 | Resource interaction endpoints and unreachable resource cooldown/reassignment | js/game.js | fixed LIVE seed regression and unreachable resource test | exhaustive biomes/seeds pending |
| A2-1 | §4 A2 | Dead/friendly targets cleared before state dispatch, immediate acquisition | js/game.js | combat tests and paired browser evidence | instant kill-event cleanup plus11 browser death-to-living transitions PASS locally; deployed verification BLOCKED |
| A2-2 | §4 A2 | Defensive default, aggressive/hold/passive, guard leash, retaliation, manual order priority, persistence | js/game.js, js/ui.js, js/locales.js | combat tests, cycle button | full Guard/Attack-Move/patrol deferred to B3; unreachable combat replacement PASS at0.05s across water; full Guard/Attack-Move still open |
| A3-1 | §4 A3 | Preserve exactly-once deposit, reject mixed cargo, reachable dropoff approach, recovery on depletion/destruction and old saves | js/game.js | four resources ≥3 cycles, conservation, destroyed dropoff, save/load | 12 competing workers per resource x300s PASS; all workers >=23 cycles, conservation error <=2.01e-9; browser Save/Continue PASS. Arbitrary legacy/corrupt saves and endurance beyond tested bounds remain open |
| A1-3 | Current Task2.7 | Measured25/100/250/500/1000 with actual Chromium/rendering | tools/qa/performance.py | mean/P95 frame time, moved fraction, path load; hardware and raw arrays committed | FAIL at100:35.03ms mean; at1000:36.29ms mean,50.00ms P95,82% movement; Phase B blocked |
| A1-4 | Current Task2.1–2 | Crowd spatial buckets, collision-aware steering, deterministic yielding, compact relative formation, FIFO path admission | js/crowd.js, js/game.js | 24/24 crowd and8/8 forced-channel crossing/actual-arrival PASS in integration and real-input local browser;100/100 search fairness within4.8s | arbitrary dense/mixed-size maps and1000-unit latency not certified |
| B1 | §5 B1 | NOT_STARTED | existing rally contract preserved | NOT_TESTED | gate: Phase A outstanding criteria |
| B2 | §5 B2 | NOT_STARTED | existing data preserved | NOT_TESTED | 16-civilization production matrix, elephant/crossbow entry points |
| B3 | §5 B3 | NOT_STARTED except existing multiselect/formation | — | NOT_TESTED | groups, attack-move, guard, patrol; crowd foundation exists but is not a full formation/control system |
| C1 | §6 C1 | NOT_STARTED | — | NOT_TESTED | fog Off/Tactical/Classic and tower visibility |
| C2 | §6 C2 | NOT_STARTED | existing Canvas retained | NOT_TESTED | civilization silhouettes, color accessibility |
| D1 | §7 D1 | NOT_STARTED | existing audio preserved | NOT_TESTED | sound categories, mixing/limits |
| D2 | §7 D2 | NOT_STARTED | existing GM preserved | NOT_TESTED | diagnostics and save isolation |
| D3 | §7 D3 | NOT_STARTED | existing settings preserved | NOT_TESTED | persistent expanded settings |
| D4 | §7 D4 | NOT_STARTED | — | NOT_TESTED | responsive typography and layouts |
| E1 | §8 | NOT_STARTED | existing ten-wave/director retained | NOT_TESTED as full campaign | roguelite balance and replay |
| E2 | §8 open items | BACKLOG | — | NOT_TESTED | mobile camp, replay determinism, endless, GDD 626-key trace, 100/1000-unit performance acceptance FAIL (measured), native LQA, production art |

The old p0.2 narrow PASS was withdrawn after detecting an outer bypass. Current p0.3 tests seal outer paths and require actual channel crossings and destination proximity. See GAMEPLAY-PROGRESS.md and evidence/phase-a/narrow-audit-correction.json.
