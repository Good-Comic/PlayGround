# 混選指令一致性 / Mixed-selection command consistency

**繁體中文：** 本次執行者無法證明與前一 Owner 為同一實例，故使用本工作階段自聲明專案身分 `codex-rts-ad773cfc5a6d`，認領獨立任務 `V240-RTS-MIXED-AD773CFC5A6D`；此標識並非平台認證。遠端所有權版本 207 已確認，基底 `a569e2201f4715b833424895ffbada0bd4f1c705` 包含先前 Boss 與音效成果。舊分支與 Owner 未接管。

混選村民與巡邏軍隊時，右鍵資源或投遞點原先會先清除所有選取單位的戰術路線，即使該指令只分配給村民。修正後僅為實際接收命令的單位清除路線；明確攻擊仍會替換具攻擊資格軍隊的路線。修正前兩個 Node 回歸案例失敗，修正後三個案例及五個相關測試檔通過。

應用提交 `3ee05fa0bd11a6fe4b3517225ebdaf3001aeade5` 使用正式工具生成新本地產物，127 個檔案在真實 Chromium 中通過哈希驗證。受控混選場景透過原生右鍵點擊樹木，村民採集，軍隊保留巡邏並移動約 4 世界單位；紀錄與截圖位於 `rts-ad773-evidence/`。非自然完整戰役或實體 GPU 驗證。歷史 FAIL、自然十波、硬體與聽感待驗證事項仍保留。Progress Feed 由其他 Owner 持有，未同步。

**English:** This executor cannot prove it is the prior owner, so session-scoped self-declared project identity `codex-rts-ad773cfc5a6d` was used to claim independent task `V240-RTS-MIXED-AD773CFC5A6D`; it is not platform authenticated. Remote ownership version 207 was verified. Base `a569e2201f4715b833424895ffbada0bd4f1c705` includes the previous Boss and audio work. No previous branch or owner was taken over.

With villagers and patrolling military selected, right-clicking a resource or dropoff previously cleared every selected unit's tactical route even though only villagers received the command. The fix clears routes only for units actually assigned a command; an explicit attack still replaces eligible military routes. Two Node regression cases failed before the fix; three cases and five related test files passed afterward.

Application commit `3ee05fa0bd11a6fe4b3517225ebdaf3001aeade5` was built into a new local artifact with the official tool and 127 files passed real Chromium hash verification. In a controlled mixed selection, a native right-click on a tree sent the villager gathering while the soldier retained its patrol and traveled about four world units; results and screenshot are in `rts-ad773-evidence/`. This is not a natural full campaign or physical GPU validation. Historical failures and pending natural ten-wave, hardware and listening checks remain. The Progress Feed belongs to another owner and was not updated.
