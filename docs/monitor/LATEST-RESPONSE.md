# V231 hero skill preview

Branch `codex/riftwatch-v231-hero-skill-preview` is pushed at `149f063e37fb68bf02e97535a389f4ef01210ad4`; application source and immutable artifact are `5df177bee911b8f9251248115e6128aa92b7b563` on required preflight base `45435a323c729a28da1de454a3e53740fc9159f2`.

## Result

`LOCAL_VERIFIED`: Mark radius 9 and Aegis radius 5 now come from one `HERO_SKILLS` source used by both gameplay and the hover/focus range preview. The commander also has a persistent gold ground ring, four ticks, and a small sigil. Range preview clears on pointer leave, blur, hero death, save-restore, and selection change.

## Evidence

- 109/109 full Node tests, including four new preview/range tests.
- Four locales retain 678 keys each with no missing or extra keys.
- 8/8 real local Chromium checks against the clean 28-file artifact: exact commit, Mark radius 9, Aegis radius 5, focus/leave/blur behavior, Aegis execution still shields five allies, and zero Console/Page/request errors.
- Report: `docs/evidence/v231-hero-skill-preview/REPORT.md`; raw result: `browser-checks.json`; screenshots `mark-preview.png` and `aegis-preview.png`.
- Recovery snapshot: `docs/recovery/v231/WORKTREE-RECOVERY.md`.

## Not claimed

This is not OmGitHub online acceptance, public deployment, physical-GPU validation, or a balance change. The natural wave-end Rift Prototype crash is still `NOT_REPRODUCED`. Production low-FPS simulation-time loss, strict Save/Load determinism failure, historical performance FAIL, and `HARDWARE_TEST_PENDING` remain.

## Decision needed

The recovered GDD lists hero base stats and Aegis radius 4 that differ from production. Production was intentionally left unchanged; please decide whether to align balance in a later slice.

## Next

Record a natural wave-end Rift Prototype offer with seed, state, browser errors, and input sequence. Then continue hero art/audio and the inherited simulation-integrity research.