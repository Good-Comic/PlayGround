#!/bin/sh
set -eu

case "${1:-}" in
  check)
    docker version >/dev/null
    docker compose version >/dev/null
    docker compose config --quiet
    ;;
  start)
    : "${FORGE_ADMIN_PASSWORD_HASH:?Set a PBKDF2 hash; see docs/PRIVATE_HOST_DEPLOYMENT.md}"
    docker compose up -d --build forge-studio preview-browser
    ;;
  stop)
    docker compose stop forge-studio preview-browser
    ;;
  health)
    curl -fsS http://127.0.0.1:8080/health
    ;;
  *)
    echo "usage: $0 check|start|stop|health" >&2
    exit 2
    ;;
esac
