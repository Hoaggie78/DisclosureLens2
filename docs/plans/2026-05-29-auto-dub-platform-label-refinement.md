# Auto-Dub / Platform Label Scoring Refinement Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Finish the DisclosureLens refinement so YouTube auto-dub / platform-generated labels alone do not produce a 4/5 disclosure-risk recommendation or broad AI-production implication.

**Architecture:** Keep scoring in the FastAPI backend deterministic and evidence-based. Add structured audit response fields that let the popup explain what was reviewed, what signals were found, and whether copy/paste disclosure templates are actually recommended. The extension should render low/none outcomes differently from add-disclosure outcomes.

**Tech Stack:** Python 3.11, FastAPI, Pydantic, pytest, TypeScript, Vite Chrome extension.

---

## Current State Discovered Before Handoff

Repo: `C:\Users\kaleb\DisclosureLens2`

There are already uncommitted changes in these files:

- `backend/app/audit.py`
- `backend/app/models.py`
- `backend/tests/test_audit_api.py`
- `extension/src/shared/types.ts`
- `extension/src/popup/popup.html`
- `extension/src/popup/popup.ts`
- `extension/src/popup/popup.css`
- generated `extension/dist/*` from `npm run build`
- untracked `HANDOFF.md`

Verification already run from this controller session:

```bash
cd C:/Users/kaleb/DisclosureLens2/backend
PYTHONPATH=. pytest tests -q
# Result: 8 passed in 0.64s

cd C:/Users/kaleb/DisclosureLens2/extension
npm run build
# Result: vite build succeeded
```

Why this work is needed:

- The screenshot/logged audit showed a `4/5 Medium` result because the captured YouTube page text included:
  - `How this was made`
  - `Auto-dubbed`
  - `Audio tracks for some languages were automatically generated`
- The intended product behavior is: platform labels like auto-dubbed/generated language tracks are useful context, but **alone** they should not imply the main video is AI-generated or recommend a creator disclosure template.

Target behavior:

- Platform auto-dub/generated-language label alone:
  - `riskScore: 2`
  - `riskLabel: Low`
  - `signalsFound: ["platform_ai_label"]`
  - `recommendedAction: "none"`
  - `showDisclosureTemplates: false`
  - finding/quickest fix explicitly says no disclosure fix is recommended from platform label alone
- Strong creator/content AI signals without creator disclosure remain higher risk:
  - multiple strong signals => `5/5 High`, `recommendedAction: "add_disclosure"`
  - a single strong signal => `4/5 Medium`, `recommendedAction: "add_disclosure"`
- Creator-written disclosure should lower risk and still expose improvement templates.
- Plain meaningful non-AI context should be `1/5 Low`, no templates.
- Thin context should be `3/5 Medium`, `recommendedAction: "rerun_with_more_context"`, no templates.

---

## Task 1: Confirm Current Diff and Preserve Intended Scope

**Objective:** Review uncommitted changes and make sure only the intended scoring/UI refinement is included.

**Files:**

- Read: `backend/app/audit.py`
- Read: `backend/app/models.py`
- Read: `backend/tests/test_audit_api.py`
- Read: `extension/src/shared/types.ts`
- Read: `extension/src/popup/popup.html`
- Read: `extension/src/popup/popup.ts`
- Read: `extension/src/popup/popup.css`

**Step 1: Inspect status and diff**

Run:

```bash
cd C:/Users/kaleb/DisclosureLens2
git status --short
git diff --stat
git diff -- backend/app/audit.py backend/app/models.py backend/tests/test_audit_api.py extension/src/shared/types.ts extension/src/popup/popup.html extension/src/popup/popup.ts extension/src/popup/popup.css
```

Expected:

- Only intended backend model/scoring/test changes and popup rendering changes are present.
- Do not include unrelated environment/cache files.
- Do not push anything.

**Step 2: Identify any wording mismatch**

Check whether popup fallback text says “no visible AI-use signals” when the case is actually “platform label found but no disclosure template recommended.” If so, polish the copy in Task 4.

---

## Task 2: Finish Backend Scoring Semantics

**Objective:** Ensure backend scoring cleanly separates creator disclosure, platform AI labels, and strong AI-content signals.

**Files:**

- Modify: `backend/app/audit.py`
- Modify: `backend/app/models.py`
- Test: `backend/tests/test_audit_api.py`

**Required backend behavior:**

1. `PLATFORM_AI_LABEL_MARKERS` should include at least:
   - `ai-generated video summary`
   - `auto-dubbed`
   - `automatically generated`
   - `quality and accuracy may vary`
