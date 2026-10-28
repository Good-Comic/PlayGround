# Riftwatch v2.4.0 development — known issues

PLAYTEST-EXPERIMENTAL. This branch is not publicly released; v234 remains unpublished. Exact artifact metadata and SHA are authoritative, not the historical candidate label below.

- Versioned Seed terrain generation2 has bounded40-map/480-route and native river-crossing evidence. Historical saves restore generation1. This is not exhaustive all-Seed/civilization certification.
- User-approved Easy/Hard change ordinary force counts and prep time only; Normal cycle1 preserves original director plans. Balance/full natural campaigns are pending.
- Optional New Game+ resets economy/research/entities, keeps zero to three selected owned cards, and adds a visible25s cavalry flank. Functional native UI and SaveLoad pass from an explicitly controlled completed-victory fixture; a natural ten-wave→NG+ sequence has NOT passed.
- Natural policyV1 lost wave5; policyV2 stopped on a harness action timeout at wave4. Worker command churn during hero cooldown and compact130percent victory-panel overflow have targeted local fixes, not a whole-game QA waiver.
- Original landmark100-unit/24-building drawing JS increase about21.4percent remains FAIL. Short standard-opening samples did not show blocking regression; no physical-hardware FPS conclusion is available.
- Low-FPS time loss, strict SaveLoad nondeterminism, natural Rift Prototype crash NOT_REPRODUCED and HARDWARE_TEST_PENDING remain open.

## Preserved v234 candidate history and unresolved upstream issues


PLAYTEST-EXPERIMENTAL, not QA-ACCEPTED, Gameplay Integration, or a formal release. Legacy OmGitHub Issue #17 and the published v228 full-SHA directory remain unchanged. The v234 Game First chain is experimental until complete combined quality acceptance.

- Added since the public v228 candidate: A/WASD and Shift+A coexistence, Rally-facing production exits, Canvas double-click same-type selection, hero Mark/Aegis range previews, a Rift Prototype awakening cue, phase-aware dynamic BGM, key gameplay SFX feedback, and distinct ranged/melee/mounted unit silhouettes.
- OmGitHub Issue #19's official worker validated the preceding `055fb12c92e3d48945315937058f1423b732241c` source with 22/22 public HTTPS checks. That evidence does not convert this new v234 package into a published or independently live-verified build.

- Cloud performance failures retained: source294fa287,100combat2/3,200combat3/3,250combat1/3,250mixed3/3.100r1 meanrAF97.57ms/P95333.3ms;250r1/r3 lose simulation progress. SwiftShader is software rendering, not a physical-PC result. No thresholds lowered.
- At low FPS the legacy variable-step simulation loses time. SIMULATION_INTEGRITY_BLOCKED. Fixed-step prototype is not in the production loop.
- HARDWARE_TEST_PENDING: no physical Windows GTX1650/RTX3050-class acceptance yet.250 is a stress target, not a hard cap or guaranteed supported size.
- Later-wave military ceilings/legacy monument capacity need specification reconciliation; Gothic flat population reduction and old-save migration remain open. Complete16 unique rosters and natural ten-wave stability are not certified.
- Candidate saves/settings use a separate playtest namespace. D6 saves/settings are also isolated: v227 uses riftwatch.playtest.v227.* keys. Existing D6 saves are not automatically imported or overwritten. Candidate rollback may require starting a fresh test save if future schema changes are incompatible.
- No analytics or remote Bug collection. Export JSON excludes raw error text/stacks, cookies, storage dumps, URL/referrer and free text. It includes seed, civ/map, wave, settings, resources/population, bounded unit state and coarse browser/OS. Review before manually sharing.
- This v234 candidate is prepared locally; no v234 GitHub Pages directory or root switch is authorized or deployed. Existing D6/v228 full-SHA directories stay unchanged. Local v234 checks are not online verification.
- OPEN-NAV-NARROW-01 is LOCAL_FIXED in v228: exact recorded Chromium dt replay changes7/8 to8/8 by preserving crowd-aware A* detours. Native8/8 in16.73s,24crowd/orders/SaveLoad/normal135s regressions pass. OriginalFAIL is preserved; other terrain/congestion cases and onlineacceptance remain pending. Evidence: https://github.com/Good-Comic/PlayGround/blob/5fab2cedc770b238b37559eb81c42495e5eeb27a/docs/evidence/v228-nav/ROOT-CAUSE.md
- Save/Load can resume, but strict deterministic continuation FAILS: transient navigation history is rebuilt and subsequent movement/economy/RNG diverge. Fixed-step evaluation is not installed. Do not treat a playable Continue as deterministic replay certification.
- The reported natural Rift Prototype crash remains NOT_REPRODUCED. Controlled claim/spawn/render paths pass, but the original player save/seed and full natural trigger conditions have not been reproduced.
- Clickable1–9 control groups, Ctrl-store/Shift-add and a Settings visibility switch are included. Keyboard groups continue when buttons are hidden; textscale100/115/130% and fourlanguages have scoped native checks. A new line/wedge formation editor, Fog expansion and newcard/Boss slices remain queued.
- Wave settlement/withdrawal, hostile crowd yielding and tactical route resumption are fixed in this candidate only. Natural full ten-wave stability and all terrain/civilization combinations remain NOT_TESTED.
- Attack-Move, unit Guard, two-point Patrol, Ctrl-store/Alt-recall groups and 100/115/130% text scale have scoped local evidence. New selectable formation layouts and complete shortcut remapping are NOT_IMPLEMENTED.
- Start Game deliberately remains English in all locales per Issue14 §3.2; other labels use four-language resources.

Preserved upstream branches: Boss ee0784a40db8134abbd1ae92bfa7ee61a1cedc93; Population0094fabc6507b41253b8869e2dacf8b0e56e3263; Target2d55e6ae4c89dbb54b6b2a12b398ab364e2be4ec; CivAlignment/B2c456cae581b3ec85a7dd222d017453d2e589e095; Rally2a0da8a7320336ac342c1af0953a424d08ef1515. Base Integration2cd6f099d72a980bfa24dd7ae0f79676918884e8. Consult source-pinned evidence directories and candidate acceptance for actual tested SHA.
