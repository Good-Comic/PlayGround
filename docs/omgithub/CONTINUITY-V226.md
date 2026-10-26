# OmGitHub continuity: source-verified, not executed

## Version map

| Role | Branch / version | Status |
| --- | --- | --- |
| Legacy | Issue17, opencode-checkpoints/17 `6476a4bc6d18f688b9c44db9a95c45901d76b741` last known | Retained; no remote mutations |
| Candidate source | codex/riftwatch-playtest-candidate `3779c5d50876cb2e28590b9d250fb355fc0f8e38` | Pushed; code payload equals approved build |
| Game artifact | `d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c` | AFTER_LOCAL; experimental |
| Pages output | codex/riftwatch-playtest-site `6c98a8e6b7f7759ca57a9c9f94f675e2b6070381` | Pushed; Pages enablement403; NOT online verified |
| Integration | codex/riftwatch-gameplay-integration `2cd6f099d72a980bfa24dd7ae0f79676918884e8` | Existing baseline; features not formally promoted |
| Future OpenCode output | opencode/<new-run-id>, opencode-checkpoints/<new-issue> | NOT_CREATED; separate authorization/safety review required |

## Actual mechanism and discrepancies

Live read-only GitHub Contents API verified repository workflow still pins runtime `acb35f50369bd9dedffd12f8b8521666a236f359`. Source files/blob IDs/hashes in ../evidence/v226-omgithub/sources.json. Do not confuse README claims with current parser behavior:

- README documents title suffix `branch: name`. Actual pinned issue-request.mjs reads body marker `<!-- omgithub-request:v1 {"branch":"..."} -->`; a title suffix alone selects default main. A local mock-only test reproduces this discrepancy. It is NOT a real OpenCode run.
- opencode-prepare.mjs validates branch via GitHub branches API, redispatches workflow to selected ref when necessary, and outputs resolved target_sha. Reusable workflow checks out inputs.target_sha, creates opencode/<run-id>. Therefore branch selection is not arbitrary-SHA input; require preflight branch-head equality, record resolved SHA/run logs, freeze source writers and abort on mismatch.
- session-checkpoint.mjs prepare parses resume metadata; it can fetch and checkout a prior checkpoint and replace TARGET_SHA. Restore imports the previous conversation. This is distinct from selecting a new baseline. Never use a #17 resume marker for a fresh Candidate baseline.
- session-checkpoint.mjs save uses `git push --force-with-lease` on opencode-checkpoints/<issue>. This conflicts with current no-force/old-checkpoint protections. Do NOT launch this workflow until a supported safe checkpoint mode or explicit separately reviewed policy is established. Creating a new Issue alone does not resolve the prohibition.
- Published Preview can represent generated/fixed code, not byte-identical input. session-deploy may run repair and create commits. No verified supported arbitrary-commit, deploy-only UI/API for replacing existing #17 without development was established. No private endpoint was invoked.

## Proposed safe continuation (NOT authorized to execute)

Prefer a fresh isolated development Issue over changing #17, once checkpoint safety is resolved. Source existing Candidate branch at full3779c5... above; never use main, site-output branch, or old checkpoint. The metadata-supported selection is code-confirmed; current OmGitHub UI control mapping is NOT_CONFIRMED. User can approve a precisely drafted new Issue/branch choice only after checking actual interface and safe checkpoint policy.

Draft task: verify exact input HEAD, no resume metadata; inspect approved build D6 and acceptance evidence before implementation. Build static preview using existing tools/qa/build_playtest.py from the resolved full SHA into a fresh output and serve that output. Repository raw checkout lacks generated build-metadata.json, so serving raw root alone would fail candidate integrity/start checks. Do not invent metadata or relabel old #17 as current. Record initial checkout, effective TARGET_SHA after prepare, final generated source commit, actual Preview URL and resource hashes. Any code change is a new unapproved build, not permission to overwrite Pages D6.

Expected new outputs: new Issue number, opencode/<run-id>, newly scoped checkpoint/Preview identity and generated commit (unknown until actual run). Original #17 remains untouched. No guarantee of a fixed Preview URL before platform creates it. Platform's paid/model/resource use must be bounded and separately authorized.

Return path: fetch generated branch read-only; inspect diff against input, authoritative GDD, SaveLoad/four-language/P0/performance evidence. Reuse valid existing baseline tests; run changed-feature gates and actual browser. Claim an independent review/integration task, pre-merge snapshot, ordinary merge only after gates, post-merge snapshot/tests and normal push. Never auto-merge platform output, rewrite existing checkpoints or copy whole old worktrees.

Rollback: before trigger, do nothing; after future separately authorized run, stop only that new run/site and reject its branch from integration. Restore approved Pages pointer via normal commit if it had separately been updated. Preserve #17 and generated evidence. No force push, checkpoint replacement or issue-source mutation.

## Additional authorization / unresolved platform questions

Need separate specific approval for new Issue + OpenCode run; no such action performed. Existing #17 source/Preview/Continue/Publish changes remain excluded. Need resolve runtime force-with-lease behavior before any approval request can be executable under current protections. If platform offers supported branch/SHA selector or safe checkpoint policy, verify actual UI and obtain precise new operation scope. For now: CONTINUITY_PLAN_PREPARED; OPEN_CODE_EXECUTION_BLOCKED.
