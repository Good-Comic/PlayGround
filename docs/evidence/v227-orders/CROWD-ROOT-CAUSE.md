# Melee pursuit: real browser failure, native60Hz reproduction

The initiald460928 browser failed25s AttackMove completion: opponent remainedHP8, attacker130HP. Diagnostic8s run captured real state: opponent yielding/moving away, actor chasing, neither could reach weapon range. This was NOT fixed by changing timeout, giving less enemyHP, moving spawnpoints or removing collision.

The same native Game at1/60s reproduces the failure: hostile pair is treated as head-on traffic at1.8tiles, higherID yields away for4s. A fast opponent keeps evading the slower guard while trying to attack it. Different step cadences explain why an earlier .05s functional test could pass. Original browser and native failed logs retained.

Fixa88716a: exclude actively engaged hostile pairs only from traffic-priority/yield courtesy; cancel old yield-to-opponent records. All neighbours remain in swept-disc/static obstacle safety checks; no teleport, speed, attack, enemyAI, radius or feature reduction. Friendly convoy/narrow/crowd cases remain unchanged.24targeted combat/order/PhaseA checks pass including24-person and8-person narrow unit tests. New browser gate is separate and pending until its recorded run finishes. This is an additional reproducible bug; D6 raw samples did not include yield flags, so do not claim this proves the exact cause of its commander's oldcongested flag.
