# Riftwatch — Strategy v2.4.0 GAME FIRST（单一权威开发规范）

> Status: **USER-APPROVED / ACTIVE ON THIS STRATEGY BRANCH**  
> Project: 《世纪帝国二：裂境守望》 / Age of Empires II: Riftwatch  
> Repository: `Good-Comic/PlayGround`  
> Supersedes: 本会话先前 Strategy v2.4.0 正文及其「开发决策／工具与 Skills／浏览器可视化」修订；保留既有 GDD、技术事实、发布许可及风险边界。  
> Authority: 用户最新明确指令 > 本规范 > 已核准 GDD 的适用条款 > Handoff/NEXT-TASKS；Git、实测证据用于判定实际完成程度，不把未经批准的草稿当成正式 Strategy。矛盾处先提出决策，不擅自覆盖。

## 0. 执行目标与工作哲学

**优先制作真正能玩、看得出改进的高品质 2.5D RTS × Roguelite，而不是扩大管理文件及反复验证环境。** 每个工作切片应有真实游戏程序、素材、音效、内容或稳定性改善，保留最小足够证据。首次收到重大新指令，须**完整阅读所有适用指令后**，去重、排序、检查依赖、实现风险及授权边界，然后执行。

发现重复、技术上可优化或互斥的事项，提供少量明确方案（推荐、替代、代价、风险），优先使用实际支持的在线互动选择组件／可点击选项；没有该能力则用编号选择，不虚构控件。对于**改变核心玩法、开发架构、成本、许可证、公开权限**的决策先请用户确认；已明确授权、无歧义且独立的任务直接执行，不因其他待确认事项全线停工。每 310 分钟自动接续时从已批准的排序和最新有效状态恢复，**不重做全文规划**。

## 1. 版本、发布与不变量

- v2.3.4 Candidate **已保存但不发布**；内部可持续推进 v2.3.5～v2.3.x，下一主要公开玩家测试里程碑为 **v2.4.0**。
- 开发、构建、独立分支 Commit/Push、定向/本地浏览器测试及发布计划允许；**未获新的明确授权前，不更新 GitHub Pages、根入口、OmGitHub Publication，也不创建新 Issue 或执行 Resume/Continue**。
- 保留所有历史完整 SHA Build（含 D6、v228）、v234 ZIP/manifest、Git/测试证据及回滚能力；不得修改 `main`、Force Push、覆盖 OpenCode Checkpoints、Legacy #17/#18/#19 或其他 Agent 的成果。发布命令若正在运行，先核实状态并安全协调停下，禁止破坏性的强停。
- 不用内部 v2.4 功能的存在声称它已公开部署。版本名、来源 Commit、Build SHA、部署 Commit 必须分开报告。
- 当前已知风险继续明确保留：自然「裂界原型」崩溃 `NOT_REPRODUCED`、低 FPS 模拟时间流失 `SIMULATION_INTEGRITY_BLOCKED`、严格 Save/Load 决定性 FAIL、历史性能 FAIL、十波完整稳定性未认证、`HARDWARE_TEST_PENDING`。

## 2. v3.0 之前的技术路线：2D Engine + High-quality 2.5D

当前生产渲染以 Canvas 2D、2D 游戏坐标/导航为基础。**在 v3.0 之前不迁移真 3D 引擎、不引入自由 3D 摄影机、不为美术翻写游戏模拟**。允许强化 2D Sprite、Atlas、多方向动画、深度排序、遮挡、阴影、建筑状态、UI、2.5D 地貌及与规则对应的高度层。

「2.5D」指视觉斜视/等角风格，非已经存在真 3D 模型。若采用离线 3D 预渲染制作 2D Sprite，最终游戏仍为 2D 引擎；不强制安装 Blender 或大型 3D 工具，优先高品质稳定可运行的 2D 资产管线。

## 3. 文明、兵种、英雄、建筑、美术及动画

为现有 16 文明逐步建立可扩展、统一风格的差异矩阵：文明建筑语言、兵种武器/铠甲/盾牌轮廓、特殊兵种、英雄形象与清楚的辨识标记、敌军势力、Boss、树木/矿藏/道路/特殊地形。不得仅靠换色宣称文明差异已完成；不能直接复制受版权保护的商业游戏资产。

