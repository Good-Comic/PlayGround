# 已知問題與風險 / Known issues and risk

**中文：** 這是未發布v2.4候選的內部風險清單，不是完整QA或發布批准。逐項證據及版本見 [剩餘工作盤點](REMAINING-WORK-AUDIT.md)。

**English:** This is an internal risk list for the unpublishedv2.4 candidate, not complete QA or release approval. See the [remaining-work audit](REMAINING-WORK-AUDIT.md) for versioned evidence.

|風險 / Risk|等級 / Priority|發布建議 / Release recommendation|
|---|---|---|
|十波及自然New Game+未通過 / Ten waves and natural New Game+ not passed|P0 milestone gap|阻擋完整v2.4就緒聲明 / Blocks fullv2.4 readiness|
|自然Rift Prototype當機尚未重現 / Natural Rift Prototype crash not reproduced|P0 investigation|不可宣稱已修；若實際再現則阻擋 / Do not claim fixed; blocks if reproduced|
|低FPS丟失模擬時間 / Simulation-time loss at low FPS|P1 KNOWN_FAIL|披露；低FPS玩法不可信 / Disclose; low-FPS gameplay unreliable|
|嚴格Save/Load暫態非確定 / Strict transient Save/Load nondeterminism|P1 KNOWN_FAIL|可操作不等於確定；保留備份 / Operational does not mean deterministic; retain backups|
|混合建築繪製JS+21.4% / Mixed-building draw JS+21.4%|P1 KNOWN_FAIL|保留性能FAIL；短開局不是長戰役PASS / Preserve performance FAIL; short opening is not sustained PASS|
|HARDWARE_TEST_PENDING|P1 BLOCKED|雲端結果不代表中階Windows GPU / Cloud results do not certify mid-end Windows GPU|
|16文明、難度、音效長期品質與完整設定覆蓋不足 / Incomplete16-civilization, difficulty, sustained audio and full-settings coverage|P2 QA gap|限定功能證據不可擴大 / Do not broaden scoped evidence|

**中文：** v234仍不發布。沒有修改公開入口，沒有新的公開回滾動作。本地失敗存檔是診斷資料，不得誤當下一次存活接續。

**English:** v234 remains unpublished. No public entry point was changed and no public rollback was performed. Defeated/local failure saves are diagnostic evidence, not living continuation points.
