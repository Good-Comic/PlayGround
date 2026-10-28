# Stable worker commands during unrelated hero cooldowns

Old source 5f63a939f64f3d3d40c66abfd4af655732dae7b0; fixed logic dc48b7c8ebc010822fbd7ad14910a9ab00acea73; verified final artifact 815557d007a50fcb47e4c35af2b33f1237c8743b. AFTER_LOCAL, not a live public test.

Natural policyV2 aborted at wave4: 1.2s Playwright timeout while build:range detached during cooldown-driven command-grid reconstruction. Zero game Console/Page errors. Preserved separately as harness-incomplete; neither natural defeat nor victory is claimed.

Independent real native Start/worker selection/E skill/focus/dwell test reproduced the unnecessary worker button replacement: after3.2s cooldown dropped59.85→56.63 and the original node/focus was lost. Fixed source: cooldown59.67→56.33, same worker button and keyboard focus retained; actual house-command click succeeded. Code now scopes hero cooldown signature fields to a selected player hero; hero countdown and worker build-page invalidation remain. 19/19 directed command/hero/training/rally tests pass. Original unrelated local HTTP server expired during a first probe; that transport failure retained, restarted a logged loopback server without changing network policy.

See before/after browser.json, actual recordings and after/worker-build.png. This fixes a deterministic UI invalidation cause; it does not prove every input timeout or all natural-campaign failures are solved.
