# Pre-game rules query: gameplay slice

Application source: `5ded54f43212116bdf966b537796849325c295bf`.
Status: `LOCAL_VERIFIED`, `AFTER_LOCAL`. No public deployment or full-campaign acceptance.

A real menu button now opens an accessible, localized native dialog explaining the selected civilization and terrain, editable Seed, existing ten-wave campaign and Boss waves5/10, economy population, civilization military limit/building capacity, current game speed and automatic assistance. It uses existing production data and settings; no difficulty, balance or simulation values changed. Enter inside the modal is isolated from the main menu Start shortcut; native Escape and the Close button work. The existing fixed-English Start Game exception remains.

## Verification

- 46/46 targeted tests PASS, including rules vs actual Game state across FRK/TEU/CHN/AZT, snapshot/RNG non-mutation, Seed compatibility, UI scale, combat/retarget/stances, gathering/deposit, tactical orders and Rally.
- Four-language validation: 692 keys per locale PASS.
- Exact 33-file artifact: 17/17 real Chromium checks PASS.
- Four locales were inspected at1280x720 and130% text; dialog stays within viewport without horizontal overflow.
- The query preserves the existing run snapshot/RNG (wall-clock export timestamp excluded).
- FRK correctly shows military limit40; switching to TEU removes that civilization-specific cap and describes building capacity.
- Actual Start with selected TEU/steppe/Seed RULES-NATURAL, actual militia selection, right-click move to32,29 (production arrival condition within2.5), native Pause/Save/Reload/Continue and downloaded Bug JSON all executed. No resources, enemies, unit positions or wave state were injected. This is a short natural UI smoke, not a first-wave or ten-wave completion claim.
- Console/Page/HTTP/request errors:0.
- `setup-rules.webm` is actual Chromium video. `rules-*.png` and `natural-game.png` are real captures.

An initial harness falsely matched the literal English word “rules.” as an untranslated key. Its failure JSON is retained under initial-harness. The corrected check targets actual key patterns; no game change was needed. An initial Node assertion also compared snapshot.savedAt wall-clock metadata; it was corrected to compare simulation data and RNG, excluding only savedAt.

## Performance and remaining work

This slice adds no per-frame render/update/DOM work, no images or network services, and no game-state fields. Rows are created only on explicit menu interaction. The production main-loop change is one keydown modal guard. It does not fix or erase the landmark/cloud performance failure, low-FPS clock loss, strict Save/Load nondeterminism, natural Rift crash reproduction, hardware or natural ten-wave gaps.

Next priorities: Seed/terrain route accessibility, then natural campaign and spec-backed difficulty/Boss changes. No further pure-art expansion is queued. New Game+ requires a clear limited inheritance specification before changing core rules.
