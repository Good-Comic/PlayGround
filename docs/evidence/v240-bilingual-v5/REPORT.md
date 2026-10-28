# 雙語規範與 V5 初步驗證 / Bilingual Requirement and V5 Pilot

`BILINGUAL_DOCUMENTATION_REQUIRED = true`

## 本輪範圍 / Scope

**繁體中文：** 永久採用繁體中文在前、英文在後的實質對等文件。ACTIVE STRATEGY 新第16節、共用 Agent 入口、目前 Handoff 摘要與 Recovery 產生敘述已雙語化；既有歷史段落仍標為待逐步補譯。機器 JSON、欄位名稱及原始測試證據不改格式或結論。這不是全庫翻譯完成聲明。

**English:** Permanently require substantively equivalent Traditional Chinese followed by English documentation. ACTIVE STRATEGY's new section16, shared Agent entry instructions, current Handoff summary, and generated Recovery narrative are bilingual. Historical passages remain explicitly pending incremental translation. Machine JSON, field names, and raw evidence retain their formats and conclusions. This does not claim repository-wide translation completion.

## V4 觀察與 V5 假設 / V4 Observations and V5 Hypothesis

**繁體中文：** V4 第二波期間經濟人口由7降至1；最終第四波戰敗時約有693木材、14黃金，科技到第二時代。這支持優先調查採集區保護、資源分配與閒置木材運用，不能證明 Normal 不可能通關。V5 使用既有 Teutons 房屋箭火、原生建造／指令／卡牌，關閉自動花費食物的村民訓練，並處理待命村民的黃金／食物工作。沒有修改遊戲平衡、生成資源或跳波。

**English:** During V4 wave2, economic population fell from7 to1. At its final wave4 defeat, about693 wood and14 gold remained, with age2 reached. This supports investigating gathering-area protection, resource allocation, and unused wood; it does not prove Normal unwinnable. V5 uses existing Teutons house arrows and native construction/commands/cards, disables food-consuming automatic worker training, and assigns idle workers to gold/food. No game balance, resource grants, or wave skipping are introduced.

## 預先界定的試跑 / Predeclared Pilot

**繁體中文：** 精確遊戲來源 `a5a538d287b9c29951a83ebede5431db9fce7dc7`，34檔 Artifact，本地真實 Chromium，TEU／steppe／MILESTONE-NORMAL，既有1.5×設定。此180秒有界試跑先觀察新策略是否能正常操作與保留狀態，不作完整十波驗收。觀察目標為市鎮中心存活、有村民存活、實際科技研究與合法房屋建造；任何未達項目均如實記錄。每90秒原生 Save 同步匯出完整遊戲快照，並保存最後狀態、錄影、Console／Page Error／失敗請求。實際完成十波前，整體仍為 NOT_PASSED。

**English:** Exact game source `a5a538d287b9c29951a83ebede5431db9fce7dc7`,34-file artifact, real local Chromium, TEU/steppe/MILESTONE-NORMAL, existing1.5× setting. This bounded180-second pilot first observes whether the new policy operates and preserves state; it is not full ten-wave acceptance. Observe Town Center survival, worker survival, actual technology research, and legal house construction, recording unmet goals honestly. Each90-second native Save exports a complete game snapshot, alongside final state, video, Console/Page Errors/failed requests. The overall campaign remains NOT_PASSED until ten waves actually finish.

## 保留事項 / Preserved Gaps

**繁體中文：** V1 第五波戰敗、V2 第四波工具中斷、V3／V4 第四波戰敗均保留。New Game+ 只有受控勝利狀態功能證據，尚非自然十波後驗收。低 FPS 時鐘、嚴格 Save/Load 非確定性、材質效能 FAIL、自然 Rift Prototype 未重現及 HARDWARE_TEST_PENDING 不變。沒有公開發布。

**English:** Preserve V1's wave5 defeat, V2's wave4 harness interruption, and V3/V4's wave4 defeats. New Game+ has controlled-victory functional evidence, not natural post-ten-wave acceptance. Low-FPS clock issues, strict Save/Load nondeterminism, the material performance FAIL, unreproduced natural Rift Prototype crash, and HARDWARE_TEST_PENDING remain unchanged. No public release occurred.

## 保存與接續方式 / Preservation and Continuation

**繁體中文：** V5 工具保留既有遊戲 Save Schema。可由原始、存活且處於 prep／wave 的觀察快照透過原生 Continue 接續；匯入前必須提供正確 SHA-256，並明確標示為既有存檔接續，而非未中斷的新戰役。此機制不證明嚴格確定性，也不能把戰敗或受控勝利 Fixture 當自然通關。來源 Commit 必須另外核對。

**English:** The V5 tool preserves the existing game Save schema. An original observed living prep/wave snapshot can continue through native Continue; its correct SHA-256 is mandatory before import, and the run is explicitly labelled as a saved-run continuation rather than an uninterrupted fresh campaign. This does not establish strict determinism and cannot count defeated or controlled-victory fixtures as natural wins. Verify the source commit separately.

```sh
PLAYWRIGHT_BROWSERS_PATH=/tmp/pw-browsers node tools/qa/natural_campaign.mjs \
  --url http://127.0.0.1:8053/riftwatch-v5-baseline/ \
  --commit a5a538d287b9c29951a83ebede5431db9fce7dc7 \
  --policy v5 --seconds 1800 --out /workspace/diagnostics/riftwatch/v5-continuation \
  --resume PATH_TO_OBSERVED_CHECKPOINT --resume-sha256 EXPECTED_SHA256
```

## 實際結果 / Observed Results

**繁體中文：** 180秒試跑結束為 `BOUNDED_SAMPLE_INCOMPLETE`，第二波仍在進行；遊戲回報時間 263.86 秒，經濟人口 0，房屋 8 座，市鎮中心 3375/3600，第二時代已完成。村民存活目標為 FAIL；其他列出的試跑觀察目標與存檔接續檢查達成，瀏覽器錯誤及失敗請求為0。不能將此視為十波 PASS 或模擬時間正確性驗證。完整原始樣本、實際影片與畫面均保留。

**English:** The180-second pilot ended as `BOUNDED_SAMPLE_INCOMPLETE` during wave2. Reported game time was 263.86 seconds; economic population 0, 8 houses, Town Center 3375/3600, with age2 completed. Worker survival failed; the other listed pilot goals and saved-run continuation checks were met, with zero browser errors/failed requests. This is neither ten-wave PASS nor simulation-time integrity verification. Raw samples, actual video, and screenshot are preserved.

**繁體中文：** `resume/valid.json` 顯示原生 Continue 從觀察存檔接續；錯誤雜湊被以 `RESUME_DIGEST_MISMATCH` 拒絕，未執行任何玩家指令。`verification.json` 保留工具雜湊與最終存檔 SHA-256。下一輪可從 `pilot/save-snapshot.json` 接續第二波；該最終快照為存活狀態。Recovery 定向測試9項通過，產生的 JSON 頂層 Schema 與之前相同。首次文件檢查發現行尾空白，已修正並重新通過 `git diff --check`；原始檢查日誌保留。

**English:** `resume/valid.json` shows native Continue from an observed save. An incorrect digest was rejected as `RESUME_DIGEST_MISMATCH` before any player commands. `verification.json` preserves the harness hash and final save SHA-256. Next execution can continue wave2 from the living `pilot/save-snapshot.json`. All9 directed Recovery tests passed; generated JSON retains its prior top-level schema. The initial document check found trailing whitespace, which was fixed and rechecked with `git diff --check`; the original check log is retained.
