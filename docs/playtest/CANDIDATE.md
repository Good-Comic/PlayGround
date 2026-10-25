# Isolated Playtest Candidate

Status: PLAYTEST-EXPERIMENTAL. Base Integration2cd6f099d72a980bfa24dd7ae0f79676918884e8 is unchanged remotely. Legacy Issue17 untouched. No feature is newly QA-ACCEPTED by this exception.

Assembly: Boss ee0784a → Population0094fabc → Target2d55e6ae → CivAlignment/B2c456cae5 → Rally2a0da8a7. B2original0b072b7 is an ancestor of the civ branch. All complete source SHAs and historical failures remain in KNOWN-ISSUES.md and Git history. Resolved command signature includes trainingPage AND rally coordinates; retains both locale dictionaries, corrected Feudal descriptions, four-entry pagination and Rally clear outside command grid. QA script combines latest unobstructed Rally fixture with corrected civ fixture. Historical progress/requirements text from both sides retained, not relabelled.

Source commit and generated static artifact identity are separate: build_playtest.py exports a full Git SHA, injects generated build-metadata.json with SHA256 payload hashes, build UTC date/status and __qa_build.json alias. No recursive source-SHA commit. Runtime checks payload integrity before enabling Start/Continue; altered payload blocks entry. Candidate saves/settings/locale use playtest-only namespace. Bug JSON export is download-only, allowlisted and bounded; no storage/cookie/URL/raw console/stack dump or external collection.

Minimum release checklist: actual Start/UI, selection/movement/attack, gather/return/unload, building/training, Save/Load, four languages, zero blocking runtime errors, exact served SHA/hash match and known failures visible. Full performance gates remain unpassed and hardware/ten-wave/online acceptance are not claimed. Pending actual candidate test evidence will be attached before any deployment request.

No public URL has been created. Building or serving loopback is AFTER_LOCAL, not OmGitHub/DEPLOYED_VERIFIED. Public deployment requires separate user authorization of exact SHA, isolated destination and rollback operation.

## Completed local acceptance

Exact artifact source d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c passes12minimum browser checks atroot and12again under/PlayGround/,Rally9,Civ8,Boss7,SaveLoad/fourstances/crowd24/narrow8. Normal135sP0play passes4death-retargets,fourresource unload38/17/19/9,cavalryarrival andzeroConsole/Page/request errors. Runtime28payload SHA256s,subpath106/106andnormal53/53Git resource comparisons match. Initial harness/encoding failures retained,not relabelled. Full performance failures unchanged; no new acceptance stress run was used to erase them.

Approval-plan and downloadable ZIP are concrete; no public site or OmGitHub preview created. For localplay follow LOCAL-PLAY.md. All test browser contexts are disposable; CANARYstrings in negative-testHARs are mock privacy-test values,not real credentials. Full traces staylocal withhash/size; raw HAR/actions/states/screenshots are preserved in bounded bundles.
