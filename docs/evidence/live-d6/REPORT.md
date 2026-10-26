# D6 GitHub Pages 線上驗收（2026-10-26，Asia/Taipei）

**AFTER_DEPLOY_LIVE_VERIFIED：僅限下列有證據的場景；版本維持 PLAYTEST-EXPERIMENTAL。**

網址：https://good-comic.github.io/PlayGround/builds/d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c/

- 實際遊戲 Build：`d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c`。
- Candidate：`3779c5d50876cb2e28590b9d250fb355fc0f8e38`；Pages 原生 build/發布分支：`6c98a8e6b7f7759ca57a9c9f94f675e2b6070381`，API 狀態 built。
- 全部本輪遊戲實測來自公開 HTTPS。沒有本地遊戲伺服器、route mock、HAR replay 或執行本地 Git 副本來替代線上測試。Git 只用來比對下載內容。
- 執行環境 revision4，精確 Pages 域名已列入；實際 CONNECT／源站200。沒有登入、CAPTCHA 或額外資源域名。網路 policy readiness 欄位仍 unknown，成功結論來自實際 HTTP／瀏覽器，不由白名單推測。

## 實際結果及門檻

| 項目 | 通過門檻 | 真實結果／證據 | 限制 |
|---|---|---|---|
| 版本與資源 | 完整 D6 SHA；28項 payload SHA256；捕獲的 Git 資源全部匹配 | runtime28/28；7組 HAR 共583/583 Git比對，614請求，均無HTTP400+；minimum-resource-audit等 | 生成的 metadata/KNOWN-ISSUES.html另由 payload manifest驗證 |
| 原生基本UI | 每步正常完成，真正Canvas非錯誤頁 | 12項：Start、移動中村民選取、蓋房完工、城心選取／訓練、Save/Reload/Continue、匯出等，minimum-results.json | 全新瀏覽器，不讀取真實使用者存檔 |
| 五分鐘P0 | 騎兵35模擬秒內接近指定點<2.5格；四資源各≥3次卸貨；≥1死亡→存活重新索敵；無≥20模擬秒零載貨原地採集；無Console/Page/request error | 300.9實際秒、446取樣；8次重新索敵；木85／金73／食51／石32次仍存活村民卸貨；騎兵完成；0長採集停滯；normal-300-summary.json | 固定TEU/steppe/seed；不是所有種子／單位／地貌不卡住的證明 |
| 資源入帳 | 返程載貨歸零並觀察資源／gathered統計 | stats.gathered增加2401.311；180個卸貨窗口保留資源前後數值；dead workers不計；economy-ledger-observations.json | 有自動訓練／建築支出，未宣稱完整交易守恆；不是只看資源總量上升 |
| Rally與訓練佇列 | 新兵實際抵達<0.2格；混合3項按順序入列並≤45實際秒原生出兵；Rally經SaveLoad保留／可清除；新村民≤20秒採集指定資源 | 11項通過：militia→spearman→militia；資源Rally與市場按鈕正常；rally-results.json | 線上引擎受控清場／建築／資源fixture，不冒充自然經濟建城 |
| 文明專屬兵種 | 封建射箭場可用；扣40木29金；原生訓練；≤12秒實戰3次射擊；SaveLoad保留；四語說明 | 中國諸葛弩8項通過；civ-results.json／combat截圖 | 有受控建築／資源／敵人；不是16文明所有科技／時代驗收 |
| Boss增援 | 延時3輪各4名M-family，合計4/8/12；≤20秒自行移動至戰鬥；225秒無第四輪；SaveLoad不重複 | 8項通過，包括Pause1.2實際秒完整狀態不變；boss-results.json | 顯式wave5、149.95/179.95/209.95/225時計fixture；不是自然等候或第10波Boss完整機制 |
| 攻擊／波次流程 | 真正滑鼠選兵／右鍵攻擊；原生擊殺及≤1.5秒再索敵；正常結算選卡；點選恩賜後進第二波準備，≤45秒自然倒數開波 | 8項通過：敵人原生死亡→boon→實際點卡Claim→30秒準備→wave2；combat-wave-results.json | 初始2敵受控場景；沒有呼叫killEntity/completeWave/chooseBoon來代替驗收；不是自然十波通關 |
| 四語與BugJSON | 真正語言下拉操作；title/lang/設定與文明文字顯示；繁中Start與下載JSON版本／種子一致 | 7項通過，4語首頁截圖與繁中實戰、下載seed1588037915；locales-results.json | Start Game在三個非英文介面仍保留英文，完整母語LQA未完成 |
| 錯誤與穩定性 | 所有場景Console error／Page error／失敗請求／HTTP400+皆0 | network-summary.json，原始JSON／已清理HAR封包 | 最長正常觀察僅5分鐘；非數小時耐久或正式效能壓力驗收 |

