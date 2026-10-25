# OmGitHub deployment handoff investigation — read only

Status: **DEPLOYMENT_BLOCKED**. GitHub write access was proven by the scoped feature-branch push. That does not establish OmGitHub management authorization or a direct Preview replacement API.

## Confirmed mechanisms

The repository's `.github/workflows/opencode.yml` triggers on an issue being opened and on `workflow_dispatch` with an `issue_number`. It does **not** trigger on a push. It uses the runtime pinned at `acb35f50369bd9dedffd12f8b8521666a236f359`, prepares a validated target ref/SHA, checks it out, and creates an OpenCode run branch. Pushing our Codex branch alone does not invoke this repository workflow.

That pinned runtime's README documents selecting a non-default branch by ending the issue title with `branch: <name>`; the GitHub App validates the branch before dispatch. The documented issue workflow runs OpenCode implementation/verification and publishes an immutable finished-commit project link. This is a supported way to **start a run from a chosen branch**, not proof of a direct ongoing branch mirror or byte-preserving deploy-only service.

Sources:

- https://github.com/Good-Comic/PlayGround/blob/codex/riftwatch-gameplay-improvement/.github/workflows/opencode.yml
- https://github.com/denaidark/OhMyGithub/blob/acb35f50369bd9dedffd12f8b8521666a236f359/README.md (non-default branch section)
- https://github.com/denaidark/OhMyGithub/blob/acb35f50369bd9dedffd12f8b8521666a236f359/.github/workflows/opencode-reusable.yml (validated target checkout, OpenCode run branch and verification stages)

## Current issue17 evidence

Read-only GET `/api/github/Good-Comic/PlayGround/issues/17` still returns:

- preview: `https://good-comic-playground-914016dae8a7.omgithub.com`
- project path: `/Good-Comic/PlayGround/tree/914016dae8a7eb131b7e06c49a36c6a3276247d0`
- `can_manage:false` in this anonymous read
- publication metadata: `state:unpublished`, `can_publish:true`

The publication flag is metadata, not proof that the current actor may publish. Deployment/progress timestamps also refer to an old run; a visible Ready status is insufficient to prove our branch is deployed.

## Requires separate user authorization

Creating/editing an issue, adding the OpenCode label, dispatching a workflow, using Continue/Publish, updating a workspace or replacing any Preview would mutate remote state or start another agent run. None was performed. A legitimate authorized operator could use the documented branch-selection workflow to start from `codex/riftwatch-gameplay-improvement`; it may create another commit/run/Preview, and could modify files. Before any such action, confirm intended behavior and preserve the exact tested SHA.

## Not confirmed

No formally documented, verified interface was found to directly sync an arbitrary Codex branch into the existing issue17 Preview, preserve the exact commit, or update its existing URL without another implementation run. The existing `workflow_dispatch` input is an issue number, not a deploy-only branch/SHA contract. This investigation did not probe or call undocumented mutating APIs.

After an authorized deployment becomes available: record the actual URL and commit, compare served resources to that commit, then run `gameplay.py --stage AFTER_DEPLOY_LIVE` with the same seed/scenario. A different URL or a new OpenCode commit must be stated explicitly; localhost and GitHub source inspection do not satisfy that gate.

## Performance-recovery follow-up (read only, no candidate launched)

Pinned `scripts/opencode-prepare.mjs` resolves `/branches/{targetRef}`, returns current branch.commit.sha, then reusable workflow checks out target_sha and creates `opencode/{run_id}` before starting a modifying OpenCode run. A raw SHA in branch selection is not an exact-commit deploy input. README title directive and actual parser differ: parser reads `<!-- omgithub-request:v1 {"branch":"..."} -->` metadata, so App normalization must be verified before claiming direct GitHub-title selection works. Source copies are preserved in evidence/performance-recovery/deployment.tar.gz. No undocumented mutation was probed. A new issue/run has issue-scoped concurrency/callbacks, but guaranteed isolated deploy-only Candidate Preview/exact finished SHA/no effect on#17 remain unconfirmed. Per latest instruction, defer the candidate deployment proposal until Phase A performance passes. **DEPLOYMENT_BLOCKED** remains; no new authorization is requested or assumed.
