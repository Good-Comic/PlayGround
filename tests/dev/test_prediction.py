import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools/qa'))
from predict_performance import predict
class PredictionTests(unittest.TestCase):
 def test_missing_scores_refuses_fps(self):self.assertEqual(predict({'level':1})['status'],'INSUFFICIENT_DATA')
 def test_comparable_ratio_is_not_fps(self):
  a={'suite':'SYNTHETIC','version':'1','browser':'fixture1','workload':'JS','unit':'score','backend':'JS','direction':'higher','hardware':'fixtureA','source':'synthetic-unit-test','date':'2026-10-26','score':100};b=dict(a,hardware='fixtureB',score=150);r=predict({'level':1,'reference':a,'target':b});self.assertEqual(r['relative_capacity'],1.5);self.assertIsNone(r['fps']);b['version']='2';self.assertEqual(predict({'level':1,'reference':a,'target':b})['status'],'INSUFFICIENT_DATA')
 def fixture(self):return {'level':2,'source_backend':'SYNTHETIC-GPU','target_backend':'SYNTHETIC-GPU','target_hardware':'fixture only','refresh_hz':60,'scale_evidence':'synthetic-unit-test; not a real benchmark','profile':{'exclusive_cpu':True,'render_critical_path_validated':True,'cpu_critical_ms':20,'render_critical_ms':15,'scheduler_unoverlapped_ms':1},'scale_intervals':{'cpu':[1,2],'render':[1,2]}}
 def test_overlapping_paths_and_vsync_not_added(self):
  r=predict(self.fixture());self.assertEqual(r['status'],'UNCALIBRATED_ESTIMATE');self.assertAlmostEqual(r['frame_ms_assumption_envelope'][1],21);self.assertAlmostEqual(r['frame_ms_assumption_envelope'][0],1000/60+1);self.assertFalse(r['hardware_verified'])
 def test_backend_transfer_and_nested_cpu_refused(self):
  d=self.fixture();d['source_backend']='SwiftShader';self.assertEqual(predict(d)['status'],'INSUFFICIENT_DATA');d=self.fixture();d['profile']['exclusive_cpu']=False;self.assertEqual(predict(d)['status'],'INSUFFICIENT_DATA')
 def test_nonfinite_or_reversed_intervals_refused(self):
  for bad in [[2,1],[float('nan'),2],[0,2]]:
   d=self.fixture();d['scale_intervals']['cpu']=bad;self.assertEqual(predict(d)['status'],'INSUFFICIENT_DATA')
if __name__=='__main__':unittest.main(verbosity=2)
