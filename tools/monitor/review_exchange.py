"""Prepare evidence-linked REVIEW_PENDING exchange; never simulates independent approval."""
import argparse, hashlib, json, re
from pathlib import Path


def prepare(event):
    source, branch, event_id = event['commit'], event['branch'], event['event_id']
    if not re.fullmatch('[a-f0-9]{40}', source) or not re.fullmatch('[a-f0-9]{64}', event_id):
        raise ValueError('Pinned event and full source SHA required')
    if not re.fullmatch(r'codex/riftwatch-[a-zA-Z0-9._/-]+', branch) or '..' in branch:
        raise ValueError('Unsupported source branch')
    request_id = 'REVIEW-' + hashlib.sha256((source + event_id).encode()).hexdigest()[:24]
    request = {'schema_version': 1, 'request_id': request_id, 'event_id': event_id,
               'source_sha': source, 'source_branch': branch, 'latest_pushed_sha': event.get('latest_pushed_sha', event.get('remote_head')),
               'status': 'REVIEW_PENDING', 'tests': event.get('tests', []), 'blockers': event.get('blockers', []),
               'requirements': ['docs/handoff/STRATEGY-V2.2.6.md', 'docs/GAMEPLAY-REQUIREMENTS.md'],
               'handoff': 'docs/handoff/ACTIVE-TASK.json',
               'review_steps': ['Read pinned feed and handoff', 'Independently query remote source commit',
                                'Review relevant code diff and GDD', 'Read original test and failure evidence',
                                'Separate local/integrated/online/hardware verification', 'Return sourced decision and bounded next task'],
               'allowed_decisions': ['ACCEPTED', 'REWORK_REQUIRED', 'BLOCKED', 'NEEDS_APPROVAL']}
    result = {'schema_version': 1, 'request_id': request_id, 'source_sha': source, 'status': 'REVIEW_PENDING',
              'reviewer': None, 'reviewer_executed': False, 'findings': [], 'evidence': [],
              'reason': 'No real independent external Supervisor executed by this generator'}
    directive = {'schema_version': 1, 'review_request_id': request_id, 'event_id': event_id,
                 'task_id': 'QA-PROGRESS-READ', 'source_sha': source, 'source_branch': branch,
                 'continuation_branch': 'codex/riftwatch-supervisor-qa-next', 'ownership_task': 'SUPERVISOR-QA-NEXT',
                 'status': 'REVIEW_PENDING', 'execute': False, 'permissions': ['READ', 'LOCAL_QA', 'LOCAL_REPORT'],
                 'max_attempts': 1, 'max_concurrent': 1, 'cost_cap_usd': 0,
                 'next_steps': ['Actual reviewer must return a sourced result', 'Reverify remote SHA and claim independent branch ownership',
                                'Use disconnected dispatcher plan; no automatic execution authorization']}
    return {'REVIEW-REQUEST.json': request, 'REVIEW-RESULT.json': result, 'NEXT-DIRECTIVE.json': directive}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--status', type=Path, required=True)
    p.add_argument('--out', type=Path, required=True)
    a = p.parse_args()
    if a.out.exists():
        raise SystemExit('Fresh exchange directory required; never overwrite an actual review')
    files = prepare(json.loads(a.status.read_text())['latest_event'])
    a.out.mkdir(parents=True)
    for name, data in files.items():
        (a.out/name).write_text(json.dumps(data, indent=2) + '\n')
    (a.out/'SUPERVISOR-STATUS.md').write_text('# Supervisor exchange\n\nREVIEW_PENDING. No independent reviewer has executed. No ACCEPTED result, autonomous dispatch, public deployment or integration is implied. Read the exact source/evidence in REVIEW-REQUEST.json; preserve known failures. Return a real sourced result before scheduling.\n')
    print(json.dumps({'status': 'REVIEW_PENDING', 'request_id': files['REVIEW-REQUEST.json']['request_id']}))


if __name__ == '__main__':
    main()
