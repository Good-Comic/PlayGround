# Future gameplay integration checklist (not performed)

Both feature branches are unmerged. After quality gates pass, retain all of the following during normal merges:

- Game: B2 trainableFor/trainingRestriction plus B1 canSetRally/setRally/applyRally, and both command handlers. Do not overwrite either method group.
- UI commandSignature needs both rally coordinates and trainingPage. Retain B1 clear control outside command grid plus B2 pagination.
- Keep both RALLY_TEXT and CIV_TRAINING_TEXT translations before EN_KEYS. Validate4 languages after resolution.
- Both branches add tools/qa/feature_browser.py. Keep the combined latest file with both modes and the corrected unobstructed resource/visible clear test. After adding pagination, compare pre/post visible training entries using the actual page control; do not retain a misleading hardcoded six-entry expectation for a paginated list.
- Preserve all tests/evidence and exact tested SHAs. Run the combined actual browser feature paths, original P0, Save/Load and affected performance before any INTEGRATED_VERIFIED gameplay claim.

No rebase/force push of published feature history. Merge approved integration advances normally into feature branches and resolve/retest explicitly. Integration is not publishing.
