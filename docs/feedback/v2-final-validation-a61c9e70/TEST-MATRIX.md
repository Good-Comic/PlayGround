# 最終驗收矩陣

遊戲來源 `28759c7bff98ae34d92be9318291e1eb6979d6d4`。本輪沒有再改遊戲程式，只有修正測試假陽性與完成既定驗收。新版使用者協議以 [USER-PROTOCOL-V2.md](USER-PROTOCOL-V2.md) 為快照；所有新報告採臺灣正體中文。

|項目|結果與範圍|
|---|---|
|Node|來源未變，復用103／103 PASS（7新增＋相關回歸），不宣稱完整遊戲認證。|
|正式構建|after168／168資源SHA正確；before167亦逐檔通過，詳SOURCE-VALIDATION.json。|
|受控因果|15個raw檢查PASS，但原到達標籤過寬，正式僅進展PASS／終端抵達NOT_TESTED；手動目標、來源命中鏈獨立PASS，不能亂加成總驗收通過數。|
|既有有效檢查|核對同module SHA後復用34項四語／12視口／阻擋／舊畫面等結果，獨立列項不與15相加。|
|真正選牌遮擋|22／22 PASS；受控正式completeWave獎勵hook，不冒充自然通波；32節點、3候選、重抽／領取／篩選／縮放可用。|
|三角色自然before|同來源、文明、地圖、難度、seed、完整控制；A3波後第4敗、B4波後第5敗、C3波後第4敗。完整歷史封存繼承，沒有重跑B/C。|
|自然after新C|全新自然第4波敗、3波、96擊殺、4697採集、8:16；本人finish、無cap／pageerror；262公開檔封存，289完整原始檔保留。|
|新元件自然用途|本人看見並理解歷史壅塞10人，選出10人再自行右鍵；10人皆接令，各自曾進assigned落點0.08內，後有再壅塞／自主接敵。持續疏通、擊敗衝車、城心反事實減傷UNKNOWN。|
|Game Director after|局部理解與可操作效益成立；前後再玩意願皆3／5，不證樂趣或留存大幅提升。|
|P4效能|8／8 ABBA，初始100／200，8秒暖機＋30秒量測；起點scene／fixture／雙RNG相符，無pageerror。非固定100／200存活、非長期或Windows GPU驗收。|
|歷史失敗|舊run03攻擊HP下降假陽性、錯visibility API、各新夾具FAIL、嚴格Save／Load FAIL、低FPS模擬流失及自然十波／NG+未完成均保留。|
|媒體交付|新長影片與3分塊LOCAL_ONLY；沒有合法附件上傳或通用Artifact工作流，不能稱已下載可用。230個原始非媒體檔與少量關鍵PNG遠端保存。|

受控攻擊真閉環：正常視野內敵#20、native pick同敵；原生右鍵後兵#15/#16均manualAttack且target20；同來源applyDamage兩筆，敵HP60→58→56。這不是自然通關或整場減傷。

自然C重選鏈請見 [GROUP-RECOVERY-CHAIN.json](GROUP-RECOVERY-CHAIN.json)，逐人列初始／最小／最後距離、狀態及再受阻，不用純位移宣稱到達。5秒離散取樣與後續自主行為限制保留。
