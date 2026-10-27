# v2.4 archer and light-cavalry external atlases

Status: `LOCAL_VERIFIED`; application source `b9a3d527787cd2384902f259dcec9bc695aa2d42`.

This slice adds two independent repository-owned external SVG atlases. Archer frames use a foot silhouette, longbow, arrow, quiver and draw/release attack motion. Light cavalry uses an 80-pixel-wide horse body, four-leg stride, mounted rider, lance and thrust attack. They do not reuse, recolor or scale the militia art. Both use eight directions and idle/walk/attack/hit/death through the existing descriptor pipeline and retain procedural Canvas fallback. Gameplay radius, navigation, speed, cadence, damage, economy, RNG and balance are unchanged.

Focused regression: 15/15 PASS. The exact 33-file artifact passed 7/7 real Chromium checks: all three independent assets loaded; archer and cavalry each produced eight distinct direction frames; militia, archer and cavalry entered live combat together; archer/cavalry hit and distinct non-reviving death frames rendered; both fallback paths returned to Canvas; browser errors were zero. Evidence follows the real Start flow and a labelled controlled combat fixture. It is AFTER_LOCAL, not natural-campaign or public-deployment acceptance.
