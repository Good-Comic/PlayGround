# 16文明英雄整合 / Sixteen-civilization hero integration

來源／Source `5ff70ccc99555b1c22e6ecbf47a6386de0f4ef10`. **16/16 functional implementation and native integration**; **13 scoped render gates accepted /3 performance INCONCLUSIVE** (SPA/MNG/MAG). Not unconditional16/16 performance or release QA PASS.

繁體中文：16文明均具獨立英雄裝備、192格八方向六狀態、原生可操作主將、Mark/Aegis文明標記、匹配肖像與兵器聲音。此來源通過11項整合Node及9項受影響舊路由回歸、66項真實Chromium檢查。每文明使用新context、原生選文明／Seed／Start、Tab直接控制、WASD移動、E護盾與冷卻，確認同一已解碼圖像的肖像及當前文明隔離；不注入資源、單位、存檔或直接呼叫遊戲開始函式。16張原生遊戲圖、16張技能圖、16支影片保留。16張肖像從已記錄的原生Canvas PNG原樣解碼，驗證原始資料URI雜湊，無重製或改像素；已逐張檢視。各英雄近戰、受擊、死亡、Mark及實際WebAudio，沿用矩陣列出的個別來源證據，不冒稱本次原生準備階段全部重跑。

English: All16 civilizations have individual hero equipment,192-cell eight-direction/six-state atlases, native playable commanders, civilization Mark/Aegis symbols, matching portraits and weapon cues. This source passes11 integration Node/nine affected old-routing regressions and66 actual Chromium checks. Each fresh context uses native civilization/seed/Start, Tab direct control, WASD movement and E shield/cooldown, verifying portraits from the same decoded image and current-civilization isolation. No resource/unit/save injection or direct game-start calls. Retain16 native gameplay images,16 skill images and16 videos. Sixteen portraits are unmodified PNG bytes decoded from recorded nativeCanvas data, checked against original data-URI hashes and reviewed individually. Individual melee/hit/death/Mark/actual WebAudio evidence remains pinned to each matrix source; not represented as fully rerun in this preparation-phase integration.

繁體中文：SPA舊測量+22.2%相對p50 FAIL保留，工具修訂後當次門檻通過仍列跨量測INCONCLUSIVE；MNG一組+25%、MAG首組+90% FAIL保留，其他配對與有界批次未證明穩定退步，因此條件功能驗收、性能INCONCLUSIVE。原始20%與平均33.3ms／p9550ms門檻未改；不以批次結果覆蓋單次FAIL。KOR舊性能FAIL與快取修正前後證據亦保留。這不是自然十波、主觀流暢度／聽感、嚴格Save/Load或GPU／實體硬體驗收；SAR及其他歷史FAIL／NOT_TESTED保留。不公開部署，不啟動第二Agent。

English: Retain SPA's prior+22.2percent relative-p50 FAIL; its passing current gate after tool-only revision does not erase cross-run INCONCLUSIVE. Retain oneMNG+25percent and firstMAG+90percent FAIL; other pairs/bounded batches do not establish stable regression, hence conditional functional acceptance/performanceINCONCLUSIVE. Original20percent and mean33.3ms/p9550ms budgets unchanged; batching never overwrites single-draw failures. KOR's old performance failures and cache before/after evidence remain. Not natural ten-wave/subjective smoothness/listening/strictSaveLoad/GPU/physical-hardware acceptance. SAR/other historicalFAIL/NOT_TESTED remain. No public deployment or second-agent launch.

