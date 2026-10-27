# OmGitHub Issue #19 isolated Preview verification

Status: `OMGITHUB_PREVIEW_BLOCKED` for independent verification from the current Codex environment. The official OmGitHub worker produced and accepted a playable public Preview, but this environment cannot connect to the newly generated Preview hostname because that exact host is absent from its enforced egress allowlist.

## Version chain

- Requested source branch: `codex/riftwatch-v233-visual-silhouettes`
- Requested and observed source commit: `055fb12c92e3d48945315937058f1423b732241c`
- Issue: <https://github.com/Good-Comic/PlayGround/issues/19>
- Actual OpenCode run: <https://github.com/Good-Comic/PlayGround/actions/runs/40450603568>
- OpenCode Preview commit: `305fd6741591f1539ac9d4a71f7d57d210ab4c4b`
- OmGitHub deployment commit: `9866f491d71676f36185fa5f2bfffa4a9ad9f4ca`
- Artifact build commit: `055fb12c92e3d48945315937058f1423b732241c`
- Artifact ZIP SHA-256: `6ee43627cdf16fd15e87b041e76568dff21bffe244a54afaf2891280cb380b36`
- Canonical 28-payload-file manifest SHA-256: `d3f977c91c3e08de400ba74b84b2276e547bc0c6a1c2fa6ac44a14002c9dac1b`
- Stable Preview URL reported by OmGitHub: <https://good-comic-playground-9866f491d716.omgithub.com>
- Temporary public URL used by the official worker: <https://beaches-friendship-charges-belongs.trycloudflare.com>

The source, artifact, Preview implementation, and deployment are distinct commits/objects and are recorded separately above.

## Execution boundary

Exactly one new Issue was created. The issue-open run was skipped because the issue did not yet have the repository's required `OpenCode` label. After adding the existing label, one official `workflow_dispatch` started the actual OpenCode run. No retry, Resume, Continue, second Issue, Pages publication, main update, or force push was performed.

The official worker changed only Preview serving and evidence files on its isolated checkpoint. Its `start.sh` builds a fresh artifact from the fixed source SHA, verifies `build-metadata.json`, verifies the 28 payload hashes, and serves that generated directory on `127.0.0.1:3000`. The repository source root is not served. The visible badge is `PLAYTEST · 055fb12`; `PLAYTEST · BUILD BLOCKED` is absent.

## Official worker acceptance

The official worker ran Chromium against its public HTTPS tunnel and recorded 22/22 checks as PASS:

- exact source SHA and all 28 payload resource hashes;
- Start and gameplay entry;
- WASD and Shift+A Attack-Move;
- Rally Point and double-click same-type selection;
- hero Mark/Aegis range previews and eight distinct unit silhouettes;
- audible preparation/battle WebAudio recordings and key SFX counters;
- house construction, Town Center villager training, and natural first wave;
- basic Save/reload/Continue and four locales;
- zero Console errors, Page errors, failed requests, or HTTP errors during that run.

The original structured result is in `official/acceptance.json`; `official/preview-receipt.json` records provenance. Screenshots and the serving/lifecycle logs are preserved in this directory.

## Independent Codex access result

The current managed environment allowlist includes `omgithub.com` and the older fixed Preview hostname, but not `good-comic-playground-9866f491d716.omgithub.com` or the generated Cloudflare hostname. A single HTTPS request to the stable URL failed at the Envoy proxy before origin access:

```text
curl: (56) CONNECT tunnel failed, response 403
HTTP/1.1 403 Forbidden
server: envoy
```

Because independent public Chromium access is blocked here, the stricter result remains `OMGITHUB_PREVIEW_BLOCKED`. The official worker evidence is real online evidence and is explicitly attributed to that worker; it is not represented as a second Codex browser verification.

## Platform state

- Deployment generation: `161`
- Deployment state/stage: `ready` / `finished`
- Platform project ID: `a567f62dbbd89a9b53a6`
- Platform publication state: `unpublished`
- Stable Preview URL and final screenshot URLs exist; `can_publish` is `true`.
- Several older generation callbacks received `409 This deployment was superseded`; the final generation 161 became ready. No retry was made.

`unpublished` is retained verbatim. This report does not reinterpret it as a completed formal publication.

## Preserved limitations

- `PLAYTEST-EXPERIMENTAL`; not Gameplay Integration or formal QA.
- Low-FPS simulation time loss remains `SIMULATION_INTEGRITY_BLOCKED`.
- Basic Save/Load passed, while strict deterministic continuation remains FAIL.
- Historical performance FAIL results are unchanged.
- Natural Rift Prototype crash remains `NOT_REPRODUCED`.
- `HARDWARE_TEST_PENDING` remains.
- Full natural ten-wave stability is not certified.
