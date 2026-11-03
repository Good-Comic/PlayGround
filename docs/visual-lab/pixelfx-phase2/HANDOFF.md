# PixelFX第二階段／PixelFX Phase2

繁體中文：獨立任務PIXELFX-PHASE2-518BE895，Execution codex-pixelfx-phase2-518be895-a，ownership233。先dry run、以預期232正常推送認領並核對遠端，分支codex/riftwatch-pixelfx-phase2-518be895繼承887f460全部Phase1成果。兩項品質切片與護盾切片均已正常保存。程式／正式構建來源67bbe974c37406dd9b4e859e5bf15803919404e5，/workspace/pixelfx-phase2-final-build，143資源SHA256全部相符。內部RC仍c55a054，未整合RC／main／Pages／OmGitHub／Checkpoints，無公開發布。

English: Independent taskPIXELFX-PHASE2-518BE895, executioncodex-pixelfx-phase2-518be895-a, ownership233. Dry run preceded normal version-conditional claim at expected232 and remote verification. Branchcodex/riftwatch-pixelfx-phase2-518be895 inherits all887f460 Phase1 work. Quality and shield slices were normally saved. Code/formal build source67bbe974c37406dd9b4e859e5bf15803919404e5 at/workspace/pixelfx-phase2-final-build has143 matchingSHA256 resources. InternalRC remainsc55a054; noRC/main/Pages/OmGitHub/checkpoint integration or public release.

繁體中文：劍斬維持正式近戰攻擊時機與等角方向，縮放調至0.5×來源尺寸、透明度0.9。重擊維持實際扣血後觸發，改依受擊者尺寸（最大1.5倍）縮放並移至前層、透明度0.82，改善背層被身體遮住的問題。按地面深度排序；最近鄰取樣與錨點像素取整，已檢視0.8／1.4／2倍率。48瞬間效果上限不增加；英雄／Boss優先級4、普通重擊2、普通劍斬1，滿額時只取代更低優先事件，同落點普通效果最多2個。沒有修改傷害、命中、攻擊冷卻、射程或模擬RNG。

English: Slash retains production melee timing/isometric direction, scaled0.5×source size with0.9opacity. Blunt impacts retain post-damage triggering, scale by target size(capped1.5×), move to foreground with0.82opacity, addressing body occlusion. Events sort by ground depth; nearest-neighbor sampling and rounded anchors were inspected at0.8/1.4/2zoom. Instant-event cap remains48; hero/Boss priority4, ordinary blunt2, ordinary slash1. Overflow replaces only lower-priority events; ordinary same-location effects cap at2. Damage/hit/cooldown/range/simulationRNG unchanged.

繁體中文：只新增holy/divine-shield一項，固定PixelFX a84159688af3ca37a4be05a0d422b94451b2e24e，以官方node tools/render.mjs holy/divine-shield --sheet --no-actor --seed42 --fps30離線匯出72幀。兩次PNG／JSON逐位元相同。MIT／NOTICE保留，未匯入runtime、字型、Gallery或actor。PNG SHA256 ed6f517cde56e406859e3052195d5ad02f9d3aaa2619f02c15fe0650e41efd2a；其他來源與資源雜湊在assets/vfx/pixelfx-phase2/PROVENANCE.json。新增PNG279588bytes，RGBA解碼約2.03MiB，不是JSheap數字。

English: Added onlyholy/divine-shield, pinned toPixelFX a84159688af3ca37a4be05a0d422b94451b2e24e. Official offline commandnode tools/render.mjs holy/divine-shield --sheet --no-actor --seed42 --fps30 produced72frames, with two byte-identicalPNG/JSON exports. MIT/NOTICE retained; no runtime/fonts/gallery/actors imported. PNGSHA256 ed6f517cde56e406859e3052195d5ad02f9d3aaa2619f02c15fe0650e41efd2a; source/resource hashes inassets/vfx/pixelfx-phase2/PROVENANCE.json. PNG279588bytes, decodedRGBA about2.03MiB, distinct fromJSheap.

繁體中文：護盾依實際u.shield>0與game.time循環，不額外寫入遊戲狀態，耗盡即停止。成功繪製時取代原兩個護盾外框，最多16個Atlas，保留英雄名額；超額或未載入時保留原提示，不疊加同義效果。與48瞬間效果合計最多64Atlas實例。狀態讀檔後直接重建顯示，暫停／選卡凍結，原生Resume後恢復。hit-flash因現有受擊回饋重複而不新增；chain-lightning含固定多目標構圖，未設計符合實際鏈路的Adapter前不新增。沒有為了數量擴張。

English: Shield loops only while actualu.shield>0 usinggame.time, adding no model state, and stops on depletion. Successful drawing replaces both legacy outlines, capped at16atlases with a reserved hero slot. Overflow/unloaded cases retain legacy cues without duplicate overlays. Combined with48instant events, at most64atlas instances. SaveLoad derives display from restored state; pause/boon freezes and nativeResume advances it. Hit-flash was deferred as duplicate feedback; baked multi-target chain-lightning needs an actual-link adapter before use. No expansion for effect count.

