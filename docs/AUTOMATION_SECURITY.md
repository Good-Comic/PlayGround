# Task 05 automation security model

## Trust boundary

The workflow is an orchestrated state machine, not four independent agents. Planner, Engineer, QA, and Reviewer may select separate provider records, but the verified Mock run executes deterministic role adapters sequentially and records `execution_kind=sequential_mock_role` and `independent_agent=false`. Real-model autonomous development is not verified.

Every job starts from the registered Riftwatch ref and exact SHA in a new clone and a `forge/automation-*` branch. A SQLite transaction grants one job a time-limited lease for that base. An unexpired competing lease is rejected; an expired lease can be recovered with an audit event. A process restart safely stops in-flight jobs and preserves their workspaces.

## Write and execution controls

- Requests are capped at 6,000 characters and reference known requirement IDs.
- Engineer changes are limited to 1–10 predeclared existing text/code files. Traversal, symlinks, Git metadata, checkpoints, and unexpected files are rejected.
- Git and validation commands are Forge-owned argument arrays. Provider output cannot supply shell commands.
- Build/locale checks, secret scanning, exact diff matching, red/blue review, and the Task 04 Playwright gate precede PR preparation.
- The source worktree remains unchanged. Failed attempts retain isolated recovery state.
- Retries are at most two. Timeout, token, cost, and execution limits cause a recorded safe stop.
- A pass creates PR draft metadata only. It performs no external commit, push, PR, merge, force-push, protected-branch update, or checkpoint update.

## Specification and provider integrity

The repository has no complete source document labelled “v3.0 plan.” `specs/v3/MANIFEST.json` therefore declares `source_incomplete`. Chunks are sourced excerpts and the matrix records source locations; missing product decisions are not invented.

Real providers remain disabled for automation pending explicit acceptance. Credentials stay server-side under Task 02 rules. Enabling a flag is not proof of inference: diagnosis, a user-authorized non-production canary, structured-output validation, budgets, and separate GitHub authorization remain required. Never paste API keys into tasks or public conversations.

## Residual risks

- No production authentication/authorization exists; Studio must remain loopback-only.
- Job clones share the Studio container and network namespace; they are not micro-VMs.
- SQLite leases target one Studio process, not distributed workers.
- Secret scanning cannot prove absence of every secret.
- Mock roles verify controls, not real-model reasoning quality.
- Controlled ten-wave traversal is not a full real-time combat playthrough.
