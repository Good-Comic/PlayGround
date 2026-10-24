# Riftwatch v3.0 Acceptance Evidence

## Scope

This pass integrated the prior checkpoint work and continued the available v3.0 specification. The requested 14-file package, `OMGitHub_START.md`, and `tools/riftwatch` are not present in the repository or fetched refs. The implementation therefore uses the verbatim GDD sections 0–6 available in GitHub issue #8 plus the prior checkpoint decisions. Sections 7–15 and the four-language appendix remain unavailable.

## Verified

- Protected files unchanged: `README.md`, `Agents.md`, `start.sh`, `capture.sh`.
- `window.ageOfAsh` preserved.
- Four locales: `en`, `zh-Hant`, `zh-Hans`, `ja`; 573 keys each and placeholder validation passes.
- Visible titles match the requested localized names; the start button remains exactly `Start Game`; `#btn-start` remains present.
- Content counts: 16 civilizations, 8 biomes, 32 cards, 10 waves, 16 buildings, 24 event modules, and 160 event instances.
- All four locale menus render without horizontal overflow.
- Ten-wave browser simulation reaches victory with 10 reports, 9 boons, and no console errors.
- All 16 civilization starts and all 8 biome starts complete without browser errors.
- Targeted checks pass for Goth refunds, Korean tower carts, Saracen market hiring, Byzantine counter costs, Chinese starting food and age discount, and Teuton house arrows.

## Commands run

```bash
node scripts/validate-locales.mjs
node --check js/data.js
node --check js/game.js
node --check js/ui.js
node --check js/world.js
node --check js/renderer.js
node --check js/main.js
```

Browser acceptance used Playwright against a freshly started local server on `127.0.0.1:4173`; no prior tmux session, port, or working directory was assumed.

## Known gaps

- Full source package, SHA-256-verified GDD, and specification sections 7–15 are unavailable.
- 626-key appendix localization cannot be completed from the available source; current total is 573 keys per locale.
- Native-language LQA has not been performed.
- Save/load, replay, GM editor, full general settings, and endless mode are absent.
- Scheduled biome events and several civilization trigger details remain partial.
- Event modules still approximate some carrier, formation, and targeting triggers.
- The 1000-unit live performance target has not been validated on specified hardware.
- Full production art, animation, and native-engine parity are out of scope for this prototype.
