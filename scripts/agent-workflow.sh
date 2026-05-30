#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-review}"

cd "$ROOT"

case "$MODE" in
  status)
    echo "== Agent CLI status =="
    command -v claude >/dev/null 2>&1 && claude --version || echo "claude missing"
    command -v codex >/dev/null 2>&1 && codex --version || echo "codex missing"
    if command -v claude >/dev/null 2>&1; then
      claude auth status --text 2>/dev/null || true
    fi
    if command -v codex >/dev/null 2>&1; then
      codex doctor 2>/dev/null | sed -n '1,80p' || true
    fi
    ;;
  review)
    if ! command -v codex >/dev/null 2>&1; then
      echo "codex is not installed/on PATH" >&2
      exit 1
    fi
    if git diff --quiet; then
      echo "No unstaged diff to review."
      exit 0
    fi
    git diff | codex exec "Review this DisclosureLens diff for correctness, regressions, missing tests, and product-positioning issues. Do not edit files; return actionable findings only."
    ;;
  claude-review)
    if ! command -v claude >/dev/null 2>&1; then
      echo "claude is not installed/on PATH" >&2
      exit 1
    fi
    if git diff --quiet; then
      echo "No unstaged diff to review."
      exit 0
    fi
    git diff | claude -p "Review this DisclosureLens diff. Focus on bugs, regression risk, UX copy, and missing tests." --allowedTools "Read" --max-turns 3
    ;;
  *)
    echo "Usage: $0 [status|review|claude-review]" >&2
    exit 2
    ;;
esac
