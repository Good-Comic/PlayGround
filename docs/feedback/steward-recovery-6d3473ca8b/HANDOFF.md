# 總管安全恢復切片 / Steward recovery slice

ACTIVE STRATEGY = `docs/STRATEGY-V2.4-GAME-FIRST.md`。`BILINGUAL_DOCUMENTATION_REQUIRED=true`。

繁體中文：本輪依排程指令從已保存的 `8fb185a3367101e9414de08f49fbb2b747500f8c` 接續，不重新套用已完成的姿態、沙暴、Wave10或PixelFX工作。新專案自聲明身分 `codex-steward-recovery-6d3473ca8b`，任務 `STEWARD-RECOVERY-6D3473CA8B`，獨立分支 `codex/riftwatch-steward-recovery-6d3473ca8b`。舊任務已釋放；本輪乾跑236並正常CAS發布237，確認OWNED，所有權提交 `aa5bcee4f0826d5f45258fa300bce80733eec785`。不是平台認證身分，不使用prior-stopped。

English: Resumes scheduled work from saved `8fb185a3367101e9414de08f49fbb2b747500f8c` without reapplying completed pose, sandstorm, Wave10 or PixelFX work. New project self-declaration is `codex-steward-recovery-6d3473ca8b`, task `STEWARD-RECOVERY-6D3473CA8B`, independent branch `codex/riftwatch-steward-recovery-6d3473ca8b`. The old task was released; this task was dry-run at236 and normally CAS-published at237, confirmedOWNED at `aa5bcee4f0826d5f45258fa300bce80733eec785`. This is not platform-authenticated identity; no prior-stopped assertion was used.

## 玩家可見修復 / Player-visible fixes

| 問題 / Problem | 修復 / Fix |
|---|---|
| 缺食物／黃金或預留石材使純木房屋、軍營全部停工 / Food/gold shortfall or reserved stone blocked unrelated housing/army costs | 預留只檢查實際消耗的資源；手動命令仍可自行支出。/ Check reserves only for resources actually charged; manual spending remains authoritative. |
| 手動開始升級後仍有確認提案，點擊可誤報成功 / Manual research left a stale proposal that could falsely report success | 研究中、已滿時代、改成手動或缺費用時清除過期提案，確認前重驗。/ Clear invalid proposals during research, max age, manual mode or insufficient funds; revalidate on confirmation. |
| 自動升級花掉玩家預留 / Automatic ages consumed configured reserves | 自動升級扣費後仍須保留玩家指定底線；不限制玩家手動升級。/ Automatic research must leave the configured floor; manual research remains unrestricted. |
| 自動訓練只留升級費，沒留費用加底線 / Training reserved the fee but not fee plus floor | 自動模式預留兩者總和；詢問模式沿用明確玩家確認可支出的原規則。/ Auto mode reserves fee plus floor; ask mode retains the existing explicit-manual-confirmation spending rule. |
| 首名村民受困時其他村民不接手 / Trapped first worker prevented other workers from building | 依距離嘗試可用工人；每次最多12次尋路，保存續查位置，可存讀檔；不改建造費、速度或RNG。/ Try workers by distance with at most12 path searches per call and a persisted resumable cursor; costs, build speed and RNG are unchanged. |

繁體中文：主要修改 `js/stewards.js`、新增 `tests/steward-recovery.test.mjs`。最後遊戲來源 `f56929a1c4836fae8de620fe43f96c7bfe5d24ac`；正式構建147項資源SHA-256全部一致。新增測試提交／文件提交不改構建內容。公開網址仍收到代理CONNECT403；未部署、未改RC/main/Pages/舊Issues/不可變構建，也未改其他Owner的Progress Feed或建立排程。現有Strategy與最近Feed皆已只讀核對。

English: Main changes are `js/stewards.js` and new `tests/steward-recovery.test.mjs`. Final gameplay source is `f56929a1c4836fae8de620fe43f96c7bfe5d24ac`; all147 official-build resource SHA-256 hashes match. Later test/document commits do not change its payload. The public URL still returns proxyCONNECT403. No deployment, RC/main/Pages/old-Issue/immutable-build change, other-owner Progress Feed edit or scheduler creation occurred. Current strategy and recent feed were checked read-only.

## 驗證矩陣 / Validation matrix

