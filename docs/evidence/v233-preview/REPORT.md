# Riftwatch v2.3.3 isolated Preview acceptance

Status: `PUBLIC_PREVIEW_ACCEPTED_PENDING_OFFICIAL_PUBLICATION`. PLAYTEST-EXPERIMENTAL; not formal QA, Integration, or a release.

## Provenance

- Source SHA verified as the first Git operation: `055fb12c92e3d48945315937058f1423b732241c`
- Artifact build commit: `055fb12c92e3d48945315937058f1423b732241c`; 28 payload files; runtime `SHA256_MATCH_28_FILES`
- Artifact ZIP: `docs/playtest/v233/Riftwatch-v233-055fb12.zip` (`6ee43627cdf16fd15e87b041e76568dff21bffe244a54afaf2891280cb380b36`)
- Canonical 28-file manifest SHA-256: `d3f977c91c3e08de400ba74b84b2276e547bc0c6a1c2fa6ac44a14002c9dac1b`
- OpenCode branch: `opencode/40450603568` (run `40450603568`, Issue #19)
- Deployment commit: assigned by the official OmGitHub lifecycle at completion; not fabricated locally.

## Service

- Official local port: `http://127.0.0.1:3000`
- Public Preview used for acceptance: `https://beaches-friendship-charges-belongs.trycloudflare.com`
- Port 3000 serves a generated artifact directory, not the repository source root.
- The public page shows `PLAYTEST · 055fb12`; `PLAYTEST · BUILD BLOCKED` is absent.

## Public Chromium acceptance

- Result: **22/22 PASS** against the public HTTPS URL, not a local HTTP URL.
- Console errors: 0; Page errors: 0; failed requests: 0; HTTP errors: 0.
- PASS: public Preview loads the exact source and all 28 resource hashes
- PASS: public Preview does not show PLAYTEST · BUILD BLOCKED
- PASS: game menu and Start control are available
- PASS: real public Start reaches gameplay
- PASS: dynamic BGM is running in preparation and schedules notes
- PASS: preparation BGM recording contains real WebAudio payload
- PASS: real pointer selects a moving villager
- PASS: real UI places and completes a house
- PASS: real UI selects the Town Center and trains a villager
- PASS: double-click selects all visible same-type units
- PASS: WASD pans the camera
- PASS: Shift+A arms Attack-Move and Escape cancels it
- PASS: real right-click sets a Rally Point on the selected barracks
- PASS: hero skill range previews Mark 9 and Aegis 5
- PASS: natural first wave starts with enemy units and switches dynamic BGM
- PASS: battle BGM recording contains real WebAudio payload
- PASS: key SFX fire during construction, training, commands, and wave start
- PASS: Save, reload, and Continue restore the public run
- PASS: all four languages render real translated UI text
- PASS: public Playtest dialog names the exact 40-character SHA
- PASS: all eight new unit silhouettes have distinct raster samples
- PASS: public Preview run produced no Console, Page, failed-request, or HTTP errors

## Preserved known issues

- Low-FPS simulation time loss / SIMULATION_INTEGRITY_BLOCKED remains; fixed-step prototype is not in production.
- Basic Save/Load continuation passes, but strict deterministic Save/Load continuation remains FAIL.
- Historical 100/200/250/500/1000 performance FAIL remains; no thresholds were lowered.
- Natural Rift Prototype crash remains NOT_REPRODUCED; no natural claim is certified.
- HARDWARE_TEST_PENDING: no physical Windows GTX1650/RTX3050-class acceptance.
- PLAYTEST-EXPERIMENTAL candidate only; not formal QA, Integration, or a release.
- Natural first wave passed this run; full natural ten-wave stability is not certified.

## Files

- `acceptance.json`: full machine-readable evidence, including the 22 checks, audio metadata, and error arrays.
- `01-public-menu.png` … `07-unit-silhouettes.png`: public acceptance screenshots.
- `prep-score.webm`, `battle-score.webm`: real Chromium WebAudio recordings from the public Preview.
- `preview-receipt.json`: source/artifact/service/acceptance receipt.
