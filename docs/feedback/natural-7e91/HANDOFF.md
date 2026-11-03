# 自然戰役與生產等待說明 / Natural campaign and production wait explanations

繁體中文：ACTIVE STRATEGY沿用docs/STRATEGY-V2.4-GAME-FIRST.md及內容優先覆寫。本輪從596f3a84250d55e4b2550f635cc234f67b3086e0接續，沒有重做科技／圖鑑或舊沙暴修復。遠端Ownership242確認前任務已釋放；獨立任務NATURAL-CAMPAIGN-7E91、Execution codex-natural-7e91-20261104、分支codex/riftwatch-natural-7e91，乾跑後正常CAS認領243，提交373e3a93047a6846d72c31369c8cf65f0b3271e7。其他OWNED任務未接管。

English: ACTIVE STRATEGY remains docs/STRATEGY-V2.4-GAME-FIRST.md with its content-first override. This round continues596f3a84250d55e4b2550f635cc234f67b3086e0 without recreating codex or sandstorm work. Remote ownership242 confirmed prior task release. Independent task NATURAL-CAMPAIGN-7E91, execution codex-natural-7e91-20261104, branch codex/riftwatch-natural-7e91 was dry-run and normally CAS-claimed at243, commit373e3a93047a6846d72c31369c8cf65f0b3271e7. Other OWNED tasks were not taken over.

繁體中文：新增逐軍事建築的自動生產等待說明，涵蓋停用、手動優先、佇列上限、含佇列兵種目標、含佇列人口上限、資源／保留預算、下一次檢查及建築／兵種不可用。js/stewards.js新增唯讀productionStatus，js/steward-ui.js僅開啟介面時讀取；四語各895鍵。原trainArmy與模擬流程未改，沒有改費用、傷害、RNG、計時或軍隊選擇。正式來源a96eadfca505b6824a7e937d5d8889c1389cf458。

English: Added per-military-building automatic production explanations for disabled, manual priority, queue cap, unit targets including queues, population including queues, resources/reserves, next check, and unavailable building/units. js/stewards.js adds read-only productionStatus; js/steward-ui.js reads it when opening the panel. All four locales have895keys. Existing trainArmy and simulation paths are unchanged: no cost, damage, RNG, timing or army-selection changes. Official source a96eadfca505b6824a7e937d5d8889c1389cf458.

| 驗證 / Verification | 結果與限制 / Result and limits |
|---|---|
| Node | 51/51定向與相關回歸PASS，含5項新狀態測試。/51/51targeted and related regressionsPASS,including5new status tests. |
| Chromium | 16/16受控操作PASS，四語預算狀態、所有等待原因、手動支出優先、解除預算後原生自動續產及SaveLoad。/16/16controlled checksPASS:four locales,reasons,manual spending priority,native auto-training after releasing budget and SaveLoad. |
| 構建 / Build | 正式build_playtest.py，150/150資源SHA-256一致，沒有部署。/Official build_playtest.py,150/150resource SHA-256matches,no deployment. |
| 自然進度 / Natural progress | 進行中：中國STEWARD-RECOVER，正常資源／速度，來源272d00db953ba79822f6cc11b9959917908ea2ec。已真正清除前三波並進入第四波，第三波原生待領卡存檔保留。/IN_PROGRESS:Chinese STEWARD-RECOVER,normal resources/speed,source272d00db953ba79822f6cc11b9959917908ea2ec.Three waves naturally cleared and fourth entered;native third-wave pending-reward save retained. |

繁體中文：自然腳本只以原生UI設定與領卡，沒有注入資源、清空敵人、調速度、跳波或補血。第一次錄影因Playwright未指定既有ffmpeg runtime路徑而失敗，屬環境／夾具錯誤，修正啟動變數後開始實錄；不是遊戲缺陷。自然原始錄影與逐次存檔仍在/workspace/natural-7e91，完整影片暫LOCAL_ONLY。進行中不宣稱五波、完整十波、自然NG+、長期性能或硬體GPU通過。

