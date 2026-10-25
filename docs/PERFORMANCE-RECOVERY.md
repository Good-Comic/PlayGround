> Strategy v2 supersedes the historical blanket Phase B block below.500/1000 FAILs remain unchanged; they are extension goals, not current development blockers. Current gate and statuses: GAMEPLAY-ROADMAP.md and GAMEPLAY-ACCEPTANCE.md.250 is a provisional stress target, not a supported-scale claim.

# Phase A performance recovery — PERF_IN_PROGRESS

**Phase A is not released.** Functional regression PASS in bounded local scenarios; performance FAIL. No Phase B work or remote Preview update. All final repeated benchmarks, CPU profiles and browser operations used clean commit `8549065da8b727737f14a596fc104658d408ffd3`, containing gameplay source `59c852911bef17ce1376efa4970937bb8da96308`, Build ID `riftwatch-gameplay-p0.4`. Later evidence/documentation commits keep those game bytes unchanged. Remote preservation first advanced `ef5019bcb1560698f28aca25cca4fbd82da3ad7a` to checkpoint8549065 via a normal feature-branch-only push.

## Recovery and actual changes

Recovered `/workspace/riftwatch` intact. No uncommitted/untracked code at resume: previous process had completed commit59c8529. Node/profile processes had exited; only the local read-only server remained. Original `/workspace/PlayGround` checkout was not changed. Earlier commits1952997 and59c8529 preserve all optimization source. The checkpoint archives retain baseline, candidate, console errors, raw samples, CPU profiles, memory/GC and screenshots. No force push, merge, credential change, main/checkpoint rewrite, OmGitHub workspace/save write, issue/workflow dispatch or deployment.

Implemented changes based on profiles:
- Complete swept-clear direct routes avoid unnecessary A*; obstruction still uses the same FIFO/budget2 A*. Per-step static/dynamic collision, ordinary speed and all AI remain active.
- Spatial buckets and neighbour buffers are reused, numeric bucket keys and conservative distance rejection reduce allocation/math. Queue tests now force a water-wall detour:100/100 move within4.8 simulation seconds,182 actual searches, <=2/update. Open direct-route test starts1000/1000 in one update without exceeding speed.
- Cache infantry invariant torso/helmet/shield only. Continuous legs, bob, attack sword, selection, health, hit flash and particles remain live. Spark and shadow rasters preserve quantity, opacity, life and continuous size. No resolution, graphics setting, animation rate, unit count or AI reduction.
- Bake camera/viewport-keyed static terrain lighting once. Reference and optimized terrain pixels were identical at DPR1 and2. Infantry comparisons cover two teams, three scales and walk/attack phases: weighted premultiplied RGBA error2.1–8.4%, alpha coverage98.8–99.7%; side-by-side evidence retained.
- Clamp negative RAF and Game.update deltas to0; normalize smoke modulo. A retained baseline500 crash had negative arc radius and an observer RAF continuing while native game updates stopped. Regression verifies no reversed clock/nonfinite radius. Final18 loads all have native heartbeat and no page errors. This is a real correctness fix, not a performance pass inferred from an empty loop.

## Measurement audit and fixed protocol

Hardware: Intel Xeon Platinum8573C,5 visible CPUs, cgroup quota4 CPUs (`400000 100000`),32GiB memory limit; Linux6.18.55. Actual system Chromium154.0.8037.57, Playwright1.62.0, headless software rendering/SwiftShader, Canvas2D,1600x1100,DPR1. This is a cloud software-rendering measurement, not hardware-GPU certification.

Every case opens a fresh Chromium process/context. Fixed seed `phase-a-perf`, TEU/steppe, speed1, camera zoom.45, viewport/DPR/browser above;8s warmup +20s measured, three independent repetitions, rotated count order. No other game browser or heavy test runs alongside performance measurements. CPU cgroup before/after and UTC are in every result. Diagnostic profiling runs separately and is never substituted for a passing gate.

Movement:25/100/250/500/1000 standard militia, same50x50 all-grass area, zero static obstacles at all counts, same grid construction and per-unit +(.6,.6) alternating movement commands. Density rises with count as intended; obstacle density stays0. No claim that this is obstacle-rich combat. Combat:1000 ordinary guards,500v500 interleaved, standard HP/damage/armor/cooldown and actual enemy AI; both sides must advance>.15 to engage, real attacks/effects/audio retained. No invulnerability/HP inflation. All final combat samples keep1000 alive and record6828/9030/7955 attacks during measurement; this tests real combat load, but not a full campaign or casualty-heavy thousand-unit battle.

