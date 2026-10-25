# Gameplay handoff — P0 milestone 1

Implementation commit: `6b17befb18b8707dbd2fb2a767cb079c37d807a4` on `codex/riftwatch-gameplay-improvement`.
Build ID: `riftwatch-gameplay-p0.1`. The subsequent documentation commit changes no game resources.

## Exact acceptance status

- BEFORE_LIVE: **LIVE_VERIFIED** using the real Issue #17 iframe. Captured 22 resources; 21 matched source Commit `914016dae8a7eb131b7e06c49a36c6a3276247d0`; HTML differed due to hosting. Source checkpoint `6476a4b` has the same tree.
- AFTER_LOCAL: **LOCAL_VERIFIED**, not a deployed game. Tested a clean implementation commit with `/__qa_build.json`; all 24 captured game resources match the implementation Git tree byte-for-byte.
- AFTER_DEPLOY_LIVE: **DEPLOYMENT_BLOCKED / NOT_TESTED**. No Preview deployment or GitHub mutation was performed.
- Phase A: **PARTIAL**. The observed P0 regressions have local evidence; the full Phase A acceptance list is not complete. Do not start large Phase B–E extensions before finishing the outstanding Phase A items in GAMEPLAY-REQUIREMENTS.md.

## Paired browser results

Identical inputs: seed text `riftwatch-p0-v1` / numeric `3215474622`, TEU, steppe, speed 1. Real menu/start/mouse operations, isolated contexts. Both runs lasted 135 wall-clock seconds; actual simulation times differ because replay determinism and exact frame timing are not implemented.

| Observation | Original online Preview | Committed local build |
|---|---|---|
| Samples | 135 | 161 |
| Last simulation time | 111.28s | 136.92s |
| Dead-target samples | 56 | 1 transient sample; next sample at +0.75s had target cleared and unit idle |
| Zero-cargo stationary gathering >20s | Workers #9/#14/#24; up to 81.4s | None observed |
| Cavalry completes blocked-endpoint move | No | Yes |
| Observed deposits: wood/gold/stone/food | 27/12/6/8 | 53/18/12/26 |
| Page errors | 0 | 0 |

The deposit counts are observations over different simulation durations, not a balance benchmark. Synthetic conservation tests additionally verify exactly-once credit for four resources over at least three cycles. One local dead-reference observation can occur after a kill late in a frame; dispatch clears it on the next player update, proven by unit test. It is not the sustained original dead-target lock, and must not be reported as zero observations.

23 Node unit/integration tests pass. Syntax checks pass for 21 JS/MJS files. Locale validation passes for all four locales with 653 keys. Browser smoke verifies the hero's stance button can cycle all four stances at desktop/laptop/tablet/mobile viewport sizes (1600×1100, 1366×768, 1024×768, 390×844), with no horizontal overflow. This is limited UI coverage, not full D4 or native LQA acceptance.

Final local Console errors, Page Errors and failed requests are empty. The original live page's external Google Fonts and Cloudflare analytics requests fail under current networking, but game assets load. No new allowlist entries were added.

## Evidence

Artifacts are outside Git under `/workspace/diagnostics/riftwatch/`:

- `before-live/`: original online screenshots, `evidence.json`, `network.har`, `trace.zip`, `version-comparison.json`.
- `after-local/`: committed build screenshots, `evidence.json`, `network.har`, `trace.zip`, `summary.json`, `version-comparison.json`.
- `after-local-draft/`: deliberately retained FAILED first candidate. It showed grid-only interaction endpoints could miss a narrow harvest position. Do not use it as passing evidence.
- `ui/`: reproducible `check.py`, result.json, stance and viewport screenshots. The first attempt selected the occluding town center at the hero's foot; the successful test uses the existing Tab hero-selection shortcut. Sprite/selection occlusion remains a separate usability finding.

Small machine-readable comparison is committed as GAMEPLAY-EVIDENCE.json; screenshots/traces remain external to avoid repository bloat.

## Next precise work

1. Finish A1 crowd separation/local unit avoidance and opposing narrow-passage traffic. Current A* handles static obstacles, not a complete crowd solver. Validate fairness of the per-update two-search admission limit at scale; 1000-unit performance remains NOT_TESTED.
2. Complete unreachable combat-target recovery, Guard/Attack-Move/stance interaction acceptance and broader multi-seed/all-biome endurance. Mixed villager/military command panels still inherit a six-button limit; verify stance access in mixed selections before claiming universal UI coverage.
3. Extend economy load/migration, congestion and long-run regression coverage. Preserve resource conservation and the existing director/ten-wave game.
4. Only after the remaining Phase A acceptance, implement B1 using existing building.rally, then B2/B3. Other roadmap items remain NOT_STARTED, not silently completed.
5. An authorized operator must deploy this branch through a supported mechanism before AFTER_DEPLOY_LIVE. Confirm the actual served commit and run the same scenario; do not substitute localhost or GitHub source inference.

No push, merge, force push, main/checkpoint rewrite, OmGitHub Continue/Publish, existing-save access, or online deployment was performed. Original working checkout remains clean and unchanged.
