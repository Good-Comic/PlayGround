import importlib.util,math,pathlib,unittest
p=pathlib.Path(__file__).resolve().parents[1]/'tools/qa/perf_stats.py';spec=importlib.util.spec_from_file_location('stats',p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class StatsTest(unittest.TestCase):
 def test_nearest_rank(self):
  d=m.distribution(range(1,101));self.assertEqual(d['mean'],50.5);self.assertEqual([d[k] for k in ['p50','p95','p99']],[50,95,99])
 def test_small_and_empty(self):
  self.assertEqual(m.distribution([9])['p99'],9);self.assertEqual(m.distribution([])['n'],0)
 def test_retained_old_p95(self):
  import json
  root=pathlib.Path(__file__).resolve().parents[1]
  d=json.loads((root/'docs/evidence/phase-a-v3/performance-raw.json').read_text())
  for c in d['cases']:
   actual=m.distribution(c['raw_frame_ms']);self.assertAlmostEqual(actual['mean'],c['mean_frame_ms']);self.assertAlmostEqual(actual['p95'],c['p95_frame_ms'])
if __name__=='__main__':unittest.main()
