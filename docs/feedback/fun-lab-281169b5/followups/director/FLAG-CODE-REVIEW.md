# 旗手人工集火｜唯讀程式評審

**結論：最終已讀來源 2bac6e36172b82e7ca8c00c42473b5447dc5ba3e 的程式範圍可接受，未發現需要另行批准的核心規則／權限變更，也未見尚未處理的阻擋性命令或視野缺陷。原提交有一項 P2 可用性缺口，已由後續提交修正。真實 Chromium、定向 RALLY 效能與新手 C 的新回合仍須各自驗收；本文件不把程式審查當成整體交付 PASS。**

本次新任務最初指定來源 2d327ee89cbe1618b20555b3c907c682f6494f71。已讀該提交的 js/rally-objective.js、js/locales.js、styles.css 與 tests/rally-command.test.mjs 完整差異；必要時對照原生 Game.issueCommand／pickAt、battleArmy／battleCanAct、視野與輸入處理。審查期間根代理完成修正，故另讀 2bac6e36172b82e7ca8c00c42473b5447dc5ba3e 的相關差異（包括共用 defenseClickPoint），並核對這五個相關檔案的工作樹與後一提交一致。

只做讀檔與 Git 唯讀查詢；未啟動 Chromium、遊戲、Node 測試或效能程式，未改遊戲、根代理檔案、Ownership 或任何封存玩家報告。唯一寫入為本文件。依本輪指定採臺灣正體中文。

## 實際發現與處理狀態

### P2｜第一個原生命中點被 UI 蓋住時，過早停用可用命令——已在後續提交修正

原 2d327ee 的 js/rally-objective.js:106–107 先以 defenseClickPoint 找到第一個 pickAt === carrier 的幾何命中點，再單獨檢查 canPoint。若此點被 DOM 蓋住或位於畫布外，但後面的候選偏移仍可正常點中旗手，函式也直接回傳 noPoint。這會錯誤拒絕原本可發出的明確命令；它是安全拒絕的可用性缺陷，沒有發出錯令／洩漏情報。

2bac6e 的修正將 canPoint 作為 defenseClickPoint 的可選候選條件，逐點先檢查畫布／DOM，再做正式 pickAt；無可用點才失敗。既有 defendCore 未傳入條件時維持預設 true，沒有改它的選敵或原生命令規則。新增「第一個原生點被 UI 遮住仍可採用下一個合法點」案例正對應缺口。已讀現有 node-rally-r2-regression.txt，結尾 84／84、0 fail；本角色沒有重跑，也沒有將 Node 案例說成真實 DOM 重現。

**狀態：CODE_PATH_FIXED_AT_2bac6e；真實 UI 邊界仍依最終 Chromium 結果確認。** 沒有要求放寬可見性、原生可選條件或直接用內部 ID 代下攻擊。

### 驗證缺口｜每 100ms 的正式命中掃描，需要 RALLY 定向量測

這不是已證明的效能退步，但不能由第一切片的 prep 場景短樣本解除。

js/rally-objective.js 的 update 在每次通過 100ms 節流後、signature 比較之前，仍會執行 rallyAttackContext。當狀態 pending／active、已選全為正式戰士、目標存活可見時，會搜索最多五個 native pickAt 候選。Game.pickAt 遍歷原生單位、檢查即時視野並計算實際命中；敵人的 teamSees 又可能遍歷觀測者，並非固定成本的 DOM 查詢。場面擁擠且多個候選都失敗，是比第一點立即命中的情況更重的分支。2bac6e 又加入每次更新的面板／作戰列 getBoundingClientRect 及必要 maxHeight 更新；最終來源須一起覆蓋。

一個可用點通常一次 pickAt；五個都不可命中時最多五次，每秒約十輪，另有點擊時的再驗與原生 issueCommand 自己的 pickAt。這仍是一次人工命令，額外命中檢查不等於多次派送；效能上卻必須量到。

**狀態：RALLY_TARGETED_PERFORMANCE_PENDING，不能先標回歸，也不能先標通過。**

## 授權、視野與命令語義

