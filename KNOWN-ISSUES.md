# Riftwatch Playtest Candidate — known issues

PLAYTEST-EXPERIMENTAL, not QA-ACCEPTED or a formal release. Legacy OmGitHub Issue #17 is unchanged. All six candidate feature sources are experimental until complete combined quality acceptance.

- Cloud performance failures retained: source294fa287,100combat2/3,200combat3/3,250combat1/3,250mixed3/3.100r1 meanrAF97.57ms/P95333.3ms;250r1/r3 lose simulation progress. SwiftShader is software rendering, not a physical-PC result. No thresholds lowered.
- At low FPS the legacy variable-step simulation loses time. SIMULATION_INTEGRITY_BLOCKED. Fixed-step prototype is not in the production loop.
- HARDWARE_TEST_PENDING: no physical Windows GTX1650/RTX3050-class acceptance yet.250 is a stress target, not a hard cap or guaranteed supported size.
- Later-wave military ceilings/legacy monument capacity need specification reconciliation; Gothic flat population reduction and old-save migration remain open. Complete16 unique rosters and natural ten-wave stability are not certified.
- Candidate saves/settings use a separate playtest namespace. D6 saves/settings are also isolated: v227 uses riftwatch.playtest.v227.* keys. Existing D6 saves are not automatically imported or overwritten. Candidate rollback may require starting a fresh test save if future schema changes are incompatible.
- No analytics or remote Bug collection. Export JSON excludes raw error text/stacks, cookies, storage dumps, URL/referrer and free text. It includes seed, civ/map, wave, settings, resources/population, bounded unit state and coarse browser/OS. Review before manually sharing.
- This is the v227 LOCAL candidate, not the publicly deployed D6. New SHA deployment needs precise approval; D6 directory remains untouched. Local tests are not online verification.
- Wave settlement/withdrawal, hostile crowd yielding and tactical route resumption are fixed in this candidate only. Natural full ten-wave stability and all terrain/civilization combinations remain NOT_TESTED.
- Attack-Move, unit Guard, two-point Patrol, Ctrl-store/Alt-recall groups and 100/115/130% text scale have scoped local evidence. New selectable formation layouts and complete shortcut remapping are NOT_IMPLEMENTED.
- Start Game deliberately remains English in all locales per Issue14 §3.2; other labels use four-language resources.

Preserved upstream branches: Boss ee0784a40db8134abbd1ae92bfa7ee61a1cedc93; Population0094fabc6507b41253b8869e2dacf8b0e56e3263; Target2d55e6ae4c89dbb54b6b2a12b398ab364e2be4ec; CivAlignment/B2c456cae581b3ec85a7dd222d017453d2e589e095; Rally2a0da8a7320336ac342c1af0953a424d08ef1515. Base Integration2cd6f099d72a980bfa24dd7ae0f79676918884e8. Consult source-pinned evidence directories and candidate acceptance for actual tested SHA.
