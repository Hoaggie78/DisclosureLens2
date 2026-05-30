# DisclosureLens MVP Manual QA Matrix

Use this checklist when dogfooding the unpacked Chrome extension against the local FastAPI backend.

## Setup

1. Start the backend from the repo root:

   ```bash
   PYTHONPATH=backend .venv/Scripts/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

2. Confirm health:

   ```bash
   curl http://127.0.0.1:8000/health
   ```

   Expected: `{"status":"ok"}`

3. Build the extension:

   ```bash
   cd extension
   npm run build
   ```

4. In Chrome, load or reload unpacked extension from:

   ```text
   C:\Users\kaleb\DisclosureLens2\extension\dist
   ```

5. Confirm the popup header shows `DisclosureLens v0.1.1`.

## Test cases

### Case 1: YouTube video with clear AI signal

- URL:
- Expected score: Medium/high, depending on evidence strength
- Expected recommended action: `add_disclosure` unless a visible disclosure is already captured
- Expected signals: `strong_ai_signal` or relevant visible AI signal
- Expected templates shown: yes, unless existing disclosure is detected
- Actual result:
- Pass/fail:
- Notes:

### Case 2: YouTube video with no visible AI signal

- URL:
- Expected score: Low
- Expected recommended action: `none`
- Expected signals: none
- Expected templates shown: no
- Actual result:
- Pass/fail:
- Notes:

### Case 3: YouTube Short with clear AI signal

- URL:
- Expected score: Medium/high, depending on evidence strength
- Expected recommended action: `add_disclosure` unless a visible disclosure is already captured
- Expected signals: `strong_ai_signal` or relevant visible AI signal
- Expected templates shown: yes, unless existing disclosure is detected
- Actual result:
- Pass/fail:
- Notes:

### Case 4: YouTube Short with no visible AI signal

- URL:
- Expected score: Low
- Expected recommended action: `none`
- Expected signals: none
- Expected templates shown: no
- Actual result:
- Pass/fail:
- Notes:

### Case 5: Visible AI disclosure already present

- URL:
- Expected score: Low/lower than same content without disclosure
- Expected recommended action: `none` or disclosure refinement only
- Expected signals: AI signal plus visible disclosure evidence
- Expected templates shown: no for `recommendedAction: none`
- Actual result:
- Pass/fail:
- Notes:

### Case 6: Platform-generated AI label / auto-dub edge case

- URL:
- Expected score: Should not treat platform-only label as creator-authored disclosure
- Expected recommended action: depends on other visible creator evidence
- Expected signals: platform label signal if captured
- Expected templates shown: yes only when `recommendedAction` requires a disclosure
- Actual result:
- Pass/fail:
- Notes:

## Troubleshooting

### Popup says backend is not running

Start the backend and confirm `curl http://127.0.0.1:8000/health` returns `{"status":"ok"}`.

### Popup says to open a YouTube video or Short

Confirm the active tab is one of:

- `https://www.youtube.com/watch?...`
- `https://youtube.com/watch?...`
- `https://m.youtube.com/watch?...`
- `https://www.youtube.com/shorts/...`
- `https://youtube.com/shorts/...`
- `https://m.youtube.com/shorts/...`

### Popup says it could not read the page yet

Reload the YouTube tab, wait for page content to appear, then run the audit again. The extension now retries by injecting the extractor when Chrome has not attached the content script.

### Popup does not show v0.1.1

Chrome is loading the wrong or stale unpacked extension. Remove DisclosureLens from `chrome://extensions`, then load unpacked from `C:\Users\kaleb\DisclosureLens2\extension\dist`.

## Pass criteria for MVP dogfood

- At least one normal video and one Short audit successfully.
- At least one no-signal case returns Low risk and hides templates.
- At least one clear-AI-signal case recommends a disclosure and shows templates.
- Error states are readable and actionable.
- No raw Chrome extension errors are shown for common setup problems.