繁體中文：Node428/428通過。Chromium品質切片及最終100／200單位的Phase1對照，完整模擬snapshot相同。原生E施放Aegis、Pause／Resume、正式Boss預警（測試縮短其首次技能等待）、護盾耗盡、縮放及頁面錯誤檢查通過；危險圈仍可辨識。暫停選單截圖保留於本機，報告另存實際Canvas輸出以免選單遮擋。首輪耗盡夾具忽略護甲而留下3.8護盾，initial-shield-fixture-fail.json保留；修正測試傷害量以通過正式護甲後為0，不改遊戲傷害規則。

English: Node428/428 passed. Quality-slice and final100/200-unit Chromium Phase1 comparisons produced equal complete simulation snapshots. NativeE Aegis, Pause/Resume, production Boss warning(first-skill delay shortened only in fixture), shield depletion, zoom and page-error checks passed; danger rings remain readable. Native pause screenshots remain local; actual canvas outputs are saved to avoid menu occlusion. Initial depletion fixture forgot armor and left3.8shield; initial-shield-fixture-fail.json preserves it. Fixture damage was corrected to account for production armor, reaching0 without changing damage rules.

繁體中文：首輪存讀檔比較rawRNG不相同（-1596266024與2698701272），initial-expanded-browser.json的pass=false保留，未冒稱原始表示相同。後續證明32位狀態相同、後續32個亂數輸出相同，護盾與模擬時間亦相同。這不是修復歷史嚴格SaveLoad決定性問題，也不把全面存檔驗收改成PASS。新局Phase1／Phase2完整snapshot比較仍為真。

English: Initial SaveLoad rawRNG differs(-1596266024 versus2698701272), andpass=false ininitial-expanded-browser.json is preserved; raw representations are not claimed equal. Subsequent checks establish identical32-bit states/next32random outputs, shield and simulation time. This does not fix/certify historical strict SaveLoad determinism. Fresh Phase1/Phase2 full snapshot comparison remains equal.

## 效能與限制／Performance and limits

雲端Linux，AMD EPYC9V74，headless Chromium154.0.8037.57，1440×900；未驗證實體GPU。每規模6交替區塊，每區塊10暖身＋90繪製；另每版本60RAF幀。下表是區塊中位數；FPS是該60RAF樣本，非由繪製P50換算。

CloudLinux, AMD EPYC9V74, headless Chromium154.0.8037.57,1440×900; physicalGPU unverified. Six alternating blocks/scale,10warmup+90draws/block; separate60RAF frames/version. Table uses medians across blocks;FPS is measured fromRAF, not derived from drawingP50.

|單位／Units|版本／Version|DrawP50 ms|DrawP95 ms|RAF FPS|
|---|---|---|---|---|
|100|Phase1|10.0|11.4|49.32|
|100|Phase2|10.4|11.8|48.65|
|200|Phase1|19.6|22.8|27.69|
|200|Phase2|19.9|21.2|27.91|

繁體中文：首次順序量測200單位Phase2的P95區塊中位28.4ms對Phase1的22.6ms，尖峰34.1ms，原始資料保留；交替測量未重現持續明顯退步，不把P95較低宣稱穩定效能提升。JSheap受GC影響約7.9–11.8MB（Phase1）／8.5–10.5MB（Phase2）；不含所有native影像／GPU記憶體。這些是固定戰鬥幀、短時間樣本，不是自然長時戰鬥／60FPS／無記憶體洩漏證明。環境本來就非穩定60FPS。密集群仍有遮擋，低倍率細粒子有取樣損失；預算外原護盾圈與新金色風格不同，需真人回饋。

English: Initial sequential200-unit Phase2 median-blockP9528.4ms versus22.6ms, with34.1ms spike, is preserved. Alternating measurements did not reproduce sustained major regression; lowerP95 is not claimed a stable speedup. GC-sensitiveJSheap was about7.9–11.8MB(Phase1)/8.5–10.5MB(Phase2), excluding all native-image/GPU memory. Frozen combat/short samples do not certify natural long combat/60FPS/no leaks. Environment was not steady60FPS beforehand. Dense armies still occlude, small particles lose samples at low zoom, and legacy fallback shields differ stylistically; human feedback remains needed.

繁體中文：建議將此限定成果列為下一版開發主線的候選整合切片，以已有143檔構建繼續長時與真人可讀性驗收，不直接合併目前RC或公開發布。已完成本輪兩項品質改善與一項受控新增，未留下本輪必做卻未處理的新特效；後續需整合授權、長時／硬體樣本及真人視覺判讀。原RC維持原SHA。STOP_REASON=AUTHORIZED_PHASE2_QUALITY_AND_CONTROLLED_EXPANSION_DELIVERED，AUTO_RESUME_AVAILABLE未驗證。

English: Recommend this scoped work as a candidate integration slice for the next development mainline, continuing long/human-readability checks on the143-file build, not directly merging currentRC or publishing. This round’s two quality improvements and one controlled addition are complete; no mandatory added effect remains. Next requires integration authorization, longer/hardware samples and human review. OriginalRC retains itsSHA. STOP_REASON=AUTHORIZED_PHASE2_QUALITY_AND_CONTROLLED_EXPANSION_DELIVERED;AUTO_RESUME_AVAILABLE unverified.
