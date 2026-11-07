# 因果瀏覽器驗收

正式來源 before e037a4b / after 28759c7，資源167/168 SHA全對。以原C原生存檔透過localStorage與Continue載入，同步初始場景、模擬時間與兩RNG一致；此同步觀測有明示update凍結，不代表自然複現或嚴格Save/Load決定性修復。

run04原生滑鼠重選正確2名戰士、零發令、只允許selection變更且其餘快照/HP/資源/雙RNG不變。原生右鍵移動同步對應2名戰士的指定targetPos，逐樣本距離2→0.6003；這只能稱朝落點實際進展/進入0.65鄰域，原始工具標籤寫「抵達」過寬，未等待原生idle/targetPos清除，終端抵達仍NOT_TESTED。原始REPORT不改，補此解讀。

攻擊場景回到相同原生存檔，受控僅加歷史orderFailure與原生spawn一名militia敵人，鏡頭受控置中，不搬任何單位、不改視野計算/AI/碰撞/傷害/冷卻/RNG。敵#20在正常己方視野內，g.isVisible(entity)=true且native pickAt==20；原生右鍵讓#15/#16各target20/manualAttacktrue；sim10.3494兩筆applyDamage來源分別15/16，targetId與sourceTargetId均20且manualAttacktrue，敵60→58→56。這是明確受控手動命中證據，不等擊殺、城心反事實減傷或自然通關。實際圖native-attack-damage-source.png已檢視，見2 focusing與56HP；兩個實錄webm已關閉落盤。

run01保留選取排除漏項與segmentWalkable錯API的夾具FAIL；run02/03保留無可用移動落點的夾具FAIL。run04依Game.issueCommand實際規則，戰士右鍵友方core視覺框仍fallback正常move，故不以友方建築視覺遮蓋拒絕可走落點。沒有為綠測試改遊戲。

舊recorded-order-browser/run-03的HP下降斷言正式列TEST_ASSERTION_FALSE_POSITIVE，原文不動；它的visible檢查也誤用g.isVisible(x,y)，不能把該false值當真迷霧不可見證據。新測試改正API並逐層核target/source後才PASS。

四語12視口、blocked/stale/native keyboard單次等舊有效結果由主協調核來源重用，此子任務沒有無差別重跑。全程只有此Chrome測試進程，已關閉；自然C可開始。
