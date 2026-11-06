# 獨立恢復驗收交接

## 最新保存點：實際元件待瀏覽器與自然複測

獨立替代A已完整自然第4波敗北（3波、83擊殺、33訓練），原始295檔含268公開seal與72,652,464 bytes/801.84秒影片，已完整分3塊保存。B自然第5波敗、C第4波敗之舊封存原文不動；三角色同source、167資源、seed、freeze、native save與公開seal檢查全部通過，見COHORT-VERIFICATION.json。原先中斷A仍另列PARTIAL，不混正式完整結果。

獨立Director先封存Phase1，後核技術/GDD/Ownership於Phase2裁決。實際新遊戲程式來源28759c7bff98ae34d92be9318291e1eb6979d6d4：獨立受阻歷史記錄短行與人工重選當前選取中的有記錄正式戰士子集；只有setSelection，零自動發令、不改AI或碰撞。明說歷史記錄不代表當下卡住；主將直控/落點/對話等阻擋。7項新增及相關回歸合計103/103 Node通過；正式構建168/168 SHA相符。Chrome run02已驗原生mouse/Enter/Space單次選組、四語12視口及零DOM重建/pageerror；完整run03仍在進行，snapshot.savedAt夾具FAIL保留，移動/實際命中及新自然C尚待，不標完成。

P4完整baseline同build ABBA共8次已量測，來源e037a4bc15e56579adf776c84b2afbf712762871（payload同45c8223）；初始100/200、暖機後實際存活下降，逐run時間曲線及inclusive分項保留；初始scene/雙RNG配對相符，零pageerror。這是同build重複，不能稱before/after提升，亦非持續100/200存活、Windows GPU或長期穩定性。新元件after配對尚待。


使用者最新要求所有新交接採臺灣正體中文，覆寫舊雙語預設。有效 Strategy 為 docs/STRATEGY-V2.4-GAME-FIRST.md；遊戲沿安全完整來源45c8223，既有B/C驗收遠端100fb6168427d63569b4ce0264d794d5722e8183。

新任務 V2-RESUME-AUDIT-7D392C8E，以獨立執行身份 codex-v2-resume-audit-7d392c8e-20261107、獨立分支認領 OWNED289；Dry Run 後正常版本條件發布，遠端 receipt 75ab02cc482137872a77a25f0480beac3a42419e。舊 FUN273 與 V2 OWNED288 未接管、未釋放，也未使用 prior-stopped。

中斷的正式A原始資料完整複製且不改原文；179檔分2塊保留，見 interrupted-A-raw/MANIFEST.json。原生錄影未final但ffprobe可讀434.520秒、39,248,310 bytes；result/frames/final不存在，不冒稱自然結束。原先usage limit平台錯誤是真實中斷，剩餘百分比未知。

獨立替代A已先複製僅其原歷史兩份BASELINE並驗既有SHA；不讀pilot、舊A本局策略或B/C。相同freeze四SHA、原正式build167hashgate、FRK/steppe/normal、DOM FUN-LAB-BASE-281及actual1116648138；同1200秒框架上限，新局非讀檔，使用真滑鼠鍵盤及完整共同控制說明。B/C已完成封存僅引用，不重跑不修改。

## 下一步

1. 已完成獨立A與三角色封存；接續新元件Chrome run03及受控native-save配對。
2. 已完成獨立Director兩階段裁決；接續隔離C新自然複測，保持歷史FAIL。
3. 按前三問題選合法低風險最小遊戲修正，與原native save前後及新自然場對照；未批准規則不改。
4. 最新完整100/200各ABBA四次、8秒暖機30秒live，逐系統inclusive及1Hz heap/alive，不稱硬體或長期PASS。
5. 正式build/hash、Node/Chromium/畫面、正常push完整SHA與Recovery。

普通檢查點不是停止；AUTO_RESUME_AVAILABLE=false（沒有可驗證排程介面）。未公開部署，main/Pages/RC/OmGitHub/Immutable及其他Owner工作均不改。
