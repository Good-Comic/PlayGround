# Landmark materials: scoped visual acceptance and performance findings

Application tested: `d07e4f1634d730a163f607800d1ed9a305ebedef`.
Final equivalent application: `9fc6db69227432b162651017819e23cbd4b9153f` (all payload Git blobs identical; PAYLOAD-EQUIVALENCE.json).
Status: visual/state `LOCAL_VERIFIED`; performance `FAIL / QA_NOT_ACCEPTED`. No public deployment or formal Gameplay Integration.

## Actual failure and minimal correction

The exact original `ffc201ee65fe8251dcd431c2860c1d13defa4d33` artifact rendered new masonry/arches as vertical badges sitting on the roof. Its automated state checks passed, but direct screenshot review failed placement quality. Original TEU/SAR captures and raw browser results are retained. The repair projects the same material onto both actual isometric wall planes and clips it to the wall boundary. It changes renderer.js only, including correcting the existing military type spelling to `range`. No footprint, collision, resource cost, production, navigation or combat data changed.

## Real Chromium evidence

The browser used actual Start Game followed by an explicitly labelled CONTROLLED_FIXTURE. Five 1920x1080 captures each contain house and barracks in foundation (20%), scaffold (70%), complete, damaged (60% HP), critical (25%) and permanent dead-rubble states. Four units provide front/rear overlap. Direct image review confirmed material placement, visible architecture cues and retained cracks/fire/ruins; see VISUAL-REVIEW.json. Shared red roofs and base building masses remain; this does not certify completely unique buildings for sixteen civilizations.

The 33-file exact artifact passed 10/10 automated browser checks: five family/state matrices, invariant dimensions/cost/health, native depth ordering, dead-ruin snapshot/restore and zero Console/Page/HTTP/failed-request errors. The affected Node suite passes 7/7, including a new projected-wall clipping regression. Actual recording: fixed/landmark-gallery.webm. There is no shared live browser capability. These are AFTER_LOCAL results, not natural play or public HTTPS acceptance.

## Basic mixed rendering comparison — not passed performance acceptance

Same Seed LANDMARK-240, 100 units, 24 buildings, paused simulation but normal native rendering/UI, 1920x1080 DPR1, Chromium154/ANGLE SwiftShader. Intel Xeon Platinum8573C, 5 visible logical CPUs, cgroup quota4 CPUs, memory limit32GiB. Three fresh browser runs per version, serial, 3s warm-up +15s sampling. Samples are sparse (27–31 intervals per run) because of severe baseline frame stalls. Raw samples and nearest-rank P50/P95/P99 are retained in performance/summary.json and per-run browser.json.

| Version | Mean native frame interval, runs (ms) | Mean synchronous renderer JS, runs (ms) |
|---|---|---|
| Before `51e56d9` | 482.69 / 518.71 / 475.19 | 12.25 / 12.41 / 13.89 |
| Projected materials `d07e4f1` | 528.21 / 469.68 / 552.10 | 15.06 / 13.21 / 18.75 |

Median run mean: native intervals +9.4%, renderer JS +21.4% (+2.65ms). Every run FAILS the original mean≤33.3ms/P95≤50ms gate. We cannot confirm no material overhead; this remains a renderer-cost concern. The interval gap is not attributed to GPU alone: UI, scheduling and compositor costs are not isolated. This paused render scenario does not measure movement completion, real combat, simulation correctness or hardware FPS.

A static-pattern cache was then tested with three independent runs and a full five-family gallery. It raised median renderer JS to17.43ms, so it was rejected and normally reverted. Raw cache-experiment failures remain in performance-cache-rejected/. An initial collector expecting240 draws could not collect enough in15s; the failed collector result is preserved in performance/initial-incomplete-sample/. Measurement completion is never labelled FPS PASS.

## Next work

Do not expand more pure art. Keep this visual repair checkpointed with performance qualification. Prioritize a small pre-game rules query slice, then Seed/terrain accessibility and natural campaign evidence before disputed difficulty or New Game+ balance changes. Existing low-FPS clock, strict Save/Load determinism, historical performance FAIL, natural Rift Prototype crash NOT_REPRODUCED, ten-wave and HARDWARE_TEST_PENDING remain open.
