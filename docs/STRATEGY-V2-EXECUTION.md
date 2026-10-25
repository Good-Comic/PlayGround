# Strategy v2 execution and acceptance

Current protected reference: `7faa21a274847ca649a7a96b88700d4cdda5fe2e`. The old improvement branch is preserved at this SHA. New work uses independent QA, B1 and B2 branches plus `codex/riftwatch-gameplay-integration`. No main/checkpoint/old Preview write, force push, workflow/issue invocation or user save mutation. Phase B–E independent development is enabled.500/1000 historical FAILs are extension targets, not a blanket development embargo.

## Status boundaries

| Deliverable | Status |
|---|---|
|v2 roadmap, requirements, tiered tools, code budget audit|IMPLEMENTED; locally exercised; eligible for tooling-only integration|
|B1-RALLY-01|IMPLEMENTED; LOCAL_VERIFIED scoped function; BLOCKED integration/full final performance|
|B2-CIV-ENTRY-01|IMPLEMENTED; LOCAL_VERIFIED scoped function; BLOCKED integration|
|Fixed clock prototype|IMPLEMENTED and LOCAL_VERIFIED headless evaluation; production switch BLOCKED|
|Exact-SHA isolated local Candidate/rollback|IMPLEMENTED, LOCAL_VERIFIED; no DEPLOYED_VERIFIED claim|
|Natural full-ten-wave peak/stability x3|NOT_TESTED; product release budget not finalized|
|Remaining B3/D/C/E modules|DESIGN/task matrix; NOT_TESTED code|
|OmGitHub AFTER_DEPLOY_LIVE|DEPLOYMENT_BLOCKED|

`INTEGRATED_VERIFIED` must never be used for the two unmerged gameplay features. Tooling-only integration keeps all served game resources identical to7faa21a and reuses its existing game acceptance, plus current43 Node tests/4 locales and actual candidate loads. An integration branch is not a release.

## Product budget audit

All counts are **both armies + workers + heroes + summons**, not population points. Adopt50–100 regular,101–200 large,201–250 stress as provisional design bands.250 is not fully supported/certified yet.500/1000 remain long-term. No spawn cap, army deletion, AI removal or Boss reduction was added.

Actual director invocation enumerates16 civs x3 seeds x10 plans: scheduled enemy counts16,24,28,29,27,36,37,36,36,48. Existing Vask rage adds3 twice, Marshal4 twice: a nominal plan+rage envelope56. **This is code/logic evidence, not a naturally played peak.** A newly probed existing bug schedules three extension rounds of4 using nonexistent unit ID`M`: actual probe adds0. If repaired, intended enemy envelope can reach68 before any relevant overflow/carry behavior. Extension flags/counter reset across boss waves also require review. Do not use the broken zero-add behavior to justify a smaller budget. Cleanup marks30% by threat, but wave completion still requires enemiesAlive==0: claimed carryover behavior is not a proven working cross-wave contract.

Initial automatic economy stops training at22 villagers; this is not a manual hard cap. Queue length5 per building; global queued-pop reservations are absent. `popCap` is completed housing/core/monument capacity; Gothic infantry cost.5 population, cavalry2, elephant4, hero/decoy0 yet each is one active entity. Koreans grant at most4 tower carts (placement-time counter, not guaranteed successful completed-tower spawns). Decoy card produces2 expiring45s decoys per wave. Conversion replaces killed targets with20s summons; no separate numeric cap. Hero revive/prototype and player housing expansion add demand. Thus a fixed numeric player/campaign peak cannot be inferred from base wave48.

The current source references undefined `militaryPopCap`, `economicPopulation`, `economicPopCap` getters in manual training/UI; Franks' effects40 is checked only by automatic training. Multiple building queues can overreserve housing. These are recorded existing defects, not silently converted into a new total-active budget. Actual observed first-wave peaks from the real P0 runs are36 and37, over~98/97 simulated seconds; they are **not** ten-wave peaks. Three complete natural campaigns are still required before final product budget/release claims.

