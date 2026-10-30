# 文明視覺接續矩陣 / Civilization visual continuation matrix

繁體中文：依現有十六文明與五個視覺家族記錄實際進度。表中「家族」只代表既有建築／裝備輪廓層，並非該文明全部單位已有獨立 Atlas。已完成來源與限定驗收以各 evidence 報告為準，避免重新製作；以下接續選項只改既有單位外觀，不新增未批准平衡規則。

English: This records actual progress against the existing sixteen civilizations and five visual families. A family denotes existing architectural/kit silhouette layers, not independent atlases for every unit. Evidence reports define completed sources and scoped acceptance to avoid recreation. Continuation options change existing-unit appearance without introducing unapproved balance rules.

| 文明 / Civ | 家族 / Family | 獨立切片現況 / Independent slice status |
|---|---|---|
| MNG | 草原 / Steppe | 騎射 Atlas 已驗收 / Mounted-archer atlas accepted; v240-mng-horse-archer |
| TEU | 堡壘 / Fortress | 厚板甲長盾 guard 已驗收 / Plate/tower-shield guard accepted; v240-teu-guard；戰鎚翼冠英雄限定驗收 / hammer/winged-helm hero scoped acceptance; v240-teu-hero |
| GOT | 堡壘 / Fortress | 鎖子甲毛領長盾民兵已驗收 / Mail/fur-collar/oval-shield militia accepted; v240-got-militia |
| FRK | 堡壘 / Fortress | 披掛／長盾／騎槍輕騎已驗收 / Caparison/shield/lance light-cavalry atlas accepted; v240-frk-cavalry |
| SAR | 沙漠 / Desert | 纏巾鎖甲彎刀盾衛已驗收 / Turban/mail/curved-blade guard accepted; v240-sar-guard |
| AZT | 中美洲 / Mesoamerican | 黑曜石武器民兵已驗收及遠端保存 / Obsidian militia accepted and remotely saved; v240-azt-militia；美洲虎英雄限定驗收 / jaguar hero scoped acceptance; v240-azt-hero |
| BRI | 堡壘 / Fortress | 長弓 archer 已驗收 / Longbow archer accepted; v240-bri-longbow |
| CHN | 東方 / Eastern | 諸葛弩已驗收 / Repeating-crossbow atlas accepted; v240-special-atlas |
| PER | 沙漠 / Desert | 戰象已驗收 / Elephant atlas accepted; v240-elephant |
| KOR | 東方 / Eastern | 巡防車已復原驗收 / Patrol-cart atlas recovered and accepted; v240-kor-cart |
| SPA | 堡壘 / Fortress | morion 胸甲長槍兵已驗收；既有村民暈擊保留 / Morion/breastplate pike infantry accepted; native villager stun retained; v240-spa-spearman, v240-spa-stun |
| TUR | 沙漠 / Desert | 反曲弓箭袋弓兵已驗收 / Recurve-bow/quiver archer accepted; v240-tur-archer |
| BYZ | 沙漠 / Desert | 札甲圓盾 spearman 已驗收 / Lamellar/round-shield spearman accepted; v240-byz-spearman |
| VIK | 堡壘 / Fortress | 圓盾 guard 已驗收 / Round-shield guard accepted; v240-vik-roundshield |
| MAG | 草原 / Steppe | 裸馬弧刀圓盾輕騎已驗收 / Unbarded sabre/round-shield light cavalry accepted; v240-mag-cavalry |
| JPN | 東方 / Eastern | 札甲外觀已保存；格擋修復限定驗收 / Lamellar appearance saved; scoped block fix accepted; v240-jpn-lamellar, v240-jpn-block；雙手刀背旗英雄限定驗收 / sword/banner hero scoped acceptance; v240-jpn-hero |

繁體中文：英雄／招募使／雙 Boss 的共用 Atlas 與技能表現沿用 v240-champions 相關證據，不因矩陣未列而重做。JPN／SPA／RNG／FRK 已驗收，不重做。AZT／BYZ／MAG 已遠端保存；近戰聲音與 GOT 已保存，接續 SPA 長槍外觀，先核對最新遠端及所有權。自然戰役、低 FPS、嚴格 Save/Load、性能與硬體缺口不在此表宣告通過。

