"""Pinned, bounded public progress reader; supported Contents API fallback, never proxy bypass."""
import argparse, base64, hashlib, json, re, subprocess, urllib.error, urllib.request
from pathlib import Path

REPO = 'Good-Comic/PlayGround'
REF = 'refs/heads/codex/riftwatch-progress-feed'
FILES = ['PROJECT-STATUS.json', 'RECENT-EVENTS.jsonl', 'LATEST-RESPONSE.md', 'BLOCKERS.json']
LIMIT = 2_000_000


class ReadFailure(Exception):
    def __init__(self, kind, status=None):
        self.kind, self.status = kind, status
        super().__init__(kind)


def classify(status):
    if status in (429, 502, 503, 504):
        return 'TEMPORARY_HTTP_OBSERVED'  # Not an account-quota or permanent-interface diagnosis.
    if status in (401, 403):
        return 'ACCESS_REJECTED'
    if status == 404:
        return 'NOT_FOUND'
    return 'HTTP_FAILURE'


def raw_read(commit, name):
    url = f'https://raw.githubusercontent.com/{REPO}/{commit}/docs/monitor/{name}'
    try:
        with urllib.request.urlopen(url, timeout=15) as response:
            data = response.read(LIMIT + 1)
    except urllib.error.HTTPError as error:
        raise ReadFailure(classify(error.code), error.code) from None
    except (OSError, urllib.error.URLError):
        raise ReadFailure('TRANSPORT_FAILURE') from None
    if len(data) > LIMIT:
        raise ReadFailure('SIZE_LIMIT')
    return data


def api_read(commit, name):
    # Use configured gh identity/proxy as-is. No credential discovery, raw token, or private endpoint.
    try:
        result = subprocess.run(['gh', 'api', f'repos/{REPO}/contents/docs/monitor/{name}?ref={commit}'],
                                capture_output=True, timeout=20)
    except (OSError, subprocess.TimeoutExpired):
        raise ReadFailure('API_TRANSPORT_FAILURE') from None
    try:
        row = json.loads(result.stdout)
    except (ValueError, UnicodeError):
        raise ReadFailure('API_INVALID_RESPONSE') from None
    if result.returncode:
        status = row.get('status')
        raise ReadFailure(classify(int(status)) if str(status).isdigit() else 'API_FAILURE', status)
    if row.get('encoding') != 'base64' or row.get('size', LIMIT + 1) > LIMIT:
        raise ReadFailure('API_UNSUPPORTED_CONTENT')
    try:
        data = base64.b64decode(''.join(row['content'].split()), validate=True)
    except (KeyError, ValueError):
        raise ReadFailure('API_INVALID_CONTENT') from None
    digest = hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest()
    if digest != row.get('sha') or len(data) > LIMIT:
        raise ReadFailure('API_BLOB_HASH_MISMATCH')
    return data


def read_snapshot(commit, raw=raw_read, api=api_read):
    if not re.fullmatch('[a-f0-9]{40}', commit):
        raise ValueError('Full pinned feed SHA required')
    files, observations = {}, []
    for name in FILES:
        try:
            data = raw(commit, name)
            observations.append({'file': name, 'channel': 'RAW_HTTP', 'status': 'OK'})
        except ReadFailure as error:
            observations.append({'file': name, 'channel': 'RAW_HTTP', 'status': error.kind, 'http_status': error.status})
            try:
                data = api(commit, name)
            except ReadFailure as error:
                observations.append({'file': name, 'channel': 'GITHUB_CONTENTS_API', 'status': error.kind, 'http_status': error.status})
                return {'status': 'BLOCKED', 'feed_commit': commit, 'observations': observations}, {}
            observations.append({'file': name, 'channel': 'GITHUB_CONTENTS_API', 'status': 'OK_BLOB_HASH_VERIFIED'})
        files[name] = data
    try:
        status = json.loads(files[FILES[0]])
        events = [json.loads(row) for row in files[FILES[1]].splitlines() if row]
        blockers = json.loads(files[FILES[3]])
        latest = status['latest_event']
        if not events or latest['event_id'] != events[-1]['event_id']:
            raise ValueError('Event mismatch')
        if status['workstreams'][latest['task_id']]['event_id'] != latest['event_id']:
            raise ValueError('Task mismatch')
        if blockers['updated_at'] != status['updated_at']:
            raise ValueError('Mixed snapshots')
        if files[FILES[2]].decode() != (latest['response'] or latest['summary'] + '\n'):
            raise ValueError('Response mismatch')
    except (ValueError, KeyError, TypeError, UnicodeError):
        return {'status': 'BLOCKED_INVALID_SNAPSHOT', 'feed_commit': commit, 'observations': observations}, {}
    return {'status': 'VERIFIED_SNAPSHOT_READ', 'feed_commit': commit, 'observations': observations,
            'files': {k: hashlib.sha256(v).hexdigest() for k, v in files.items()},
            'latest_source_sha': latest['commit'], 'workstreams': list(status['workstreams']),
            'semantics': 'Snapshot read only; not independent gameplay QA or a live Codex stream'}, files


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--repo', type=Path, required=True)
    p.add_argument('--commit')
    p.add_argument('--out', type=Path, required=True)
    a = p.parse_args()
    if a.out.resolve().is_relative_to(a.repo.resolve()) or a.out.exists():
        raise SystemExit('Fresh output outside source tree required; preserve earlier reads')
    commit = a.commit
    if not commit:
        result = subprocess.check_output(['git', '-C', str(a.repo), 'ls-remote', 'origin', REF], timeout=35).decode().split()
        if not result:
            raise SystemExit('REMOTE_UNKNOWN; no cached snapshot called current')
        commit = result[0]
    receipt, files = read_snapshot(commit)
    a.out.mkdir(parents=True)
    (a.out / 'reader-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    for name, data in files.items():
        (a.out / name).write_bytes(data)
    print(json.dumps(receipt))
    raise SystemExit(0 if files else 1)


if __name__ == '__main__':
    main()