Mean = sum/N; P50/P95/P99 = nearest rank (`ceil(q*N)-1`). Three Python statistics tests pass, including recomputing original p0.3 mean/P95 exactly. Original arithmetic was correct; naming rAF intervals simply “Frame Time” was ambiguous. We retain the original gate on rAF intervals: mean<=33.3ms, P95<=50ms, >=90% moved>.15 by15s from fixture creation. Warmup does not extend the15s startup gate. Per-run pass uses unrounded values;50.10ms is FAIL. No pooling, discarded outliers or threshold lowering.

Raw rAF intervals are elapsed presentation/scheduling intervals. JS work is wall time spanning Game.update + Renderer.draw + UI.update, with components and observer cost separate. It includes synchronous browser calls, pauses and descheduling; it is not exclusive CPU time. **rAF minus JS is not GPU cost.** Trace RasterTask sums describe software worker activity with possible overlap, not isolated GPU time. Actual hardware GPU time is unavailable here. CPU sample profiles include8s warmup+20s; detailed method/GC summaries use marked20s measurement. Nested method durations must not be added together.

Simulation is variable RAF-coupled, clamped0..50ms, speed1, not a fixed-step accumulator. Slow frames can lose simulated elapsed time. Native-loop heartbeat and >=90% simulated-time progress checks expose this; they do not increase speed or hide slow frames.

## Repeated results — all failures retained

Values below are mean / P95 rAF milliseconds, per independent run. Raw P50/P99/sample counts/JS spans/latencies are in case-summary.json and archives. A scale passes only if all three runs meet every gate.

| Workload | Baseline runs | Final runs | Final gate |
|---|---|---|---|
|25 move|16.89/16.8;17.36/16.8;18.65/16.8|16.67/16.7;17.51/16.8;17.24/16.8|PASS3/3|
|100 move|18.03/16.8;17.01/16.8;18.95/33.3|16.71/16.8;16.69/16.7;20.20/33.4|PASS3/3|
|250 move|18.35/33.3;17.47/16.8;19.44/33.4|18.78/33.3;16.79/16.7;17.75/16.8|PASS3/3|
|500 move|30.93/50.0;23.63/33.4;32.41/50.1|73.53/149.9;17.08/16.8;20.06/33.4|FAIL2/3|
|1000 move|37.07/50.1;38.87/50.1;41.87/66.7|33.61/50.0;30.65/50.0;33.84/50.1|FAIL1/3|
|1000 combat|50.98/66.7;51.41/83.3;58.26/83.4|47.84/100.0;35.62/50.1;37.03/50.1|FAIL0/3|

Movement15s: baseline1000 move74.2/76.0/79.8%; final1000 move and combat100/100/100%. Median per-run rAF mean for1000 move38.87→33.61ms (-13.5%); combat51.41→37.03ms (-28.0%). These descriptive improvements do not imply acceptance. Final1000 move mean JS spans15.36/12.84/13.03ms; combat31.41/23.19/23.77ms. Combat JS span did not uniformly improve versus baseline19.73/19.94/23.37ms; the benefit must not be described as an across-the-board JS reduction.

The old100-unit35.03ms anomaly did not repeat in three fresh-browser baseline runs (17.01–18.95ms, overlapping250). The original record lacks a CPU/GC/scheduler trace, so a unique cause cannot be established. Shared-process startup, short3s warmup and host variation are hypotheses, not proven causes. Historical100 FAIL remains archived and is not retroactively changed.

Old1000 startup82% and controlled baseline74.2–79.8% are explained by unnecessary A* admission for every short unobstructed move, two searches/update and repeated order demand. Measured baseline profile:343114 pending calls vs5188 reusable-route calls; roughly983 queued units sampled. Final open-move profile:0 A* searches,0 queue waits,458000 reused routes/508000 step calls (90.2%; fresh direct routes are separate misses, not failed shared cache lookups). All1000 actually move, with normal speed/collision. There is no global shared path cache.

