# Riftwatch v3.0 Decisions

## Schedule baseline

The v3.0 work file fixes the standard run at 28:30, with wave 10 starting at 24:30 and ending at 27:00.

Implementation used here:

- 45-second opening preparation.
- Waves 1–9 use a 120-second combat slot followed by 30 seconds of preparation.
- A single 75-second mid-campaign break is added after wave 5, making that preparation window 105 seconds.
- Wave 10 uses a 150-second combat slot and has no post-wave preparation.
- The 90-second settlement allowance is represented by the end-screen state; play stops when the result is shown.

This produces wave starts at 0:45, 3:15, 5:45, 8:15, 10:45, 14:30, 17:00, 19:30, 22:00, and 24:30. Wave 10 ends at 27:00.

## Branding

- Visible main title is the localized full name: `Age of Empires II: Riftwatch`, `世紀帝國二：裂境守望`, `世纪帝国二：裂境守望`, or `エイジ オブ エンパイア II：裂境の守り`.
- The menu renders the series name and subtitle as a stacked title so the full name remains legible.
- The visible start button remains exactly `Start Game` in every locale.
- `window.ageOfAsh`, seed behaviour, and locale storage keys remain backward compatible.

## Buildings and cards

- Canonical gameplay building identifiers are `core`, `house`, `farm`, `camp`, `barracks`, `range`, `stable`, `tower`, `wall`, `gate`, `workshop`, `market`, `shrine`, `forge`, `monument`, and `fishing_hut`.
- `core` replaces the legacy `towncenter` identifier; `range` replaces `archery_range`. No legacy aliases are persisted in save data yet because save/replay is not implemented.
- Villager build commands use four entries per page plus a `More` pager, keeping the six-slot command panel intact on desktop and mobile.
- Utility roles are reversible first-pass decisions: camps are drop-off points, walls block all movement, gates open for player units, workshops train rams, markets trickle gold, shrines heal nearby units, forges grant a nearby damage aura, monuments add population, and fishing huts require adjacent water and trickle food.
- Building footprints, HP, costs, and build times now follow GDD §2.4: the core is 4×4/3000 HP, houses 2×2/300, farms 2×2/160, camps 2×2/250, barracks/range/stable 3×3/600, towers 2×2/650, walls 1×1/500, gates 2×1/650, workshops 3×3/600, markets 3×3/450, shrines 3×3/500, forges 3×3/450, and monuments 4×4/1600.
- Core building placement in the starting base was shifted to keep the 4×4 footprint clear of the barracks, houses, tower, farm, and starting units.
- The 32 existing boons now carry sequential spec-style metadata codes `C01`–`C32`; their legacy IDs remain stable for localization and saves.

## Units and waves

- The 12 GDD §5.1 families are present: `M` man-at-arms, `P` spearman, `R` archer, `K` skirmisher, `C` light cavalry, `A` horse archer, `E` elite guard, `S` mangonel, `B` battering ram, `V` recruiter, `W` war elephant, and `N` patrol cart.
- Unit HP, attack, interval, range, speed, armor, cost, train time, and threat values follow the §5.1 table. The recruiter is non-attacking; the mangonel applies 50% splash to up to seven additional enemies within 1.5 tiles.
- Counters follow §5.1: spears ×2 versus C/A/W, skirmishers ×1.6 versus R/A, light cavalry ×1.5 versus S/V, rams ×4 versus buildings and ×0.25 versus soldiers, and archers/skirmishers/horse archers ×0.25 versus rams.
- Training is split by building: barracks M/P/E, range R/K, stable C/A/W, workshop B/S/N, shrine V.
- `WAVES` now follows the §5.3 schedule and family composition for all ten waves, including the wave-5 and wave-10 boss entries.
- The legacy `knight` unit remains only as a backward-compatible legacy type and is no longer part of the twelve-family roster or the standard wave tables.

## Event modules

The event system uses 24 reusable modules combined into the exact 16-civilization × 10-wave matrix from GDD §6.2. The matrix is now verbatim, including the fact that `LURE` is defined in §6.1 but not selected by any §6.2 cell. Events now use the §6.2 warning schedule (`t20/20/25/25/45/20/30/25/30/45`), warn eight seconds before activation, and only apply movement/targeting/zone modifiers after activation. Easy §6.1 values are exact: SMOKE reduces both sides to a 2-tile minimum, RELAY/RALLY use +10%, SAPPER uses +50%, DRAIN uses −15%, RAID limits cavalry camp-hunting to 20 seconds and 8 tiles, HUNT limits spearmen to visible cavalry within 6 tiles, and KITE retreats twice. The SCOUT module still approximates its reveal role with a speed buff because the prototype has no fog-of-war. Modules still approximate some §6.1 trigger details: they modify spawned units, targeting, movement, zones, regeneration, conversion resistance, or building damage, and extra groups move units from existing groups instead of increasing the announced host. Exact carrier/runner/barricade/formation triggers for every module remain future work.

## Localization

The current implementation has 573 keys per locale after adding the six new unit families. The v3.0 source table target remains 626 keys; the remaining source keys cannot be merged without the embedded GDD table or equivalent authoritative key list.

## Presentation checks

- `screenshots/final-desktop.png` and `screenshots/final-mobile.png` are captured from the current build with reduced motion and loaded fonts.
- On narrow screens the intel card begins 8px below the wave banner so the wave timer remains legible; toast spacing follows the intel card when it is visible.

## Source status

- GitHub issue #8 contains a verbatim excerpt of GDD sections 0–6, including the building, unit, wave, and event-matrix tables used in this pass. Issue #11 contains §§6.4 and 11.
- No source found so far contains sections 7–15 or the four-language appendix. The expected `docs/specs/Age_of_Empires_II_Riftwatch_GDD_v3.0.md` file and SHA-256 `c034bb12d0d594586334844e8f12038002de2e3e00ff9653f388fef60b18ec5c` remain unavailable.

## Protected files

The following files are intentionally unchanged:

- `README.md`
- `Agents.md`
- `start.sh`
- `capture.sh`
