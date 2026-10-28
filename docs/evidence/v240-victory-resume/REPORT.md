# Completed-campaign Save/Continue

Code db0512d6b31f256da598e6f07cb70d75e44af23f, exact34-file final tested artifact a5a538d287b9c29951a83ebede5431db9fce7dc7. AFTER_LOCAL only. The production victory end hook saves the completed run to its existing playtest namespace. Native Continue now reopens a restored victory's end/NG+ choice instead of leaving the player on an inert won battlefield. No new storage namespace, game-clock, combat or balance changes.

Real Chromium10/10 checks pass: controlled completed-victory fixture ONCE; actual reload/native Continue recovers all five owned cards and real victory phase without a second fixture injection; choose max3; native next cycle resets economy and age; native SaveReloadContinue in cycle2; real engine spawns the announced25s cavalry; zero browser errors/network failures. Source-pinned browser.json and continuous ngplus.webm retained. This is functional victory recovery, NOT a natural ten-wave win or strict simulation determinism.

First fixture mistakenly left restore()'s intentional inMenu=true, so saveRun correctly refused to save a menu-only state and Continue was hidden. Retained failure JSON; corrected fixture explicitly represents an active completed campaign (inMenu=false). No production workaround was made for that fixture mistake.
