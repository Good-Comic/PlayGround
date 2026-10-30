# 文明英雄選取肖像 / Civilization hero selection portraits

來源／Source: `296772b1709df5370c58c36e9ea3aee83c0bc446`. SCOPED_ACCEPTANCE_PASS.

繁體中文：TEU、JPN、AZT 選取面板現在重用世界渲染器已載入的英雄 Atlas，呈現各自兵器、盔甲與輪廓。尚未載入或失敗時沿用程序肖像，完成載入後無須重新選取便更新。其他文明、敵軍及普通單位保留原有肖像；不新增圖片下載，不改技能、平衡或模擬。

English: TEU/JPN/AZT selection portraits reuse the world renderer's loaded hero atlases, showing their weapons, armour and silhouettes. Procedural fallback remains during loading/failure and refreshes without reselection once ready. Other civilizations, enemies and ordinary units retain their portraits. No new image downloads, skill/balance or simulation changes.

繁體中文：4 Node、32 真實 Chromium 檢查通過；三張實際遊戲全畫面已人工檢視。包含原生開始及英雄選取、同一 Image 物件、受控 ready/failed 旗標、無重選更新、FRK 與村民回歸、連續十次無變動更新零重繪、四組各60次強制肖像重繪取樣。局部平均約0.025–0.029ms，p95 0.1–0.2ms；不是整體 FPS 或實體硬體驗收。旗標模擬不是 HTTP 故障測試。開發期 Node 測試 fixture 的 document 初始化失敗另行保留，修正後通過。

English: Four Node and32 actual Chromium checks pass; three full gameplay screenshots were manually inspected. Coverage includes native start/hero selection, same Image identity, controlled ready/failed flags, refresh without reselection, FRK/villager regression, zero redraws across ten unchanged updates and60 forced portrait redraw samples per profile. Local means about0.025–0.029ms and p95 0.1–0.2ms are not whole-game FPS or hardware acceptance. Flag simulation is not an HTTP failure test. The development Node fixture document-initialization failure is retained separately; corrected checks pass.

繁體中文：歷史自然十波、時鐘、嚴格存讀、性能與硬體缺口保留。下一項為 VIK 文明英雄，未公開部署。

English: Historical natural-campaign, clock, strict-save, performance and hardware gaps remain. Next: VIK civilization hero. No public deployment.
