# Agent entry point

Read [preserved repository instructions](Agents.md), [shared rules](docs/handoff/SHARED-RULES.md), recovery and handoff before writing. This entry supplements, never replaces, Agents.md.

Playtest/monitor addendum: Candidate may contain explicitly labelled PLAYTEST-EXPERIMENTAL features under the user-authorized exception; never promote formal QA/Integration or hide failures. Exact deploy authorization is in docs/playtest/APPROVAL-PLAN.json and must be obtained before public hosting. After each accepted slice/push/material blocker/final response, publish a curated source-pinned progress event using the independent codex/riftwatch-v224-monitor tooling to codex/riftwatch-progress-feed. No hooks/daemon or private Cloud access are assumed; publishing feed must not recursively trigger itself or block unrelated gameplay work.
