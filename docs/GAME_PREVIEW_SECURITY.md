# Game preview security boundary

## Isolation model

The imported game remains read-only at `/workspace`. A live preview copies either that source or a completed Agent task workspace into `/data/previews`; Vite watches only the copy. Preview processes use bounded ports 5173–5182, are published to host loopback only, and are never a route to write the game branch.

Studio and preview do not share an origin. The iframe permits scripts and pointer lock but deliberately omits `allow-same-origin`, forms, popups, top navigation, downloads, storage access, camera, microphone, geolocation, payment, and USB. Vite permits opaque `Origin: null` only for its own ES-module assets. Forge API responses do not include CORS permission, so preview code cannot read internal APIs. The current Studio does not use session cookies; the sandbox also makes cookie access raise `SecurityError`.

The digest-pinned headless Chrome sidecar is reachable only on the Compose network. CDP is not published to the host. Each Quality run uses a new browser context, blocks service workers, uses deterministic `Math.random` for stable regression, and stores artifacts below `/data/preview-artifacts`.

## Quality gate

The runner and validation commands are owned by Forge. A model cannot provide a command or arbitrary Playwright program. The gate records browser errors, network failures, changed files, measured timing/FPS/memory, screenshots, and a rollback copy. Failure does not write back to the imported project or Git branch.

Goldens are keyed by project and adapter. Only a passing run with a screenshot may become a golden, and the API requires an explicit confirmation. No automatic golden update exists.

## Residual risks

- Preview JavaScript still executes in a real browser and Vite executes trusted project transforms inside the Studio container. Production should move each preview/validator into a disposable container with stricter egress and filesystem quotas.
- Loopback port publication is suitable for a single-user private host, not a public or multi-user service. Authenticated authorization and per-user network isolation remain required.
- CSP allows loopback preview frames across ports. A different untrusted loopback service could be framed, but it does not receive Forge credentials and the sandbox remains opaque.
- The secret scanner and browser gate cannot prove game code is benign. Do not mount host credentials, Docker socket, SSH material, or cloud metadata access into preview services.
- FPS and latency are diagnostic samples, not acceptance guarantees. Hardware, throttling, browser version, and background load materially affect them.
