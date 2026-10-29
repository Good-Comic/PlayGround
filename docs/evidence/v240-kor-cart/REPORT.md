# 已恢復 KOR 巡防車 / Recovered KOR patrol cart

繁體中文：原7f8a739cc713bba08d970c0fb0b2bac7a474c0e7及QA修正bcd03b0c8334aa224ae07d724bcf1028292700c3均從原工作目錄恢復，父鏈8f22a39→7f8a739→bcd03b0完整保留；沒有重製素材或冒用新Commit。原創160影格KOR玩家巡防車保留輪架、護板、棚頂、弓架及方向／攻擊／受擊／死亡動畫，其他文明與敵軍維持原外觀。恢復後已透過正常fast-forward將原Commit連同音效來源推送並核對至77bd027f6f2b927ccd5fb8a16a3efa3cc9c53a6f。

English: Original7f8a739cc713bba08d970c0fb0b2bac7a474c0e7 and QA fix bcd03b0c8334aa224ae07d724bcf1028292700c3 were recovered from the original worktree. The8f22a39→7f8a739→bcd03b0parent chain is intact; artwork was not recreated or relabeled as a new commit. The original160-frame KOR player cart retains chassis, shields, canopy, bow rack and directional/combat/hit/death animations; other civilizations and enemies keep their original appearance. Normal fast-forward push preserved these commits with recovered sound source, verified at77bd027f6f2b927ccd5fb8a16a3efa3cc9c53a6f.

繁體中文：focused-node.txt的4項Node與fixed/browser.json的14項Chromium為中斷前原始PASS，本輪恢復並保留，沒有假稱已重新跑過。原Build bcd03b0包含55檔校驗payload，記錄原生工坊65木材／45黃金付費、約16.0483秒生產、塔數門檻、真正箭矢傷害、160影格邊界、回退與靜態繪製成本。首輪initial的塔數假設FAIL亦保留：KOR原生開局已有一塔，所以加兩塔已達三塔；只修QA起始計數，未改遊戲規則。既有addBuilding登記即計塔數；使用完整塔fixture不代表施工完成門檻已修正。

English: The4Node passes in focused-node.txt and14Chromium passes in fixed/browser.json are original pre-interruption results, recovered and retained without claiming they were rerun. Original Build bcd03b0 verifies55payload files and records native workshop65wood/45gold payment, approximately16.0483-second production, tower thresholds, actual arrow damage,160-frame bounds, fallback and static rendering cost. The initial tower-assumption FAIL remains: native KOR starts with one tower, so two more reach three. Only QA starting counts changed, not game rules. Existing addBuilding counts registrations; completed-tower fixtures do not establish repaired construction-completion gating.

繁體中文：本輪已直接檢視原一般縮放、西／背向、戰鬥、受擊、倒伏及TEU保留外觀圖片，輪架／棚頂／弓架可辨識，代表影格未發現裁切或錯誤鏡射，無須重製。檔案雜湊與範圍見recovery-visual-review.json。另以本輪音效來源77bd027的真實KOR攻擊場景確認仍可渲染、放箭與觸發音效，詳見../v240-unit-sounds/REPORT.md。這是限定本地視覺檢視與受控遊戲驗收，不代表自然戰役、全品質或硬體認證。

English: This turn directly inspected original normal-zoom, west/rear, combat, hit, fallen and retained-TEU-appearance images. Chassis/canopy/bow rack are identifiable, with no clipping or incorrect mirroring found in reviewed representative frames; no recreation was required. Hashes and scope are in recovery-visual-review.json. A new actual KOR combat scene on sound source77bd027 also confirms rendering, arrow damage and audio dispatch; see ../v240-unit-sounds/REPORT.md. These are scoped local visual reviews and controlled gameplay checks, not natural-campaign, whole-quality or hardware certification.

繁體中文：沒有新增兵種開發。自然Easy／Normal十波、自然NG+及所有時鐘、嚴格存讀、性能、Rift、硬體歷史FAIL保留；排程未確認切換，沒有main、Pages、OmGitHub或公開部署修改。

English: No new unit development was started. Natural Easy/Normal ten waves, natural NG+ and all historical clock, strict-save, performance, Rift and hardware FAIL remain. Scheduler rebinding is unverified; no main, Pages, OmGitHub or public-deployment changes.

BILINGUAL_DOCUMENTATION_REQUIRED = true