2. `STRONG_AI_SIGNAL_MARKERS` should include creator/content signals such as:
   - `ai voice`
   - `synthetic voice`
   - `voice clone`
   - `ai-generated`
   - `generated visuals`
   - `synthetic media`
   - `deepfake`
3. Creator disclosure detection should only use creator-controlled text:
   - `description`
   - `pinnedComment`
4. Platform labels must not count as creator disclosure.
5. Platform labels alone should return:

```python
risk_score = 2
biggest_finding = PLATFORM_LABEL_FINDING
recommended_action = "none"
show_disclosure_templates = False
```

6. The platform-label finding must explicitly say:
   - platform labels are context
   - they are not evidence the main video itself is AI-generated
   - they are not creator-written disclosure
   - no disclosure fix is recommended from this signal alone

**Step 1: Add/confirm response model fields**

In `backend/app/models.py`, confirm `VideoAuditResponse` includes:

```python
recommendedAction: RecommendedAction
showDisclosureTemplates: bool
signalsFound: list[str]
evidenceReviewed: list[str]
contextQuality: ContextQuality
```

**Step 2: Add/confirm scoring helpers**

In `backend/app/audit.py`, confirm helper functions exist and are used:

```python
_combined_text(payload)
_creator_disclosure_text(payload)
_count_markers(text, markers)
_has_meaningful_context(payload)
_score_payload(payload)
_signals_found(payload)
_evidence_reviewed(payload)
_recommended_action(biggest_finding, risk_score)
_context_quality(payload)
```

**Step 3: Verify platform-label branch comes before single strong-signal branch**

The expected order inside `_score_payload` is:

```python
if has_creator_disclosure:
    ...
if strong_signal_count >= 3:
    return 5, HIGH_RISK_FINDING
if strong_signal_count >= 2:
    return 5, HIGH_RISK_FINDING
if platform_label_count:
    return 2, PLATFORM_LABEL_FINDING
if strong_signal_count == 1:
    return 4, MEDIUM_RISK_FINDING
if _has_meaningful_context(payload):
    return 1, NO_AI_SIGNAL_FINDING
return 3, INSUFFICIENT_CONTEXT_FINDING
```

Note: This means a phrase like “automatically generated” currently wins as platform context even if it is also a weak AI phrase. Keep this behavior for now because it matches the screenshot issue.

---

## Task 3: Finish Backend Test Coverage

**Objective:** Lock the auto-dub regression and neighboring scoring cases with pytest.

**Files:**

- Modify: `backend/tests/test_audit_api.py`

**Required tests:**

1. `test_audit_video_treats_youtube_auto_dub_label_as_low_risk_platform_context`
   - Payload should use the real-ish title:
     `Mermaids, Water Spirits & Seduction… What They Really Want`
   - Description should include:
     `How this was made Auto-dubbed Audio tracks for some languages were automatically generated.`
   - Expected:

```python
assert data["riskScore"] == 2
assert data["riskLabel"] == "Low"
assert "platform-generated AI labels" in data["biggestFinding"]
assert "main video itself is AI-generated" in data["biggestFinding"]
assert data["recommendedAction"] == "none"
assert data["showDisclosureTemplates"] is False
assert "platform_ai_label" in data["signalsFound"]
assert "strong_ai_signal" not in data["signalsFound"]
```

2. Existing/neighboring tests should verify:
   - explicit disclosure => low risk with `creator_disclosure`
   - strong undisclosed AI signals => `5/5 High`, add disclosure
   - plain meaningful interview/page context => `1/5 Low`, no action/templates
   - missing optional fields/thin context => rerun with more context
   - log redaction still records response and screenshot byte count

**Step 1: Run backend tests from backend directory**

Run:

```bash
cd C:/Users/kaleb/DisclosureLens2/backend
PYTHONPATH=. pytest tests -q
```

Expected:

```text
8 passed
```

If `ModuleNotFoundError: No module named 'app'` appears, rerun exactly with `PYTHONPATH=.` from `backend/`.

---

## Task 4: Finish Popup UI Semantics

**Objective:** Ensure the extension accurately explains low/no-action outcomes, including platform label alone.

**Files:**

- Modify: `extension/src/shared/types.ts`
- Modify: `extension/src/popup/popup.html`
- Modify: `extension/src/popup/popup.ts`
- Modify: `extension/src/popup/popup.css`

**Required UI behavior:**

1. `VideoAuditResponse` TypeScript type includes:

```ts
recommendedAction: 'none' | 'rerun_with_more_context' | 'improve_existing_disclosure' | 'add_disclosure';
showDisclosureTemplates: boolean;
signalsFound: string[];
evidenceReviewed: string[];
contextQuality: 'thin' | 'meaningful';
```

