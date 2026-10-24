# Release Blocker Remediation 01

Date: 2026-10-25 (Asia/Taipei)

Baseline: `444a9a218c49a0ec23f5b9bb31868f0cdf97118f` on `codex/project-forge-acceptance-01`.
Work branch: `codex/project-forge-remediation-01`.
Riftwatch baseline: `3674a33d95c5165dc9ee5813a051f894a8c72378`.

## Preservation

The acceptance commit was first verified locally and then pushed non-forced to the previously absent remote branch `codex/project-forge-acceptance-01`. A subsequent `git ls-remote` returned the exact SHA. No main, Riftwatch, checkpoint, PR, or merge reference was changed.

## Blocker matrix

| ID | Result | Evidence | Remaining condition |
| --- | --- | --- | --- |
| RB-01 clean build | PASS | Docker dependency stage performs lockfile-only `npm ci`; a pure archive with no `node_modules` built image `sha256:f36768a7…`, installed 20 packages and reported 0 vulnerabilities | Registry/npm availability is required for a cache-cold build |
| RB-01 clean-volume runtime | PASS | The newly built image started against `forgeremediation_forge-data`; `/health` returned database ready/workspace mounted with read-only root, 512 MiB, 1 CPU and 256 PID limits | Compose creation showed delayed Docker name-index visibility; repeat lifecycle on the private host |
| RB-01 offline failure | PASS | Cache-cold build with `--network=none` fails at dependency acquisition without disabling TLS, integrity, or lockfile checks | Maintain an approved internal registry/cache for offline disaster recovery |
| RB-03 portable golden | PASS | Export/import round trip validates package and artifact SHA-256, identity and approval; tampering and missing confirmation are rejected | Operators must preserve the package outside the Forge volume |
| RB-03 clean visual comparison | PASS | Approved package restored into fresh DB/artifact/preview directories and Playwright compared against it: 787 changed pixels, ratio 0.000607 below 0.01 | Fresh Docker volume startup was storage-BLOCKED; browser digest/version and viewport must remain matched |
| RB-02 portable policy | PASS | Policy rejects arbitrary actions, mutable images, unsafe limits and plain HTTP; emitted spec uses no network/secrets, read-only source/root, non-root user, dropped caps, seccomp/AppArmor and cleanup | Policy is not kernel enforcement |
| RB-02 actual per-job isolation | BLOCKED | Codex cloud provides no independently managed least-privilege runner; Studio is not given Docker socket access | Deploy and security-review the private runner, AppArmor/egress/quota controls, then rerun adversarial tests |

## Acceptance boundaries

Real Ollama/OpenAI-compatible inference, GitHub App installation, HTTPS webhook, external Push/PR from Forge, Windows private-host execution, complete combat play and soak/performance thresholds remain BLOCKED or NOT TESTED. Mock tests do not change those statuses. No paid API, public endpoint, PR, merge, force-push, or golden auto-approval occurred.

## Commands

```sh
git archive <remediation-commit> | tar -x -C "$clean"
docker build --no-cache -t project-forge-remediation:clean "$clean/server"
docker build --no-cache --network=none -t project-forge-remediation:offline "$clean/server"
python3 -m unittest discover -s server/tests -v
npm --prefix server audit --omit=dev --audit-level=high
node workspace/riftwatch/scripts/validate-locales.mjs
python /app/ops_cli.py golden-export PROJECT_ID web-rts-esm /backup/riftwatch-golden.tar.gz
python /app/ops_cli.py golden-import PREVIEW_ID /backup/riftwatch-golden.tar.gz --confirm
```

Exact run results and resource observations are appended after the clean final-commit acceptance run.

## Actual remediation run

- Full regression: 43/43 tests passed. This includes the previous 40 tests, portable-Golden round trip/tamper rejection and isolation-policy adversarial cases.
- Clean build: source came from `git archive`, `server/node_modules` was absent, all three base images were digest pinned, the build-stage `npm ci` added 20 packages, audit found 0 vulnerabilities, and the resulting image digest was `sha256:f36768a72838a94cfcdf53177e6704b3d6ea7aa9bf4755b72778cd418ce10849`. `npm ls` had no missing required dependency; Vite reported platform/tooling packages only as optional dependencies.
- Offline simulation: `docker build --no-cache --network=none` failed at `npm ci` with `ENETUNREACH` and exit 1. TLS and lockfile/integrity checks remained enabled. The normal proxy build used the reviewed combined CA through an ephemeral BuildKit secret; it was not copied into the image.
- Golden export: package SHA-256 `12a58d454232e28889a8afe09537a147c9a9d4ac07fbd5cab466cdf96c0e4d85`; PNG SHA-256 `a56f8c9ae8ee736adf789a46048b6d8cab59f04f6a4ba844a182c401bbfb308d`. The source was the existing explicit Task 04/06 approval; no new Golden was approved.
- Golden restore: a fresh database initially returned `golden=null`; import without confirmation and a tampered package were rejected in tests. Explicit import restored the exact PNG digest. A real 1440×900 Playwright run on Chrome `156.0.8078.48` passed visual comparison at 787 pixels / 0.0607%, all four locales, Start Game, 13 units, 6 buildings, `NemesisDirector`, and controlled ten-wave victory with ten reports.
- Diagnostic performance for that single loaded-cloud sample: 40.49 FPS / 41 frames, 1,413 ms load and 704 ms interaction latency. This is not a threshold, capacity result or full-combat benchmark.
- The first clean-container attempt reported `no space left on device`, but the daemon completed creation asynchronously. Read-back showed the remediated image running on the new volume; `/health` returned `status=ok`, `database=ready`, `workspace=mounted`, and inspection confirmed read-only root, 512 MiB RAM, 1 CPU and 256 PID limits. It was then stopped and removed, and the original Task 06 service was restored healthy. The daemon's delayed name-index behavior remains an environment reliability warning. Private-host kernel isolation remains BLOCKED.
- A final archive rebuild after documentation/backward-compatibility-only changes was attempted but the `vfs` store exhausted space while registering an already pinned Node layer. The successful clean image covers the same Dockerfile/lockfile; the final 43-test suite covers the compatibility change. This second capacity failure is retained and is not called a successful final-image rebuild.
