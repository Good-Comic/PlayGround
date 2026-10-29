# 水岸與淺水視覺 / Shoreline and shallow-water visuals

繁體中文：新來源 `771a6ddea2d458f1362f9717c42a10e171c85457` 為真正既有Seed地圖加入水岸石／沙色邊帶、淺水暈帶與細浪線，峽灣、灰燼與其他地貌有不同材質色。只畫在現有水格內，陸地／渡口輪廓不移動，不新增高地、坡道或可通行水域。使用者已授權的GAME FIRST視覺切片；不改核心規則。圖片、WebM及browser.json記錄來源與模式。

English: New source `771a6ddea2d458f1362f9717c42a10e171c85457` adds stone/sand bank strips, shallow-water bands and fine ripple highlights to existing seeded maps, with distinct fjord/ash/other material colors. Draws only inside existing water tiles, preserving land/crossing outlines without adding elevation, ramps or traversable water. This is a user-authorizedGAME FIRSTvisualslice, not a core-rule change. Images,WebMandbrowser.jsonrecord source/mode.

繁體中文：5項定向Node通過，包含歷史生成v1雜湊、v2 Seed生成、兩版本存讀、資源可達回歸及唯讀岸線方向。真實Chromium由原生首頁選Seed／河谷、峽灣、島嶼、灰燼地貌；之後明示控制暫停及鏡頭，未注入地形、單位或資源。13項本地檢查通過：四地貌精確40檔Artifact、前後實際terrainLayer像素變化、完整world序列化不變、首次重建繪岸而30個快取frame不再繪岸，以及頁面／網路錯誤0。此非自然戰役、跨河導航或性能FPS驗收。

English: Five focusedNodechecks pass: historicalgeneratorv1hashes,v2Seedgeneration, both-versionSaveLoad, resource-accessibilityregression and read-only shoreline directions. ActualChromiumselectsSeedandriver/fjord/island/ash through the native homepage, then explicitly controls pause/camera without injecting terrain, units or resources. Thirteen local checks pass: exact40-fileartifacts, changed actualterrainLayerpixels, unchanged serializedworld, banks drawn on rebuild but not redrawn during30cachedframes, and zero page/networkerrors. This is not naturalcampaign, river-navigation or performanceFPSacceptance.

繁體中文：首輪畫面在主選單0.55秒淡出期間拍到選單殘影，沒有據此宣稱視覺驗收完成；加入實際CSS opacity／visibility等待後重拍，初輪資料保留原診斷目錄並於qa-provenance.json標記LOCAL_ONLY。最終直接比對河谷與峽灣，岸線可辨識且既有森林、建築和水道保留。快取沿用原有terrainKey，鏡頭／縮放／地貌改變才重建；不宣稱消除既有低FPS或建築性能FAIL。舊時鐘、Save/Load、自然十波／NG+、Rift與硬體限制均保留。沒有公開部署。

English: Initial screenshots caught menu ghosts during its0.55-secondfade, so visual acceptance was not claimed from them. Added actualCSSopacity/visibilitywaiting and recaptured; initial data remains in its diagnostic directory and is labeledLOCAL_ONLYin qa-provenance.json. Direct final river/fjord comparisons show readable banks with existing forests, buildings and waterways retained. Uses the existingterrainKeycache, rebuilding on camera/zoom/biome changes; this does not resolve known low-FPSorbuildingperformanceFAIL. All historical clock,SaveLoad,naturalten-wave/NG+,Riftandhardwarelimitsremain. No public deployment.

BILINGUAL_DOCUMENTATION_REQUIRED = true