If a future soft generation budget is needed: reserve upcoming wave/Boss/rage/hero/decoy demand first; atomic FIFO reservations for all player queues, visible wait reason, full-cost exactly-once cancellation, no paid-unit loss. Allow temporary overflow for existing saves/mandatory Boss behavior rather than deleting units. GM/stress explicitly bypasses the soft target. This is DESIGN only, no cap applied here.

## New repeated performance evidence

Fresh independent Chromium154.0.8037.57 processes,1600x1100/DPR1, Xeon8573C,5 visible CPUs/4CPU cgroup quota,32GiB, software Canvas/SwiftShader environment. Same fixed seed`riftwatch-tier-v2`, TEU/steppe, speed1. No concurrent heavy test/browser loads during these performance suites. Every result records cgroup/heap/CDP/raw arrays/browser and exact clean source SHA. Warmup minimum8s; nominal measured window20s. The inherited runner stops at warmup+20, so a warmup-overrun hitch can shorten a case's actual sample span (e.g200r1~18.77s). Actual raw span is recorded in performance-summary.json. Existing conservative clock gate uses20s; this caveat is not hidden or used to turn failures green. Future sampler work should measure20s from actual measurement start.

Combat uses standard guards and natural AI/attacks/effects/audio on both sides. One guard is isolated for the real pointer-command probe and remains included in total. No unit/stat/invulnerability changes. Mixed250 includes209 guards +40 workers +1hero,10 buildings and40 finite resource nodes; ordinary gather/unload/building updates and combat all run. Fixtures are synthetic local scenes, not online play or full campaigns. Mixed deposit/credit/stuck counters cover the fixture including warmup; attacks/raw frame spans cover measurement.

Original gates unchanged: mean rAF<=33.3ms,P95<=50ms,>=90% move>.15 by15s from fixture creation. JS update/draw/UI spans remain separate; rAF minus JS is not GPU time. Added criteria declared before repeated runs: one pointer order response<=250ms/completes; clock progress>=90%; persistent wanting-to-move/no-progress>=8 simulated seconds peak fraction<=2%; mixed>=4 native unloads/positive credit and>=100 attacks. Residual `orderFailure` flags are diagnostic only, because they persist after recovery. Initial smoke failures using a stricter residual-flag metric are retained, never rewritten.

Each cell below is **mean/P95 rAF ms**, independent repetitions:

| Baseline source12659c1 | Run1 | Run2 | Run3 | Quality |
|---|---:|---:|---:|---|
|100 combat|16.99/16.8|17.54/16.8|16.67/16.7|original performance3/3; full quality1/3 (stuck4%,3%)|
|200 combat|56.87/100|94.26/500|18.62/33.3|1/3; long stalls/clock loss retained|
|250 combat|17.32/16.8|21.32/33.4|16.79/16.8|3/3 in this bounded fixture|
|250 mixed|44.44/66.6|18.71/33.3|18.57/33.4|2/3; first clock/rAF FAIL|

All cases start100% by15s. Baseline200 r1/r2 cgroup throttled-duration deltas14.82/9.85s and mixed r1 8.24s accompany stalls (max rAF3449.9/966.7/3866.5ms). That is observed throttling, not proof of a unique root cause.100r3 has stuck3% even with no throttling and otherwise clean16.67ms rAF: do not blame all gameplay issues on the environment.

| After source | Workload | Run1 | Run2 | Run3 | Quality |
|---|---|---:|---:|---:|---|
|B1 source91569e2|250 combat|16.79/16.8|16.91/16.8|18.42/33.3|3/3|
|B1 source91569e2|250 mixed|19.47/33.4|18.43/33.3|25.51/50|2/3; r3 clock89.659% FAIL|
|B2 sourcedc4698a|250 combat|21.14/33.4|16.78/16.8|17.29/16.8|2/3; r1 stuck3.6% FAIL|
|B2 sourcedc4698a|250 mixed|18.41/33.3|17.95/33.3|19.75/33.4|3/3|

B1 later blocked-spawn/hint-row fixes have focused unit/native-browser validation at7155e1d/2f148c3; final2f148c3 has NOT received a complete new performance suite. Prior failures remain blocking; no retry-until-green substituted. Baseline median250 combat17.32ms vs B116.91/B217.29; baseline mixed18.71 vs B119.47/B218.41. These are descriptive host-sensitive comparisons, not proof of an engine optimization. No claim of complete250-unit support, arbitrary mixed-army capacity or a stress test of250 new crossbowmen.

