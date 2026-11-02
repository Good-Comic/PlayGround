# 沙暴修復與候選驗收／Sandstorm fix and candidate acceptance

繁體中文：GDD issue8砂海列明8秒預警、視野降低20%、持續20秒。根因為executeSandstorm使用setTimeout，不受暫停、模擬速度或讀檔控制。現移除現實計時器，在Game.update的暫停／選卡／結算守門之後按有效模擬dt扣減effects.sandstorm，保留20秒，不改其他環境事件。既有snapshot/restore保存effects；重複觸發刷新20秒且不產生過期回呼。

English: GDD issue8 specifies8-second warning,20% vision reduction and20-second duration. executeSandstorm used setTimeout outside pause, simulation speed and save restoration. It now decrements effects.sandstorm by effective simulation dt after Game.update pause/boon/end-state guards, preserving20 seconds and other events. Existing snapshot/restore retains effects; retrigger refreshes20 seconds without stale callbacks.

繁體中文：定向Node21/21、綜合Node418/418通過。Chromium受控真實21秒等待：暫停前後模擬時間相同、剩餘20秒；snapshot/restore後仍20秒；恢復401個正式update步驟後歸零。修復前FAIL證據原樣保留。正式構建來源2cded526145480f2fe547d8fb4d428c7e09db6fe，127檔SHA256全部相符，構建在/workspace/riftwatch-rc-sandstorm-final。這是計時狀態驗證，不宣稱已看見沙暴視覺或視野效果。

English: Focused Node21/21 and comprehensive Node418/418 passed. Controlled Chromium21-second wall wait preserved simulation time and20 seconds remaining; snapshot/restore retained20 seconds;401 production update steps expired it. Pre-fix FAIL evidence is preserved. Formal build source2cded526145480f2fe547d8fb4d428c7e09db6fe has127 matching SHA256 payload hashes at /workspace/riftwatch-rc-sandstorm-final. This validates timing state, not visible storm artwork or vision reduction.

繁體中文：視野仍未接入。程式只有索敵半徑與文明sight資料，未找到統一可見性／迷霧計算；不得把縮短索敵距離擅稱視野實作。保持BLOCKED，SPEC_DECISION_REQUIRED僅針對缺少可見性整合語義，不針對已明定倍率或持續時間。下一步確認既有核准可見性設計並實作，不自創平衡。

English: Vision remains unconnected. Source contains acquisition radii and civilization sight data but no unified visibility/fog calculation. Reduced aggro cannot be silently relabelled as vision. Status remains BLOCKED; SPEC_DECISION_REQUIRED concerns missing visibility integration semantics, not the specified multiplier/duration. Next: establish approved visibility design and implement without invented balance.

繁體中文：受控長流程明示核心HP一千萬、八台HP一百萬攻城車；正式傷害擊敗第5／10波Boss，80000步後第10波仍有五名敵軍，FLOW_NOT_VERIFIED，勝利與NG+ NOT_TESTED。不是自然十波或性能基準PASS。沿用歷史原生16文明66項、受控Boss8項及自然短樣本INCOMPLETE，但因遊戲來源更新，這些只作歷史證據，非新來源全面驗收。其餘環境／恩賜／RTS瀏覽器矩陣與15分支工具等效審核仍待完成。未部署、未改main或其他Owner feed，未清理Git物件。

English: Controlled long-flow explicitly injects10-million core HP and eight1-million-HP siege units. Production damage killed wave5/10 Bosses, but five enemies remained on wave10 after80000 steps: FLOW_NOT_VERIFIED; victory/NG+ NOT_TESTED. This is not natural ten-wave or benchmark PASS. Historical native16-civ66 checks, controlled Boss8 checks and natural short INCOMPLETE remain historical evidence, not comprehensive acceptance for changed source. Remaining environment/boon/RTS browser matrix and15-branch tool equivalence audit remain pending. No deployment, main/other-owner feed edits or Git cleanup.
