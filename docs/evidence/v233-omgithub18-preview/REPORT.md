# OmGitHub Issue #18 deployment-generation diagnosis

Status: `PREVIEW_UNAVAILABLE`; read-only investigation. No Resume, Continue, retry, Issue creation, publication, or protected-ref change was performed.

The current Issue API identifies one latest internal deployment: run `40377196806`, attempt `1`, generation `234`, stage identity `40377196806:1`. It remains `deploying / publishing`, last updated `2026-10-26T19:03:16.362Z`, while the terminal task outcome is success and the session has ended. OmGitHub exposes no separate Deployment ID. GitHub's repository Deployments API contains only three unrelated `github-pages` deployments; it contains no OpenCode/Issue #18 deployment.

The twenty lifecycle callbacks rejected with HTTP 409 belong to the same run and attempt and span generations 5 through 221. Generation 234 is newer than all of them. Only one Actions run and one worker job were observed, so the evidence supports stale internal deployment generations within that run. It does not establish a second Worker, second Actions run, or competing GitHub Deployment.

The Worker did make a service publicly reachable through its temporary App Tunnel. `app-cloudflared.log` records a successful tunnel registration to `http://127.0.0.1:3000`, and OmGitHub captured two screenshots from that tunnel. The latest official screenshot is preserved as `official-port3000-build-blocked.png`: it visibly renders the Riftwatch menu, but the banner says `PLAYTEST · BUILD BLOCKED` and the page label is `riftwatch-playtest-v228`. Thus port 3000 was neither empty nor unreachable. It served the source-tree application without a valid generated playtest manifest, so `js/playtest.js` kept the build-integrity gate closed. OpenCode later built and tested valid immutable artifacts on 8019/8020, but those were not the service registered on the official 3000 App Tunnel.

The supported web client exposes only:

- Issue Resume/Continue, which starts a new OpenCode execution.
- Retry Build, rendered only for a failed issue; #18 is complete/success.
- Project publication, which requires a generated project ID/path plus `can_publish` or `can_manage`; #18 has no project path, both capabilities are false, and publication remains a draft.

No deploy-only repair or rebind-current-artifact interface was observed. The anonymous build-details endpoint returns 403 and does not change that capability result.

A safe future recovery therefore requires a new official execution. The minimum proposal is: start from the latest fully verified candidate branch and exact SHA; ensure the official port-3000 process serves the generated 28-file playtest artifact with its matching `build-metadata.json`, rather than the source root; require successful public-readiness and a non-draft Preview URL; then verify the loaded Build SHA in a real browser. This action can create a new OpenCode branch/checkpoint and a new deployment generation. Rollback is to abandon that isolated execution and retain #18's current history, #17, public Pages, and all Checkpoints unchanged. It remains unexecuted pending explicit authorization.
