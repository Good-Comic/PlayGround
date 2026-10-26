# v231 hero skill-range preview slice

Status: `LOCAL_VERIFIED`, not public deployment or hardware validation.

Application source commit: `5df177bee911b8f9251248115e6128aa92b7b563`

## Changes

- `HERO_SKILLS` exports the production Mark radius `9` and Aegis radius `5`. `heroMark()` and `heroAegis()` now consume those constants instead of duplicated literals, so the preview and gameplay cannot drift apart.
- Hovering or keyboard-focusing the Mark and Aegis command buttons previews the corresponding range ellipse around the living commander. Leaving or blurring clears it.
- The commander receives a persistent gold ground ring, four direction ticks, and a small sigil so the hero remains identifiable in a crowd.
- Save-restore, hero death, and selection changes clear stale preview state.

No damage, cooldown, shield, hero-stat, or target-selection balance was changed.

## Verification

- `node --test tests/*.test.mjs`: 109/109 PASS, including four new hero preview/range tests.
- Four locales (`en`, `zh-Hant`, `zh-Hans`, `ja`) retain 678 keys each with no missing or extra keys.
- Immutable artifact built from `5df177b`: 28 payload files, clean metadata, `PLAYTEST-EXPERIMENTAL`.
- `node tools/qa/v231_hero_skill_browser.mjs --url http://127.0.0.1:8020/ --out ... --commit 5df177bee911b8f9251248115e6128aa92b7b563`: 8/8 LOCAL PASS.
  - Served artifact commit and cleanliness matched.
  - Living commander selected with both skill commands.
  - Mark hover previewed radius `9`; Aegis hover and focus previewed radius `5`.
  - Pointer leave and blur cleared the preview.
  - Executing Aegis still set its 60s cooldown and shielded five allies inside radius `5`.
  - Console, Page, and failed-request errors: 0.
- Screenshots: `mark-preview.png`, `aegis-preview.png`.

Raw browser result: `browser-checks.json`.

## Known discrepancies retained

- The recovered GDD snapshot lists different hero base stats and Aegis radius `4`; production is unchanged by this cosmetic/preview slice. That balance question remains a specification decision, not silently rewritten here.
- The natural wave-end Rift Prototype crash remains `NOT_REPRODUCED`.
- Production low-FPS simulation-time loss and strict Save/Load determinism failure remain open.
- Historical performance FAIL and `HARDWARE_TEST_PENDING` remain.

## Limits

- Local Chromium/SwiftShader evidence only; no OmGitHub online acceptance, public SHA, or physical GPU claim.
- The hero distinction is a procedural ground marker, not a new character sprite or audio pass.
