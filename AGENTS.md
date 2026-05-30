# DisclosureLens2 Agent Guide

DisclosureLens2 is a Chrome extension plus local FastAPI backend for visible-signal YouTube AI-disclosure audits.

## Product positioning

- Do not claim to detect AI.
- Do not claim policy violations or legal/compliance conclusions.
- Frame output as a visible-signal review for viewer trust, sponsor risk, and platform-readiness.
- Preferred wording: "Visible signals suggest the video may benefit from clearer AI-assisted content disclosure."
- Avoid: "This video is AI-generated", "This violates YouTube policy", "This is deceptive", or legal advice language.

## Architecture

- `backend/`: FastAPI scoring/API.
- `backend/app/audit.py`: deterministic audit scoring and response text.
- `backend/tests/test_audit_api.py`: backend regression tests.
- `extension/`: MV3 Chrome extension.
- `extension/src/content/youtubeExtractor.ts`: YouTube page extraction.
- `extension/src/popup/popup.ts`: popup API call/rendering.
- `extension/dist/`: built unpacked extension loaded by Chrome.

## Core commands

From repo root:

```bash
# Backend tests
cd backend && PYTHONPATH=. pytest tests -q

# Start backend
cd backend && PYTHONPATH=. python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Extension build/typecheck
cd extension && npm run typecheck && npm run build
```

## Representative QA expectations

1. YouTube auto-dub/platform label only:
   - Expected: `2/5 Low`
   - `signalsFound` includes `platform_ai_label`
   - `recommendedAction: none`
   - `showDisclosureTemplates: false`

2. Normal non-AI meaningful context:
   - Expected: `1/5 Low`
   - no AI signals
   - no disclosure templates

3. Creator-disclosed AI use:
   - Expected: `1/5 Low`
   - includes `creator_disclosure` and may include `strong_ai_signal`
   - `recommendedAction: improve_existing_disclosure`
   - templates may be shown as improvement copy, not as missing-disclosure warning

4. Strong AI signal without clear creator disclosure:
   - Expected: `4/5 Medium` for one strong signal, `5/5 High` for multiple strong signals
   - `recommendedAction: add_disclosure`
   - `showDisclosureTemplates: true`

## Multi-agent workflow

Use Hermes as the orchestrator and verifier.

Default lane:

1. Claude Code implements or refactors.
2. Codex reviews the diff or writes additional tests.
3. Hermes runs backend tests, extension typecheck/build, and browser/manual extension QA.
4. Commit only after verification.

Do not let Claude and Codex edit the same worktree at the same time. For parallel attempts, use separate git worktrees and merge the better result manually.
