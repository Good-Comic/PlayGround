# 結算後戰場輸入修正

來源 `35dedfe6ee203a4d9689290dc466484c39557cf8` 修正本輪真正遊玩揭露的 P1 缺陷：敗北後仍能按 E 新增神盾與冷卻。這不改變該場敗北、不增加正常戰鬥能力，也不把結算施法當成挽救成功。根代理已正常推送並完整 `ls-remote` 核對，[收據](terminal-input/remote-receipt.json)保留當次來源與範圍；本整理沒有操作 Git、瀏覽器或效能程式。

## 實際重現與根因

B 在來源 `1710938cd79da6d347a54764e85e13b11babca34` 的正常存檔續玩，於 wall 129.293 按 E；前後均為 `phase=defeat`、局內時間 `531.3062000001029`、城心已不存在。原始結算快照與最終快照顯示英雄神盾冷卻 `0 → 60`，14 個己方單位新增 `shield=60 / shieldTime=5`。不是只有提示文字。

這筆輸入、兩份快照及 SHA 保存在 [自然失敗證據](terminal-input/natural-B-before-defect.json)。B 的原始封存報告保持不改；[Director 複評](source-actions/director/SOURCE-ACTIONS-PLAYER-REVIEW.md)獨立核對後分類 P1，不誇大為 P0、敗北改寫或資源平衡問題。

`main.js` 原本只查選單、暫停等狀態，結算仍可走到戰場快捷鍵；`Game.heroAegis`、`heroMark` 與正式 `command` 入口也沒有終局防線。擴充的原生 Node 重現同時發現結算後正式命令仍可能改軍令或新增訓練支出；這些是受控擴查，不能假稱 B 自然執行過。

## 修改

- `js/main.js`：勝敗狀態停止戰場快捷鍵及左／右鍵選兵、施工、下令；進入結算前已開始的拖曳只清理手勢，不再選兵。結算原生按鈕保留 Enter 操作。
- `js/game.js`：正式命令及兩個英雄技能入口拒絕 `victory / defeat`，避免其他正常介面路徑繞過。
- `tests/terminal-orders.test.mjs`：以真實 Game／原生致命事件與受控勝利狀態驗證終局無新增技能、軍令或支出；正常 prep／wave、新局及 NG+ 仍可施放原技能。

正常技能仍為原生標記、神盾、費用、冷卻與作用半徑；沒有更改傷害、視野、AI、勝敗條件或繼承規則。中鍵平移與滾輪檢視邏輯沿用原有流程。

同提交也修正來源 HUD 在 `showPeak(null)` 的空紀錄例外，並快取不變的文字與控制狀態。每次更新仍即時驗視野與已按下的操作；實際發令不使用畫面快取當授權。[委派交接](source-actions/cache-debug/交接.md)記錄原始三項紅燈與限制。這項確定存在的重複工作已移除，**尚不能據此宣稱 200 單位 P95 警訊已解決**。

## 驗證

| 層次 | 結果 | 範圍 |
| --- | --- | --- |
| 修正前 Node | 2 PASS／6 FAIL | [原始日誌](terminal-input/before-node-r1.txt)；直接技能、正式軍令與訓練在終局仍改狀態 |
| 修正後定向整合 | 213／213 PASS | [完整日誌](terminal-input/combined-node-r2.txt)；英雄、戰術、來源、RALLY與正式視野相關回歸 |
| 正式資源 | 162／162 SHA-256 | [重算](terminal-input/resource-check.json)、[manifest](terminal-input/build-metadata.json) |
| 結算 Chromium | 19／19 PASS，零頁面錯誤 | [結果](terminal-input/browser/result.json)；正式舊構建重現 E 缺陷、新構建真正鍵鼠、技能／命令 API、原生重開與 NG+ 按鈕 Enter、新局正常 E |
| 來源手勢 Chromium | 38／38 PASS，含零 UI／傷害觀察例外 | [結果](source-actions/browser-r2/result.json)；重驗四語／四視口、SaveLoad與即時取消 |
| 旗手並存 Chromium | 29／29 PASS | [結果](source-actions/flag-compatibility-r2/result.json)；原封 C 自然快照的原生旗手操作，雙行版面另列受控刺激，不是自然旗手擊破或玩家勝利 |

Chromium 勝敗狀態使用明標原生致命扣血／`triggerVictory` 夾具，不是自然十波、自然 Boss 勝利或 NG+ 戰役通關。原始自然 B 只證實敗北後 E 缺陷。前後錄影與畫面分別保存，不把受控通過冒充玩家樂趣改善。

首兩次 Chromium 驗收腳本失敗亦保留：[首周目期待錯誤](terminal-input/initial-fixture-cycle-fail/result.json)錯把正式首周目 1 當 0；[冷卻取樣期待錯誤](terminal-input/initial-fixture-cooldown-fail/result.json)錯把已恢復模擬的讀值要求仍精確等於 60。核對正式規則與畫面後，只修正腳本；最終在施放當下記錄確切 60 秒及 60 護盾，再允許原生倒數。沒有為測試改動周目或技能數值。這兩項屬根代理腳本期待錯誤；與修正前 Node 2 PASS／6 FAIL、自然 B 終局 E、以及來源 HUD 的三個真實實作紅燈分開，不能混稱全是夾具問題。

## 保留限制與接續

來源入口 B 的自然證據仍固定在 1710938，沒有把它改標成新來源通過。查看與反擊符合可見層級意圖，精確歷史個體／取消／後令未自然驗證；仍第四波敗北。原計量工具的 `aegis=2` 混入 Continue 還原冷卻與終局 E，不能稱兩次有效戰鬥施法。

初次 171 來源的 200 單位 after 第二次 P95=99.9 毫秒、兩次 before 83.4 的警訊，以及 after `uiFaults=265／266／240／237`、原生傷害 `faults=0` 全部保留。來源 35 的功能重驗零 UI／傷害例外支持該路徑修正，不代表效能警訊已消失。第二次200限定ABBA已完成：before P95為99.9／99.9，after為99.9／83.4，四案P50皆83.3；只支持短樣本未見一致額外退步。兩個after的118筆trace `uiFaults=0`、四案237筆原生傷害`faults=0`；before缺少uiFaults欄，不補為零。初次警訊及死亡／低可見來源／長測限制不抹除，詳見[來源操作報告](SOURCE-ACTIONS-REPORT.md)。

嚴格 SaveLoad RNG `-1129663591 → 3165303705` 的歷史 FAIL 保留；自然十波／NG+、長測記憶體、實體 GPU、真人樂趣與勝率仍未證明。下一項 P3 是已批准的唯讀生產費用／已生效保留／缺口說明，五檔已本地提交 `9117a02f9b6fe4989c744b90802df522dd0b7c07`，Node64／64；正式163資源構建／Chromium驗收中、尚未推送，不列已交付。整項任務持續，`AUTO_RESUME_AVAILABLE=false`；沒有公開部署或自動喚醒宣稱。

自然終局前後兩份快照與來源SHA核對見[seal](terminal-input/SEAL-VERIFICATION.json)，既有副本大小／SHA見[copy manifest](terminal-input/COPY-MANIFEST.json)。原始B報告、兩次腳本FAIL、修正前Node FAIL與所有自然敗北均未改寫。