Raw P50/P95/P99, actual spans, >50/>100ms frames, long-animation-frame entries, method spans, heap/CDP and pass predicates are committed. Long-animation-frame entries include warmup. Full wall/OS scheduling cost cannot be isolated from JS wall spans; no hardware-GPU certification.

Tiered stress probes measure handler-to-movement latency, not full input dispatch. A separate real DOM event timestamp probe runs three fresh-browser normal-start trials per source: baseline95.9–176.4ms, Rally51.7–110.0ms, civilization64.1–125.5ms, all<=250. Agent round-trip upper bounds are stored separately. These measurements exclude physical input hardware/OS latency and do not certify250-unit end-to-end latency. Probe completion is1/1 command per case, not all possible player commands.

## Actual B1 behavior and regression

Source2f148c3e3877fc04b6566c0fc6c680b699c73895: real production-building selection/right-click creates a visible flag/direction; actual militia queue/spawn/movement reaches32,32; Pause/Save/Reload/Continue preserves the rally; clear works; real resource right-click causes a newly trained worker to gather that node. A synthetic market capability fixture proves clear no longer consumes/hides any existing six training shortcuts. Invalid input/ownership/blocked terrain/unreachable water separation and old-save-without-rally have unit coverage. Old villagers without a rally retain automatic gathering.

Blocked spawn retains the paid queue item; follow-up7155e1d holds remaining time0 and displays a localized wait reason. A native browser all-water obstruction probe observes queue1/trained0/remaining0 and unchanged paid resources, then clears obstruction and observes exactly one spawned/trained unit without paying twice. This is a controlled fixture, not a user save modification.

Completed full47-test log + focused6/7-test follow-ups retained;4 locales657 keys. Actual original P0 sourceee49fb919e0aacc108332aade5573d50e1e9c8df:3 observed dead→living retargets, no stale dead target, unload counts wood37/gold9/food16/stone8, no>=20s zero-cargo gather stall, cavalry move completes, console/page/request failures0. The corrected full UI feature browser is at2f148c3, spawn retry at7155e1d, performance at91569e2; do not mislabel them as one identical tested commit.

Two UI fixture/regression failures are preserved: initial resource click was occluded by a building; corrected to an unobstructed node. Moving clear outside the command grid initially clipped it behind the hint row; a real click timeout was captured, then the flex row/reserved button width fixed it. No force-click bypass was used. All original failures remain in the archive.

## Actual B2 behavior and regression

Sourcedc4698a3f8801ea5ada37a908951900fca6a8ef6: Chinese Chu Ko Nu has a real Archery Range entry, visible age lock, Castle Age unlock, native55wood/45gold payment and16s training, actual combat>=3 shots, and UI Save/Reload/Continue. Unit tests prove3 shots produce4 projectiles using the existing Chinese bonus exactly once. Renderer uses archer silhouette rather than falling back to infantry. Four translated unit/role/unlock labels were read from the actual runtime.46 tests and4 locales658 keys PASS.

All16 existing civilization production policies are enumerated/tested: Persian elephant at Stable; Aztec cavalry filtered; Saracen generic hiring retained and paginated so entries beyond six are reachable; legitimate elephant-boon unlock for other civs preserved. Non-owner/dead production rejected. New age/civ restrictions apply at admission, not just by hiding buttons. Current Chu Ko Nu numbers/age are a scoped design prototype, not a certified full GDD balance matrix. Cached issue17 refers to14 spec files/tools absent from both current tree and referenced15b8a9c tree; the actual full16 unique roster/tech/age package is not available here. Remaining GDD alignment is NOT_TESTED/BLOCKED, not silently invented as complete.

P0 browser at the same dc4698a observes7 retarget transitions; food18/wood37/gold13/stone7 unloads, no zero-cargo stall/dead-target samples, cavalry move completes, console/page/request failures0. These functional captures ran separately from performance (parallel functional browsers), so their wall-clock speed is not a performance pass. Feature HAR50/50 resources and P0 HAR25/25 match their exact commits; same checks pass for B1, including25/25 for the spawn-retry build.

