# 驗證矩陣

本輪依使用者最新指示使用臺灣正體中文報告，覆寫倉庫預設雙語；遊戲四語與原始日誌維持。

遊戲來源 `564a85a2a22e3754b1990f359962e96cef45468c`；正式 `build_playtest.py` 全新構建 `build-r2`，167/167 資源 SHA256 相符（離線檔案及執行時閘門）。Chromium 依序執行，沒有其他重型瀏覽器並跑。Node 使用既有最小 DOM preload 及 `--test-isolation=none`；未以 stub 取代 Game、原生指令或 Renderer。

| 範圍| 結果| 證據|
| --- | --- | --- |
| 真 Game：人工選英雄→G→同一城心點與新宏對照| PASS | `evidence/node.txt` |
| 非英雄軍民命令、選取、資源、HP、技能、兩 RNG 不變| PASS | Node |
| 未完成救援、死亡／錯隊／不在陣列英雄或城心、暫停／選單／施工／終局／blocked／無合法點完全不改令| PASS | Node |
| 後續移動、直控優先；原生 Save/Load 護衛身分| PASS，僅限定狀態| Node |
| 上列加既有 core-defense／expeditions 回歸| 46/46 | Node |
| 原生 Start 與合法救援、原按鈕同位置替換| PASS | `evidence/browser/result.json`、錄影|
| 明確命令接受、真實原生路徑接近、之後 idle 護衛分開驗證| PASS | browser |
| 原生直控後令與右鍵覆寫、不重播| PASS | browser |
| 受控 pause／placement／deadHero／deadCore／defeat／victory／boon／dialog／menu 的 disabled.click 與 dispatchEvent，命令及 toast 均不變| 9/9 | browser |
| 四語 × 1440／800／390，type=button與可見邊界| 12/12 | browser 截圖|
| 原生 Space／Enter 啟用、Tab 焦點不接管英雄| 3/3 | browser |
| 全部瀏覽器檢查| 35/35、pageerror=0 | browser |
| 100／200 活戰鬥短樣本、初始場景 SHA 與兩 RNG 配對| MEASURED_SHORT_SAMPLES | `evidence/performance.json` |

原生測試 Seed 輸入實際回讀 `HERO-GUARD-71F3`、numeric `1114142891`；FRK／steppe，原生新遊戲預設難度 normal。沒有改 HP／資源／速度或跳波取得救援。救援前尚無新按鈕；救援後先確認原生 guard 指令接受，局內約7.8秒觀察英雄接近；約9.7秒觀察 `state=idle`、`targetPos=null`、`protectedId=1`、`guardOrigin={x:25,y:27}`，城心表面距離約1.526。這是原生護衛範圍內待命，並非強迫走到建築中心。接著才開始明標的失效／語系／尺寸受控夾具。沒有完成戰役或宣稱勝利。

## 短樣本

對照來源 `b9699d627ae28f75eca33ee05aa0ac54311d27ae`（既有正式 RAM build-r1），修改後來源為本輪 r2。各案原生 newRun／startWave 後受控補單位到起始100／200；初始完整 snapshot 雜湊及兩 RNG 一致；2秒暖機、8秒測量，保持 AI、碰撞、傷害、死亡與原生波次增援。暖機後與結束存活數自然不同，不能當成同模擬時間效能校準或全程保持固定單位數。表列 heap 為兩次瞬時 JS heap 取樣 bytes，GC 未受控，不是洩漏／峰值／GPU 顯存證據。

| 起始人數| 來源| frame數| P50 ms | P95 ms | heap start→end bytes | 測量存活 start→end|
| --- | --- | --- | --- | --- | --- | --- |
| 100 | before | 184 | 33.4 | 66.7 | 13344013→16498591 | 90→72 |
| 100 | after | 183 | 33.4 | 66.7 | 12072921→19008368 | 90→73 |
| 200 | before | 124 | 66.7 | 83.4 | 13265700→24222065 | 193→150 |
| 200 | after | 128 | 66.6 | 83.4 | 11407607→14076241 | 192→147 |

Chromium 的 ANGLE／Vulkan 為 SwiftShader CPU 軟體算繪，非實體 GPU。一次前後配對、短時間、共享雲端與未校準 GC 的資料僅記錄觀測值；不宣稱性能門檻 PASS、無退步或記憶體穩定。保留歷史性能 FAIL、低 FPS 時鐘／嚴格存讀／十波／硬體尚未認證。
