# 原地攻擊友軍阻擋：修復與交接

## 玩家可感受的差異

近戰集火不再因原地射擊的友軍被漏列為繞行障礙而原地擺動、最後放棄命令。原生滑鼠集火受控場景中，同一初始狀態由零命中／congested，改善為約 10.5 秒內 5 次實際命中；兩名弓兵位置不變。這不是自然戰役或 C-36 精確重播。

## 身分及來源

Task：ALLY-CROWD-41C8A7E2。Agent：codex-ally-crowd-41c8a7e2。Execution：codex-ally-crowd-41c8a7e2-20261107。

合法認領版本 296，收據 704436fb73eb402a55d69626779630de5115c2da。獨立分支 codex/riftwatch-ally-crowd-41c8a7e2，基底 dfd20573f746c34383a0bf2414efe2713bd97e36。正式修復構建來源 79606337b47d10b2c277d5788107bf5743e05480；對照來源 e01974d3f73dda4286f352a5a1cc64e4d89e6d07 與基底的遊戲內容相同。遠端交付 SHA 以提交後的實際查詢收據為準。

## 根因及實作

原 stepToward 動態繞行只納入 idle／hold／gather，遺漏在正式射程內原地 attack 的同隊單位。js/crowd.js 記錄原生避碰實際拒絕的身體；js/game.js 只將其中確實原地攻擊、具有存活敵方目標的友軍納入既有避讓重規劃。追擊、死目標、敵方及無關射手不納入。新導航意圖清除暫存參考，資料不寫入存檔。

js/navigation.js 使用保守終點粗篩；每次同步搜尋快取半格靜態通行結果。參考實作測試比對完整路徑、展開數、位置及 RNG。碰撞半徑、穿透容許值、射程、傷害、冷卻、重試預算與失敗時間皆不變。Game Director 曾獨立確認初始狀態漏判與終點粗篩屬合法修復；最終實際接觸限定由開發者依效能證據收斂並定向驗證。

## 驗證矩陣

- Node：95／95 PASS，見 evidence/regression-delivery-final.tap；涵蓋雙方、射程／目標／陣營反例、舊 hold、存檔恢復、重複確定性及既有操作回歸。
- 正式構建：168 項 SHA-256 逐項核對 PASS，來源見 browser-contact/REPORT.json 與效能結果。
- Chromium：原生滑鼠命令三單位均接受；近戰由零擊轉為 5 擊，友軍不移位、無頁面錯誤；已檢視實際遊戲畫面。證據為 browser-contact 前後 PNG／JSON，未錄製影片。
- 衝車 Node 受控場景：5 次正常 1 HP 傷害，未削弱護甲、未製造擊殺；不能宣稱解除城心威脅。
- 100／200 單位：每組 ABBA，各 3 秒暖機、10 秒交戰；Chromium 154、4 CPU 配額、ANGLE／SwiftShader。100 組前後約 22.8–23.4 FPS、P50 33.4 ms、P95 66.7 ms；200 組前後約 14.5–14.9 FPS、P50 66.7 ms、P95 83.4–100 ms。存活數隨原生戰鬥變化，並非全程固定人數。記憶體含量測陣列與 GC，短測不判洩漏。
- 初版將所有附近原地射手納入，曾造成明顯效能 FAIL；performance、performance-optimized、performance-cached 原始數據全部保留。最終 contact 版本未再出現該大幅退步；不代表整體大軍效能已達標。
- 原始測試啟動／點選夾具失敗保留，不計為遊戲缺陷。既有 Save／Load signed RNG 歷史失敗未被本輪局部恢復測試覆蓋。
- 自然十波、原始 C-36 全六名阻擋的因果重播、真人趣味評分、實體 Windows GPU、長期穩定性：NOT_TESTED／沿用既有未通過狀態，不宣稱改善。

## 證據與安全

manifest.json 記錄原始及保存檔 SHA-256。大型 profiling JSON 以確定性 gzip 無損保存，解壓比對通過；原始本機檔案未刪除。僅保存必要遊戲截圖，其他重複效能截圖未推入 Git。Node／Chromium／效能不能互相取代。

未修改 main、Pages、公開部署、既有 RC、OmGitHub Issues、OpenCode Checkpoints 或其他 Owner 文件；未更新 Progress Feed。整合候選協議已在上游 docs/automation/candidates/autonomous-v2.1/PROTOCOL.md 保存，本輪不重複修改。轉送來源尚未更新／未驗證；沒有正式排程傳訊工具，不宣稱 v2.1 已改綁。QUOTA_PERCENT_UNKNOWN。

## 下一個最小接續點

優先利用 C-36 原始地圖與封存位置，辨別剩餘阻擋者是原地友軍、建築繞行或移動互卡。原始快照缺少完整導航歷史，必須明列重建限制；不重新跑三角色完整自然戰役。接續寫入前重新驗證 Ownership 及最新安全分支。
