# 戰鬥控制續作與總管操作改善

已將第一閉環的「看懂命令」接續成可操作的「對準已見旗手」，並縮短總管表單的收尾操作。最新遊戲來源為 `6a9cde03141c6800be6da28ada0e9b0dc1145be4`；這是獨立開發分支的本地正式構建，沒有替換公開預覽、RC 或不可變測試版。整體樂趣、真人留存與通關改善仍未證明。

## 實際遊戲行為

| 切片 | 玩家可見變化 | 來源與界線 |
| --- | --- | --- |
| 目前軍令／人工目標 | 看出已選戰士與全軍人數、移動／護衛／人工集火；可見人工目標具名金環 | `6075dbaae8281de54ec5c932e349b0ed591f3c7f`；第一閉環三角色完整 Before／After 證據另表 |
| 旗手人工入口 | 保留「查看」只移鏡頭；另按「以已選戰士集火旗手」才發一次原生命令 | 初版 `2d327ee89cbe1618b20555b3c907c682f6494f71`；窄窗與點擊候選修正 `2bac6e36172b82e7ca8c00c42473b5447dc5ba3e`；版面快取 `6a9cde03141c6800be6da28ada0e9b0dc1145be4` |
| 總管固定操作列 | 從表單頂端即可套用／關閉／查看確認提案，不必捲到底 | `3237a7f109c3fdbc343ecb05336efb5660f863cf`；只包裝原有按鈕與樣式，設定／確認／費用處理未變 |

旗手入口不替玩家選兵，排除英雄、村民、混合非戰士與英雄直控；只對當下已選正式戰士下令。載體須屬目前世界、本波 pending／active、存活且經正式視野可見；候選點還須在可操作 Canvas 並由原生 `pickAt` 真正命中。點擊時重新核對，一次 `issueCommand`；不能命中便不發令，不退回地面移動、其他敵人或全軍。後續移動／停止／護衛可覆蓋，UI 更新不重送。沒有改 Game.js、AI、傷害、HP、冷卻、卡池、RNG、Fog／沙暴、RALLY 時限或增益。

## 實際畫面與操作

- [旗手發令前](followups/flag-final/flag-before-native.png) → [發令後，同一載體與金環](followups/flag-final/flag-after-native.png)。原封 C 自然存檔正常 Continue；根代理直接驗證，不冒稱玩家盲測。
- [總管修改前：底部按鈕不在畫面](followups/steward-final/before-top.png) → [修改後：零捲動即可收尾](followups/steward-final/after-top.png)。
- [新手 C 自主使用後：23 人集火旗手](followups/C-flag-partial/screen-0007.png)；[新手部分報告](followups/C-flag-partial/REPORT.md)。
- [日文窄窗旗手](followups/flag-final/layout-ja-390.png)、[日文窄窗總管](followups/steward-final/after-small-ja.png)。規則說明可捲動，操作列不被戰鬥列遮擋。

新手 C 沿用至少十秒意圖間隔、單一注意目標及同一原封自然快照；自主先查看，再按新集火入口。畫面及原始命令共同證明 23 名已選戰士對到旗手精銳守衛，之後可改護衛。此回合遭真實平台額度中斷，封存為 `INTERRUPTED_FOCUSED_RETEST_PARTIAL_EVIDENCE`，沒有混入第一閉環三個完整 After。最後敗北圖為控制器失聯後保存，不能算玩家即時玩到結算。抵達、命中、旗手擊倒、勝率與整段樂趣仍未評估。AI 再玩意願仍 3／5，不能宣稱大幅增加。

## 驗證矩陣

| 項目 | 結果 | 實際證據／限制 |
| --- | --- | --- |
| 戰鬥／旗手 Node | 84／84 PASS | [最終日誌](followups/node-rally-final-regression.txt)，含 12 項新入口測試；原生命令等效、排除、霧／沙暴、過期、暫停、讀檔與後令 |
| 總管 Node | 32／32 PASS | [日誌](followups/node-steward-controls.txt)，既有真實規劃／確認／預算／讀檔回歸；不寫只映照 CSS 的測試 |
| 最終正式構建 | 160／160 SHA-256 PASS | [來源及 manifest 雜湊](followups/final-resource-check.json)，所有實際 payload 逐項重算 |
| 旗手 Chromium | 28／28 PASS | [最終來源結果](followups/flag-final/result.json)；原生滑鼠、Space 單次、四語×四視口，明標控制診斷與自然存檔區別 |
| 總管 Chromium | 44／44 PASS | [3237 來源結果](followups/steward-final/result.json)；該 UI 後續未改。頂端／底部操作、四語×四視口、實際套用／取消、原先暫停、Escape、Save／Continue |
| C 玩家續測 | PARTIAL，命令吻合單例成立 | 自己的兩份報告 SHA 封存，九個意圖、最短 12.642 秒；中斷後無補造操作 |
| 嚴格 RNG Save／Load | 歷史 FAIL 保留 | `-1129663591 → 3165303705`，strictStateEqual=false；UI 不額外耗 RNG 不等於修好嚴格重播 |
| 自然十波／NG+、真人樂趣／聽感 | NOT_TESTED／未通過 | 不能用受控功能驗證替代 |

