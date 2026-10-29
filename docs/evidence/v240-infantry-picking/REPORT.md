# 修復 TEU／AZT／BYZ 可見頭部與身體點選 / Fix visible-head and body selection for TEU/AZT/BYZ

來源／Source: `659b1b2ba472150da5abb75c22550ee86873b737`. 原始失敗／Original FAIL: `c8c4ec1444e5b84cba935bff70dd06897fd6a982`.

繁體中文：原生左鍵點 TEU 頭盔時 selection 為空，腳部同場景正向對照能選取；不是暫停誤判。新增僅適用三個文明 Atlas 的 UI 身體橢圓，保留既有腳部圓形與最近候選順序。沒有修改物理半徑、碰撞、導航、傷害或平衡。長槍尖端、血條及遠處地面不擴大為可選區。

English: Native TEU helmet clicks produced empty selection while the same-scene foot positive control selected correctly, with the game unpaused. Atlas-specific UI body ellipses extend only these three civilization variants, preserving legacy foot circles and nearest-candidate ordering. Physical radii/collision/navigation/damage/balance remain unchanged. Spear tips, health bars and distant ground are excluded.

繁體中文：8 Node PASS；最終來源 16 Chromium PASS：三文明真正左鍵頭部選取、右鍵移動、舊腳點與空地取消選取，沒有瀏覽器錯誤。已檢視三張選取畫面；TEU 截圖仍帶首頁淡出過渡，選取框與單位可辨。受控場景非自然戰役，圖片／影片與原始 FAIL 保留。第一版 e2ae83d 的 16 PASS 及成本增加亦保留；最終版提前排除更遠候選。

English: Eight Node checks and 16 final-source Chromium checks PASS: real head clicks, right-click movement, legacy foot selection and empty-ground deselection for all three civilizations, with no browser errors. All three selection screenshots were inspected; TEU retains a home-screen fade transition, with selection/unit still visible. These are controlled fixtures, not a natural campaign. Images/video and original FAIL remain. First version e2ae83d's 16 PASS and increased input cost also remain; final code rejects farther candidates earlier.

繁體中文：100 單位、2000 查詢均正確。最終序列比較基準／修復平均為 0.07785／0.08810 ms，p95 為 0.15／0.22 ms，低於本次 1 ms 輸入預算；仍增加約 0.01025 ms，不宣稱零退步或跨次量測可直接比較。這不是 FPS／硬體驗收。歷史自然十波／NG+、低 FPS、嚴格存讀、渲染性能、Rift 與硬體缺口保留。下一項為 MAG 輕騎視覺，安全保存後繼續。

English: All 2,000 queries over 100 units are correct. Final serial baseline/fix mean is 0.07785/0.08810 ms and p95 0.15/0.22 ms, below this local 1 ms input budget; the mean still increases approximately 0.01025 ms. No zero-regression or direct cross-run comparability claim. This is not FPS/hardware acceptance. Historical natural campaign/NG+, low-FPS, strict save/load, rendering, Rift and hardware gaps remain. Next: MAG light-cavalry visuals; continue after saving.

BILINGUAL_DOCUMENTATION_REQUIRED = true
