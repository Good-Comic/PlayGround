**A 公開紀錄恢復復核（新復核者）**

任務 `FUN-EVIDENCE-051216A4`；Execution `codex-fun-evidence-051216a4-20261105`；Owner 274。復核時間 `2026-11-05T21:25:35.468558+00:00`。本文件是新的唯讀復核者依既有公開紀錄重建事實，不是原玩家 A 的主觀回憶。

原角色報告狀態：**UNSEALED_ORIGINAL_REPORT**。本復核完成不會把原狀態訊息或缺失的 REPORT 變成已封存。

遊戲證據只讀本文件所在的 A-production-public/，包含後補的 visible-ui-responses/。本復核者已以 `view_image` 逐張看過全部 19 張既有 PNG，讀取 38 組公開原生 request/response，並核對 actions.jsonl 的 18 筆輸入都與原生回應相符。沒有啟動 Browser、Node、perf 或 Git，沒有重開遊戲、讀取遊戲原始碼／GDD／private-observer／其他角色資料，也沒有向原角色提供玩法建議。原回應內的舊截圖路徑僅依 basename 對應到本資料夾副本，沒有沿舊路徑讀取。

**可確認的結果**

公開紀錄確認原生 Continue、馬廄診斷摘要與完整成本表的實際展開、草稿提醒、手動經濟修改與儲存操作、正常敗北結算，以及 finish 回傳 ok。可確認「資訊已呈現」；原玩家是否完整讀懂、內在動機及主觀感受仍不能由畫面代證。

時間以公開 client 的 `wallSeconds` 為相對牆鐘基準；局內時鐘另列。session.json 記錄起點為 `2026-11-05T21:03:23.198Z`。Continue 42.123 → 敗北觀察 233.652，共 **191.529 秒**；總管開啟 64.337 → 儲存 172.757，共 **108.420 秒**。UI 明示開啟面板會暫停模擬；後一數字是兩次原生操作的牆鐘差，包含閱讀、定位失敗、編輯與工具延遲，不是獨立逐幀停表測量，也不能全部算成新功能閱讀成本。

| 牆鐘秒 | 公開可見事件與證據 |
| --- | --- |
| 36.629／42.123／42.833 | 可用的「繼續遠征」控制項 → #btn-continue 點擊回 ok →「遠征已載入」、3/10、城心68%。[公開觀察 36.629 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/ca7972038dd44655883020ad5cd2179a.response.json)；[公開觀察 42.833 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/25bf395f2b8c40edaac8d4114e8e46a2.response.json)；[screen-0003.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0003.png)。 |
| 64.337／64.915 | 開總管後，畫面食物27、木材1,299；採集策略均衡、村民目標22、閒置1，明示面板暫停模擬。[公開觀察 64.915 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/87db641b080643fb9053cdc9c2f59457.response.json)；[screen-0006.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0006.png)。 |
| 74.551／83.212／83.713 | 公開 @79 為馬廄#20；點擊後馬廄展開，狀態等待資源／保留預算。[公開觀察 74.551 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/2fd9cf8829aa4fe9a73742d20b2abe24.response.json)；[公開觀察 83.713 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/4368f8aa114b409ea1076c611813469e.response.json)；[screen-0008.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0008.png)。 |
| 92.669 | 費用摘要已可見：輕騎兵65食物、20黃金、尚缺食物約38.31；標示依已套用設定。[公開觀察 92.669 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/a0476a519a044067a53ff9e3f4a058ca.response.json)；[screen-0009.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0009.png)。 |
| 103.946／104.479 | 點 @33 回 ok，實際開的是時代升級下拉選單，值仍 auto。[公開觀察 104.479 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/1f40844ee2074cec91210e11cc2bbe59.response.json)；[screen-0010.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0010.png)。 |
| 133.691／137.246／137.810 | 選食物優先、村民目標22→14；草稿畫面比例預覽64/16/12/8。[公開觀察 137.810 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/e5f4b7a3689b433f9f42de9d2873c5fe.response.json)；[screen-0011.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0011.png)。 |
| 148.271／151.727／152.340 | 按交還閒置村民、捲回馬廄；明示「有未套用變更；資源診斷仍依已生效設定計算」。[公開觀察 152.340 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/ac0a7c6b4c434121a2a107036cac0697.response.json)；[screen-0012.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0012.png)。 |
| 161.188／161.661 | 座標(291,498)點擊後完整成本表才展開；表頭保留依已套用設定與未套用變更。[公開觀察 161.661 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/8874e9d7bdd24ac08d1a8649f7660354.response.json)；[screen-0013.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0013.png)。 |
| 172.757／173.547 | 按儲存規劃回 ok，面板關閉回戰鬥。[公開觀察 173.547 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/ca71d53ca24e401e98bd6b9ea6a68d50.response.json)；[screen-0014.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0014.png)。 |
| 220.072 | 城心2%，可見局內8:55衝車實損與19人集火衝車。[公開觀察 220.072 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/13501ea744c2493fa8200709e28c20f0.response.json)；[screen-0016.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0016.png)。 |
| 233.059／233.652 | Q按鍵回 ok；下一次觀察已是正式敗北結算。[公開觀察 233.652 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/c9cb1e6d4c3b461b85306dcab7c8ae71.response.json)；[screen-0018.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0018.png)。 |
| UNKNOWN（finish） | 原生請求為finish，回應為ok:true；兩檔沒有時間欄位。[finish請求](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/e00c3a42855e44fd8fc23f40e4f35b99.processed.json)；[finish回應](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/e00c3a42855e44fd8fc23f40e4f35b99.response.json)；[final.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/final.png)。 |

