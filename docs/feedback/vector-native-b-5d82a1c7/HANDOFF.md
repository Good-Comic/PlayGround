# 玩家 B 混合戰場快取驗證與交接

本輪只新增診斷腳本與原始證據，未修改遊戲或公開版本。以封存第四波原生快照經正式 Continue 續玩，不重跑三角色戰役，也未重新下達戰術命令。這是受控排程的自然存檔續玩：每次 render 推進一次原 Game.update(1/60)，共 360 步、6 模擬秒；不是即時自然戰役或真人趣味評估。

## 已核實來源

安全繼承 c932b628f61a9c6fc0a94d66760c2339051e435e；Strategy e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d。
對照正式本地構建 19f91ea8da075c39e3fe7681a92896cd515d48cf；快取構建 960f5bd6c83134d6dafc746a83d9a981f8170f86。每次皆核對 168 個資源 SHA-256 與遊戲內完整性驗證。
來源快照 SHA-256 afc0f23e61ef34ff1b8bab09cb18bc67280df0e5c96a8b7e2ad623b3f67c7262；保留 source-save.json.gz。沒有改兵種、資源、地圖或命令；只有相同相機定位。

## 結果與測試矩陣

| 驗證 | 結果 | 證據／限制 |
|---|---|---|
| 四次 A1/B1/B2/A2 初始快照與地圖 | PASS | browser/REPORT.json |
| 四次結尾序列化 Game.snapshot 與 RNG | PASS | 結尾 hash 9bef01df573e8fd269db880bb2ddb2af94182c537283d1a1301d2757d99375f8；不涵蓋全部瞬時導航狀態 |
| 真實混合場景快取命中 | PASS | 5762/6470，89.06%；僅 17.22% Sprite 呼叫符合快取條件 |
| 整體 FPS 改善 | INCONCLUSIVE | 未觀察到改善，詳見下表 |
| Chromium 錯誤／構建完整性 | PASS | 無 pageerror，四次各 168 檔 |
| 新 Node 遊戲回歸 | NOT_TESTED | 無遊戲程式修改；腳本語法檢查另行保存 |
| Windows 實體 GPU、長期記憶體、完整戰役 | NOT_TESTED | 雲端 SwiftShader 短測不可代替 |
| 新指令的戰術成功 | NOT_TESTED | 本輪沒有發出新命令，不能宣稱修復接敵或 C-36 |

| 場次 | FPS | 幀 P50/P95 ms | Sprite ms/幀 |
|---|---:|---:|---:|
| A1 | 30.74 | 31.6 / 38.8 | 1.640 |
| B1 | 29.29 | 32.6 / 46.3 | 1.196 |
| B2 | 28.91 | 33.4 / 43.8 | 1.333 |
| A2 | 29.36 | 33.2 / 44.0 | 1.551 |

Sprite 局部平均約省 0.33 ms/幀，不能推論整體 FPS 提升。四次結尾皆存活 49，城心由 2986.05 降至 2925.485，英雄由 554.072 降至 532.104，戰鬥結果相同。atlasFallback 是既有程序繪圖路徑，並非資源損壞。

重要校準限制：所有場次 Continue 後等待 450ms，B1 測量前額外截圖，增加未校準的暖機時間；原始證據照實保留，不重跑求漂亮數字。REPORT.pass 僅表示腳本的窄條件，不代表整體性能 PASS。profile 單場的 initialMatched/finalMatched 是單列自比，沒有前後驗證意義。

## 定向剖析

另保存 profile、profile-root、profile-properties 三組 120 步原始數據。代表性 root 測量：renderer 27.76 ms/幀，迷霧 6.45、單位 2.85、資源 0.86、建築 0.64，前景特效 0.053；字型 setter 另場僅約 0.015。這些結果排除特效和字型設定為主要成本，仍有大量未歸因耗時。戰術規劃器僅檢視原碼，未單獨量測，不能宣稱已排除。下一步宜對 renderer.draw 裝飾器及主函式做一次 CPU 取樣，避免再用零碎猜測修改。

Node v24.19.0；Chromium 154.0.8037.57；ANGLE SwiftShader。畫面 browser/after-start.png、after-end.png 已人工檢視，為實際第四波戰場。

## Ownership 與接續

任務 VECTOR-NATIVE-B-5D82A1C7；執行 vector-native-b-20261128-5d82a1c7；分支 codex/riftwatch-vector-native-b-5d82a1c7。認領 v416，收據 f481802bbda972720bc1283d0b69efd9f5d97574；釋放狀態以最後遠端收據為準。不動其他 Owner。

STOP_REASON：AGENT_EARLY_STOP；本輪選擇封存已完成的診斷，仍有合法剖析待辦，未聲稱環境或額度阻塞。
EXECUTION_DURATION：UNKNOWN（缺少完整回合起始計時）。
CHECKPOINT_SHA：本文件所屬提交之前的安全來源 c932b628f61a9c6fc0a94d66760c2339051e435e；本輪最終 SHA 由 Git 與外部收據核實，避免遞迴更新。
NEXT_AUTHORIZED_TASK：對同一 B 快照的 renderer.draw 主函式／裝飾器做一次短 CPU 取樣，確認未歸因成本後才選最小修正。
AUTO_RESUME_AVAILABLE：UNVERIFIED；QUOTA_PERCENT_UNKNOWN。未修改排程或宣稱背景執行。