English: The natural harness only uses native UI configuration and reward claiming; no resource injection, enemy clearing, speed changes, wave skipping or healing. Initial video launch failed because Playwright lacked the existing ffmpeg runtime path: an environment/fixture error, corrected before actual recording, not a gameplay defect. Full natural video and sequential saves remain at /workspace/natural-7e91, full video temporarily LOCAL_ONLY. This in-progress record does not certify five waves,ten waves,naturalNG+,long-term performance or physicalGPU.

繁體中文：本次安全保存後繼續驗證，不以Push為結束。歷史低FPS時鐘、嚴格SaveLoad、自然RiftPrototype與長期性能狀態保留。未改main、Pages、既有RC、公開部署、Issues、其他Owner Feed或排程。

English: Validation continues after this safety push; pushing is not an ending condition. Historical low-FPS timing,strictSaveLoad,naturalRiftPrototype and long-term performance states remain. No main,Pages,existingRC,public deployment,Issues,other-ownerFeed or scheduling changes.

## 續行發現的真實缺陷 / Actual defect found during continuation

繁體中文：自然續行存檔發現自動施工村民變成idle/manual=true；updateBuild每次近身施工都覆寫manualEconomy=true，抵消planBuilding指定的false。修正該更新，不動手動放置／指令入口既有鎖定。Node先重現自動完工與讀檔後施工兩項FAIL；第一版存檔測試忘記離開主選單，補正並加時間必須推進的斷言，原結果保留。修復後54/54相關測試PASS。正式最終來源bb5d7fe0b79adb8df0edeb5d537c608392d96b0e，150/150資源雜湊一致。

English: Natural continuation saves exposed automatic builders becoming idle/manual=true. Every nearby updateBuild tick overwrote manualEconomy=true, cancelling planBuilding's false authority. Removed that overwrite while retaining existing manual placement/order locks. Node first reproduced failures after automatic completion and restored construction. The initial restore fixture omitted leaving the menu; it was corrected with an explicit advancing-time assertion and its original output retained. Related tests then pass54/54. Final official source bb5d7fe0b79adb8df0edeb5d537c608392d96b0e,150/150resource hashes match.

繁體中文：真正Chromium正常設定、相同AUTO-BUILDER種子743745780、原生自動建第三屋：兩版均由村民10於約16模擬秒完工，約22秒觀察時舊版idle/manual=true，新版gather/manual=false且已採得資源；無pageerror。完整短影片與前後截圖在evidence/builder。這是自動工人流失缺陷，不宣稱它獨自造成所有戰敗。舊存檔已存在的manual=true無法安全區分玩家命令，沒有自動批次解除；玩家可明確使用既有交還閒置村民功能。

English: Actual Chromium uses ordinary settings, identical AUTO-BUILDER seed743745780 and native third-house planning. Villager10 finishes around16simulation seconds in both builds. Around22seconds, old is idle/manual=true; fixed is gather/manual=false and carrying gathered resources, without pageerrors. Short full recordings and screenshots are in evidence/builder. This is an automatic-worker attrition defect, not proof it alone caused every defeat. Existing manual=true workers in old saves cannot safely be distinguished from player orders; no bulk automatic unlock was added. Players may explicitly use the existing idle-worker release control.

繁體中文：第一場自然戰役於502.48模擬秒／約518.88現實秒第四波戰敗，前三波實際完成；原敗局不改寫。第二場從第三波存檔、以正常UI改食物優先／解除食物預留／擴建房屋及農田、採防禦軍隊方案，仍在第四波約505秒戰敗。兩者均在工人修復前。最終構建現正從原生第三波存檔續行，不把先前結果冒稱最終修復驗收。

English: The first natural campaign loses in wave4 at502.48simulation/~518.88wall seconds after clearing3waves; its original defeat is retained. A second native wave3 continuation uses normalUI food priority, releases the food floor, plans houses/farms and a defense army, but still loses in wave4 around505seconds. Both precede the builder fix. Final-build native wave3 continuation is now running; earlier outcomes are not represented as final-fix acceptance.
