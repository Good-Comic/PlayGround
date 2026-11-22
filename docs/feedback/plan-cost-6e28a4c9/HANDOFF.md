# 總管提案：確認前看懂動作、費用與缺口

## 本輪成果

依既有一般玩家 B 第2項觀察，玩家曾把「等待確認 時代升級」當成查看費用，實際卻立即扣資源。本輪沒有重跑三角色自然戰役，僅診斷並改善該入口。

`js/steward-ui.js` 新增只讀 `planConfirmation(game)`，讀取目前已套用的待確認計畫。時代提案按鈕顯示「立即升級至○○ · 正式費用」，建築提案顯示「確認建造○○ · 正式費用」。另列資源需求、現有庫存及缺口；四語說明按下即扣款並送出計畫，而非查看詳情，也說明未套用設定不會一併保存，確認後會重新載入已套用設定。

沒有待確認計畫時明確標示並停用按鈕。使用真正的 `ageCost()`／`buildingCost()`、時代與建築本地化名稱，沒有另寫成本表。既有 `confirmPlan()`、研究時間、文明折扣、預留、科技門檻及建造位置規則完全保留；沒有新增面板、按鈕或每幀渲染。

## 驗證與限制

PASS：`node --import ./tools/qa/ram-pick-065e2912/node-dom-fixture.mjs --test tests/plan-cost-preview.test.mjs tests/plan-confirmation.test.mjs tests/steward-recovery.test.mjs tests/building-repair.test.mjs`，4檔通過。新測試涵蓋四語只讀預覽、完整快照不變（排除savedAt）、正確建築費用及缺口、無效提案、原確認流程單次扣款。既有確認規則測試與基線逐位元一致，未刪除。

PASS：Chromium 154.0.8037.57，修改前繁中及修改後四語，共5組，視口1440×900／1280×720／1366×768。原生啟動與總管按鈕、原生確認點擊；受控有效中國文明升級提案。四語均顯示實際折扣成本170食物／85黃金，預覽不扣資源、不改研究及兩個RNG；確認後食物500→330、黃金500→415，啟動正式研究，待確認計畫清空、按鈕停用。不是自然戰役、真人體感或勝率證據。

PASS：正式受測構建 `25f69b31624ade74a8dd7cd29035a8d97a3117be` 的168資源全部 SHA-256相符。最終程式／測試Checkpoint `4b5a7c5e9d16df4ee111488d793a845828d01ce4` 另正式構建，其168個執行資源雜湊與受測構建完全一致；後續只有測試／證據整理。

保留原始 FAIL：第一版快照測試未排除牆鐘savedAt造成比較失敗，修正測試後通過。既有steward-recovery直接執行缺少window，全域DOM fixture正式預載後通過。整理時新測試曾誤用既有檔名；已在後續正常提交恢復既有檔案並另存新測試，不重寫歷史，不以刪除既有測試求綠。

NOT_TESTED：建築提案的Chromium施工全流程（費用映射及原確認規則已Node覆蓋）、自然戰役、NG+、100／200單位性能、實體Windows GPU、操作影片。未聲稱本次改善能增加通關率或真人留存。

## 來源、所有權與邊界

基線 `bcb7f3e79f7965be4c7c06ae5082583b167e9cd6`，有效Strategy遠端 `e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d`。先核實Ownership遠端v379，再以Dry Run→CAS→正常Push取得v380，認領收據 `e81a7c9ef30f3e109f3c4d9a836d97f9107ece8d`。

獨立任務 `PLAN-COST-6E28A4C9`，Agent `plan-cost-developer-6e28a4c9`，Execution `plan-cost-20261123-6e28a4c9`，分支 `codex/riftwatch-plan-cost-6e28a4c9`。原Fun Lab、Progress Feed及其他Owner未動，未冒用租約；未向其他Owner的Feed寫入。未修改main、Pages、公開版本或既有RC；沒有部署。

僅確認本次喚醒訊息送達及本輪實作；線上排程改綁狀態仍未驗證，無替代輪詢。

下一項最高價值工作：先核對既有玩家受擊存檔與所有權，再針對維修入口／成本的守城決策做最小驗證，不重跑三角色完整戰役。
