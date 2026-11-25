# 堅守射程邊緣的原地還擊

玩家可感受差異：近戰敵人已進入合法體型射程時，堅守兵現在會原地還擊，不再只受傷。沒有增加傷害、射程數值或移動能力。

根因：`updateAttack` 允許中心距離≤unitRange+敵人體型半徑，堅守索敵與受擊還擊卻只允許unitRange。距離1.2、正式合法射程1.26的兩名刀盾兵，因此舊版只有敵人命中。

`js/game.js`：堅守索敵使用正式UNIT_TYPES最大半徑作有限候選搜尋，逐目標依原有攻擊距離篩選；受擊還擊採同一體型距離。原始scoredTarget視野、人工指定優先、被動、反制與黏著規則保留。堅守重索敵也不再取得需要追擊的遠敵。建築仍使用原有-.1距離，不把建築半徑當兵種體型。

## 驗證與證據

- Node新增8案例PASS：16文明代表性刀盾兵、受擊還擊、射程外不追擊、邊界／建築、視野／被動／人工／查詢RNG、Save/Load、遠程／大型敵人／冷卻、重索敵。不是全16文明所有兵種全覆蓋。
- 5檔定向回歸PASS：hold-reach、targeting、tactical-orders、visibility、hero-direct-local-target。擴充最後兩案例另以完整8案例直接執行PASS。
- Chromium真實原生滑鼠選兵→HUD堅守→固定步進真實updateUnits→命中紀錄，四語×前後×兩距離，共16組PASS、無pageerror。距離1.2時舊版敵人60HP、己方58HP；新版雙方58HP。己方座標都固定12,12。距離1.3固定敵人時雙方60HP、不追擊；所有命中均在正式射程內。
- 正式本地構建 `c7bb2b7b20a570281de37ed1f5209b8dc3b23fed`，168資源SHA-256全部相符；遊戲內完整性檢查未繞過。前版構建e07cab7daebe7c6fe3316f4d4bdfb6f2c0c08a47與安全基線66353fd的執行資源相同。
- `before.png`／`after.png` 為受控真實遊戲畫面，非自然戰役或真人主觀趣味證據。
- 保留node-before原始檔、direct檔、corrected檔及Chromium首輪FAIL。Node第一版在生成遠敵前記錄RNG造成錯誤比較，改正測試器後舊版仍5案例FAIL。Chromium第一版使用不存在的stun欄位，敵人自行走進合法射程，不能作射程外反例；改用正式slowUntil/slowAmount固定對照後16組PASS，未改遊戲求綠。

NOT_TESTED：自然完整戰役、原始C-36重演、NG+、Chromium原生存讀、100／200單位性能、Windows實體GPU、影片。本輪沒有任何P50/P95或FPS宣稱。C-36只有4/10命中的整體根因仍未解決，不能把本獨立堅守缺陷視為其唯一根因。

## 所有權與交接

安全基線66353fd436bbbde1f62110f5465afbbb74444920，Strategy e77e0a3afe7415bdadb6d5f3ac6c92ebf31d308d，Ownership399遠端核對。Dry Run→CAS正常Push取得400，收據e41a51eaf31dbef685a697d165fe69bff3b53f63。

Task HOLD-REACH-6C29A1F4；Agent hold-reach-6c29a1f4；Execution hold-reach-20261125-6c29a1f4；branch codex/riftwatch-hold-reach-6c29a1f4。未接管Fun Lab、英雄或其他舊Owner；未修改Progress Feed、main、Pages、公開版本或RC，未部署。遠端最終提交與正式釋放收據以本輪回報及外部收據為準，避免遞迴寫入自身SHA。

Boss預警2.4秒與GDD3–4秒的正式秒數決策仍SPEC_DECISION_REQUIRED，排程訊息未構成數值批准。本輪不重複稽核相同歷史。

STOP_REASON：AGENT_EARLY_STOP；本輪完成獨立缺陷切片與驗證後結束，沒有宣稱額度／環境阻塞，尚有後續診斷可做。
EXECUTION_DURATION：UNKNOWN（未完整量測本輪執行期間）。
CHECKPOINT_SHA：c7bb2b7b20a570281de37ed1f5209b8dc3b23fed（正式構建來源；後續只新增測試與證據）。
NEXT_AUTHORIZED_TASK：利用既有C-36相關原生地圖／封存事件，辨別其餘未命中單位的阻擋與射程因素，不重跑三角色完整戰役。
AUTO_RESUME_AVAILABLE：UNVERIFIED。
QUOTA_PERCENT_UNKNOWN。