Baseline500 crash is retained separately: rAF16.69ms with JS sample count0 and movement0 is INVALID/FAIL, not a fast pass. A replacement valid baseline500 run32.41/P9550.1 also FAILS; no green retry substituted. Final500 first run has rAF max3999.8ms, JS span max3704.7ms and simulated progress FAIL. Its28s cgroup delta includes49 throttled periods/6.65s throttled_usec; UI/draw maxima also show long wall pauses. Throttling is observed, but cannot uniquely account for all pauses without a simultaneous diagnostic trace. Second/third500 pass; first remains FAIL. A controller invocation with an incorrect expected SHA was stopped by provenance assertion before any measurement; final-repeat/abort.json records NOT_TESTED, not a lost sample.

## Profile evidence and remaining bottlenecks

Matched detailed diagnostic summaries (not gate runs), milliseconds per observed frame:

| Method | Baseline1000 move | Final1000 move | Baseline1000 combat | Final1000 combat |
|---|---:|---:|---:|---:|
|unit update|7.25|12.53|5.30|7.88|
|unit draw|12.76|6.39|14.54|9.50|
|particles|0.003|0.001|2.93|11.77|
|crowd steer|0.34|5.78|0.15|0.13|
|acquireTarget|0|0|0.62|0.51|
|nearestPlayerTarget|0|0|0.19|1.63|

Moving all1000 rather than a small subset increases legitimate movement/crowd work. The profile identifies remaining spatial query/swept collision and combat particle submission/target scanning costs. It does not justify removing collisions or enemy AI. A* measurement searches/expanded nodes: baseline move700/1188, final move0/0; baseline combat299/308, final combat797/797, always <=2 searches/update. Baseline/final combat queue waits27999/124497 remain a limitation after new target/crowd recovery, despite all units starting promptly. FIFO and bounded admission remain in effect.

Final sprite caches: infantry move716009 hits/1miss; combat583004/2; combat sparks355049/1. High cache hit rate alone does not prove low drawImage cost. Final CPU profile still attributes7124ms sampled self time to native drawImage over the full diagnostic run; unattributed `(program)` is not labelled GPU time. The controlled rendering ablation disables only spark/shadow raster caches, retaining all game behavior. It lowers particle method time11.77→3.67ms and sampled drawImage7124→1306ms but raises measured raster-worker duration sum648→1584ms and has rAF61.39/P95100ms, JS28.28ms, a1216.6ms stall. One diagnostic ablation does not establish a net benefit; it was NOT adopted or counted toward passing performance. Full failure/profiles retained.

Economy200 diagnostic (80 finite nodes,4 kinds, normal autoEconomy): resource search79 calls/2.2ms baseline and195/2.3ms candidate; routing/return dominates, not node lookup. Game logic is identical between1952997 candidate economy profile and final59c8529 source. Gather/return method means baseline3.45/7.70ms vs candidate2.11/6.67ms; this is diagnostic evidence only, not a separate repeated economy capacity certification.

Final20s GC event duration sums: move197.11ms (103 events), combat108.99ms (31); heap before/after full run8.60→20.11MB and6.99→21.41MB. These are snapshots/event sums, not leak or exclusive pause certification. Baseline matched sums174.29/193.96ms. Final trace Layout+style sums291.39ms move,303.63ms combat; software RasterTask sums864.24/647.88ms on concurrent workers. CDP whole-run UI Layout/Style, heap and full traces are retained. Actual GPU timings and a conclusive cause for every outlier remain unavailable.

## Functional acceptance — actual browser input, AFTER_LOCAL

At actual commit8549065: Start Game, TEU/steppe, seed`riftwatch-p0-v1` (3215474622), settings speed1; real mouse selection/right-click cavalry move(32,29), worker7 ordered to wood;135 wall-second observation,152 state samples,121.19 simulated seconds. This functional run was separate from all performance trials. Local HAR verifies25/25 served resources against the Git commit. Additional real-ui suite HAR verifies50/50 including reload.

