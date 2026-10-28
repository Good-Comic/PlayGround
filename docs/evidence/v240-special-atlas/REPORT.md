# 諸葛弩外部動畫素材與時序 / Repeating-crossbow external animation and timing

**繁體中文：** `LOCAL_VERIFIED`，並非公開Preview驗收。受測遊戲來源與Build SHA為`b9893ac1319f033a8ef0db0b98ed9fc183dde3f1`；先前SVG來源`e3ccd1c6bf43782a213c210787becf0352e6a757`、光柵化來源`6cfe71f4577491a228658e2633034b149e38fb54`分開保存。精確Build包含36個受校驗payload，詳見`build-metadata.json`。無公開部署或平衡修改；原有低FPS、嚴格Save/Load、建築性能、自然戰役及硬體缺口不變。

**English:** `LOCAL_VERIFIED`, not public Preview acceptance. Tested game source/Build SHA:`b9893ac1319f033a8ef0db0b98ed9fc183dde3f1`. Earlier SVG source`e3ccd1c6bf43782a213c210787becf0352e6a757` and raster source`6cfe71f4577491a228658e2633034b149e38fb54` are recorded separately. The exact Build has36verified payloads; see`build-metadata.json`. No public deployment or balance changes. Existing low-FPS, strictSave/Load, building performance, natural campaign and hardware gaps remain.

## 實際改善 / Actual changes

**繁體中文：** CHN既有`chu_ko_nu`使用獨立原創Atlas：直立層甲、肩甲、頭盔、弩身、箭匣及槓桿動作，非弓兵改色。八方向×idle／walk／attack／hit／death，每組四影格；保留現有Canvas回退。素材由`tools/art/generate_chu_ko_nu_atlas.py`產生SVG，再由`tools/art/rasterize_atlas.mjs`透過Chromium無損轉PNG。未下載或複製第三方美術，不新增第三方授權負擔；生成原始碼與可替換素材均在Repository內。這是單一兵種的初步風格切片，不代表16文明美術或高品質最終素材已完成。

**English:** Existing CHN`chu_ko_nu`now uses an independent original atlas: upright lamellar armor, pauldrons, helmet, crossbow, bolt magazine and lever action, rather than a recolored archer. Eight directions×idle/walk/attack/hit/death, four frames each, with existing Canvas fallback. `tools/art/generate_chu_ko_nu_atlas.py` generates SVG;`tools/art/rasterize_atlas.mjs` losslessly rasterizes to PNG through Chromium. No third-party artwork was downloaded/copied and no third-party license dependency was added; generator and replaceable assets are in the repository. This is an initial single-unit style slice, not completion of sixteen civilizations or final high-quality artwork.

**繁體中文：** 同時修正已證實的Atlas播放時序缺陷：`attackAnim`與`hitFlash`實際是1→0的正規化強度，舊繪製卻除以0.22／0.2秒，令多數動作停留第一影格。新`atlasActionProgress`使用實際強度，死亡仍依1.2秒生命週期。只變更繪製，不改攻速、傷害、碰撞、導航、成本、RNG或存檔資料。

**English:** Also fixed a confirmed atlas playback defect: production`attackAnim`/`hitFlash`are normalized1→0amplitudes, but rendering divided them by0.22/0.2seconds, holding most of an action on frame zero. New`atlasActionProgress`uses actual amplitude; death retains its1.2-second lifetime. Rendering only: no changes to attack speed, damage, collision, navigation, costs, RNG or save data.

## 真實瀏覽器與人工檢查 / Actual browser and visual review

**繁體中文：** `final/browser.json`共9檢查PASS，定向Node共12項PASS。正式Start選CHN、固定Seed，之後明示`CONTROLLED_FIXTURE`建立多兵種展示，並使用正式移動命令及真實滑鼠右鍵攻擊敵軍；實際發射投射物且捕捉四個攻擊影格。傷害／死亡透過正式Game方法觸發，非自然戰役。八方向展示為明示擺姿，不冒充八方向實際導航驗收。Console、Page Error、HTTP錯誤及失敗請求均0。觀看`final/browser.webm`；比對`before-canvas.png`與`after-atlas.png`。人工檢視確認直立層甲、橫向弩及箭匣有別於旁邊弓、劍盾與騎兵；東北方向背部與裝備遮擋、死亡倒伏可辨識。極小縮放仍有細節損失，未宣稱精細插畫級品質或完整文明風格合格。

