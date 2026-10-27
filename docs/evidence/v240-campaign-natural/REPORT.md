# Natural campaign evidence — incomplete milestone

## Policy V1: NATURAL_DEFEAT

Game source da97f86f0e3677419f1d58b705b0952dc1beeeae; native Chromium Start, TEU/steppe Seed MILESTONE-NORMAL, existing standard Normal rules, supported 1.5x user setting, both production aids enabled. Legal UI script only; no injected resources, damage, units, waves, boons or elapsed time. Source harness version in b0be3175b738705207b2e00ff61e67cd24575255 tools/qa/natural_campaign.mjs.

Observed first four waves completed and four real card selections; defeated on wave5 when Town Center was destroyed. 502.937 real seconds, 692.28765 game-reported simulation seconds; these values do not establish simulation-time correctness. 87 logged UI actions, zero recorded Console/Page/request errors. Army commands were insufficient: left-side production stayed separated from eastern resources, villagers were all lost before the Boss wave. This is a failed policy attempt, not proof of impossibility or a newly diagnosed engine bug. No claim of natural Rift Prototype reproduction or ten-wave/NG+ end-to-end PASS.

policy-v1/result.json and events.jsonl retain state and commands; actual final screenshot and continuous campaign.mp4 show the loss. MP4 is a transcoding of the original Playwright WebM, not an image sequence. Original WebM retained outside Git in the execution diagnostics while available. A second legal policy may add native army Attack-Move and Rally commands; do not compare it as an unchanged-policy run.

All prior simulation-clock, strict SaveLoad determinism, landmark performance FAIL and HARDWARE_TEST_PENDING remain open. New Game+ functional fixture evidence must be separated from natural campaign evidence.