目标包含多方向行走、攻击、受击、死亡、英雄施法、施工/完工/受损/毁坏动画，统一相机视角、实际碰撞位置和渲染层。先完成一组实际可玩 Visual Vertical Slice：英雄、步兵、远程、骑兵、特殊兵种、经济/军事建筑、敌方特殊单位或 Boss、地形一组；验证浏览器视觉、方向、缩放、性能后复用管线扩大内容。视觉尺寸变化不得不经平衡审核改变碰撞半径。

**大量素材可以自主合法搜索、下载、制作或生成，但下载数量不是 KPI**；只有真实整合到游戏的可用、统一、可授权资产算成果。第三方资产记录 URL、作者、精确许可证、商用/修改/再分发权、署名要求、修改历史及文件清单；无法确认权利时不用。概念图 ≠ 多方向 Sprite ≠ 完整动画 ≠ 已整合游戏资产。

## 4. 音效、BGM 与战场状态提示

保留并发展现有 Web Audio、动态配乐/原型唤醒提示，实现选择/移动/无效命令、采集、建筑施工/完工、训练/科技完成、近远程/攻城攻击和受击/死亡、技能、重要建筑遇袭、低血量、资源不足、波次、Boss、卡牌、胜败的可辨认音效。主菜单、准备、普通战斗、Boss、卡牌、暂停、胜败及多周目可用不同音色/音乐层与渐变。优先保障危险警报的听觉优先级。

允许合法授权音乐/音效下载或原创建模/合成；评估动态 BGM 的听感、疲劳、重复及混音质量。提供 Master/SFX/BGM/静音和浏览器首次用户交互后恢复 AudioContext；节流、复音上限、音量衰减避免战场噪声堆积；**音频/粒子不得消耗决定战斗与存档结果的共用 RNG**。若工具欠缺需列明，不能把静音/占位符冒充完成。

## 5. Seed 驱动地图与地形机制

新游戏界面**预先自动填入一组有效随机 Seed**，同时提供玩家可编辑输入与重新随机按钮；玩家手动修改后不得擅自覆盖。可用文本/数字 Seed，但需固定规范化与规则版本。同 Seed + 地图参数 + 地图规则版本应生成一致地图及预生成内容，Save/Load 保存 Seed、生成版本与恢复必要状态；分离地图 RNG、战斗 RNG、音视效 RNG。

逐步实现资源/森林/矿脉/水域/道路/隘口/敌军路线/起点变化、不同生态、地图类型、地表高度、坡道、可见性、地形通行成本及合理高地战术优势。先完成 Height/Terrain Layer 的可玩原型，不要求一轮覆盖全部。地图生成需检查基地可建、资源可达、敌军有合法路径、坡道与隘口不会无解及战斗/存档一致性。

## 6. 开局设置与游戏中可查询/有限可调整选项

按真实规则/GDD 提供有范围和默认值的设置：
- **开局/Custom Game**：文明、地图 Seed/类型、地貌、难度、标准/自定义波数、敌军阵营池、Boss 开关/频率、卡牌规则、经济/科技节奏、地形玩法、Fog、已解锁的周目/模式。
- **游戏内信息**：当前 Seed/难度/文明/科技/周目/波次、已揭露敌军与 Boss、规则/卡牌/Buff/Debuff、帮助与快捷键。不得通过信息面板泄露战争迷雾下的未知情报。
- **游戏中可安全调整**：音量、语言、UI 缩放、画质、辅助提示和操作偏好；影响规则/数值的实时变更需明确 Custom/Practice 模式、记录变更、处理存档/公平性，标准十波默认保持正式基准。

提供合法组合校验、禁用解释与 UI 清晰反馈。不得为了设置面板而取消原有 GDD 玩法。

## 7. RTS、Roguelite 与难度深化

核心 RTS：资源采集/卸货、城镇扩建、人口上限、施工/建筑、训练、Rally、科技与时代、兵种克制、战术指令/选取群组/双击、英雄、攻城/塔/城墙、可靠撤退及波次结算。用户 P0 的「裂界原型」自然领取后当机仍未重现，保存原始玩家环境/Seed/实际输入，在自然波次路径复现，不能因受控 UI PASS 就宣布修复。

Roguelite：有意义的卡牌/稀有度/文明差异、敌军种族与路线、Boss 机制/变异、资源/科技/天气或地形效果、多路进攻。难度至少 Easy/Normal/Hard，Extreme 可扩充；采用集中、有定义的配置组合敌军组成、AI、波次节奏、起始资源、经济压力、容错与 Boss，不只硬抬 HP。标准模式十波为基准；调整波数标记 Custom Game。

## 8. 十波后的二周目与多周目

