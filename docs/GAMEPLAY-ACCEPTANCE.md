# 最新 D6 Pages 線上驗收（2026-10-26 Asia/Taipei）

AFTER_DEPLOY_LIVE_VERIFIED **僅限已記錄場景**，維持PLAYTEST-EXPERIMENTAL。公開站點Build `d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c`，Pages發布Commit `6c98a8e6b7f7759ca57a9c9f94f675e2b6070381`。這是GitHub Pages，非OmGitHub新版Preview。

本輪實際線上驗收：28payload雜湊、583/583HAR/Git資源、原生Start/選取/移動/建築/訓練/SaveLoad/四語/匯出；300.9秒正常場景8次重新索敵、木85/金73/食51/石32次卸貨、無≥20模擬秒零載貨採集停滯；受控線上Rally/FIFO/諸葛弩/Boss4→8→12/Pause/戰鬥→選卡→第二波倒數均通過。614次請求、Console/Page/request/HTTP400+皆0。全部使用實際公開瀏覽器；沒有本地遊戲替代。

界限：Boss時計／建築／兩敵戰鬥採顯式fixture，不是自然十波。五分鐘自然場景仍第一波有活攻城槌，根因未確認；非英文Start Game保留英文。歷史效能FAIL、低FPS模擬時間問題、HARDWARE_TEST_PENDING、完整十波/全文明/高負載/任意舊存檔待驗均保留。B1/B2不因此自動正式整合。

詳見 [線上驗收報告](evidence/live-d6/REPORT.md)、[範圍與版本](evidence/live-d6/manifest.json)、[網路統計](evidence/live-d6/network-summary.json)。本分支是驗收工具／證據，非遊戲候選來源；實際遊戲Source仍D6、Candidate3779c5。以下是歷史紀錄，當時的Pages403/白名單阻塞已由本次實際built/HTTP200/瀏覽器驗證解除；原始失敗紀錄不刪除。

---

## Strategy v2.2.2 recovery status — current override

Recovery/handoff framework implemented and normally pushed; actual source/test/evidence state is in [STRATEGY-V2.2-EXECUTION.md](STRATEGY-V2.2-EXECUTION.md), [Recovery Manifest](recovery/WORKTREE-RECOVERY.md) and handoff/ACTIVE-TASK.json. Historical records below remain unchanged. Recovered12/12 corrected-window baseline cases (source11f8a6a),9PASS/3FAIL; no missing sample rerun. Target/Population/Civ bounded local acceptance does not equal integration.500/1000 FAIL remains research, not a project-wide lock. Simulation integrity, physical hardware and online deployment remain independent blocked/pending gates.

# Continuous acceptance v2

Statuses: IMPLEMENTED (code), LOCAL_VERIFIED (actual local browser/tests), INTEGRATED_VERIFIED (combined integration build passed), DEPLOYED_VERIFIED (authorized actual online build verified), BLOCKED, NOT_TESTED. Never promote a local result to deployed.

For every feature: unique ID and branch, reviewed diff, actual served commit/hashes, unit/integration result, real pointer/key actions, original three P0 regressions, Save/Load,4 locales, before/after perf delta. Only then merge into Gameplay Integration. Failure quarantines that branch; it does not halt independent designs/features.

Performance:100/200/250 both-team total actual combat,250 mixed (40 villagers+1hero+209 fighters; buildings/resources separate),3 fresh browser processes each, fixed seed/browser/viewport,8s warmup/20s measure. Original gates mean rAF<=33.3ms,P95<=50ms,>=90% moved>.15 by15s. Additional declared checks: actual pointer-command response<=250ms and completion, simulation/wall>=90%, persistent wanting-to-move/no-progress>=8s fraction<=2%; historical orderFailure flags are reported separately (they persist after recovery), actual attacks>=100; mixed>=4 unloads and positive economic credit. Record P50/P99,long-animation-frame durations, >50/>100ms stalls and raw JS spans. Single-pass counts or open-move fixtures cannot certify combat.

Full-ten-wave natural campaign3-run peak/stability is a separate release gate. Synthetic director envelope is CODE_INFERRED only. Product250 remains a stress target until actual repeated combat/mixed and campaign evidence support it.500/1000 historical failures are retained in extension reports and no longer prohibit Phase B–E development.

Three stages: preserve BEFORE_LIVE historical evidence; fresh AFTER_LOCAL per actual source; AFTER_DEPLOY_LIVE=DEPLOYMENT_BLOCKED until explicit supported deployment authorization. Original#17 never modified. Candidate exact SHA must be recorded and served-resource hashes checked; rollback is switching/stopping the isolated candidate, never rewriting Git history. Current OmGitHub workflow starts a modifying OpenCode run, not an exact-commit deploy-only contract. No workflow/issue invocation is authorized here.

## Current actual verdicts

B1 and B2 are IMPLEMENTED/LOCAL_VERIFIED in bounded feature/P0 cases, but **BLOCKED for integration**. Baseline100 rAF3/3 passes but stuck fraction fails2/3;200 quality1/3;250 combat3/3;250 mixed2/3. After B1 tested91569e2 mixed clock89.659% fails; final2f148c3 incremental fixes have focused native checks but full performance NOT_TESTED. B2 dc4698a has first combat stuck3.6% failure. Do not pool/retry away failures. Full natural ten-wave peak x3 remains NOT_TESTED, no final release budget. Full GDD remaining roster/tech and production clock switch remain BLOCKED. See STRATEGY-V2-EXECUTION.md and evidence/strategy-v2/acceptance.json for all actual SHAs and scope.

Input metric caveat: tiered runs record handler-to-movement; separate3x/source DOM-pointer-event-to-movement tests95.9–176.4ms before,51.7–110ms Rally,64.1–125.5ms civ pass250ms in normal-start scenes only, not OS hardware latency or250-unit end-to-end certification. New clock/stuck criteria do not rewrite original rAF/15s gates. Nominal20s capture can be shortened by warmup overrun; raw actual span is retained.
