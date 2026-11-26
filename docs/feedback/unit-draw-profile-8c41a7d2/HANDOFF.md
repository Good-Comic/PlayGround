# 單位繪製小樣本：主要成本在SVG Sprite，不在陰影

本輪沒有修改正式runtime或素材，完成上一輪指定的成本拆分與一個局部向量視窗原型。沒有重跑自然戰役或重新嘗試被撤回的敵軍查詢順序調整。

## 實際成本

受控100／200友軍，刀盾兵、弓兵、輕騎兵混合；清除建築／資源／裝飾、測試地形設為grass以確保合法生成與固定鏡頭，Game.update不前進。未選與原生F2全選兩種，每組1秒暖機、3秒量測。實際單位數、全選數、Atlas無fallback及遊戲狀態／RNG不變都有斷言；不是自然戰役、正常人口限制內的軍隊或動態戰鬥。

|單位|選取|Sprite ms/幀|陰影 ms/幀|陣營腳環 ms/幀|血條 ms/幀|單位總計 ms/幀|FPS|
|---|---|---:|---:|---:|---:|---:|---:|
|100|無|10.498|0.519|0.517|0|12.508|32.8|
|100|全選|8.831|0.459|0.354|0.177|10.479|29.6|
|200|無|15.275|0.596|0.612|0|17.479|21.9|
|200|全選|16.092|0.733|0.712|0.294|19.012|17.1|

Sprite內實際IMG drawImage同步呼叫約8.698–15.890ms/幀；陰影CANVAS drawImage約0.347–0.588ms/幀。兩者都保留原繪圖方法，未關閉陰影、陣營標記、血條或碰撞來造較好結果。

同步performance.now包裝每個方法與drawImage，時間包含巢狀呼叫，不能相加，也不等於GPU執行時間；記錄成本未校準。每條件只有一次3秒樣本，不能從FPS差異推論「選兵導致多少退步」或正式性能改善。完整幀P50／P95、方法呼叫／總時／最大值、heap起訖與GPU資料保留於profile.json和summary.json。靜止視野快取在本輪可命中，因此迷霧時間小，不能覆蓋上一輪動態場景的迷霧瓶頸結論。

結論：在這組通用SVG兵種下，優先處理Sprite路徑比再調陰影更有價值；不泛化到未量測的英雄／Boss PNG圖集或所有文明。

## 單格向量視窗原型

為區別先前像素失敗的固定解析度位圖快取，本輪僅在本機記憶體建立巢狀SVG：保留原根viewBox、寬高及內容，外層用64×64視窗移到對應圖格。沒有重新畫圖、改服裝或正式替換資產。

militia E idle原點圖格及NW walk非零圖格（sx704、sy64、frame1），各DPR1／2×scale0.6／1／1.6共12組，RGBA全部零通道差異。此結論只適用兩個指定影格，不是80格、全部動作／方向／文明、濾鏡／死亡或整個renderer認證。

NW walk另作200次重疊drawImage同步呼叫短ABBA：原圖15.9ms→巢狀SVG16.1ms→巢狀SVG50.7ms→原圖17.9ms。未強制GPU完成、未校準、沒有遊戲FPS測量；沒有穩定成本收益，原型NOT_ADOPTED，未接入正式renderer，也沒有繼續擴大昂貴測試。

原SVG約81108字元，巢狀原型約81213字元，仍包含全部圖格。這是可追溯的下一個假設來源，不足以證明全部成本都由無關圖格造成。未建立正式快取、增加長期記憶體或重寫素材。

## 驗證及限制

Node validate.mjs PASS：4組實際數量／狀態／RNG／Atlas紀錄一致、每幀單位呼叫數相符、12組像素零差異及非零圖格驗證。這是QA資料定向驗證，不宣稱新增正式遊戲回歸測試。Chromium154.0.8037.57、SwiftShader軟體GPU，頁面零錯誤，168個正式構建資源逐檔SHA-256與頁內完整性通過。

沿用已正式構建19f91ea8da075c39e3fe7681a92896cd515d48cf；本輪安全基線9067ed64d9b211fbe745642b36bdfb7e3e70c574與其runtime無差異。沒有為純診斷再造遊戲版本，沒有繞過完整性檢查。

NOT_TESTED：Windows實體GPU、GPU完成時間、長期記憶體／洩漏、自然十波、C-36精確重播、四語／存讀／NG+、真人趣味及影片。未宣稱改善留存或戰鬥操作。PNG是實際200單位受控全選場景，HUD人口可超過正式上限，不能當自然軍隊建成證據。

## 所有權與接續

Task UNIT-DRAW-PROFILE-8C41A7D2；Agent unit-draw-profile-8c41a7d2；Execution unit-draw-profile-20261126-8c41a7d2；branch codex/riftwatch-unit-draw-profile-8c41a7d2。基線9067ed64d9b211fbe745642b36bdfb7e3e70c574，Strategy e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d。Ownership411核對後Dry Run→CAS412，收據bbaf8dc7426e6e04f296777a13ad9f9b23ecbf92。最終遠端SHA與釋放收據見回報及工作樹外收據。

未接管其他Owner、改Progress Feed、main、Pages、RC、公開部署或排程，歷史失敗保留。Boss秒數仍待正式決策，C-36整體根因未定。

STOP_REASON=AGENT_EARLY_STOP：完成成本定位及否決局部原型後結束，沒有聲稱額度或環境阻塞，仍有後續合法工作。
EXECUTION_DURATION=UNKNOWN，未完整量測本輪執行期間；量測段範圍如上。
CHECKPOINT_SHA=9067ed64d9b211fbe745642b36bdfb7e3e70c574（本輪只有診斷工具與證據，runtime不變）。
NEXT_AUTHORIZED_TASK：單一通用SVG影格的保守內容裁減原型，先驗證能否減少無關圖格而保持精確像素及獲得成本收益，再決定是否值得擴大；不重跑完整戰役或採用本次無收益巢狀視窗。
AUTO_RESUME_AVAILABLE=UNVERIFIED；QUOTA_PERCENT_UNKNOWN。
