# Download and play locally

This is a source-pinned PLAYTEST-EXPERIMENTAL static package, not an online deployment. Download artifacts/Riftwatch-Playtest-d6ee34a.zip,extract into a fresh folder,and run `python -m http.server 8080 --directory EXTRACTED_FOLDER`. Open http://127.0.0.1:8080/ in Chrome/Edge. Do not open index.html via file:// because ES modules/fetch require HTTP. No Node build or account login is required. Existing legacy saves/settings are not imported. Close only your own server to stop.

Build source: d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c. The version dialog checks28payload hashes and exposes download-only Bug JSON. Known issues are included. Source branch may contain later evidence-only commits; always use the artifact manifest source SHA for playtest reports. Public hosting still needs the precise operation in APPROVAL-PLAN.json.