## Clock evaluation, not runtime replacement

Four headless prototype tests pass: fixed-step at10/20/60 render cadence yields identical uninterrupted seeded Game state; a2s stall retains/drains debt with <=8 updates/frame; saved clock debt restores; actual Boss/AI/economy/cooldown/status/wave state matches at10/60FPS. The20s scenario fixed10FPS runs20 simulated seconds,53 actual attacks and53 gathered; legacy10FPS runs10 simulated seconds,29 attacks and1 gathered. This is headless cadence evaluation, not a rendered FPS benchmark.

Strict Save/Load state/RNG/motion equality remains FAIL after resume. Initial timestamp-only assertion failure was corrected by excluding savedAt metadata; the real resumed-state differences were not hidden. Wall `setTimeout` biome/Boss warnings and effect expiration still need a simulation-clock/save/pause policy. Prototype is not imported by main.js and no production clock was replaced. Do not use the4 passing test program counts as a deterministic-Save/Load PASS.

## Candidate delivery, isolation and rollback

Implemented`tools/qa/candidate_serve.py`: requires a full40-character SHA, exports only site/assets from that Git commit into a fresh directory (never overwrite), binds127.0.0.1, reports X-Riftwatch-Build-SHA plus/__candidate_build.json, hashes every served resource, and fails asset requests with409 if snapshot hashes change. It neither follows a branch nor launches OpenCode.

Actual Chromium Start Game at91569e2 on8012 and previous7faa21a on8013 succeeds;25/25 served resource bytes match each Git commit. Selecting the prior immutable URL is the tested local rollback path. Current Rally branch has advanced independently while the frozen91569e2 candidate remains fixed. An isolated tamper probe returns200→409/dirty=true→restored200. Initial omitted-font404 is retained and corrected by including assets. All service activity is **LOCAL_ONLY_NOT_OMGITHUB**; there is no DEPLOYED_VERIFIED result.

Repro command (run in a persistent session from QA/integration worktree):
```
python tools/qa/candidate_serve.py --commit FULL_TESTED_SHA --port FREE_LOCAL_PORT --directory /workspace/candidates/FRESH_DIRECTORY
```
Then verify manifest/hashes, start a fresh browser context, run Playwright and archive the actual SHA. Stop/switch only the isolated candidate on failure; never reset a published branch, existing#17 or user save. Later remote hosting requires explicit approval of hosting target, exact already-verified SHA, isolation and rollback. Existing pinned OmGitHub workflow accepts a branch/issue and starts a modifying OpenCode run, not a deploy-only exact-SHA contract. No Issue/workflow/#17 change was attempted or authorized here. A production/candidate publish proposal must wait for passing feature/integration gates; local success is never AFTER_DEPLOY_LIVE.

## Integration decisions and precise continuation

Reviews under docs/reviews record the diffs, checks, scope and HOLD decisions. **Both gameplay features remain unmerged.** They are not held by500/1000 performance; they are held by the actual current-scale clock/stuck failures, incomplete final-source performance and unresolved full GDD contract. Independent B/D/C/E branches may continue immediately. Only QA/strategy/evidence is eligible for the current integration update, with game files proven identical to7faa21a.

Next bounded tasks: A-PATH-02 capture state/target/route evidence for8s immobility and fix recovery; A-CLOCK-02 resolve deterministic resume/wall timers before a reviewed runtime scheduler change; E1-BOSS-02 repair registered reinforcement type and per-wave counter then run3 natural complete campaigns; A-BUDGET-02 global queued reservations/getters and a measured fair total-active policy. Update existing published feature branches using normal merges from approved integration commits, never force rebase/push. Revalidate only affected scenarios, preserving every failed baseline. Exact resume/status/source mapping is in evidence/strategy-v2/acceptance.json. No finished-ten-wave or full Phase B–E implementation claim.

Two large full Playwright screenshot traces remain local with paths/SHA-256 in evidence/strategy-v2/large-local-traces.json. Git bundles include the raw samples, HAR, state/actions, smaller feature traces, successes and failures, screenshots and hashes. Historical performance-recovery archives are unchanged.
