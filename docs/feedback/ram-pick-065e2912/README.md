# 衝車可見車身點選修正

最新遊戲來源 `b9699d627ae28f75eca33ee05aa0ac54311d27ae`，獨立分支 `codex/riftwatch-ram-pick-065e2912`。繼承總管r2與報告 `19b2310cfe59e85dc3862d76ccdb67b5b4c7e587`、迷霧效能修正及既有真人回饋／PixelFX成果；不改公開版本或現有RC。

## 實際問題與修正

正式來源83554的[基線實測](browser-before-r2/result.json)中，同一台可見衝車的左右木殼、屋頂與撞頭皆有正式繪圖的不透明像素（alpha255），但pickAt回傳後方core、tower或null。原生滑鼠點木殼未選到衝車、未排入集火；中央點擊能選到並排入，屬受控重現的UI車身與拾取不一致，不是攻擊傷害失效。

[修正後原生執行畫面](browser-after-r1/native-attack-executed.png)顯示「衝車・4人集火」及執行1項／略過0項。這證明命令排入並執行，不代表已造成傷害、擊殺或守城成功，圖中衝車仍220／220HP。基線native-attack-plan.png是在木殼失敗後改點中央的正控制，不能拿它當木殼失敗圖。

Game.pickAt只新增一個純UI判定；新`ram-body-picking.js`依Renderer.drawRamUnit原有實心木殼梯形、底部橢圓及金屬撞頭圓形，逆轉同一朝向、景深、受擊平移與晃動。只對存活的程序式衝車生效；若日後有對應Atlas則交回既有Atlas流程。沒有用泛用大矩形或調整任何攻擊／碰撞數值。

原可見性過濾仍先執行，中央距離優先序、單位在建築前的原流程保留；沒有新增最後畫面像素遮擋排序。旗幟、陰影、血條、遠方空白不因新函式可點；其他兵種與所有重疊情境未因此全面驗收。

## 驗證矩陣

| 項目 | 實際結果與範圍 |
|---|---|
| Node最新定向 | [143／143](node-focused-r2.tap)，含新純幾何27、真實Game整合6，以及布令／手動後令、RALLY、援護、視野／沙暴、中國英雄、存讀檔與指令回饋 |
| 正式構建 | [166／166 SHA256相符](RESOURCE-VERIFICATION.json)，相對83554有164個既有payload完全不變，只改Game新增import／predicate、新增拾取模組 |
| Chromium | [12／12檢查＋192組繪圖案例](browser-after-r1/result.json)：雙方×3縮放×8向×4姿態；每組四個車身點及三個空白反例；正式Canvas實際繪圖像素與pickAt，另有原生選取、集火排入及執行 |
| 純狀態 | 原生暫停查閱／選取與矩陣期間，模擬時間及兩種RNG不變；Node拾取前後完整snapshot相同，費用／半徑／攻距／傷害未變 |
| 性能 | [四案短樣本](PERFORMANCE.md)，100／200各before／after一次，保留auto／AI／碰撞／死亡；P95約50／66.7ms，after FPS稍低，N1不足判定穩定回歸或無回歸 |
| 獨立複評 | [已封存](director/REVIEW.md)，採認受控車身拾取與原生集火鏈；不評自然／真人樂趣，不擴張其他Owner或兵種範圍 |
| 自然玩家 | 新獨立C2從新遊戲自然完成前三波，第4波敗北；49成功輸入、3次舊控制拒絕，零程式錯誤、無上限／框架暫停介入。完整報告見player-C2/REPORT.md，不代表十波或真人通過。 |

## 保存的失敗及限制

第一輪browser-before-r1的離屏Canvas採樣全透明，原因是呼叫被RALLY綁定到原Renderer的drawUnit；它畫到原Canvas而非採樣ctx。此為夾具失敗；使用同一正式Renderer原型在自有ctx採樣後，基線第二輪已取得alpha255與原生失敗，不是為了讓遊戲變綠修改測試條件。

Node首輪[node-focused-r1](node-focused-r1.tap)是36項／29過／7失敗；先載入的靜態Renderer匯入需要document，尚未建立最小Node瀏覽器全域，造成7個檔案匯入錯誤。沒有刪除歷史測試或替換Game；用明示`--import tools/qa/ram-pick-065e2912/node-dom-fixture.mjs`提供既有測試所需DOM後，12個相關檔案143項通過。最小fixture沒有替換Game／規則。

helper首測紀錄保存在helper-debug。手算的移動＋受擊反例點落在車殼內，改以真實屋頂邊界205.9外的205.8測空白，另以206.2檢查移動與待命差異；生產幾何未為此改動。預設隔離／診斷的檔案層結果不冒充27項個別通過，正式helper用`--test-isolation=none`得到27／27，包含在根端143項。原始失敗TAP保留，沒有把它們算成已確認遊戲回歸。

192組是受控幾何驗證，沒有完整密集遮擋、所有車輪／細線／動畫邊緣、其他兵種或未來Atlas全驗。這不是自然十波、NG+、真人樂趣、真人聽感或實體GPU通過；低FPS時鐘、歷史strict SaveLoad RNG表示FAIL與長測缺口原樣保留。

專案自聲明Owner `codex-ram-pick-065e2912`／Execution `codex-ram-pick-065e2912-20261106`，Ownership282／收據 `97fea25f569408650743420f5cd366b0a9c85937`。原FUN273與其他Owner均未接管，Feed203由他人持有而未寫入。不修改main、RC、Pages、OmGitHub Issues、OpenCode Checkpoints或Immutable Build，不Force Push或公開部署。依使用者最新授權，回報／交接採臺灣正體中文，遊戲四語保留。
