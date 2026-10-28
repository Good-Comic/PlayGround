# 回復計畫（未執行發布） / Rollback plan (no deployment performed)

**中文：** 開發及測試只在獨立分支進行。需要撤銷程式變更時，以正常Revert Commit保留歷史，不Reset／Force Push、不更動main或Checkpoints。任何未來公開發布須另取得明確授權並先核對當時站點HEAD、已驗證Artifact及不可變SHA目錄。

**English:** Development/testing stays on independent branches. Undo code with a normal revert commit that preserves history, without reset/force push or main/checkpoint changes. Any future public deployment needs explicit authorization and must first reconcile the then-current site HEAD, verified artifact and immutable SHA directories.

**中文：** 發布準備階段保留所有D6、v228及後續既有目錄。若未來批准更新入口，只能於授權範圍恢復上一個實際驗證版本的入口；不能刪除失敗Build或宣稱未測的舊版可回復。目前沒有指定新的部署Commit，也沒有對外發布。

**English:** Preserve D6, v228 and all later existing directories during preparation. If a future entry-point update is authorized, rollback may restore only a previously actually verified entry within scope; do not delete failed builds or claim an untested version is recoverable. No new deployment commit is designated and nothing was publicly released.
