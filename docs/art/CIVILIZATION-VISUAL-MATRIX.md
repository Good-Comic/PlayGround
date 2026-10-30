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