| 類別 / Category | 結果 / Result |
|---|---|
| Node定向及經濟／人口／原生存檔暫停／導航回歸 / Focused Node and economy/population/native-save-pause/navigation regressions | 40/40 PASS；未重跑不相關全套歷史測試。/40/40PASS; unrelated full historical suites were not rerun. |
| 真正修復前失敗 / Genuine pre-fix failures | 原始預留、過期提案、自動升級預算、合併預留及受困工人FAIL均保留。/ Original reserve, stale-proposal, auto-age-budget, combined-reserve and blocked-worker failures retained. |
| 夾具錯誤 / Fixture error | 首次新增工人測試漏import，保留ReferenceError；補正後重新在未修復程式重現真正FAIL，再修復通過。/ Initial worker test omitted an import; ReferenceError retained, then genuine failure reproduced against unpatched code before passing. |
| Chromium資源／提案 / Chromium resources/proposals | 來源2f1c05cc：同場景舊版兩屋、新版三屋完工；舊版研究中仍可確認，新版無過期提案，無pageerror。/ Source2f1c05cc: two houses before versus three complete after; stale confirmation disappears during research; no page errors. |
| Chromium受困工人 / Chromium trapped builder | 來源f56929a：舊版首名id7受困且無施工，新版id10接手，18.6模擬秒時第三屋完成。/ Sourcef56929a: trappedid7 blocked old construction;id10 takes over and third house completes by18.6 simulation seconds. |
| 自然樣本 / Natural sample | 來源8a4c8f8，CHN，Seed3052366094，306秒現實／297秒模擬；正常資源、速度、波次，完成兩波、領取gold_teeth及bronze_oath、進入第三波、達時代2，無pageerror。/ Source8a4c8f8,CHN,seed3052366094,306wall/297simulation seconds; ordinary resources/speed/waves; cleared two waves, claimed gold_teeth and bronze_oath, reached wave3 and age2, no page errors. |
| 手動控制／SaveLoad / Manual control/SaveLoad | 自然樣本實際儲存→重載→繼續；id8手動停止後保持idle/manual，交還總管後採集／交貨；達時代2後玩家正常切換手動升級以優先軍事。/ Native Save/Reload/Continue;id8 remains idle/manual after Stop and resumes gathering/returning after release; player legitimately changes age planning to manual after age2 to prioritize army. |
| 首輪自然樣本限制 / First natural-scenario limit | 腳本只選卡漏按領取，停在波1選卡；保留為TEST_SCENARIO_LIMITATION，非遊戲Softlock。第二輪實際按領取後續行。/ Script selected but omitted Claim, remaining at wave1 reward: preserved asTEST_SCENARIO_LIMITATION, not gameplay softlock. Second run claims rewards and continues. |
| 暫停／SaveLoad／RNG / Pause/SaveLoad/RNG | 續查游標與預留保存、暫停不推進、RNG位元測試PASS；不代表歷史嚴格完整SaveLoad FAIL已修復。/ Cursor/reserve persistence, frozen paused state and RNG-bit testsPASS; historical strict full SaveLoadFAIL is not declared fixed. |
| 性能 / Performance | 共享EPYC9V74，5可見CPU／4CPU配額，Node受困8工人30次規劃P50約6.48ms、P95約10.06ms、max30.24ms；僅規劃短測。/ SharedEPYC9V74,5visible/four-quotaCPUs;30 blocked-eight-worker planning calls: P50~6.48ms,P95~10.06ms,max30.24ms; planning micro-sample only. |

繁體中文：正式瀏覽器為Headless Chromium154.0.8037.57、1366×768；沒有可分享即時觀看工具，採真正錄影與狀態JSON。小型影片為實錄連續片段的縮放／壓縮，不是截圖合成。完整29MiB自然錄影保留本機且標為LOCAL_ONLY，Git只保存開局、領卡及工人接手片段與來源／SHA。自然樣本在工人搜尋改動之前；最終工人改動由受控實戰驗證，不冒稱最終版本已自然三波通過。

English: Headless Chromium154.0.8037.57 at1366×768. No shareable live-view tool is available, so actual recordings and stateJSON are used. Small videos are scaled/compressed continuous real footage, not screenshot montages. The full29MiB natural recording remains local and explicitlyLOCAL_ONLY; Git retains opening/reward/worker-takeover excerpts with source/SHA provenance. The natural sample precedes the worker-search change; the final worker change has controlled gameplay verification, not a claimed final-build natural three-wavePASS.

## 下一步與限制 / Next steps and limits

繁體中文：延長最終構建的自然第三波／第五波與軍務資源競爭樣本；保存每個原生存檔以便真正接續。完整十波、自然NG+、實體GPU、長時間記憶體、其他瀏覽器及公開部署回歸仍未驗證；所有歷史FAIL／INCONCLUSIVE／NOT_TESTED保持。舊分支沒有接管，後續執行須重新確認身分及遠端所有權；237是認領歷史值。來源f56929a可重建147項正式本機構建。

English: Extend final-build natural wave3/wave5 and military resource-competition samples, preserving native saves for real continuation. Full ten waves, naturalNG+,physicalGPU,long-term memory,other browsers and public deployment regressions remain unverified; historicalFAIL/INCONCLUSIVE/NOT_TESTED remain. No old branch was taken over. Future execution must revalidate identity and remote ownership;237 is the historical claim version. Sourcef56929a rebuilds the147-payload official local artifact.

繁體中文：連續性稽核：此交接仍有可執行授權工作，主動結束應標AGENT_EARLY_STOP，不把完成Push當平台限制。下一步與量測範圍見RECOVERY.json；自動排程介面未驗證，不宣稱背景執行。English: Continuity audit: authorized executable work remains, so voluntary ending isAGENT_EARLY_STOP, not a platform limit inferred from a completed push. RECOVERY.json records next work and measurement scope; scheduler access is unverified and no background execution is claimed.