- Original death-target P0:0 stale dead-target samples;12 observed death→living retarget transitions PASS. Integration also tests three consecutive kill events and unreachable combat recovery within.05s.
- Original gathering P0: no zero-cargo stationary gather episode>=20s; observed unload cycles food24/wood33/gold18/stone8, each>=3 PASS. Integration12 workers/resource for300 simulated seconds all>=24 unloads; resource conservation error<=2.01e-9.
- Original farm/obstacle P0: cavalry reaches the requested vicinity without orderFailure PASS. Crowd24/24 real drag/right-click reach destinations10.44s, penetration0/clips0. Water-sealed narrow channel8/8 cross and arrive16.64s, max penetration.01411<=.025/clips0.
- Four UI stance clicks yield Hold/Passive/Aggressive/Defensive PASS; integration checks acquisition, retaliation/leash and manual priority. Pause→Save→Reload→Continue in a fresh disposable local context restores seed/unit count/time PASS. No existing user save modified.
- Reused completed39 Node test log on identical current source, three statistics tests, four locales653 keys each PASS. An earlier unittest discovery selected0 tests; that invocation is explicitly NOT counted.
- Console errors0, Page Errors0, failed requests0 in both browser suites and all18 final performance cases. Network HAR/HTTP statuses, snapshots, traces, operation logs, screenshots and resource verification retained. Screenshots manually inspected. This is real local-browser evidence; **no new LIVE_VERIFIED claim**.

## Three stages and deployment

BEFORE_LIVE historical online bug evidence remains retained. AFTER_LOCAL functional PASS but performance FAIL. AFTER_DEPLOY_LIVE remains **DEPLOYMENT_BLOCKED**. This round performs no OmGitHub issue creation, workflow dispatch, #17 mutation, Preview publication or user save write.

Read-only pinned-runtime investigation: push is not an OpenCode workflow trigger; the preparation code resolves an existing named branch through GitHub `/branches/{name}`, captures its SHA, then the reusable worker checks out that target_sha and creates `opencode/{run_id}`. It subsequently runs OpenCode implementation; this is not a deploy-only/byte-preserving API. A raw commit SHA in the branch selector is not a supported exact-commit input. The pinned README documents title`branch: <name>`, while the actual parser reads `<!-- omgithub-request:v1 {"branch":"..."} -->` metadata; direct GitHub title handling alone must not be assumed without verifying the App's normalization. No new issue was used to probe it.

A separate new issue/run is structurally scoped by issue number and run branch, but a guaranteed isolated deploy-only Candidate Preview, exact finished SHA preservation and zero effect on existing#17 cannot be confirmed from the current contract. No direct existing-Preview update interface was established. Per the latest request, defer a candidate deployment proposal until Phase A passes. Future authorization must explicitly cover a new isolated issue/run, accepted source ref/SHA, whether a modifying OpenCode run is allowed, and isolation verification. No such authorization is requested in this round. Phase B remains NOT_STARTED.

## Reproducibility and next bounded work

Use tools/qa/performance_audit.py with immutable clean expected-head, default8s+20s and3 repetitions; tools/qa/perf_stats.py defines unchanged gates. Archives contain raw arrays per case, source hashes, browser/hardware/cgroup state, console failures and screenshots; diagnostic archives additionally contain CPU .json profiles, timelines, GC and detailed method metrics. case-summary.json includes P50/P95/P99 and actual tested commits; trace-summaries.json identifies measurement scope and concurrency caveats. gameplay-local-executed.py records the local-only invocation using the inherited browser environment, no HOME remapping or TLS bypass. Its actions are identical to gameplay.py.

Next: profile the remaining combat drawImage/raster interaction and nearest-player scan with isolated repeated ablations; improve crowd/segment query cost without reducing behavior; diagnose long pauses with concurrent trace/cgroup observation. Keep all existing failed runs. Re-run only affected gates after meaningful source changes, then scoped regressions. Require every selected scale's three runs to meet unchanged gates, followed by separately authorized deployment and live verification before any Phase B work. No “all Phase A PASS” claim is made.

Full Playwright screenshot/snapshot trace ZIPs (~347MiB and68MiB) remain at the workspace paths/hash values in `evidence/performance-recovery/large-traces.json`; these two large ZIPs are not stored in Git. The Git archives preserve all HAR/HTTP responses, raw state samples, operation logs and selected/full scene screenshots, and all CPU profiles/GC/timeline traces. Functional HTTP summaries are26 and51 responses, all200. No historical baseline archive was rewritten.
