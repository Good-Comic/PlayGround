# 迷霧繪製優化

本輪實際新增 `js/vision-mask.js`，在 `Renderer.drawVisibility` 省略可以證明完全被其他保留來源覆蓋的遮罩繪製。使用原有 sightRadius 與實際螢幕投影，保留順序及保守 AA 餘裕。實際視野、AI、沙暴、傷害、費用、模擬時間與 RNG 原碼不變。正式 payload 原有 162 檔相同，僅修改 renderer、增加純幾何模組，見[來源比較](SOURCE-COMPARISON.json)。

遊戲構建來源 `adfc546332077fc0dce33337cf506df98503f4bd`，正式工具 `tools/qa/build_playtest.py`，164／164 資源 SHA-256。獨立任務 `VISION-MASK-OVERDRAW-98F98A19`，Execution `codex-vision-mask-98f98a19-20261106`，Ownership278。原 FUN-LAB273 及其工作樹保留，沒有使用 prior-stopped 或接管其分支。

| 驗證 | 實際結果 |
| --- | --- |
| [Node](node-focused-r1.tap) | 24／24：純幾何15項、雙方視野與沙暴時間9項 |
| [Chromium](browser-r1/result.json) | 14／14檢查；45個幾何／文明／事件狀態，加3個resize／DPR，48次遮罩逐RGBA byte相同；render前後快照相同 |
| 原生輸入 | 四語啟動入口、中國滑鼠Start／F2／Pause、Save／Reload／Continue，零程式錯誤 |
| 遮罩案例 | 16文明、0.78／1／1.6縮放、分散／密集／重合／過濾來源、沙暴及讀檔／模擬結束、視口與1.75 DPR |
| [100／200負載](PERFORMANCE.md) | 8案ABBA，初始場景與兩種RNG四對相同，短樣本改善，限制分列 |
| [新B3玩家](player-B3/REPORT.md) | 原封Continue至第4波敗北並finish，零程式錯誤，報告封存；非完整十波或真人 |

合成投影位移是 API 測試，不宣稱已新增地形高低差功能。[中國啟動畫面](browser-r1/native-chinese-start.png)、[原生存讀檔畫面](browser-r1/native-save-continue.png)、[Root核對](ROOT-NATIVE-VERIFICATION.json)均保存。

B3 Continue53.566→敗北觀察158.023，104.457秒牆鐘含暫停。結算累計3波、75擊殺、採集4,246、8:47，不歸為本次新取得總量。神盾與13人集火衝車有畫面回饋，但兩次控制被拒絕、城心仍陷落；不把不同代理短樣本當成樂趣或勝率因果證據。

新單元首測13／14失敗，原因是把保守證明「必須觸發剔除」當成契約。原幾何保留，另有密集正例；最新15項與根端24項實際TAP保存。首測原始bytes未落盤，[helper-debug](helper-debug/README.md)明示歷史輸出是重建，沒有冒充原始封存或歸為平台故障。

保留歷史 strict SaveLoad RNG 表示 FAIL、低FPS時間流失、自然十波／NG+未通過、真人樂趣／聽感及實體GPU未測。這次只改善本環境繪圖效率，不宣稱整體遊戲已足夠有趣或正式發布就緒。

未改 main、現有RC、Pages、OmGitHub Issues、OpenCode Checkpoints、Immutable Build或其他Owner的Feed，未公開部署。依使用者最新要求，整理與交接採臺灣正體中文，原始日誌與遊戲四語保留。
