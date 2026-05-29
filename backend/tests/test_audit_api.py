import json

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def sample_payload(**overrides):
    payload = {
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "title": "AI Documentary: The Future of Cities",
        "channelName": "Future Stories Lab",
        "description": "A cinematic documentary created with AI-assisted visuals and narration.",
        "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        "pinnedComment": None,
        "transcript": None,
        "screenshotBase64": "data:image/png;base64,iVBORw0KGgo=",
    }
    payload.update(overrides)
    return payload


def test_audit_video_returns_positioned_mock_report():
    response = client.post("/audit/video", json=sample_payload())

    assert response.status_code == 200
    data = response.json()

    assert data["riskScore"] in [1, 2, 3, 4, 5]
    assert data["riskLabel"] in ["Low", "Medium", "High"]
    assert "Visible signals suggest" in data["biggestFinding"]
    assert "may benefit" in data["quickestFix"]
    assert "AI-assisted" in data["descriptionDisclosure"]
    assert "AI-assisted" in data["pinnedCommentDisclosure"]
    assert "not an AI detection" in data["platformReadinessNote"]
    assert "## DisclosureLens Video Audit" in data["markdown"]
    assert "This video is AI-generated" not in data["markdown"]
    assert "violates" not in data["markdown"].lower()


def test_audit_video_rejects_non_youtube_url():
    response = client.post("/audit/video", json=sample_payload(url="https://example.com/video"))

    assert response.status_code == 422
    assert "YouTube" in response.text


def test_audit_video_handles_missing_optional_fields():
    response = client.post(
        "/audit/video",
        json=sample_payload(
            description=None,
            thumbnailUrl=None,
            pinnedComment=None,
            transcript=None,
            screenshotBase64=None,
        ),
    )

    assert response.status_code == 200
    data = response.json()
    assert data["riskLabel"] == "Medium"
    assert "Add a short disclosure" in data["quickestFix"]


def test_audit_video_writes_redacted_capture_log(tmp_path, monkeypatch):
    monkeypatch.setenv("DISCLOSURELENS_LOG_DIR", str(tmp_path))

    response = client.post("/audit/video", json=sample_payload())

    assert response.status_code == 200
    log_file = tmp_path / "audit_requests.jsonl"
    assert log_file.exists()
    line = log_file.read_text(encoding="utf-8").strip()

    assert "Future Stories Lab" in line
    assert "screenshotBase64" not in line
    assert "screenshotBytes" in line
    assert "response" in line

    record = json.loads(line)
    assert record["request"]["screenshotBytes"] > 0
    assert record["response"]["riskLabel"] in ["Low", "Medium", "High"]
    assert record["response"]["markdown"].startswith("## DisclosureLens Video Audit")
