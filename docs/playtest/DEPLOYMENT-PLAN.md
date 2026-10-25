# Concrete isolated deployment plan — approval required

DEPLOYMENT_BLOCKED. No public test URL, Issue or workflow has been created. Candidate source and local artifact must pass the minimum browser checklist before this plan is executed.

## Confirmed OmGitHub mechanisms

Repository .github/workflows/opencode.yml pins denaidark/OhMyGithub at acb35f50369bd9dedffd12f8b8521666a236f359. Its public README supports a `branch: name` issue-title directive; it selects checkout, then runs OpenCode implementation/verification and publishes a finished checkpoint. session-deploy.mjs can fork/repair through OpenCode, save a new checkpoint, upload to an issue-scoped deployment endpoint and post an issue comment. The code uses runtime session/generation/identity bindings. This is not a documented user-facing deploy-only interface for arbitrary finished commits. We did not call that endpoint, create an Issue or invoke the workflow. Existing #17 remains untouched.

Independent arbitrary-commit preview creation, no-development operation, stable isolated URL and rollback without those runtime bindings are NOT_CONFIRMED. Merely constructing a full-commit URL or new issue does not prove exact source/no-modification deployment. Do not probe a Candidate route that might create a public environment without approval.

## Recommended minimal operation: isolated Pages source branch

Read-only GitHub repo API returned public=true,has_pages=false; Pages GET returned404. Recheck immediately before deployment. If Pages now exists, stop rather than overwrite it. No need to create another repo or change main.

Upon specific authorization only:
1. Verify the approved full Candidate SOURCE SHA and archived artifact/hash match local acceptance; verify no existing Pages site and no conflicting site-branch owner.
2. Publish only the static artifact to new independent branch `codex/riftwatch-playtest-site` in Good-Comic/PlayGround with a normal commit/push. No source/main/Integration/checkpoint branch changes. The source40SHA and28payload SHA256s remain in build-metadata.json.
3. Enable GitHub Pages with source branch `codex/riftwatch-playtest-site`,path `/` using GitHub Settings→Pages→Deploy from branch, or authorized REST create-Pages operation. This can trigger GitHub's standard Pages build; it must not trigger OpenCode. No custom domain/DNS, Issues, new AI job or #17 change.
4. Expected URL, NOT CREATED/VERIFIED: https://good-comic.github.io/PlayGround/ . Exact deployment URL/permissions depend on actual Pages response. Enabling Pages may require repository admin; current contents-push permission does not prove Pages-admin permission. If API denies it, report DEPLOYMENT_BLOCKED and let the user perform only this UI setting; do not change credentials.
5. After actual deployment, Playwright must repeat Start/selection/move/attack/economy/training/SaveLoad/export/basic4languages and verify actual downloaded resources against the approved source/artifact. Only then DEPLOYED_VERIFIED(candidate), specifically independent Pages hosting, not OmGitHub.

Isolation: Legacy OmGitHub is a different origin, all candidate storage keys are playtest-prefixed, Integration is unchanged. Pages is a new static site on an independent artifact branch. No analytics/server-side Bug collection. If this repository's Pages origin is shared with other projects, the candidate namespace avoids legacy Riftwatch keys; never dump browser storage.

## Rollback

Retain every tested source SHA/artifact ZIP/payload manifest and site publication commit. Restore an earlier VERIFIED Candidate artifact by creating a new normal commit on the isolated site branch; no force push/reset. If the first deployment fails, disable ONLY this new Pages site after approval and preserve its artifact/diagnostic evidence. Initial rollback target is site disabled plus Legacy #17 unchanged; older pre-Candidate builds are not relabelled as verified Candidate.

## Ready approval scope

Authorize only: approved SOURCE SHA to the new `codex/riftwatch-playtest-site` branch; enable Pages branch/root for Good-Comic/PlayGround; perform remote browser acceptance; on critical failure disable only that new site or restore an explicitly previously verified candidate artifact. Exclude main,OpenCode checkpoints,Issue17,all existing Preview/workspace data,Issues,OpenCode workflows,DNS,external paid services and remote Bug collection.

Agent network prerequisite: current custom allowed hosts includeGitHub/API/OmGitHub,not good-comic.github.io. After approved hosting, user may need to allow exactly good-comic.github.io in Codex UI for remote Playwright verification; Agent will not change policy or bypass a denial. User browser access is independent of Codex egress policy. No speculative additional domains are requested.
