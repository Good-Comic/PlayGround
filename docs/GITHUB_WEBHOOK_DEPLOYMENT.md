# Private GitHub webhook deployment

The current Studio listens only on `127.0.0.1:8080`. This is correct for development and cannot receive GitHub webhooks. Do not bind the Studio directly to a public interface.

## Recommended topology

Use a narrowly scoped HTTPS ingress or relay that exposes only the webhook route. Terminate TLS with a managed certificate, cap request size and rate, preserve the exact request body and GitHub headers, then forward over mTLS or a private network to `/api/github/webhook`. The Studio must still perform HMAC verification; IP allowlisting is supplemental and must never replace the signature check.

Keep the Studio UI and all approval endpoints on a private network behind authenticated access. Permit outbound traffic only to `api.github.com` and the selected repository Git endpoint through an audited egress proxy. Store the App PEM and webhook secret in a host or cluster secret manager and mount/inject them only into the Studio process.

## Deployment checklist

1. Create a GitHub App manually with only Metadata read, Contents read/write, Pull requests read/write, and `push`/`pull_request` webhook subscriptions.
2. Install it on `Good-Comic/PlayGround` only and record the installation ID. Do not enter credentials into the browser.
3. Provision a random webhook secret and a read-only PEM secret mount. Configure log redaction before sending a test delivery.
4. Deploy the HTTPS relay with body/rate limits, request timeouts, TLS monitoring, and private upstream transport. Forward the raw body without parsing or re-encoding it.
5. Configure authenticated Studio access and role-separated approvals. Keep `FORGE_GITHUB_EXTERNAL_WRITES` off during receive-only validation.
6. Send GitHub's test delivery; confirm signature validation, delivery ID, repository match, and audit record. Test duplicate and altered replay behavior.
7. Exercise reconciliation after intentionally pausing the relay. Confirm conflict handling for force updates and dirty state.
8. Enable external writes only for an explicitly authorized, reviewed feature-branch push. Create a PR only after a second explicit authorization. Never automate merge from this service.
9. Monitor delivery failures, retries, installation-token errors, unexpected repository names, force events, and secret-scan blocks. Define backup and delivery-retention policies.

Cloudflare Tunnel, Tailscale Funnel, ngrok, or a cloud load balancer could implement the relay, but each creates external exposure and possibly cost. None was started or authorized during Task 03.
