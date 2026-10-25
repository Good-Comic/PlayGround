# Strategy v2.2 continuity

## A3-BOSS-ID-01 — deterministic reinforcement repair

Branch `codex/riftwatch-v22-boss`, based on preserved integration d778cf2d8157edd9716b4790bcd29e00e967579f. Earlier B1/B2 branches and all historical failures are retained; neither feature is silently merged. No main/checkpoint/OmGitHub/workflow change.

Recovered Issue8 §§5.1/5.4 specifies M-family infantry, four per extension,30s interval,max3. Runtime called nonexistent unit ID `M`, so no reinforcements appeared. Use registered `militia` (family M), ordinary spawn/terrain/combat/event rules. Reset per-wave extension flags so wave5 cannot consume wave10's rounds. Tests require4/8/12 at150/180/210, no duplicate/4th round, legal hostile movement targets, fresh wave reset and consumed-round Save/Load.

48 Node tests and existing statistics/locales validation pass; exact transcripts accompany this source checkpoint. Browser acceptance and performance impact are PENDING, not a release claim. Synthetic clock-jump fixtures must never be labelled natural campaign play.

## Recovered specifications and unresolved rules

`gdd/SOURCES.json` records read-only GitHub issue snapshots and content hashes. Issue8/11 contain authoritative relevant chapters; Issue14 references an embedded full package but its visible body does not contain that package. Full package remains SPEC_PACKAGE_INCOMPLETE. Auditing all fetched heads and reachable object path names did not locate the named repository spec files; this does not claim the repository never contained any GDD.

Known rules: starting military40, economic60, two initial houses granting10 each; Franks military40; wave5/10 military ceilings150/240. Existing missing population getters/global queue admission are deterministic defects. How to derive initial40 from current core10, monument15 legacy contribution, exact ceiling transition timing and Gothic flat0.5-vs-multiplier behavior require explicit source/decision records before balance changes. SPEC_DECISION_REQUIRED for unresolved details. This Boss slice does not rebalance these systems or remove legacy phase summons. Other Boss skill/stat/budget discrepancies remain open.

## Acceptance policy

Cloud/SwiftShader is regression evidence, never Mid-End hardware acceptance. HARDWARE_TEST_PENDING until a real Windows Chrome/Edge result exists. Simulation integrity is an independent gate; old >=90% progress checks remain historical observations, not proof of clock correctness. No production fixed-step replacement is authorized by merely passing an isolated prototype.

AFTER_DEPLOY_LIVE remains DEPLOYMENT_BLOCKED. Candidate design only; no new Issue/workflow or change to #17. Next: actual browser Boss evidence, independent population admission slice, persistent-stuck/time diagnostics, then B1/B2 quality retests and gated integration. Preserve every failure and checkpoint each slice.