| 面向 | 實際程式判斷 |
| --- | --- |
| 是否改核心規則 | 沒有改 Game.js、RALLY_RULE、載體挑選、傷害、費用、冷卻、時窗、卡池或 RNG；新入口重用既有右鍵敵軍分支 |
| 是否自動選兵／選敵 | battleArmy 與目前 selection 的交集只用於驗證與計數；沒有 setSelection／F2。目標是目前 RALLY 載體，並非演算法挑最佳敵人 |
| 免費基礎控制 | 沒有科技、資源費用、文明鎖或新付費研究；原有控制入口保留 |
| Fog／沙暴 | target 必須存活、enemy、屬於當前 g.units 並通過 g.isVisible，才讀取點擊座標；正式視野自然包含沙暴縮減。不留歷史位置，不生成額外視野 |
| 視口與 UI 遮擋 | 實際 UI adapter 要求點在 renderer 範圍內，且 elementFromPoint === renderer.canvas；目前 canvas 置於原點、尺寸為視窗 CSS 像素，因此座標基準相符 |
| 模式邊界 | battleCanAct 排除選單、暫停、placement 與非戰鬥階段；adapter 另阻擋面板、dialog、planning-mode、lining-up |
| 英雄／混合選取 | 英雄直控、空選、帶英雄／村民／建築／不屬於當前正式軍隊的混合選取均停用；沒有退出英雄、清按鍵或改鏡頭的副作用 |
| 點擊當下確認 | attackRallyCarrier 重新建立 context，隨後再驗正式 pickAt；同一同步事件內才清除待定 orderMode 並一次呼叫 issueCommand。目前 pickAt 是純查詢，普通模擬 tick 不會插入這些同步檢查之間 |
| 沒有命中點 | 回傳原因，不退回地面移動、不改打別人、不重試；後續人工移動／停止／護衛仍可覆蓋 |
| 查看與攻擊 | 查看仍只呼叫 focusAt；新攻擊另有獨立按鈕及文案。沒有把原本查看偷偷變成軍令 |
| 成功說法 | issued 只表示已下令；攻擊前後仍由現有回讀確認，不聲稱到達、命中、擊殺或勝利 |
| 永久同屏與保護範圍 | 未更動卡牌 UI、32 卡樹、未核准九科技、中國副箭、探索 180 估值、main／RC／Pages 或公開部署 |

因此此切片仍落在 APPROVED_SCOPE_EXISTING_MANUAL_COMMAND_AFFORDANCE。沒有發現需另問使用者的規則決策。若後續為求可用性而繞過 native pickAt、讓不可見／畫面外目標可攻、增加自動 F2／持續追令或延長時窗，才超出本裁決；本次程式沒有這些行為。

## UI 與測試的實際邊界

新六組字串在四語皆齊備，使用原有 t 參數；F2 退出英雄並選全軍的說明符合既有 battleAction。Space／Enter／Tab 的 keydown 停止傳播並抑制重複啟動，沒有新增全域快捷鍵。這些程式證據合理，但實際焦點、原生鍵盤預設啟動、四語換行及 canvas 命中面仍由 Chromium 驗收。

最初 styles.css 只增加第二按鈕與提示，沒有高度保護。後續 2bac6e 已將操作移到面板前段、增加捲動、短視窗 top 調整，並依作戰列交集限制 maxHeight；改善方向合理。仍需在四語、1440×900、1024×768 及既有小視口確認：兩個按鈕可見或可直接捲到／鍵盤到達，不遮掉作戰指令；焦點輪廓不被 overflow 裁到無法辨識。這裡不以未啟動的瀏覽器推定 PASS，也不把極端視窗的猜測列成已重現缺陷。

新增 Node 案例使用真正 Game／RALLY 與原生攻擊語義，覆蓋選取、非選取部隊、混合／英雄、阻擋、死亡／離開世界／Fog、沙暴、後令優先、讀檔新實體及四語。完整 snapshot 與相同點原生右鍵的比較，對「沒有另造攻擊規則」有實質價值。它們沒有實際安裝／操作 DOM adapter；canPoint stub 不能代替 elementFromPoint、布局和原生按鈕事件驗證。根代理原提交回報 83／83；修正日誌為 84／84，兩者的來源範圍應分列，不能把舊構建 SHA 當新提交驗證。

## 最終來源的最小剩餘驗收

