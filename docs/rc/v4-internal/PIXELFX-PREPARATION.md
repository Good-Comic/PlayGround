# PixelFX只讀準備／Read-only PixelFX preparation

繁體中文：只讀來源Good-Comic/pixelfx，固定HEAD a84159688af3ca37a4be05a0d422b94451b2e24e。已讀README、docs/CATALOG.md、LICENSE及實際NOTICE.md（NOTICE無副檔名為404）。本輪不複製程式、特效或字型進RC，也不安裝PixelFX。後續必須獨立任務、唯一Execution與獨立分支認領。

English: Read-only sourceGood-Comic/pixelfx pinned toa84159688af3ca37a4be05a0d422b94451b2e24e. Read README, docs/CATALOG.md, LICENSE and actual NOTICE.md (extensionlessNOTICE returned404). No code/effects/fonts copied into RC and no PixelFX installation. Future integration requires its own task, unique execution and independent owned branch.

| 候選ID／Candidate | Riftwatch用途／Use | 目錄尺寸／Catalog size |
|---|---|---|
| melee/sword-slash | 近戰命中方向／Melee strike direction |136×104|
| impacts/blunt-hit | 鈍擊回饋／Blunt impact |128×88|
| impacts/hit-flash | 英雄與Boss受擊／Hero/Boss hit |80×64|
| projectiles/arrow | 可讀箭矢／Readable arrows |112×32|
| holy/divine-shield | Aegis護盾／Aegis shield |88×84|
| holy/heal | 回復提示／Healing cue |80×104|
| lightning/chain-lightning | 已有連鎖恩賜回饋／Existing chain-boon cue |248×104|
| impacts/ground-slam | Boss落地攻擊／Boss ground strike |288×208|

繁體中文：最小方案先離線使用官方node tools/render.mjs <id> --sheet產生透明PNG與Aseprite式JSON，經權利／輸出檢查再新增FX描述轉換器，把frame rect、duration、loop、pivot接入現有Atlas；以正式攻擊／命中／技能事件觸發，不改判定。使用地面錨點與前後圖層，避免人物範例或演員dummy誤入Riftwatch。現有Renderer使用drawImage；先預載與快取裁切，限制同時實例，遠處合併／剔除，遵守迷霧。候選尺寸是原始畫布，不代表可直接使用的記憶體預算。

English: Start offline with official node tools/render.mjs <id> --sheet exporting transparent PNG and Aseprite-style JSON. After rights/output inspection, a small descriptor adapter maps frame rectangles, durations, loop and pivot into existing atlases. Trigger from actual attack/impact/cast events without changing outcomes. Use ground anchors/front-back layers and exclude stock example actors/dummies. Existing Renderer uses drawImage; preload/cache crops, cap concurrent instances and cull distant/hidden effects. Catalog dimensions are source canvases, not approved memory budgets.

繁體中文：若改用即時createFx，需獨立種子與純視覺RNG，不呼叫game.rng、不參與damage；禁止每個實例全畫面putImageData。離線種子、匯出工具版本、輸出SHA256、透明範圍、縮放及攻擊時序都須固定記錄。模擬暫停時視覺是否凍結沿用遊戲規則，不以FX計時決定戰鬥。先對8候選抽2項比較drawImage批量Atlas與runtime渲染成本，量測CPU／記憶體／P95，不能沿用RC數字宣稱PixelFX性能通過。

English: A runtime createFx alternative needs independent seeds/visual RNG, never game.rng or damage ownership; prohibit full-screen putImageData per instance. Pin export seed/tool version/outputSHA256, transparency bounds, scaling and attack timing. Visual pause follows game rules; FX clocks never decide combat. First compare two of the eight candidates using batch Atlas drawImage versus runtime rendering, measuring CPU/memory/P95. RC measurements do not validate PixelFX performance.

繁體中文：MIT允許商用／修改／再分發，但須保留2026 Patch與Hugo Duprez版權與LICENSE。NOTICE指出sim.js／部分效果改編Hugo Duprez，act.js改編2026 rehan-remade的Hollow Crown（MIT），若取用須保留相應聲明。gallery/fonts的Patch Pixel字型不在MIT範圍，排除全部字型及gallery資產。未讀選定特效逐檔頂部聲明、未執行匯出或視覺／性能測試，這些是後續整合前必要檢查，不是本輪已完成成果。

English: MIT permits commercial use/modification/redistribution while retaining2026 Patch/Hugo Duprez copyright and LICENSE. NOTICE identifies Hugo-derived sim.js/effects and act.js adapted from2026 rehan-remade Hollow Crown(MIT); retain applicable notices if used. Patch Pixel in gallery/fonts is outside MIT: exclude fonts and gallery assets. Selected effect-file headers, actual exports and visual/performance tests have not been checked/run; these remain mandatory before future integration.
