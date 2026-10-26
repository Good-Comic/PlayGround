# Riftwatch v228 Playtest Candidate — known issues

PLAYTEST-EXPERIMENTAL, not QA-ACCEPTED or a formal release. Legacy OmGitHub Issue #17 is unchanged. All six candidate feature sources are experimental until complete combined quality acceptance.

- Cloud performance failures retained: source294fa287,100combat2/3,200combat3/3,250combat1/3,250mixed3/3.100r1 meanrAF97.57ms/P95333.3ms;250r1/r3 lose simulation progress. SwiftShader is software rendering, not a physical-PC result. No thresholds lowered.
- At low FPS the legacy variable-step simulation loses time. SIMULATION_INTEGRITY_BLOCKED. Fixed-step prototype is not in the production loop.
- HARDWARE_TEST_PENDING: no physical Windows GTX1650/RTX3050-class acceptance yet.250 is a stress target, not a hard cap or guaranteed supported size.
- Later-wave military ceilings/legacy monument capacity need specification reconciliation; Gothic flat population reduction and old-save migration remain open. Complete16 unique rosters and natural ten-wave stability are not certified.
- Candidate saves/settings use a separate playtest namespace. D6 saves/settings are also isolated: v227 uses riftwatch.playtest.v227.* keys. Existing D6 saves are not automatically imported or overwritten. Candidate rollback may require starting a fresh test save if future schema changes are incompatible.
- No analytics or remote Bug collection. Export JSON excludes raw error text/stacks, cookies, storage dumps, URL/referrer and free text. It includes seed, civ/map, wave, settings, resources/population, bounded unit state and coarse browser/OS. Review before manually sharing.
- This v228 candidate is LOCAL only; no new publicSHA has been authorized or deployed. D6 full-SHA directory stays unchanged. Local tests are not online verification.
- OPEN-NAV-NARROW-01 is LOCAL_FIXED in v228: exact recorded Chromium dt replay changes7/8 to8/8 by preserving crowd-aware A* detours. Native8/8 in16.73s,24crowd/orders/SaveLoad/normal135s regressions pass. OriginalFAIL is preserved; other terrain/congestion cases and onlineacceptance remain pending. Evidence: https://github.com/Good-Comic/PlayGround/blob/5fab2cedc770b238b37559eb81c42495e5eeb27a/docs/evidence/v228-nav/ROOT-CAUSE.md
- Save/Load can resume, but strict deterministic continuation FAILS: transient navigation history is rebuilt and subsequent movement/economy/RNG diverge. Fixed-step evaluation is not installed. Do not treat a playable Continue as deterministic replay certification.
- Clickable1–9 control groups, Ctrl-store/Shift-add and a Settings visibility switch are included. Keyboard groups continue when buttons are hidden; textscale100/115/130% and fourlanguages have scoped native checks. A new line/wedge formation editor, Fog expansion and newcard/Boss slices remain queued.
- Wave settlement/withdrawal, hostile crowd yielding and tactical route resumption are fixed in this candidate only. Natural full ten-wave stability and all terrain/civilization combinations remain NOT_TESTED.
- Attack-Move, unit Guard, two-point Patrol, Ctrl-store/Alt-recall groups and 100/115/130% text scale have scoped local evidence. New selectable formation layouts and complete shortcut remapping are NOT_IMPLEMENTED.
- Start Game deliberately remains English in all locales per Issue14 §3.2; other labels use four-language resources.

Preserved upstream branches: Boss ee0784a40db8134abbd1ae92bfa7ee61a1cedc93; Population0094fabc6507b41253b8869e2dacf8b0e56e3263; Target2d55e6ae4c89dbb54b6b2a12b398ab364e2be4ec; CivAlignment/B2c456cae581b3ec85a7dd222d017453d2e589e095; Rally2a0da8a7320336ac342c1af0953a424d08ef1515. Base Integration2cd6f099d72a980bfa24dd7ae0f79676918884e8. Consult source-pinned evidence directories and candidate acceptance for actual tested SHA.