English: Retain existing shared hero/recruiter/two-Boss atlases and skill evidence; omission from this civilization table does not request recreation. JPN/SPA/RNG/FRK are accepted and must not be repeated. AZT/BYZ/MAG are remotely saved; melee audio/GOT are saved; continue SPA pike appearance after checking current remote and ownership. This table does not clear natural-campaign, low-FPS, strict Save/Load, performance or hardware gaps.

BILINGUAL_DOCUMENTATION_REQUIRED = true

繁體中文：十六文明目前各有至少一項表中代表性切片；這不代表所有兵種、建築、文明英雄或動畫品質全面完成。接續先處理隨大型圖集增長的載入／解碼負擔，再擴充玩法與文明英雄。

English: All sixteen civilizations now have at least one representative slice listed here; this does not establish complete unit/building/civilization-hero or animation-quality coverage. Next address loading/decode footprint as large atlases grow, then expand gameplay and civilization heroes.

繁體中文：TEU 既有英雄已新增獨立戰鎚／翼冠／披風與六種動作及技能徽記；接續 JPN 文明英雄，不重做原有 JPN 盾衛或格擋。

English: TEU existing hero now has independent hammer/winged helm/mantle, six actions and skill emblems. Continue JPN civilization hero without remaking its guard/block feature.

繁體中文：TEU／JPN／AZT 三個文明英雄已有獨立裝備與六種動作的限定驗收，其他文明英雄仍逐步擴充；接續三者的兵器音效。

English: TEU/JPN/AZT heroes now have scoped acceptance for independent kit and six actions; other civilization heroes remain incremental work. Continue differentiated weapon sound for these three.

VIK 英雄：長斧、毛皮肩披、眼罩盔、鬍辮，八方向六狀態192格；原生可選取、移動、戰鬥及雙技能符文標記。20 Node／16 Chromium 限定通過，來源 `c7f8374cb00dd196abc8360e5f960b038ceda611`。 / VIK hero: long axe, fur mantle, spectacle helm and braided beard;192 cells across eight directions/six states, native selection/movement/combat and skill rune feedback. Scoped20 Node/16 Chromium PASS at the stated source.

FRK 英雄：長劍、鳶盾、冠盔及百合披袍；八方向六狀態192格。VIK／FRK 方向投影追加驗收各17 Chromium通過，來源 `97b11b64ce4c13772318e9ddda7387297650d9e1`。 / FRK hero: long sword, kite shield, crowned helm and fleur-de-lis surcoat;192 frames across eight directions/six states. VIK/FRK facing projection each passes17 Chromium checks at the stated source.

SAR 英雄：彎刀、小圓盾、纏巾盔及鱗甲；八向六狀態192格，17 Chromium PASS，33項受影響 Node PASS。來源 `c578426100ed6c2927cdcf3382faa1ffc606f337`；技能及數值不變。 / SAR hero: curved sword, small round shield, wrapped helm and scale armour;192 cells,17 Chromium PASS and33 affected Node PASS at the stated source; skills and stats unchanged.

PER 英雄：翼飾脊盔、瓣錘、日輪橢圓盾、層甲及紫色分岔披風，八方向六狀態192格；18 Node／17遊戲Chromium／7音訊Chromium限定通過，來源 `5ef184234f7edf2490978e096ce5e704ed1b08b5`。與戰象圖集及規則隔離，保留原技能數值；非歷史精確復原。 / PER hero: winged ridge helm, flanged mace, sun oval shield, lamellar armour and split purple cloak;192 cells, scoped18 Node/17 gameplay Chromium/7 audio Chromium PASS at the stated source. Isolated from elephant atlas/rules, retaining existing skill values; not a historical reconstruction.

CHN 英雄：長柄偃月刀、紅纓、札甲長袍及長鬚，無盾輪廓，八向六狀態192格；19 Node／17遊戲Chromium／7音訊Chromium限定通過，來源 `0bd29b4c59c2a6acbca47fd029bbbeea22932666`。原近戰及Mark/Aegis規則不變。 / CHN hero: long guandao, red plume, lamellar robe and long beard, shield-free silhouette,192 cells; scoped19 Node/17 gameplay Chromium/7 audio Chromium PASS at the stated source. Existing melee/Mark/Aegis rules unchanged.

