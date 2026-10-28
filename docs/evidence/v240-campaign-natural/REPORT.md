# Natural campaign evidence — incomplete milestone

## Policy V1: NATURAL_DEFEAT

Game source da97f86f0e3677419f1d58b705b0952dc1beeeae; native Chromium Start, TEU/steppe Seed MILESTONE-NORMAL, existing standard Normal rules, supported 1.5x user setting, both production aids enabled. Legal UI script only; no injected resources, damage, units, waves, boons or elapsed time. Source harness version in b0be3175b738705207b2e00ff61e67cd24575255 tools/qa/natural_campaign.mjs.

Observed first four waves completed and four real card selections; defeated on wave5 when Town Center was destroyed. 502.937 real seconds, 692.28765 game-reported simulation seconds; these values do not establish simulation-time correctness. 87 logged UI actions, zero recorded Console/Page/request errors. Army commands were insufficient: left-side production stayed separated from eastern resources, villagers were all lost before the Boss wave. This is a failed policy attempt, not proof of impossibility or a newly diagnosed engine bug. No claim of natural Rift Prototype reproduction or ten-wave/NG+ end-to-end PASS.

policy-v1/result.json and events.jsonl retain state and commands; actual final screenshot and continuous campaign.mp4 show the loss. MP4 is a transcoding of the original Playwright WebM, not an image sequence. Original WebM retained outside Git in the execution diagnostics while available. A second legal policy may add native army Attack-Move and Rally commands; do not compare it as an unchanged-policy run.

All prior simulation-clock, strict SaveLoad determinism, landmark performance FAIL and HARDWARE_TEST_PENDING remain open. New Game+ functional fixture evidence must be separated from natural campaign evidence.

## Policy V2: HARNESS_INCOMPLETE at wave4

Game5f63a939f64f3d3d40c66abfd4af655732dae7b0; tool c40e42f57bc1c23258cba59c8f463530b44dfd74 (native Attack-Move and Rally). No game errors. An unstable build:range button timed out during a hero cooldown UI rebuild. Raw error/state/action evidence retained in policy-v2/. This sample cannot establish a campaign win/loss. A separate native reproduction verified unnecessary worker command-grid replacement, fixed in dc48b7c; see v240-command-stability.

PolicyV3 uses the same normal combat/economy rules with manual paid archer production and farms instead of the automatic spearman priority. Scoped transient UI timeouts are logged/skipped, not force-clicked or treated as successful actions; full run snapshots are exported for safe checkpointing. This is a different player strategy cohort, not an unchanged-policy rerun.
