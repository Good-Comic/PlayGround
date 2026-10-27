# Standard opening render risk sample

Exact before 51e56d936ec8af9683916f03c54c6343afa43d67 vs materials d07e4f1634d730a163f607800d1ed9a305ebedef (same renderer as 9fc6db6). Chromium154 Linux cloud, 1600x900, native TEU/steppe/PERF-STANDARD start; 13 live units and six buildings, normal running simulation. No state injection. Two-second warm-up and eight-second sample, three serial runs per source. Hardware testing remains HARDWARE_TEST_PENDING.

|Source/run|Mean draw interval ms|P95 interval ms|Mean drawing JS ms|Original interval gate|
|---|---:|---:|---:|---|
|Before1|24.00|50.90|10.73|FAIL|
|Before2|22.43|39.50|8.75|PASS|
|Before3|31.38|52.20|13.63|FAIL|
|Materials1|22.56|40.40|8.66|PASS|
|Materials2|22.73|40.00|9.18|PASS|
|Materials3|22.89|45.00|9.11|PASS|

Raw timing samples in six JSON files, harness tools/qa/standard_render_probe.mjs. Draw-start intervals include scheduling and other work; draw JS is CPU time inside renderer.draw, not GPU time, actual GPU profiling, or the full JS frame workload. These short noisy samples show no blocking opening regression; they do not establish a causal speedup, sustained campaign performance, or physical-PC FPS.

The original 100-unit/24-building +21.4% drawing JS regression and absolute frame FAIL remain unchanged in the landmark report. The rejected material-cache experiment remains rejected. Standard-opening result is a narrower separate sample, not a replacement baseline.