2. Popup displays evidence reviewed and signals found.
3. Popup hides copy/paste disclosure templates when `showDisclosureTemplates` is false.
4. Popup clears hidden textareas when templates are hidden.
5. Popup status for `recommendedAction === 'none'` should be:

```text
Audit complete. No disclosure template is recommended from current evidence.
```

6. The no-template notice should not falsely say there were no visible AI-use signals if `signalsFound` includes `platform_ai_label`. Prefer this copy:

```html
No disclosure template is recommended for this audit based on the current evidence. Review the finding above for whether platform labels or other context were detected.
```

**Step 1: Patch notice text if needed**

In `extension/src/popup/popup.html`, replace the existing notice text if it says:

```text
No AI disclosure template is recommended for this audit because no visible AI-use signals were found.
```

with:

```text
No disclosure template is recommended for this audit based on the current evidence. Review the finding above for whether platform labels or other context were detected.
```

**Step 2: Build extension**

Run:

```bash
cd C:/Users/kaleb/DisclosureLens2/extension
npm run build
```

Expected:

```text
✓ built
```

This updates `extension/dist/*` so the unpacked extension can be reloaded with the latest popup behavior.

---

## Task 5: Manual Smoke Test / Local API Probe

**Objective:** Verify the exact screenshot scenario now produces the intended backend payload and popup-ready fields.

**Files:**

- No required source edits unless this fails.

**Step 1: Use TestClient or curl-equivalent Python probe**

Run from `backend/`:

```bash
cd C:/Users/kaleb/DisclosureLens2/backend
PYTHONPATH=. python - <<'PY'
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
payload = {
    "url": "https://www.youtube.com/watch?v=symK56rhKeU&t=775s",
    "title": "Mermaids, Water Spirits & Seduction… What They Really Want",
    "channelName": "podcast",
    "description": "What if the marine kingdom is more than mythology? TAKE THE NEXT STEP. How this was made Auto-dubbed Audio tracks for some languages were automatically generated. Learn more. Chapters include Assaulted by a Mermaid and The Sirens of the Deep.",
    "thumbnailUrl": None,
    "pinnedComment": None,
    "transcript": None,
    "screenshotBase64": "data:image/png;base64,iVBORw0KGgo=",
}
response = client.post("/audit/video", json=payload)
print(response.status_code)
data = response.json()
for key in ["riskScore", "riskLabel", "recommendedAction", "showDisclosureTemplates", "signalsFound", "evidenceReviewed", "contextQuality", "biggestFinding", "quickestFix"]:
    print(f"{key}: {data[key]}")
PY
```

Expected key outputs:

```text
200
riskScore: 2
riskLabel: Low
recommendedAction: none
showDisclosureTemplates: False
signalsFound: ['platform_ai_label']
contextQuality: meaningful
```

---

## Task 6: Final Verification and Handoff

**Objective:** Leave the repo in a clean, understandable state for the user.

**Step 1: Run final checks**

Run:

```bash
cd C:/Users/kaleb/DisclosureLens2/backend
PYTHONPATH=. pytest tests -q

cd C:/Users/kaleb/DisclosureLens2/extension
npm run build

cd C:/Users/kaleb/DisclosureLens2
git diff --stat
git status --short
```

**Step 2: Decide commit behavior**

If all checks pass, create one local commit for the completed refinement unless there is an obvious reason not to commit. Do not push.

Suggested commit:

```bash
cd C:/Users/kaleb/DisclosureLens2
git add backend/app/audit.py backend/app/models.py backend/tests/test_audit_api.py extension/src/shared/types.ts extension/src/popup/popup.html extension/src/popup/popup.ts extension/src/popup/popup.css extension/dist
git commit -m "fix: treat platform auto-dub labels as low-risk context"
```

If `HANDOFF.md` is unrelated, leave it uncommitted and mention that in the final report. If it is a useful user-facing handoff that should be part of this change, inspect it first and only add it if it is relevant.

**Step 3: Final response requirements**

Report back with:

- Files changed
- Tests/build commands run and results
- Whether a local commit was created, and commit hash if yes
- Whether `HANDOFF.md` remains untracked or was included
- Exact current behavior for the Mermaids/auto-dub scenario

---

## Acceptance Criteria

- Backend tests pass with `PYTHONPATH=. pytest tests -q` from `backend/`.
- Extension builds with `npm run build` from `extension/`.
- The Mermaids/auto-dub scenario returns `2/5 Low`, `recommendedAction: none`, `showDisclosureTemplates: false`, `signalsFound: ["platform_ai_label"]`.
- Popup does not show copy/paste disclosure templates when `showDisclosureTemplates` is false.
- Popup no-template notice does not incorrectly claim there were no AI-use signals when the signal is a platform label.
- No changes are pushed remotely.
