# DisclosureLens Backend

FastAPI backend for DisclosureLens audits.

## Endpoint

`POST /audit/video`

Request body:

```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "title": "Video title",
  "channelName": "Channel name",
  "description": "Description text or null",
  "thumbnailUrl": "https://... or null",
  "pinnedComment": "Pinned comment or null",
  "transcript": null,
  "screenshotBase64": "data:image/png;base64,... or null"
}
```

Response includes risk score/label, biggest finding, quickest fix, paste-ready disclosures, sponsor/platform notes, and Markdown.

## Development

```bash
PYTHONPATH=backend .venv/Scripts/python -m pytest backend/tests -q
PYTHONPATH=backend .venv/Scripts/python -m uvicorn app.main:app --reload --app-dir backend
```
