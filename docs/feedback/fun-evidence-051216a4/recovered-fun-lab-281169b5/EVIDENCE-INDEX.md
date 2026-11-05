# 證據索引

## 第六、七切片的新證據入口

本整理已知已驗遠端收據為35dedfe，P3另有本地9117a02候選、Node64／64，正式驗收中／尚未推送。新來源請以各報告及收據區分，不把舊checkpoint當永遠最新。[七切片矩陣](MULTI-AGENT-PLAYTEST-MATRIX.md)、[樂趣評估更新](FUN-EVALUATION-REPORT.md)、[交接](HANDOFF.md)及[下一步](NEXT-FUN-IMPROVEMENTS.md)提供判讀。

| 類別 | 倉庫內證據與範圍 |
| --- | --- |
| 第六切片B完整自然續玩 | [原報告](source-actions/B-natural-retest/REPORT.md)、[JSON](source-actions/B-natural-retest/REPORT.json)、[原seal](source-actions/B-SEALS.json)、[本次seal核對](source-actions/SEAL-VERIFICATION.json)；第4波敗北且finish，非新十波 |
| 自然查看／16人反擊 | [查看](source-actions/B-natural-retest/screen-0006.png)、[集火](source-actions/B-natural-retest/screen-0007.png)、[結算](source-actions/B-natural-retest/screen-0009.png)、[連續片段](source-actions/B-natural-retest/continuous-view-retaliate-defeat.webm)；個體／取消／後令未評估 |
| Director獨立複評／P3範圍 | [來源玩家複評](source-actions/director/SOURCE-ACTIONS-PLAYER-REVIEW.md)、[P3範圍](source-actions/director/PRODUCTION-SCOPE-REVIEW.md)；兩份原文SHA核對，不改結論 |
| 171技術與初效能 | [Node整合](source-actions/node-integration-r1.txt)、[相容](source-actions/node-compatibility-r1.txt)、[162資源](source-actions/resource-check.json)、[來源Chrome36](source-actions/browser/result.json)、[旗手29](source-actions/flag-compatibility/result.json)、[初次ABBA](source-actions/performance-initial/result.json)；200 after99.9對83.4與UI faults保留 |
| 真實HUD缺陷／快取 | [原三紅燈與交接](source-actions/cache-debug/交接.md)、[原61/3](source-actions/cache-debug/initial-fail.tap)、[定向111/111](source-actions/cache-debug/final-focused.tap)；非夾具問題 |
| 35功能重驗 | [結算Chrome19](terminal-input/browser/result.json)、[來源Chrome38](source-actions/browser-r2/result.json)、[旗手29](source-actions/flag-compatibility-r2/result.json)、[Node213](terminal-input/combined-node-r2.txt)、[162資源](terminal-input/resource-check.json)、[實際遠端收據](terminal-input/remote-receipt.json) |
| 終局自然P1／原始紅燈 | [自然B摘要](terminal-input/natural-B-before-defect.json)、[E前完整快照](terminal-input/snapshot-7-false-4-defeat.json)、[E後完整快照](terminal-input/final-snapshot.json)、[seal核對](terminal-input/SEAL-VERIFICATION.json)、[原Node2/6](terminal-input/before-node-r1.txt) |
| 根代理Chrome期待錯誤 | [cycle期待FAIL](terminal-input/initial-fixture-cycle-fail/result.json)、[liveCD期待FAIL](terminal-input/initial-fixture-cooldown-fail/result.json)；只改腳本，不與自然P1／cache真紅燈混稱夾具 |
| 200限定r2 | [原結果](source-actions/performance-r2/result.json)、[before1](source-actions/performance-r2/200-before-1.png)、[after1](source-actions/performance-r2/200-after-1.png)、[after2](source-actions/performance-r2/200-after-2.png)、[before2](source-actions/performance-r2/200-before-2.png)、[trace核查](source-actions/SEAL-VERIFICATION.json)；after118筆uiFaults0，before缺欄不補0；只支持短樣本未見一致額外退步 |
| 副本大小／SHA | [來源操作manifest](source-actions/COPY-MANIFEST.json)、[終局manifest](terminal-input/COPY-MANIFEST.json)；不含manifest自我遞迴，不修改raw/sealed |

來源操作與終局資料夾還保留原生actions、observer、metrics、測試腳本、歷史FAIL、受控錄影及正式build metadata。受控傷害／victory／NG+不等於自然成功。完整長錄影沒有新增可下載宣稱；B片段目前僅repo歸檔，獨立原片段與精確裁切offset未取得，manifest照實標示，不能虛構下載或來源。

## 第一閉環證據

第一閉環固定6075來源，以下三角色Before／After報告及原結論不改。原始報告保留原文，不補譯，不把後續單角色續測混成原cohort。

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