第一次旗手 Chromium 確實發現英文 390px 下按鈕被戰鬥列遮住，保留 [FAIL](followups/flag-initial/result.json) 與 [失敗畫面](followups/flag-initial/failure.png)，之後才修正。初始 Node 的九個失敗是把 `focusAt` 誤當立即移鏡頭的共用夾具錯誤，原日誌保留，改用真正可命中點後重測。總管第一次 submit 取樣在原處理器前的 microtask 執行，造成測試誤判；[原始 FAIL](followups/steward-fixture-initial/result.json) 保留，改用事件順序前後取樣，未為變綠修改遊戲語義。

## 100／200 與旗手掃描成本

Chromium 154.0.8037.57，1440×900、4 核 CPU 配額、32 GiB 容器上限；ANGLE／SwiftShader CPU 軟體繪圖。全部效能案序列執行、不錄影，各量測 30 秒牆鐘；同組初始場景 SHA 與 RNG 相同。原生碰撞、AI、傷害及死亡保留，沒有用無敵或固定存活數偽造負載。

| 旗手來源比較 | P50／P95（毫秒）Before → After | 實際範圍 |
| --- | --- | --- |
| 初始 100：6075 → 2bac | 33.4／66.6 → 33.3／50.0 | 量測時 92→86 存活；After 30 次原生 pickAt，共 4.3ms，不能當持續滿掃描 |
| 初始 200：6075 → 2bac | 50.0／66.8 → 50.0／83.3 | **原始退步警訊保留**；159→149 存活，After 257 次 pickAt |
| 200 ABBA 第一對：6075 → 最終 6a | 66.6／83.4 → 50.0／83.3 | After 265 次 pickAt，共 36.8ms；有效載體／選兵抽樣 100% |
| 200 ABBA 第二對：6075 → 最終 6a | 66.6／83.4 → 50.0／66.8 | After 264 次 pickAt，共 39.6ms；有效載體／選兵抽樣 100% |

[初測資料](followups/rally-performance-initial/result.json)、[ABBA 原始資料](followups/rally-performance-final/result.json) 保留全部 heap、瀏覽器與抽樣紀錄。最終將版面量測改為 ResizeObserver／視窗事件觸發，避免每 100ms 強制讀版面；命令仍在點擊時重新驗證。ABBA 未重現一致額外退步，卻不能由 N=2 推出因果加速。Before 量測時約 156→148／145 存活，After 159→151／148，時序及死亡並非嚴格重播。heap 變化與初測較高 After heap 不證明無洩漏；長時間、持續 200 存活與實體 GPU 仍 INCONCLUSIVE。沒有把這個環境的約 15–18 FPS 說成流暢或硬體 PASS。

## 保存與下一步

任務 `FUN-LAB-281169B5`、專案 Execution `codex-fun-lab-281169b5-20261105`，遠端 Ownership 273、收據 `097b5d3d80e18f6be9fca543af82024689eb38fe`；沒有接管其他 Owner 或寫入他人 Feed。新手、整理角色及一次遠端查詢的真實額度中斷見 [紀錄](followups/CONTINUATION-INTERRUPTIONS.json)。控制器 45 秒失聯後使用原生暫停／存檔、租約到期關閉與影片保存已 [實測](followups/CONTROLLER-EARLY-PAUSE-TEST.json)，這不是排程喚醒能力。完整影片仍本機保存，不把工作區路徑當下載入口。

