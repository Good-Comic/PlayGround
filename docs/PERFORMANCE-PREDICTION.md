# Cross-hardware research

BENCHMARK_REFERENCE: official Speedometer,JetStream,MotionMark snapshots pinned in evidence/strategy-v222/benchmark-sources/sources.json. Score/hardware fields intentionally null: INSUFFICIENT_DATA. No comparable CPU/GPU/Canvas score pairs exist yet; no real-game FPS predicted.

Level1 may compare only same-suite/version/browser/workload units and reports relative capacity, never certified FPS. Level2 requires exclusive JS critical path, measured render/raster critical path, scheduling/GC/VSync and workload-matched scale ranges; use max of overlapping paths rather than adding nested/parallel spans. Software→physical-GPU extrapolation is not calibrated. Level3 needs actual hardware training and held-out scale/browser samples with errors/domain reported. Model prototypes/calibration remain NOT_TESTED; public research here is suite provenance, not a hardware benchmark result.
