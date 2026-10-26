# Strategy v2.3.0 player-control slice

Status: `LOCAL_VERIFIED` for input, Rally Point, and same-type selection. The Rift Prototype crash remains `NOT_REPRODUCED`; the controlled boon path passes but does not replace the missing natural-wave reproduction.

Source commit: `d92641dc73e1ea85c4ab585dcecab72cc6f43a82`

## Changes

- Plain `A` continues WASD camera movement even while military units are selected. `Shift+A` arms Attack-Move; `G` and `P` retain Guard and Patrol.
- Trained units choose the production-building exit that faces the active Rally Point, rather than starting from a random side and visibly reversing direction.
- A native Canvas double-click selects all living allied units of the clicked type that are currently on screen. Shift-double-click adds them to the current selection.
- All four locale hints describe the new `Shift+A/G/P` input accurately.

## Verification

- `node --test tests/rally.test.mjs tests/same-type-selection.test.mjs tests/tactical-orders.test.mjs tests/control-group-ui.test.mjs`: 20/20 PASS.
- `node scripts/validate-locales.mjs`: four locales, 678 keys each, PASS.
- Real local Chromium against the immutable 28-file artifact built from the source commit: 7/7 checks PASS.
  - Canvas double-click selected both visible militia and no other unit type.
  - Holding `A` moved camera target X from `-64` to `-289.855962754442` while military units remained selected and did not arm an order.
  - `Shift+A` armed Attack-Move.
  - Native barracks selection, right-click Rally Point, and UI training produced a militia on the Rally-facing side (`dot=16.56189083929089`).
  - Selecting and claiming Rift Prototype through the real boon UI produced a living 300 HP prototype and returned to prep.
  - Console errors: 0; Page errors: 0; failed requests: 0.

Raw browser result: `browser.json`. Screenshot: `rift-prototype.png`.

## Rift Prototype finding

The pre-change source at `80bec7a68cb0f822b3071642dc02bd9ff3964750` also completed the controlled Rift Prototype UI path without a crash (`prototype-baseline.json`). This proves the simple claim/spawn/render path is healthy in Chromium. It does not explain the player's reported crash, which may require the original wave, carried state, civilization, map seed, or browser conditions. The report therefore stays open; the next reproduction must exercise a natural wave-end boon state and retain any Page Error, Console error, state snapshot, seed, and exact action sequence.

## Limits

- `AFTER_LOCAL`, not public deployment or hardware validation.
- The Rift Prototype setup uses a controlled boon offer but clicks the real UI and executes the production `chooseBoon` path.
- No full campaign, broad performance, or public Pages rerun was needed for this input-focused source change.
