# 程序式衝車車身拾取限縮唯讀複評

任務 RAM-BODY-PICK-065E2912。本輪來源為 `b9699d627ae28f75eca33ee05aa0ac54311d27ae`，修改前正式基線為 `83554e6a23d4d6c5631d3e21c8cdf7f968b64dbf`。Owner 282 與正常 Push 狀態由派工提供；本角色未操作 Git 或 Ownership，沒有獨立核驗遠端 Push。

**結論：可採認這項受控範圍內的 UI 拾取修正成立。** 程序繪製的衝車木殼、屋頂及撞頭原本有可見實心位置未被拾取，修正後在代表點、192 組繪圖案例及原生布令／恢復路徑中可指向同一衝車。來源的新增幾何對應原畫面填色，既有視野閘門、候選排序及命令流程有保留依據；沒有證據把本次視為碰撞、攻擊距離、費用或其他玩法數值調整。這是局部控制修正的採認，不核准新的命中／遮擋機制，不接管其他 Owner 的工作，也不宣告自然勝率、真人樂趣或整體發布驗收通過。

**讀取與版本範圍**

本角色閱讀指定的 before-r2／after-r1 result.json、RESOURCE-VERIFICATION.json、node-focused-r2.tap、perf-r1/result.json，以及不可變 build-r1 的 build-metadata.json、Game.pickAt、新 ram-body-picking 與原 Renderer.drawUnit／drawRamUnit。另只讀首輪採樣失敗 result.json 與 Node r1 的匯入錯誤摘要，以保留失敗脈絡。未讀 C2 目錄、私有觀察、玩家原始存檔或任何未封存玩家內容，未向 C2 傳遞答案，本複評不等候也不評自然戰役。

已實際 view_image：修改前及修改後 native-wood-click.png、兩版 native-attack-plan.png、新版 native-attack-executed.png。未操作瀏覽器、遊戲或效能工具，沒有執行 Node／測試，也沒有改既有封存檔；本輪寫入限定為新的 director 三個檔案。

[構建 metadata](/workspace/riftwatch-ram-pick-065e2912/build-r1/build-metadata.json) 宣告上述 b9699 來源、PLAYTEST-EXPERIMENTAL、AFTER_LOCAL_ONLY_UNTIL_AUTHORIZED_DEPLOY。實際核對 game.js、ram-body-picking.js、renderer.js 三檔 SHA256 皆與 manifest 相符。[資源核對紀錄](/workspace/riftwatch-ram-pick-065e2912/RESOURCE-VERIFICATION.json) 記錄 166/166、零 fail；相對 83554 只有 game.js 變更，新增 ram-body-picking.js，既有 164 項不變。166 項為該已完成紀錄的結果，本角色沒有重做全包核對或用 Git 比對整份來源差異。

**修改前缺陷與修改後效果**

[正式修改前重現](/workspace/riftwatch-ram-pick-065e2912/browser-before-r2/result.json) 有 10/10 重現檢查、零程式錯誤；[修改後](/workspace/riftwatch-ram-pick-065e2912/browser-after-r1/result.json) 有 12/12、零程式錯誤。兩者明列 CONTROLLED_PICKING_FIXTURE：原生 Start、正式戰術暫停、受控新增可見衝車，滑鼠點擊與布令走原生入口。這不是自然刷出的戰役或自然勝利。

| 原繪圖代表點 | 修改前 alpha／拾取 | 修改後 alpha／拾取 |
| --- | --- | --- |
| 木殼右側 wood-right | 255；core #1 | 255；ram #20 |
| 木殼左側 wood-left | 255；tower #5 | 255；ram #20 |
| 金屬撞頭 metal-head | 255；null | 255；ram #20 |
| 屋頂 wood-roof | 255；null | 255；ram #20 |

原中央點擊在修改前仍能排入集火，是有效的正控制。before-r2 記錄木殼點擊後集火摘要為空；after-r1 同類木殼點擊得到「1. 集火敵軍 ×4」，恢復後檢查實際目標為所點 ram。前後縮放約 1.10488／1.10771、暫停模擬時間約 0.2500／0.3167，並非逐幀完全相同；代表點依各自當時幾何計算，不能當成完全相同螢幕像素的盲測。

