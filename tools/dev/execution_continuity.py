#!/usr/bin/env python3
"""連續執行決策與停止紀錄，不啟動 Agent。 / Continuation decisions and stop records, without dispatch."""
import argparse
import datetime as dt
import json
import re
from pathlib import Path
from worktree_recovery import atomic_json

BLOCKERS = {'PLATFORM_EXECUTION_LIMIT', 'EXECUTION_BUDGET_BOUNDARY', 'CONTEXT_LIMIT', 'QUOTA_REJECTED', 'ENVIRONMENT_FAILURE',
            'TOOL_FAILURE', 'OWNERSHIP_CONFLICT', 'AUTHORIZATION_BLOCKED', 'USER_STOP'}


def duration(start, end, scope):
    if start is None:
        return {'seconds': None, 'scope': scope, 'status': 'UNKNOWN_NO_START_TELEMETRY'}
    first, last = (dt.datetime.fromisoformat(x.replace('Z', '+00:00')) for x in (start, end))
    if first.tzinfo is None or last.tzinfo is None or last < first:
        raise ValueError('Ordered timezone-aware timestamps required')
    return {'seconds': round((last-first).total_seconds(), 3), 'scope': scope,
            'start': first.isoformat(), 'end': last.isoformat(), 'status': 'OBSERVED_INTERVAL_ONLY'}


def evaluate(state, now):
    sha = state['CHECKPOINT_SHA']
    if not re.fullmatch('[a-f0-9]{40}', sha):
        raise ValueError('Full checkpoint SHA required')
    event = state.get('event', 'checkpoint')
    if event not in {'checkpoint', 'stop'}:
        raise ValueError('event must be checkpoint or stop')
    task, blocker = state.get('NEXT_AUTHORIZED_TASK'), state.get('observed_blocker')
    if blocker:
        if blocker.get('reason') not in BLOCKERS or not blocker.get('evidence_reference') or not blocker.get('observation'):
            raise ValueError('A stop blocker needs a supported reason, exact evidence reference and observation')
        decision, reason = 'STOP_FOR_RECORDED_CONSTRAINT', blocker['reason']
    elif task:
        decision = 'CONTINUE_AUTHORIZED_TASK'
        reason = 'AGENT_EARLY_STOP' if event == 'stop' else 'NOT_STOPPED'
    else:
        decision, reason = 'NO_PENDING_AUTHORIZED_TASK', 'AUTHORIZED_SCOPE_COMPLETE'
    return {'schema_version': 1, 'event': event, 'decision': decision, 'STOP_REASON': reason,
            'EXECUTION_DURATION': duration(state.get('started_at'), now, state.get('duration_scope', 'UNKNOWN')),
            'NEXT_AUTHORIZED_TASK': task, 'CHECKPOINT_SHA': sha, 'AUTO_RESUME_AVAILABLE': False,
            'scheduler_status': 'UNVERIFIED_NO_CONNECTED_SCHEDULER_ADAPTER', 'quota_status': 'QUOTA_PERCENT_UNKNOWN',
            'recorded_blocker': blocker,
            'evidence_verification': 'CALLER_RECORDED_NOT_INDEPENDENTLY_VERIFIED' if blocker else 'NO_CONSTRAINT_EVIDENCE',
            'explanation': state.get('explanation'), 'automatic_execution': False,
            'enforcement_scope': 'DECISION_AND_AUDIT_ONLY_NOT_A_PLATFORM_SESSION_CONTROLLER', 'recorded_at': now}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--input', type=Path, required=True)
    p.add_argument('--out', type=Path, required=True)
    a = p.parse_args()
    result = evaluate(json.loads(a.input.read_text()), dt.datetime.now(dt.timezone.utc).isoformat())
    atomic_json(a.out, result)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
