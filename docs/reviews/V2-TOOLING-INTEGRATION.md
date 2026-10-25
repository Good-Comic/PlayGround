# v2 tooling-only integration review — approved scoped merge

Scope: roadmap/requirements/acceptance/evidence, tiered sampler, clock evaluation only, exact-SHA local snapshot server and DOM-input probes. All production index/styles/js/assets are byte-identical to protected7faa21a on the QA branch. No production scheduler replacement or gameplay feature is included in this merge.

Checks:43 Node tests/4 locales653 keys; current prototype4 cases with strict Save/Load determinism explicitly FAIL; actual candidates each25/25 served hashes, native Start Game, full-SHA/rollback/integrity409; input9 fresh-browser trials; raw tiered failures/clock-window caveats retained. No local-to-online promotion. Existing BEFORE_LIVE/AFTER_LOCAL evidence may be reused for unchanged game bytes; this approval does not turn underlying current-scale failures green.

B1/B2 reviews both HOLD. Their code is not part of this merge. This is agent self-review, not an independent human/game-balance review. Permit only normal merge into codex/riftwatch-gameplay-integration and explicit branch pushes; main/checkpoints/#17 untouched.