圖片的判讀也須限縮：兩張 [修改前木殼點擊](/workspace/riftwatch-ram-pick-065e2912/browser-before-r2/native-wood-click.png)／[修改後木殼點擊](/workspace/riftwatch-ram-pick-065e2912/browser-after-r1/native-wood-click.png) 都顯示戰術軍隊計數「選取 0 人」，不能單憑該數字宣稱是否拾取到敵方衝車。該環節的依據是結構化拾取 ID、程式與後續原生命令的合併證據。

兩版 native-attack-plan.png 都可見「1. 集火敵軍 ×4」；依 result 的順序，修改前這張是中央點擊成功的正控制，不能誤標成木殼失敗圖。新版 [恢復執行圖](/workspace/riftwatch-ram-pick-065e2912/browser-after-r1/native-attack-executed.png) 實際顯示「執行 1 項布令，略過 0 項失效指令」、「4 人集火衝車」及同一衝車 220/220 HP。這確認命令鏈成立；當刻滿血不提供傷害、擊殺、救城或勝率證明。

修改後 192 案涵蓋敵我雙方 × 0.78／1／1.6 縮放 × 八方向 × idle／move／attack／hit 四姿態，全部通過。每案抽樣四個車身點及三個外側位置，並非全像素窮舉；繪圖矩陣的抽樣 alpha 最低 224，不能把 192 案都描述為每點 alpha255。四個最初缺陷代表點則確實都是 alpha255。

**程式與既有繪圖是否吻合**

[ram-body-picking.js](/workspace/riftwatch-ram-pick-065e2912/build-r1/js/ram-body-picking.js:5) :6–14 限定存活 ram、有限座標／縮放／動畫輸入；若既有通用或文明圖集有對應項，就交回原圖集流程。:16–24 使用與 Renderer 相同的移動狀態、晃動及 directionalAnimationFrame，將螢幕點反轉回局部車身座標。

[Renderer.drawUnit](/workspace/riftwatch-ram-pick-065e2912/build-r1/js/renderer.js:1499) :1503–1507 的縮放與 bob，:1521–1523 的 mirror／depthScale／受擊平移，對應新函式 :18、:23–24 的反變換；[drawRamUnit](/workspace/riftwatch-ram-pick-065e2912/build-r1/js/renderer.js:1943) :1947 的底座橢圓、:1949 的木殼梯形及 :1957 的撞頭圓，分別對應新函式 :28、:27、:29。座標直接沿用原繪圖，沒有把這些畫面尺寸寫回模擬單位。新增幾何本身不包含旗幟、血條、陰影及梯形斜邊外空白；原有中央與圖集拾取仍存在。

[Game.pickAt](/workspace/riftwatch-ram-pick-065e2912/build-r1/js/game.js:3240) :3244 仍先排除死亡及不可見單位，之後才計算位置與新增車身判定。:3247–3248 仍用原中央距離 d、嚴格小於 bestScore 及既有中央圓／圖集路徑；新增 ramBodyContains 只增加對應車身的候選資格。:3250–3269 仍先返回合格單位，再處理建築與資源。排序規則保留不等於所有舊位置都回傳相同物件；木殼點現在能選到衝車，正是本次預期的候選資格修正。

新函式只讀輸入與原動畫／圖集資料，沒有寫單位、資源、HP、冷卻、碰撞半徑或 RNG 的語句。受控紀錄與定向結果支持這些邊界：幾何查閱前後時間／兩種 RNG 不變；fixture 的碰撞半徑 0.4、攻擊距離 1 保留；原生布令可恢復，後續手動命令仍可覆寫。這是已查路徑與測試範圍內的保留依據，不是全面模擬等價或嚴格 Save/Load 的重新認證。

**定向測試及歷史失敗**

[node-focused-r2.tap](/workspace/riftwatch-ram-pick-065e2912/node-focused-r2.tap) 實際摘要為 143 tests、143 pass、0 fail、0 skipped、0 todo。內容涵蓋車身斜邊／底座／撞頭、旗幟與外側排除、八向／縮放／受擊／晃動、未來圖集回交、真實 Game、視野與沙暴先行、死亡、快照與原生戰術布令／覆寫等路徑。這是已保存的測試執行結果，本角色未重跑。

首輪 browser-before-r1 的狀態仍為 FAIL，四點採樣 alpha 均 0，尚未達到「正式木殼有不透明像素」這個前提。派工明確指出它使用綁定 drawUnit，畫到原 ctx，屬採樣夾具錯誤；本角色保留此說明及 raw，不將它算成 Game bug 或正式修改前證據。before-r2 的四點 alpha255 才支持本次重現。

