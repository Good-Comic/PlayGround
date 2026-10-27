# OmGitHub Issue #18 preview diagnosis

This is a read-only diagnosis. Issue #17, `main`, OpenCode Checkpoints, Issue #18 state, and all public Preview state were left unchanged.

GitHub Actions run `40377196806` completed successfully from `45435a323c729a28da1de454a3e53740fc9159f2`, and the OpenCode application work is preserved separately. That success did not produce an online Preview. OmGitHub still reports **Finished without preview**; publication is a draft with no project path or URL, and the current actor reports neither publish nor manage capability.

The release logs show two distinct layers. The local source server started, and the official App Tunnel itself registered while pointing at `127.0.0.1:3000`. OpenCode's later QA used ports 8018, 8019, and 8020. More decisively, every recorded deployment-registration callback returned HTTP 409 with `This deployment was superseded`; twenty such callbacks span generations 5 through 221. No `public-readiness.log` was emitted. GitHub's Actions artifact API reports zero artifacts, while the run's diagnostic GitHub Release contains eight log assets.

The evidence therefore distinguishes a successful code run and local browser QA from a failed/stale OmGitHub publication lifecycle. A new official Resume/Continue operation may establish a fresh deployment generation, but it is a **new OpenCode execution**, not a read-only or deploy-only retry. The current API exposes no safe deploy-only control to this actor. Per the authorization boundary, no restart was attempted and `AFTER_DEPLOY_LIVE` remains `BLOCKED`.

The concrete next operation, if separately authorized, is to use the official Issue #18 Resume/Continue UI with the verified hero-preview branch and record the source SHA resolved at launch. The run must then produce a non-draft publication, public-readiness evidence, a Preview URL, and a browser-verified Build SHA before it can count as online acceptance. Issue #17 remains the untouched rollback reference.