1. **正式 Chromium：** 使用 2bac6e 或其後明確來源與完整資源 SHA。保留可見載體、目前選兵、當下 DOM 命中面／pickAt、單次原生點擊與 immediate after。驗證查看零軍令、新按鈕只對選兵發出一次、後令可改；至少含「第一候選點被 UI 蓋住、後續點合法」、畫面外、晚到／過期、死亡／Fog／沙暴、英雄／混合、各阻擋模式與四語小視口。受控案例要明標 CONTROLLED_FIXTURE，不當自然擊破。
2. **定向 RALLY 效能：** 序列比較前一切片 6075dba 與最終新來源，在真正 pending／active、可見存活載體、非空合法選兵的場景量測。既有 100／200 初始配置可重用，但必須確實進入這個條件；另涵蓋多候選失敗或 UI 遮擋的較重分支。保留原生 AI、碰撞、傷害、死亡；不靠停掉原生系統求漂亮數字。
3. **效能紀錄至少包括：** 暖機／牆鐘窗口、status 各時段、符合昂貴分支的 update 次數／時間占比、native pickAt 次數與每次／每輪成本、frame p50／p95／max、樣本數、起終／平均存活數、相同初始場景及 RNG 證據、renderer／硬體。若載體早死、失去視野、選兵死亡／變混合或窗口過期，必須報實際覆蓋率，不能以「面板存在」代替掃描負載。原本 prep 結果沒有啟動此分支，不能當本項 PASS；短樣本仍不宣稱長測／持續 200 存活／實體 GPU。
4. **新手 C：** 原封自有快照、正常 Continue、原 PROFILE 與至少 10 秒意圖間隔；新增獨立回合，不覆寫 sealed before／after。只告知新入口用途，不告知位置／時機／最佳解。主指標是自然採用、事前能說出選兵與目標、命令對上自己意圖及額外步驟；擊破／勝敗如實列次要結果。未用到則 NOT_EVALUATED。A／B 沒有第五波窗口，不列玩家 PASS。
5. **歷史限制：** 嚴格 RNG Save/Load 的 -1129663591→3165303705 FAIL、完整自然十波／NG+、長期效能與實體 GPU 缺口原樣保留。

本次沒有發現需要再擴張規則才能完成的阻礙。根代理可直接完成上述已授權驗收，依玩家新回合的實際體驗接續；一次修正提交不是整項任務的結束條件。

## 來源雜湊與交接

以下為 Git 提交中實際檔案位元組的 SHA-256，避免把後續工作樹混回原版本。

| 提交 | 檔案 | SHA-256 |
| --- | --- | --- |
| 2d327ee | js/rally-objective.js | 3a7928d9e8a7a2180b649d7d760174407213f78828ee79c412b8a253b8f45a20 |
| 2d327ee | js/locales.js | 0e1af5cf3637392215fe2e759f5c9b6adefe662edaaa3c3635974601626f8c79 |
| 2d327ee | styles.css | b104005e3ca80b2b51cc169422fdc02be08226747512f779a9ba43e1770291a2 |
| 2d327ee | tests/rally-command.test.mjs | 64f57eaa8c5193ebd7f035e00583ffe554db3cce3267857b4dfdb61f9b2f255b |
| 2bac6e3 | js/core-defense.js | bf8de6d5fae5e045acf1e5a442cd6cd5b05600b53ad89d2940c98f8d66ff15a3 |
| 2bac6e3 | js/rally-objective.js | 53fe3c859776d13a2c63da86ff45d08db0940eeb0561d273cb675ba2cf4a5931 |
| 2bac6e3 | js/locales.js | 0e1af5cf3637392215fe2e759f5c9b6adefe662edaaa3c3635974601626f8c79 |
| 2bac6e3 | styles.css | 486ce717ecbfde5a2d2529a33fbd8a2bb724d285a1b7eeaadd9c538f84624f55 |
| 2bac6e3 | tests/rally-command.test.mjs | b3bf3f9995c8a712f06d0ea1862051022a8f13853627b3774f957ca7977a211f |

STOP_REASON=ASSIGNED_READ_ONLY_FLAG_CODE_REVIEW_COMPLETED_HANDOFF_TO_ROOT；EXECUTION_DURATION=UNKNOWN（開始時未量測）；NEXT_AUTHORIZED_TASK=根代理完成最終 Chromium、定向 RALLY 效能與 C 新回合，按實際體驗接續；CHECKPOINT_SHA=2bac6e36172b82e7ca8c00c42473b5447dc5ba3e（受評來源，非本角色提交）；AUTO_RESUME_AVAILABLE=false。

文件生成時間：2026-11-05T17:44:07.128386+00:00。
