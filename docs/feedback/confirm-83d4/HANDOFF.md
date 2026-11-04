# 施工提案確認修復 / Building proposal confirmation

本切片修復已重現的缺陷：最低八名村民的自動建屋提案，在村民死亡只剩七人後仍可確認並扣款。現在提案生成、撤回與確認共同檢查模式、時代、村民數量、建築上限、人口條件及預算。手動施工不受自動規劃門檻限制，既有手動藍圖保持優先。

This slice fixes a reproduced defect: an eight-worker house proposal could still charge resources after casualties left seven workers. Generation, withdrawal and confirmation now share mode, age, worker, building-count, population and budget validation. Manual construction remains independent and existing manual blueprints retain priority.

確認失敗顯示四語內嵌提示，不再默默失敗。提示涵蓋條件變更、施工位置及手動藍圖衝突；不將所有失敗誤稱為過期。發現並修復提示後關閉按鈕被對話框裁切的焦點問題，保留失敗截圖與幾何證據。

Failed confirmation now displays localized inline feedback covering changed conditions and build-site/manual-blueprint conflicts. A focus regression that clipped Close inside the dialog was found and fixed; its failing screenshot and geometry remain in evidence.

## 來源及所有權 / Provenance and ownership

- Base: `512f1429cf546fa09bc6da8646fb90b303db25fb`
- Branch: `codex/riftwatch-plan-confirm-83d4`
- Task: `PLAN-CONFIRM-83D4`; execution: `codex-plan-confirm-83d4-20261104`
- Claim: ownership version 249, receipt `015c3edf856259b791978768539d4f2c7ebc5534`; final release is published separately through the ownership CAS protocol.
- 正式遊戲構建 / Formal game build: `803f7f87655516088a62292891566ca9cb9cdbff`.
- 修改 / Changes: `js/stewards.js`, `js/steward-ui.js`, `js/locales.js`, `styles.css`, `tests/plan-confirmation.test.mjs`.

## 驗證矩陣 / Verification matrix

| 項目 / Scope | 結果 / Result | 限制 / Limits |
|---|---|---|
| 原缺陷 Node / Original regression | 4 FAIL, 2 PASS | Original six cases retained |
| 最終定向 Node / Final targeted suite | 55 PASS, 0 FAIL | Seven new confirmation cases plus related existing suites; not all historical tests |
| 正式構建 / Formal build | PASS, 150/150 SHA-256 | Source 803f7f8; hashes.json |
| Chromium before/after | CONTROLLED PASS | Native casualty fixture, pause, actual mouse confirmation; old pays/builds at seven workers, new rejects without resource/RNG/time changes |
| 四語三視口 / Four languages, three sizes | CONTROLLED PASS, 12 cases | 1366×900, 900×600, 390×844; warning and Close checked against dialog clipping bounds |
| 原生補員再確認 / Native replacement and retry | CONTROLLED PASS | Native town-center production restores eight workers; fresh proposal pays native 60 wood once |
| 自然第一波 / Natural wave one | NATURAL FLOW PASS | Fresh CHN seed CONFIRM-NORMAL, no injected units/resources/speed/waves; clears at 112.1956 simulation seconds |
| 長期戰役 / Long campaign | NOT_TESTED this slice | No natural ten-wave, natural NG+ or physical GPU certification |

自然流程使用祖先 `f44433b7d63379169690e27086965a23ef9014d4`：玩家實際設定時代詢問、建屋詢問與人口條件，原生付費升級及建屋；29.1323 模擬秒、九名村民時確認房屋，支付原生 60 木。玩家以正常介面將未來時代計畫改手動，並未取消正在研究的升級。第一波結束時時代二、八名村民、十一軍事單位、人口上限五十；原生待選卡為 war_banner、horse_armor、fire_oil，未領取。後續 cf95/803 僅修失敗路徑焦點與提示文字，故重用成功流程證據，沒有宣稱在最新提交重跑自然戰役。所有瀏覽器流程均無 page errors。

The natural run uses ancestor f44433b: real age/house confirmations and native payments, with a house confirmed at 29.1323 simulation seconds with nine workers. Future age planning was changed to manual through normal UI without cancelling active research. Wave one ends in age two with eight workers, eleven military units and capacity fifty; the native reward remains unclaimed. Later changes only affect failed-confirmation focus/text, so successful-flow evidence is reused with explicit provenance, rather than described as a latest-commit campaign rerun. Browser runs reported no page errors.

## 效能及證據 / Performance and evidence

最新版 100/200 單位測試各十次真實點擊至下一 RAF：P50/P95 分別 33.2/36.7 ms、20.4/41.3 ms。Heap 為 8,645,422→7,933,384 bytes、9,298,061→9,346,158 bytes。這是暫停、分散地圖上的靜態單位確認操作測試，不是戰鬥 FPS、全單位同屏或記憶體洩漏證明。Linux Chromium 154.0.8037.57、SwiftShader 軟體繪圖、AMD EPYC 9V74、四 CPU 配額，不能代表 Windows 實體 GPU。

Latest 100/200-unit tests use ten native confirmation clicks each: click-to-next-RAF P50/P95 33.2/36.7 ms and 20.4/41.3 ms. Heap changes are recorded above. These are paused, spread-out static-unit UI samples, not combat FPS, all-units-onscreen rendering or proof against leaks. Linux Chromium 154 with SwiftShader and four CPU quota does not certify Windows hardware performance.

`evidence/` 保存前後截圖、四語小視口、原生存檔、測試程式、JSON、TAP 與連續操作影片片段。video-provenance.json 記錄完整本地影片及提交片段的 SHA、長度與擷取來源；本地完整影片不冒充可下載交付物。

Evidence includes before/after images, narrow localized UI, native saves, scripts, JSON, TAP and continuous video excerpts. Video provenance records source hashes and excerpt durations. Local-only full captures are not presented as downloadable deliverables.

## 恢復與下一步 / Recovery and next step

保留歷史低 FPS 模擬時鐘、嚴格完整 Save/Load、自然第五波失敗，以及自然十波、真人聽感及實體 GPU 的未通過或未測狀態。本切片沒有修改 main、Pages、RC、公開版本、舊 Issues、其他 Owner Progress Feed 或排程。

Historical low-FPS simulation-clock and strict full-state Save/Load issues, natural wave-five failures, and unverified natural ten-wave/audio/hardware coverage remain unchanged. No protected branch, RC, public deployment, old Issue, other-owner feed or scheduler was modified.

下一項合法工作：從保存的原生第一波獎勵接續整合經濟／預算與較長戰役穩定性驗收；寫入前重新核對 Ownership，尤其避免既有 RTS 任務範圍。仍有獲授權工作，本輪主動在已保存切片結束，STOP_REASON=AGENT_EARLY_STOP，並非平台或額度故障。QUOTA_PERCENT_UNKNOWN；AUTO_RESUME_AVAILABLE=false：未驗證排程喚醒介面，不能保證背景恢復。

Next authorized work is integrated economy/budget and longer campaign validation from the saved native wave-one reward, after checking current ownership and avoiding held RTS scopes. Authorized work remains; this saved slice ends voluntarily with STOP_REASON=AGENT_EARLY_STOP, not an invented platform/quota outage. QUOTA_PERCENT_UNKNOWN; AUTO_RESUME_AVAILABLE=false because scheduler wake-up capability has not been verified.
