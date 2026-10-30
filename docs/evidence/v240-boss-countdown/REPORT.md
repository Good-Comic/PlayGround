# Boss 預警倒數 / Boss warning countdown

來源／Source `e4644e80d2537f157fd0a60163449040f6a6f238`.4 Node/8 actual Chromium checks PASS.

繁體中文：完成16文明英雄整合後，已直接接續實際戰鬥回饋：Boss危險符印側邊顯示既有模擬時間的秒數倒數，最後0.5秒加強顏色，實際命中後移除。靠側放置與深色底板避免壓住受威脅單位頭部。只讀zone.delay／elapsed，未新增傷害計時器，也未改半徑、延遲、傷害、技能或英雄數值。毫秒取樣與向上顯示十分秒僅供UI，不更動實際命中時間。

English: After16-hero integration, continued actual combat feedback: existing simulation-time seconds appear beside Boss danger sigils, highlighted during the last0.5seconds and removed after actual impact. Side placement/dark backing preserve threatened unit head readability. Reads zone.delay/elapsed only, without new damage timers or changes to radius/delay/damage/skills/hero stats. Millisecond sampling/upward-tenth display is UI-only and never changes actual impact timing.

繁體中文：原生Start後明示受控生成warlord／warlord2與見證單位，由正式updateBoss與updateZones觸發預警及傷害；不是直接插入假圈。兩種Boss的原2.8／3.3半徑、2.4秒延遲、65／105傷害均核對；原生右鍵移動成功閃避，圈內見證單位受傷，渲染器真正paint出倒數文字、進入急迫階段、命中後移除。警告、急迫與命中圖已檢視，保留實際影片及原始時間線；有明示暫停觀察幀，不冒稱自然戰役或全程連續實時。這不是人類反應公平性、完整混戰性能或實體GPU驗收。

English: NativeStart precedes explicitly controlled warlord/warlord2/witness spawns. Production updateBoss/updateZones create warnings and damage, rather than injected fake circles. Verify original radii2.8/3.3, delay2.4seconds and damage65/105. Native right-click movement escapes while an inside witness is damaged; the renderer actually paints countdown text, reaches urgency and removes it on impact. Warning/urgent/impact images reviewed, with actual video/raw timeline. Explicit paused observation frames are disclosed, not natural-campaign/uninterrupted-real-time acceptance. Not human-reaction fairness/full-battle performance/physicalGPU acceptance.

繁體中文：16英雄功能完成矩陣與來源、同來源66項原生Chromium及16組畫面在docs/evidence/v240-all-heroes-integration。SPA／MNG／MAG性能INCONCLUSIVE與各自原始FAIL、KOR舊FAIL、SAR性能、嚴格存讀／時鐘／自然十波／NG+／長期記憶體及GPU硬體缺口保留。未公開部署；下一項Mark／Aegis獨立技能音效與既有靜音／節流／RNG隔離。

English:16-hero functional matrix/sources,66 same-source native Chromium checks and16 image sets: docs/evidence/v240-all-heroes-integration. Preserve SPA/MNG/MAG performanceINCONCLUSIVE/rawFAIL, KOR oldFAIL, SAR performance, strict saves/clock/natural campaigns/NG+/long-run memory/GPU-hardware gaps. No public deployment. Next: distinct Mark/Aegis skill audio retaining existing mute/throttle/RNG isolation.
