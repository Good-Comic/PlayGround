# 驗證矩陣 / Validation matrix

繁體中文：遊戲來源 `564a85a2a22e3754b1990f359962e96cef45468c`；正式 `build_playtest.py` 全新構建 `build-r2`，167/167 資源 SHA256 相符（離線檔案及執行時閘門）。Chromium 依序執行，沒有其他重型瀏覽器並跑。Node 使用既有最小 DOM preload 及 `--test-isolation=none`；未以 stub 取代 Game、原生指令或 Renderer。

English: Game source: `564a85a2a22e3754b1990f359962e96cef45468c`. Fresh official `build_playtest.py` artifact `build-r2` passed all 167/167 resource SHA256 checks, both offline and at the runtime gate. Chromium runs were serial with no concurrent heavy browser. Node used the existing minimal DOM preload and `--test-isolation=none`; Game, native commands and Renderer were not replaced by stubs.

| 範圍 / Scope | 結果 / Result | 證據 / Evidence |
| --- | --- | --- |
| 真 Game：人工選英雄→G→同一城心點與新宏對照 / Real Game: native manual select → G → same core point compared with shortcut | PASS | `evidence/node.txt` |
| 非英雄軍民命令、選取、資源、HP、技能、兩 RNG 不變 / Nonhero orders, selection, resources, HP, skills and both RNG unchanged | PASS | Node |
| 未完成救援、死亡／錯隊／不在陣列英雄或城心、暫停／選單／施工／終局／blocked／無合法點完全不改令 / Invalid rescue, hero/core membership, pause/menu/placement/terminal/blocked/no legal point keep orders | PASS | Node |
| 後續移動、直控優先；原生 Save/Load 護衛身分 / Later movement/direct control; native guard Save/Load | PASS，僅限定狀態 / scoped state only | Node |
| 上列加既有 core-defense／expeditions 回歸 / Above plus existing core-defense/expeditions regression | 46/46 | Node |
| 原生 Start 與合法救援、原按鈕同位置替換 / Native Start/rescue; replacement at original button position | PASS | `evidence/browser/result.json`、錄影 / video |
| 明確命令接受、真實原生路徑接近、之後 idle 護衛分開驗證 / Issuance, actual native path approach, then settled idle guarding checked separately | PASS | browser |
| 原生直控後令與右鍵覆寫、不重播 / Native direct-control takeover and right-click override without replay | PASS | browser |
| 受控 pause／placement／deadHero／deadCore／defeat／victory／boon／dialog／menu 的 disabled.click 與 dispatchEvent，命令及 toast 均不變 / Controlled disabled.click and dispatchEvent invalid cases: unchanged orders and no toast | 9/9 | browser |
| 四語 × 1440／800／390，type=button與可見邊界 / Four locales × three widths, button type/visible bounds | 12/12 | browser 截圖 / screenshots |
| 原生 Space／Enter 啟用、Tab 焦點不接管英雄 / Native Space/Enter activation; Tab navigation without hero takeover | 3/3 | browser |
| 全部瀏覽器檢查 / All browser checks | 35/35、pageerror=0 | browser |
| 100／200 活戰鬥短樣本、初始場景 SHA 與兩 RNG 配對 / 100/200 live-combat short samples; initial scene SHA/both RNG matched | MEASURED_SHORT_SAMPLES | `evidence/performance.json` |

繁體中文：原生測試 Seed 輸入實際回讀 `HERO-GUARD-71F3`、numeric `1114142891`；FRK／steppe，原生新遊戲預設難度 normal。沒有改 HP／資源／速度或跳波取得救援。救援前尚無新按鈕；救援後先確認原生 guard 指令接受，局內約7.8秒觀察英雄接近；約9.7秒觀察 `state=idle`、`targetPos=null`、`protectedId=1`、`guardOrigin={x:25,y:27}`，城心表面距離約1.526。這是原生護衛範圍內待命，並非強迫走到建築中心。接著才開始明標的失效／語系／尺寸受控夾具。沒有完成戰役或宣稱勝利。

English: The native test read back seed text `HERO-GUARD-71F3`, numeric `1114142891`, FRK/steppe and the native normal difficulty default. HP, resources, speed and waves were not changed to obtain the rescue. Before rescue, the new button was absent. After rescue, native guard acceptance was checked separately from approach around simulation second7.8 and settled guarding around second9.7: `state=idle`, `targetPos=null`, `protectedId=1`, `guardOrigin={x:25,y:27}`, town-center surface distance about1.526. This is idle within the native guard range, not forced movement into the building center. Explicitly controlled invalid-state/locale/viewport fixtures began afterward. No campaign completion or victory is claimed.

## 短樣本 / Short samples

繁體中文：對照來源 `b9699d627ae28f75eca33ee05aa0ac54311d27ae`（既有正式 RAM build-r1），修改後來源為本輪 r2。各案原生 newRun／startWave 後受控補單位到起始100／200；初始完整 snapshot 雜湊及兩 RNG 一致；2秒暖機、8秒測量，保持 AI、碰撞、傷害、死亡與原生波次增援。暖機後與結束存活數自然不同，不能當成同模擬時間效能校準或全程保持固定單位數。表列 heap 為兩次瞬時 JS heap 取樣 bytes，GC 未受控，不是洩漏／峰值／GPU 顯存證據。

English: Baseline source is `b9699d627ae28f75eca33ee05aa0ac54311d27ae` in the existing official RAM build-r1; changed source is this slice's r2. Each native newRun/startWave fixture adds units to an initial100/200. Full initial snapshot hashes and both RNG streams match. Each case uses2s warmup and8s sampling while retaining AI, collisions, damage, deaths and native wave reinforcements. Alive counts after warmup/end naturally differ; these are neither matched-simulation-time calibration nor permanently fixed populations. Heap values are instantaneous JS-heap bytes without controlled GC, not leak, peak-memory or GPU-VRAM evidence.

| 起始人數 / Initial | 來源 / Build | frame數 / Frames | P50 ms | P95 ms | heap start→end bytes | 測量存活 start→end / Alive |
| --- | --- | --- | --- | --- | --- | --- |
| 100 | before | 184 | 33.4 | 66.7 | 13344013→16498591 | 90→72 |
| 100 | after | 183 | 33.4 | 66.7 | 12072921→19008368 | 90→73 |
| 200 | before | 124 | 66.7 | 83.4 | 13265700→24222065 | 193→150 |
| 200 | after | 128 | 66.6 | 83.4 | 11407607→14076241 | 192→147 |

繁體中文：Chromium 的 ANGLE／Vulkan 為 SwiftShader CPU 軟體算繪，非實體 GPU。一次前後配對、短時間、共享雲端與未校準 GC 的資料僅記錄觀測值；不宣稱性能門檻 PASS、無退步或記憶體穩定。保留歷史性能 FAIL、低 FPS 時鐘／嚴格存讀／十波／硬體尚未認證。

English: Chromium's ANGLE/Vulkan device is SwiftShader CPU software rendering, not a physical GPU. One short before/after pair in a shared cloud with uncalibrated GC records observations only; it establishes no performance-gate PASS, no-regression conclusion or memory stability. Historical performance FAIL, low-FPS clock, strict save/load, ten-wave and hardware gaps remain.
