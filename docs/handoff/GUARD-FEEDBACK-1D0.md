# 護衛目標回饋 / Guard target feedback

**繁體中文：** 本執行者無法證明與前 Owner 為同一實例，故使用本工作階段自聲明專案身份 `codex-guard-1d0bb6b18590`，認領獨立任務 `V240-GUARD-FEEDBACK-1D0BB6B18590`；此標識不是平台認證。遠端所有權版本 211 已核對。分支 `codex/riftwatch-guard-1d0bb6b18590` 直接基於 `76039443d8134e5caa13d8e01696c249f13a6578`，未接管舊工作。

**REAL_GAMEPLAY_DEFECT：** 護衛模式下點擊地面、敵人或選取的自身時，命令被拒絕但沒有任何反饋，玩家無法知道仍需選擇目標。現在播放錯誤音並以繁體中文、簡體中文、英文或日文提示選擇另一個友方單位或建築；仍保留待選護衛模式及先前命令，不顯示成功標記。有效目標仍正常確認並分配護衛。修正前 Node 回歸因沒有錯誤音與提示而 FAIL，修正後兩項案例及五個相關測試檔通過；原失敗見 `guard-1d0-evidence/prior-failure.json`。

應用提交 `2a9c69f15fecac5cf776f3c822e41e4f0a743b0b` 用正式工具產生新本地構建，真實 Chromium 驗證 127 檔案哈希。受控場景使用真實 G 鍵和滑鼠：點擊地面時顯示錯誤提示、維持原巡邏及護衛待選狀態；接著點擊友軍，成功標記、音效及護衛目標均正確。結果與截圖位於 `guard-1d0-evidence/`；此為受控操作，不代表自然完整戰役或真人聽感驗收。實體 GPU、自然十波、歷史 FAIL 等仍待測；Progress Feed 由其他 Owner 持有，待合法同步。

**English:** This executor cannot prove it is the previous owner. Session-scoped self-declared project identity `codex-guard-1d0bb6b18590` claimed independent task `V240-GUARD-FEEDBACK-1D0BB6B18590`; it is not platform authenticated. Remote ownership version 211 was verified. Branch `codex/riftwatch-guard-1d0bb6b18590` is based directly on `76039443d8134e5caa13d8e01696c249f13a6578` without taking over prior work.

**REAL_GAMEPLAY_DEFECT:** In guard mode, clicking ground, an enemy or the selected unit rejected the command silently, leaving the player unaware that a target was still needed. The game now plays an error cue and provides Traditional Chinese, Simplified Chinese, English or Japanese guidance to choose another allied unit or building. Guard targeting mode and the prior order remain, without a success marker. Valid targets still receive the normal confirmation and guard order. Before the fix the Node regression failed because no error sound or message was emitted; afterward two cases and five related test files passed. The original failure is preserved in `guard-1d0-evidence/prior-failure.json`.

The official tool generated a new local artifact from application commit `2a9c69f15fecac5cf776f3c822e41e4f0a743b0b`, and real Chromium verified 127 file hashes. In a controlled scenario using the real G key and mouse, clicking ground showed rejection feedback while preserving the prior patrol and armed guard mode; clicking an ally next produced the expected marker, sound and guard target. Results and screenshots are in `guard-1d0-evidence/`. This controlled interaction is not a natural full campaign or human listening acceptance. Physical GPU, natural ten waves and historical failures remain outstanding; Progress Feed belongs to another owner and awaits authorized synchronization.