七組實際瀏覽器場景；54項瀏覽器斷言＋8項正常P0取樣檢查。數量不代表完整遊戲品質；以各場景範圍、操作、狀態及限制為準。

## 保留觀察、FAIL及下一步

1. **LIVE-D6-WAVE-01 / WARNING，根因未確認**：以riftwatch-p0-v1、TEU、steppe、speed1，騎兵移動32,29、村民7指派最近木材後觀察300.9秒，仍在第一波（waveClock258.456），剩一台活攻城槌，目標為commander。引擎／採集繼續運作，沒有把它稱為JS迴圈停止。實際敵人／目標／路徑與位置時間線保存在normal-300-wave-observation.json。下一切片：依GDD核對非Boss撤退／carryover與波次結束條件，重現追擊／障礙；先確定規格及根因再修改，不直接刪敵或跳波。
2. **LIVE-D6-LQA-01 / 輕微文字待確認**：三語Start Game仍英文；其餘本次檢查文字及CJK畫面可讀。下一切片：確認統一英文是否設計，再完成母語LQA與既定UI Scale工作；不把基本顯示通過當成完整翻譯通過。
3. 歷史100/250等雲端rAF／模擬時間FAIL原樣保留。本輪無新效能規格驗收，未因低單位功能測試就認定性能或時間正確。正常樣本初始讀取在輸入之前，wall計時在輸入之後，兩者不完全對齊；不以兩個總時差直接認證模擬時間。
4. **HARDWARE_TEST_PENDING**：本輪為Linux雲端headless Canvas2D；environment.json記錄實際CPU／瀏覽器／viewport，沒有中階Windows／實體GPU驗收或FPS推估。
5. 自然完整十波、第10波Boss、全部文明／地貌、長時耐久、高負載、任意舊存檔相容：NOT_TESTED；B1/B2未因此自動正式整合／QA-ACCEPTED。OmGitHub新版接續仍依既有獨立方案，不把Pages驗收稱為OmGitHub新Preview驗收。
6. 一次較舊資源工具的CLI不支援--path-prefix，於讀檔驗收前被argparse拒絕。已改從已保存3779c5完整Git版本匯出工具，再對同一HAR正確比對；原誤用記錄於harness-notes.json，並未把程式錯誤改寫為產品FAIL或掩蓋HTTP差異。

## 證據及保存

manifest.json記錄版本、範圍及每份測試工具SHA256。browser-raw-sanitized.tar.gz含實際HAR回應body、輸入／狀態／JSON結果；發布HAR移除Cookie／Authorization等header與cookie欄位，沒有修改資源body。候選存檔使用獨立儲存鍵，測試只在fresh context操作，legacy合成canary保持不變。

截圖已實際開啟檢視，包括繁中遊戲畫面及選卡畫面。大型Playwright trace保留本機，未推送；large-artifacts.json保留各檔大小、SHA256與位置（五分鐘trace約1.65GB），不宣稱全部trace已在GitHub。原始HAR亦保留本機；遠端清理版足以比對資源及檢視操作／狀態。

BEFORE_LIVE為先前Legacy證據；AFTER_LOCAL為先前D6候選證據；本次AFTER_DEPLOY_LIVE為D6在GitHub Pages的限定場景驗證。保留PLAYTEST-EXPERIMENTAL；main、Issue17、OpenCode Checkpoints、Integration與Pages遊戲資源均未修改。本輪只正常提交／推送獨立驗收分支及監控／恢復快照。