**原封 Continue 的證據界線**

[session.json](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/session.json) 記錄 FRK／Normal／steppe、種子 `FUN-LAB-BASE-281169B5`，來源版本 `6852cf85acca5c08923e0191a1e0703189f4d3e6`，resume 方法為 `UNCHANGED_OBSERVED_NATIVE_SNAPSHOT_THROUGH_NATIVE_CONTINUE`，SHA256 為 `1d35c76c1b35c5b4e901019dec95c02426114b582b32a3b91b5d29202f5462e4`，局內466.30850000008627秒／第4波。[PUBLIC-PROTOCOL.md](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/PUBLIC-PROTOCOL.md) 聲明根端核對後原樣載入。本次能直接確認原生 Continue 與載入後畫面；沒有讀取原快照或遊戲實作，原封性與版本雜湊驗證仍限來源元資料聲明，不能寫成本復核者獨立驗算。初始選單的預設值不替代續玩存檔設定。

**實際可讀到的費用、庫存與保留缺口**

完整明細見 [screen-0013.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0013.png) 與 [公開觀察 161.661 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/8874e9d7bdd24ac08d1a8649f7660354.response.json)，屬於**局內8:08**的已套用設定快照。UI 說明付款後最低庫存取全域有效保留與建築保留的較大值，不相加；保留不是花費上限。

| 資源 | 目前庫存（約） | 本筆費用 | 全域有效保留 | 此建築保留 | 付款後最低庫存 | 假設付款後庫存（約） | 尚缺 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 食物 | 26.69 | 65 | 0 | 0 | 0 | -38.31 | 約38.31 |
| 木材 | 1299.46 | 0 | 0 | 0 | 0 | 1299.46 | 本筆不支出／不檢查 |
| 黃金 | 180.73 | 20 | 0 | 0 | 0 | 160.73 | 0 |
| 石材 | 345.45 | 0 | 0 | 0 | 0 | 345.45 | 本筆不支出／不檢查 |

食物負值是這筆輕騎兵費用的假設付款試算，不是實際庫存已扣成負數。UI 同時說明既有佇列已付款，不重複計費。這能說明當時本筆資源條件尚未符合，不能還原全部歷史支出，也不證明門檻通過後必定排到該兵。

**草稿、已套用設定與手動經濟調整**

[screen-0009.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0009.png) 已標「依已套用設定」；修改後的 [screen-0012.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0012.png) 與 [screen-0013.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0013.png) 同時保留「依已套用設定」及「未套用變更」，並明示診斷仍依已生效設定計算。133.691秒改食物優先、137.246秒村民目標填14、148.271秒交還閒置村民、172.757秒儲存，均有原生 ok。可見軍事方案仍均衡、馬廄自動開啟、佇列上限1、輕騎兵勾選、弓騎兵未勾選、預留皆0，操作記錄沒有修改這些欄位。