第一周目完成正式十波可进入结算，选择退出或 New Game+/继续。第二周目可继承**明确定义的有限**进度，附敌军战术/特殊 Boss 修饰与地形或卡牌变异；周目数、规则与继承状态在 UI 显示和 Save/Load 中保留。之后逐步推出不同修饰组合与 Endless Cycle，避免无限资源继承造成平衡崩溃。第一版可交付最小但完整的「十波正常完成 → 结算 → 选择 → 二周目真实开始 → 玩法变异」，受控跳波仅算定向测试。

## 9. 真实浏览器与可观看的验证过程（优先尝试 Live）

**优先争取用户可观看的实时浏览器会话**：先检查现有 Codex/Cloud/连接器是否真的支持有权限的实时观看、可共享会话及观看链接；明确观看权限与是否能暂停、接管控制。不得将工具内部 Chromium 实例、截图、公开 Preview 或录影包装成实时共享。若能力缺失、需要新增公共端口/服务/帐号、成本或额外授权，不得擅自启用；**立即使用自动录影 + 游戏状态同步记录作为备援，不得让直播需求阻塞开发**。

备援要求：Playwright/Chromium 从真正首页 Start、开局设置及 Seed、鼠标键盘、选取/建造/训练/采集/英雄/卡牌/自然波次实操，保存真实浏览器录影（必要时同步时间戳游戏状态 HUD/JSON：时间、Seed、难度、资源、人口、波次、重要事件），可配关键截图和 Trace/HTML 报告。长程测试优先保留失败前后原始片段及少量快进摘要；不能将幻灯片截图组合冒充真实操作视频。视频、截图和报告包含来源 Commit、Build SHA、模式和 Seed；对于公开 HTTPS 验收须实际读取公网资源，不用本地成功代替。

## 10. 最省 Token 的可信测试方法

降低 AI 重复分析和工具往返，不降低证据真实性。四层：
- **A**：单次变更定向 Unit/Node 与少量集成。
- **B**：真实浏览器烟雾测试影响到的 UI、选取、移动、建造、训练、技能、音视效。
- **C**：每阶段里程碑的自然 1/3/5/10 波。
- **D**：集成 Candidate 的完整十波、不同难度/文明/Seed、二周目、稳定性和平衡。

区分并真实标记：
- `NATURAL_PLAY`：正常入口、合法玩家操作，不注入资源/血量/敌军/跳波。
- `ACCELERATED_NATURAL_PLAY`：仅正式可用倍速或**已验证模拟语义一致**的加速；不能掩盖低 FPS 钟差问题；同样保留真实建造/采集/AI/冷却/波次逻辑。
- `CONTROLLED_FIXTURE`：设置状态作定向测试，不代表自然通关。
可由确定性策略脚本批量操作浏览器；AI 分析机器摘要及失败片段，减少 Token。保留每次真实胜/败、失败根因、Seed、文明、难度、资源、人口、波次和时间；合理策略失败与 Softlock、AI 导航缺陷或平衡失衡必须分开。**绝不能因为跑得快或通过状态机直接标记自然十波 PASS**。

## 11. Tool / Skills / 生成素材的自主化

允许在现有权限下自主联网搜索、评估/下载可信许可证兼容工具，并使用当前可用 Skills、绘图、2D Sprite/Atlas、程序动画、音效、BGM、图像批处理、Browser/Playwright、视频/Trace 等；可编写脚本、包装器、转换器，修改**许可证允许修改的项目内开源工具**以适配 Riftwatch。

工具能力状态标记为 `AVAILABLE`、`INSTALLABLE`、`AUTHORIZATION_REQUIRED`、`PAID_SERVICE_REQUIRED`、`ENVIRONMENT_BLOCKED` 或 `UNSUPPORTED`。需额外账户/凭证、管理员权限、受保护系统变更、付费资源、对外服务/端口或高供应链风险时，说明具体工具、用途、权利与替代方案，请用户确认后执行。不得改写平台受管 Skills、绕过访问控制/许可证。探索后优先交付一份真实游戏可加载或可播放的小资产，而不是纯清单。

## 12. 优先级、Phase 与依赖

**首先消除正在阻塞正常游玩的 P0 Bug/Softlock**；随后按用户体验与依赖推进：
1. Phase A：操作、导航、经济、建造、训练、英雄基础稳定。
2. Phase B：文明/兵种/建筑美术、方向动画、战斗音效/BGM 与素材流水线。
3. Phase C：随机 Seed、地图/地貌/高度、开局设置和规则查询 UI。
4. Phase D：卡牌、敌军/Boss/波次自订、集中难度规则。
5. Phase E：自然十波验证、平衡迭代、二周目最小实装、多周目扩展。

