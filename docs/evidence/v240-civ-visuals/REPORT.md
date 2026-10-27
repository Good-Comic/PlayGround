# v2.4 civilization visual families

Status: `LOCAL_VERIFIED`

Application source: `2a6dc068c3ee3fc59912cd7e76fb095a615e01f0`

The sixteen civilizations now resolve through a reusable visual-profile module rather than relying only on tint. Five initial families add visible architectural and military shapes:

- Steppe: swallowtail roof banners and horsehair crests.
- Fortress: crenellated roof crests and kite shields.
- Desert: domes/crescent finials and round shields.
- Eastern: upturned roof lines and lamellar plates.
- Mesoamerican: stepped roof ornaments and feather crests.

Player units also use the selected civilization accent through the existing player-color object. These are renderer-only layers: unit radii, building footprints, navigation and balance values are unchanged.

## Verification

- Focused visual tests: 5/5 PASS (`focused-node.log.txt`).
- Exact 29-payload artifact Chromium: 4/4 PASS (`browser.json`). The additional payload is `js/visuals.js`; runtime integrity reports `SHA256_MATCH_29_FILES`.
- Real flow: home-screen Start, then an explicitly controlled barracks/guard gallery that switched among MNG, TEU, SAR, CHN and AZT.
- All five complete frames have different SHA-256 hashes; collision values before/after profile changes match.
- Console, Page, HTTP and failed-request errors: 0.
- Evidence includes one PNG per representative family and `civ-visual-families.webm`.

## Acceptance boundary

This vertical slice establishes a scalable in-engine profile pipeline and representative shapes. It does not claim sixteen fully unique asset sets, complete multidirectional animation, public deployment or full-campaign acceptance. Existing simulation, strict Save/Load, performance, natural Rift Prototype and hardware gaps remain open.
