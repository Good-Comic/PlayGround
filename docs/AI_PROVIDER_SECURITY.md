# AI provider and task safety model

## Provider boundary

Forge stores provider metadata, capabilities, limits, endpoint, and model ID in SQLite. It does not accept an API key in provider JSON and never returns one from a GET endpoint. A cloud key may be supplied only to the Studio server process as `FORGE_OPENAI_API_KEY`; it is not written to the repository, SQLite, browser storage, task history, or application output.

Provider locations have different URL policies:

- Ollama is local-only: localhost, `host.docker.internal`, or a literal private/loopback IP.
- OpenAI-compatible cloud endpoints require HTTPS and cannot use a literal local/private IP.
- URLs containing credentials, query strings, or fragments are rejected. HTTP redirects are not followed.

Timeout, bounded retry, maximum input/output tokens, explicit pricing, and a task cost ceiling are applied by the server. Cloud inference is refused when pricing is unknown. This is a guardrail, not a billing guarantee: provider-reported usage and prices must still be audited.

A provider can select one fallback. Fallback stays inside the same task record and reuses the bounded context; its identity and the primary failure are appended to the audit trail. Forge reapplies capability checks, so an unconfirmed fallback becomes Plan rather than gaining edit authority.

## Agent state and context

The task record is the source of truth. Status transitions and explanations are appended to `agent_task_events`, while attempts, errors, token usage, estimated cost, proposal, diff, and validation output stay attached to the task.

The provider receives:

- the user instruction;
- requested/effective mode;
- up to 200 file names and byte sizes;
- at most one explicitly selected UTF-8 file, capped at 512 KiB.

It does not automatically receive the full repository or product specification. Edit/Test automatically becomes Plan unless tool-call capability is positively confirmed.

## Edit boundary

An AI response is parsed as structured data and may propose exactly one edit to the selected existing file. Forge rejects path changes, oversized content, empty diffs, `.git` access, traversal, and provider-supplied commands.

The workflow is:

```text
queued → running → awaiting_approval → approved → validating → completed
                    ↘ cancelled/failed             ↘ failed
                    completed/failed → rolled_back
                    failed/cancelled → queued (retry)
```

Before approval, only a diff and a copied sandbox exist. Approval writes only to a task directory under `/data/agent-tasks`; the imported game remains read-only. Validation is limited to Forge-owned command templates (`node --check` and the repository's known locale validator). Rollback copies the original selected file back into the sandbox.

There is deliberately no source write-back, Git commit, push, PR, or merge API in Task 02. Future write-back must follow `docs/RIFTWATCH_WORKFLOW.md` and require a separate branch-safe review flow.
