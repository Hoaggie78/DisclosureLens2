# DisclosureLens2

DisclosureLens is a Chrome/Chromium extension plus local backend for auditing visible AI disclosure, viewer-trust, sponsor-risk, and platform-readiness signals on YouTube videos.

## Positioning

DisclosureLens does **not** claim to detect AI, decide policy violations, or provide legal/compliance advice. It reviews visible page signals and generates practical copy/paste improvements for AI-powered creators and agencies.

Preferred wording:

> Visible signals suggest the video may benefit from clearer AI-assisted content disclosure. Add a short disclosure in the first two lines of the description and as a pinned comment.

Avoid wording like:

- "This video is AI-generated."
- "This violates YouTube policy."
- "This is deceptive."
- "This is legal/compliance advice."

## MVP: Audit Current YouTube Video or Short

1. User opens a supported YouTube route in Chrome:
   - `youtube.com/watch?...`
   - `youtube.com/shorts/...`
   - `m.youtube.com/watch?...`
   - `m.youtube.com/shorts/...`
2. Extension extracts current-tab page data:
   - URL
   - title
   - channel name
   - description if available
   - thumbnail URL if available
   - pinned comment if visible
   - screenshot of visible tab
3. Extension sends the payload to `POST /audit/video` on `localhost:8000`.
4. Backend returns a deterministic visible-signal audit report with copy/paste fixes only when a disclosure action is recommended.

Manual QA checklist: [`docs/qa/mvp-manual-qa.md`](docs/qa/mvp-manual-qa.md)

## Run backend locally

```bash
cd C:/Users/kaleb/DisclosureLens2
python -m venv .venv
.venv/Scripts/python -m pip install -r backend/requirements.txt
PYTHONPATH=backend .venv/Scripts/python -m uvicorn app.main:app --reload --app-dir backend
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Run tests:

```bash
PYTHONPATH=backend .venv/Scripts/python -m pytest backend/tests -q
```

## Build extension

```bash
cd C:/Users/kaleb/DisclosureLens2/extension
npm install
npm run build
```

Then load `extension/dist` as an unpacked extension in Chrome/Chromium.

## Current status

- FastAPI backend scaffold exists.
- `POST /audit/video` returns deterministic visible-signal audit output.
- MV3 extension scaffold exists with popup, content script, service worker, screenshot capture, Shorts support, missing-content-script recovery, and localhost API call.
- The popup maps common setup/runtime failures to friendly troubleshooting copy.
- LLM/vision integration is intentionally not implemented yet.
