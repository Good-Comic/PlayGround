# 選卡存檔與恢復 / Card-choice save and recovery

**中文：** 修復前待選卡快照遺失候選順序及重抽次數，Continue隱藏選卡介面而無法推進。新增原生選卡存檔按鈕，沿用pause.save四語文字；恢復候選ID、原順序、已付費重抽次數，Continue重開介面。缺候選資料的舊boon快照於修改遊戲前拒絕，不重抽猜測；一般舊存檔仍可讀。不改卡牌、重抽成本、Normal或波次。

**English:** Pending-card snapshots previously lost offered order/reroll count, while Continue hid the choice UI and prevented progress. Added a native card-choice Save button using the existing four-locale pause.save text. Restore offered IDs/order and paid reroll count, and reopen the UI on Continue. Old boon snapshots missing choices are rejected before mutating the game rather than guessing via a fresh draw; normal legacy saves still load. Cards, reroll costs, Normal and waves are unchanged.

**中文：** 定向測試比較實際下一次重抽、資源扣款及RNG序列；uint32狀態以相同比特比較，不以signed／unsigned顯示差異誤判。真實瀏覽器驗證待完成，不宣稱完整Save/Load確定性或自然十波通過。

**English:** Directed tests compare the actual next reroll, resource charge and RNG sequence; uint32 state is compared by bits rather than signed/unsigned presentation. Actual browser validation is pending, not a claim of full Save/Load determinism or natural ten-wave acceptance.

## 真實瀏覽器驗收 / Actual browser acceptance

**中文：** 精確來源 `798bcffdfe8e97bdd4e8abe6c67f18223b540877` 的34檔本地Artifact已通過四語×100%／130%共8組真實Chromium流程（1280×720）。每組透過原生Start後，以明確CONTROLLED_FIXTURE呼叫正式結算進入選卡，再原生重抽、選卡存檔、Reload、Continue；候選順序、RNG、金額一致，第二次重抽正確扣40金、領取只前進一波。130%時新增存檔控制仍位於畫面內。Console／Page／失敗請求皆0。21項受影響Node測試通過。這不是自然十波或公開網站驗收，整體嚴格Save/Load仍未通過。

**English:** The exact34-file local artifact from `798bcffdfe8e97bdd4e8abe6c67f18223b540877` passes8actual Chromium workflows: four locales×100%/130%,1280×720. Each uses native Start, explicitly CONTROLLED_FIXTURE production settlement to enter rewards, then native reroll/save/reload/Continue. Offered order, RNG and gold match; the second reroll correctly charges40gold and claiming advances one wave only. The added Save control remains in viewport at130%. Console/Page/failed requests:0.21affected Node tests pass. This is not natural ten-wave or public-site acceptance; overall strict Save/Load remains unverified.

## 舊戰役資料分析與下一步 / Existing campaign analysis and next step

**中文：** 不重跑戰役，分析V6自然資料得到18次村民從下一份存活清單消失的觀察，16次最後狀態為採集／返程、11次三格內無友軍。原始稀疏取樣與時間不確定性見worker-loss-observations.json，不能當逐擊死亡因果證據。下一步應加入僅觀察的傷害來源／護衛範圍記錄，從最新有效存活快照接續，先重現實際失守再修復，不能只調等待時間或改Normal。

**English:** Without rerunning campaigns, analysis of existingV6natural data finds18observations of villagers absent from the next live roster;16last gathered/returned and11had no friendly military within3tiles. Sparse samples and timing uncertainty are recorded inworker-loss-observations.json, not per-hit causal death evidence. Next add observation-only damage-source/guard-coverage recording and continue the latest valid living save; reproduce actual exposure before repair, rather than adjust wait times or Normal.

**中文：** 本輪SCHEDULED_RESUME_EXECUTED；因執行窗口保存，無活躍測試，推送後釋放所有權。低FPS、嚴格確定性、性能FAIL、Rift Prototype未重現與HARDWARE_TEST_PENDING不取消。地形選項仍待使用者回覆，沒有公開部署。跨對話寫入工具不可用，未宣稱送達。

**English:** SCHEDULED_RESUME_EXECUTED; checkpointed at the execution-window limit, with no active tests and ownership released after push. Low-FPS, strict determinism, performance FAIL, unreproduced Rift Prototype and HARDWARE_TEST_PENDING remain. Terrain options still await the user; no public deployment. Cross-thread writing is unavailable and delivery is not claimed.