下一個有證據的需求是讓玩家看懂城心實際由誰造成傷害，以及危機中可採取的手動動作。必須由真實傷害事件歸因，不能從單位 target 或 attack 狀態冒充傷害；霧中來源不洩漏。Tab 無切英雄尚未證實為程式缺陷，需區分按鈕焦點的原生導航。持續工作不含公開部署。

---

# Combat-control follow-ups and steward navigation

The first feedback loop now leads to an explicit manual bearer command and a sticky footer for existing steward actions. The latest game source is `6a9cde03141c6800be6da28ada0e9b0dc1145be4`, built locally from the independent development branch. No public preview, RC or immutable build was replaced. Overall fun, human retention and campaign success remain unproven.

The command readback originated at 6075. The bearer command started at 2d327ee, gained small-window and legal-pick fixes at 2bac, and event-driven layout measurement at 6a. The steward footer originated at 3237. Find Bearer remains camera-only; the new attack button dispatches exactly one existing native command to currently selected formal soldiers. It never selects the army, includes heroes/workers, substitutes another target or falls back to a move. Current-world membership, living bearer, pending/active event, formal visibility, a usable Canvas point and native pickAt are revalidated on click. Later manual orders replace it. Game.js, AI, stats, timers, RNG, Fog and card rules were not changed. The footer wraps the existing apply/close/confirmation buttons without changing validation or spending.

The linked screenshots above show the same bearer before/after dispatch, the old inaccessible steward footer versus the new zero-scroll controls, and Japanese narrow-window layouts. C independently found and used the visible action on an unchanged personal natural save, with at least ten seconds between intents. Both visible feedback and the native trace identify 23 selected soldiers targeting the expected guard bearer; C later issued a new guard order. Actual platform usage limits interrupted this run. Its sealed report is partial evidence, excluded from the three complete first-loop After reports. The controller's eventual defeat screenshot was not an actively observed ending. Arrival, damage, bearer defeat and victory effects are untested; the AI replay rating remains 3/5.

Validation is 84/84 combat Node cases, 32/32 existing steward cases, 160/160 final payload SHA-256 checks, 28/28 final-source bearer Chromium checks, and 44/44 steward Chromium checks at unchanged source 3237. The browser checks cover native inputs, four languages and four viewports, apply/cancel, previous pause state, Escape and native Save/Continue. Scoped controlled diagnostics are distinct from natural-save operation and player evidence. Strict RNG Save/Load still fails (-1129663591 to 3165303705); UI RNG noninterference does not fix strict replay. Natural ten-wave/NG+, human fun/listening and long-term stability remain unpassed or untested.

Historical failures remain: the first bearer browser run found a real English 390px overlay, subsequently fixed and retested; nine initial Node failures shared an incorrect immediate-camera fixture; the initial steward submit observer sampled a microtask before the application handler. The logs and screenshot are retained. Tests were corrected without weakening gameplay or deleting failures.

Performance used Chromium 154, 1440×900, a four-core quota and 32 GiB limit with SwiftShader CPU software rendering. Runs were serial, unrecorded 30-second samples, with equal initial scene SHA/RNG and native collision, AI, damage and deaths. Initial 100-unit bearer p50/p95 changed from 33.4/66.6 to 33.3/50 ms, with only 30 actual picks. The initial 200-unit result changed from 50/66.8 to 50/83.3 ms; this regression signal remains. After event-driven layout measurement, ABBA controls measured 66.6/83.4 twice; final-source runs measured 50/83.3 and 50/66.8. They exercised 265/264 native picks totaling 36.8/39.6 ms with valid-bearer/selection samples throughout. There was no consistent additional regression in these repeats, but N=2 cannot prove causal improvement. Survivors fell from 156 to 148/145 in controls and 159 to 151/148 after; the runs are not strict simulation replays. Heap variation, sustained 200 survivors, long runs and physical GPU performance remain inconclusive. Approximately 15–18 FPS in this environment is not described as smooth or a hardware pass.

Ownership remains task FUN-LAB-281169B5, project-declared execution codex-fun-lab-281169b5-20261105, verified version 273 and receipt 097b5d3d80e18f6be9fca543af82024689eb38fe. Other owners' feed was untouched. Actual player/curator/approval quota interruptions are recorded. A native pause/save after a 45-second controller gap and lease-expiry finalization were tested; this is not automatic wake-up or scheduler support. Full videos stay local with provenance, not fake download links. Next is evidence-based core damage readability, without deriving damage from target references or revealing hidden sources. The Tab observation still needs separation from native focused-button navigation. No public deployment is included.