**English:** `final/browser.json`has9PASS checks;12focused Node tests pass. Native Start selects CHN and fixedSeed, followed by an explicit`CONTROLLED_FIXTURE`multi-unit gallery using production movement commands and an actual right-mouse enemy attack. Production projectiles fire and all four attack frames are observed. ProductionGame methods trigger damage/death; this is not a natural campaign. Eight-direction images are explicitly posed, not eight-direction navigation acceptance. Zero Console/Page/HTTP/failed-request errors. Watch`final/browser.webm`; compare`before-canvas.png`and`after-atlas.png`. Visual inspection distinguishes upright lamellar armor, transverse crossbow and magazine from adjacent bow, sword/shield and cavalry; NE rear/equipment layering and fallen death pose are readable. Tiny zoom still loses detail; fine-illustration quality and complete civilization styling are not claimed.

## 失敗與成本 / Failures and cost

**繁體中文：** 首輪`initial-svg`FAIL：友軍先傷敵，不能證明諸葛弩已射擊；展示被市鎮中心遮住。SVG100人繪製JS平均28.10–29.73ms，雖未超33.3ms，遠高於回退1.75–1.91ms，仍視為不可接受的相對退步並改用PNG。`raster-probe`FAIL：測試點到腳下，原生選取要求身體位置，未發出攻擊。改為真正滑鼠右鍵身體位置後`raster-native-click`通過。保留全部結果，不將工具失敗說成遊戲Bug。

**English:** `initial-svg`FAIL: allied damage did not prove crossbow firing; the Town Center occluded the gallery. SVG100-unit renderJS averaged28.10–29.73ms: below33.3ms but far above fallback1.75–1.91ms, treated as an unacceptable relative regression and replaced with PNG. `raster-probe`FAIL: the test targeted feet while native picking requires the body, so no attack issued. Actual body-position right-click passed in`raster-native-click`. All results remain; harness failures are not presented as game bugs.

| 最終100人繪製 / Final100-unit draw | 平均JS ms / MeanJS ms | P50 ms | P95 ms |
|---|---:|---:|---:|
| PNG1 | 1.028 | .900 | 2.000 |
| Canvas1 | 2.046 | 1.800 | 3.500 |
| PNG2 | .874 | .800 | 1.100 |
| Canvas2 | 1.841 | 1.600 | 2.900 |
| PNG3 | .856 | .700 | 1.900 |
| Canvas3 | 1.870 | 1.600 | 2.900 |

**繁體中文：** 三次分組獨立暖機20draw、80樣本，同靜態暫停場景交錯A/B；非三次冷啟動瀏覽器。門檻為平均≤33.3ms、P95≤50ms且同組P50不退步超20%。原始樣本保留。這只量測同步`Renderer.draw`的JS提交成本，不包含GPU完成、rAF、模擬、GC或真正戰鬥FPS，不能取代整體性能或硬體驗收。完整環境見`environment.json`，1440×900、Chromium154、4CPU／32GiB雲端配額。歷史建築+21.4%FAIL仍保留。

**English:** Three separately warmed groups:20draw warmup/80samples, interleavedA/B on the same paused static scene, not three cold browser launches. Gates: mean≤33.3ms,P95≤50ms and no>20%pairedP50regression. Raw samples retained. This measures synchronous`Renderer.draw`JS submission only, excluding GPU completion, rAF, simulation, GC and actual combatFPS; it does not replace whole-game or hardware acceptance. Environment:`environment.json`,1440×900,Chromium154,4CPU/32GiBcloud quota. Historical building+21.4%FAIL remains.
