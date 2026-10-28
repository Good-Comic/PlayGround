# Natural campaign evidence — incomplete milestone

## Policy V1: NATURAL_DEFEAT

Game source da97f86f0e3677419f1d58b705b0952dc1beeeae; native Chromium Start, TEU/steppe Seed MILESTONE-NORMAL, existing standard Normal rules, supported 1.5x user setting, both production aids enabled. Legal UI script only; no injected resources, damage, units, waves, boons or elapsed time. Source harness version in b0be3175b738705207b2e00ff61e67cd24575255 tools/qa/natural_campaign.mjs.

Observed first four waves completed and four real card selections; defeated on wave5 when Town Center was destroyed. 502.937 real seconds, 692.28765 game-reported simulation seconds; these values do not establish simulation-time correctness. 87 logged UI actions, zero recorded Console/Page/request errors. Army commands were insufficient: left-side production stayed separated from eastern resources, villagers were all lost before the Boss wave. This is a failed policy attempt, not proof of impossibility or a newly diagnosed engine bug. No claim of natural Rift Prototype reproduction or ten-wave/NG+ end-to-end PASS.

policy-v1/result.json and events.jsonl retain state and commands; actual final screenshot and continuous campaign.mp4 show the loss. MP4 is a transcoding of the original Playwright WebM, not an image sequence. Original WebM retained outside Git in the execution diagnostics while available. A second legal policy may add native army Attack-Move and Rally commands; do not compare it as an unchanged-policy run.

All prior simulation-clock, strict SaveLoad determinism, landmark performance FAIL and HARDWARE_TEST_PENDING remain open. New Game+ functional fixture evidence must be separated from natural campaign evidence.

## Policy V2: HARNESS_INCOMPLETE at wave4

Game5f63a939f64f3d3d40c66abfd4af655732dae7b0; tool c40e42f57bc1c23258cba59c8f463530b44dfd74 (native Attack-Move and Rally). No game errors. An unstable build:range button timed out during a hero cooldown UI rebuild. Raw error/state/action evidence retained in policy-v2/. This sample cannot establish a campaign win/loss. A separate native reproduction verified unnecessary worker command-grid replacement, fixed in dc48b7c; see v240-command-stability.

PolicyV3 uses the same normal combat/economy rules with manual paid archer production and farms instead of the automatic spearman priority. Scoped transient UI timeouts are logged/skipped, not force-clicked or treated as successful actions; full run snapshots are exported for safe checkpointing. This is a different player strategy cohort, not an unchanged-policy rerun.

## Policy V3: NATURAL_DEFEAT wave4

Game815557d007a50fcb47e4c35af2b33f1237c8743b; policy tool495af0ac5767366bd1dd39c1c4baa717981a922e. Manual paid archer production and farms, native worker training aid/army defense, zero game errors. 366.673 wall seconds,534.62535 reported simulation seconds; defeated on wave4. Raw state/actions, actual final screenshot, complete transcoded recording and full snapshot are in policy-v3/.

Review found a policy error shared by V1–V3: it arbitrarily waited for600 food before technology, although actual age2 cost is200 food/100gold. No completed technology progression was exercised in those defeats. Do not infer impossibility or engine imbalance from these runs. Preserve them as real failed strategies, not ten-wave PASS or a controlled test exception.

V4 reads actual ageCost and research state, prioritizes affordable native technology, keeps Normal unchanged, manually assigns idle workers/withdraws threatened workers through actual right-click commands, and disables food-consuming worker automation at12. These are player policy changes, not game-stat or clock injection. Full campaign remains pending until an actual victory is recorded. The steward's previously misleading house-maintenance label was corrected in all four locales; behavior/costs unchanged.

## Policy V4: NATURAL_DEFEAT wave4 despite real age2 progression

Game a5a538d287b9c29951a83ebede5431db9fce7dc7, tool from the same commit. Normal TEU/steppe, same Seed. Actual native technology research reached age2, unlike V1–V3. Actual worker withdrawal/idle assignment, paid ranged/melee production and same legal controls. Defeated wave4 at reported simulation538.12005 seconds; zero game errors. Full state/actions, final screenshot, continuous compressed recording, observed final snapshot and SHA256 receipt in policy-v4/.

A safe-stop file was issued near the execution-window boundary, but the final result shows defeat had already occurred. Do NOT call this a bounded interrupted living campaign or resume its dead snapshot as if still alive. The snapshot preserves failure diagnosis only. Next task is targeted analysis/manual competent strategy, not pretending the last save completes the campaign. None of the recorded boon choices offered Rift Prototype, so its natural crash trigger is still NOT_REPRODUCED, not cleared.

No cohort passed ten waves. Three failed strategies plus a harness-incomplete sample are not proof that Normal is impossible; camera/selection limitations, composition, worker protection and incomplete higher technology remain policy limitations. Do not change Normal statistics or erase failures merely to make an automated run win. Preserve source-specific cohorts and obtain gameplay evidence before balance decisions.
