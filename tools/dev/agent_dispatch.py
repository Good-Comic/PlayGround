#!/usr/bin/env python3
"""Manual adapter plans only. Does not invoke another agent, API or paid service."""
import argparse,json,shutil
from pathlib import Path
ADAPTERS={'codex':lambda text:['codex','exec',text],'gemini':lambda text:['gemini','-p',text],'claude':lambda text:['claude','-p',text]}
p=argparse.ArgumentParser();p.add_argument('--agent',choices=ADAPTERS,required=True);p.add_argument('--package',type=Path,required=True);a=p.parse_args();r=json.loads((a.package/'handoff-package.json').read_text());assert not r['validation_errors'],'Incomplete handoff';prompt=(a.package/'NEXT-AGENT-PROMPT.md').read_text();print(json.dumps({'status':'MANUAL_ADAPTER_PLAN_ONLY','agent':a.agent,'installed':bool(shutil.which(a.agent)),'argv':ADAPTERS[a.agent](prompt),'execution_authorized_by_tool':False,'cli_compatibility':'USER_MUST_VERIFY_INSTALLED_VERSION_AND_FLAGS','paid_api_cost_cap':None,'automatic_dispatch':'DISABLED; requires explicit configured resource/cost limits and verified ownership'},indent=2))
