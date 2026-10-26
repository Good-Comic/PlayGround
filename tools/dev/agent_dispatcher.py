"""Safe disconnected dispatcher planner. Never invokes an Agent, API billing, Git writes or shell."""
import argparse, hashlib, json, os, re, shutil, subprocess
from pathlib import Path
from worktree_recovery import inventory, write_snapshot, load, utc
from agent_handoff import remote_ownership

ADAPTERS = {'codex': ['codex', 'exec'], 'gemini': ['gemini', '-p'], 'claude': ['claude', '-p']}
TASKS = {'QA-PROGRESS-READ', 'QA-GAMEPLAY-LOCAL', 'QA-PAGES-LIVE'}


def classify_failure(error):
    # Structured observed errors only; unknown text must not imply account quota exhaustion.
    return {'context_limit': 'CONTEXT_LIMIT', 'token_limit': 'TOKEN_LIMIT', 'rate_limit': 'RATE_LIMIT',
            'environment_lost': 'ENVIRONMENT_LOST', 'tool_failure': 'TOOL_FAILURE'}.get(error, 'UNKNOWN_FAILURE')


def validate(directive, review, remote_sha, owners, agent, execution):
    if directive.get('task_id') not in TASKS:
        raise ValueError('Task outside explicitly bounded QA adapter scope')
    if not re.fullmatch('[a-f0-9]{64}', directive.get('event_id', '')):
        raise ValueError('Full event ID required')
    source = directive.get('source_sha', '')
    if not re.fullmatch('[a-f0-9]{40}', source) or source != remote_sha:
        raise ValueError('SOURCE_CHANGED_OR_UNKNOWN')
    for key in ['source_branch', 'continuation_branch']:
        value = directive.get(key, '')
        if not re.fullmatch(r'codex/riftwatch-[a-zA-Z0-9._/-]+', value) or '..' in value:
            raise ValueError('Protected or invalid branch')
    if directive['continuation_branch'] == directive['source_branch']:
        raise ValueError('Independent continuation branch required')
    if directive.get('permissions') != ['READ', 'LOCAL_QA', 'LOCAL_REPORT']:
        raise ValueError('Unauthorized external write or scope expansion')
    if directive.get('max_attempts') != 1 or directive.get('max_concurrent') != 1 or directive.get('cost_cap_usd') != 0:
        raise ValueError('Disconnected zero-cost one-attempt policy required')
    if directive.get('execute', False):
        raise ValueError('DISPATCH_NOT_CONNECTED; real execution disabled')
    owner = owners.get(directive.get('ownership_task'), {})
    if (owner.get('branch'), owner.get('status'), owner.get('agent'), owner.get('execution')) != (
            directive['continuation_branch'], 'OWNED', agent, execution):
        raise ValueError('CONFIRMED_TASK_OWNERSHIP_REQUIRED')
    if review.get('request_id') != directive.get('review_request_id') or review.get('source_sha') != source:
        raise ValueError('Review provenance mismatch')
    if review.get('status') != 'ACCEPTED' or not review.get('reviewer_executed'):
        return 'REVIEW_PENDING'
    # A supplied review is not an authenticated external identity. No execution follows even ACCEPTED.
    return 'DISPATCH_NOT_CONNECTED'


def reserve(state_dir, event_id, payload):
    state_dir.mkdir(parents=True, exist_ok=True)
    lock = state_dir / 'dispatch.lock'
    try:
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError:
        raise ValueError('LOCKED_OR_INTERRUPTED; inspect checkpoint; never steal stale ownership') from None
    try:
        os.close(fd)
        path = state_dir / 'dispatch-state.json'
        state = json.loads(path.read_text()) if path.exists() else {'plans': {}, 'active_executions': 0}
        if event_id in state['plans']:
            if state['plans'][event_id].get('source_sha') != payload.get('source_sha'):
                raise ValueError('EVENT_ID_REUSED_WITH_DIFFERENT_SOURCE')
            return {'status': 'DUPLICATE_PLAN_NO_EXECUTION', 'original': state['plans'][event_id]}
        if state['active_executions'] >= 1:
            raise ValueError('CONCURRENCY_LIMIT')
        state['plans'][event_id] = payload
        tmp = state_dir / 'dispatch-state.tmp'
        tmp.write_text(json.dumps(state, indent=2) + '\n')
        os.replace(tmp, path)
        with (state_dir / 'audit.jsonl').open('a') as f:
            f.write(json.dumps({'recorded_at': utc(), 'event_id': event_id, 'status': payload['status'],
                                'source_sha': payload['source_sha'], 'external_agent_invoked': False}) + '\n')
        return payload
    finally:
        lock.unlink()


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--repo', type=Path, required=True)
    p.add_argument('--directive', type=Path, required=True)
    p.add_argument('--review', type=Path, required=True)
    p.add_argument('--agent', required=True)
    p.add_argument('--execution', required=True)
    p.add_argument('--adapter', choices=ADAPTERS, required=True)
    p.add_argument('--state', type=Path, required=True)
    a = p.parse_args()
    repo, state = a.repo.resolve(), a.state.resolve()
    if state.is_relative_to(repo):
        raise SystemExit('State/checkpoint outside source tree required')
    directive, review = json.loads(a.directive.read_text()), json.loads(a.review.read_text())
    branch = directive.get('source_branch', '')
    # Reject before using untrusted branch as a Git refspec; no mutations.
    if not re.fullmatch(r'codex/riftwatch-[a-zA-Z0-9._/-]+', branch) or '..' in branch:
        raise SystemExit('Invalid source branch')
    rows = subprocess.check_output(['git', '-C', str(repo), 'ls-remote', 'origin', 'refs/heads/' + branch], timeout=35).decode().split()
    _, ownership = remote_ownership(repo)
    status = validate(directive, review, rows[0] if rows else None, ownership['tasks'], a.agent, a.execution)
    checkpoint = inventory(repo, load(repo/'docs/recovery/task-registry.json', {}), 'TASK_START', None)
    write_snapshot(state/'recovery', checkpoint)
    source, branch = directive['source_sha'], directive['continuation_branch']
    prompt = (f'Read AGENTS.md, Strategy v2.2.6, Recovery and Handoff. Verify source {source} and ownership. '
              f'Prepare independent worktree on {branch} from that exact SHA only after confirming no existing worktree/branch content. '
              f'Task {directive["task_id"]}: read/test locally only. Preserve failed evidence and do not repeat valid tests. '
              'No Git push, remote writes, site changes, paid API or Agent invocation authorized by this plan. '
              'If review pending, obtain actual review before further execution. Save checkpoint on interruption.')
    plan = {'status': status, 'source_sha': source, 'event_id': directive['event_id'],
            'ownership_version': ownership['version'], 'continuation_branch': branch,
            'adapter': a.adapter, 'cli_installed': bool(shutil.which(a.adapter)),
            'argv_plan_only': ADAPTERS[a.adapter] + [prompt], 'external_agent_invoked': False,
            'cost_cap_usd': 0, 'attempts_executed': 0, 'actual_worktree_created': False,
            'review_identity': 'SUPPLIED_REVIEW_NOT_CRYPTOGRAPHICALLY_AUTHENTICATED',
            'checkpoint': str(state/'recovery'), 'next_prompt': prompt}
    result = reserve(state, directive['event_id'], plan)
    (state/'NEXT-AGENT-PROMPT.md').write_text(prompt + '\n')
    (state/'plan.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result))


if __name__ == '__main__':
    main()
