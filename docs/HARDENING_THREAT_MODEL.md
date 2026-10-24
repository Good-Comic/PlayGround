# Task 06 hardening and red/blue review

## Assets and boundaries

Assets are the private game source, Forge database and audit trail, mounted secrets, GitHub authority, model budget, snapshots, and approved visual goldens. Browser input, repository files, README/Issue/PR text, model output, dependency metadata, webhook bodies, game JavaScript, and tool output are untrusted data—not instructions.

The blue-team invariant is: untrusted content may propose data changes but cannot change authorization, command allowlists, branch policy, secret destinations, budgets, or approval requirements. The red-team suite targets authentication bypass, CSRF, lockout evasion, path traversal, SSRF, shell metacharacters, secret patterns, webhook forgery/replay, lease theft, duplicate jobs, and unsafe backup archives.

| Attack | Enforced control | Remaining risk |
| --- | --- | --- |
| Authentication/authorization bypass | PBKDF2 password verifier, opaque hashed sessions, expiry/revocation, permission set, API-default authentication | One local admin is implemented; OIDC and multi-user administration are extension points |
| CSRF/session theft | Strict HttpOnly cookie, per-session CSRF token, no-store responses; production requires Secure cookie and HTTPS | Host/browser compromise remains privileged |
| Password guessing | Constant response, persistent failure counter, 5-attempt/15-minute lockout; remote address stored only as a hash | No distributed edge rate limiter |
| Prompt injection | Repository/model content is bounded context; fixed workflow and validators; model cannot alter security policy or submit shell | Semantic attacks can influence proposed code; human review remains required |
| Path/shell injection | Resolved-root checks, symlink/Git metadata rejection, fixed argument arrays, file allowlists | Validators execute game JavaScript; stronger disposable job containers remain required |
| SSRF/secret exfiltration | Provider URL rules, no redirects, server-side secrets, sandboxed preview, no CORS | Studio container egress is not kernel-enforced per job in this release |
| Secret disclosure | Docker/host secret files preferred, mode checks, no secret API, logs/audits store no values, leak regression test | Root/host administrators remain trusted; encrypted-at-rest vault integration is documented but not bundled |
| Malicious dependency | Exact npm versions/lock integrity and digest-pinned images; no dynamic package install by agents | Continuous CVE/signature scanning needs an external scanner and update process |
| Git escalation | Exact SHA clone, protected refs, non-force push, scoped App permissions, approval gates, no merge endpoint | Real App and branch protection remain unverified |
| Webhook forgery/replay | HMAC over raw body, event/repo allowlists, unique delivery plus digest | Public relay is not deployed |
| Worker crash/duplication | Durable idempotency key, atomic claim, heartbeat/lease, recovery, bounded retry, dead-letter record | Queue primitives are verified; production worker supervision is not exercised here |
| Backup tampering | SHA-256 manifest, SQLite online backup and integrity check, safe archive member checks, real restore drill | Backup encryption and off-host retention depend on the private host secret store |

## Sandbox posture

Compose drops every Linux capability, enables `no-new-privileges`, runs as UID 1000, uses a read-only root filesystem, bounded tmpfs, CPU/memory/PID/file-descriptor limits, loopback publication, and no Docker socket or credential mounts. Imported source is read-only. Writable data is limited to the Forge volume.

These controls harden the service container but do not yet provide a disposable container, independent filesystem quota, or egress policy for every task. Do not process hostile public repositories until a production runner supplies per-job cgroup/storage/network isolation. Completed job cleanup must follow configured retention only after a verified backup; it is intentionally not automatic in this prototype.

## High-risk operations

Commit and golden changes require `modify`; push requires `push`; PR requires `pr`; merge is not implemented. High-risk routes require a recent password reauthentication in addition to CSRF and the existing explicit confirmation. OIDC should map signed group/role claims to the same permission names and must not weaken these gates.

