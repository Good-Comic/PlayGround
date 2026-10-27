# v2.4 generated and editable Seed setup

Status: `LOCAL_VERIFIED`

Application source: `5cbd58fbf4048c06ce964c44aa973bff2d5e23e0`

## Player-visible behavior

- The new-game screen starts with a visible shareable `RW-XXXXXXX` Seed instead of an empty field.
- The field remains editable and a dedicated ↻ control generates a new Seed only when the player asks.
- Changing among English, Traditional Chinese, Simplified Chinese and Japanese does not overwrite a manual Seed.
- The same manual Seed and biome reproduce the same terrain/resource/camp signature.
- Save data records map-generation version 1. Existing version-1 saves without that optional field remain loadable; incompatible future generation versions fail explicitly.
- Downloaded Bug JSON now includes the map-generation version.

## Verification

- Focused Node/save/report checks: 9/9 PASS (`focused-node.log`).
- Locale validation: 4 locales, 679 keys each PASS (`locales.log`).
- Real Chromium exact-artifact run: 8/8 PASS (`browser.json`).
- Artifact: 28 payload files from the exact application source, runtime integrity `SHA256_MATCH_28_FILES`.
- Real UI actions: inspect generated Seed, edit Seed, switch four locales, press reroll, Start Game, Pause/Save, reload/Continue, quit, and start a second game with the same Seed.
- Reproduction proof: numeric Seed `3188753779`, map version `1`, world signature `d534c2770fb71870eeda6fce202b579354eccf4f4a470f39534a389261d2c79d` matched at first start, Save/Load, and second start.
- Console errors: 0; Page errors: 0; failed requests: 0; HTTP errors: 0.
- Evidence: `generated-seed-menu.png`, `reproduced-seed-game.png`, `seed-setup.webm` and `timeline.json`.

## Acceptance boundary

This is `AFTER_LOCAL` on a generated Playtest artifact. It does not claim a public deployment, full random-map feature completion, strict whole-simulation Save/Load determinism, natural ten-wave completion or physical hardware validation. The existing simulation-clock, deterministic Save/Load, historical performance, natural Rift Prototype reproduction and hardware gaps remain open.
