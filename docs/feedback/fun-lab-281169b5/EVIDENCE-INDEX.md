# 證據索引

第一閉環來源為6075dbaae8281de54ec5c932e349b0ed591f3c7f；下一旗手切片仍在實作，沒有新結果。本索引連到倉庫內實際封存檔案；原始報告保留原文，不補譯、不改結論。

| 角色 | Before報告／結算／連續尾段 | After報告／結算／連續尾段 | 代表性After畫面 |
| --- | --- | --- | --- |
| A | [報告](evidence/A-before/REPORT.md) · [JSON](evidence/A-before/REPORT.json) · [結算](evidence/A-before/final.png) · [影片](evidence/A-before/combat-ending.webm) | [報告](evidence/A-after/REPORT.md) · [JSON](evidence/A-after/REPORT.json) · [結算](evidence/A-after/final.png) · [影片](evidence/A-after/combat-ending.webm) | [0005](evidence/A-after/screen-0005.png) · [0006](evidence/A-after/screen-0006.png) · [0009](evidence/A-after/screen-0009.png) |
| B | [報告](evidence/B-before/REPORT.md) · [JSON](evidence/B-before/REPORT.json) · [結算](evidence/B-before/final.png) · [影片](evidence/B-before/combat-ending.webm) | [報告](evidence/B-after/REPORT.md) · [JSON](evidence/B-after/REPORT.json) · [結算](evidence/B-after/final.png) · [影片](evidence/B-after/combat-ending.webm) | [0009](evidence/B-after/screen-0009.png) |
| C | [報告](evidence/C-before/REPORT.md) · [JSON](evidence/C-before/REPORT.json) · [結算](evidence/C-before/final.png) · [影片](evidence/C-before/combat-ending.webm) | [報告](evidence/C-after/REPORT.md) · [JSON](evidence/C-after/REPORT.json) · [結算](evidence/C-after/final.png) · [影片](evidence/C-after/combat-ending.webm) | [0007](evidence/C-after/screen-0007.png) · [0008](evidence/C-after/screen-0008.png) · [0009](evidence/C-after/screen-0009.png) |

各evidence/角色-輪次還有session.json、actions.jsonl、action-observer.jsonl及metrics。玩家紀錄與觀察員診斷分開，後者未提供給遊玩中的隔離玩家。Before較早的metrics.json原封保留；來源後來僅新增六個片段／時鐘欄位、原有值未變，另存metrics-final.json。本次複製清單與SHA見 [EVIDENCE-COPY-MANIFEST.json](EVIDENCE-COPY-MANIFEST.json)。

三個After影片是原始Chromium錄影的連續尾段，串流複製、不加速、不合成；要求最後40秒，因WebM關鍵影格實長A43.20、B44.12、C43.28秒。Before既有尾段約52–54秒，原封保留。**完整錄影僅本機保存**，[LOCAL-VIDEO-MANIFEST.json](LOCAL-VIDEO-MANIFEST.json)列六個完成及三個排除工作階段的SHA／大小；其中sourcePath只是本機來源識別，不是可下載入口。影片取樣不保證含整個錯令鏈，應與原生動作紀錄及代表截圖合讀。

| 類別 | 倉庫內證據 |
| --- | --- |
| 封存／快照 | [12份報告重算](REPORT-SEAL-VERIFICATION.json)、[Before封存](BASELINE-SEALS.json)、[After封存](AFTER-SEALS.json)、[恢復點SHA](FOCUSED-RETEST-CHECKPOINTS.json)；未改副本位於evidence/checkpoints/ |
| Director | [原初評](evidence/director/REVIEW.md)、[原初評JSON](evidence/director/DECISIONS.json)、[原複評](evidence/director-after/POST-REVIEW.md)、[原複評JSON](evidence/director-after/POST-DECISIONS.json)、[整理裁決](GAME-DIRECTOR-DECISIONS.md) |
| 比較度量 | [主要前後結果](BEFORE-AFTER-RESULTS.json)、[原始分析副本](evidence/analysis/BEFORE-AFTER-RESULTS.raw.json)、[對齊窗口](MATCHED-WINDOW-RESULTS.json) |
| 技術 | [新增Node](evidence/technical/node-readback-final.txt)、[相關回歸](evidence/technical/node-regression.txt)、[Chromium34項](evidence/direct-after/result.json)、[額外11項](evidence/direct-after-extra/result.json)、[160資源雜湊](evidence/direct-after/hashes.json) |
| 效能 | [四個短樣本原結果](evidence/performance/result.json)、[Before100](evidence/performance/before-100.png)、[After100](evidence/performance/after-100.png)、[Before200](evidence/performance/before-200.png)、[After200](evidence/performance/after-200.png) |
| 排除場次 | [B-before中斷](INTERRUPTION.json)、[A-after中斷](AFTER-A-INTERRUPTION.json)、[B-after啟動逾期](B-AFTER-CONTROLLER-STARTUP.json)、[控制器恢復驗證](CONTROLLER-RECOVERY-TEST.json) |

完整解讀與限制見 [樂趣報告](FUN-EVALUATION-REPORT.md) 與 [測試矩陣](MULTI-AGENT-PLAYTEST-MATRIX.md)。Strict RNG Save/Load仍FAIL；N=1、知情學習、非新十波、SwiftShader非硬體、死亡使100／200負載下降及較高200 after heap／長測未證明都保留。
