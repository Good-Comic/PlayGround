## Strategy v2.2.7 — current scoped update

Independent candidate `codex/riftwatch-playtest-v227`, game SHA `27b279410db1bb9c14b3c1b921b146059a6c6341`. Wave softlock-risk reproduction/fix, Attack-Move/unit Guard/two-point Patrol/control groups and UI text scale implemented with scoped local evidence. See [v227 report](evidence/v227-candidate/REPORT.md) and [exact new-SHA deployment proposal](playtest/v227/APPROVAL-PLAN.json). OPEN-NAV-NARROW-01 remains FAIL (7/8destination despite8cross); public D6 and Gameplay Integration remain unchanged; no new online QA claim. Historical FAIL, low-FPS clock error and HARDWARE_TEST_PENDING remain. New formation editor, complete campaign and full current-scale combat acceptance pending. Start Game fixed English is GDD BY_DESIGN.

## Strategy v2.2.2 recovery status — current override

Recovery/handoff framework implemented and normally pushed; actual source/test/evidence state is in [STRATEGY-V2.2-EXECUTION.md](STRATEGY-V2.2-EXECUTION.md), [Recovery Manifest](recovery/WORKTREE-RECOVERY.md) and handoff/ACTIVE-TASK.json. Historical records below remain unchanged. Recovered12/12 corrected-window baseline cases (source11f8a6a),9PASS/3FAIL; no missing sample rerun. Target/Population/Civ bounded local acceptance does not equal integration.500/1000 FAIL remains research, not a project-wide lock. Simulation integrity, physical hardware and online deployment remain independent blocked/pending gates.

# Riftwatch strategy v2 — 2026-10-25

User strategy v2 replaces the previous blanket Phase B embargo. Current product target is provisional:50–100 total active units regular,101–200 large,201–250 stress. Count both teams, villagers, heroes and summons.500/1000 remain extension targets; all historical FAILs remain unchanged. No hard spawn cap is introduced. Budget is not a one-side population setting.

Current release rule: **Phase A core correctness + measured current-product-scale performance -> continuous feature integration.** A failing feature is quarantined on its own branch; design and independent work elsewhere continues. Integration is not deployment. No main/checkpoint/old Preview mutation.

## Branch protocol

- preserved history: codex/riftwatch-gameplay-improvement at7faa21a274847ca649a7a96b88700d4cdda5fe2e
- unified target: codex/riftwatch-gameplay-integration, initially the same commit
- QA/budget strategy: codex/riftwatch-v2-baseline
- one feature per branch: codex/riftwatch-b1-rally, codex/riftwatch-b2-civ-training
- later B/D/C/E branches use an explicit requirement ID and recorded integration parent. Each feature has unit/integration, real-input browser, P0, Save/Load, four-locales, before/after performance and review evidence before merge. Use normal scoped pushes. Merge only into gameplay-integration after gates; never force push.

## Design/task matrix (preserves original11 requirement groups)

| ID | Original group | Module / acceptance | State |
|---|---|---|---|
| A-PERF-250 | A1 |100/200/250 actual combat +250 mixed,3 independent runs, unchanged rAF/movement gates, input latency<=250ms, clock ratio>=.90, order completion and failures | LOCAL_VERIFIED tooling; measured FAILs preserved; see execution report |
| A-BUDGET-01 | A1/A3 |all16 civ/3seed/10wave director envelope + real campaign peak, queue/summon audit; no hidden cap | CODE audit; real full campaign NOT_TESTED |
| A-CLOCK-01 | A1/A2/A3 |offline fixed-step prototype; slowFPS combat/economy/cooldowns/status/waves/RNG/load; no production replacement until evidence | prototype only; evaluation |
| B1-RALLY-01 | B1 |selected production buildings right-click ground/resource, visible flag, training uses orders, clear, persists; invalid inputs safe | IMPLEMENTED/LOCAL_VERIFIED scoped function; integration BLOCKED |
| B2-CIV-ENTRY-01 | B2 |16-civ production matrix; Persian elephant / Aztec no-cavalry / Saracen market; Chinese repeating-crossbow training entry | IMPLEMENTED/LOCAL_VERIFIED scoped function; integration BLOCKED |
| B3-ATTACKMOVE-01 | B3 |order module, destination + hostile engagement + resume, save migration, manual priority | DESIGN; NOT_TESTED |
| B3-GUARD-01 | B3 |protect allied unit/building, leash, target death recovery, Hold remains nonpursuing | DESIGN; NOT_TESTED |
| B3-FORMATION-01 | B3 |selection/groups, relative slots, mixed-radius clearance, key hints | DESIGN; NOT_TESTED |
| D4-TEXT-01 | D4 |CSS text scale independent of canvas/world input,4 locales, HUD overflow | DESIGN; NOT_TESTED |
| D3-SETTINGS-01 | D3 |versioned settings, remappable hints, accessible controls, restore defaults | DESIGN; NOT_TESTED |
| D2-DEBUG-01 | D2 |GM high-count opt-in, paths/queue/blocked goal debug, isolated saves | DESIGN; NOT_TESTED |
| D2-SAVE-01 | D2 |versioned snapshot/order migration, exact cargo, clock debt policy | DESIGN; strict deterministic resume unresolved |
| C1-FOG-01 | C1 |Off/Tactical/Classic visibility grid; tests prove unseen target cannot be attacked | DESIGN; NOT_TESTED |
| C1-TOWER-01 | C1 |tower sight updates same visibility grid, scouting/information UI | DESIGN; NOT_TESTED |
| C2-SILHOUETTE-01 | C2 |civ palettes + distinguishable unit silhouettes at current zoom/text scale | DESIGN; NOT_TESTED |
| D1-AUDIO-01 | D1 |combat cues/categories, bounded voice mixer, no simulation-dependent audio timers | DESIGN; NOT_TESTED |
| E1-WARN-01 | E1 |wave/boss warnings on simulation clock, pause/load consistency | DESIGN; existing wall timers audited |
| E1-CARDS-01 | E1 |synergy tags, actual modifiers, no unbounded summon loops,4-language explanation | DESIGN; NOT_TESTED |
| E1-BIOME-01 | E1 |16 civ x8 terrain differentiation, travel/visibility/economy consequences | DESIGN; NOT_TESTED |
| E1-REPORT-01 | E1 |postwave resources/losses/commands/stalls, concrete defeat cause | DESIGN; NOT_TESTED |
| E1-CURVE-01 | E1 |3 complete natural campaigns + peak/stability/replay evidence | NOT_TESTED |

Do not equate count of features with playability. Rendering/backend limitations, synthetic scenes and accelerated simulation are always labelled. Candidate deployment plan remains separate authorization; no Issue/workflow/Preview write this round. Local exact-commit candidates may be served read-only, with source hashes and fresh disposable saves; never labelled DEPLOYED_VERIFIED.

Current evidence and actual source mapping: [STRATEGY-V2-EXECUTION.md](STRATEGY-V2-EXECUTION.md). Full ten-wave peak/stability remains NOT_TESTED, product budget provisional,500/1000 historical FAIL unchanged. Both gameplay branches are unmerged; QA integration is not a gameplay release. Known A-BUDGET-02 undefined cap getters/global queue reservations and E1-BOSS-02 missing M reinforcement ID are open.
