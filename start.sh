#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# 1. Build playtest artifact if missing
if [ ! -f "dist/build-metadata.json" ] || [ ! -f "dist/index.html" ]; then
  python3 tools/qa/build_playtest.py --repo . --commit "$(git rev-parse HEAD)" --out dist
fi

# 2. Output deployment declaration for OmGitHub
if [ -n "${OPENCODE_WEB_DIR:-}" ]; then
  cat <<EOF > "${OPENCODE_WEB_DIR}/deployment-output.json"
{
  "project": "$(pwd -P)",
  "directory": "$(pwd -P)/dist"
}
EOF
fi

# 3. Serve verified artifact on PORT (default 3000)
PORT="${PORT:-3000}"
exec node -e "
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';

const root = resolve('dist');
const port = Number(process.env.PORT || 3000);
const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.md': 'text/plain'
};

const server = createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/__omgithub/live') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
        'Connection': 'keep-alive'
      });
      res.write(': connected\n\n');
      return;
    }
    let filePath = resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    if (statSync(filePath).isDirectory()) {
      filePath = join(filePath, 'index.html');
    }
    const ext = extname(filePath);
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.writeHead(200);
    res.end(readFileSync(filePath));
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log('Serving verified artifact on http://0.0.0.0:' + port);
});
"

