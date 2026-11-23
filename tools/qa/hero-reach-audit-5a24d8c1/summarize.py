import json,sys
from pathlib import Path
root=Path(sys.argv[1]);base=json.loads((root/'chromium/REPORT.json').read_text());far=json.loads((root/'chromium-far/REPORT.json').read_text());node=json.loads((root/'node-final.json').read_text());rows=base['rows']+far['rows'];expected={'normal':0,'direct-fresh':12,'direct-existing':12,'direct-far':0,'direct-existing-far':12}
assert len(node['rows'])==128 and len(rows)==5
for row in rows: assert row['damage']==expected[row['label']]
assert all(row['before']['visible'] for row in rows)
result={'verdict':'REPRODUCED_NOT_FIXED','scope':'受控診斷；不是正式遊戲PASS或自然戰役','node_observations':len(node['rows']),'browser_cases':len(rows),'rows':[{'case':r['label'],'distance':r['before']['distance'],'normal_reach':r['formalReach'],'damage':r['damage']} for r in rows],'implementation_gate':'RESUME_BLOCKED_OWNERSHIP：原英雄Owner仍為OWNED，未確認合法接續身分。'}
print(json.dumps(result,ensure_ascii=False,indent=2))
