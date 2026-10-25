import sys,unittest,tempfile,zipfile,json,hashlib
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools/deploy'))
from prepare_site import prepare
class SiteTests(unittest.TestCase):
 def artifact(self,root,tamper=False,extra=False):
  p=root/'candidate.zip';body=b'game';meta={'commit':'a'*40,'status':'PLAYTEST-EXPERIMENTAL','builtAt':'2026-10-26','files':{'index.html':hashlib.sha256(body).hexdigest()}}
  with zipfile.ZipFile(p,'w') as z:
   z.writestr('index.html',b'bad' if tamper else body);z.writestr('build-metadata.json',json.dumps(meta));z.writestr('__qa_build.json',json.dumps(meta));z.writestr('.nojekyll','')
   if extra:z.writestr('../private','bad')
  return p
 def test_version_path_and_pointer_preserve_original_bytes(self):
  with tempfile.TemporaryDirectory() as d:
   r=Path(d);p=self.artifact(r);v=prepare(p,r/'site');self.assertEqual((r/'site/builds'/('a'*40)/'index.html').read_bytes(),b'game');self.assertIn('builds/'+('a'*40),(r/'site/index.html').read_text());self.assertEqual(v['hosting_status'],'PREPARED_NOT_DEPLOYED')
   with self.assertRaises(ValueError):prepare(p,r/'site')
 def test_tamper_and_traversal_rejected(self):
  for opts in [{'tamper':True},{'extra':True}]:
   with tempfile.TemporaryDirectory() as d:
    r=Path(d);p=self.artifact(r,**opts)
    with self.assertRaises(ValueError):prepare(p,r/'site')
if __name__=='__main__':unittest.main(verbosity=2)
