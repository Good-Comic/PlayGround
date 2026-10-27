# v2.4 external Sprite Atlas recovery acceptance

Status: `LOCAL_VERIFIED`; application source `39767c4b58a37353b4f51bea13bd451a614fb2fc`.

The prior environment disappeared before its final four local commits could be pushed. The complete atlas implementation was already remote at `18d9947a14ab5aa4eaf6a023545df29bee4a7bcf`; this recovery rebuilt its sole missing source adjustment, changing descriptor scale from 1.05 to 0.78, as a normal fast-forward commit. The unrecoverable local SHA `870cbd3...` is not claimed as preserved.

The repository-owned 1024×320 militia SVG and replaceable descriptor provide eight directions, idle/walk/attack/hit/death, two frames, FPS/loop rules, dimensions, anchor, offset and scale. A failed image load retains the procedural Canvas path. Collision, navigation, movement speed, attack cadence, damage, RNG and balance are unchanged.

Verification: focused Node regression 20/20 PASS; quota-override guard 8/8 PASS; exact 31-file artifact Chromium 6/6 PASS. Chromium loaded the external asset, rendered eight distinct directions and five distinct states, exercised fallback, and produced no Console, Page or request failure. `sprite-atlas.webm` is a real headless Chromium recording after the real Start flow and a labelled controlled animation fixture. This is `AFTER_LOCAL`, not public deployment or natural ten-wave acceptance.

Known low-FPS clock, strict Save/Load determinism, historical performance, natural Rift crash reproduction, ten-wave stability and hardware validation remain open.
