# 新工作區復原快照 / New-workspace recovery snapshot

ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md
BILINGUAL_DOCUMENTATION_REQUIRED = true

繁體中文：worktree-recovery.json為本次切片完成時的真實Git盤點，包含當時dirty／未推送狀態，描述其自身發布前已核對的來源／遠端c733fd9，不遞迴提交自身SHA。正常Push後的新乾淨快照保留於/workspace/diagnostics/riftwatch/v240-migration/final。原環境9a0f19e與未提交QA為UNPUSHED_WORK_RECOVERY_PENDING，詳細欄位在ACTIVE-TASK.json，不能以新工作區盤點當成原資料遺失。恢復只進獨立Recovery分支後審核，不覆蓋新主線。

English: worktree-recovery.jsonis the actual slice-completionGitinventory, including then-dirty/unpushedstate. It describes verified source and remote c733fd9 before its own publication without recursively committing its ownSHA. A fresh clean post-pushsnapshot is kept under/workspace/diagnostics/riftwatch/v240-migration/final. Original9a0f19eanduncommittedQAremainUNPUSHED_WORK_RECOVERY_PENDING, with exact details inACTIVE-TASK.json; new-workspaceinventorydoes not establish original-data loss. Recovered work must first enter an independentRecoverybranchfor review, never overwrite new development.
