# Isolated Playtest Candidate

Status: PLAYTEST-EXPERIMENTAL. Base Integration2cd6f099d72a980bfa24dd7ae0f79676918884e8 is unchanged remotely. Legacy Issue17 untouched. No feature is newly QA-ACCEPTED by this exception.

Assembly: Boss ee0784a → Population0094fabc → Target2d55e6ae → CivAlignment/B2c456cae5 → Rally2a0da8a7. B2original0b072b7 is an ancestor of the civ branch. All complete source SHAs and historical failures remain in KNOWN-ISSUES.md and Git history. Resolved command signature includes trainingPage AND rally coordinates; retains both locale dictionaries, corrected Feudal descriptions, four-entry pagination and Rally clear outside command grid. QA script combines latest unobstructed Rally fixture with corrected civ fixture. Historical progress/requirements text from both sides retained, not relabelled.

Source commit and generated static artifact identity are separate: build_playtest.py exports a full Git SHA, injects generated build-metadata.json with SHA256 payload hashes, build UTC date/status and __qa_build.json alias. No recursive source-SHA commit. Runtime checks payload integrity before enabling Start/Continue; altered payload blocks entry. Candidate saves/settings/locale use playtest-only namespace. Bug JSON export is download-only, allowlisted and bounded; no storage/cookie/URL/raw console/stack dump or external collection.

Minimum release checklist: actual Start/UI, selection/movement/attack, gather/return/unload, building/training, Save/Load, four languages, zero blocking runtime errors, exact served SHA/hash match and known failures visible. Full performance gates remain unpassed and hardware/ten-wave/online acceptance are not claimed. Pending actual candidate test evidence will be attached before any deployment request.

No public URL has been created. Building or serving loopback is AFTER_LOCAL, not OmGitHub/DEPLOYED_VERIFIED. Public deployment requires separate user authorization of exact SHA, isolated destination and rollback operation.