順序必須保留：**先看費用摘要 → 修改經濟草稿 → 展開完整成本表 → 儲存**。不能倒寫為先讀完整成本表才決定這些修改。沒有儲存後重新開總管核對持久值，也沒有觀察資源條件通過後的自動佇列；因此不能宣稱每位村民已立即改派、排隊改善或發現自動化 Bug。畫面可證實兩種狀態有清楚呈現；原玩家是否完整理解及因何改政策，仍只見於未封存陳述。

**@33 的定位錯位與最後 Q**

92.669秒的 [公開觀察 92.669 秒](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/visible-ui-responses/a0476a519a044067a53ff9e3f4a058ca.response.json) 明確列 key33／selector@33 為「輕騎兵 · 本筆費用 食物65 · 黃金20 · 尚缺食物≈38.31」，範圍為 x287、y489.03125、w866、h21.609375。103.946秒 click@33 回 ok 後，104.479秒的 [screen-0010.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0010.png) 卻開啟時代升級選單；該次回應 key33 是 `select[name="age"]`，value仍 `auto`。這是公開控制定位前後錯位，不能說玩家故意改時代、已成功展開明細，或沒有依上一筆公開觀察使用編號。根因及穩定重現性為 UNKNOWN；本次不讀實作推測原因。161.188秒座標點擊後才於161.661秒確認成功展開明細。

233.059秒 Q 按鍵的 ok 只確認輸入被接收；233.652秒 [screen-0018.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0018.png) 已為結算，沒有可確認的技能施放、命中、冷卻變更或效果。結算與按鍵的精確交界未知，最後 Q 保持「未確認成功」。

**結算與 finish**

[screen-0016.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0016.png) 到 [screen-0018.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/screen-0018.png) 的公開序列支持本段自然敗北。15筆 observe 的 `sessionLimitReached` 均為 false。正式結算是度過襲擊3、擊殺74、採集3,679、統治8:56；這是整局累計。[event-17-false-4-defeat.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/event-17-false-4-defeat.png) 與 [final.png](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/final.png) 也呈現相同結算。finish 的原生請求與 ok 回應已另行核對；但該組沒有 wallSeconds／UTC，精確時刻為 UNKNOWN，單靠兩檔欄位也不能證明與結算 observe 的嚴格先後。原狀態訊息主張已見結算後先 finish 且回 ok。

**公開紀錄限制與原報告缺口**

[ORIGINAL-A-STATUS-MESSAGE.json](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/ORIGINAL-A-STATUS-MESSAGE.json) 在 `2026-11-05T21:17:38.259726+00:00` 由恢復端記錄，原收到時刻為 UNKNOWN，且明示 `original_agent_sealed_report:false`。它可提供待核對陳述；本次已盡可能用公開畫面與原生回應驗證，但不會把它當成原完整 REPORT。[PROFILE.md](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/PROFILE.md) 也是AI模擬角色與能力假設，不是人類體驗或實際達成能力的統計證據。

同一 observe 的文字與 PNG 存在取樣差異：173.547秒截圖食物27、文字28；189.314秒截圖食物70／敵人10、文字食物94／敵人9。本復核保留差異，不將兩者硬合併成單一瞬間。完整成本表的數值則可在截圖與文字相互核對。三張 event 圖與 final.png 未附這批 JSON 所載的獨立牆鐘時刻，不能以檔名或複製時間猜測。

原玩家完整的「最有趣／無聊／挫折各三項」、改善優先序與GDD相容性、再玩意願及主觀評分皆仍為 **UNSEALED_ORIGINAL_REPORT**。原狀態訊息沒有這些完整內容，新復核者不可補造。定位失敗是客觀操作摩擦，不能代替原玩家的挫折程度或排名。沒有主張勝率、樂趣、通關率或再玩意願改善，也沒有把單次公開重建當成前後效果對照。

完整逐項結論、已確認／未能證實的界線、全部15筆觀察時刻與來源索引，見同目錄的 [RECOVERY-VISIBLE-REVIEW.json](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/RECOVERY-VISIBLE-REVIEW.json)。本次兩份新復核文件的SHA256另寫 [RECOVERY-SHA256SUMS](/workspace/riftwatch-fun-evidence-051216a4/worktree/docs/feedback/fun-evidence-051216a4/A-production-public/RECOVERY-SHA256SUMS)；不更改原始證據檔。
