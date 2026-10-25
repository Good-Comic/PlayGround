# Gameplay requirement matrix — Master Directive v1.0

Implementation and acceptance are separate. `AFTER_LOCAL` never means live deployment. See GAMEPLAY-QA.md for reproducible commands and artifact locations. Commit references and measured results are recorded in GAMEPLAY-PROGRESS.md.

| ID | Source | Implementation | Files | Tests / gameplay evidence | Limitations / next gate |
|---|---|---|---|---|---|
| QA-1 | §3,9,10 | Implemented reusable three-stage capture, build provenance and analysis | tools/qa/*, js/build-info.js | real-input screenshots, HAR, trace, state timeline | AFTER_DEPLOY_LIVE blocked; no deploy authorization |
| A1-1 | §4 A1 | Half-tile A*, swept static collisions, radius-aware endpoints, legal spawns, route invalidation, bounded search admission | js/navigation.js, js/game.js | navigation-economy tests: 7 classes, water, trees, building, dynamic obstacle | Multi-unit crowd steering/separation and narrow traffic not complete; 1000 units NOT_TESTED |
| A1-2 | §4 A1 | Resource interaction endpoints and unreachable resource cooldown/reassignment | js/game.js | fixed LIVE seed regression and unreachable resource test | exhaustive biomes/seeds pending |
| A2-1 | §4 A2 | Dead/friendly targets cleared before state dispatch, immediate acquisition | js/game.js | combat tests and paired browser evidence | deployed verification required |
| A2-2 | §4 A2 | Defensive default, aggressive/hold/passive, guard leash, retaliation, manual order priority, persistence | js/game.js, js/ui.js, js/locales.js | combat tests, cycle button | full Guard/Attack-Move/patrol deferred to B3; unreachable combat target recovery open |
| A3-1 | §4 A3 | Preserve exactly-once deposit, reject mixed cargo, reachable dropoff approach, recovery on depletion/destruction and old saves | js/game.js | four resources ≥3 cycles, conservation, destroyed dropoff, save/load | extended simultaneous-economy and all-save migrations pending |
| B1 | §5 B1 | NOT_STARTED | existing rally contract preserved | NOT_TESTED | gate: Phase A outstanding criteria |
| B2 | §5 B2 | NOT_STARTED | existing data preserved | NOT_TESTED | 16-civilization production matrix, elephant/crossbow entry points |
| B3 | §5 B3 | NOT_STARTED except existing multiselect/formation | — | NOT_TESTED | groups, attack-move, guard, patrol, crowd handling |
| C1 | §6 C1 | NOT_STARTED | — | NOT_TESTED | fog Off/Tactical/Classic and tower visibility |
| C2 | §6 C2 | NOT_STARTED | existing Canvas retained | NOT_TESTED | civilization silhouettes, color accessibility |
| D1 | §7 D1 | NOT_STARTED | existing audio preserved | NOT_TESTED | sound categories, mixing/limits |
| D2 | §7 D2 | NOT_STARTED | existing GM preserved | NOT_TESTED | diagnostics and save isolation |
| D3 | §7 D3 | NOT_STARTED | existing settings preserved | NOT_TESTED | persistent expanded settings |
| D4 | §7 D4 | NOT_STARTED | — | NOT_TESTED | responsive typography and layouts |
| E1 | §8 | NOT_STARTED | existing ten-wave/director retained | NOT_TESTED as full campaign | roguelite balance and replay |
| E2 | §8 open items | BACKLOG | — | NOT_TESTED | mobile camp, replay determinism, endless, GDD 626-key trace, 1000 units, native LQA, production art |
