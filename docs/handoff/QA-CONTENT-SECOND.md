# 第二組精簡遊戲 QA / Second compact gameplay QA group

| 成果 / Outcome | 精確來源 / Exact source | 定向結果 / Focused result |
|---|---|---|
| 五種近戰聲音 / Five melee cues | 8c348256a2865195c28575684970e98f4e037ae8 | 7 Node, 31 Chromium PASS |
| GOT 鎖子甲長盾 / Mail/oval shield | 897086d8eaf4360f660c83104ca411a602be6656 | 3 Node, 14 Chromium PASS |
| SPA morion 長槍 / Morion/pike | 35c54c55eddce7def1639ed12c40fc684a1aec6b | 6 Node, 14 Chromium PASS |
| FRK 頭盔選取 / Helmet picking | bb0e43f8ff1cd2fb5e6691f1521115d4aa5efbcf | 9 Node, 6 Chromium PASS; input cost PASS |
| SAR 纏巾彎刀 / Turban/curved blade | 73ce3c06db0645fe3475f37e1135ccfffe4aca77 | 6 Node, 14 Chromium PASS |

繁體中文：主要 Diff：原創 SVG／PNG／步兵生成器、指定文明 descriptor／身體選取／血條高度，以及 Sound.attack 的文明來源和五種近戰合成聲音。遊戲物理、導航與平衡不變；各列 Node 包含共用回歸，不能相加冒充獨立覆蓋。原生操作：首頁選 GOT／SPA／SAR，Start 後發展至適用時代，軍營付費訓練 militia／spearman／guard，左鍵頭盔選取、右鍵移動及攻擊；FRK 同樣以既有輕騎檢查頭盔點選。音效用 MAG／FRK／TEU／BYZ／AZT 的實際近戰與原生聲音開關檢查。

English: Main diff: original SVG/PNG/infantry generator, civilization-specific descriptors/body picking/health-bar heights, and civilization routing/five synthesized motifs in Sound.attack. Physics/navigation/balance are unchanged. Node counts include shared regressions and must not be summed as unique coverage. Native steps: select GOT/SPA/SAR, Start, progress to the required age, pay barracks training for militia/spearman/guard, click helmets, right-click movement and attack. Check existing FRK light-cavalry helmet selection similarly. Test actual MAG/FRK/TEU/BYZ/AZT melee and the native sound toggle.

繁體中文：對應 docs/evidence/v240-melee-weapon-sound、v240-got-militia、v240-spa-spearman、v240-frk-picking、v240-sar-guard。各目錄含原始結果／實際圖片／影片／必要樣本；受控時代、清場、準備與音效 2000 HP 目標不是自然戰役。保留 SPA 死亡長槍越格 FAIL（已限定修復）、FRK 頭盔選取 FAIL（已修復）、聲音主執行緒量測 FAIL，以及 preliminary-meter 的 MAG 靜音零樣本不足（最終強制實際樣本）。

English: Evidence: docs/evidence/v240-melee-weapon-sound, v240-got-militia, v240-spa-spearman, v240-frk-picking and v240-sar-guard. Each contains raw results/actual images/video/relevant samples. Controlled age/scene/preparation and audio's 2,000-HP target are not natural campaigns. Preserve SPA falling-pike border FAIL (scoped fix accepted), FRK helmet FAIL (fixed), main-thread audio measurement failures and preliminary-meter's insufficient zero muted samples for MAG (final check requires actual samples).

繁體中文：獨立 QA 風險：自然擁擠遮擋、近鄰身體選取、所有方向美術品質、不同裝置；五種武器人工聽感、BGM 整體混音與實體喇叭尚未驗收。繪製／輸入比較不是 FPS／硬體驗收；歷史自然十波／NG+、低 FPS、嚴格存讀、渲染性能、Rift／硬體缺口保留。不啟動第二 Agent、不公開部署。主開發直接接續 TUR 弓兵。

English: Independent QA risks: natural crowd occlusion, adjacent-body picking, all-direction art quality and other devices; human listening, overall BGM mix and physical speakers remain unaccepted. Drawing/input comparisons are not FPS/hardware acceptance; historical natural ten-wave/NG+, low-FPS, strict save/load, rendering, Rift/hardware gaps remain. No second Agent or public deployment. Main development continues directly with TUR archers.

BILINGUAL_DOCUMENTATION_REQUIRED = true
