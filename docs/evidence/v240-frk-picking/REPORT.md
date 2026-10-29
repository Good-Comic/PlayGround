# FRK 騎兵頭盔原生選取修復 / FRK cavalry native helmet-picking fix

來源／Source: `bb0e43f8ff1cd2fb5e6691f1521115d4aa5efbcf`. 原始失敗／Original failure: `35c54c55eddce7def1639ed12c40fc684a1aec6b`.

繁體中文：原生左鍵點既有 FRK 頭盔未選取，腳部對照通過、遊戲未暫停。只新增 FRK UI 身體橢圓與血條高度；圖檔完全沿用、無素材重製。物理半徑、路徑、成本、HP／傷害與既有加成未改。長槍尖與移高血條不擴大為選取區。

English: Native clicks on the existing FRK helmet failed while foot selection passed, with the game unpaused. Only a FRK UI body ellipse and health-bar height are added; existing images are reused without recreation. Physical radius/pathing/cost/HP/damage/bonuses remain unchanged. Lance tip and relocated health-bar space are excluded from the extension.

繁體中文：9 Node PASS，包含三個新點選／保存／隔離測試、三個受影響 FRK 外觀／平衡測試及三個既有資源／同型選取相關測試。6 Chromium PASS：精確來源、腳部、頭盔左鍵選取、實際右鍵移動、空地取消與無瀏覽器錯誤。已人工檢視選取畫面；原始 FAIL／前後圖片及錄影均保留。沒有重跑 FRK 歷史完整美術驗收。

English: Nine Node checks PASS: three new picking/save/isolation tests, three affected FRK appearance/balance tests and three related resource/same-type selection checks. Six Chromium checks PASS: exact source, feet, native helmet selection, actual right-click movement, ground deselection and no browser errors. Selection screenshot was manually inspected; original FAIL and before/after images/video remain. The historical full FRK art acceptance was not repeated.

繁體中文：固定 100 騎兵、2000 次查詢皆正確；此序列基準／修復平均 0.07665／0.06960 ms，p95 0.15／0.11 ms，低於 1 ms 本地輸入預算。單次軟體比較不宣稱硬體效能提升，也不是 FPS。全部歷史 FAIL 保留，未公開發布；接續 SAR 既有盾衛的獨立視覺。

English: All 2,000 queries over 100 static riders are correct; serial baseline/fix mean is 0.07665/0.06960 ms and p95 0.15/0.11 ms, below the local 1 ms input budget. One software comparison does not establish hardware speedup and is not FPS. Historical FAIL remains; no public deployment. Continue with independent visuals for existing SAR guards.

BILINGUAL_DOCUMENTATION_REQUIRED = true
