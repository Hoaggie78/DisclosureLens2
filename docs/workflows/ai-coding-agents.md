# AI coding-agent workflow

This project can use Claude Code and Codex together, with Hermes coordinating and verifying.

## Roles

- **Hermes**: orchestrates work, runs browser/API verification, manages Telegram reporting, and decides when work is ready.
- **Claude Code CLI**: primary implementation/refactor agent for larger product/code changes.
- **Codex CLI / Codex Spark lane**: secondary review/test agent for focused patches, regression coverage, and diff critique.

## Current local tool status

- Claude Code is installed and authenticated with a Claude Pro account.
- Codex CLI is installed as `codex-cli 0.135.0`.
- Codex still needs authentication before model-backed tasks can run. Use `codex login` or configure a supported OpenAI auth environment variable.

## Default workflow: Claude implements, Codex reviews, Hermes verifies

1. Start from a clean or intentionally scoped git diff.
2. Ask Claude Code to implement the plan:

```bash
claude -p "Implement the task described in docs/plans/<plan-file>. Keep changes minimal. Add/update tests. Do not push." \
  --allowedTools "Read,Edit,Write,Bash" \
  --max-turns 15
```

3. Ask Codex to review the diff without editing:

```bash
git diff | codex review --stdin
```

Alternative if `codex review --stdin` is unavailable in a future version:

```bash
git diff | codex exec "Review this DisclosureLens diff for correctness, regressions, missing tests, and product-positioning issues. Do not edit files; return actionable findings only."
```

4. Hermes runs verification:

```bash
./scripts/verify-local.sh
```

5. Hermes or the user performs real Chrome-extension QA for representative YouTube pages.
6. Commit only after tests/build and representative QA pass.

## Codex implements, Claude reviews

Use this for small focused patches or test additions:

```bash
codex exec --sandbox workspace-write --ephemeral \
  "Add targeted regression tests for the current DisclosureLens issue. Keep production behavior unchanged unless required."
```

Then review with Claude:

```bash
git diff | claude -p "Review this DisclosureLens diff. Focus on bugs, regression risk, UX copy, and missing tests." \
  --allowedTools "Read" \
  --max-turns 3
```

## Parallel attempts with worktrees

Use this for tricky changes where two independent solutions are useful:

```bash
git worktree add ../DisclosureLens2-claude -b claude/<task-name> main
git worktree add ../DisclosureLens2-codex -b codex/<task-name> main
```

Run Claude in the Claude worktree and Codex in the Codex worktree. Hermes compares both diffs and ports the best result back to the main repo.

## Safety rules

- Do not run Claude and Codex as editors in the same worktree at the same time.
- Prefer Codex review mode before Codex edit mode until auth and behavior are proven stable.
- Keep secrets out of prompts and diffs.
- Never allow either agent to push or force-reset without explicit approval.
- For browser-extension behavior, API tests are not enough: verify the actual Chrome popup/page extraction path when possible.
