# 最終驗收交接

使用者最新 Universal Autonomous Resume & Multi-Agent Development Protocol v2.0 已完整讀取，快照在 USER-PROTOCOL-V2.md；臺灣正體中文覆寫歷史雙語預設。正式遊戲仍四語。有效Strategy仍為 docs/STRATEGY-V2.4-GAME-FIRST.md。

## 本輪實際成果

安全繼承 `f3da504f553f1d02644918c490fe86ed7aab5373`，遊戲切片來源 `28759c7bff98ae34d92be9318291e1eb6979d6d4` 未再改動。既有功能為「曾受阻原因＋人工重選當前已選正式戰士子集」：只選取，不自動發令或改AI。本輪修正舊測試假陽性，完成真正來源命中驗收、新C自然操作與100／200配對效能。

舊run03僅HP下降的攻擊PASS正式列 TEST_ASSERTION_FALSE_POSITIVE；isVisible錯參數不能證明真看不見。原始檔不改。新受控敵正常可見、native pick同敵，原生命令有manualAttack與指定target，再有同source/target實際扣血60→58→56。原移動檢查標籤「抵達」過寬，正式只列朝落點進展，沒有偽裝終端抵達。

新C自然看見並理解「上次壅塞」，選出10人並自己右鍵。逐ID原始命令證實10人接令；5秒採樣中10人都曾進各assigned點0.08內，之後部分再壅塞／自主接敵。這能證明玩家改選與改令產生位置行為，不能證持續疏通、衝車解除或城心反事實減傷。新C自然第4波敗北，3波、96擊殺、4697採集，無cap／pageerror。獨立Director after原文支持局部效益，但再玩意願前後均3／5，不宣稱遊戲已大幅更好玩。

## 驗證

103 Node與168資源SHA來源核對有效；34既有有效檢查、15 raw因果檢查及22選牌遮擋檢查分別報告，不混加。真正32卡雙區、候選聚焦、重抽與明確領取在3視口及日文切換可用，新受阻元件於選牌隱藏。受控不是自然通波。

P4兩規模各ABBA、8秒暖機30秒量測，共8次。100 before28.87／28.67、after28.64／28.76 FPS，P50／P95為33.3／50ms；200 before19.83／18.81、after19.14／20.10，50／66.7ms。起點場景與雙RNG相符、零pageerror。實測存活自然變動，after面板取樣100%可見；計時inclusive不可相加、GC與共享CPU/量測overhead未校準，非長期或實體GPU通過。嚴格Save／Load、低FPS時間流失、自然十波／自然NG+與硬體限制均保留。

## 保存及媒體限制

新C全部289原檔與本人262公開seal在本機完整保留；230非媒體原始輸入／回應／私有唯讀資料可在natural-C-text審核。完整媒體MANIFEST列SHA，但新長影片與3分塊沒有推入Git，詳MEDIA-DELIVERY.json。唯一現有Actions為受保護OpenCode流程，不是上傳通道；平台沒有附件上傳工具。沒有建立Artifact、公開Release或部署，不能把工作區路徑當可下載網址。原先歷史Git媒體不刪不重寫。少量關鍵PNG、報告與雜湊正常保存。

外部轉送與本接收端執行分開：本輪實際續作成功，不代表已把排程改綁PlayGround-V4／target thread或durable。未有正式傳訊／scheduler介面，AUTO_RESUME_AVAILABLE=false，不建立替代輪詢。

## 所有權及下一合法接續點

本獨立任務 V2-FINAL-VALIDATION-A61C9E70 於OWNED290、收據12f76883fe95250e0e10ca85ec23fa54c22e7a4e認領；原FUN273、V2 OWNED288、恢復驗收289記錄未接管或釋放。沒有使用prior-stopped，也沒有改原Owner的來源列、軍令摘要、生產文案或Feed。

最高價值下一項是核對FUN-LAB-281169B5原Owner狀態與合法交接後，處理閱讀與點擊間來源列變動的目標穩定性。該範圍仍被原Owner持有，不能因舊OWNED或額度中斷擅自接管。經濟支出/生產說明亦在其範圍。需要更改導航回退、修理、危機窗口或平衡者仍須設計核實；本輪不擅改規則。媒體交付則需一個合法持久附件通道。

本文件描述發布前安全快照；最終遠端SHA與Ownership釋放收據另由外部驗證，不遞迴刷新自己的SHA。沒有改main、Pages、既有RC、OmGitHub、Immutable或OpenCode。
