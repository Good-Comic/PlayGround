# Mid-End Windows Chrome / Edge acceptance

Status: **HARDWARE_TEST_PENDING**. This runnable collector has only Linux smoke validation until a physical Windows result is attached. Cloud SwiftShader results cannot certify GTX1650/RTX3050-class experience. Public benchmark extrapolation is UNCALIBRATED; no numerical FPS prediction is justified by currently collected hardware data.

Use a clean committed candidate checkout on a Windows PC, ideally a recent mainstream six-core Core i5/Ryzen5,16GB RAM,GTX1650/RTX3050 or AMD equivalent. Record AC power/power mode, laptop thermals, display refresh rate, browser version, background workloads and driver version. Keep the browser foreground at1080p,DPR1,100% browser zoom. Do not use RDP/software rendering as physical-GPU acceptance. Disable neither AI nor combat/economy/animation. Do not run heavy tests concurrently.

In PowerShell with Python3.11+ and Git installed:

```powershell
py -m venv "$env:TEMP\riftwatch-qa-venv"
& "$env:TEMP\riftwatch-qa-venv\Scripts\python.exe" -m pip install playwright
& "$env:TEMP\riftwatch-qa-venv\Scripts\python.exe" tools/qa/windows_acceptance.py --channel chrome --out "$env:USERPROFILE\Desktop\riftwatch-hardware-chrome"
```

Use `--channel msedge` and a separate output folder for Edge. The installed Chrome/Edge channel is used; no bundled Chromium install is required. Candidate remains local loopback, not OmGitHub deployment. Output must be outside checkout. Collector refuses dirty source and non-Windows unless explicitly `--smoke-cloud`; it starts/stops only its own local server. It does not modify Git, saves outside a fresh browser context, network policy or GPU flags.

Protocol: fixed TEU/steppe seed and ordinary live engine;3 fresh-browser repetitions each100/200/250 combat and250 mixed;10s warmup plus a full60s measurement after actual warmup completion. Both teams, workers and hero count toward total; mixed40workers+hero+209fighters. Standard fixture is synthetic open terrain,10buildings/finite resources in mixed; it is not the full ten-wave campaign, dense natural-map acceptance or a military population limit. Every result records actual manifest/source,rawrAF,JS work/update/draw/UI,mean/P50/P95/P99,alive/movement,attack/deposit counts,input-response/completion,long frames,stuck evidence,heap,Console/Page/request errors and screenshot. CDP GPU system info and CIM CPU/RAM/GPU/driver/display data are saved. `--diagnostic` on tiered_audit.py provides separate CPU/GC profiles; profile runs must not be pooled with ordinary acceptance.

Attach the complete `chrome://gpu` or `edge://gpu` report as `gpu-report.txt`, including Graphics Feature Status for Canvas/compositing, adapter/device IDs,driver and problems/workarounds. A WebGL renderer alone does not establish Canvas acceleration. Manually confirm the viewport,physical GPU and Mid-End match; collector does not automatically claim hardware PASS. Keep machine.json,runs,runner/server logs and operator notes together. Different fonts/browser/cadence make cross-machine FPS estimates uncertain.

Existing cloud gates remain meanrAF<=33.3ms,P95<=50ms,>=90% moved by15s plus input<=250ms,command completion,stuck<=2%,real combat/economic correctness.50–100 target60FPS,101–200 seek60FPS,250 targetoperable30FPS. A30FPS pass is not a60FPS claim. Simulation progress ratio is descriptive only. Proposed clock integrity check is <=0.1s/60s atspeed1; virtual-cadence evidence and unresolved Save/Load determinism must be reported separately. Full ten-wave3-run peaks/stability and actual physical input-to-photon latency require separate validation.

If the collector fails, preserve its output and error. Do not lower thresholds, change historical results, hide software fallback or rerun until green. No existing preview or deployment is updated by this tool.
