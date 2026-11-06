# 原生玩家操作

根端只負責啟動正式構建、逐檔校驗與原封快照載入，玩家只能呼叫observe、原生act、wait、finish。這是工具／工作程序與瀏覽器狀態隔離，不宣稱額外OS安全沙箱。畫面與文字不是同一原子時刻，若有不同應保留。成功輸入回ok不等於策略成功，需核對後續畫面。

只允許執行client，及讀取本角色PROFILE／PUBLIC-PROTOCOL、client產生的公開觀察、截圖與自己報告。禁止讀取任何private-observer、引擎、其他玩家、舊報告、RNG、快照內容或引擎evaluate。看到正式結算後不要再發戰鬥命令；使用finish完成收尾。

Client格式：`python3 CLIENT_PATH LAB_ROOT B OP 'JSON_ARGS'`。OP為獨立參數，JSON_ARGS可省略，不把整份JSON當成OP。

CLIENT_PATH=`/workspace/riftwatch-vision-mask-98f98a19/worktree/tools/qa/player_lab_client.py`

LAB_ROOT=`/workspace/riftwatch-vision-mask-98f98a19/natural-B3`

例如：

```sh
python3 CLIENT_PATH LAB_ROOT B observe
python3 CLIENT_PATH LAB_ROOT B click '{"selector":"#btn-continue"}'
python3 CLIENT_PATH LAB_ROOT B key '{"key":"Escape"}'
python3 CLIENT_PATH LAB_ROOT B finish
```

observe回傳公開截圖路徑、文字與controls；用view_image讀實際截圖。只按公開controls或實際畫面原生點擊，不猜隱藏介面。新opaque別名只在當份文件／該DOM有效，重新render後重observe。client等候過久不等於遊戲失敗，先核對回應，不重送同一動作。
