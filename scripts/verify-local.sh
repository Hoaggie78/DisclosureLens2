#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== DisclosureLens local verification =="
echo "repo: $ROOT"

if command -v claude >/dev/null 2>&1; then
  echo "claude: $(claude --version 2>/dev/null || echo installed)"
else
  echo "claude: missing"
fi

if command -v codex >/dev/null 2>&1; then
  echo "codex: $(codex --version 2>/dev/null || echo installed)"
else
  echo "codex: missing"
fi

echo "== Backend tests =="
(
  cd "$ROOT/backend"
  PYTHONPATH=. pytest tests -q
)

echo "== Extension typecheck/build =="
(
  cd "$ROOT/extension"
  npm run typecheck
  npm run build
)

echo "== Git status =="
(
  cd "$ROOT"
  git status --short
)

echo "== Verification complete =="
