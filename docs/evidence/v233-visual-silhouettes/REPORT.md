# v2.3.3 battlefield silhouette slice

Application source `d989bb7236cb7e6bc4bee6892ff0fae9196bc2da` adds balance-neutral silhouettes for eight representative battlefield roles. The ordinary archer, javelin-and-buckler skirmisher and repeating-crossbow Chu Ko Nu now use different weapons; militia and the crested, kite-shield heavy guard differ; knight, light cavalry and horse archer now carry sword, spear/pennant and bow respectively. No stats, AI, collision, economy, RNG, locale or save schema changed.

Validation is `AFTER_LOCAL`: 113/113 Node tests pass. A fresh immutable 28-file artifact from the exact source SHA passed 4/4 real Chromium checks: matching runtime Build SHA and all resource hashes, eight distinct raster samples using production `spawnUnit` and renderer code, a real cavalry move, and zero Console/Page/failed-request errors. The gallery fixture is explicit and is not a natural campaign or online Preview test. The actual Chromium screenshot is `battlefield-silhouettes.png`; positions from top to bottom are archer/skirmisher/Chu Ko Nu, militia/guard, then knight/light cavalry/horse archer.

OmGitHub #18 remains unavailable and this branch was not published. Low-FPS simulation loss, strict Save/Load nondeterminism, historical performance FAIL, the natural Rift Prototype crash gap and `HARDWARE_TEST_PENDING` remain unchanged.
