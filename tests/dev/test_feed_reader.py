import base64, hashlib, json, sys, unittest
from unittest.mock import patch
from types import SimpleNamespace
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'tools/monitor'))
from read_feed import read_snapshot, ReadFailure, classify, api_read
from progress_feed import normalize, render


class ReaderTests(unittest.TestCase):
    def payloads(self):
        e = normalize(dict(task_id='TEST', agent='Codex', severity='PROGRESS', branch='codex/riftwatch-v226-delivery', commit='a'*40, summary='safe', response='safe'))
        return {k.split('/')[-1]: v.encode() for k, v in render(e).items()}

    def test_single_pin_and_success(self):
        files = self.payloads(); calls = []
        def raw(commit, name):
            calls.append(commit); return files[name]
        receipt, read = read_snapshot('a'*40, raw, lambda *_: self.fail('No unnecessary API'))
        self.assertEqual(receipt['status'], 'VERIFIED_SNAPSHOT_READ')
        self.assertEqual(calls, ['a'*40]*4); self.assertEqual(read, files)

    def test_503_fallback_preserves_failure(self):
        files = self.payloads()
        def raw(*_): raise ReadFailure(classify(503), 503)
        receipt, read = read_snapshot('a'*40, raw, lambda commit, name: files[name])
        self.assertEqual(len(read), 4)
        self.assertEqual(sum(x.get('http_status') == 503 for x in receipt['observations']), 4)
        self.assertEqual(len(receipt['observations']), 8)

    def test_both_channels_fail_never_returns_cached_pass(self):
        calls = []
        def raw(*_): calls.append('raw'); raise ReadFailure('TRANSPORT_FAILURE')
        def api(*_): calls.append('api'); raise ReadFailure('ACCESS_REJECTED', 403)
        receipt, read = read_snapshot('a'*40, raw, api)
        self.assertEqual(receipt['status'], 'BLOCKED'); self.assertEqual(read, {})
        self.assertEqual(calls, ['raw', 'api'])

    def test_mixed_or_corrupt_snapshot_rejected(self):
        for field in ['LATEST-RESPONSE.md', 'BLOCKERS.json', 'RECENT-EVENTS.jsonl']:
            files = self.payloads(); files[field] = b'{}'
            receipt, read = read_snapshot('a'*40, lambda c,n: files[n])
            self.assertEqual(receipt['status'], 'BLOCKED_INVALID_SNAPSHOT'); self.assertFalse(read)

    def test_short_or_injected_pin_rejected(self):
        for value in ['main', 'a'*39, '../main', 'a'*40+'?ref=main']:
            with self.assertRaises(ValueError): read_snapshot(value)

    def test_api_content_hash_rejects_tampering(self):
        data=b'public snapshot';row=dict(encoding='base64',size=len(data),content=base64.b64encode(data).decode(),sha=hashlib.sha1(f'blob {len(data)}\0'.encode()+data).hexdigest())
        with patch('read_feed.subprocess.run',return_value=SimpleNamespace(returncode=0,stdout=json.dumps(row).encode())):
            self.assertEqual(api_read('a'*40,'PROJECT-STATUS.json'),data)
        row['sha']='0'*40
        with patch('read_feed.subprocess.run',return_value=SimpleNamespace(returncode=0,stdout=json.dumps(row).encode())):
            with self.assertRaisesRegex(ReadFailure,'HASH_MISMATCH'):api_read('a'*40,'PROJECT-STATUS.json')

    def test_api_auth_rejection_not_retried(self):
        with patch('read_feed.subprocess.run',return_value=SimpleNamespace(returncode=1,stdout=b'{"status":"403"}')) as call:
            with self.assertRaisesRegex(ReadFailure,'ACCESS_REJECTED'):api_read('a'*40,'PROJECT-STATUS.json')
            self.assertEqual(call.call_count,1)


if __name__ == '__main__': unittest.main()
