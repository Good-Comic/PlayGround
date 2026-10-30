# 剩餘英雄階段 QA / Remaining-hero stage QA

繁體中文：來源固定於下表，主開發限定驗收；未啟動或等待獨立QA。主要Diff為七文明原創裝備生成器、192格PNG／裁格資訊、文明commander路由、肩側Mark/Aegis徽記、兵器聲音及共用按需解碼／裁格快取；數值、碰撞、導航與技能規則不變。KOR觸發快取熱路徑改善與外部空Map相容性修正，原始性能FAIL全保留。

English: Sources pinned below, primary-developer scoped acceptance; independent QA neither launched nor awaited. Main diff: seven individual equipment designs/generator,192-cell PNG/crop metadata, civilization commander routing, Mark/Aegis shoulder glyphs, weapon cues and existing deferred decoding/crop cache. Stats/collision/navigation/skill rules unchanged. KOR prompted crop-cache hotpath/externally supplied empty-map fixes; all original performance failures remain.

| Slice | Source | Report |
| --- | --- | --- |
| v240-byz-hero | fba75c2a09bc19a8a1c15291cde043b6fbf2f764 | docs/evidence/v240-byz-hero/REPORT.md |
| v240-kor-hero | 8876dbe683afe886d969502c21296486e978387f | docs/evidence/v240-kor-hero/REPORT.md |
| v240-spa-hero | fda334715531e0ade9ff9c463612cfb7cf94d4e3 | docs/evidence/v240-spa-hero/REPORT.md |
| v240-tur-hero | 5035fa17ce9b315444bdbed2635e7af2ed111dc2 | docs/evidence/v240-tur-hero/REPORT.md |
| v240-mng-hero | d3ad78c2f719dff27b70f8f033dfdfff72f69c4c | docs/evidence/v240-mng-hero/REPORT.md |
| v240-bri-hero | 8a714c2f42eabffb789fa147078e2a2c1b541ad9 | docs/evidence/v240-bri-hero/REPORT.md |
| v240-mag-hero | a6d44602c2fe49937b46eeb70be893673ff2e53d | docs/evidence/v240-mag-hero/REPORT.md |

繁體中文：逐文明原生Start，頭部／身體選取、右鍵移動與近戰、Tab直接控制、Q/E；以正常縮放檢視輪廓、兵器、血條與技能遮擋，再看攻擊／施法／死亡影片。敵軍與100英雄為受控fixture，不代表自然戰役；音訊WAV含指令SFX，不代表人工聽感。12 Node／17遊戲檢查／7音訊檢查各自來源固定。SPA跨量測性能INCONCLUSIVE：先前相對20%門檻FAIL保留，即使工具修訂後複測當次門檻通過，也不抹除或宣稱性能修復。其他條件列以完整矩陣為準。

English: NativeStart for each civilization, head/body selection, right-click movement/melee, Tab direct control and Q/E. Inspect normal-zoom silhouette/weapons/health-bar/skill occlusion, then attack/cast/death videos. Enemies/100 heroes are controlled fixtures, not natural campaigns; WAV includes commandSFX, not human listening.12 Node/17 gameplay/seven audio checks are source-pinned. SPA cross-run performance remains INCONCLUSIVE: earlier20percent gateFAIL retained despite a passing current retest after tool-only revision, without claiming a performance fix. Consult the full matrix for other conditional rows.

繁體中文：SAR性能INCONCLUSIVE、原生Save/Continue13項限定PASS不等於嚴格確定性、生命週期22項限定PASS／長期洩漏INCONCLUSIVE、GPU顯存／自然NG+／硬體NOT_TESTED及自然十波／低FPS歷史缺口保留。完成16文明後另附同來源原生整合與16張實際遊戲代表圖；不得只看檔案與測試數量宣稱完成。

English: Retain SAR performanceINCONCLUSIVE, native Save/Continue13 scopedPASS without strict determinism, lifecycle22 scopedPASS/long-run leakINCONCLUSIVE, GPU memory/naturalNG+/hardwareNOT_TESTED and natural-campaign/low-FPS historical gaps. After16 civilizations, attach native integration and16 real gameplay images at one source; file/test counts alone do not establish completion.

## 全16文明整合 / All16 integration

來源／Source `5ff70ccc99555b1c22e6ecbf47a6386de0f4ef10`:20 focused/affected Node,66 Chromium PASS.16 native gameplay/skill images,16 native portraits and16 real videos: docs/evidence/v240-all-heroes-integration/REPORT.md; docs/evidence/v240-all-heroes-integration/GALLERY.html.

繁體中文：16功能實裝，SPA／MNG／MAG性能條件驗收，非16性能全PASS；各文明完整來源與音訊證據在docs/art/CIVILIZATION-HERO-MATRIX.json。未啟動獨立QA，等待與否不阻塞後續Boss可讀性開發。 / English:16 functionally implemented; SPA/MNG/MAG have conditional performance acceptance, not16 unconditional performancePASS. All art/audio sources are in docs/art/CIVILIZATION-HERO-MATRIX.json. Independent QA not launched or required before further Boss readability work.