| Civ | Scoped status | Individual art source | Same-source actual evidence |
| --- | --- | --- | --- |
| MNG | SCOPED_ACCEPTED_PERF_INCONCLUSIVE | `d3ad78c2f719dff27b70f8f033dfdfff72f69c4c` | [Game](browser/MNG-gameplay.png) / [Portrait](browser/MNG-portrait.png) / [Video](browser/MNG.webm) |
| TEU | SCOPED_ACCEPTED | `e5ccf8d1042aefed8cbd240045b3995c6ae86341` | [Game](browser/TEU-gameplay.png) / [Portrait](browser/TEU-portrait.png) / [Video](browser/TEU.webm) |
| GOT | SCOPED_ACCEPTED | `32f5e7f226ab4b323f9db5dc1ef5ca3fbe4f856a` | [Game](browser/GOT-gameplay.png) / [Portrait](browser/GOT-portrait.png) / [Video](browser/GOT.webm) |
| FRK | SCOPED_ACCEPTED | `97b11b64ce4c13772318e9ddda7387297650d9e1` | [Game](browser/FRK-gameplay.png) / [Portrait](browser/FRK-portrait.png) / [Video](browser/FRK.webm) |
| SAR | SCOPED_ACCEPTED | `c578426100ed6c2927cdcf3382faa1ffc606f337` | [Game](browser/SAR-gameplay.png) / [Portrait](browser/SAR-portrait.png) / [Video](browser/SAR.webm) |
| AZT | SCOPED_ACCEPTED | `0333583ff5db69404272f20d058518eef9a10443` | [Game](browser/AZT-gameplay.png) / [Portrait](browser/AZT-portrait.png) / [Video](browser/AZT.webm) |
| BRI | SCOPED_ACCEPTED | `8a714c2f42eabffb789fa147078e2a2c1b541ad9` | [Game](browser/BRI-gameplay.png) / [Portrait](browser/BRI-portrait.png) / [Video](browser/BRI.webm) |
| CHN | SCOPED_ACCEPTED | `0bd29b4c59c2a6acbca47fd029bbbeea22932666` | [Game](browser/CHN-gameplay.png) / [Portrait](browser/CHN-portrait.png) / [Video](browser/CHN.webm) |
| PER | SCOPED_ACCEPTED | `5ef184234f7edf2490978e096ce5e704ed1b08b5` | [Game](browser/PER-gameplay.png) / [Portrait](browser/PER-portrait.png) / [Video](browser/PER.webm) |
| KOR | SCOPED_ACCEPTED | `8876dbe683afe886d969502c21296486e978387f` | [Game](browser/KOR-gameplay.png) / [Portrait](browser/KOR-portrait.png) / [Video](browser/KOR.webm) |
| SPA | SCOPED_ACCEPTED_PERF_INCONCLUSIVE | `fda334715531e0ade9ff9c463612cfb7cf94d4e3` | [Game](browser/SPA-gameplay.png) / [Portrait](browser/SPA-portrait.png) / [Video](browser/SPA.webm) |
| TUR | SCOPED_ACCEPTED | `5035fa17ce9b315444bdbed2635e7af2ed111dc2` | [Game](browser/TUR-gameplay.png) / [Portrait](browser/TUR-portrait.png) / [Video](browser/TUR.webm) |
| BYZ | SCOPED_ACCEPTED | `fba75c2a09bc19a8a1c15291cde043b6fbf2f764` | [Game](browser/BYZ-gameplay.png) / [Portrait](browser/BYZ-portrait.png) / [Video](browser/BYZ.webm) |
| VIK | SCOPED_ACCEPTED | `97b11b64ce4c13772318e9ddda7387297650d9e1` | [Game](browser/VIK-gameplay.png) / [Portrait](browser/VIK-portrait.png) / [Video](browser/VIK.webm) |
| MAG | SCOPED_ACCEPTED_PERF_INCONCLUSIVE | `a6d44602c2fe49937b46eeb70be893673ff2e53d` | [Game](browser/MAG-gameplay.png) / [Portrait](browser/MAG-portrait.png) / [Video](browser/MAG.webm) |
| JPN | SCOPED_ACCEPTED | `9d8a9f9710a1b1701b36c17e6d32bb15d05cdc3a` | [Game](browser/JPN-gameplay.png) / [Portrait](browser/JPN-portrait.png) / [Video](browser/JPN.webm) |

繁體中文：下一步為Boss預警倒數可讀性，使用既有傷害區域與模擬倒數，不改傷害半徑、延遲或數值。 / English: Next Boss warning countdown readability using existing damage geometry/simulation timing, without changing damage radius/delay/stats.
