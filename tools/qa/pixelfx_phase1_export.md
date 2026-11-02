# 固定匯出流程／Pinned export procedure

繁體中文：來源Good-Comic/pixelfx提交a84159688af3ca37a4be05a0d422b94451b2e24e。在獨立來源目錄執行下列官方命令，不能在RC分支匯入全部效果；只複製兩組PNG/JSON與LICENSE/NOTICE，排除Gallery／字型／actor。兩次匯出已逐位元相同。確認SHA256對應assets/vfx/pixelfx-phase1/PROVENANCE.json；不要因工具失敗停用完整性驗證。

English: PinGood-Comic/pixelfx toa84159688af3ca37a4be05a0d422b94451b2e24e. Run the official command in a separate source checkout; never import all effects into RC. Copy only these two PNG/JSON pairs andLICENSE/NOTICE, excluding gallery/fonts/actors. Two exports were byte-identical. VerifySHA256 against assets/vfx/pixelfx-phase1/PROVENANCE.json without bypassing verification.

```sh
node tools/render.mjs melee/sword-slash impacts/blunt-hit --sheet --no-actor --seed 42 --fps 30 --out /workspace/scratch/pixelfx-phase1-export
```
