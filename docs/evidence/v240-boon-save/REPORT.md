# 選卡存檔與恢復 / Card-choice save and recovery

**中文：** 修復前待選卡快照遺失候選順序及重抽次數，Continue隱藏選卡介面而無法推進。新增原生選卡存檔按鈕，沿用pause.save四語文字；恢復候選ID、原順序、已付費重抽次數，Continue重開介面。缺候選資料的舊boon快照於修改遊戲前拒絕，不重抽猜測；一般舊存檔仍可讀。不改卡牌、重抽成本、Normal或波次。

**English:** Pending-card snapshots previously lost offered order/reroll count, while Continue hid the choice UI and prevented progress. Added a native card-choice Save button using the existing four-locale pause.save text. Restore offered IDs/order and paid reroll count, and reopen the UI on Continue. Old boon snapshots missing choices are rejected before mutating the game rather than guessing via a fresh draw; normal legacy saves still load. Cards, reroll costs, Normal and waves are unchanged.

**中文：** 定向測試比較實際下一次重抽、資源扣款及RNG序列；uint32狀態以相同比特比較，不以signed／unsigned顯示差異誤判。真實瀏覽器驗證待完成，不宣稱完整Save/Load確定性或自然十波通過。

**English:** Directed tests compare the actual next reroll, resource charge and RNG sequence; uint32 state is compared by bits rather than signed/unsigned presentation. Actual browser validation is pending, not a claim of full Save/Load determinism or natural ten-wave acceptance.
