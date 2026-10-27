# Riftwatch v234 Candidate acceptance

Status: `PLAYTEST-EXPERIMENTAL`, `LOCAL_VERIFIED`, `DEPLOYMENT_BLOCKED_AWAITING_EXPLICIT_V234_PAGES_APPROVAL`.

## Candidate

- Branch: `codex/riftwatch-playtest-v234`
- Build SHA: `34873f76e8ad88d1f238210cfea87ff12f0fa587`
- Gameplay predecessor: `055fb12c92e3d48945315937058f1423b732241c`
- Difference from the predecessor: only `KNOWN-ISSUES.md` and its generated HTML changed inside the 28-file payload; all 26 other payload hashes are identical.
- Artifact: `docs/playtest/v234/Riftwatch-v234-34873f7.zip`
- Artifact ZIP SHA-256: `6553da1178ede1cb0af4539b0851f617a2753082c978d4f05d26e3bf266b1b90`
- Canonical 28-payload-file manifest SHA-256: `3db2378a3c9fc6d986135213ef45a5e20ce3af46e419065c7cc0e95123cde71e`
- Hosting files: 31 (28 payload files, two metadata aliases, one `.nojekyll`).

## Dependency audit

The requested gameplay work is already a linear, conflict-free chain: input/Rally/double-click, hero range preview, Rift Prototype cue, dynamic score/SFX, and silhouettes all precede the Build SHA. No competing branch was merged and no other Agent result was overwritten. The full commit chain is recorded in `docs/playtest/v234/CHANGELOG.md`.

## Verification

### Full Node regression

`113/113 PASS` on predecessor `055fb12c92e3d48945315937058f1423b732241c`. The only following source change is the candidate disclosure Markdown; application JS, HTML, CSS, fonts, and all tests are byte-identical. The original output is `full-node.log.txt`.

### Real local Chromium on the exact v234 Build SHA

- 12/12 artifact/playtest checks PASS: exact SHA and 28 hashes, full SHA display, Start, real villager selection, house construction, Town Center training, isolated Save/reload/Continue, four locales, Bug JSON, and zero Console/Page/request failures.
- 7/7 player-control checks PASS: same-type double-click, A camera pan, Shift+A, Rally Point, Rally-facing trained unit, and controlled Rift Prototype claim/spawn; zero browser errors.
- 9/9 hero checks PASS: exact artifact, Mark radius 9, Aegis radius 5 on hover/focus, preview clearing, and live Aegis effect; zero browser errors.
- 4/4 visual checks PASS: exact artifact, eight distinct production silhouettes, live cavalry movement, and zero browser/request errors.

The exact preceding gameplay payload also has official OmGitHub worker public-HTTPS evidence: 22/22 PASS, including dynamic BGM recordings, key SFX, natural first wave, and the same gameplay operations. It is treated as source-pinned upstream evidence rather than a v234 public deployment.

## Version comparison

Compared with public v228 `ab56a5b824fabc5e123cf33e912d11bd3c625911`, v234 adds the Game First input, Rally exit, double-click, hero range, Rift cue, dynamic score/SFX, and unit silhouette work listed in the changelog. Existing D6 and v228 immutable directories remain untouched.

## Known issues retained

- Low-FPS simulation time loss remains `SIMULATION_INTEGRITY_BLOCKED`.
- Basic Save/Load passes; strict deterministic continuation remains FAIL.
- Historical performance FAIL results remain unchanged.
- Natural Rift Prototype crash remains `NOT_REPRODUCED`.
- `HARDWARE_TEST_PENDING` remains.
- Full natural ten-wave stability is not certified.

No public Pages branch, root index, `CURRENT.json`, Pages configuration, main, Issue #17/#18, or OpenCode checkpoint was changed.
