# 獎勵語系回歸修復 / Reward localization regression fix

繁體中文：排程接續核對遠端科技圖鑑成果 c4b52af7cb55380a8def7b81fdbb64c793c217de、Ownership 240 與已完成交接。原任務已釋放，本次獨立任務 CODEX-LOCALE-REVIEW-4C7A，Execution codex-locale-4c7a-20261104，分支 codex/riftwatch-codex-locale-4c7a。正常乾跑及 CAS 認領241，認領提交3960ff736921842b721b59b50844c1db706453f8；未沿用先前Owner。其他仍為OWNED的任務未碰觸。

English: Scheduled resume verified remote codex delivery c4b52af7cb55380a8def7b81fdbb64c793c217de, ownership240 and its completed handoff. The prior task was released. Independent task CODEX-LOCALE-REVIEW-4C7A, execution codex-locale-4c7a-20261104, branch codex/riftwatch-codex-locale-4c7a was dry-run and normally CAS-claimed at241, commit3960ff736921842b721b59b50844c1db706453f8. No prior owner's identity or other OWNED scope was used.

繁體中文：真實Chromium證實，先選候選卡再呼叫既有changeLocale，四語按鈕皆被靜態翻譯重設為通用領取文字。實際選取仍正確，但無法再從按鈕確認卡名。js/codex-ui.js移除該動態標籤的data-i18n，讓既有圖鑑語系回呼負責名稱，避免後續靜態翻譯覆寫。沒有改遊戲規則、抽卡、RNG或領取流程。構建來源272d00db953ba79822f6cc11b9959917908ea2ec。

English: Actual Chromium reproduced the selected reward label reverting to generic claim text in all four languages after the existing changeLocale API. Selection itself remained correct, but the button lost its card name. js/codex-ui.js removes data-i18n from that dynamically owned label so the existing codex locale handler retains responsibility without a later static overwrite. Rules, draws, RNG and claiming are unchanged. Build source272d00db953ba79822f6cc11b9959917908ea2ec.

| 驗證 / Verification | 結果 / Result |
|---|---|
| 同種子 LOCALE-4C7A / Matched seed | 修復前四語FAIL，後四語PASS；原FAIL保留。/ Four locale failures before and passes after; original failures retained. |
| 狀態 / State | 查看前後候選、持有、時間、RNG一致；雙擊僅原生領取一次；無pageerror。/ Offers, owned cards, time and RNG unchanged by viewing; double click claims once; no pageerror. |
| Node | 定向5/5 PASS，node.tap保留完整計數。/ Targeted5/5PASS, full counts in node.tap. |
| 構建 / Build | 正式build_playtest.py，150/150 SHA-256一致。/ Official build_playtest.py,150/150 SHA-256matches. |
| 範圍 / Scope | Linux Chromium受控獎勵場景；語系用既有API切換，非玩家可見新入口。未重跑無關效能樣本或自然十波。/ Linux Chromium controlled reward fixture; locale switches use the existing API, not a newly added player entry. Unrelated performance samples and natural ten waves were not rerun. |

繁體中文：本次獨立檢閱修復範圍完成，未發布、未替換RC／公開版本、未修改main／Pages／Issues／其他Owner Feed／排程。歷史低FPS模擬時間、嚴格存讀檔、長時間性能與自然十波限制不變；九項候選科技與中國連弩疊加仍需設計決策。下一步為玩家內部檢閱整合分支；較長自然戰役驗證仍為既有後續工作，不能由本次短測宣稱完成。

English: This independent review/fix scope is complete without deployment, RC/public replacement or changes to main, Pages, Issues, another owner's Feed or scheduling. Historical low-FPS timing, strict SaveLoad, long-duration performance and natural ten-wave limits remain. Nine candidate technologies and China's bolt stacking still need design decisions. Next is player internal review of the integrated branch; longer natural campaign validation remains historical follow-up and is not certified by this short test.
