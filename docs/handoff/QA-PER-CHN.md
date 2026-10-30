# PER／CHN 精簡獨立 QA 交接 / Compact independent QA handoff

繁體中文：兩位新英雄及各自兵器音效為四個相關內容切片；主開發限定驗收，未自行啟動第二位Agent。獨立QA對舊9561ffc的CONDITIONAL PASS不能涵蓋這些新來源，也不推翻歷史FAIL。

English: Two new heroes and their weapon cues form four related content slices. These are primary-developer scoped checks; no second agent launched. Independent QA's old9561ffc CONDITIONAL PASS does not cover these sources or erase historical FAIL.

| Content | Fixed source | Main verification | Evidence |
| --- | --- | --- | --- |
| PER hero/mace audio | `5ef184234f7edf2490978e096ce5e704ed1b08b5` | 12+6 Node;17 gameplay/7 audio Chromium | docs/evidence/v240-per-hero |
| CHN hero/guandao audio | `0bd29b4c59c2a6acbca47fd029bbbeea22932666` | 12+7 Node;17 gameplay/7 audio Chromium | docs/evidence/v240-chn-hero |

繁體中文：主要Diff：各自SVG／PNG／192格裁格資料及生成器、sprite-atlas文明commander路由、renderer肩側徽記、audio三聲部／共用55ms節流、擴充肖像／路由／音效測試。原技能數值、碰撞、導航、成本、攻速與既有文明規則不變。既有Aegis radius5與GDD文字4之差異未改；不要為驗收改平衡。

English: Main diff: individual SVG/PNG/192-cell crop metadata/generators; civilization commander atlas routing; renderer shoulder emblems; three-voice audio/shared55ms throttle; extended portrait/routing/audio tests. Existing skills, collision/navigation/cost/attack cadence/civilization rules remain. Existing Aegis radius5 versus GDD text4 discrepancy is unchanged; do not alter balance for acceptance.

繁體中文：從原生首頁選PER／CHN並Start；點頭盔／身體選取，右鍵移動與攻擊，Tab直接控制及Q/E。檢視正常zoom0.8／1.4的辨識、混戰遮擋、兵器軌跡、死亡／施法節奏、選取肖像與敵我隔離。受控QA的敵軍／100單位不代表自然戰役。核對PNG邊界、八方向差異、裁格像素對照、100單位原始性能門檻；音訊WAV是SFX分流，不是人工聽感。需要人類聽覺、完整自然混戰及實體GPU時維持NOT_TESTED。

English: Native menu selects PER/CHN then Start; click helmet/body, right-click move/attack, Tab direct control and Q/E. Inspect normal0.8/1.4 zoom identity, battle occlusion, weapon motion, death/cast pacing, selection portraits and team isolation. Controlled enemies/100 units are not natural-campaign evidence. Verify PNG boundaries, eight distinct facings, crop pixel parity and original100-unit performance gates. WAV taps SFX, not human listening. Retain NOT_TESTED for human hearing, comprehensive natural battles and physical GPU acceptance.

繁體中文：SAR定向復驗來源255f32d，保留單次一組+66.7%FAIL；總結INCONCLUSIVE，見docs/evidence/v240-sar-perf-review。原生跨程序Save/Continue及實際Heap/RSS/PSS整合資料另行保存，不能把受控Snapshot／解碼代理值當成完整持久化／實際RAM。自然十波／NG+、時鐘、嚴格存讀、歷史性能及硬體缺口保留。

English: SAR review source255f32d retains one+66.7% single-draw FAIL and overall INCONCLUSIVE; see docs/evidence/v240-sar-perf-review. Native cross-process Save/Continue and actual heap/RSS/PSS integration evidence are saved separately; controlled snapshots/decoded proxies do not establish full persistence/actual RAM. Natural campaign/NG+, clock, strict-save, historical performance and hardware gaps remain.

## 後續 GOT 與整合驗收 / Subsequent GOT and integration checks

GOT art source `32f5e7f226ab4b323f9db5dc1ef5ca3fbe4f856a`:12 Node/17 gameplay PASS. Audio source `b214462f89cda620d7cc1ade53a84352042e25c4`:7 actual audio PASS. 確認待機劍不遮臉、裸首可選取、血條不壓住劍尖，保留初版遮擋證據。 / Verify clear idle face, selectable bare head and health bar above blade; initial occlusion evidence retained. docs/evidence/v240-got-hero.

原生付費生產後Save/Continue來源5ef1842，13 Chromium限定通過；圖集生命週期／實測Heap與RSS/PSS來源0bd29b4，22功能檢查通過，長期洩漏INCONCLUSIVE／GPU顯存NOT_TESTED。 / Native paid-production Save/Continue source5ef1842:13 scoped Chromium PASS. Atlas lifecycle/actual heap and RSS/PSS source0bd29b4:22 functional checks PASS, long-run leaks INCONCLUSIVE/GPU memory NOT_TESTED. docs/evidence/v240-native-persistent-continue; docs/evidence/v240-atlas-native-memory.
