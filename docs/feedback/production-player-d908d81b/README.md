# 新一般玩家 B2：生產與守城續玩驗證

本次是新的原生子代理樣本，固定遊戲 `6852cf85acca5c08923e0191a1e0703189f4d3e6`，工具基準 `c33ae1640dd7bdf079344fa7ba617e745c57c048`。任務 FUN-PRODUCTION-PLAYER-D908D81B，Ownership276；原 FUN-LAB Owner273未被替換，也沒有宣稱已停止。依使用者最新指令，整理與交接採臺灣正體中文。

**實際結果**

B2 由原封已觀察存檔按正式 Continue 續玩至第4波敗北並 finish。Continue59.840→敗北觀察160.931，101.091秒牆鐘，包含總管面板暫停。結算累計3波、73擊殺、採集4,253、8:45；不是本角色新取得總量，也不是新開局自然十波。瀏覽器程式錯誤0，正式163資源SHA-256重新全數通過。

| 驗收項目 | 本次結論 |
| --- | --- |
| 正式Continue、自然結算、finish | 已完成；正式敗北保留 |
| 新穩定控制器原生反擊 | 可見18人集火衝車；不代表已到位、命中或擊殺 |
| 食物優先與儲存 | 已送出、面板關閉；角色沒有重開核對生效值，不冒稱理解驗收通過 |
| 生產成本／保留／缺口 | NOT_EVALUATED：角色沒有到達軍事生產及費用表 |
| 待命村民／維修 | 意圖未完成，1→0時序不足以判按鈕故障；不直接曝光有疑點的repair |
| 樂趣／再玩意願 | AI主觀短樣本：有趣5/10、再玩6/10；不是人類或改版因果證據 |
| 新Node回歸 | 未重跑：本任務未改遊戲程式，沿用已固定來源的有效64／213項證據 |
| 自然十波、自然NG+、真人、硬體GPU | 未驗證，不提升既有狀態 |

[玩家原報告](player-B2/REPORT.md)、[獨立導演審查](director/REVIEW.md)、[實際輸入](player-B2/after/actions.jsonl)、[結算圖](player-B2/after/screen-0011.png)、[連續原生錄影](player-B2/after/campaign.webm)與[Root校驗](ROOT-VERIFICATION.json)均保存。影片ffprobe實際可讀，166.6秒、13,340,542 bytes；僅保存一份canonical錄影，同內容生成副本保留在原本地目錄，沒有刪除。原角色MD／JSON與導演MD／JSON的封存bytes全部相符。

**還沒解決的操作問題**

軍事生產位在很長的經濟／建造表格之後；導演建議頂端直達既有軍務區，避免重做費用表或偷偷套用草稿。這是待合法獨立實作與新玩家驗證的候選，不把本次未到達說成功能不存在或已修復。修理有正式GDD數值，但現有扣款／速率／受傷等待有靜態疑點，工人與輸入語義未定，維持SPEC_DECISION_REQUIRED；未受控重現即不宣稱真實修理缺陷已確認。

**額外唯讀效能診斷**

先前200負載約13FPS仍是風險。本次同一受控場景做30秒CDP CPU抽樣，主要時間集中於迷霧合成；[原始profile](cpu-profile/baseline.cpuprofile)、[呼叫路徑](cpu-profile/CPU-CALLPATHS.json)及[結果](cpu-profile/result.json)保留。12.56FPS是instrumented診斷，不當成無Profiler的新正式基準，也非自然玩家流程。原夾具停用自動經濟／生產，仍有AI、碰撞、死亡與增援；沒有改舊夾具取得比較PASS。

[單一圓包含原型](vision-prototype/result.json)在凍結畫面把152來源減至124；[聯集覆蓋原型](vision-prototype-union/result.json)減至43，兩者每個RGBA byte均相同、快照相同。聯集原型首次計算約5.1ms；每10次mask繪製約337–343ms降至98–104ms，未含逐幀重算，不能稱全遊戲FPS提升。這些只是單一場景的可行性證據；正式實作必須使用實際螢幕投影中心、保守AA餘裕，補測地形高低、縮放、沙暴、暫停及讀檔，並用未啟用Profiler的前後完整場景量測。原型不能代替遊戲功能提交或正式驗收。

目前沒有遊戲程式修改或公開部署。下一個可獨立排重、認領的候選是純繪製迷霧重疊消除；不得改實際sightRadius、Fog可見判斷、雙方AI或沙暴數值。新任務必須另經Ownership Dry Run及遠端確認。

原封重播快照已另存 [root-only-replay/B-before-critical.json](root-only-replay/B-before-critical.json)，SHA-256 `c55c9d9f2bc782bbcb841897d00303be3502e0660464ccf71a34b47a224f1fe6`。只供Root重播及技術驗證，隔離玩家不得讀取其內容。診斷腳本保留實際執行來源與當時絕對路徑；新環境可調整檔案位置，不能改快照bytes或測試條件。