Node r1 原始 TAP 仍有 29 pass、7 fail；七筆均是 fixture 檔匯入時 `document is not defined`，並非已載入後的拾取斷言失敗。r2 提供 Node document 後載入完整檢查，143/143。派工明示測試未刪除；本角色沒有用 Git 差異再驗證這一點，也不覆寫兩輪 raw。143 通過不能清除原有嚴格 RNG 表示／Save/Load 等歷史 FAIL；TAP 本身也有明示不改判該歷史 FAIL 的案例。

**短效能資料的可用界線**

[perf-r1/result.json](/workspace/riftwatch-ram-pick-065e2912/perf-r1/result.json) 為四案 N=1：名目 100／200 實體各 before／after 一次，3 秒暖機、約 10 秒活戰鬥。保留自動經濟、軍務、AI、碰撞與死亡，原生滑鼠每約 80ms 掃過初始可見衝車位置；各案後另開總管與診斷 3 次、每次約 2 秒。實際活躍數會變動，不能當成整段固定 100／200 人。

| 名目實體／版本 | 活戰鬥秒數 | 原生 hover 次數 | FPS | P95 幀時 ms | 活躍數起→終 |
| --- | ---: | ---: | ---: | ---: | --- |
| 100／before | 10.049 | 103 | 30.25 | 50.0 | 89→90 |
| 100／after | 10.048 | 101 | 29.56 | 50.0 | 89→88 |
| 200／before | 10.075 | 102 | 20.15 | 66.6 | 178→160 |
| 200／after | 10.069 | 99 | 19.47 | 66.7 | 178→161 |

配對紀錄的初始 scene hash、RNG、visualRng 相同，全部總管暫停查閱 cycle 記錄 pausedUnchanged=true，errors 為空。每案掃的是初始螢幕座標，單位在移動／死亡，不能把 hover 次數當成每次都命中同一台衝車或精確 helper 呼叫次數。

短樣本中 after FPS 較低、P95 接近；N=1、非 ABBA、活戰鬥軌跡及工具排程差異，使這份資料不足以判定穩定回歸或無回歸。200 人 before／after 約 10.08／10.07 秒牆鐘只推進約 9.814／9.364 秒模擬，也不能藉此清除既有低 FPS 時間完整性疑慮或將差異直接歸因於此修正。heap 受 GC 影響，十秒資料不證明記憶體洩漏或長期穩定。環境為 SwiftShader／SwANGLE，CPU quota 4 核、記憶體限制 32 GiB；不代表實體 GPU 表現。開總管呼叫時間是 Playwright 往返，不是純 UI 事件延遲。

**保留限制與下一候選**

此修正沒有建立依最後畫面像素遮擋排序的新機制。密集單位互遮、建築覆蓋、畫面前後層優先，以及所有車輪／細線／動畫邊緣的完整可點範圍仍未窮盡驗證；原本的中央距離排序繼續存在。192 案不涵蓋所有重疊場景，也不能泛化為其他兵種均無拾取問題或全部未來衝車圖集都已驗證。

本輪不核准擴大其他單位的命中框、不改碰撞或攻距、不另造目標選擇／事件訊息／來源行邏輯、不接管其他 Owner。C2 的自然戰役、一般新手理解、自然勝率與真人樂趣均未評估；不因受控修正成立就追認先前玩家的全部點擊失敗是同一根因。

下一項獨立遊戲改善候選：**INSUFFICIENT_EVIDENCE**。目前直接證據足以支持已完成的這個車身切片，沒有足夠新增證據核准另一項。保持既有任務與封存資料，不製造新任務或要求 C2 配合本角色答案。

STOP_REASON：限縮唯讀複評及封存完成。EXECUTION_DURATION：379.233 秒，從 2026-11-06T05:39:14.922523Z 本輪首次檢查至報告寫出，封存另計。NEXT_AUTHORIZED_TASK：父任務依既有授權續作，C2 保持獨立；本角色不操作遊戲。CHECKPOINT_SHA：b9699d627ae28f75eca33ee05aa0ac54311d27ae（本次遊戲來源，非報告提交）。AUTO_RESUME_AVAILABLE：未驗證，未建立排程。
