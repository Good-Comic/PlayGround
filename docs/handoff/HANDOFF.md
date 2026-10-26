# OmGitHub latest-candidate handoff

The supported migration path has been executed without changing Legacy Issue #17. The immutable source branch is `codex/riftwatch-omgithub17-upgrade-candidate` at `45435a323c729a28da1de454a3e53740fc9159f2`. Backup, mechanism inspection, local Chromium acceptance and launch evidence are in `docs/evidence/omgithub17-upgrade/` on `codex/riftwatch-omgithub17-upgrade-evidence`.

New Issue [#18](https://github.com/Good-Comic/PlayGround/issues/18) was opened with the official branch request marker. Initial run `40377172932` succeeded. Dispatched run `40377196806` has `headBranch=codex/riftwatch-omgithub17-upgrade-candidate` and `headSha=45435a323c729a28da1de454a3e53740fc9159f2`; its prepare and selected-snapshot steps passed. This verifies the new OpenCode task began from the latest candidate.

The worker then stopped reporting at `Configure Linux Playwright CLI with WebGPU`. OmGitHub reports `Connection lost` and `Worker heartbeat expired`; publication remains draft with no Preview URL. Treat source migration as verified and interactive Preview as `BLOCKED_NO_PREVIEW_URL`. Do not claim `AFTER_DEPLOY_LIVE`, and do not re-run the valid local candidate suite unless game source changes.

Resume by checking the existing Actions run and Issue #18 API once. If the worker recovers and exposes a distinct Preview, hash the loaded assets and run scoped online acceptance. If it fails terminally, preserve logs before considering an official retry/resume action. Keep #17, `opencode-checkpoints/17`, its resume branch and old Preview unchanged. Do not let another agent write the new OpenCode branch concurrently.

Production low-FPS time loss, strict Save/Load nondeterminism, historical performance FAIL and `HARDWARE_TEST_PENDING` remain open.