可穿插低依赖任务并行，但每个切片需清楚 Task Ownership，最多开展少量互不冲突的工作。已完成的不重做；优先玩家「看得见、玩得出」的交付。每次重大指令首先检查重复或可合并设计；关键架构/规则歧义提供在线选项，确认后执行。

## 13. v2.4.0 Candidate 发布门槛

- 正常 RTS 经济/建造/训练/英雄/操作与可靠胜负流程；
- 可见的英雄、兵种、文明代表、重要建筑与动画/美术改善；
- 真实可听的 SFX/BGM/警报；
- Seed 自动填入、可修改、可再生成、可重现及 Save/Load；
- 至少一组可玩的随机地图/高低差玩法切片；
- 开局规则/游戏内查询、难度实际生效；
- 真正浏览器逐步达到完整十波，保存自然通关或合理失败，不虚构通关；
- 最小二周目变异可完整测试；
- 没有新 P0 崩溃/Softlock，旧模拟/存档/性能/硬件 FAIL 持续披露。

达成门槛后只创建 Candidate、Build SHA、完整游戏 artifact、验收计划；**公开发布需要另一轮明确授权**。个别非阻断的复杂素材可隔离为后续工作，不能把大版本变成永久延期项目。

## 14. Token 预算、自主接续与最小交接

正常周期：读最新有效 Manifest/Ownership/Handoff（单次），确认本轮基线 → 开发 → 定向/浏览器测试 → 正常 Commit/Push 并核对远端 SHA → **精简**更新 Recovery/Handoff/Progress Feed 和 NEXT-TASK。既有 310 分钟排程继续；排程送达 ≠ 配额重置 ≠ 继续执行成功。若其他 Agent 有活跃租约不抢占；不可靠过期租约不能自动判定实例已停。无任务、额度/工具受阻时安全退出，不重复做无用文书提交。

`USER-APPROVED OVERRIDE`（2026-10-27）：任何每週剩餘額度百分比門檻均已廢止。百分比只作資訊，不等同單次 Token、上下文或執行時間，也不構成停止理由；不可讀時維持 `QUOTA_PERCENT_UNKNOWN` 並繼續已授權工作。只有平台實際拒絕、上下文／執行預算不足、工具或憑證失效、環境異常、權限或所有權衝突時才安全保存並停止。不可擅自承諾后台自动恢复或新 Agent 调度能力。

## 15. 输出格式与生效管理

日常回报仅：实际新增/修复、玩家可观察改善、真实测试 PASS/FAIL/BLOCKED、分支及完整 SHA、已知问题、下一个切片；详细日志留仓库。首次整合本规范，应在同一独立分支的 `docs/handoff/HANDOFF.md` 首段标记 **ACTIVE STRATEGY = docs/STRATEGY-V2.4-GAME-FIRST.md**，标注此文件的 Git 提交与后续派工方式；保存远端后让下次排程优先读取。其他旧 Strategy 文件保留历史但不应作为 v2.4 工作的并列权威。不得复制拆散本文件成为多个互相冲突的现行版本。

**执行要求：完成一次去重、排序和必要的重大决策选择；其他既有授权的 Game First 任务马上接续。实时浏览器观看可用则优先，不可用则录影＋状态记录并继续开发。**

## User-approved continuous milestone override (2026-10-28)

Commit/Push/Handoff are process checkpoints, not a reason to stop after one feature. Continue the v2.4 gameplay milestone in dependency order: versioned Seed terrain/accessibility → natural ten-wave campaigns → difficulty/enemy/Boss presets → New Game+ and end-to-end milestone acceptance. Continue independent authorized work around isolated blockers. Stop only for actual platform quota refusal, execution/context exhaustion, environment/tool/auth failures, unresolved ownership/Git conflict or a material decision requiring approval. Weekly percentage thresholds remain revoked. Preserve all FAIL and distinguish local/simulation/natural/live/hardware evidence.

The user approved the conservative follow-up design in this session: Normal preserves the current baseline; Easy/Hard mainly change ordinary enemy counts and preparation windows without altering base-unit or Boss attributes. After normal ten-wave victory, an optional New Game+ retains at most three player-selected cards, resets resources/buildings/technology, and adds a visible enemy modifier. These mechanics still require implementation and actual validation; the approval itself is not a PASS.
