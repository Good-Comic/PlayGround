import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools/monitor'))
from review_exchange import prepare

class ReviewTests(unittest.TestCase):
 def fixture(self):return dict(commit='a'*40,branch='codex/riftwatch-v226-delivery',event_id='b'*64,tests=[dict(status='FAIL',evidence='docs/evidence/failure.json')],blockers=[dict(id='PERF',summary='unresolved')])
 def test_no_fabricated_external_review(self):
  files=prepare(self.fixture());r=files['REVIEW-RESULT.json'];self.assertEqual(r['status'],'REVIEW_PENDING');self.assertFalse(r['reviewer_executed']);self.assertIsNone(r['reviewer']);self.assertFalse(files['NEXT-DIRECTIVE.json']['execute'])
 def test_evidence_failures_and_source_retained(self):
  e=self.fixture();r=prepare(e)['REVIEW-REQUEST.json'];self.assertEqual(r['source_sha'],e['commit']);self.assertEqual(r['tests'],e['tests']);self.assertEqual(r['blockers'],e['blockers'])
 def test_stable_request_identity_and_bad_source_rejected(self):
  e=self.fixture();self.assertEqual(prepare(e),prepare(e));e['commit']='main'
  with self.assertRaises(ValueError):prepare(e)
if __name__=='__main__':unittest.main()
