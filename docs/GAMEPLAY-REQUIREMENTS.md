## v228 published — scoped HTTPS acceptance

Public [v228](https://good-comic.github.io/PlayGround/builds/ab56a5b824fabc5e123cf33e912d11bd3c625911/) is PLAYTEST-EXPERIMENTAL. Initialdeploy92e426327cfcfa6e27b2d400880681edd5256688;finalsite5b30bda085197cfa820a594224e2f6df929bf60d.59actualpublicbrowserassertionsPASS,31hostingfilesmatch,1007Gitresourcecomparisons; [report](evidence/live-v228/REPORT.md). D6treeunchanged,Pagesconfigunchanged,main/Integration/#17/Checkpointsuntouched. This is AFTER_DEPLOY_LIVE_SCOPED_PASS, not fullQA/hardware/performance/GameplayIntegration. ProductionlowFPS/strictSaveLoadFAIL andhistoricalFAIL remain. Independentresearch03e3a8423e4956be7face8009d7bfff48aa6a11e isolates sharedvisualRNG throttle andprojectileloss; localgroupclear80bec7a68cb0f822b3071642dc02bd9ff3964750 isNOTpublished.

## Strategy v2.2.8 — current scoped checkpoint

Candidate `codex/riftwatch-playtest-v228`, game Build `ab56a5b824fabc5e123cf33e912d11bd3c625911`. [Report](evidence/v228-candidate/REPORT.md), [exact release proposal](playtest/v228/APPROVAL-PLAN.json). NAV-228-01 LOCAL_VERIFIED: recordednative dt reproduces7/8 exactly; dynamicdetour fix gives8/8native16.73s plusaffectedP0/orders/24crowd. B-GROUP-228-01 LOCAL_VERIFIED: clickablegroups/Settingsvisibility,18targetedNode/19native/fourlocale678keys;100selectedMOVE-only impact3+3PASS, notcombat/hardware. DEV-QUOTA-228-01 local8fixturesPASS; actualQUOTA_PERCENT_UNKNOWN/manualdispatchonly. SIM-228-01 remainsFAIL/BLOCKED:20realvirtualseconds at10Hz→10sim; fixedprototype SaveLoaddeterminismfails, notinstalled. No new publicSHA, GameplayIntegration orD6changes. Fullcampaign/current-scalecombat/hardware/independentSupervisor remainpending; historicalFAIL preserved. Formationeditor/Fog/newRoguelite slices queued.

## Strategy v2.2.7 — current scoped update

Independent candidate `codex/riftwatch-playtest-v227`, game SHA `27b279410db1bb9c14b3c1b921b146059a6c6341`. Wave softlock-risk reproduction/fix, Attack-Move/unit Guard/two-point Patrol/control groups and UI text scale implemented with scoped local evidence. See [v227 report](evidence/v227-candidate/REPORT.md) and [exact new-SHA deployment proposal](playtest/v227/APPROVAL-PLAN.json). OPEN-NAV-NARROW-01 remains FAIL (7/8destination despite8cross); public D6 and Gameplay Integration remain unchanged; no new online QA claim. Historical FAIL, low-FPS clock error and HARDWARE_TEST_PENDING remain. New formation editor, complete campaign and full current-scale combat acceptance pending. Start Game fixed English is GDD BY_DESIGN.

## Strategy v2.2.2 recovery status — current override

Recovery/handoff framework implemented and normally pushed; actual source/test/evidence state is in [STRATEGY-V2.2-EXECUTION.md](STRATEGY-V2.2-EXECUTION.md), [Recovery Manifest](recovery/WORKTREE-RECOVERY.md) and handoff/ACTIVE-TASK.json. Historical records below remain unchanged. Recovered12/12 corrected-window baseline cases (source11f8a6a),9PASS/3FAIL; no missing sample rerun. Target/Population/Civ bounded local acceptance does not equal integration.500/1000 FAIL remains research, not a project-wide lock. Simulation integrity, physical hardware and online deployment remain independent blocked/pending gates.
## Strategy v2.2 population slice

A3-POP-01: finite derived HUD values, economy cap60 independent of housing, global per-category queued reservations, Franks military40, atomic zero-spend rejection, unchanged Save/Load schema. IMPLEMENTED with49 passing tests; bounded browser validation PENDING. Starting military40 now follows core20+two houses10. Wave150/240 ceiling reconciliation: SPEC_DECISION_REQUIRED, not falsely complete. Original other requirements below remain tracked.

> Strategy v2 supersedes the historical blanket Phase B block below.500/1000 FAILs remain unchanged; they are extension goals, not current development blockers. Current gate and statuses: GAMEPLAY-ROADMAP.md and GAMEPLAY-ACCEPTANCE.md.250 is a provisional stress target, not a supported-scale claim.

> PERF_IN_PROGRESS: current p0.4 gameplay source59c8529; all final runs at8549065. Functional browser P0/stances/save/crowd regressions PASS; three-repeat performance PASS25/100/250, FAIL500/1000 movement and1000 combat. Original failures retained. AFTER_DEPLOY_LIVE=DEPLOYMENT_BLOCKED; Phase B NOT_STARTED. See PERFORMANCE-RECOVERY.md.

# Gameplay requirement matrix — Master Directive v1.0

Current implementation commit: `c305aec96afd6c499f5b82046d991c5a0da02a3d`. Phase A is NOT COMPLETE: 100/1000-unit performance gates FAIL; Phase B remains BLOCKED. Current measured results are preserved in docs/evidence/phase-a-v3/acceptance.json.

Implementation and acceptance are separate. `AFTER_LOCAL` never means live deployment. See GAMEPLAY-QA.md for reproducible commands and artifact locations. Commit references and measured results are recorded in GAMEPLAY-PROGRESS.md.

| ID | Source | Implementation | Files | Tests / gameplay evidence | Limitations / next gate |
|---|---|---|---|---|---|
| QA-1 | §3,9,10 | Implemented reusable three-stage capture, build provenance and analysis | tools/qa/*, js/build-info.js | real-input screenshots, HAR, trace, state timeline | AFTER_DEPLOY_LIVE blocked; no deploy authorization |
| A1-1 | §4 A1 | Half-tile A*, swept static collisions, radius-aware endpoints, legal spawns, route invalidation, bounded search admission | js/navigation.js, js/game.js | navigation-economy tests: 7 classes, water, trees, building, dynamic obstacle | Crowd/relative formation/local yielding added in js/crowd.js; 24-unit and8-unit narrow-queue tests PASS. 500/1000-unit repeated performance FAIL; not an all-map/crowd proof |
| A1-2 | §4 A1 | Resource interaction endpoints and unreachable resource cooldown/reassignment | js/game.js | fixed LIVE seed regression and unreachable resource test | exhaustive biomes/seeds pending |
| A2-1 | §4 A2 | Dead/friendly targets cleared before state dispatch, immediate acquisition | js/game.js | combat tests and paired browser evidence | instant kill-event cleanup plus12 latest browser death-to-living transitions PASS locally; deployed verification BLOCKED |
| A2-2 | §4 A2 | Defensive default, aggressive/hold/passive, guard leash, retaliation, manual order priority, persistence | js/game.js, js/ui.js, js/locales.js | combat tests, cycle button | full Guard/Attack-Move/patrol deferred to B3; unreachable combat replacement PASS at0.05s across water; full Guard/Attack-Move still open |
| A3-1 | §4 A3 | Preserve exactly-once deposit, reject mixed cargo, reachable dropoff approach, recovery on depletion/destruction and old saves | js/game.js | four resources ≥3 cycles, conservation, destroyed dropoff, save/load | 12 competing workers per resource x300s PASS; all workers >=23 cycles, conservation error <=2.01e-9; browser Save/Continue PASS. Arbitrary legacy/corrupt saves and endurance beyond tested bounds remain open |
| A1-3 | Performance recovery | Three fresh-browser repeats25/100/250/500/1000 plus1000 real combat, fixed seed/browser/viewport/hardware,8s warmup+20s samples | tools/qa/performance_audit.py | rAF and JS spans separate; mean/P50/P95/P99, original15s movement gate, CPU/collision/cache/GC/raster profiles and failed raw samples | PASS25/100/250 all3; FAIL500 (2/3),1000 move(1/3),1000 combat(0/3). All1000 movement100%; original thresholds unchanged, Phase B blocked. Historical p0.3 failures unchanged in archived evidence |
| A1-4 | Current Task2.1–2 | Crowd spatial buckets, collision-aware steering, deterministic yielding, compact relative formation, FIFO path admission | js/crowd.js, js/game.js | 24/24 crowd and8/8 forced-channel crossing/actual-arrival PASS in integration and real-input local browser;100/100 search fairness within4.8s | arbitrary dense/mixed-size maps unverified;1000 startup latency gate passes, repeated frame/combat gates fail |
| B1 | §5 B1 | IMPLEMENTED branch codex/riftwatch-b1-rally; LOCAL_VERIFIED scoped behavior | existing rally field/flags/production/UI/save | actual native ground/resource/clear/reload/blocked-spawn tests | BLOCKED integration:91569e2 mixed clock89.659% FAIL; final2f148c3 full perf NOT_TESTED; no1000 blanket block |
| B2 | §5 B2 | IMPLEMENTED/LOCAL_VERIFIED scoped entries on codex/riftwatch-b2-civ-training | CHN crossbow, PER/AZT/SAR rules, age guard/pagination |46 tests, actual train/combat/save/4locale/P0;16-civ data matrix | BLOCKED integration:dc4698a stuck3.6%; remaining authoritative GDD roster/era/tech NOT_TESTED |
| B3 | §5 B3 | NOT_STARTED except existing multiselect/formation | — | NOT_TESTED | groups, attack-move, guard, patrol; crowd foundation exists but is not a full formation/control system |
| C1 | §6 C1 | NOT_STARTED | — | NOT_TESTED | fog Off/Tactical/Classic and tower visibility |
| C2 | §6 C2 | NOT_STARTED | existing Canvas retained | NOT_TESTED | civilization silhouettes, color accessibility |
| D1 | §7 D1 | NOT_STARTED | existing audio preserved | NOT_TESTED | sound categories, mixing/limits |
| D2 | §7 D2 | NOT_STARTED | existing GM preserved | NOT_TESTED | diagnostics and save isolation |
| D3 | §7 D3 | NOT_STARTED | existing settings preserved | NOT_TESTED | persistent expanded settings |
| D4 | §7 D4 | NOT_STARTED | — | NOT_TESTED | responsive typography and layouts |
| E1 | §8 | NOT_STARTED | existing ten-wave/director retained | NOT_TESTED as full campaign | roguelite balance and replay |
| E2 | §8 open items | BACKLOG | — | NOT_TESTED | mobile camp, replay determinism, endless, GDD 626-key trace, 500/1000-unit repeated performance acceptance FAIL (measured), native LQA, production art |

The old p0.2 narrow PASS was withdrawn after detecting an outer bypass. The corrected p0.3 fixtures seal outer paths and require actual channel crossings and destination proximity; they remain in use and pass on p0.4. See GAMEPLAY-PROGRESS.md and evidence/phase-a/narrow-audit-correction.json.

Performance recovery: legal swept-clear direct routes, reusable crowd buckets, static infantry/shadow/spark rasters and terrain-lighting cache implemented; negative dt/radius fixed. Current39-test log includes actual forced A* fairness and speed/collision-preserving1000 direct-route checks. Full root-cause audit and unchanged failed gates: PERFORMANCE-RECOVERY.md. No blanket release approval.

Current v2 evidence overrides old development embargo but not old measured FAILs: STRATEGY-V2-EXECUTION.md. All original A/B/C/D/E groups remain tracked in GAMEPLAY-ROADMAP.md. Full natural ten-wave peak, release budget, candidate remote deployment and remaining GDD content remain explicitly unverified.