GOT 英雄：鋸背巨劍、寬肩毛皮鎖甲及裸首束髮；八向六狀態192格，待機劍避開臉、血條上移。12 Node／17遊戲Chromium通過，來源 `32f5e7f226ab4b323f9db5dc1ef5ca3fbe4f856a`；7音訊Chromium來源 `b214462f89cda620d7cc1ade53a84352042e25c4`，聲音邏輯後續未變。 / GOT hero: sawback greatsword, broad fur/mail shoulders and bare-head topknot;192 frames, idle blade clear of face and raised health bar.12 Node/17 gameplay checks pass at the stated art source; seven audio checks are pinned to the separate source with unchanged audio thereafter.

<!-- HERO-MATRIX-START -->

## 英雄完成矩陣 / Hero completion matrix

繁體中文：13/16限定驗收。來源、遊戲／音效證據及代表圖見CIVILIZATION-HERO-MATRIX.json；條件驗收列明性能INCONCLUSIVE，不表示全數性能PASS；格數與文件存在本身不構成完成。保留歷史FAIL、主觀流暢度／聽感與硬體缺口。

English: 13/16 scoped acceptance. Sources, gameplay/audio evidence and representative images: CIVILIZATION-HERO-MATRIX.json. Conditional rows retain performance INCONCLUSIVE and are not all-performance PASS. Cell counts/file existence alone do not establish completion. Historical FAIL, subjective smoothness/listening and hardware gaps remain.

| Civ | Status | Art source | Actual gameplay evidence |
| --- | --- | --- | --- |
| MNG | TODO | — | — |
| TEU | SCOPED_ACCEPTED | e5ccf8d1042aefed8cbd240045b3995c6ae86341 | docs/evidence/v240-teu-hero/verified/browser.json |
| GOT | SCOPED_ACCEPTED | 32f5e7f226ab4b323f9db5dc1ef5ca3fbe4f856a | docs/evidence/v240-got-hero/verified/browser.json |
| FRK | SCOPED_ACCEPTED | 97b11b64ce4c13772318e9ddda7387297650d9e1 | docs/evidence/v240-frk-hero/verified/browser.json |
| SAR | SCOPED_ACCEPTED | c578426100ed6c2927cdcf3382faa1ffc606f337 | docs/evidence/v240-sar-hero/verified/browser.json |
| AZT | SCOPED_ACCEPTED | 0333583ff5db69404272f20d058518eef9a10443 | docs/evidence/v240-azt-hero/verified/browser.json |
| BRI | TODO | — | — |
| CHN | SCOPED_ACCEPTED | 0bd29b4c59c2a6acbca47fd029bbbeea22932666 | docs/evidence/v240-chn-hero/verified/browser.json |
| PER | SCOPED_ACCEPTED | 5ef184234f7edf2490978e096ce5e704ed1b08b5 | docs/evidence/v240-per-hero/verified/browser.json |
| KOR | SCOPED_ACCEPTED | 8876dbe683afe886d969502c21296486e978387f | docs/evidence/v240-kor-hero/verified/browser.json |
| SPA | SCOPED_ACCEPTED_PERF_INCONCLUSIVE | fda334715531e0ade9ff9c463612cfb7cf94d4e3 | docs/evidence/v240-spa-hero/verified/browser.json |
| TUR | SCOPED_ACCEPTED | 5035fa17ce9b315444bdbed2635e7af2ed111dc2 | docs/evidence/v240-tur-hero/verified/browser.json |
| BYZ | SCOPED_ACCEPTED | fba75c2a09bc19a8a1c15291cde043b6fbf2f764 | docs/evidence/v240-byz-hero/verified/browser.json |
| VIK | SCOPED_ACCEPTED | 97b11b64ce4c13772318e9ddda7387297650d9e1 | docs/evidence/v240-vik-hero/verified/browser.json |
| MAG | TODO | — | — |
| JPN | SCOPED_ACCEPTED | 9d8a9f9710a1b1701b36c17e6d32bb15d05cdc3a | docs/evidence/v240-jpn-hero/verified/browser.json |
