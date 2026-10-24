# GitHub App security and threat model

## Trust boundaries

The browser is untrusted and never receives the App private key, webhook secret, installation token, or an arbitrary Git command. Forge Studio holds configuration server-side, SQLite holds normalized event/audit metadata, `/source-repository` and `/workspace` are read-only, and task Git clones are the only writable repositories. GitHub and any future HTTPS relay are external systems.

Required App permissions are exactly Metadata read, Contents read/write, and Pull requests read/write. Install the App only on explicitly selected repositories. Do not grant Administration, Actions, Issues, Members, Secrets, or organization-wide access.

## Threats and controls

| Threat | Control | Residual limitation |
| --- | --- | --- |
| Forged webhook | Constant-time HMAC-SHA256 over the original body; 1 MiB cap; event and repository allowlists | Public delivery still needs a hardened HTTPS relay |
| Replay or duplicate | Unique delivery ID plus payload digest; same body is idempotent, changed body is rejected | Retention/cleanup policy is not yet implemented |
| Secret leakage | Secrets enter only through server environment/file; status returns booleans; normalized payloads omit headers; tokens remain in memory; Git uses an ephemeral askpass helper under clone `.git` | Environment/process inspection remains an operator trust boundary |
| Excess GitHub authority | Exact permission set and repository registration; short-lived installation tokens | Installation policy must also be enforced in GitHub settings |
| Protected history change | Unique `forge/task-*` branches; protected branch rejection; non-force push only; no merge API | GitHub branch protection remains required defense in depth |
| Prompt-driven shell execution | Provider output may change one selected file only; commands are Forge-owned allowlisted Build/Test commands | Validators execute game JavaScript and need stronger job isolation for production |
| Secret committed in diff | High-confidence scan before prepare and again before commit | Pattern scanning cannot find every encoded or domain-specific secret |
| Base drift | Exact registered base SHA at clone; diff and validations are recomputed at commit | Remote drift after validation can make a PR conflict; it is surfaced, not auto-resolved |
| Dirty/forced sync | Dirty repository state and forced update stop processing and mark conflict | Manual operator recovery is required |
| Unauthorized external action | Task 06 session authentication, CSRF, permission checks and recent reauthentication; separate confirmation for commit, push, and PR; real writes need a server-side enable flag; no merge endpoint | The implemented local-admin model is not a multi-user identity provider; remain loopback-only or behind reviewed private HTTPS access |

## Credential handling

Mount the GitHub App PEM as a read-only secret file outside the repository and set `FORGE_GITHUB_APP_PRIVATE_KEY_FILE` to its in-container path. Inject `FORGE_GITHUB_WEBHOOK_SECRET` from a secret manager. Never place either value in Compose source, Git, SQLite, browser storage, or logs. Rotate both on suspected exposure; revoke the App installation if private-key compromise is possible.

Installation tokens are minted only when needed, held in process memory, and refreshed before expiry. They are passed to Git through `GIT_ASKPASS` environment state, not command-line arguments or remote URLs. Production logging must redact authorization headers and query strings.

## Approval invariant

An Agent completion is not approval to write Git. Local commit, external push, PR creation, and merge are distinct decisions. Task 03 implements the first three gates but only Mock/dry-run was exercised here; merge is intentionally absent. A real PR needs current user authorization, and merge requires a later, separate authorization after CI and human review.
