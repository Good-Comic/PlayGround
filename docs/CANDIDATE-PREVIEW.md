# Isolated Candidate delivery contract

IMPLEMENTED/LOCAL_VERIFIED local only. Run the tool from the QA or Gameplay Integration checkout; older feature branches need not contain the newest QA scripts. Use tools/qa/candidate_serve.py with full commit, a fresh snapshot directory and a free loopback port. It exports index/styles/js/assets, never overwrites existing data, never follows a branch or starts OpenCode. GET/__candidate_build.json plus X-Riftwatch-Build-SHA identifies source. Asset requests409 if snapshot hashes change. Tests:91569e2 and previous7faa21a actual Chromium Start Game,25/25 hashes each; rollback by selecting the prior isolated URL. Tamper probe200→409/dirty→restored200. An initial omitted-font404 is preserved and fixed.

This is not OmGitHub, not a public service, and not AFTER_DEPLOY_LIVE. Existing issue17/Preview untouched. Current runtime branch/issue workflow starts a modifying OpenCode job and does not guarantee an exact finished commit; no supported deploy-only existing-Preview update was established. No issue/workflow/Publish invocation this round.

After feature/integration gates pass, a separate approval must specify the **exact tested full SHA**, isolated hosting target, no#17/save mutation, allowed service/routing operation and rollback target. Do not treat workflow access as deploy-only authorization. A possible future approval scope is “deploy this already-verified SHA to a new isolated candidate service, no OpenCode implementation run, no#17 update; stop/switch only this candidate on failure.” No external target is chosen or approval requested now. Then test the actual remote URL and served hashes before labelling DEPLOYED_VERIFIED(candidate); distinguish independent hosting from OmGitHub official Preview.

Reproduce locally in a persistent session:
```
python tools/qa/candidate_serve.py --commit FULL_TESTED_SHA --port FREE_LOCAL_PORT --directory /workspace/candidates/FRESH_DIRECTORY
```
Use fresh browser contexts; archive manifest, resource hashes, console/network/page errors and actions. Saved games belong to the disposable context. Immutable candidate91569e2 remains fixed even though the development branch advances. Raw candidate/integrity evidence is under docs/evidence/strategy-v2.
